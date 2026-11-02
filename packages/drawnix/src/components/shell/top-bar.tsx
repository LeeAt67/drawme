import { useState } from 'react';
import { useBoard } from '@drawme/react-board';
import { deleteFragment, duplicateElements, getSelectedElements, PlaitBoard } from '@plait/core';
import {
  DuplicateIcon,
  MenuIcon,
  RedoIcon,
  ShareIcon,
  SlidersIcon,
  TrashIcon,
  UndoIcon,
  ZenIcon,
} from '../icons';
import { ToolButton } from '../tool-button';
import { Popover, PopoverContent, PopoverTrigger } from '../popover/popover';
import Menu from '../menu/menu';
import MenuItem from '../menu/menu-item';
import MenuSeparator from '../menu/menu-separator';
import {
  CleanBoard,
  OpenFile,
  SaveAsFile,
  SaveAsImage,
  SaveToFile,
} from '../toolbar/app-toolbar/app-menu-items';
import { LanguageSwitcherMenu } from '../toolbar/app-toolbar/language-switcher-menu';
import { useI18n } from '../../i18n';
import { useDrawnix, type DrawnixSaveState } from '../../hooks/use-drawnix';
import { openAuthDialog, signOut } from '../../auth/session';
import { useAuthSession } from '../../auth/use-auth-session';
import { useLayout } from './use-layout';

type TopBarProps = {
  title?: string;
  saveState?: DrawnixSaveState;
};

const saveLabelKeys = {
  local: 'layout.save.local',
  saving: 'layout.save.saving',
  saved: 'layout.save.saved',
  conflict: 'layout.save.conflict',
  error: 'layout.save.error',
} as const;

export const TopBar = ({ title, saveState = 'local' }: TopBarProps) => {
  const board = useBoard();
  const { t } = useI18n();
  const { showToast } = useDrawnix();
  const { layout, toggleContextPanel, toggleUiHidden } = useLayout();
  const { status, user, authRequired } = useAuthSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const selectedElements = getSelectedElements(board);
  const isUndoDisabled = board.history.undos.length <= 0;
  const isRedoDisabled = board.history.redos.length <= 0;
  const shellContainer = PlaitBoard.getBoardContainer(board)?.closest(
    '.drawnix'
  ) as HTMLElement | null;
  const displayTitle = title?.trim() || t('layout.untitled');
  const isPropertiesOpen = layout.contextPanelOpen && layout.contextPanelTab === 'properties';
  const accountInitial = (
    Array.from((user?.displayName || user?.email || '?').trim())[0] || '?'
  ).toUpperCase();

  const shareBoard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast({ message: t('layout.share.copied'), type: 'success' });
    } catch {
      showToast({ message: t('layout.share.failed'), type: 'error' });
    }
  };

  const handleSignOut = async () => {
    setAccountOpen(false);
    try {
      await signOut();
      showToast({ message: t('auth.signedOut'), type: 'success' });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      showToast({ message: `${t('auth.error')}: ${message}`, type: 'error' });
    }
  };

  return (
    <header className="dx-topbar">
      <div className="dx-topbar__left">
        <Popover
          open={menuOpen}
          sideOffset={12}
          placement="bottom-start"
          onOpenChange={(open) => {
            setMenuOpen(open);
          }}
        >
          <PopoverTrigger asChild>
            <ToolButton
              type="icon"
              visible={true}
              selected={menuOpen}
              icon={MenuIcon}
              title={t('general.menu')}
              aria-label={t('general.menu')}
              onPointerDown={() => {
                setMenuOpen(!menuOpen);
              }}
            />
          </PopoverTrigger>
          <PopoverContent container={shellContainer}>
            <Menu
              onSelect={() => {
                setMenuOpen(false);
              }}
            >
              <OpenFile></OpenFile>
              <SaveToFile></SaveToFile>
              <SaveAsFile></SaveAsFile>
              <SaveAsImage></SaveAsImage>
              <CleanBoard></CleanBoard>
              <MenuSeparator />
              <LanguageSwitcherMenu />
            </Menu>
          </PopoverContent>
        </Popover>
        <span className="dx-topbar__title" title={displayTitle}>
          {displayTitle}
        </span>
      </div>
      <div className="dx-topbar__right">
        {selectedElements.length > 0 && (
          <ToolButton
            key="duplicate"
            type="icon"
            icon={DuplicateIcon}
            visible={true}
            title={t('general.duplicate')}
            aria-label={t('general.duplicate')}
            onPointerUp={() => {
              duplicateElements(board);
            }}
          />
        )}
        {selectedElements.length > 0 && (
          <ToolButton
            key="delete"
            type="icon"
            icon={TrashIcon}
            visible={true}
            title={t('general.delete')}
            aria-label={t('general.delete')}
            onPointerUp={() => {
              deleteFragment(board);
            }}
          />
        )}
        <span className="dx-topbar__divider" aria-hidden="true" />
        <span
          className={`dx-save-state dx-save-state--${saveState}`}
          title={t(saveLabelKeys[saveState])}
        >
          <i aria-hidden="true" />
          <span>{t(saveLabelKeys[saveState])}</span>
        </span>
        <span className="dx-topbar__history">
          <ToolButton
            type="icon"
            icon={UndoIcon}
            visible={true}
            title={t('general.undo')}
            aria-label={t('general.undo')}
            onPointerUp={() => {
              board.undo();
            }}
            disabled={isUndoDisabled}
          />
          <ToolButton
            type="icon"
            icon={RedoIcon}
            visible={true}
            title={t('general.redo')}
            aria-label={t('general.redo')}
            onPointerUp={() => {
              board.redo();
            }}
            disabled={isRedoDisabled}
          />
        </span>
        <span className="dx-topbar__divider" aria-hidden="true" />
        <ToolButton
          type="icon"
          icon={SlidersIcon}
          visible={true}
          selected={isPropertiesOpen}
          title={t('layout.properties')}
          aria-label={t('layout.properties')}
          onPointerUp={toggleContextPanel}
        />
        <ToolButton
          type="icon"
          icon={ShareIcon}
          visible={true}
          title={t('layout.share')}
          aria-label={t('layout.share')}
          onPointerUp={() => void shareBoard()}
        />
        <ToolButton
          type="icon"
          icon={ZenIcon}
          visible={true}
          title={t('layout.toggleUi')}
          aria-label={t('layout.toggleUi')}
          onPointerUp={toggleUiHidden}
        />
        {authRequired && status !== 'unknown' && (
          <>
            <span className="dx-topbar__divider" aria-hidden="true" />
            {status === 'signed-in' && user ? (
              <Popover
                open={accountOpen}
                sideOffset={10}
                placement="bottom-end"
                onOpenChange={(open) => setAccountOpen(open)}
              >
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="dx-account"
                    title={user.email}
                    aria-label={t('auth.account')}
                    onClick={() => setAccountOpen(!accountOpen)}
                  >
                    <span className="dx-account__avatar" aria-hidden="true">
                      {accountInitial}
                    </span>
                    <span className="dx-account__name">{user.displayName}</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent container={shellContainer}>
                  <Menu onSelect={() => setAccountOpen(false)}>
                    <div className="dx-account__summary">
                      <strong>{user.displayName}</strong>
                      <span>{user.email}</span>
                    </div>
                    <MenuSeparator />
                    <MenuItem
                      onSelect={() => {
                        void handleSignOut();
                      }}
                      aria-label={t('auth.signOut')}
                    >
                      {t('auth.signOut')}
                    </MenuItem>
                  </Menu>
                </PopoverContent>
              </Popover>
            ) : (
              <button
                type="button"
                className="dx-account dx-account--guest"
                onClick={openAuthDialog}
              >
                {t('auth.signIn')}
              </button>
            )}
          </>
        )}
      </div>
    </header>
  );
};
