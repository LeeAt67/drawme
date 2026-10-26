# react-board/src/plugins

> 📅 生成于：2026-10-27
> 📂 路径：`packages/react-board/src/plugins`
> 🏷️ 类型：**Module**（渲染层插件）

---

## 概览

三个文件：

- `board.ts`：类型契约（`ReactBoard`、`BoardChangeData`）。
- `with-react.tsx`：把 `@drawme/react-text` 的 `Text` 挂到 `board.renderText`。
- `with-pinch-zoom-plugin.ts`：触摸双指缩放 + `isTwoFingerMode` 判断。

## 相关概念

- **`renderText` 的三件套**：`createRoot` 挂载、保留 `currentEditor`（供 `ReactEditor` 反查节点）、返回 `{ destroy, update }`。`destroy` 里延迟 `unmount`（`setTimeout 0`）避免 React 警告。
- **`ReactBoard.renderComponent`**：通用"把 React 组件挂进 Plait 容器"的接口，`renderText` 是它的文本特化。
- **双指缩放的关键状态**：`TOUCH_RECORDS: WeakMap<PlaitBoard, PointerRecord[]>` 记录每个触点的轨迹，`isTwoFingerMode(board)` 判断当前是否两指——freehand 的创建/擦除都用它来**避让**（两指时不当成画笔）。
- **缩放只走 viewport**：`withPinchZoom` 通过 `BoardTransforms.updateZoom` 与滚动补偿实现，不修改元素尺寸。

## 测试用例覆盖

- [x] 无本目录专属测试
- [ ] 建议补充：`isTwoFingerMode` 在 1/2/3 指下的返回值；`renderText` 的 `update` 会重渲染新 props

## 相关概念（契约）

```ts
interface BoardChangeData {
  children: PlaitElement[];
  operations: PlaitOperation[];
  viewport: Viewport;
  selection: Selection | null;
  theme: PlaitTheme;
}
```

这是 `Wrapper.onChange` 的载荷，也是宿主持久化的输入。

## Props 定义

- `withReact(board: PlaitBoard & PlaitTextBoard)`：`PlaitPlugin`。
- `withPinchZoom(board: PlaitBoard)`：`PlaitPlugin`。
- `isTwoFingerMode(board): boolean`。


## 状态管理

`TOUCH_RECORDS`（`WeakMap`）保存触点轨迹，是双指缩放的唯一状态源；`with-react` 内部的 `currentEditor` 是闭包变量，用于文本编辑的节点反查。二者都不进入 React 状态。

## 功能页面

无。本目录只影响画布行为与文本渲染。
## 渲染逻辑

```
withReact
 └─ board.renderText = (container, props) => {
      const root = createRoot(container);
      render(<Text {...props} afterInit={e => currentEditor = e} />);
      return { destroy: 延迟 unmount, update: 重新 render }
    }

withPinchZoom
 ├─ touchstart/move/end 记录 TOUCH_RECORDS
 ├─ 两指 → 计算距离比 → updateZoom + 滚动补偿
 └─ 结束时清空记录
```

## 数据结构

- `PointerRecord`（触点轨迹）。
- `TOUCH_RECORDS: WeakMap<PlaitBoard, PointerRecord[]>`。

## API 和服务

- 无网络/存储。

## 模块结构

```
plugins/
├── board.ts                    # ReactBoard / BoardChangeData
├── with-react.tsx              # renderText 桥
└── with-pinch-zoom-plugin.ts   # withPinchZoom / isTwoFingerMode / TOUCH_RECORDS
```

## 交互和事件

- 双指缩放期间，其它插件（如 freehand）通过 `isTwoFingerMode` 提前退出，避免误画。
- `renderText` 的 `update` 必须**重新 render**而不是修改 props 对象，否则 Slate 不会同步。

## 复用说明

- 需要替换文本编辑器（例如换成 Lexical）：只改 `with-react.tsx` 与 `@drawme/react-text`，board 层无需变动。

## 依赖关系

- 上游：`@plait/core|common|text-plugins`、`@drawme/react-text`、`react-dom/client`。
- 下游：`wrapper.tsx`（装配）、`board.tsx`（不直接用）。

## 关联文档

- [../AGENTS.md](../AGENTS.md)
- [../../react-text/AGENTS.md](../../react-text/AGENTS.md) — 被渲染的 `Text`
- [../../drawnix/src/plugins/freehand/AGENTS.md](../../drawnix/src/plugins/freehand/AGENTS.md) — `isTwoFingerMode` 消费方

## 技术栈

- `react-dom/client` `createRoot`、Touch/Pointer Events

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
