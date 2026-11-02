# DrawMe 布局重构方案（Figma / FigJam 风格）

> 状态：方案稿，未实施代码改动
> 目标：把当前「画布 + 6 个绝对定位浮层」重构成「顶栏 + 导航轨 + 可折叠侧栏 + 画布 + 右侧上下文面板 + 底部工具条」

---

## 1. 结论

采用 **FigJam 三区骨架 + Figma 右侧检查器** 的组合，而不是完整照搬 Figma 五区：

- 骨架用 FigJam：画布优先，顶栏极简，工具条悬浮在画布底部。
- 左栏借 Figma：Pages / Layers 作为「文件结构」入口。
- 右栏借 Figma：属性检查器与 Agent 共用一个上下文面板，Tab 切换。
- 保留 DrawMe 现有能力：选中态浮动工具条（`PopupToolbar`）、链接浮层、手写笔提示、激光笔都不变。

分 4 个阶段落地，P0 就能看到明显变化且可随时回滚；P3 才做移动端与折叠动画。

---

## 2. 现状与问题

当前 `packages/drawnix/src/drawnix.tsx` 的渲染结构是：

```
<div class="drawnix">
  <Wrapper>
    <Board>                       // .plait-board-container
      <Tutorial />
    </Board>
    <AppToolbar />                // top:36 left:36
    <CreationToolbar />           // top:36 居中
    <ZoomToolbar />               // top:36 right:36
    <ThemeToolbar />              // bottom:36 right:36
    <PopupToolbar />              // 选中态浮动
    <LinkPopup />
    <ClosePencilToolbar />        // top:82 left:0
    <AgentPanel />                // top:84 right:36，390px 浮层
    <TTDDialog /> <CleanConfirm /> <Toast />
  </Wrapper>
</div>
```

具体问题：

1. **没有布局骨架**。6 个浮层各自写 `top/left/right/bottom`，互相挤占：Agent 面板与 Zoom 都在右上，选中属性条也与 Agent 争空间。
2. **浮层挂在 `Board` 的 `children` 里**。`Board` 的 children 被渲染进 `.viewport-container`（`overflow:auto`），工具条与可滚动画布处于同一棵子树，后续做「侧栏推开画布」时边界不清晰。
3. **画布尺寸不可变**。左右侧栏只能覆盖画布，不能真正让出空间；窄屏只能靠 `isMobile` 宏把元素挪来挪去。
4. **信息架构缺失**。文件标题、保存状态、当前用户、分享入口没有固定位置；导入导出、语言、清空都塞在左上角菜单里。
5. **无统一 UI 显隐**。没有 zen 模式、没有键盘入口、没有面板宽度记忆。

关键可行性依据：`packages/react-board/src/hooks/use-board-event.ts:72` 已经对 board container 挂了 `ResizeObserver`，容器尺寸变化会重新 `initializeViewportContainer / initializeViewBox / updateViewportOffset`。因此侧栏改变画布宽度是安全的，不需要改 Plait 内核。

---

## 3. 目标布局

### 3.1 桌面（≥ 1024px）

```
┌──────────────────────────────────────────────────────────────────────┐
│ TopBar 48                                                           │
│ [☰] DrawMe / 未命名画布   · 已保存        [↶ ↷]   [头像] [分享]     │
├────┬───────────────┬───────────────────────────────┬─────────────────┤
│Nav │ LeftPanel 260 │ Canvas                        │ ContextPanel 320│
│Rail│ (可折叠/拖宽) │                               │ (可折叠/拖宽)   │
│ 48 │               │                               │                 │
│    │ Pages         │        ┌──────────────┐       │ [属性] [Agent]  │
│ 🗂 │  · Page 1     │        │  画布内容     │       │                 │
│ ✨ │               │        └──────────────┘       │ 选中元素的      │
│ 🖼 │ Layers        │                               │ 填充/描边/字号  │
│ ⚙ │  · 矩形 1     │        ┌───────────────────┐   │                 │
│    │  · 文本 2     │        │ 底部工具条（悬浮） │   │                 │
│    │               │        └───────────────────┘   │                 │
│    │               │                     [缩放 - 100% +]              │
└────┴───────────────┴───────────────────────────────┴─────────────────┘
```

- **TopBar**：左侧菜单 + 文件标题 + 保存状态；右侧撤销/重做、当前用户、分享（P1 占位）。
- **NavRail**：文件（Pages/Layers）、素材、Agent、设置。宽度 48，图标 + tooltip，可 `aria-expanded`。
- **LeftPanel**：默认展开（宽度 260），内容随 NavRail 选择切换：`file` / `layers` / `assets`。
- **Canvas**：唯一可伸缩区域，`flex: 1; min-width: 0; position: relative`。
- **ContextPanel**：默认收起（宽度 320）。Tab：`properties` / `agent`。
- **底部工具条**：画布内绝对定位，`bottom: 24px; left: 50%`，胶囊形状，复用现有 `CreationToolbar` 的按钮与弹出面板。
- **Zoom**：画布右下角 `bottom: 24px; right: 24px`，复用 `ZoomToolbar`。
- **Theme**：P0 保留右下浮层；P1 移入 TopBar 菜单 / 设置面板，避免右下角三个浮层叠放。

默认值建议：

| 项 | 桌面 | 移动/窄屏 |
| --- | --- | --- |
| LeftPanel | 展开，260px | 关闭（抽屉） |
| ContextPanel | 收起，320px | 关闭（底部 sheet） |
| TopBar | 48px | 44px |
| NavRail | 48px | 隐藏，收进 TopBar 菜单 |
| 底部工具条 | 56px 高，可横向滚动 | 48px 高 + `safe-area-inset-bottom` |

### 3.2 移动端（≤ 900px 或 `isMobile`）

- TopBar：菜单、标题、Agent、更多。
- NavRail 隐藏；LeftPanel / ContextPanel 变成覆盖式：
  - 左栏：从左侧滑入，宽度 `min(320px, 88vw)`，带遮罩，点击遮罩关闭。
  - 右栏：底部 sheet，高度 `min(78vh, 640px)`，顶部有 24×4 的拖拽条。
- 底部工具条：只放 Move / Selection / Mind / Text / Pen / Shape / Image / Agent；`overflow-x: auto` 且隐藏滚动条。
- Zoom 隐藏（保留手势缩放）；Theme 在 TopBar 菜单。

---

## 4. 目标组件树

```
packages/drawnix/src/drawnix.tsx
└── <I18nProvider>
    └── <DrawnixContext.Provider>
        └── <div class="drawnix drawnix--mobile [drawnix--zen]">
            ├── <Wrapper>                                  // 仍是 board context 提供者
            │   ├── <AppShell>
            │   │   ├── <TopBar />                         // shell/top-bar.tsx
            │   │   ├── <div class="dx-shell__body">
            │   │   │   ├── <NavRail />                    // shell/nav-rail.tsx
            │   │   │   ├── <LeftPanel />                  // shell/left-panel.tsx
            │   │   │   │   ├── <PagesList />              // panels/pages-list.tsx
            │   │   │   │   ├── <LayersList />             // panels/layers-list.tsx
            │   │   │   │   └── <AssetsPanel />            // P2 占位
            │   │   │   ├── <main class="dx-canvas">
            │   │   │   │   ├── <Board>                   // 只放画布本体 + Tutorial
            │   │   │   │   │   └── <Tutorial />
            │   │   │   │   ├── <PopupToolbar />          // 选中态浮动，不变
            │   │   │   │   ├── <LinkPopup />
            │   │   │   │   ├── <ClosePencilToolbar />
            │   │   │   │   ├── <BottomToolbar />         // shell/bottom-toolbar.tsx
            │   │   │   │   └── <ZoomToolbar />           // 右下角
            │   │   │   └── <ContextPanel />              // shell/context-panel.tsx
            │   │   │       ├── <PropertiesPanel />       // panels/properties-panel.tsx
            │   │   │       └── <AgentPanel variant="docked" />
            │   │   └── <TTDDialog /> <CleanConfirm /> <Toast />
            │   └── (结束)
            └── <canvas class="laser-pointer" />
```

### 4.1 关键结构决定

1. **`Board` 只承载画布**。`PopupToolbar`、`LinkPopup`、`ClosePencilToolbar`、`BottomToolbar`、`ZoomToolbar` 全部移到 `Board` 外部、`.dx-canvas` 内部。它们仍能 `useBoard()`，因为 `Wrapper` 在更外层提供了 context。
2. **`.dx-canvas` 是定位上下文**。所有画布浮层相对它绝对定位；不再相对 `.plait-board-container`。
3. **Popover 容器要换**。现有工具条用 `PlaitBoard.getBoardContainer(board)` 作为 portal 容器。工具条移到 `Board` 外之后，弹出层会被画布容器裁剪，需要改成 `.dx-canvas` 或 AppShell 根节点作为容器（通过 `PlaitBoard.getBoardContainer(board).closest('.dx-canvas')` 或 `useDrawnixShellContainer()`）。
4. **TopBar / Shell 不依赖 board 内部 DOM**，只依赖 `useBoard()` 的 selection/history 只读数据。

---

## 5. 交互与状态模型

### 5.1 新增布局状态

在 `packages/drawnix/src/hooks/use-drawnix.tsx` 增加：

```ts
export type LeftPanelTab = 'file' | 'layers' | 'assets';
export type ContextPanelTab = 'properties' | 'agent';

export type DrawnixLayoutState = {
  leftPanelOpen: boolean;
  leftPanelTab: LeftPanelTab;
  leftPanelWidth: number;      // 220 - 400
  contextPanelOpen: boolean;
  contextPanelTab: ContextPanelTab;
  contextPanelWidth: number;   // 280 - 480
  uiHidden: boolean;           // zen 模式
};

export type DrawnixState = {
  // ...existing
  layout: DrawnixLayoutState;
};
```

默认值工厂（不要散落在组件里）：

```ts
export const createDefaultLayoutState = (isMobile: boolean): DrawnixLayoutState => ({
  leftPanelOpen: !isMobile,
  leftPanelTab: 'file',
  leftPanelWidth: 260,
  contextPanelOpen: false,
  contextPanelTab: 'properties',
  contextPanelWidth: 320,
  uiHidden: false,
});
```

### 5.2 `agentPanelOpen` 的去向

当前 `agentPanelOpen` 只有 3 处使用：

- `packages/drawnix/src/drawnix.tsx` 初始化
- `packages/drawnix/src/components/toolbar/creation-toolbar.tsx` 按钮选中态与 toggle
- `packages/drawnix/src/agent/agent-panel.tsx` 挂载时刷新配置 / Esc 关闭

处理方式：

- P0 保留字段，避免一次改太多。
- P2 用派生函数替代，删除字段：

```ts
export const isAgentPanelOpen = (state: DrawnixState) =>
  state.layout.contextPanelOpen && state.layout.contextPanelTab === 'agent';
```

- Agent 按钮改为 `openContextPanel('agent')`；关闭改为 `closeContextPanel()`。
- `AgentPanel` 内部 `appState.agentPanelOpen` 改用 `isAgentPanelOpen(appState)`。

### 5.3 交互矩阵

| 操作 | 行为 |
| --- | --- |
| 点 NavRail「文件」 | `leftPanelOpen = !leftPanelOpen`；保持 `leftPanelTab = 'file'` |
| 点 NavRail「图层」 | 打开左栏并切到 `layers` |
| 点 NavRail「Agent」 | 打开右栏并切到 `agent`；已打开且当前是 agent 时关闭 |
| 点工具条 Agent 按钮 | 同上，兼容旧入口 |
| 选中画布元素 | 不自动打开右栏；NavRail「属性」出现高亮点；`PopupToolbar` 行为不变 |
| 点 NavRail「属性」 | 打开右栏并切到 `properties` |
| 拖动侧栏分隔条 | 实时改宽度，clamp 到 `[min,max]`；拖动中关闭 transition |
| 双击分隔条 | 重置为 260 / 320 |
| `Ctrl/Cmd + Shift + \` | 同时切换左右栏（记住各自上次状态） |
| `Ctrl/Cmd + \` | 切换 `uiHidden`（隐藏 TopBar/Nav/两侧栏/底部工具条），Esc 退出并 toast 提示 |
| `Alt + 1` | 打开左栏 `file` |
| `Alt + 2` | 打开左栏 `layers` |
| `Alt + 3` | 打开右栏 `properties` |
| 移动端点遮罩 | 关闭对应面板 |

### 5.4 持久化与宿主应用解耦

`@drawme/drawnix` 不直接读写 localforage。新增 props：

```ts
export type DrawnixProps = {
  // ...
  initialLayout?: Partial<DrawnixLayoutState>;
  onLayoutChange?: (layout: DrawnixLayoutState) => void;

  // TopBar 数据由宿主注入，避免库内感知云同步
  boardTitle?: string;
  onBoardTitleChange?: (title: string) => void;
  saveState?: 'local' | 'saving' | 'saved' | 'conflict' | 'error';
};
```

`apps/web/src/app/app.tsx`：

- 新增 `MAIN_BOARD_LAYOUT_KEY = 'main_board_layout'`，加载时 `localforage.getItem`。
- `onLayoutChange` 里 debounce 200ms 写回 localforage（布局变化频率低，可直接写）。
- `saveState` 由现有 `scheduleCloudSave` 分支映射：
  - 未登录：`local`
  - 定时器等待 + 请求中：`saving`
  - 成功：`saved`
  - 其他失败：`error`

---

## 6. 分阶段改动清单

### P0：骨架 + 顶栏 + 底部工具条（1–2 天）

目标：不改任何业务逻辑，先把布局跑通，视觉上从「浮动块堆叠」变成「编辑器」。

**新增**

- `packages/drawnix/src/components/shell/app-shell.tsx`
  - 只负责 `<TopBar />` + `.dx-shell__body` + `.dx-canvas` 的 DOM 结构。
- `packages/drawnix/src/components/shell/app-shell.scss`
  - `.drawnix { display: flex; flex-direction: column; height: 100%; }`
  - `.dx-shell__body { display: flex; flex: 1; min-height: 0; }`
  - `.dx-canvas { position: relative; flex: 1; min-width: 0; overflow: hidden; }`
  - `--dx-topbar-h: 48px; --dx-nav-rail-w: 48px; --dx-left-panel-w: 260px; --dx-context-panel-w: 320px;`
- `packages/drawnix/src/components/shell/top-bar.tsx`
  - 左：菜单按钮（复用 `app-menu-items` 的菜单内容）、标题、保存状态。
  - 右：撤销/重做（从 `AppToolbar` 迁入）、用户占位、分享占位。
  - P0 可用 `appState.isMobile` 控制简化显示。
- `packages/drawnix/src/components/shell/bottom-toolbar.tsx`
  - 渲染 `<CreationToolbar variant="docked" />`。
  - 保留 `Island` 胶囊外观，位置 `bottom: 24px`。

**修改**

- `packages/drawnix/src/drawnix.tsx`
  - 用 `AppShell` 包裹原 `Wrapper` 内的内容。
  - `Board` 的 children 只保留 `<Tutorial />`。
  - `AppToolbar` 移除（拆到 TopBar），`CreationToolbar` / `ZoomToolbar` 移到 `.dx-canvas`。
  - `AgentPanel`、`ThemeToolbar` 暂保持原位，P1/P2 再挪。
- `packages/drawnix/src/components/toolbar/creation-toolbar.tsx`
  - 增加 `variant?: 'floating' | 'docked'`（默认 `floating`，兼容外部用法）。
  - `docked` 时根节点 class 改为 `bottom-toolbar`，不再使用 `.draw-toolbar` 的绝对定位。
- `packages/drawnix/src/styles/index.scss`
  - 删除 `.draw-toolbar`、`.zoom-toolbar`、`.app-toolbar`、`.theme-toolbar` 的 `top/left/right` 绝对定位。
  - 保留移动端布局，但在 P0 先按 `bottom-toolbar` / `canvas-zoom` 两个新类重写。
  - `.pencil-mode-toolbar` 的 `top: 82px` 改为相对 `.dx-canvas` 的 `top: 12px`。
- `packages/drawnix/src/i18n/types.ts` + `translations/{zh,en,ru,ar,vi}.ts`
  - 新增键（见第 7 节）。
- `packages/drawnix/src/i18n/index.spec.ts`（如已有键完整性测试）
  - 补 5 语言一致性断言。
- `apps/web/src/app/app.tsx`
  - 透传 `boardTitle` / `saveState`（P0 可先只传 `saveState`）。

**验收**

- 1920 / 1440 / 1280 宽下无浮层重叠；画布区域随窗口 resize 正确重算。
- 底部工具条所有按钮（含 shape/arrow/freehand 弹出面板）功能与现在一致。
- `npx nx test drawnix`、`npx nx test web`、`npx nx build web` 通过。

---

### P1：NavRail + LeftPanel + 标题/保存状态（2–3 天）

**新增**

- `components/shell/nav-rail.tsx`
  - 5 个入口：文件、图层、素材、Agent、设置。
  - `button[aria-expanded]`、`title`、focus ring；选中态用 `--color-surface-primary-container`。
- `components/shell/left-panel.tsx`
  - 头部：标题 + 折叠按钮；正文按 `layout.leftPanelTab` 渲染。
  - 右下 4px 拖拽热区（`role="separator" aria-orientation="vertical"`）。
- `components/panels/pages-list.tsx`
  - 目前单页：显示 `Page 1`，禁用「新建页面」，旁边放 `+` 但提示「即将支持多页面」。
- `components/panels/layers-list.tsx`
  - 扁平遍历 `board.children`（P1 不做分组树）。
  - 每行显示类型图标 + `element.id` 截断名；点击用 `Transforms.setSelection` 选中（用 `getRectangleByElements` 转 viewBox 两角点），并 `BoardTransforms.moveToCenter(board, [element])`。
  - 选中态与 `board.selection` 同步：监听 `onSelectionChange` 或从 `PopupToolbar` 抽 `useSelectedElements`。
- `components/shell/resizable-divider.tsx`
  - 通用横向拖拽条，左右侧栏复用；pointer capture + `pointermove`。

**修改**

- `packages/drawnix/src/hooks/use-drawnix.tsx`
  - 增加 `layout` 状态、`createDefaultLayoutState`、`isAgentPanelOpen`。
- `packages/drawnix/src/drawnix.tsx`
  - 增加 `initialLayout` / `onLayoutChange` props；合并到 `appState.layout`。
- `packages/drawnix/src/plugins/with-hotkey.ts`
  - 增加 `Ctrl/Cmd+Shift+\`、`Ctrl/Cmd+\`、`Alt+1/2/3`；避免与文本编辑冲突（`PlaitBoard.hasBeenTextEditing` 时直接返回）。
- `packages/drawnix/src/styles/index.scss`
  - 增加 shell 断点：`@media (max-width: 1024px)` 隐藏左栏、右栏变 sheet。
- `apps/web/src/app/app.tsx`
  - 读写 `main_board_layout`；标题暂用常量 `未命名画布`（后端已有 `MAIN_BOARD_TITLE` 可复用）。

**验收**

- 左栏开关不改变画布内容位置语义（仅视口偏移重算），缩放后不跳。
- 图层点击能选中并居中元素；选中画布元素时图层行高亮。
- 刷新页面后左右栏宽度与开关状态恢复。

---

### P2：ContextPanel（属性 + Agent 停靠）（3–4 天）

**新增**

- `components/shell/context-panel.tsx`
  - Tab：属性 / Agent；头部右侧折叠按钮。
  - 与左栏对称的拖拽条，宽 280–480。
- `components/panels/properties-panel.tsx`
  - 空态：未选中时显示「选择一个元素以编辑属性」。
  - 单选：填充、描边、描边样式、字号、字体颜色、链接。
  - 多选：显示数量 + 批量填充/描边。
  - 控件直接复用 `popup-toolbar/fill-button.tsx`、`stroke-button.tsx`、`font-color-button.tsx`、`font-size-control.tsx` 的内部 Picker。
- `components/toolbar/popup-toolbar/element-style.ts`
  - 把 `popup-toolbar.tsx` 里的 `getElementState`、`hasFillProperty`、`hasStrokeProperty`、`hasTextProperty` 等纯函数抽出来，供浮动条与右侧面板共用。

**修改**

- `components/toolbar/popup-toolbar/popup-toolbar.tsx`
  - 改为从 `element-style.ts` 导入状态计算；视觉与行为不变。
- `agent/agent-panel.tsx`
  - 增加 `variant?: 'floating' | 'docked'`（默认 `floating`）。
  - `docked` 时根节点 class 为 `agent-panel agent-panel--docked`，去掉 `position/top/right/width/max-height`。
  - 关闭按钮改为 `onClose` prop（由 ContextPanel 决定收起面板还是仅切 tab）。
- `agent/agent-panel.scss`
  - 增加 `.agent-panel--docked { position: static; width: 100%; height: 100%; border: 0; border-radius: 0; box-shadow: none; }`。
- `components/toolbar/creation-toolbar.tsx`
  - Agent 按钮改调 `openContextPanel('agent')`。
- `packages/drawnix/src/hooks/use-drawnix.tsx`
  - 删除 `agentPanelOpen`，导出 `isAgentPanelOpen`。

**验收**

- 右侧属性面板改颜色/字号后，画布与浮动 `PopupToolbar` 同步。
- Agent 停靠后消息区可滚动、输入框贴底；移动端变 sheet 后可全屏使用。
- 不再存在「Agent 浮层挡住 Zoom」的问题。

---

### P3：折叠 / Zen / 移动端 / 打磨（2–3 天）

**新增**

- `components/shell/panel-backdrop.tsx`（移动端遮罩 + Esc 关闭）
- `hooks/use-ui-shortcuts.ts`（把 P1 的快捷键从插件里拆出，便于测试）

**修改**

- `styles/index.scss`
  - `drawnix--zen`：隐藏 `.dx-topbar`、`.dx-nav-rail`、`.dx-left-panel`、`.dx-context-panel`、`.dx-bottom-toolbar`；画布占满；显示右上角「退出 Zen」按钮。
  - 移动端：`.dx-left-panel`、`.dx-context-panel` 改 `position: fixed` + `transform` 动画；遮罩 `background: rgba(0,0,0,.32)`。
  - `padding-bottom: env(safe-area-inset-bottom)`。
- `drawnix.tsx`
  - 挂 `useUiShortcuts`；Zen 时仍保留 Toast 与 Esc 退出。
- `apps/web/src/app/app.tsx`
  - 若登录态变化，无需重置布局，只更新 TopBar 用户区。

**验收**

- iPhone SE 宽度（375）与 iPad（1024）下无横向溢出；底部工具条可滑动。
- Zen 模式进出不丢焦点、不改变画布视口。
- 键盘 Tab 顺序：TopBar → NavRail → LeftPanel → Canvas 工具条 → ContextPanel。

---

## 7. i18n 新增键（5 语言同步）

加到 `packages/drawnix/src/i18n/types.ts` 的 `Translations`，并补 `zh/en/ru/ar/vi`：

```ts
'layout.file': string;
'layout.layers': string;
'layout.assets': string;
'layout.agent': string;
'layout.settings': string;
'layout.properties': string;
'layout.collapsePanel': string;
'layout.expandPanel': string;
'layout.toggleUi': string;
'layout.exitZen': string;
'layout.zenHint': string;
'layout.untitled': string;
'layout.save.local': string;
'layout.save.saving': string;
'layout.save.saved': string;
'layout.save.conflict': string;
'layout.save.error': string;
'layout.pages': string;
'layout.page.default': string;
'layout.pages.comingSoon': string;
'layout.layers.empty': string;
'layout.properties.empty': string;
'layout.properties.multi': string;   // 可含 {count} 占位
'layout.share': string;
'layout.account': string;
```

命名遵循现有 `toolbar.*` / `agent.*` 的扁平点号风格，不引入嵌套对象。

---

## 8. 样式约定

1. 所有尺寸走 CSS 变量，禁止在组件 SCSS 里散落魔法数：

```scss
.drawnix {
  --dx-topbar-h: 48px;
  --dx-nav-rail-w: 48px;
  --dx-left-panel-w: 260px;
  --dx-context-panel-w: 320px;
  --dx-panel-gap: 8px;
  --dx-canvas-inset: 24px;
  --dx-panel-bg: var(--island-bg-color);
  --dx-panel-border: var(--island-border-color);
  --dx-panel-shadow: var(--shadow-island);
}
```

2. 面板背景、边框、阴影复用 `--island-*` / `--color-*`，保证 6 套主题（含 dark）不写死。
3. 层级：

```
canvas 内容        0
画布浮层工具条     20
左右侧栏           30
TopBar             40
Popover / Menu     100（现有 popover 已高于此）
Toast              1000
```

4. 动画：只对 `opacity` / `transform` 做 160ms 过渡；**面板宽度拖动时不加 transition**，否则 `ResizeObserver` 每帧重算 viewBox 会抖。展开/收起若出现抖动，降级为「侧栏覆盖画布」而不是推挤画布。
5. 移动端 `@include isMobile` 与 `@media (max-width: 900px)` 同时覆盖：前者处理 UA，后者处理窄桌面窗口。

---

## 9. 风险与规避

| 风险 | 说明 | 规避 |
| --- | --- | --- |
| Popover 被裁剪 | 工具条移出 `Board` 后，`getBoardContainer` 不再是合适容器 | 新增 `getShellPopoverContainer(board)`，返回 `.dx-canvas` 或 `.drawnix`；逐个改工具条的 `container` 传参 |
| 画布视口跳动 | 侧栏展开触发 ResizeObserver 连续重算 | 拖动期间禁用 transition；开关后校验 `viewport.zoom` 与滚动位置；必要时改为覆盖式侧栏 |
| 浮动工具条定位错乱 | `PopupToolbar` 依赖选中元素坐标与 viewport | P0 不改其内部逻辑，仅换父容器；加 E2E：选中矩形 → 工具条仍贴右侧 |
| 图层选中不准 | `Selection` 是两点矩形，不是 id 列表 | 用元素 bbox 的两角转 viewBox 点；对 mind/draw 分别取 `getRectangleByElements` 结果 |
| 移动端手势冲突 | 底部工具条可横向滚动，可能吞掉画布拖拽 | 工具条容器 `touch-action: pan-x`；画布区域不设 `touch-action` 覆盖 |
| 主题失效 | 新面板写死白色/阴影 | 强制使用 `--island-bg-color` / `--island-border-color` / `--shadow-island`；dark 主题截图验收 |
| 旧外部用法破坏 | `CreationToolbar` 可能被外部单独使用 | 新 `variant` 默认值保持 `floating`，旧类名保留一个版本 |

---

## 10. 回归测试清单

手动（每个阶段都跑）：

- 画布：平移、滚轮缩放、框选、多选、拖动、撤销/重做。
- 工具：手形、选择、思维导图、文本、画笔（含橡皮/笔刷面板）、箭头（3 种）、形状（含流程图）、图片、更多工具。
- 浮层：选中属性条、链接编辑、手写笔退出条、Toast。
- Agent：未登录提示、登录、发送消息、插入图表、设置面板、Esc 关闭。
- 云同步：登录后编辑 → 800ms 后 POST 保存 → 刷新恢复。
- 主题：default / colorful / soft / retro / dark / starry 各截一张图。
- 响应式：375 / 768 / 1024 / 1440 / 1920。

自动化：

```bash
npx nx test drawnix --skip-nx-cache
npx nx test web --skip-nx-cache
npx nx build web
npm run lint
```

建议新增单测：

- `layout-state.spec.ts`：默认值、宽度 clamp、快捷键 reducer、`isAgentPanelOpen`。
- `layers-list.spec.tsx`：空态、点击选中回调、选中态高亮。
- `context-panel.spec.tsx`：tab 切换、折叠、Agent docked 渲染。

---

## 11. 与后续多人协作的衔接

当前后端按 owner 隔离画布，尚无 workspace 成员与实时通道。布局预留：

- TopBar 右侧 `presence` 区域（P3 占位）→ 后续接 WebSocket/SSE 的在线用户头像。
- ContextPanel 增加第三个 tab `comments` / `activity`，无需改骨架。
- LeftPanel 的 Pages 列表在多页面落地后替换占位实现，数据结构不变。

这样布局重构不会与后续 CRDT / 多人编辑方案冲突。

---

## 12. 参考

- Figma 文件浏览器与编辑器布局：<https://help.figma.com/hc/en-us/articles/15297425105303-Explore-design-files>
- Figma 左侧栏：<https://help.figma.com/hc/en-us/articles/360039831974-Explore-the-navigation-bar-and-left-sidebar>
- Figma 右侧属性栏：<https://help.figma.com/hc/en-us/articles/360039832014-Design-prototype-and-explore-layer-properties-in-the-right-sidebar>
- Figma 底部工具栏：<https://help.figma.com/hc/en-us/articles/360041064174-Access-design-tools-from-the-toolbar>
- Figma 隐藏/最小化 UI：<https://help.figma.com/hc/en-us/articles/41414918021271-Hide-or-minimize-the-UI>
- FigJam 布局：<https://help.figma.com/hc/en-us/articles/15300412458647-Explore-FigJam-files>

