# react-board/src/styles

> 📅 生成于：2026-10-27
> 📂 路径：`packages/react-board/src/styles`
> 🏷️ 类型：**Module**（board 宿主样式）

---

## 概览

定义 `.plait-board-container` 及其内部结构的布局与光标行为。被 `board.tsx` 直接 `import './styles/index.scss'`。

## 相关概念

- **容器必须有确定高度**：`.plait-board-container { width/height: 100% }`，父级高度为 0 时画布不可见。宿主通过 `html/body/.drawnix { height: 100% }` 保障。
- **`.disabled-scroll` 类**：当 `options.disabledScrollOnNonFocus` 为真且 board 未聚焦时，`.viewport-container` 变为 `overflow: hidden`，用于"点击画布才允许滚动"的嵌入场景。本项目的 `Drawnix` 把该选项设为 `false`，因此通常不会出现。
- **`.board-active-svg` 的 `pointer-events: none`**：交互层只做绘制、不接收事件，事件全部落在 `.board-host-svg` / `.viewport-container`。改成 `auto` 会导致命中检测错乱。
- **浏览器类名前缀**：`.firefox` 下 `user-select: none`（避免拖拽选中文本），`.safari` 相关修正在 `.plait-text-container` 上。
- **光标由 `pointer-{type}` 类驱动**：`pointer-selection`、`crosshair`、`ns-resize` 等；类名由 `board.tsx` 生成。新增工具时若要自定义光标，需在这里补类。

## 测试用例覆盖

- [ ] 无样式测试
- [ ] 建议人工核对：Safari 文本编辑、Firefox 拖拽选中、`disabled-scroll` 行为

## 相关概念（关键选择器）

| 选择器 | 作用 |
| --- | --- |
| `.plait-board-container` | 最外层，`position: relative`、`overflow: hidden` |
| `.viewport-container` | 实际滚动容器（`overflow: auto`） |
| `.board-host-svg` | 元素渲染 SVG（4 个 g 层） |
| `.board-active-svg` | 交互层（`pointer-events: none`） |
| `.plait-text-container` | 文本 foreignObject 容器（Safari 修正） |
| `.plait-toolbar` | Plait 内置浮动工具条（`z-index: 100`） |

## Props 定义

非组件。


## 状态管理

无 JS 状态，由类名驱动：`.pointer-{type}`、`.element-moving`、`.element-rotating`、`.disabled-scroll`、`.firefox`。

## 功能页面

无。
## 渲染逻辑

无（纯样式）。

## 数据结构

无。

## API 和服务

- `mixins.scss`：`board-background-color()` 由主题变量生成背景。

## 模块结构

```
styles/
├── index.scss
└── mixins.scss   # board-background-color 等
```

## 交互和事件

无。

## 复用说明

- 自定义宿主外观（圆角、背景）应外层包裹，不要改 `.plait-board-container` 的尺寸规则。

## 依赖关系

- 上游：`mixins.scss`（依赖 `@plait` 主题变量）。
- 下游：`board.tsx`。

## 关联文档

- [../AGENTS.md](../AGENTS.md)
- [../../drawnix/src/styles/AGENTS.md](../../drawnix/src/styles/AGENTS.md) — 上层主题与工具栏定位

## 技术栈

- SCSS


## 常见改动指引

| 需求 | 改动位置 |
| --- | --- |
| 自定义画布背景 | `mixins.scss` 的 `board-background-color()` |
| 新增光标状态 | `.pointer-{type}` 类 + `board.tsx` 的类名生成 |
| 关闭非聚焦滚动 | 选项 `disabledScrollOnNonFocus`（样式已支持） |

## 易错点与约束

- 不要给 `.board-active-svg` 加 `pointer-events: auto`。
- 不要改 `.plait-board-container` 的 `height: 100%`，否则画布高度为 0。
<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
