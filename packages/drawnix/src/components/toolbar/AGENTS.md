# toolbar

> 📅 生成于：2026-10-27
> 📂 路径：`packages/drawnix/src/components/toolbar`
> 🏷️ 类型：**Module**（工具栏集群）

---

## 概览

工具栏是本产品的主要操作入口，共 6 个组件，都是**绝对定位浮层**，位置由 `styles/index.scss` 里的 `.drawnix .xxx-toolbar` 决定：

| 组件 | 类名 | 位置 | 职责 |
| --- | --- | --- | --- |
| `AppToolbar` | `.app-toolbar` | 左上 36/36 | 菜单、撤销重做、复制、删除 |
| `CreationToolbar` | `.draw-toolbar` | 顶部居中 36 | 工具选择 + 形状/箭头/画笔面板 + **Agent 入口** |
| `ZoomToolbar` | `.zoom-toolbar` | 右上 36 | 缩放 -/+/适应/100% |
| `ThemeToolbar` | `.theme-toolbar` | 右下 | 6 套主题切换（原生 `<select>`） |
| `ClosePencilToolbar` | `.pencil-mode-toolbar` | 左上 82 | 铅笔模式下"退出铅笔" |
| `PopupToolbar` | 选中态浮层 | 跟随选区 | 填充、描边、字体颜色/字号、链接、更多 |

## 相关概念

- **工具的两条通路**：`BUTTONS`（`creation-toolbar.tsx` 内的数组）定义工具顺序与图标；真正切换走 `BoardTransforms.updatePointerType` + `updateToolState({ pointer })`。只改 `BUTTONS` 而不改快捷键/`isChecked` 会导致状态不同步。
- **`isChecked` 的排斥逻辑**：任一弹层（`arrowOpen`/`shapeOpen`/`freehandOpen`）打开时，所有单选按钮都不显示选中态，避免"两个按钮同时高亮"。
- **`lastXxxPointer`**：形状/箭头/画笔各记住上次选择，重新点开弹层时恢复。写入点在各 `onPointerUp` 中，读取点在 `popup-toolbar` 与 `creation-toolbar`。
- **Agent 入口**：创建栏末尾的分隔线（`.draw-toolbar__divider`）+ `SparklesIcon` 按钮，直接读写 `appState.agentPanelOpen`。它与 Agent 面板头部关闭按钮共享同一状态，不要再单独维护局部开关。

## 测试用例覆盖

- [x] `freehand-panel/freehand-style-preset-item.spec.tsx` — 预设项渲染与选中样式
- [x] E2E 间接覆盖：`apps/web-e2e/src/example.spec.ts` 只验证容器可见
- [ ] 工具切换、Agent 开关、缩放、主题切换无自动化用例（可用 `.draw-toolbar` 内按钮的 `aria-label` 补 Playwright 用例）

## 相关概念（事件与键盘）

- `onPointerDown` 切到 `BoardCreationMode.dnd`，`onPointerUp` 切回 `drawing`，这是"按下拖拽画形状"的时序要求，改顺序会导致拖拽失效。
- 形状按钮的 `onPointerDown` 里有个特殊分支：若当前已是形状工具，则直接 `updatePointerType(board, board.pointer)`，用于重新激活同名 pointer。
- 快捷键与按钮是**两套入口、同一状态**：快捷键在 `plugins/with-hotkey.ts`，按钮在本目录，改动任一都要检查另一侧。

## Props 定义

全部工具栏组件**不接收 Props**，依赖：

- `useBoard()` → board 实例与 `getBoardContainer`
- `useDrawnix()` → `appState` / `setAppState`
- `useI18n()` → 文案

因此它们只能在 `<Drawnix>` 的 Provider 内使用。


## 状态管理

所有工具栏共享同一份工具态（`appState.toolState`），本地状态只有各弹层的开合标记：

| 组件 | 本地状态 | 说明 |
| --- | --- | --- |
| `CreationToolbar` | `freehandOpen` / `arrowOpen` / `shapeOpen` | 三者互斥显示选中态，但状态独立 |
| `AppToolbar` | `appMenuOpen` | 应用菜单开合 |
| `ZoomToolbar` | `zoomMenuOpen` | 缩放菜单开合 |

工具态本身由 `useDrawnix().setAppState` 写入，并通过 `buildToolStateSyncPlugin` 从 board 回写。不要在工具栏里另建 `useState` 保存当前工具。

## 功能页面

不是页面，而是画布上的 6 组浮层（见本文概览表格）。它们的定位由 `styles/index.scss` 决定，显隐由 `appState` 与选区状态决定。
## 渲染逻辑

### CreationToolbar

```
Island(.draw-toolbar) > Stack.Row
  for BUTTONS:
    freehand → Popover(FreehandPanel)
    shape    → Popover(ShapePicker)
    arrow    → Popover(ArrowPicker)
    extra-tools → <ExtraToolsButton/>
    其它     → ToolButton type="radio"
  然后：分隔线 + ToolButton(type="icon", SparklesIcon, onClick=toggle agentPanelOpen)
```

移动端（`.drawnix--mobile`）会隐藏手形工具，且 `.draw-toolbar` 允许横向滚动（`overflow-x:auto`、隐藏滚动条），防止按钮溢出屏幕。

### AppToolbar

`Popover` 菜单（打开/另存为/导出图片/清除画布/分隔线/语言切换），随后是撤销、重做，以及"有选中元素时才出现"的复制与删除按钮。撤销/重做通过 `board.history.undos.length` 判断 `disabled`。

### PopupToolbar

以 `useFloating` + `flip/offset` 跟随选区矩形；内部按元素类型（`PlaitDrawElement` / `MindElement`）决定显示哪些按钮，并处理 `isWhite` 颜色在深色主题下的取反显示。

## 数据结构

- `AppToolButtonProps`（`creation-toolbar.tsx`）：`titleKey`、`icon`、`pointer`、`key`（`PopupKey | 'image' | 'extra-tools'`）。
- `PopupKey` 枚举：`shape` / `arrow` / `freehand`。
- 形状与箭头清单来自 `components/shape-picker.tsx` 的 `SHAPES`、`arrow-picker.tsx` 的 `ARROWS`。

## API 和服务

- `BoardTransforms.updatePointerType` / `updateZoom` / `updateThemeColor` / `fitViewport`：全部来自 `@plait/core`，不要直接改 `board.pointer`。
- `getShortcutKey('CtrlOrCmd+S')`：把跨平台快捷键显示成 `Cmd+S` / `Ctrl+S`（`utils/common.ts`）。

## 模块结构

```
toolbar/
├── creation-toolbar.tsx        # 工具选择 + Agent 入口
├── zoom-toolbar.tsx            # 缩放
├── theme-toolbar.tsx           # 主题
├── pencil-mode-toolbar.tsx     # 退出铅笔模式
├── app-toolbar/
│   ├── app-toolbar.tsx         # 左侧应用栏
│   ├── app-menu-items.tsx      # 打开/保存/导出/清空
│   └── language-switcher-menu.tsx
├── extra-tools/
│   ├── extra-tools-button.tsx  # "更多工具"按钮
│   └── menu-items.tsx          # Mermaid/Markdown 入口
├── freehand-panel/
│   ├── freehand-panel.tsx      # 笔刷/橡皮 + 预设
│   └── freehand-style-preset-item.tsx
└── popup-toolbar/
    ├── popup-toolbar.tsx       # 选中态浮层
    ├── fill-button.tsx stroke-button.tsx font-color-button.tsx
    ├── font-size-control.tsx arrow-mark-button.tsx link-button.tsx
    └── more-options-button.tsx
```

## 交互和事件

- 主题切换用原生 `<select>`，`onChange` 直接 `BoardTransforms.updateThemeColor`，不走 React 状态——因此它总是反映 board 的真实主题。
- `ClosePencilToolbar` 同时调用 `setAppState({isPencilMode:false})` 与 `setIsPencilMode(board,false)`，两者必须同时改：前者驱动 UI，后者驱动 `with-pencil` 插件的事件拦截。
- 图片按钮（`key: 'image'`）在 `onPointerUp` 中调用 `addImage(board)`，不改变 pointer。

## 复用说明

- 新增工具：在 `BUTTONS` 加项 → 若需要弹层则扩展 `PopupKey` → 在渲染分支处理 → 快捷键在 `with-hotkey.ts` 补一条 → i18n 补 `toolbar.*`。
- 新增顶部按钮：直接加 `<ToolButton>` 到 `Stack.Row` 末尾，保持 `type="icon"`。

## 依赖关系

- 上游：`components/{tool-button,island,stack,popover,shape-picker,arrow-picker,freehand-panel}`、`hooks/use-drawnix`、`i18n`、`utils/image`。
- 下游：`drawnix.tsx` 与 `plugins/with-hotkey.ts`（共享 pointer 状态）。

## 关联文档

- [../AGENTS.md](../AGENTS.md) — 组件总览
- [app-toolbar/AGENTS.md](app-toolbar/AGENTS.md)
- [extra-tools/AGENTS.md](extra-tools/AGENTS.md)
- [freehand-panel/AGENTS.md](freehand-panel/AGENTS.md)
- [popup-toolbar/AGENTS.md](popup-toolbar/AGENTS.md)
- [../../plugins/AGENTS.md](../../plugins/AGENTS.md) — 快捷键与 pencil 插件

## 技术栈

- React 19、`@floating-ui/react`（Popover）
- `@plait/core` `BoardTransforms`、`@plait/common` `setCreationMode`

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
