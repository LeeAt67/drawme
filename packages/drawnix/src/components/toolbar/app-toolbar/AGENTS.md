# app-toolbar

> 📅 生成于：2026-10-27
> 📂 路径：`packages/drawnix/src/components/toolbar/app-toolbar`
> 🏷️ 类型：**Module**（应用操作栏）

---

## 概览

左上角的应用操作区：一个"应用菜单"弹出层 + 撤销/重做 + 条件出现的复制/删除。菜单里承载**文件级操作**（打开、保存、另存为、导出图片、清除画布）与**语言切换**。

## 相关概念

- **"打开"和"保存"是文件句柄模型**：`SaveToFile` 只在 `appState.fileHandle` 存在时渲染（首次保存必须走"另存为"）；保存后 `fileHandle` 被写回 `appState`，之后 `Ctrl/Cmd+S` 才能直接覆盖原文件。
- **"导出图片"是二级菜单**：`SaveAsImage` 内部再嵌一层 `Menu`，并且会手动派发 `EVENT.MENU_ITEM_SELECT` 冒泡事件让外层菜单关闭——这是嵌套菜单的既有约定，删掉会残留浮层。
- **透明背景是状态而非选项**：`exportTransparent` 存在 `appState`，菜单项渲染成 `role="menuitemcheckbox"` 的开关。
- **已移除 GitHub 入口**：原 `Socials` 菜单项与 `GithubIcon` 依赖已删除；如需加外链请新建菜单项，不要恢复旧组件名。
- **语言切换是嵌套子菜单**：`LanguageSwitcherMenu` 用同样的 `CustomEvent` 方式把"选中"透传给父级。

## 测试用例覆盖

- [x] E2E 间接覆盖：`.app-toolbar` 在 `apps/web-e2e` 的冒烟用例中作为页面结构存在
- [ ] 打开/保存/导出/清空/语言切换无自动化用例
- [ ] 文件句柄流程（`FileSystemHandle`）无法在 headless 环境覆盖，需手工验证

## 相关概念（回调依赖）

菜单项直接引用 `useDrawnix()` 与 `useBoard()`，不接收 Props：

- `OpenFile` → `loadFromJSON(board)` 后**手工重建 listRender**（`listRender.update` + `fitViewport`），因为替换 `board.children` 不会自动触发渲染。
- `CleanBoard` → 只设置 `openCleanConfirm=true`，真正的清空在 `components/clean-confirm`。

## Props 定义

无 Props。`AppToolbar` 自身也不接收参数。


## 状态管理

组件无本地状态（除 `appMenuOpen` 这个纯 UI 开合），全部读写 `appState`：`fileHandle`、`exportTransparent`、`copyTransparent`、`openCleanConfirm`，以及 `board.history` 的撤销/重做栈。

## 功能页面

不是页面，而是文件级操作与历史操作的菜单入口。各菜单项的可见性由状态决定：

- `SaveToFile`：仅当 `fileHandle` 存在（即已打开或另存过文件）。
- 复制 / 删除：仅当 `getSelectedElements(board).length > 0`。
- 撤销 / 重做：`disabled` 由历史栈长度决定。
## 渲染逻辑

```
Island(.app-toolbar)
 └─ Stack.Row
     ├─ Popover(应用菜单)
     │    └─ Menu(onSelect=关闭)
     │        OpenFile / SaveToFile / SaveAsFile / SaveAsImage / CleanBoard
     │        MenuSeparator / LanguageSwitcherMenu
     ├─ ToolButton 撤销   (disabled = undos.length <= 0)
     ├─ ToolButton 重做   (disabled = redos.length <= 0)
     ├─ [有选中] ToolButton 复制 → duplicateElements(board)
     └─ [有选中] ToolButton 删除 → deleteFragment(board)
```

注意 `SaveToFile` 用 `if (!appState.fileHandle) return null;` 实现条件渲染，因此首次进入菜单看不到"保存"。

## 数据结构

- `appState.fileHandle`：`DrawnixFileHandle`（`browser-fs-access` 的 `FileSystemHandle`）。
- `appState.exportTransparent` / `copyTransparent`：布尔偏好。
- `board.history.undos` / `redos`：Plait 撤销栈，用于禁用态。

## API 和服务

| 菜单项 | 调用的服务 | 副作用 |
| --- | --- | --- |
| 打开 | `loadFromJSON` | 覆盖 `children/viewport/theme`，重置文件句柄 |
| 保存 | `saveJSON(board, fileHandle)` | 写盘，更新句柄 |
| 另存为 | `saveAsJSON(board)` | 弹出保存对话框 |
| 导出图片 | `saveAsSvg` / `saveAsPng` | 下载文件；有选中元素时只导出选中部分 |
| 清除画布 | `setAppState({openCleanConfirm:true})` | 打开确认框 |

## 模块结构

```
app-toolbar/
├── app-toolbar.tsx            # 容器与撤销/重做/复制/删除
├── app-menu-items.tsx         # 文件与导出菜单项
└── language-switcher-menu.tsx # 5 语言子菜单
```

## 交互和事件

- 撤销/重做用 `onPointerUp`（而非 `onClick`），与 Plait 的指针事件时序一致，改成 `onClick` 会在某些触控设备上失效。
- 菜单项选中后由父 `Menu` 的 `onSelect` 统一关闭，菜单项自身不要额外 `setAppMenuOpen(false)`。

## 复用说明

- 新增文件操作：在 `app-menu-items.tsx` 里加导出组件，然后在 `app-toolbar.tsx` 的 `<Menu>` 内插入。位置顺序即用户心智顺序，建议文件操作在前、分隔线之后放设置类。
- 新增语言：`language-switcher-menu.tsx` 加 `MenuItem`，同时补 `i18n/translations`。

## 依赖关系

- 上游：`data/json`、`utils/image`、`i18n`、`hooks/use-drawnix`、`menu/*`、`popover`、`island`、`stack`、`tool-button`、`icons`。
- 下游：`drawnix.tsx` 渲染。

## 关联文档

- [../AGENTS.md](../AGENTS.md) — 工具栏总览与位置
- [../../data/AGENTS.md](../../data/AGENTS.md) — JSON 保存/打开实现
- [../../../styles/AGENTS.md](../../../styles/AGENTS.md) — `.app-toolbar` 定位

## 技术栈

- `@plait/core`：`getSelectedElements`、`duplicateElements`、`deleteFragment`
- `@drawme/react-board`：`useBoard`
- `@floating-ui/react`：Popover

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
