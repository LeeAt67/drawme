# react-board/src

> 📅 生成于：2026-10-27
> 📂 路径：`packages/react-board/src`
> 🏷️ 类型：**Module**（渲染层源码）

---

## 概览

`react-board` 的源码根，导出面由 `index.ts` 决定：

```
export * from './board';
export * from './plugins/board';
export * from './wrapper';
export * from './hooks/use-board';
export * from './plugins/with-pinch-zoom-plugin';
```

因此 `Board`、`Wrapper`、`useBoard`、`useListRender`、`BoardChangeData`、`withReact`、`withPinchZoom`、`isTwoFingerMode`、`TOUCH_RECORDS` 都是公开 API。

## 相关概念

- **两阶段渲染**：`Wrapper` 在 `useState` 初始化函数里同步创建 board（避免首帧重渲染），`Board` 在 `useEffect` 里把 DOM 引用写进 board 的弱映射。任何依赖 DOM 尺寸的逻辑（viewport、缩放）必须等 `Board` 挂载后才能用。
- **`BOARD_TO_*` 弱映射**：`@plait/core` 用 `WeakMap` 把 board 关联到 SVG host、rough 实例、listRender 等。`Board` 的 `useEffect` 负责 `set`，`cleanup` 负责 `delete`；**漏 delete 会造成内存泄漏**（board 与 DOM 互相持有）。
- **`IS_BOARD_ALIVE`**：卸载时置否，Plait 内部据此跳过异步渲染。

## 状态管理

无自有状态，全部来自 `Wrapper` 创建的 board 与 `BoardContext`；本文件只是导出面。

## 功能页面

无。

## 核心功能和数据流

```
index.ts（纯导出）
  ├─ board.tsx      → 提供 <Board>
  ├─ wrapper.tsx    → 提供 <Wrapper> 与 initializeBoard
  ├─ hooks/         → 提供 useBoard / useListRender / 事件桥
  └─ plugins/       → 提供 withReact / withPinchZoom / 类型
```

## 模块内的组件

| 目录 | 职责 |
| --- | --- |
| `hooks/` | Context、DOM 事件桥接、滚动/缩放同步 |
| `plugins/` | board 变更数据结构、文本渲染桥、双指缩放 |
| `styles/` | board 宿主样式（`.plait-board-container` 等） |

## 模块结构

```
src/
├── index.ts       # 公开导出（board / wrapper / hooks / plugins）
├── board.tsx      # SVG 宿主与事件挂载
├── wrapper.tsx    # board 创建与回调
├── board.spec.tsx
├── hooks/         # use-board / use-board-event / use-plugin-event
├── plugins/       # board.ts / with-react / with-pinch-zoom-plugin
└── styles/        # board 宿主样式
```

## 测试用例覆盖

- [x] `board.spec.tsx` — 渲染冒烟
- [ ] `index.ts` 的导出面（防止误删公开 API）无快照测试
- [ ] 建议补充：`render(<Wrapper><Board/></Wrapper>)` 后 `useBoard()` 可获取实例

## Props 定义

见 [../AGENTS.md](../AGENTS.md) 的 `PlaitBoardProps` / `WrapperProps`。

## 渲染逻辑

本文件不承载逻辑，只是导出聚合。

## 数据结构

无新增。

## API 和服务

- 新增公开 API 必须在此 re-export，否则 `@drawme/drawnix` 无法使用。

## 交互和事件

无（聚合层）。

## 复用说明

- 修改 `index.ts` 的导出范围属于**破坏性变更**，需同步检查 `packages/drawnix` 与 `apps/web`。

## 依赖关系

- 上游：`@plait/*`、`@drawme/react-text`。
- 下游：`@drawme/drawnix`。

## 关联文档

- [../AGENTS.md](../AGENTS.md)
- [hooks/AGENTS.md](hooks/AGENTS.md)
- [plugins/AGENTS.md](plugins/AGENTS.md)
- [styles/AGENTS.md](styles/AGENTS.md)

## 技术栈

- React 19、TypeScript

## 常见改动指引

| 需求 | 改动位置 |
| --- | --- |
| 新增可复用的 board hook | `hooks/` 新文件 + `index.ts` 导出 |
| 新增 Plait 插件 | `plugins/` 新文件 + `index.ts` 导出 |
| 调整 SVG 层级 | `board.tsx`（结构）+ `styles/index.scss`（定位） |
| 拦截浏览器事件 | `hooks/use-plugin-event.tsx` |

## 易错点与约束

- `index.ts` 是唯一的公开契约，删除导出会让 `drawnix` 编译失败（通常表现为 `Module has no exported member`）。
- `src` 下的文件不要直接 import `@drawme/drawnix`，否则形成循环依赖。
- 新增事件监听必须使用 `ahooks` 的 `useEventListener`（自动解绑），手写 `addEventListener` 容易泄漏。

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
