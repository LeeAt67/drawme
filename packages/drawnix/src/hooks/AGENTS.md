# hooks

> 📅 生成于：2026-10-27
> 📂 路径：`packages/drawnix/src/hooks`
> 🏷️ 类型：**State**（应用态定义与访问）

---

## 概览

只有一个文件 `use-drawnix.tsx`，但它是全库的"状态字典"：定义 `DrawnixState`、`DrawnixToolState`、`DrawnixContext`、`useDrawnix`、`useSetPointer` 与工具态合并函数。

任何组件想读写应用态，都必须经过这里的 Context。

## 相关概念

- **`DrawnixBoard` 扩展**：`interface DrawnixBoard extends PlaitBoard { appState: DrawnixState; showToast?: ... }`。插件通过 `(board as DrawnixBoard).appState` 读取最新应用态——这是"React 状态给非 React 代码用"的桥。
- **`mergeToolState` 的深拷贝语义**：即使调用方不传 `freehandPresets`，它也会把默认预设**逐项浅拷贝**成新对象，避免多个 board 共享同一批对象后互相污染。它还会保留调用方传入的数组（长度不做修正），因此旧存档里预设数量异常时可能越界。
- **`createDefaultToolState`**：手形工具、矩形、直线箭头、签字笔、第 0 个预设。
- **`DialogType`**：`mermaidToDrawnix` / `markdownToDrawnix`，同时被 `ttd-dialog` 与 `extra-tools` 引用。
- **`LinkState`**：链接浮层的全部上下文（DOM、Slate editor、元素、三个布尔）。

## 测试用例覆盖

- [x] `use-drawnix.spec.ts` — `mergeToolState` 的默认值、部分覆盖、预设隔离（不与 `DEFAULT_FREEHAND_PRESETS` 共享引用）
- [ ] `useDrawnix` 在 Provider 外抛错的守卫无覆盖（需要 renderHook）
- [ ] `useSetPointer` 无覆盖

## 相关概念（状态字段用途）

| 字段 | 类型 | 谁写 | 谁读 |
| --- | --- | --- | --- |
| `toolState.pointer` | `DrawnixPointerType` | 工具栏、快捷键、工具态同步插件 | 工具栏选中态、`applyToolStateToBoard` |
| `toolState.lastShapePointer` 等 | pointer | 各弹层 `onPointerUp` | `creation-toolbar` 恢复上次选择 |
| `toolState.freehandPresets` | `FreehandDrawOptions[]` | `freehand-panel` | `plugins/freehand/utils` |
| `isMobile` | boolean | 初始化一次（MobileDetect） | 类名、工具栏隐藏、Agent 布局 |
| `isPencilMode` | boolean | `buildPencilPlugin`、`ClosePencilToolbar` | 铅笔工具条、board 的 `IS_PENCIL_MODE` |
| `fileHandle` | `DrawnixFileHandle` | 打开/保存回调 | `SaveToFile` 是否渲染 |
| `openDialogType` | `DialogType \| null` | `extra-tools` | `TTDDialog` |
| `openCleanConfirm` | boolean | 菜单/快捷键 | `CleanConfirm` |
| `agentPanelOpen` | boolean | 创建栏 ✨ 按钮、Agent 面板关闭按钮 | `AgentPanel` 是否渲染 |
| `copyTransparent`/`exportTransparent` | boolean | 菜单开关 | 复制/导出逻辑 |
| `linkState` | `LinkState \| null` | `with-text-link` | `LinkPopup`、`popup-toolbar` 链接按钮 |

## Props 定义

无组件 Props；对外是 hook 与 Context：

- `useDrawnix(): { appState, setAppState, showToast }` — Provider 外调用直接抛错。
- `useSetPointer(): (pointer) => void` — 只改 `toolState.pointer` 的便捷写法。

## 渲染逻辑

无渲染。`DrawnixContext` 由 `drawnix.tsx` 提供，`value` 每帧重建（包含 `appState` 与 `setAppState`），因此**消费组件的重渲染频率等于 appState 变化频率**——这也是为什么 `drawnix.tsx` 内部把 `board.appState` 直接赋值而不是走 Context。

## 数据结构

- `DrawnixState`、`DrawnixToolState`、`DrawnixPointerType`、`DrawnixFreehandPointer`、`LinkState`、`DialogType`：定义见本文件源码，AGENTS 不再重复字段类型。

## API 和服务

- 无服务调用。

## 文件结构

```
hooks/
├── use-drawnix.tsx      # Context + 类型 + mergeToolState
└── use-drawnix.spec.ts
```

## 交互和事件

- 状态变化不自动持久化，持久化由宿主通过 `onToolStateChange` / `onPreferenceChange` 完成。

## 复用说明

- 新增需要持久化的应用态：在 `DrawnixState` 加字段 → `drawnix.tsx` 的 `useState` 初始化 → 回调 + `hasMountedXxxRef` → 宿主侧存/取 → 本文件表格补一行。
- 不要在组件里 `useState` 复制 `appState` 的字段，会造成双份真相（`AgentPanel` 的 `config` 是例外：它是独立持久化的本地配置）。

## 依赖关系

- 上游：`@plait/core|mind|draw`、`plugins/freehand/{type,presets}`、`data/json`、`components/toast`。
- 下游：几乎所有组件与 `drawnix.tsx`。

## 关联文档

- [../AGENTS.md](../AGENTS.md)
- [../plugins/AGENTS.md](../plugins/AGENTS.md) — 状态回写方
- [../../testing/AGENTS.md](../../testing/AGENTS.md) — 测试中构造 `appState`

## 技术栈

- React Context、TypeScript 判别联合


## 易错点与约束

- `DrawnixContext` 的 value 每帧重建，只有 `appState` 变化才会触发消费组件重渲染；不要把高频数据放进 `appState`。
<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
