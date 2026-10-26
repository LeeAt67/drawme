# plugins/components

> 📅 生成于：2026-10-27
> 📂 路径：`packages/drawnix/src/plugins/components`
> 🏷️ 类型：**Generic Component**（插件专用 React 渲染件）

---

## 概览

只给插件用的两个极小 React 组件，通过 `createRoot` 挂载到 Plait 提供的 DOM 容器里：

- `Image`：画布中的图片渲染（`<img>` + 焦点类名）。
- `Emoji`：思维导图节点的 emoji 渲染（`<span>` + 字号）。

它们不参与应用状态，只把 Plait 的 props 转成 DOM。

## 相关概念

- **为什么不用普通组件树**：图片与 emoji 由 Plait 直接管理 DOM（SVG/foreignObject 内部），只能通过 `renderImage` / `renderEmoji` 回调注入 React root。因此这两个组件是"React 在 Plait DOM 里的孤岛"。
- **`props.isFocus` 驱动样式**：`image-origin--focus` 用于让聚焦图片有视觉反馈（`with-image` 的点击放大依赖"聚焦"判断）。
- **`draggable: false`**：避免浏览器原生图片拖拽与画布拖拽冲突，删掉会导致拖动图片时出现"幽灵图"。
- **emoji 字号由 Plait 传入**：`fontSize` 必须用内联样式，写死在 SCSS 里会被 Plait 的缩放计算覆盖。

## 测试用例覆盖

- [ ] 无单测
- [ ] 建议补充：`Image` 是否正确带 `image-origin--focus`；`Emoji` 字号内联

## Props 定义

- `Image`：`ImageProps`（`@plait/common`），使用其中的 `imageItem.url` 与 `isFocus`。
- `Emoji`：`EmojiProps`（`@plait/mind`），使用 `fontSize` 与 `emojiItem.name`。

## 渲染逻辑

```
Image(props) → div(display:flex) > img[src=imageItem.url, width=100%, draggable=false,
                                        class=image-origin (+--focus)]
Emoji(props) → span.mind-node-emoji[style.fontSize] > emojiItem.name
```

## 数据结构

直接使用上游 props 类型，不新增结构。

## API 和服务

- 无。挂载/卸载由 `with-common.tsx` / `with-mind-extend.tsx` 的 `RenderComponentRef` 负责（`destroy` 里延迟 `root.unmount()`）。

## 文件结构

```
components/
├── image.tsx   # 画布图片
└── emoji.tsx   # 思维导图 emoji
```

## 交互和事件

- 无自有事件。点击行为在 `with-image.tsx` 的 `pointerUp` 里通过命中检测实现。

## 复用说明

- 新增"画布内自定义渲染"（如自定义图标节点）时，按同样模式：组件 + 在对应插件的 `renderXxx` 中 `createRoot`。
- 注意组件内**不要**用 `useDrawnix()`，这些 root 在 Provider 之外。

## 依赖关系

- 上游：`@plait/common`、`@plait/mind` 的类型；`classnames`。
- 下游：`plugins/with-common.tsx`（Image）、`plugins/with-mind-extend.tsx`（Emoji）。

## 关联文档

- [../AGENTS.md](../AGENTS.md)
- [../../../styles/AGENTS.md](../../../styles/AGENTS.md) — `.image-origin`、`.mind-node-emoji` 样式

## 技术栈

- React 19（被 `createRoot` 直接挂载）


## 常见改动指引

| 需求 | 改动位置 |
| --- | --- |
| 图片焦点态样式 | `image.tsx` 的 `image-origin--focus` + 全局 scss |
| emoji 渲染方式 | `emoji.tsx` + `with-mind-extend.tsx` 的 `renderEmoji` |
| 新增画布内 React 渲染件 | 本目录新建组件 + 对应插件的 `renderXxx` |

## 易错点与约束

- 这两个组件运行在 React 主树之外，不能用 Context（包括 i18n 与 DrawnixContext）。
- 卸载必须延迟到下一个宏任务，否则 React 会警告"在渲染期间卸载 root"。

## 变更检查清单

- [ ] 组件是否误用了 Context。
- [ ] 卸载是否延迟到宏任务。
<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
