# extra-tools

> 📅 生成于：2026-10-27
> 📂 路径：`packages/drawnix/src/components/toolbar/extra-tools`
> 🏷️ 类型：**Business Component**（"更多工具"入口）

---

## 概览

创建栏末尾的"更多工具"按钮，当前提供两个入口：**Mermaid 转流程图**、**Markdown 转思维导图**。

它的本质是"打开一个全局对话框"：菜单项只设置 `appState.openDialogType`，真正的 UI 与转换逻辑在 `components/ttd-dialog/`。因此本目录代码极薄，**不要**把解析逻辑写进菜单项。

## 测试用例覆盖

- [x] E2E 间接覆盖：按钮存在于 `.draw-toolbar` 中（`aria-label="更多工具"`）
- [ ] 打开对话框、转换成功/失败无自动化用例
- [ ] 转换逻辑本身的测试在 `ttd-dialog` 依赖的 `@plait-board/*` 包内，本项目未覆盖

## 相关概念

- **`DialogType`**：`hooks/use-drawnix.tsx` 中的枚举，`mermaidToDrawnix` / `markdownToDrawnix`。它同时作为"当前打开哪个对话框"的唯一标识，值为 `null` 表示全部关闭。
- **菜单项命名兼容**：`data-testid` 仍是 `marmaid-to-drawnix-button`（原文拼写错误），若改掉会破坏可能存在的测试选择器。

## Props 定义

两个菜单项组件均无 Props。`ExtraToolsButton` 也声明为无参组件。

## 渲染逻辑

```
ExtraToolsButton
 └─ Popover(placement: bottom-start, sideOffset: 12)
     ├─ PopoverTrigger → ToolButton(type="icon", ExtraToolsIcon)
     └─ PopoverContent(container = board container)
         └─ Menu(onSelect=关闭)
             ├─ MermaidToDrawnixItem  → openDialogType = mermaidToDrawnix
             └─ MarkdownToDrawnixItem → openDialogType = markdownToDrawnix
```

`Popover` 是**受控**的（`open={appMenuOpen}` + `onOpenChange`），并且触发按钮用 `onPointerDown` 手动 toggle；这是为了与画布的指针事件共存，改成 `onClick` 会出现"点一下开、再点一下又开"的抖动。

## 数据结构

- 无本地数据结构，仅读写 `appState.openDialogType`。

## API 和服务

- 无网络请求；转换能力来自 `@plait-board/mermaid-to-drawnix` 与 `@plait-board/markdown-to-drawnix`，由 `ttd-dialog` 调用。

## 文件结构

```
extra-tools/
├── extra-tools-button.tsx  # Popover + "更多工具"按钮
└── menu-items.tsx          # Mermaid / Markdown 两个菜单项
```

## 交互和事件

- 选中后菜单关闭由父 `Menu` 的 `onSelect` 驱动；同时 `openDialogType` 变化会打开 `TTDDialog`，两者是并行发生的（菜单关闭动画与对话框打开同时进行）。
- 菜单项图标使用 `MermaidLogoIcon` / `MarkdownLogoIcon`（`components/icons.tsx`）。

## 复用说明

- 新增"更多工具"：在 `menu-items.tsx` 加一个 `MenuItem`，在 `hooks/use-drawnix.tsx` 的 `DialogType` 加枚举值，然后在 `ttd-dialog/ttd-dialog.tsx` 里加一个 `<Dialog>` 分支。三处缺一不可。

## 依赖关系

- 上游：`menu/*`、`icons`、`hooks/use-drawnix`、`i18n`、`popover`、`tool-button`。
- 下游：`creation-toolbar.tsx` 在 `key === 'extra-tools'` 分支渲染它；`ttd-dialog` 消费它写入的 `openDialogType`。

## 关联文档

- [../AGENTS.md](../AGENTS.md)
- [../../ttd-dialog/AGENTS.md](../../ttd-dialog/AGENTS.md) — 对话框与转换实现
- [../../../hooks/AGENTS.md](../../../hooks/AGENTS.md) — `DialogType`

## 技术栈

- `@floating-ui/react` Popover、`@plait/core` `getBoardContainer`


## 常见改动指引

| 需求 | 改动位置 |
| --- | --- |
| 新增转换类型 | `menu-items.tsx` + `hooks/use-drawnix.tsx` 的 `DialogType` + `ttd-dialog.tsx` 分支 |
| 改菜单顺序 | `extra-tools-button.tsx` 的 `<Menu>` 子节点顺序 |
| 改入口按钮图标/标题 | `extra-tools-button.tsx` 的 `ToolButton` |

## 易错点与约束

- 三处（菜单项、`DialogType`、对话框分支）缺一不可，漏掉对话框分支会表现为"点了没反应"。
- `data-testid="marmaid-to-drawnix-button"` 拼写错误是既有契约，改名需同步测试。

## 变更检查清单

- [ ] 新增入口是否同时补了 `DialogType` 与对话框分支。
- [ ] 菜单项是否仍通过父 `Menu` 的 `onSelect` 关闭。
<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
