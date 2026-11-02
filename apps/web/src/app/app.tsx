import { useState, useEffect, useRef, useCallback } from 'react';
import {
  AUTH_CHANGED_EVENT,
  Drawnix,
  DrawnixLayoutState,
  DrawnixSaveState,
  DrawnixToolState,
  fetchCurrentUser,
} from '@drawme/drawnix';
import { PlaitElement, PlaitTheme, Viewport } from '@plait/core';
import localforage from 'localforage';
import { MAIN_BOARD_TITLE, fetchBoard, saveBoard, type BoardSnapshot } from './board-api';

type AppValue = {
  children: PlaitElement[];
  viewport?: Viewport;
  theme?: PlaitTheme;
};

type Language = 'zh' | 'en' | 'ru' | 'ar' | 'vi';

type MainBoardPreference = {
  language: Language;
  copyTransparent: boolean;
  exportTransparent: boolean;
  layout?: Partial<DrawnixLayoutState>;
};

const MAIN_BOARD_CONTENT_KEY = 'main_board_content';
const MAIN_BOARD_TOOL_STATE_KEY = 'main_board_tool_state';
const MAIN_BOARD_PREFERENCE_KEY = 'main_board_preference';
const CLOUD_SAVE_DELAY_MS = 800;

function serializeAppValue(value: AppValue): string {
  return JSON.stringify(value);
}

function toAppValue(content: {
  children?: unknown;
  viewport?: unknown;
  theme?: unknown;
}): AppValue {
  return {
    children: Array.isArray(content.children) ? (content.children as PlaitElement[]) : [],
    viewport: content.viewport as Viewport | undefined,
    theme: content.theme as PlaitTheme | undefined,
  };
}

localforage.config({
  name: 'Drawnix',
  storeName: 'drawnix_store',
  driver: [localforage.INDEXEDDB, localforage.LOCALSTORAGE],
});

export function App() {
  const [value, setValue] = useState<AppValue>({ children: [] });
  const [initialToolState, setInitialToolState] = useState<Partial<DrawnixToolState>>();
  const [preference, setPreference] = useState<MainBoardPreference>({
    language: 'zh',
    copyTransparent: false,
    exportTransparent: false,
  });
  const [loaded, setLoaded] = useState(false);
  const [saveState, setSaveState] = useState<DrawnixSaveState>('local');

  const [tutorial, setTutorial] = useState(false);

  const valueRef = useRef<AppValue>({ children: [] });
  const signedInRef = useRef(false);
  const saveTimerRef = useRef<number | null>(null);
  const pendingValueRef = useRef<AppValue | null>(null);
  const boardQueueRef = useRef<Promise<unknown>>(Promise.resolve());
  const lastSyncedJsonRef = useRef<string | null>(null);
  const hydratedRef = useRef(false);

  const clearSaveTimer = useCallback(() => {
    if (saveTimerRef.current !== null) {
      window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
  }, []);

  const applyBoardSnapshot = useCallback((board: BoardSnapshot) => {
    const nextValue = toAppValue(board.content);
    valueRef.current = nextValue;
    pendingValueRef.current = null;
    lastSyncedJsonRef.current = serializeAppValue(nextValue);
    setValue(nextValue);
    setTutorial(nextValue.children.length === 0);
    void localforage.setItem(MAIN_BOARD_CONTENT_KEY, nextValue);
  }, []);

  const enqueueBoardTask = useCallback((task: () => Promise<void>) => {
    const run = boardQueueRef.current.then(task, task);
    boardQueueRef.current = run.catch(() => undefined);
  }, []);

  const persistValue = useCallback(async (content: AppValue): Promise<void> => {
    setSaveState('saving');
    try {
      await saveBoard({ title: MAIN_BOARD_TITLE, content });
      lastSyncedJsonRef.current = serializeAppValue(content);
      setSaveState(pendingValueRef.current ? 'saving' : 'saved');
    } catch (error) {
      setSaveState('error');
      console.warn('Failed to save the board to the server.', error);
    }
  }, []);

  const flushCloudSave = useCallback(() => {
    const runFlush = () => {
      enqueueBoardTask(async () => {
        if (!signedInRef.current) {
          setSaveState('local');
          return;
        }
        const nextValue = pendingValueRef.current ?? valueRef.current;
        pendingValueRef.current = null;
        if (serializeAppValue(nextValue) === lastSyncedJsonRef.current) {
          setSaveState('saved');
          if (pendingValueRef.current && signedInRef.current) {
            runFlush();
          }
          return;
        }
        await persistValue(nextValue);
        if (pendingValueRef.current && signedInRef.current) {
          runFlush();
        }
      });
    };
    runFlush();
  }, [enqueueBoardTask, persistValue]);

  const syncBoardOnce = useCallback(async () => {
    if (!signedInRef.current) {
      return;
    }
    pendingValueRef.current = null;
    clearSaveTimer();
    try {
      const result = await fetchBoard();
      if (result.status === 'ok') {
        applyBoardSnapshot(result.board);
        hydratedRef.current = true;
        setSaveState('saved');
        return;
      }
      if (result.status === 'unauthorized') {
        signedInRef.current = false;
        hydratedRef.current = false;
        setSaveState('local');
        return;
      }
      const content = valueRef.current;
      await saveBoard({ title: MAIN_BOARD_TITLE, content });
      lastSyncedJsonRef.current = serializeAppValue(content);
      hydratedRef.current = true;
      setSaveState(pendingValueRef.current ? 'saving' : 'saved');
    } catch (error) {
      setSaveState('error');
      console.warn('Failed to sync the board with the server.', error);
    }
  }, [applyBoardSnapshot, clearSaveTimer]);

  const scheduleCloudSave = (nextValue: AppValue) => {
    if (!signedInRef.current || !hydratedRef.current) {
      setSaveState('local');
      return;
    }
    setSaveState('saving');
    pendingValueRef.current = nextValue;
    clearSaveTimer();
    saveTimerRef.current = window.setTimeout(() => {
      saveTimerRef.current = null;
      flushCloudSave();
    }, CLOUD_SAVE_DELAY_MS);
  };

  const syncFromServer = useCallback(async () => {
    let user: { id: string; email: string; displayName: string } | null;
    try {
      user = await fetchCurrentUser();
    } catch (error) {
      console.warn('Failed to read the current session.', error);
      return;
    }
    if (!user) {
      signedInRef.current = false;
      hydratedRef.current = false;
      clearSaveTimer();
      setSaveState('local');
      return;
    }
    signedInRef.current = true;
    enqueueBoardTask(syncBoardOnce);
  }, [clearSaveTimer, enqueueBoardTask, syncBoardOnce]);

  const updatePreference = (partialPreference: Partial<MainBoardPreference>) => {
    setPreference((currentPreference) => {
      const nextPreference = { ...currentPreference, ...partialPreference };
      localforage.setItem(MAIN_BOARD_PREFERENCE_KEY, nextPreference);
      return nextPreference;
    });
  };

  useEffect(() => {
    const loadData = async () => {
      const [storedData, storedToolState, storedPreference] = await Promise.all([
        localforage.getItem(MAIN_BOARD_CONTENT_KEY),
        localforage.getItem(MAIN_BOARD_TOOL_STATE_KEY),
        localforage.getItem(MAIN_BOARD_PREFERENCE_KEY),
      ]);
      if (storedData) {
        const appValue = storedData as AppValue;
        valueRef.current = appValue;
        setValue(appValue);
        if (appValue.children && appValue.children.length === 0) {
          setTutorial(true);
        }
      } else {
        setTutorial(true);
      }
      if (storedToolState) {
        setInitialToolState(storedToolState as Partial<DrawnixToolState>);
      }
      if (storedPreference) {
        setPreference(storedPreference as MainBoardPreference);
      }
      setLoaded(true);
      void syncFromServer();
    };
    loadData();
  }, [syncFromServer]);

  useEffect(() => {
    const handleAuthChanged = () => {
      void syncFromServer();
    };
    window.addEventListener(AUTH_CHANGED_EVENT, handleAuthChanged);
    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, handleAuthChanged);
      clearSaveTimer();
    };
  }, [clearSaveTimer, syncFromServer]);
  if (!loaded) {
    return null;
  }
  return (
    <Drawnix
      value={value.children}
      viewport={value.viewport}
      theme={value.theme}
      initialToolState={initialToolState}
      initialLayout={preference.layout}
      saveState={saveState}
      initialLanguage={preference.language}
      initialPreference={{
        copyTransparent: preference.copyTransparent,
        exportTransparent: preference.exportTransparent,
      }}
      onLanguageChange={(language) => {
        updatePreference({ language });
      }}
      onPreferenceChange={({ copyTransparent, exportTransparent }) => {
        updatePreference({ copyTransparent, exportTransparent });
      }}
      onLayoutChange={(layout) => {
        updatePreference({ layout });
      }}
      onChange={(value) => {
        const newValue = toAppValue(value as { children?: unknown });
        valueRef.current = newValue;
        if (!hydratedRef.current) {
          if (newValue.children.length > 0) {
            void localforage.setItem(MAIN_BOARD_CONTENT_KEY, newValue);
          }
          return;
        }
        localforage.setItem(MAIN_BOARD_CONTENT_KEY, newValue);
        setValue(newValue);
        if (newValue.children && newValue.children.length > 0) {
          setTutorial(false);
        }
        scheduleCloudSave(newValue);
      }}
      onToolStateChange={(toolState) => {
        localforage.setItem(MAIN_BOARD_TOOL_STATE_KEY, toolState);
      }}
      tutorial={tutorial}
      afterInit={(_board) => {
        console.log('board initialized');
      }}
    ></Drawnix>
  );
}

export default App;
