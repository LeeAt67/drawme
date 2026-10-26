# data

> 📅 生成于：2026-10-27
> 📂 路径：`packages/drawnix/src/data`
> 🏷️ 类型：**Module**（文件与图片 I/O）

---

## 概览

负责"进出画布"的数据：`.drawnix` 文件的序列化/反序列化、`browser-fs-access` 的文件读写封装、Blob/DataURL 转换、图片插入。

这一层是**不依赖 React** 的纯函数集合（除 `image.ts` 使用 `Image` 构造器），因此可以被插件与快捷键直接调用。

## 相关概念

- **文件格式契约**：`serializeAsJSON` 写出 `{ type:'drawnix', version:1, source:'web', elements, viewport, theme }`。`isValidDrawnixData` 只校验 `type`、`elements` 是数组、`viewport` 是对象——**不校验 version**，因此兼容性由读取端自行容错。
- **MIME 与扩展名**：`MIME_TYPES.drawnix = 'application/vnd.drawnix+json'`、扩展名 `.drawnix`。文件扩展名是用户可见契约，改动等同破坏旧文件可打开性。
- **打开时不做扩展名过滤**：`loadFromJSON` 的 `extensions` 被注释掉，注释说明这是为了绕开 WebKit 的 bug（否则 iOS 无法打开 `.drawnix`）。**不要"顺手"恢复过滤**。
- **`normalizeFile`**：把无扩展名的文件补成 `.drawnix`（`createFile` + `blobToArrayBuffer`），保证后续按类型解析。
- **图片插入的尺寸策略**：有选中元素或聚焦图片时最大宽 240，否则 400；并按原始宽高比缩放。落点命中思维导图节点时走 `MindTransforms.setImage`（设为节点图片），否则走 `DrawTransforms.insertImage`。

## 相关概念（副作用）

- `loadFromJSON` **不修改** board；它只返回 `data`，由调用方（`app-toolbar` 的 `OpenFile`）负责替换 `board.children` 并重建 listRender。这样拆分的目的是让"读文件"可测试。
- `saveJSON` 返回 `{ fileHandle }`，调用方需写回 `appState.fileHandle` 才能启用后续"保存"。

## 测试用例覆盖

- [x] 无本目录专属单测
- [ ] 建议补充：`serializeAsJSON` 字段完整性、`isValidDrawnixData` 的非法输入、`buildImage` 的等比缩放
- [ ] 文件系统交互无法在 jsdom 中覆盖（依赖 `browser-fs-access`）

## Props 定义

无（纯函数模块）。


## 状态管理

无 React 状态。文件句柄（`DrawnixFileHandle`）由调用方保存在 `appState.fileHandle`，本目录只产出句柄（`saveJSON` 返回值）和消费句柄（`fileSave` 的 `fileHandle` 参数）。

## 功能页面

无。所有用户交互在 `components/toolbar/app-toolbar` 与快捷键插件中。
## 渲染逻辑

无。核心函数：

| 函数 | 文件 | 说明 |
| --- | --- | --- |
| `saveJSON(board, fileHandle?, name?)` | `json.ts` | 序列化并保存，返回新句柄 |
| `saveAsJSON(board, name?)` | `json.ts` | 强制另存为 |
| `loadFromJSON(board)` | `json.ts` | 选文件 → 解析 → 返回 `{data, fileHandle}` |
| `serializeAsJSON(board)` | `json.ts` | 纯序列化 |
| `isValidDrawnixData(data)` | `json.ts` | 结构守卫（不校验 version） |
| `fileOpen` / `fileSave` | `filesystem.ts` | 能力探测 + 扩展名/MIME 映射 |
| `loadFromBlob` / `parseFileContents` / `normalizeFile` | `blob.ts` | 文本/图片分流 |
| `insertImage(board, file, point?, isDrop?)` | `image.ts` | 尺寸计算与两种插入路径 |

## 数据结构

- `DrawnixExportedData` / `DrawnixExportedType`（`types.ts`）。
- `DrawnixFileHandle = FileSystemHandle | null`（`json.ts`）。
- `DataURL`（`src/types.ts`）。

## API 和服务

- `browser-fs-access` 的 `fileOpen`/`fileSave`/`supported`；不支持时自动降级为 `<input type=file>` + `download`。

## 模块结构

```
data/
├── json.ts        # .drawnix 序列化/反序列化
├── filesystem.ts  # 文件系统封装
├── blob.ts        # Blob/文本/DataURL 转换、图片类型判断
├── image.ts       # 图片加载、尺寸计算、插入
└── types.ts       # 导出数据契约
```

## 交互和事件

- 无 UI。所有交互（点击菜单、快捷键）在调用方。

## 复用说明

- 需要"导出字符串"时用 `serializeAsJSON`（纯函数，便于测试）；需要"让用户选路径"时用 `saveJSON`。
- 需要支持新的文件类型（如 `.svg` 导入）时改 `blob.ts` 的分流逻辑，而不是在 UI 层判断。

## 依赖关系

- 上游：`constants`（MIME/VERSIONS）、`src/types`、`@plait/core`、`@plait/mind`、`@plait/draw`。
- 下游：`components/toolbar/app-toolbar/app-menu-items.tsx`、`plugins/with-hotkey.ts`、`utils/image.ts`、`plugins/with-image.tsx`。

## 关联文档

- [../AGENTS.md](../AGENTS.md)
- [../utils/AGENTS.md](../utils/AGENTS.md) — 导出图片（另一条输出链路）
- [../plugins/AGENTS.md](../plugins/AGENTS.md) — 图片粘贴/拖拽入口

## 技术栈

- `browser-fs-access`、Blob/FileReader API
- `@plait/core`、`@plait/mind`、`@plait/draw`

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
