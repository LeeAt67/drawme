# freehand

> 📅 生成于：2026-10-27
> 📂 路径：`packages/drawnix/src/plugins/freehand`
> 🏷️ 类型：**Module**（自由绘制内核）

---

## 概览

自由绘制是本项目自研能力（不在 `@plait/draw` 内）：定义 `Freehand` 元素类型、创建/擦除/选择三段交互、路径平滑与生成、主题配色与笔刷预设。

共 13 个文件，是本仓库最"算法密集"的目录：`freehand.generator.ts`（把点序列变成 SVG path）、`smoother.ts`（平滑与压感）。

## 相关概念

- **元素类型 `Freehand`**：`type: 'freehand'`，`points: Point[]` + 绘制选项（颜色/粗细）。`Freehand.isFreehand` 是类型守卫，所有 board 方法的覆盖都以它开头分流。
- **三段式插件组合**：`withFreehand` 只做"方法分流"，真正交互在
  - `with-freehand-create.ts`（落笔 → 采点 → 生成临时元素 → 完成提交）
  - `with-freehand-erase.ts`（橡皮：命中即把元素 `opacity` 设 0.2 并记入待删集合，**抬笔才真正删除**）
  - `with-freehand-fragment.ts`（复制/粘贴/剪切时处理 freehand 元素）
- **擦除的"预标记"**：拖动过程中只改透明度不删元素，`deleteMarkedElements()` 在 `complete()` 里一次性 `CoreTransforms.removeElements`。这保证了单次撤销能整体回滚。
- **`LaserPointer`**：橡皮模式下用激光笔轨迹做视觉提示（`utils/laser-pointer.ts`），`destroy()` 必须在完成/取消时调用，否则 canvas 残留。
- **平滑参数固定**：`FreehandSmoother({ smoothing: 0.7, pressureSensitivity: 0.6 })`，改这两个值会明显改变手感。
- **两指模式**：create/erase 都检查 `isTwoFingerMode(board)`（来自 `@drawme/react-board`）以避让双指缩放。

## 测试用例覆盖

- [x] `freehand.component.spec.ts` — 组件渲染
- [x] `pointer-button.spec.ts` — 指针相关（`utils` 中的命中判断）
- [x] `utils.spec.ts` — `getFreehandDrawOptions`、`resolveFreehandDrawOptions` 的规范化
- [ ] `freehand.generator.ts`（path 生成）、`smoother.ts`（平滑算法）无单测
- [ ] 擦除的"预标记 → 批量删除"无单测（可测 `elementsToDelete` 行为需暴露内部状态）

## 相关概念（数据结构）

- `FreehandShape` 枚举：`eraser`、`nibPen`、`feltTipPen` 等（以 `type.ts` 为准）。工具栏只用其中部分。
- `FreehandDrawOptions`：`{ strokeColor?, strokeWidth }`，`strokeWidth` 必填，`strokeColor` 缺省时沿用主题默认色。
- `FreehandThemeColors`：每个 `ThemeColorMode` 对应一种描边色，深色主题下为白色。
- `DEFAULT_FREEHAND_PRESETS`：3 套预设（默认细笔、红色 6px、绿色 10px），由 `CLASSIC_COLORS` 的 `color.red`/`color.green` 取名。

## Props 定义

非组件（除 `freehand.component.ts`）：

- `FreehandComponent`：由 `board.drawElement` 返回，渲染 `Freehand` 元素。
- 其余均为 `(board) => board` 插件。


## 状态管理

不使用 React 状态。绘制过程中的临时数据（`isDrawing`、`points`、`temporaryElement`、`elementsToDelete`）都是插件闭包变量，随插件实例（一个 board）存活。笔刷样式来自 `board.appState.toolState`（`activeFreehandPresetIndex` + `freehandPresets`）。

## 功能页面

无页面。用户可见入口是创建栏的画笔按钮与 `freehand-panel` 面板。
## 渲染逻辑

### 创建流程（with-freehand-create）

```
pointerDown (isMainPointer + isDrawingMode)
 ├─ 记录 originScreenPoint、初始化 points
 ├─ 创建 temporaryElement（Freehand）并加入 board
 └─ 开始采样

pointerMove
 ├─ 坐标转 viewBox（toHostPoint + toViewBoxPoint）
 ├─ smoother.push(point) → 平滑点
 └─ generator 更新 path（节流）

pointerUp / globalPointerUp
 ├─ 若点太少 → 丢弃临时元素
 ├─ 否则提交（写入 points 与 drawOptions）
 └─ 处理"首尾吸附"（isSnappingStartAndEnd）
```

### 擦除流程（with-freehand-erase）

```
pointerDown(eraser) → isErasing = true; laserPointer.start()
pointerMove → checkAndMarkFreehandElementsForDeletion(viewBoxPoint)
             命中元素 opacity=0.2 且加入 elementsToDelete
pointerUp → complete(): removeElements(待删) + 清空集合 + destroy 激光笔
```

## 数据结构

- `Freehand`（`type.ts`）：继承 `PlaitCustomGeometry`，`points: Point[]`，`shape` 为 `FreehandShape`。
- `FreehandGenerator`：内部持有路径缓存，按点生成 `d` 属性（细节以实现为准）。
- `FreehandSmoother`：滑动窗口平滑 + 压感权重。

## API 和服务

- `getFreehandDrawOptions(board)`：读取当前激活预设（`activeFreehandPresetIndex` + `freehandPresets`）。
- `resolveFreehandDrawOptions(partial)`：把缺省字段补齐并做范围收敛（粗细限制在 MIN/MAX 之间）。
- `createFreehandElement(shape, points, options)`：构造元素。
- `isHitFreehand` / `isRectangleHitFreehand`：命中检测（橡皮与框选共用）。

## 模块结构

```
freehand/
├── type.ts                    # Freehand 元素、FreehandShape、主题色
├── presets.ts                 # 粗细常量、DEFAULT_FREEHAND_PRESETS、解析函数
├── with-freehand.ts           # board 方法分流（入口）
├── with-freehand-create.ts    # 落笔/移动/抬笔
├── with-freehand-erase.ts     # 橡皮
├── with-freehand-fragment.ts  # 复制粘贴
├── freehand.component.ts      # 渲染组件
├── freehand.generator.ts      # path 生成
├── smoother.ts                # 平滑 + 压感
├── utils.ts / utils.spec.ts   # 命中、选项解析
├── presets.ts
└── *.spec.ts
```

## 交互和事件

- 触摸：`touchStart` 中若指针为橡皮则走擦除，否则交给创建逻辑。
- 抬笔时若首尾距离小于阈值会"吸附"闭合（`isSnappingStartAndEnd`），实现"画圆自动闭合"的手感。
- 橡皮只在 freehand 元素间生效，不影响 draw/mind 元素。

## 复用说明

- 新增笔型：`FreehandShape` 加枚举 → `constants/freehand.ts` 的 `FREEHANDS` 加项（图标+标题）→ 若需新渲染参数，在 `getFreehandDrawOptions` 中按 pointer 分流。
- 调整手感：优先改 `smoother` 参数，而不是在 `generator` 里加魔法数。

## 依赖关系

- 上游：`@plait/core`、`@plait/common`（`isDrawingMode`）、`@plait/draw`（`WithDrawPluginKey`）、`utils/laser-pointer`、`constants/color`、`@drawme/react-board`（`isTwoFingerMode`）。
- 下游：`plugins/with-freehand`（已在 `drawnix.tsx` 装配）、`components/toolbar/freehand-panel`、`hooks/use-drawnix`（预设）。

## 关联文档

- [../AGENTS.md](../AGENTS.md)
- [../../components/toolbar/freehand-panel/AGENTS.md](../../components/toolbar/freehand-panel/AGENTS.md)
- [../../hooks/AGENTS.md](../../hooks/AGENTS.md) — `freehandPresets` 状态
- [../../constants/AGENTS.md](../../constants/AGENTS.md)

## 技术栈

- `@plait/core` 插件与 Transforms、Pointer/Touch Events

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
