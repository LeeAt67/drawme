# components

> 📅 生成于：2026-10-27
> 📂 路径：`packages/drawnix/src/components`
> 🏷️ 类型：**Module**（UI 组件与工具栏）

---

## 概览

所有可见 UI 都在这里，分四类：

1. **布局气泡**：`Island`（带阴影圆角的容器）、`Stack`（横/竖 flex）。
2. **交互控件**：`ToolButton`、`RadioGroup`、`SizeSlider`、`Select`、`Menu`、`Popover`、`Dialog`、`ColorPicker`。
3. **工具栏**：`toolbar/`（创建栏、应用栏、缩放、主题、铅笔、选中浮层）。
4. **业务浮层**：`ttd-dialog/`（Mermaid/Markdown 转换）、`clean-confirm/`、`popup/link-popup/`、`toast/`、`tutorial`。

`icons.tsx`（655 行）承载全部 SVG 图标，是最大的单文件，也是"新增图标"的唯一入口。

## 相关概念

- **`ToolButton` 的 4 种形态**：`type="button" | "submit" | "icon" | "radio"`。`icon` 渲染 `<button>`，支持 `selected`（用于开关型按钮如 Agent）；`radio` 渲染 `<label>+<input type=radio>`，选中态由原生 `:checked` + `check` 类驱动。**选错 type 会导致选中态样式失效**。
- **`ATTACHED_ELEMENT_CLASS_NAME`**：Plait 提供的类名，挂在浮层上用于让 board 的事件系统识别"这是画布附属元素"，从而避免点击工具栏时被当作画布点击。所有 toolbar 的 `Island` 都带它。
- **`FloatingPortal` 与 `container`**：`Popover`/`Dialog`/`Toast` 都把 `container` 传给 `FloatingPortal`，指向 board 容器，保证浮层在画布容器内定位（避免全屏遮罩/滚动错位）。
- **i18n 全覆盖**：除了 `icons.tsx`，所有文案都走 `useI18n()`。新增组件时先加 `Translations` 键。

## 测试用例覆盖

- [x] `toast/toast.spec.tsx` — 提示的显示/自动关闭
- [x] `toolbar/freehand-panel/freehand-style-preset-item.spec.tsx` — 预设项渲染
- [ ] `ToolButton`、`Menu`、`Popover`、`Dialog`、`Select`、`ColorPicker` 无单测

## 相关概念（复用规则）

- 需要"带阴影的浮起容器"→ 用 `Island`，不要自己写 box-shadow。
- 需要"水平排布按钮"→ 用 `Stack.Row gap={1}`。
- 需要"图标按钮"→ 用 `ToolButton type="icon"`，标题通过 `title` + `aria-label` 同时给（无障碍与 tooltip）。
- 需要"弹出菜单"→ `Popover + PopoverContent + Menu`，`PopoverContent` 必须传 `container={PlaitBoard.getBoardContainer(board)}`。


## 状态管理

组件层几乎无状态，状态都来自三个 Context：

- `useDrawnix()`：面板开关、工具态、偏好等应用态。
- `useBoard()`：board 实例与容器 DOM（浮层定位依赖它）。
- `useI18n()`：语言与文案。

局部状态只出现在浮层开合这类纯 UI 场景（如 `Popover` 的 `open`、`PopupToolbar` 的浮层位置）。判断标准：状态若需要在刷新后恢复或影响画布，必须进 `appState`；否则留在组件内。
## 渲染逻辑

### 浮层的定位策略

- `Popover`：`@floating-ui/react` 的 `usePopover`，`offset(sideOffset||4)` + `flip` + `shift(padding:5)`，`useClick` 在受控模式下禁用（`enabled: controlledOpen == null`），所以受控组件必须自己处理点击开关。
- `Dialog`：`FloatingOverlay` + `FloatingFocusManager`，`modal` 语义由 `useDialog` 的 `modal` 选项控制。
- `Select`：组合 `useListNavigation` + `useTypeahead`，键盘可达。

### ToolButton 的加载态

`onClick` 返回值若为 Promise，会进入 `isLoading` 并禁用按钮，直到 resolve/reject；`AbortError` 被吞掉只打 `console.warn`。因此按钮点击处理器可以安全返回异步函数。

## 数据结构

- `ToolButtonBaseProps`（`tool-button.tsx`）：`icon`、`aria-label`（必填）、`selected`、`visible`、`hidden`、`disabled`、`onPointerDown/Up`。
- `DrawnixToastOptions`（`toast/toast.tsx`）：`message`、`description`、`type`、`duration`。
- 颜色/尺寸枚举来自 `constants/color.ts` 与 `constants/freehand.ts`。

## API 和服务

- `useToast()`：返回 `{ toast, showToast }`，同一时刻只保留一个提示（新的会清掉旧的 timer）。
- `useDialog()` / `usePopover()` / `useSelect()`：受控/非受控双模式 hook。

## 模块结构

```
components/
├── icons.tsx              # 全部图标（655 行，单文件偏大）
├── island.tsx/.scss       # 浮起容器
├── stack.tsx/.scss        # flex 布局
├── tool-button.tsx        # 4 种按钮形态
├── tool-icon.scss         # 按钮视觉状态（共享）
├── radio-group.tsx/.scss
├── size-slider.tsx/.scss
├── color-picker.tsx/.scss
├── shape-picker.tsx       # 形状面板（SHAPES）
├── arrow-picker.tsx       # 箭头面板（ARROWS）
├── arrow-mark-picker.tsx
├── tutorial.tsx/.scss     # 首次进入引导（绝对定位箭头）
├── clean-confirm/         # 清空画布二次确认
├── dialog/                # Floating UI 对话框基座
├── menu/                  # 菜单体系（详见子文档）
├── popover/               # 弹出层基座
├── popup/link-popup/      # 链接编辑浮层
├── select/                # 下拉选择
├── toast/                 # 轻提示
├── toolbar/               # 工具栏（详见子文档）
└── ttd-dialog/            # 文本转图表对话框
```

## 交互和事件

- 菜单项统一通过 `MenuContentPropsContext` 拿到父级 `onSelect`，选中子项时触发 `EVENT.MENU_ITEM_SELECT` 自定义事件冒泡，父 `Menu` 据此关闭。
- `Tutorial` 的箭头是纯 CSS `absolute` 定位，与工具栏实际位置**硬编码耦合**；调整工具栏布局后必须同步 `.feature-pointer.*` 的偏移。

## 复用说明

- 新增工具栏按钮：优先复用 `ToolButton` + `Island` + `Stack.Row`，并把文案加到 i18n。
- 新增浮层：`Popover`/`Dialog` 已处理焦点管理与 portal，不要另引第三方弹层库。

## 依赖关系

- 上游：`hooks/use-drawnix`、`i18n`、`constants`、`plugins/freehand`（类型与预设）、`utils/color`。
- 下游：`drawnix.tsx` 直接渲染 toolbar 与各浮层。

## 关联文档

- [toolbar/AGENTS.md](toolbar/AGENTS.md)
- [menu/AGENTS.md](menu/AGENTS.md)
- [ttd-dialog/AGENTS.md](ttd-dialog/AGENTS.md)
- [../styles/AGENTS.md](../styles/AGENTS.md) — 工具栏绝对定位与主题变量

## 技术栈

- React 19、`classnames`、`@floating-ui/react`
- SCSS（BEM，`components/*.scss` 与组件同目录）


## 功能页面

无路由页面。本目录提供的是"画布附属 UI"，其中工具栏与浮层的位置由 `styles/index.scss` 统一控制，组件自身只负责内容与交互。
<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
