# popover

> 📅 生成于：2026-10-27
> 📂 路径：`packages/drawnix/src/components/popover`
> 🏷️ 类型：**Generic Component**（弹出层基座）

---

## 概览

对 `@floating-ui/react` 的薄封装，导出 `usePopover` / `Popover` / `PopoverTrigger` / `PopoverContent` 与内容区样式。所有工具栏弹层都基于它。

## 相关概念

- **受控/非受控双模式**：传入 `open` 即为受控，此时内部 `useClick` 被禁用（`enabled: controlledOpen == null`），**必须由调用方自己处理点击开关**。仓库里工具栏普遍传了 `open`，所以都写成 `onPointerDown={() => setOpen(!open)}`。
- **`container` 必传**：`PopoverContent` 把 `container` 传给 `FloatingPortal`，应传 `PlaitBoard.getBoardContainer(board)`。不传会挂到 `document.body`，在画布缩放/滚动时定位偏移。
- **`initialFocus={-1}`**：让弹层不抢焦点，避免输入框失焦或画布快捷键被阻断；工具栏弹层都这么用。
- **middleware 固定**：`offset(sideOffset||4)` + `flip`（跨轴 + `fallbackAxisSideDirection:'end'`）+ `shift(padding:5)`。不要去掉 `shift`，否则窄屏右侧弹层会被裁掉。

## 测试用例覆盖

- [ ] 无单测
- [ ] 建议补充：受控模式下点击 trigger 不自动开关、`container` 生效的 portal 目标正确

## 相关概念（Props）

- `PopoverProps`：`open`、`onOpenChange`、`placement`、`sideOffset`、`modal`、`initialOpen`。
- `PopoverContentProps`：`container`、`initialFocus`、`className`、`children`。

## 渲染逻辑

```
usePopover(options)
 ├─ useFloating({placement, open, onOpenChange, middleware})
 ├─ useClick(受控时禁用) / useDismiss / useRole
 └─ 返回 { open, setOpen, refs, floatingStyles, ...interactions, labelId, descriptionId }

Popover → PopoverContext.Provider
  ├─ PopoverTrigger asChild → 把 ref/props 合并到子元素
  └─ PopoverContent → FloatingPortal(container) → FloatingFocusManager → div.popover-content
```

## 数据结构

无自有数据结构，直接透传 floating-ui 类型。

## API 和服务

- `useMergeRefs`：把内部 ref 与 `asChild` 子元素 ref 合并，这是 `PopoverTrigger asChild + ToolButton` 能工作的关键。

## 文件结构

```
popover/
└── popover.tsx    # hook + 组件 + 样式（样式写在同一目录的全局 scss 中）
```

## 交互和事件

- 非受控：点 trigger 开、点外部/Esc 关。
- 受控：仅当 `open` 变化才开关；`useDismiss` 仍会把 `onOpenChange(false)` 回调给调用方处理。

## 复用说明

```tsx
<Popover open={open} onOpenChange={setOpen} sideOffset={12}>
  <PopoverTrigger asChild>
    <ToolButton type="icon" icon={X} aria-label="..." onPointerDown={() => setOpen(!open)} />
  </PopoverTrigger>
  <PopoverContent container={container} initialFocus={-1}>...</PopoverContent>
</Popover>
```

## 依赖关系

- 上游：`@floating-ui/react`。
- 下游：`toolbar/*`、`menu` 相关弹层、`select`（结构相似但独立实现）。

## 关联文档

- [../AGENTS.md](../AGENTS.md)
- [../select/AGENTS.md](../select/AGENTS.md) — 另一套浮层（带值选择）
- [../dialog/AGENTS.md](../dialog/AGENTS.md) — 模态版本

## 技术栈

- `@floating-ui/react` 0.26


## 常见改动指引

| 需求 | 改动位置 |
| --- | --- |
| 改弹出方向 | `placement`（默认 `bottom`） |
| 改间距 | `sideOffset` |
| 禁止自动聚焦内容 | `PopoverContent` 的 `initialFocus={-1}` |
| 去掉点击外部关闭 | `usePopover` 的 `useDismiss` |

## 易错点与约束

- 受控模式下 `useClick` 被禁用，忘记写 `onPointerDown` 会出现"点了没反应"。
<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
