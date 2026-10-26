# popup-toolbar

> 📅 生成于：2026-10-27
> 📂 路径：`packages/drawnix/src/components/toolbar/popup-toolbar`
> 🏷️ 类型：**Business Component**（选中态属性浮层）

---

## 概览

选中元素时浮在选区上方的属性面板，负责**填充色、描边色、线条样式、字体色、字号、链接、箭头端点、更多选项**。它是全项目最"按元素类型分支"的组件：同一个按钮对矩形、连线、思维导图节点、纯文本的行为完全不同。

## 相关概念

- **元素类型分流**：`PlaitDrawElement.isDrawElement` / `isClosedDrawElement` / `isDrawElementsIncludeText`、`MindElement.isMindElement`。显示哪些按钮由这些判断组合决定，不是简单的"有选中就全显示"。
- **闭合图形才有填充**：`isClosedCustomGeometry` / `isClosedDrawElement`，连线与纯文本没有填充。
- **描边颜色的两套来源**：draw 元素用 `getStrokeColorByDrawElement`，思维导图用 `getStrokeColorByMindElement`——两者数据结构不同，不要混用。
- **白色特殊处理**：面板处于深色主题时，`isWhite(color)` 会把展示色取反，避免"白底白线看不见"；但写回时仍用原始值（`removeHexAlpha` 之后）。
- **定位**：`useFloating` + `offset/flip`，锚点是选区矩形经 `toHostPointFromViewBoxPoint` / `toScreenPointFromHostPoint` 转换后的位置；拖动或缩放时通过 `isDragging` / `isSelectionMoving` / `isMovingElements` 提前 return 避免抖动。

## 测试用例覆盖

- [x] 无本目录专属单测
- [x] 间接覆盖：`apps/web-e2e` 的冒烟用例只验证容器
- [ ] 建议补充：选中矩形后出现填充按钮、选中连线后不出现填充按钮

## 相关概念（状态与更新）

属性修改**不经过 appState**，直接调用 Plait transforms：

| 按钮 | 服务 | 说明 |
| --- | --- | --- |
| 填充 | `PropertyTransforms.setFillColor`（draw）/ Mind transforms | 透传当前透明度 |
| 描边 | `setStrokeColor` + `setStrokeStyle`（normal/dashed/dotted） | 样式与颜色分开存 |
| 字体色 | `setFontColor`（`getTextMarksByElement` 读取） | 只对含文本元素生效 |
| 字号 | `PopupFontSizeControl` | 步进与滑杆组合 |
| 链接 | `LinkEditor`（`@plait/text-plugins`） | 通过 `linkState` 打开 `LinkPopup` |
| 箭头端点 | `arrow-mark-button.tsx` | 只对 line 元素 |

## Props 定义

`PopupToolbar` 无 Props。子组件接收的是"当前元素 + 当前值 + 回调"三者，例如 `PopupFillButton({ element, currentFill, onFillChange })`（具体类型以源码为准）。

`PopupToolbar` 依赖 `useBoard()` 拿选区与视口，依赖 `useI18n()` 拿文案。

## 渲染逻辑

```
PopupToolbar
 ├─ useFloating(锚点 = 选区矩形)
 ├─ 若无选中 / 正在拖动 / 正在缩放 → return null
 ├─ 计算 currentFill / currentStroke / currentFontColor / currentStrokeStyle
 └─ Island(.popup-toolbar)
      ├─ [闭合图形] PopupFillButton
      ├─ [有描边]   PopupStrokeButton（含样式切换）
      ├─ [含文本]   PopupFontColorButton + PopupFontSizeControl
      ├─ [line]     ArrowMarkButton
      ├─ [可链接]   LinkButton → setLinkState({isEditing:true})
      └─ MoreOptionsButton（复制/删除等）
```

`useEffect` 里监听选区变化重算位置；浮层本身 `pointer-events` 需保持可点，因此它带 `ATTACHED_ELEMENT_CLASS_NAME` 防止被 board 吞事件。

## 数据结构

- `currentFill`：draw 元素取 `element.fill`，mind 元素取主题色；可能为 `NO_COLOR` 或含 alpha 的 hex。
- `currentStroke`：见上文两套 getter。
- `StrokeStyle`（`@plait/common`）：normal / dashed / dotted。
- 透明度与颜色互转使用 `utils/color.ts`：`applyOpacityToHex`、`hexAlphaToOpacity`、`removeHexAlpha`、`isFullyOpaque`。

## API 和服务

- `transforms/property.ts` 的 `setFillColorOpacity` 会先判断 `isClosedElement`，非闭合直接 return——这是"填充按钮点了没反应"的预期行为，不是 bug。

## 文件结构

```
popup-toolbar/
├── popup-toolbar.tsx       # 容器、定位、类型分流
├── popup-toolbar.scss
├── fill-button.tsx         # 填充色 + 色板
├── stroke-button.tsx       # 描边色 + 样式
├── font-color-button.tsx   # 字体颜色
├── font-size-control.tsx   # 字号步进/滑杆
├── link-button.tsx         # 打开链接编辑
├── arrow-mark-button.tsx   # 箭头端点样式
└── more-options-button.tsx # 更多操作
```

## 交互和事件

- 拖动选区时浮层会隐藏（避免跟随卡顿），松手后重新出现。
- 链接按钮只设置 `linkState.isEditing`，实际输入在 `components/popup/link-popup`，因此**两个目录要一起改**。

## 复用说明

- 新增属性按钮：在 `popup-toolbar.tsx` 里加分支（判断元素类型）→ 新建按钮组件 → 用 `transforms` 而非直接改元素字段。
- 注意透明度与颜色耦合：任何写颜色的地方都要保留 alpha，否则用户设置过的半透明会丢失。

## 依赖关系

- 上游：`transforms/property`、`utils/{color,property}`、`constants/color`、`components/{island,stack,color-picker,tool-button}`、`hooks/use-drawnix`。
- 下游：`drawnix.tsx` 渲染；`plugins/with-text-link` 提供 hover 态的 `linkState`。

## 关联文档

- [../AGENTS.md](../AGENTS.md)
- [../../popup/link-popup/AGENTS.md](../../popup/link-popup/AGENTS.md)
- [../../../transforms/AGENTS.md](../../../transforms/AGENTS.md)
- [../../../utils/AGENTS.md](../../../utils/AGENTS.md)

## 技术栈

- `@plait/core`（选区矩形、坐标转换）、`@plait/draw`、`@plait/mind`、`@plait/common`
- `@floating-ui/react`（`useFloating`）

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
