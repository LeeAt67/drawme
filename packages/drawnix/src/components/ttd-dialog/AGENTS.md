# ttd-dialog

> 📅 生成于：2026-10-27
> 📂 路径：`packages/drawnix/src/components/ttd-dialog`
> 🏷️ 类型：**Module**（Text-To-Diagram 对话框）

---

## 概览

`TTDDialog` 是"文本转图表"对话框集合，当前两个面板：**Mermaid → 流程图**、**Markdown → 思维导图**。每个面板是"左侧输入、右侧预览/输出、底部提交"的三栏结构。

触发入口是压缩包 `toolbar/extra-tools` 的两个菜单项，通过 `appState.openDialogType` 打开。

## 相关概念

- **可选转换库**：`@plait-board/mermaid-to-drawnix` 与 `@plait-board/markdown-to-drawnix` 通过 `useState` 持有 `{api, loaded, error}`，属于**懒加载**（用户输入后才解析/加载）。
- **`deferredText` 防抖**：两个面板都用延迟值做解析，避免每个按键都跑一次转换。改动时注意 `useEffect` 依赖里同时有 `deferredText` 与 `xxxLib`。
- **插入位置**：转换结果是元素数组，插入点沿用 Plait 的剪贴板插入（`board.insertFragment`），因此会出现在视口内而非固定坐标。
- **Mermaid 的非流程图类型**：`dialog.mermaid.otherTypes` 文案说明"其他类型将以图片呈现"——这是 Mermaid 库的降级行为，不是本项目转成位图。

## 测试用例覆盖

- [x] 无本目录专属单测
- [ ] 建议补充：输入非法 Mermaid 时 `TTDDialogOutput` 显示错误而非崩溃
- [ ] 转换正确性依赖上游 `@plait-board/*` 包，本项目不覆盖

## 相关概念（面板结构）

| 文件 | 作用 |
| --- | --- |
| `ttd-dialog.tsx` | 两个 `<Dialog>` 的开关，按 `openDialogType` 决定渲染哪个 |
| `mermaid-to-drawnix.tsx` | Mermaid 面板：输入 → 预览 → 提交插入 |
| `markdown-to-drawnix.tsx` | Markdown 面板：输入 → 预览 → 提交插入 |
| `ttd-dialog-input.tsx` | 多行输入 + 快捷键提交 |
| `ttd-dialog-output.tsx` | 预览容器，处理 loading / error / 空态 |
| `ttd-dialog-panel.tsx` / `ttd-dialog-panels.tsx` | 布局骨架（左右分栏） |
| `ttd-dialog-submit-shortcut.tsx` | `Cmd/Ctrl+Enter` 提交提示与绑定 |

## Props 定义

- `TTDDialog({ container })`：`container` 是 board 容器 DOM，传给 `DialogContent` 作为 portal 目标。
- 其余面板组件均无 Props，状态自持。


## 状态管理

每个面板持有三个局部状态：输入文本、延迟文本（防抖用）、转换结果 `{ api, loaded, error }`。对话框的可见性由 `appState.openDialogType` 控制；关闭即卸载，输入内容随之丢弃。

## 功能页面

不是页面，而是两个模态对话框：

- **Mermaid → 流程图**：适合流程、时序、系统结构。
- **Markdown → 思维导图**：适合层级与脑暴。
## 渲染逻辑

```
TTDDialog(container)
 ├─ Dialog(open = type===mermaid)  → DialogContent(.Dialog.ttd-dialog) → MermaidToDrawnix
 └─ Dialog(open = type===markdown) → DialogContent(.Dialog.ttd-dialog) → MarkdownToDrawnix
```

`onOpenChange` 关闭时把 `openDialogType` 置 `null`，因此"点遮罩关闭"和"点 X 关闭"走同一路径。

### 面板内部

1. 输入变化 → `setDeferredText`（延迟值）。
2. `useEffect([deferredText])` → 调用上游解析 API。
3. 成功：`setValue(elements)`；失败：`setError(message)`。
4. 提交：`board.insertFragment` 插入，然后关闭对话框（由调用方决定）。

## 数据结构

- `MermaidToDrawnixLibProps` / `MarkdownToDrawnixLibProps`：`{ api, loaded, error }`（组件内定义）。
- 输出：`PlaitElement[]`（Mermaid）或单个 `MindElement`（Markdown）。

## API 和服务

- `parseMermaidToDrawnix(text)`、`parseMarkdownToDrawnix(text)`（动态 import）。
- `board.insertFragment({ elements }, point, operationType)`。

## 模块结构

```
ttd-dialog/
├── ttd-dialog.tsx                 # 两个 Dialog 的开关
├── ttd-dialog.scss
├── ttd-dialog-panel.tsx           # 单栏布局
├── ttd-dialog-panels.tsx          # 左右分栏容器
├── ttd-dialog-input.tsx           # 输入区
├── ttd-dialog-output.tsx          # 预览/错误区
├── ttd-dialog-submit-shortcut.tsx # 提交快捷键提示
├── mermaid-to-drawnix.tsx/.scss   # Mermaid 面板
└── markdown-to-drawnix.tsx        # Markdown 面板
```

## 交互和事件

- 提交快捷键 `Cmd/Ctrl+Enter`（`ttd-dialog-submit-shortcut.tsx`）。
- 输入为空时提交按钮不可用；解析中显示 loading。
- 关闭对话框不会清空输入内容（组件随 `Dialog` 卸载时才重置）。

## 复用说明

- 新增一种转换（如 PlantUML）：复制 `mermaid-to-drawnix.tsx` 为新面板 → `DialogType` 加枚举 → `ttd-dialog.tsx` 加分支 → `extra-tools/menu-items.tsx` 加入口。

## 依赖关系

- 上游：`components/dialog`、`hooks/use-drawnix`（`DialogType`）、`i18n`、`@drawme/react-board`。
- 下游：`drawnix.tsx` 渲染；`toolbar/extra-tools` 打开。

## 关联文档

- [../AGENTS.md](../AGENTS.md)
- [../dialog/AGENTS.md](../dialog/AGENTS.md) — Dialog 基座
- [../toolbar/extra-tools/AGENTS.md](../toolbar/extra-tools/AGENTS.md) — 入口
- [../../../agent/AGENTS.md](../../../agent/AGENTS.md) — 另一条"文本转图表"链路（Agent）

## 技术栈

- `@plait-board/mermaid-to-drawnix`、`@plait-board/markdown-to-drawnix`
- `@floating-ui/react`（经 `components/dialog`）

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
