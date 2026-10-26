# dialog

> 📅 生成于：2026-10-27
> 📂 路径：`packages/drawnix/src/components/dialog`
> 🏷️ 类型：**Generic Component**（模态对话框基座）

---

## 概览

对 `@floating-ui/react` 的模态封装：`useDialog`（状态与交互）、`Dialog`（Context Provider）、`DialogTrigger`、`DialogContent`（遮罩 + 居中层）、`DialogClose`。

它是 `CleanConfirm` 与 `TTDDialog` 的共同底座。

## 相关概念

- **惰性渲染**：`DialogContent` 在 `floatingContext.open === false` 时直接 `return null`，因此对话框关闭会**卸载**内部组件并丢失其局部状态。TTD 对话框"关闭后输入被清空"就是这个机制导致的。
- **`container` 与遮罩范围**：`DialogContent` 接收 `container` 并传给 `FloatingOverlay`/portal，遮罩只覆盖画布容器而不是整个浏览器窗口。若改为 `document.body`，工具栏会被一起遮住。
- **焦点陷阱**：`FloatingFocusManager` 默认把焦点移入对话框并在关闭时归还；`autoFocus` 的元素优先。
- **`asChild` 触发器**：`DialogTrigger` 用 `cloneElement` 把 ref/props 合到子元素，避免多包一层 `<button>`。

## 测试用例覆盖

- [ ] 无单测
- [ ] 建议补充：关闭后子树卸载、`container` 生效、Esc 关闭

## 相关概念（Props）

- `DialogOptions`：`initialOpen`、`open`（受控）、`onOpenChange`。
- `DialogContent`：`container?: HTMLElement | null`、`className`、普通 div 属性。

## 渲染逻辑

```
useDialog(options)
 ├─ useFloating({open, onOpenChange})
 ├─ useClick / useDismiss / useRole
 └─ 返回 { open, setOpen, refs, context, labelId, descriptionId, ... }

Dialog      → DialogContext.Provider
DialogTrigger → asChild 时 cloneElement；否则 <button data-state>
DialogContent → open ? FloatingPortal(container) > FloatingOverlay > FloatingFocusManager > div : null
```

## 数据结构

- 无自有结构，直接使用 floating-ui 的 `context` / `refs`。

## API 和服务

- `useDialogContext()`：子组件获取上下文，`DialogContent` 之外的组件（如标题）可用它读 `setLabelId` 做无障碍关联。

## 文件结构

```
dialog/
├── dialog.tsx   # useDialog + Dialog/Trigger/Content/Close
└── dialog.scss
```

## 交互和事件

- 点遮罩 / Esc → `onOpenChange(false)`。调用方必须把该回调写回自己的状态，否则无法关闭。
- 打开时焦点进入第一个可聚焦元素；关闭后归还到触发前元素。

## 复用说明

```tsx
const [open, setOpen] = useState(false);
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent container={container}>...</DialogContent>
</Dialog>
```

## 依赖关系

- 上游：`@floating-ui/react`。
- 下游：`clean-confirm`、`ttd-dialog`。

## 关联文档

- [../AGENTS.md](../AGENTS.md)
- [../clean-confirm/AGENTS.md](../clean-confirm/AGENTS.md)
- [../ttd-dialog/AGENTS.md](../ttd-dialog/AGENTS.md)

## 技术栈

- `@floating-ui/react`（`FloatingOverlay`、`FloatingFocusManager`）


## 常见改动指引

| 需求 | 改动位置 |
| --- | --- |
| 改变遮罩范围 | `DialogContent` 的 `container` |
| 阻止点击外部关闭 | `useDialog` 的 `useDismiss` 选项 |
| 初始焦点 | `DialogContent` 内元素加 `autoFocus` |

## 易错点与约束

- `DialogContent` 在 `open=false` 时返回 `null`，关闭即卸载子树；依赖"关闭后保留输入"的实现需要把状态上提。
<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
