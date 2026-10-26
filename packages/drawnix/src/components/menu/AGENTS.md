# menu

> 📅 生成于：2026-10-27
> 📂 路径：`packages/drawnix/src/components/menu`
> 🏷️ 类型：**Module**（菜单体系）

---

## 概览

一套不依赖第三方菜单库的轻量菜单：`Menu` 容器 + 多种 `MenuItem` 变体 + `MenuSeparator`。所有弹出菜单（应用菜单、缩放菜单、语言子菜单、更多工具）都基于它。

## 相关概念

- **`MenuContentPropsContext`**：`Menu` 向下提供 `onSelect`，任意层级 `MenuItem` 被选中时都能冒泡关闭。这是嵌套子菜单能正常关闭的机制。
- **两级关闭协议**：`MenuItem` 内部触发 `EVENT.MENU_ITEM_SELECT` 自定义事件；子菜单（如语言、导出图片）里手动 `menuContentProps.onSelect?.(itemSelectEvent)` 把事件"抬"给外层。**新增子菜单必须复制这段逻辑**，否则选中后菜单不关。
- **`MenuItem` 与 `MenuItemLink` 的区别**：前者是按钮语义（`role="menuitem"`），后者渲染 `<a>`（外链）；本项目已移除 GitHub 外链，`menu-item-link.tsx` 目前没有调用方。
- **开关型菜单项**：`MenuItemContentSwitch` + `role="menuitemcheckbox"` + `aria-checked`，用于"透明背景"这类布尔设置。

## 测试用例覆盖

- [x] 无本目录专属单测
- [ ] 建议补充：`Menu` 选中子项后 `onSelect` 被调用、子菜单选中后外层关闭
- [ ] 无障碍：`role="menu"/"menuitem"` 与键盘导航未覆盖

## 相关概念（与 `Select` 的区别）

- `menu/` 是"点击后执行动作"的命令菜单（无选中值）。
- `components/select/` 是"点击后选一个值"的下拉（有 `value`），使用时不要互换。

## Props 定义

`Menu`：

- `children`、`className`、`style`、`containerStyle`
- `onSelect?: (event: Event) => void` — 任意子项被选中时触发。

`MenuItem`（以源码为准）：`icon`、`aria-label`、`shortcut`、`submenu`、`data-testid`、`onSelect`、`role`。


## 状态管理

菜单是无状态的：`open` 由外层 `Popover` 控制，选中结果通过 `onSelect` 事件上抛。唯一的隐式状态是 `MenuContentPropsContext` 中的 `onSelect` 引用，它决定子项被点击后由谁负责关闭菜单。

## 功能页面

不是页面，而是可被任意浮层复用的菜单骨架。现有使用点：应用菜单、缩放菜单、语言子菜单、导出图片子菜单、更多工具菜单。
## 渲染逻辑

```
Menu (Provider onSelect)
 └─ Island(.menu-container, padding=2)
     ├─ MenuItem        → button[role=menuitem]   (+可选 shortcut / submenu)
     ├─ MenuItemContentSwitch → 带开关的 menuitemcheckbox
     ├─ MenuItemContentRadio  → 单选组
     ├─ MenuItemCustom        → 自定义内容
     ├─ MenuItemGroup         → 分组标题
     └─ MenuSeparator         → 分隔线
```

`Menu` 外层是普通 `div.menu`，内层是 `Island`，所以菜单自带阴影圆角；`containerStyle` 只作用于 `Island`。

## 数据结构

- `MenuContentProps`（`common.ts`）：`{ onSelect?: (event: Event) => void }`。
- `EVENT.MENU_ITEM_SELECT = 'menu.itemSelect'`（`constants.ts`）。

## API 和服务

- 无服务。菜单项的动作全部由调用方注入（打开文件、导出、切换语言…）。

## 模块结构

```
menu/
├── menu.tsx                    # 容器 + Context
├── menu.scss
├── common.ts                   # MenuContentPropsContext
├── menu-item.tsx               # 基础项（可带 icon/shortcut/submenu）
├── menu-item-link.tsx          # 外链项（当前未使用）
├── menu-item-content.tsx       # 内容插槽
├── menu-item-content-switch.tsx# 开关内容
├── menu-item-content-radio.tsx # 单选内容
├── menu-item-custom.tsx        # 完全自定义
├── menu-item-switch.tsx        # 开关型菜单项
├── menu-group.tsx              # 分组
└── menu-separator.tsx
```

## 交互和事件

- 点击项 → 触发项自身 `onSelect` → 派发/冒泡 `MENU_ITEM_SELECT` → 父 `Menu` 的 `onSelect` 关闭菜单。
- `shortcut` 只做展示，不注册快捷键；真实快捷键在 `plugins/with-hotkey.ts`。

## 复用说明

- 新菜单：`<Menu onSelect={close}><MenuItem icon={X} aria-label={t('...')}>{t('...')}</MenuItem></Menu>`。
- 需要保留打开状态（多选）时，不要接 `onSelect` 关闭逻辑，改用 `MenuItemContentSwitch` 并自行控制。

## 依赖关系

- 上游：`components/island`、`constants`。
- 下游：`toolbar/{app-toolbar,extra-tools}`、`toolbar/zoom-toolbar`、`language-switcher-menu`。

## 关联文档

- [../AGENTS.md](../AGENTS.md)
- [../toolbar/app-toolbar/AGENTS.md](../toolbar/app-toolbar/AGENTS.md)

## 技术栈

- React 19 + Context、SCSS

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
