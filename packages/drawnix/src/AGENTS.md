# drawnix/src

> 📅 生成于：2026-10-27
> 📂 路径：`packages/drawnix/src`
> 🏷️ 类型：**Module**（库入口与装配）

---

## 概览

这里是 `@drawme/drawnix` 的根：`index.ts` 决定对外 API，`drawnix.tsx` 完成"board + 插件 + 浮层"的装配，`constants.ts` 定义文件格式常量。

对外 API 只有三行 re-export：`./drawnix`、`./utils`、`./i18n`。新增公共 API 必须挂到这三处之一，否则宿主无法使用。

## 相关概念

### `DrawnixProps` 的回调契约

`onChange` / `onSelectionChange` / `onViewportChange` / `onThemeChange` 直接透传给 `Wrapper`；`onValueChange` 也来自 `Wrapper`。而 `onToolStateChange`、`onPreferenceChange`、`onLanguageChange` 是库自己维护的，通过 `useEffect` 在**非首次**渲染后触发。

改动要点：新增"需要持久化"的状态时，必须同时加 `xxxRef` 保存最新回调 + `hasMountedXxxRef` 跳过首次，否则会出现"加载即覆写"。

### 插件顺序（有语义）

```
withDraw → withGroup → withMind → withMindExtend → withCommonPlugin
→ buildDrawnixHotkeyPlugin → withFreehand → buildPencilPlugin
→ buildTextLinkPlugin → buildToolStateSyncPlugin
```

- `withCommonPlugin` 注入 `renderImage` 与 `getI18nValue`，同时串联 `withImagePlugin`（图片粘贴/拖拽/点击放大）。
- `withMindExtend` 通过 `setPluginOptions` 把 emoji 内边距设为 0、间距 4，并注入 React `renderEmoji`。
- `buildToolStateSyncPlugin` 必须最后，否则观察不到其它插件在 `pointerUp` 中改写的 pointer。
- `buildPencilPlugin` 会把"笔触落在画布上"自动切到铅笔模式，并**拦截**非笔触事件（`return` 而非 `pointerDown`），所以它必须晚于绘制插件。

### 快捷键归属

`buildDrawnixHotkeyPlugin` 在 `globalKeyDown` 中处理保存/导出/切工具，在 `keyDown` 中接管撤销/重做（`mod+z`、`mod+shift+z`）。它开头判断"焦点在 input/textarea 或正在文本编辑"时整体跳过，因此**不要**把这类逻辑挪到 `keyDown` 之外，否则会在输入框里误触发。

## 状态管理

- `appState`（`DrawnixState`）：本地 `useState`，每次渲染同步到 `board.appState`，并通过 `DrawnixContext` 下发。
- `themeColorMode`：本地 `useState`，同时挂成容器的 `theme--{mode}` 类名。
- `board`：`useState<DrawnixBoard | null>`，由 `<Board afterInit>` 回填；`applyToolStateToBoard` 在 `afterInit` 里把初始工具应用到 board。
- `lastKnownLanguageRef`：语言变更时写 ref 再调用 `setBoardLanguage(board, language)`，因为 `i18nInsidePlaitHook` 是**无 React 上下文**的读法。

## 功能页面

无页面，只有浮层（见 [../AGENTS.md](../AGENTS.md) 的"功能页面"）。

## 核心功能和数据流

```
render:
  board.appState = appState; board.showToast = showToast;
  <I18nProvider initialLanguage onLanguageChange>
    <DrawnixContext.Provider value={{appState,setAppState,showToast}}>
      <div class="drawnix [drawnix--mobile] [theme--x]">
        <Wrapper ...callbacks>
          <Board afterInit={applyToolStateToBoard + setBoard}>...</Board>
          <AppToolbar/><CreationToolbar/><ZoomToolbar/><ThemeToolbar/>
          <PopupToolbar/><LinkPopup/><ClosePencilToolbar/><AgentPanel/>
          <TTDDialog/><CleanConfirm/><Toast/>
        </Wrapper>
        <canvas class="laser-pointer ..."/>
      </div>
```

## 模块内的组件

| 文件/目录 | 职责 |
| --- | --- |
| `drawnix.tsx` | 装配器、`DrawnixProps`、`DrawnixContext.Provider` |
| `index.ts` | 公共导出（drawnix/utils/i18n） |
| `constants.ts` | `EVENT`、`MIME_TYPES`、`VERSIONS` |
| `agent/` `components/` `data/` `hooks/` `i18n/` `libs/` `plugins/` `styles/` `transforms/` `utils/` | 见各自 AGENTS.md |

## 服务和工具

- `useToast()`（`components/toast`）提供 `showToast`，并被注入到 `board.showToast`，使插件（如剪贴板复制成功）也能提示。
- `LASER_POINTER_CLASS_NAME`（`utils/laser-pointer.ts`）用于隐藏系统光标、交给 `laser-pen` 绘制。

## 模块结构

```
src/
├── index.ts        # export * from './drawnix' | './utils' | './i18n'
├── drawnix.tsx     # 装配器
├── constants.ts    # EVENT / MIME_TYPES / VERSIONS
├── agent/  components/  constants/  data/  hooks/
├── i18n/  libs/  plugins/  styles/  transforms/  utils/
```

## 测试用例覆盖

- [x] `hooks/use-drawnix.spec.ts` — `mergeToolState` 默认值/覆盖/预设深拷贝
- [x] `plugins/with-tool-state-sync.spec.ts` — 使用 `testing/setup-testing-board` 构造真实 board
- [x] `drawnix.spec.tsx` — 仅 `describe` 占位，无实际断言
- [ ] 装配流程、快捷键、`applyToolStateToBoard` 无覆盖

## 关联文档

- [../AGENTS.md](../AGENTS.md)
- [hooks/AGENTS.md](hooks/AGENTS.md) — `DrawnixState` 定义
- [plugins/AGENTS.md](plugins/AGENTS.md) — 插件细节
- [styles/AGENTS.md](styles/AGENTS.md) — `.drawnix` 容器与工具栏定位

## 技术栈

- React 19、`@plait/*`、`is-hotkey`、`mobile-detect`
- `@drawme/react-board` 的 `Board` / `Wrapper` / `useBoard`

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
