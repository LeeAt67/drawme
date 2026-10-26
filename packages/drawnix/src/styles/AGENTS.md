# styles

> 📅 生成于：2026-10-27
> 📂 路径：`packages/drawnix/src/styles`
> 🏷️ 类型：**Module**（全局样式与主题变量）

---

## 概览

四个文件决定整个白板的外观：

- `index.scss`：聚合 Plait 样式 + 布局（各工具栏的绝对定位都在这里）。
- `theme.scss`：CSS 变量（颜色、间距、圆角、层级），全部挂在 `.drawnix` 下。
- `variables.scss`：SCSS mixin 与常量（`isMobile`、`toolbarButtonColorStates`、`outlineButtonStyles`）。
- `variables.module.scss`：把 SCSS 变量导出给 TS（`themeFilter`）。

## 相关概念

- **所有主题色都是 CSS 变量**：`--color-primary`、`--color-surface-*`、`--island-bg-color`、`--text-primary-color` 等。组件里写死 `#fff` 会在 6 套主题中失效——这是最常见的样式 bug。
- **深色主题靠类名**：`.drawnix.theme--dark`（由 `drawnix.tsx` 的 `theme--${themeColorMode}` 生成）。需要深色特例时用 `@at-root .drawnix.theme--dark#{&}`（见 `menu.scss`、`ttd-dialog.scss`），不要用 `prefers-color-scheme`。
- **`isMobile` mixin**：`@include isMobile { ... }` 会编译成 `.drawnix--mobile &{...}`，依赖 `drawnix.tsx` 的 `MobileDetect` 判断，而不是媒体查询。想改断点必须改 JS。
- **工具栏定位集中管理**：`.draw-toolbar`（顶部居中）、`.app-toolbar`（左上）、`.zoom-toolbar`（右上）、`.theme-toolbar`（右下）、`.pencil-mode-toolbar`。改位置只改这里，不要在组件内写 `position`。

## 测试用例覆盖

- [ ] 无样式自动化测试
- [ ] 视觉回归依赖人工；深色主题与新工具栏布局变更后建议手动核对 6 套主题

## 相关概念（关键变量）

| 变量 | 用途 |
| --- | --- |
| `--color-primary` / `--color-primary-darker` | 品牌蓝（`#6698ff`） |
| `--color-surface-high/mid/low/lowest` | 分层背景 |
| `--color-on-surface` / `--text-primary-color` | 主文本色 |
| `--island-bg-color` / `--island-border-color` / `--shadow-island` | 浮起容器 |
| `--space-factor` / `--dx-space-*` / `--dx-radius-*` | 间距与圆角刻度 |
| `--lg-button-size` / `--lg-icon-size` | 工具栏尺寸（大屏媒体查询会放大到 2.5rem/1.25rem） |
| `--theme-filter`（SCSS） | 通过 `variables.module.scss` 暴露给 TS |

## Props 定义

非组件。


## 状态管理

无 JS 状态；状态体现为类名：`.theme--{mode}`（主题）、`.pointer-{type}`（光标）、`.drawnix--mobile`（设备）、`.disabled-scroll`（滚动策略）。这些类名由组件生成，样式只负责响应。

## 功能页面

无。
## 渲染逻辑

```
index.scss
 ├─ @use @plait/draw/styles, @plait/mind/styles
 ├─ @use variables + theme
 └─ .drawnix { 高度、字体、工具栏定位、移动端适配 }
```

`.drawnix` 的 `height: 100%` 是硬约束：父容器必须有确定高度，否则画布高度为 0（宿主 `apps/web` 用 `html/body { height: 100% }` 保障）。

## 数据结构

无。

## API 和服务

- `variables.scss` 的 mixin：`isMobile`、`toolbarButtonColorStates`、`outlineButtonStyles`。新按钮想获得统一的 hover/active/checked/disabled 状态，直接 `@include toolbarButtonColorStates`。

## 模块结构

```
styles/
├── index.scss              # 聚合 + 布局 + toolbar 定位
├── theme.scss              # CSS 变量
├── variables.scss          # mixin 与 $theme-filter
└── variables.module.scss   # :export 给 TS
```

## 交互和事件

无（纯样式）。

## 复用说明

- 新增浮层：在 `index.scss` 的 `.drawnix` 下加 `.{name}-toolbar` 定位块，并复用 `isMobile` mixin。
- 新增颜色：先加到 `theme.scss` 的变量表，再在组件里 `var(--...)`。
- 深色特例：用 `.theme--dark` 选择器，不要复制整块样式。

## 依赖关系

- 上游：`node_modules/@plait/*/styles/styles.scss`。
- 下游：`drawnix.tsx` 通过 `import './styles/index.scss'` 引入；所有组件的 scss 都 `@use '../styles/variables.scss'` 取 mixin。

## 关联文档

- [../AGENTS.md](../AGENTS.md)
- [../components/toolbar/AGENTS.md](../components/toolbar/AGENTS.md) — 被定位的组件
- [../agent/AGENTS.md](../agent/AGENTS.md) — `.agent-panel` 自带独立样式（不在本目录）

## 技术栈

- SCSS（`@use`/`@forward`、mixin）、CSS 自定义属性

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
