# clean-confirm

> 📅 生成于：2026-10-27
> 📂 路径：`packages/drawnix/src/components/clean-confirm`
> 🏷️ 类型：**Business Component**（清空画布二次确认）

---

## 概览

"清除画布"的确认对话框。由 `appState.openCleanConfirm` 控制显隐，触发入口有三个：应用菜单的"清除画布"、`Ctrl/Cmd+Backspace`（或 `Cmd+Delete`）快捷键。

## 相关概念

- **共享状态而非事件总线**：快捷键（`plugins/with-hotkey.ts`）只设置 `openCleanConfirm = true`，对话框自己读该状态。因此新增入口只需改同一个布尔。
- **确认后如何清空**：`board.deleteFragment(board.children)` 一次性删除全部顶层元素，随后关闭对话框；**不会**清除宿主存档，宿主会在 `onChange` 中写入空内容——这意味着"清空"会持久化。
- **`autoFocus` 在确认按钮上**：回车即确认，是危险操作的有意取舍。

## 测试用例覆盖

- [x] 无单测
- [ ] 建议补充：快捷键打开确认框、取消不清空、确认后 `children.length === 0`

## 相关概念（国际化）

- 文案键：`cleanConfirm.title`、`cleanConfirm.description`、`cleanConfirm.cancel`、以及确认按钮对应键。新增语言时需同步。

## Props 定义

`CleanConfirm({ container })`：

- `container: HTMLElement | null` — 传给 `DialogContent` 的 portal 目标，`drawnix.tsx` 传 `containerRef.current`。

## 渲染逻辑

```
<Dialog open={appState.openCleanConfirm} onOpenChange={写回 appState}>
  <DialogContent className="clean-confirm" container={container}>
    <h2>{t('cleanConfirm.title')}</h2>
    <p>{t('cleanConfirm.description')}</p>
    <button 取消 → openCleanConfirm=false />
    <button autoFocus 确认 → 清空画布 + 关闭 />
  </DialogContent>
</Dialog>
```

## 数据结构

- 仅 `appState.openCleanConfirm: boolean`。

## API 和服务

- `useBoard()` 取 board 执行清空；`useDrawnix()` 读写开关；`useI18n()` 取文案。

## 文件结构

```
clean-confirm/
├── clean-confirm.tsx
└── clean-confirm.scss
```

## 交互和事件

- 遮罩点击 / Esc → `onOpenChange(false)` → 取消。
- 取消与确认都会把布尔置回 `false`，因此状态只有"打开/关闭"两态。

## 复用说明

- 其他危险操作（如删除全部选中）若需要确认，建议复用 `Dialog` 而不是复制本组件；本组件与"清空"语义绑定较深。

## 依赖关系

- 上游：`components/dialog`、`hooks/use-drawnix`、`i18n`、`@drawme/react-board`。
- 下游：`drawnix.tsx` 渲染；`plugins/with-hotkey.ts` 与 `app-toolbar/app-menu-items.tsx` 触发。

## 关联文档

- [../AGENTS.md](../AGENTS.md)
- [../dialog/AGENTS.md](../dialog/AGENTS.md)
- [../../plugins/AGENTS.md](../../plugins/AGENTS.md) — 快捷键触发

## 技术栈

- React 19、`@plait/core`


## 常见改动指引

| 需求 | 改动位置 |
| --- | --- |
| 改确认文案 | `i18n/translations/*` 的 `cleanConfirm.*` |
| 改清空范围（保留视口/主题） | 本文件确认按钮回调（当前只删元素） |
| 新增触发入口 | 设置 `appState.openCleanConfirm = true` 即可 |

## 易错点与约束

- `board.deleteFragment(board.children)` 只删顶层元素，分组内部元素随之移除，但 `viewport`/`theme` 保留。
- 确认按钮带 `autoFocus`，回车即清空；若改成危险操作，请重新评估该默认值。
<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
