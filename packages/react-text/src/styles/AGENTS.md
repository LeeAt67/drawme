# react-text/src/styles

> 📅 生成于：2026-10-27
> 📂 路径：`packages/react-text/src/styles`
> 🏷️ 类型：**Module**（可编辑区样式）

---

## 概览

只做两件事：让文本 foreignObject 可滚动但隐藏滚动条，以及定义 `.plait-text-container` 的字体与行高基准。

## 相关概念

- **隐藏滚动条而非禁用滚动**：`overflow-y: auto` + `scrollbar-width: none` + `::-webkit-scrollbar { display:none }`。文本超出节点高度时仍可滚动，只是不显示滚动条。
- **`font-size: 14px` / `line-height: 20px` / `min-height: 20px`**：这三个值是 Plait 计算文本框尺寸的基准。改动会让所有既有元素的文本溢出或留白，属于**全局视觉变更**。
- **字体栈与宿主一致**：与 `apps/web/src/styles.scss`、`packages/drawnix/src/styles/index.scss` 保持同一顺序，保证导出图片与界面显示一致。
- **作用域**：外层选择器是 `.plait-board-container`，因此这些样式只在 board 内生效，不影响工具栏浮层。

## 测试用例覆盖

- [ ] 无样式测试
- [ ] 建议人工核对：长文本滚动、不同字号下的行高、导出图片文本对齐

## 相关概念（关键选择器）

| 选择器 | 作用 |
| --- | --- |
| `.plait-board-container .text foreignObject` | 可滚动容器（隐藏滚动条） |
| `.plait-text-container` | 文本基准：字号、行高、字体栈 |

## Props 定义

非组件。


## 状态管理

无。

## 功能页面

无。
## 渲染逻辑

无。

## 数据结构

无。

## API 和服务

无。

## 模块结构

```
styles/
└── index.scss
```

## 交互和事件

无。

## 复用说明

- 修改字号/行高前先确认 `@plait/text-plugins` 的 `DEFAULT_FONT_SIZE` 与文本框高度计算，二者不一致会出现"编辑时与失焦后布局跳动"。

## 依赖关系

- 上游：无第三方样式。
- 下游：`../text.tsx`（`import './styles/index.scss'`）。

## 关联文档

- [../AGENTS.md](../AGENTS.md)
- [../../../drawnix/src/styles/AGENTS.md](../../../drawnix/src/styles/AGENTS.md) — 全局字体与主题

## 技术栈

- SCSS


## 常见改动指引

| 需求 | 改动位置 |
| --- | --- |
| 调整文本基准字号 | `.plait-text-container` 的 `font-size`（同时核对 Plait 的 `DEFAULT_FONT_SIZE`） |
| 隐藏滚动条 | `foreignObject` 的滚动条规则 |
| 支持新字体 | 字体栈（需与宿主一致） |

## 易错点与约束

- 只改本文件的 `font-size` 而不同步 `@plait/text-plugins` 的默认字号，会出现编辑态与展示态布局不一致。

## 变更检查清单

- [ ] 字号/行高是否与 `@plait/text-plugins` 的默认值一致。
- [ ] 滚动条隐藏是否影响可访问性（键盘仍可滚动）。
<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
