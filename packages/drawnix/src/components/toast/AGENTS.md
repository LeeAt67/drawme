# toast

> 📅 生成于：2026-10-27
> 📂 路径：`packages/drawnix/src/components/toast`
> 🏷️ 类型：**Business Component**（全局轻提示）

---

## 概览

提供 `useToast()`（状态 + 展示函数）与 `<Toast>`（渲染容器）。它是**单槽位**提示：同一时刻最多一条，新提示会取消上一条的定时器。

同时是所有"非 React 代码"的提示出口：`board.showToast` 指向此函数，插件（如复制到剪贴板成功）才能在无组件上下文的场景弹出提示。

## 相关概念

- **单条覆盖策略**：`showToast` 会 `clearTimeout` 旧 timer 并复用同一槽位。连续操作不会堆叠多行，这是刻意设计（画布内提示不需要队列）。
- **自动关闭用 id 校验**：定时器回调里 `setToast(current => current?.id === id ? null : current)`，防止"旧定时器关掉了新提示"。
- **`duration = 0` 表示常驻**：不设置定时器，需手动关闭（当前没有调用方使用）。
- **`type` 默认 `info`**：`success` / `error` 只影响样式，不影响行为。

## 测试用例覆盖

- [x] `toast.spec.tsx` — 展示与自动关闭
- [ ] 连续提示覆盖、`duration:0`、卸载清理无覆盖

## 相关概念（使用位置）

- `drawnix.tsx`：`const { toast, showToast } = useToast()`，然后 `board.showToast = showToast` 并渲染 `<Toast toast={toast} container={containerRef.current} />`。
- `utils/image.ts`：复制成功/失败提示。
- `agent/agent-panel.tsx`：图表插入成功提示、设置保存提示。

## Props 定义

`useToast()` 返回 `{ toast, showToast }`：

- `toast: DrawnixToast | null` — 渲染所需数据。
- `showToast(options: DrawnixToastOptions)` — `{ message, description?, type?, duration? }`。

`<Toast toast container />`：

- `toast`：当前提示或 `null`。
- `container`：portal 目标（通常为 `.drawnix` 容器）。

## 渲染逻辑

```
showToast(options)
 ├─ id++
 ├─ clearTimeout(旧)
 ├─ setToast({id, message, description, type})
 └─ duration>0 → setTimeout(按 id 清除)

<Toast> → FloatingPortal(container) → div.toast(.toast--success|--error)
```

## 数据结构

- `DrawnixToast`、`DrawnixToastOptions`、`DrawnixToastType`（`'info'|'success'|'error'`）。
- `DEFAULT_TOAST_DURATION = 4000`。

## API 和服务

- 无服务调用；纯 UI 状态。

## 文件结构

```
toast/
├── toast.tsx        # useToast + Toast
├── toast.scss       # 位置、配色（含 theme--dark 变体）
└── toast.spec.tsx
```

## 交互和事件

- 无用户交互（不可点击关闭）。若将来支持点击关闭，注意不要与自动关闭定时器竞争。

## 复用说明

- 组件内：`const { showToast } = useDrawnix(); showToast({ message, type: 'success' })`。
- 非组件（插件/工具函数）：`(board as DrawnixBoard).showToast?.({...})`，必须用可选链——board 可能没有挂载宿主提供的 toast。

## 依赖关系

- 上游：`@floating-ui/react` `FloatingPortal`。
- 下游：`drawnix.tsx`、`utils/image.ts`、`agent/agent-panel.tsx`。

## 关联文档

- [../AGENTS.md](../AGENTS.md)
- [../../../hooks/AGENTS.md](../../../hooks/AGENTS.md) — `DrawnixBoard.showToast` 类型
- [../../../utils/AGENTS.md](../../../utils/AGENTS.md) — 复制提示

## 技术栈

- React 19 hooks、`@floating-ui/react`

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
