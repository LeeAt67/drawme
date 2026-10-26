# plugins

> 📅 生成于：2026-10-27
> 📂 路径：`packages/drawnix/src/plugins`
> 🏷️ 类型：**Module**（Plait 插件）

---

## 概览

把"画布行为"以插件形式挂到 board 上：快捷键、工具态同步、图片、思维导图扩展、铅笔、文本链接、公共渲染。`freehand/` 子目录实现自由绘制。

所有插件遵循同一形态：`(board) => board`，用"保存原方法 → 覆盖 → 调用原方法"的方式扩展。**顺序有意义**，见 [../AGENTS.md](../AGENTS.md)。

## 相关概念

- **两种注入方式**：
  1. **build 工厂**（`buildDrawnixHotkeyPlugin(updateAppState)`、`buildPencilPlugin`、`buildTextLinkPlugin`、`buildToolStateSyncPlugin`）：需要 React 侧的 `setAppState`，所以返回插件的函数。
  2. **直接插件**（`withCommonPlugin`、`withImagePlugin`、`withMindExtend`、`withFreehand`）：不依赖 React 状态。
- **`appState` 读取**：build 工厂内部通过 `(board as DrawnixBoard).appState` 读取，而不是闭包捕获——保证拿到最新值。
- **事件链不可跳过**：覆盖 `pointerDown` 时若在末尾 `return` 而不调用原方法，会截断后续插件与 Plait 内置行为（`with-pencil` 就是刻意这样做）。
- **`with-tool-state-sync` 的比较语义**：只在 `board.pointer !== toolState.pointer` 时回写，避免无意义 `setState` 循环。

## 测试用例覆盖

- [x] `with-tool-state-sync.spec.ts` — 用真实 board 验证 pointerUp 后的同步、以及相同 pointer 不触发回调
- [x] `freehand/*.spec.ts` — 生成器、平滑器、工具函数、指针（见子目录）
- [ ] `with-hotkey`（快捷键组合）、`with-image`（粘贴/拖拽）、`with-pencil`、`with-text-link` 无单测

## 相关概念（各插件职责）

| 文件 | 作用 | 关键副作用 |
| --- | --- | --- |
| `with-common.tsx` | 注入 `renderImage`（React）与 `getI18nValue`（Plait 内置文案），并串联 `withImagePlugin` | 用 `createRoot` 手动挂载/卸载图片组件 |
| `with-image.tsx` | 粘贴/拖拽图片、点击放大 | 覆盖 `insertFragment`、`drop`、`pointerUp` |
| `with-mind-extend.tsx` | 设置 emoji 间距、注入 React `renderEmoji` | `setPluginOptions(WithMindPluginKey, ...)` |
| `with-pencil.ts` | 检测笔触事件自动进入铅笔模式 | 用 `WeakMap<PlaitBoard, boolean>` 存模式，非跨实例全局 |
| `with-text-link.tsx` | hover/编辑链接时维护 `linkState` | `throttleRAF` 节流，且编辑中/移动中不计算 |
| `with-hotkey.ts` | 全局快捷键 | 保存/导出/切工具；开头过滤输入框与文本编辑态 |
| `with-tool-state-sync.ts` | board pointer → appState | 必须放最后 |
| `freehand/*` | 自由绘制内核 | 见子目录 |

## Props 定义

非组件，均为 `PlaitPlugin`。


## 状态管理

插件本身不持有 React 状态，但会读写两类外部状态：

- `board.appState`（通过 `DrawnixBoard` 断言）：读最新应用态；写需通过传入的 `updateAppState`。
- `@plait/core` 的 `WeakMap`（如 `IS_PENCIL_MODE`、`BOARD_TO_MOVING_POINT`）：与 board 生命周期绑定，随 board 回收。

## 功能页面

无。插件只改行为，不渲染页面；唯一的 UI 输出是 `with-image` 打开的 `ImageViewer` 与 `with-text-link` 维护的 `linkState`（由 `LinkPopup` 渲染）。
## 渲染逻辑

### with-common 的双重职责

```
withCommonPlugin(board)
 ├─ board.renderImage = (container, props) => createRoot(container).render(<Image/>)
 │    返回 { destroy: 延迟 unmount, update: 重新 render }
 ├─ board.getI18nValue = key => 把 DrawI18nKey/MindI18nKey 映射到本项目 t()
 └─ return withImagePlugin(board)
```

`destroy` 里用 `setTimeout(..., 0)` 卸载，是因为 React 18+ 不允许在渲染期间同步 unmount 另一个 root。

### with-image 的三个入口

- `insertFragment`：剪贴板里有受支持的图片类型 → 插入图片而不是粘贴元素。
- `drop`：拖入文件 → 转成画布坐标（`toViewBoxPoint + toHostPoint`）后插入。
- `pointerUp`：命中"当前聚焦图片节点"且未在拖拽/缩放 → `viewer.open(url)`。

## 数据结构

- `IS_PENCIL_MODE: WeakMap<PlaitBoard, boolean>`（`with-pencil.ts`）。
- `LinkState`（`with-text-link.tsx` 写入，`hooks/use-drawnix` 定义）。
- `DrawI18nKey` / `MindI18nKey` 映射表（`with-common.tsx`）。

## API 和服务

- 调用 `data/image.insertImage`、`utils/image.{saveAsSvg,saveAsJSON,addImage,copySelectionAsSvg}`、`@plait/common` 的 `setCreationMode`。

## 模块结构

```
plugins/
├── with-common.tsx          # renderImage + getI18nValue
├── with-image.tsx           # 图片粘贴/拖拽/查看
├── with-mind-extend.tsx     # emoji 渲染与选项
├── with-pencil.ts           # 铅笔模式检测
├── with-text-link.tsx       # 链接 hover 状态
├── with-hotkey.ts           # 快捷键
├── with-tool-state-sync.ts  # pointer 同步（+ spec）
├── components/              # 插件内 React 渲染件（image/emoji）
└── freehand/                # 自由绘制
```

## 交互和事件

- `with-hotkey` 的守卫条件：`!isTypingNormal && 指针在 board 内 && !hasBeenTextEditing`。任一不满足则完全不处理（包括保存）。
- `mod+z` / `mod+shift+z` 在 `keyDown`（非 `globalKeyDown`）中处理，因此输入框内会交给 Slate 自己撤销。
- `with-pencil`：一旦进入铅笔模式，非笔触事件被丢弃，用户必须通过 `ClosePencilToolbar` 退出。

## 复用说明

- 新增插件：写成 `(board) => board`，在 `drawnix.tsx` 的 `plugins` 数组里选择位置（改事件行为放前面，观察型放后面），并补 spec。
- 需要 React 状态时用 `buildXxxPlugin(setAppState)` 模式，不要直接 import `useDrawnix`（插件不是组件）。

## 依赖关系

- 上游：`hooks/use-drawnix`、`data/*`、`utils/*`、`components/{toast,icons}`（间接）、`@plait/*`。
- 下游：`drawnix.tsx` 装配；`components/toolbar/*` 读取插件写入的状态。

## 关联文档

- [../AGENTS.md](../AGENTS.md) — 插件顺序
- [freehand/AGENTS.md](freehand/AGENTS.md)
- [components/AGENTS.md](components/AGENTS.md) — 插件内渲染件
- [../hooks/AGENTS.md](../hooks/AGENTS.md) — `DrawnixBoard`

## 技术栈

- `@plait/core` 插件机制、`react-dom/client` 的 `createRoot`
- `throttleRAF`、`WeakMap`

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
