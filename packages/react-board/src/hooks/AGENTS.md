# react-board/src/hooks

> 📅 生成于：2026-10-27
> 📂 路径：`packages/react-board/src/hooks`
> 🏷️ 类型：**State**（Context 与 DOM 事件桥）

---

## 概览

三个 hook 文件把"Plait 的命令式世界"接到 React/DOM：

- `use-board.tsx`：`BoardContext` + `useBoard` + `useListRender`。
- `use-board-event.ts`：滚动/缩放（viewport 与 board 双向同步）。
- `use-plugin-event.tsx`：指针/键盘/剪贴板等事件转发到 `board.xxx`。

## 相关概念

- **Context 只存引用**：`BoardContextValue = { v, board, listRender }`，`v` 是手动递增的版本号（`Wrapper` 在 board 变更后更新）。**不要**把 board 的 `children` 放进 Context，会造成每次操作全树重渲染。
- **`useBoard()` 的错误信息是历史文案**（提示要在 `<Plait>` 内），实际 Provider 是 `Wrapper`。排查时不要被文案误导。
- **滚动同步有方向标记**：`isFromViewportChange(board)` / `setIsFromViewportChange` 用于区分"用户滚动"与"程序改 viewport"，否则会产生滚动回环（scroll → updateViewport → scroll...）。
- **移动点缓存**：`pointermove` 时写 `BOARD_TO_MOVING_POINT_IN_BOARD`，`pointerleave` 时删除。`with-hotkey` 依赖它判断"指针是否在画布内"，因此**在画布外按快捷键不会生效**是预期行为。
- **事件目标不同**：`pointerdown` 绑在 `hostRef`（SVG），`pointermove/up/leave` 绑在 `viewportContainerRef`（div）。这一区别让"拖拽到画布外仍能收到 up"成为可能，改动绑定目标会破坏拖拽结束逻辑。

## 测试用例覆盖

- [x] 无本目录专属测试
- [ ] 建议补充：`useBoard` 在 Provider 外抛错；滚动同步不产生回环

## 相关概念（三个 hook 的职责）

| hook | 绑定事件 | 副作用 |
| --- | --- | --- |
| `useBoardPluginEvent` | pointerdown/move/up/leave/cancel、touchstart/end、wheel、copy/paste/cut、keydown、drop/dragover | 转发到 board 方法；维护 moving point；处理剪贴板数据转换 |
| `useBoardEvent` | scroll（viewport 容器）、resize | 同步 viewport offset/scale；双指缩放 |
| `useBoard` | 无 | 提供 Context 访问器 |

## Props 定义

- `useBoard(): PlaitBoard`
- `useListRender(): ListRender`
- `useBoardPluginEvent(board, viewportContainerRef, hostRef)`（内部）
- `useBoardEvent(board, viewportContainerRef)`（内部）

## 渲染逻辑

```
pointerdown  → board.pointerDown(event)
pointermove  → set moving point → board.pointerMove(event)
pointerup    → board.pointerUp(event)
pointerleave → delete moving point → board.pointerLeave(event)
scroll       → 若来自 viewport 变更则忽略，否则 updateViewportByScrolling
```

## 数据结构

- `BoardContextValue`：`{ v: number; board: PlaitBoard; listRender: ListRender }`。
- `BOARD_TO_MOVING_POINT` / `BOARD_TO_MOVING_POINT_IN_BOARD`（`@plait/core` 弱映射）。

## API 和服务

- `ahooks` 的 `useEventListener` 负责绑定/解绑；它依赖 ref 的 `target`，因此首次渲染时 ref 为空不会绑定——这是"必须等 `Board` 挂载后事件才生效"的原因。

## 文件结构

```
hooks/
├── use-board.tsx        # Context 与访问器
├── use-board-event.ts   # 滚动/缩放
└── use-plugin-event.tsx # 指针/键盘/剪贴板事件桥
```

## 交互和事件

- 键盘：`globalKeyDown` 先于 `keyDown`，插件覆盖它们即可介入；输入框内的按键不会进入 board（`hasInputOrTextareaTarget`）。
- 剪贴板：`copy/cut/paste` 由 hook 收集 `ClipboardData` 后调用 `setFragment` / `deleteFragment` / `getClipboardData`。

## 复用说明

- 新增事件类型：在 `use-plugin-event.tsx` 加 `useEventListener`，并在插件里覆盖对应 `board.xxx`。不要在组件里直接 `addEventListener`。

## 依赖关系

- 上游：`@plait/core`、`ahooks`。
- 下游：`board.tsx`（唯一调用方）。

## 关联文档

- [../AGENTS.md](../AGENTS.md)
- [../plugins/AGENTS.md](../plugins/AGENTS.md) — 事件链与插件覆盖
- [../../drawnix/src/plugins/AGENTS.md](../../drawnix/src/plugins/AGENTS.md) — 谁在消费这些事件

## 技术栈

- React hooks、`ahooks` `useEventListener`、`@plait/core` 弱映射


## 易错点与约束

- `pointerdown` 绑 SVG、`pointermove/up` 绑容器，改变绑定目标会破坏"拖到画布外仍能结束拖拽"的行为。
<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
