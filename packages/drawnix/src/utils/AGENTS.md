# utils

> 📅 生成于：2026-10-27
> 📂 路径：`packages/drawnix/src/utils`
> 🏷️ 类型：**Module**（工具函数）

---

## 概览

纯函数工具集合，通过 `index.ts` 全部对外导出（因此 `@drawme/drawnix` 的公开 API 包含这些函数）。

| 文件 | 职责 |
| --- | --- |
| `image.ts` | 导出/复制 PNG·SVG、添加图片（含剪贴板能力探测） |
| `color.ts` | hex/alpha 转换、特殊色判定、读取画布背景色 |
| `property.ts` | 读取元素的填充/描边/字体色 |
| `common.ts` | `download`、`base64ToBlob`、`boardToImage`、`getShortcutKey`、`composeEventHandlers` |
| `laser-pointer.ts` | 激光笔（橡皮模式与鼠标轨迹） |
| `utility-types.ts` | 类型工具（`ResolutionType`、`ValueOf`） |

## 相关概念

- **`getShortcutKey('CtrlOrCmd+S')`**：把抽象写法转换成平台显示（macOS `Cmd+S`，其他 `Ctrl+S`）。所有菜单 `shortcut` 都走它，**不要手写 `⌘`**。
- **剪贴板能力是运行时探测的**：`canCopySelectionAs('svg')` 会先看 `navigator.clipboard.write`，再看 `ClipboardItem.supports('image/svg+xml')`；不支持时回退为只允许 PNG。因此"复制 SVG"在部分浏览器不可用是预期行为。
- **`boardToImage` 的默认参数有讲究**：`fillStyle: 'transparent'`、`inlineStyleClassNames: '.extend,.emojis,.text'`、`ratio: 4`。`inlineStyleClassNames` 决定哪些 class 需要内联样式（否则导出的 SVG 缺少布局），删掉会导致导出图错位。
- **`getBackgroundColor(board)`**：导出非透明图时取画布背景色，取不到回退 `'white'`。
- **`LaserPointer` 是实例级监听器**：`init(board)` 会在 `.drawnix` 容器上挂 `pointermove`、在 `window` 上挂 `resize`，并操作 `.laser-pointer` canvas；`destroy()` 必须成对调用，否则监听器与 canvas 内容残留。`drawnix.tsx` 负责渲染该 canvas。

## 测试用例覆盖

- [x] 无本目录专属测试文件（`utils/*.spec` 不存在）
- [x] 间接覆盖：`plugins/freehand/utils.spec.ts` 覆盖 freehand 侧的选项解析；`color` 相关逻辑被 `transforms` 依赖
- [ ] 建议补充：`getShortcutKey` 平台差异、`applyOpacityToHex`/`hexAlphaToOpacity` 往返、`isValidColor` 对哨兵值

## 相关概念（导出格式选择）

| 场景 | 函数 | 是否只导出选中 |
| --- | --- | --- |
| 菜单"导出图片 → SVG" | `saveAsSvg(board)` | 有选中则只导出选中 |
| 菜单"导出图片 → PNG" | `saveAsPng(board)` | 同上 |
| 快捷键 `Shift+Alt+C` | `copySelectionAsSvg(board)` | 仅选中 |
| 粘贴/拖入图片 | `addImage(board)` / `insertImage` | 否 |

`exportTransparent` 取自 `board.appState`，因此这些函数虽然不依赖 React，却要求 board 是 `DrawnixBoard`。

## Props 定义

无（纯函数）。


## 状态管理

无。所有函数都是输入 board/参数、输出 Blob/颜色/字符串的纯函数（除下载与剪贴板写入这两个浏览器副作用）。

## 功能页面

无。
## 渲染逻辑

```
saveAsSvg(board)
 ├─ isTransparent = board.appState.exportTransparent
 ├─ elements = 有选中 ? 选中集合 : undefined
 ├─ toSvgData(board, {fillStyle, padding:20, ratio:4, inlineStyleClassNames})
 └─ download(blob, `drawnix-${Date.now()}.svg`)   ← 文件名仍是旧品牌

copySelectionAsSvg(board)
 ├─ canCopySelectionAs('svg')  → 不支持则 return
 ├─ 生成 svg blob（+ png 兜底）
 └─ navigator.clipboard.write([new ClipboardItem({...})])
```

## 数据结构

- `ClipboardImageFormat = 'svg' | 'png'`。
- `COPY_TOAST_KEYS`：格式 → i18n 键的映射，新增格式必须补映射与文案。

## API 和服务

- `toSvgData` / `toImage`（`@plait/core`）负责实际渲染，本目录只做参数与下载/剪贴板封装。

## 模块结构

```
utils/
├── index.ts           # 全量 re-export
├── image.ts           # 导出/复制/添加图片
├── color.ts           # 颜色计算
├── property.ts        # 元素属性读取
├── common.ts          # 通用工具
├── laser-pointer.ts   # 激光笔 + LASER_POINTER_CLASS_NAME
└── utility-types.ts
```

## 交互和事件

- `download` 使用临时 `<a download>` + `URL.createObjectURL`，并在之后 `revokeObjectURL`（以实现为准），避免内存泄漏。

## 复用说明

- 新增导出格式：在 `image.ts` 加 `saveAsXxx`，扩展 `ClipboardImageFormat` 与 `CLIPBOARD_MIME_TYPES`，再在 `app-menu-items.tsx` 加菜单项。
- 需要"当前颜色"时用 `getCurrentFill/getCurrentStrokeColor/getCurrentFontColor`，不要自己从元素结构里挖字段（draw 与 mind 结构不同）。

## 依赖关系

- 上游：`@plait/core`、`data/filesystem`、`i18n`、`constants/*`。
- 下游：`plugins/with-hotkey`、`components/toolbar/app-toolbar`、`components/toolbar/popup-toolbar`、`transforms/property`。

## 关联文档

- [../data/AGENTS.md](../data/AGENTS.md) — JSON 导出（另一条链路）
- [../transforms/AGENTS.md](../transforms/AGENTS.md) — 属性写入
- [../constants/AGENTS.md](../constants/AGENTS.md) — 特殊色与调色板
- [../AGENTS.md](../AGENTS.md)

## 技术栈

- Canvas/SVG 导出（`@plait/core` `toImage`/`toSvgData`）、Clipboard API、Blob/atob

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
