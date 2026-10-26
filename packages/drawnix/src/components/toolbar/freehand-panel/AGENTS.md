# freehand-panel

> 📅 生成于：2026-10-27
> 📂 路径：`packages/drawnix/src/components/toolbar/freehand-panel`
> 🏷️ 类型：**Business Component**（画笔/橡皮面板）

---

## 概览

画笔工具的弹出面板：上方切换"笔 / 橡皮"等笔类型，下方展示 3 个可配置的笔刷预设（颜色 + 粗细）。它是 `creation-toolbar` 中 `PopupKey.freehand` 分支的内容。

## 相关概念

- **预设是"槽位"而非固定样式**：`FREEHAND_PRESET_IDS = ['preset-1','preset-2','preset-3']`，用户在弹层里改颜色/粗细时，写回的是 `appState.toolState.freehandPresets[index]`，因此**退出重进仍保留自定义样式**。
- **`activeFreehandPresetIndex`**：当前激活槽位。切换槽位不会立刻改画布指针，改的是"下次落笔使用哪套样式"。
- **双份默认值**：`constants/freehand.ts` 的 `FREEHANDS`（工具项：图标/pointer/标题）与 `plugins/freehand/presets.ts` 的 `DEFAULT_FREEHAND_PRESETS`（样式默认值）职责不同，不要合并。
- **受控组件**：面板不持有状态，全部通过 props 回调上抛给 `creation-toolbar`，后者再写 `appState`。

## 测试用例覆盖

- [x] `freehand-style-preset-item.spec.tsx` — 预设项渲染、选中态、颜色回调
- [ ] `FreehandPanel` 整体（切换工具、改预设）无单测
- [ ] 板端实际落笔效果由 `plugins/freehand` 的测试覆盖

## 相关概念（数据流）

```
FreehandPanel(props)                       useDrawnix
  onPresetSelect(i) ───────────────────▶ activeFreehandPresetIndex
  onStrokeColorSelect(i, color) ───────▶ freehandPresets[i].strokeColor
  onStrokeWidthSelect(i, width) ───────▶ freehandPresets[i].strokeWidth
  onPointerUp(pointer) ────────────────▶ toolState.pointer + lastFreehandPointer
```

`creation-toolbar` 内的 `updateFreehandSettings` 用不可变更新替换数组项，**不要直接 mutate** `freehandPresets[i]`，否则 React 不会重渲染。

## Props 定义

`FreehandPanel` 的 props 由 `creation-toolbar` 传入（类型以源码为准），关键字段：

- `freehandPresets`：当前 3 套样式。
- `activePresetIndex`：激活槽位。
- `onPresetSelect` / `onStrokeColorSelect` / `onStrokeWidthSelect`：样式变更回调。
- `onPointerUp(pointer)`：切换笔类型后回调，写入 pointer 与 `lastFreehandPointer`。

`FreehandStylePresetItem` 的 props：`preset`（`{id,color,size}`）、`selected`、`onSelect`、`onColorChange`、`onSizeChange`。

## 渲染逻辑

- 笔类型按钮由 `FREEHANDS` 渲染，点击直接 `BoardTransforms.updatePointerType`，因此**选中即生效**（不必等落笔）。
- 预设项是"颜色圆点 + 粗细线"的可点区域；选中项有高亮边框（`.freehand-style-preset-item--selected`）。
- `FreehandStyleDivider` 是纯装饰 `<span aria-hidden="true" />`，用于分隔"工具区"和"预设区"。
- 移动端不特殊处理，依赖外层 `.draw-toolbar` 的横向滚动。

## 数据结构

- `FreehandDrawOptions`：`{ strokeColor?: string; strokeWidth: number }`。注意 `strokeColor` 可缺省（沿用默认笔色），`strokeWidth` 必填。
- `FreehandToolItem`（`constants/freehand.ts`）：`{ pointer, icon, titleKey? }`。
- `FreehandStylePreset`（本目录）：`{ id: string; color?: string; size: number }`，是展示层对 `FreehandDrawOptions` 的投影。

## API 和服务

- 无服务调用。样式最终由 `plugins/freehand/utils.ts` 的 `getFreehandDrawOptions(board)` 读取并应用到新元素。

## 文件结构

```
freehand-panel/
├── freehand-panel.tsx                # 面板容器
├── freehand-style-preset-item.tsx    # 单个预设项
├── freehand-style-preset-item.scss
└── freehand-style-preset-item.spec.tsx
```

## 交互和事件

- 更改颜色会立即影响"下一次落笔"，不影响已画线条。
- 选择橡皮（`FreehandShape.eraser`）后，落笔变为擦除，退出条件见 `plugins/freehand/with-freehand-erase.ts`。

## 复用说明

- 想把预设数量从 3 改成更多：改 `FREEHAND_PRESET_IDS` 与 `DEFAULT_FREEHAND_PRESETS`，并确认 `mergeToolState` 对旧存档的数组长度做了兼容（它会原样保留用户存档中的数组，长度不足时可能越界，需补默认值）。

## 依赖关系

- 上游：`constants/freehand`、`plugins/freehand/{type,presets}`、`hooks/use-drawnix`、`i18n`、`island`、`stack`、`tool-button`。
- 下游：`creation-toolbar.tsx` 的 freehand 分支。

## 关联文档

- [../AGENTS.md](../AGENTS.md)
- [../../../plugins/freehand/AGENTS.md](../../../plugins/freehand/AGENTS.md) — 预设如何作用于绘制
- [../../../constants/AGENTS.md](../../../constants/AGENTS.md) — `FREEHANDS`

## 技术栈

- React 19、`@plait/core` `BoardTransforms`、`@plait/common` `setCreationMode`

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
