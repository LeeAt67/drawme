# react-board

> 📅 生成于：2026-10-27
> 📂 路径：`packages/react-board`
> 🏷️ 类型：**Module**（board 的 React 运行时）

---

## 概览

把 `@plait/core` 的命令式 board 变成 React 组件。对外 API 由 `src/index.ts` 全部导出：

- `Wrapper`：创建 board、初始化 listRender、接管 props 与回调。
- `Board`：渲染 SVG 宿主、注册 DOM 引用、绑定插件事件。
- `useBoard` / `useListRender`：从 Context 取实例。
- `withReact`、`withPinchZoom`、`isTwoFingerMode`、`TOUCH_RECORDS`、`BoardChangeData`。

## 相关概念

- **`Wrapper` 与 `Board` 的分工**：`Wrapper` 只管"状态与生命周期"（board 实例、onChange 冒泡、viewport 同步），`Board` 只管"DOM 与事件"（SVG 分层、rough.js、事件监听）。因此 `<Wrapper>` 内可以放多个非 board 的浮层（本项目就是这样做的）。
- **`BoardContextValue = { v, board, listRender }`**：`v` 是版本号，用于强制刷新；消费方通过 `useBoard()` 拿 board，**不要**从 props 传 board。
- **SVG 分层固定**：`element-lower-host` → `element-host` → `element-upper-host` → `element-top-host`，另有独立的 `board-active-svg` 承载交互层。层级决定遮挡关系，新增渲染层要慎重。
- **`afterInit` 只调用一次**：在 `listRender.initialize` 的同一分支内，`if (!listRender.initialized)` 保护。宿主用它把 board 存进 state。
- **`onChange` 的载荷是快照**：`{ children, operations, viewport, selection, theme }`，直接来自 board，不是深拷贝。宿主要持久化时应序列化（`apps/web` 存的是整个对象，依赖 localforage 的结构化克隆）。

## 状态管理

- `BoardContext`（`{ v, board, listRender }`）是唯一的共享状态，`v` 变化触发消费方重新读取。
- board 自身的 `children` / `viewport` / `theme` / `selection` 由 Plait 内部维护，React 只做"订阅 + 回抛"。
- 所有 DOM 引用通过 `BOARD_TO_*` 弱映射挂在 board 上，组件卸载时必须删除，否则内存泄漏。

## 功能页面

无路由页面。它提供的是可嵌入任意页面的画布组件（`<Wrapper><Board/></Wrapper>`）。

## 核心功能和数据流

```
Wrapper
 ├─ useState(() => initializeBoard(...))     // 只创建一次
 ├─ useState(() => initializeListRender(board))
 ├─ useEffect: 订阅 board 变化 → onChange / onValueChange / onSelectionChange / onViewportChange
 └─ Provider(BoardContext) → children
        └─ Board
             ├─ useEffect(once): rough/host 弱映射 + listRender.initialize + afterInit
             └─ DOM + useBoardPluginEvent + useBoardEvent
```

## 模块内的组件

- `Wrapper`（`src/wrapper.tsx`）：生命周期与回调。
- `Board`（`src/board.tsx`）：SVG 宿主与 DOM 事件。
- 详见 [src/AGENTS.md](src/AGENTS.md)、[src/hooks/AGENTS.md](src/hooks/AGENTS.md)、[src/plugins/AGENTS.md](src/plugins/AGENTS.md)。

## 服务和工具

- `withPinchZoom`：双指缩放。
- `withReact`：把 `@drawme/react-text` 挂到 `board.renderText`。
- `BoardChangeData`：变更载荷类型。

## 模块结构

```
react-board/
├── src/
│   ├── index.ts        # 公开导出
│   ├── wrapper.tsx     # board 生命周期与回调
│   ├── board.tsx       # SVG 宿主与事件
│   ├── board.spec.tsx
│   ├── hooks/          # Context 与 DOM 事件桥
│   ├── plugins/        # with-react / with-pinch-zoom / 类型
│   └── styles/
├── vite.config.ts
└── tsconfig*.json
```

## 测试用例覆盖

- [x] `src/board.spec.tsx` — 渲染冒烟
- [ ] `Wrapper` 的回调冒泡、viewport 同步、pinch zoom 无单测
- [ ] 建议补充：`onChange` 在 board 变化后被调用且载荷完整

## 相关概念（Props）

`PlaitBoardProps`（`Board`）：`style`、`className`、`children`、`afterInit`。

`WrapperProps`：`value`、`children`、`options`、`plugins`、`viewport`、`theme`、`onChange`、`onSelectionChange`、`onValueChange`、`onViewportChange`、`onThemeChange`。

## 内部插件顺序

`initializeBoard` 的实际嵌套（由内向外）是：

```
createBoard(value, options)
  → withText → withImage → withReact → withOptions → withI18n
  → withBoard → withMoving → withSelection → withHistory
  → withHandPointer → withHotkey → withRelatedFragment
  → withPinchZoom
  → ...外部 plugins（Drawnix 传入的那批）
```

外部插件位于最外层，**能覆盖**内置行为；这解释了为什么项目自己的 `with-hotkey` 能接管 `mod+z`。

## 交互和事件

- `use-plugin-event` 把浏览器事件转成 Plait 的 `board.xxx(event)` 调用；`globalKeyDown` / `keyDown` 的分层也在其中，所以插件覆盖这两个方法即可介入键盘。
- 滚动容器是 `.viewport-container`（`overflow:auto`），`.disabled-scroll` 类由 `disabledScrollOnNonFocus` 选项控制。

## 复用说明

- 需要"board 之外再加浮层"：放在 `<Wrapper>` 的子节点里即可（与 `Drawnix` 一致）。
- 需要自定义文本渲染：改 `with-react.tsx` 的 `renderText`，而不是替换 `Text` 组件本身。

## 依赖关系

- 上游：`@plait/core|common|draw|mind|layouts`、`@drawme/react-text`、`ahooks`、`roughjs`。
- 下游：`@drawme/drawnix`（`Board`/`Wrapper`/`useBoard`）。

## 关联文档

- [src/AGENTS.md](src/AGENTS.md)
- [../react-text/AGENTS.md](../react-text/AGENTS.md)
- [../drawnix/src/AGENTS.md](../drawnix/src/AGENTS.md) — 装配方

## 技术栈

- React 19、`@plait/core` 0.93/0.94、`roughjs`、`ahooks`（`useEventListener`）

## 常见改动指引

| 需求 | 改动位置 |
| --- | --- |
| 暴露新的 board 能力给业务层 | `src/index.ts` 增加 re-export |
| 调整回调载荷 | `src/plugins/board.ts` 的 `BoardChangeData` + `wrapper.tsx` 的 `onContextChange` |
| 新增浏览器事件接入 | `src/hooks/use-plugin-event.tsx`（转成 `board.xxx` 调用） |
| 新增画布层 | `src/board.tsx` 的 `<g>` 结构与 `styles/index.scss` |
| 改双指缩放灵敏度 | `src/plugins/with-pinch-zoom-plugin.ts` |

## 易错点与约束

- `Board` 的 `useEffect` 清理函数必须删除所有 `BOARD_TO_*` 弱映射，漏删会导致 board 与 DOM 互相持有。
- `.board-active-svg` 必须是 `pointer-events: none`，否则命中检测全部落到交互层。
- `afterInit` 只在首次初始化时调用，把"每次渲染都要做的事"放进去会静默失效。
- 不要在 `Wrapper` 里用 `useState(board.children)` 之类的派生状态，会与 Plait 的直接 DOM 操作不同步。

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
