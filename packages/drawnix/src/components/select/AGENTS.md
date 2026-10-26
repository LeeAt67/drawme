# select

> 📅 生成于：2026-10-27
> 📂 路径：`packages/drawnix/src/components/select`
> 🏷️ 类型：**Generic Component**（下拉选择）

---

## 概览

基于 `@floating-ui/react` 的可访问下拉选择器（`useSelect` + `Select` 组件），用于"从多个值里选一个"。与 `menu/` 的区别：`Select` 持有 `value` 概念，`Menu` 只执行动作。

当前唯一消费方是 `toolbar/popup-toolbar/font-size-control.tsx`（字号选择）。

## 相关概念

- **组合了三个 floating 交互**：`useListNavigation`（上下键）、`useTypeahead`（按键跳转）、`useClick/useDismiss`。三者缺一会破坏键盘可达性。
- **`FloatingList` + `useListItem`**：项列表由 `FloatingList` 统一管理索引，因此**选项组件必须包在 `FloatingList` 内**，否则上下键定位错乱。
- **受控值**：`Select` 的 `value` 由调用方提供，选中后通过 `onChange` 上抛，自身不存值。

## 测试用例覆盖

- [ ] 无单测
- [ ] 建议补充：键盘上下选择、typeahead 首字母跳转、选中后 `onChange` 值正确

## 相关概念（与原生 `<select>` 的选择）

- `ThemeToolbar` 用的是**原生** `<select>`（6 个固定主题，无需自定义样式）。
- 本组件用于需要自定义外观的场景。两者并存是有意的，不要统一。

## Props 定义

`Select`（以源码为准）：

- `value: string`、`onChange(value: string)`、`children`（选项）、`className`、`placement`。
- 选项通过 `SelectItem`（或等价子组件）声明 `value` 与展示内容。

## 渲染逻辑

```
useSelect({value, onChange})
 ├─ useFloating + offset/shift/flip
 ├─ FloatingList
 ├─ useTypeahead(listContent)
 └─ 返回 { open, setOpen, refs, styles, getItemProps, ... }

Select
 ├─ Trigger：显示当前 value + ChevronDownIcon
 └─ Popup：FloatingFocusManager + 选项列表（ThickCheckIcon 标记选中）
```

## 数据结构

- `SelectValueType = string`：值必须是字符串（或可转字符串），不支持对象值；需要对象语义时用 `value + onChange` 自行映射。

## API 和服务

- 无服务调用。

## 文件结构

```
select/
├── select.tsx   # useSelect + Select 组件 + 选项
└── select.scss  # 触发器、弹层、选中态样式
```

## 交互和事件

- 点击 trigger 开关；Esc 关闭；上下键移动高亮；Enter 选中；输入字母触发 typeahead。
- 关闭后焦点回到 trigger（`FloatingFocusManager` 默认行为）。

## 复用说明

- 简单枚举选择（主题、语言）优先用 `Menu` 或原生 `<select>`；需要"显示当前值 + 自定义样式"时再用本组件。

## 依赖关系

- 上游：`icons`（`ChevronDownIcon`、`ThickCheckIcon`）。
- 下游：`toolbar/popup-toolbar/font-size-control.tsx`（字号）。

## 关联文档

- [../AGENTS.md](../AGENTS.md)
- [../menu/AGENTS.md](../menu/AGENTS.md) — 命令菜单
- [../popover/AGENTS.md](../popover/AGENTS.md) — 通用弹层

## 技术栈

- `@floating-ui/react`（`FloatingList`、`useListNavigation`、`useTypeahead`）


## 易错点与约束

- 选项必须位于 `FloatingList` 内，否则上下键索引错位。
- 值为空字符串时触发器会显示为空，需在调用方用 `placeholder` 兜底。

## 变更检查清单

- [ ] 选项是否都在 `FloatingList` 内。
- [ ] 是否保留键盘可达性（上下键 + typeahead）。
<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
