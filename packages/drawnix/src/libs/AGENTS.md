# libs

> 📅 生成于：2026-10-27
> 📂 路径：`packages/drawnix/src/libs`
> 🏷️ 类型：**Module**（无框架依赖的类库）

---

## 概览

放"不依赖 React 的独立类"。目前只有 `image-viewer.ts`：一个纯 DOM 实现的图片查看器（遮罩 + 缩放 + 拖拽 + 键盘操作）。

## 相关概念

- **`ImageViewer` 是命令式单例式对象**：构造时传入配置，调用 `open(url)` 时**动态创建** DOM（overlay / img / 关闭按钮 / 控制条），关闭时移除。这意味着它不受 React 生命周期管理，重复 `open` 需要自身防止叠加。
- **由插件持有**：`plugins/with-image.tsx` 在插件初始化时 `new ImageViewer({...})`，每次 `withImagePlugin` 执行都会新建一个——但因为插件只对每个 board 执行一次，实际是"一 board 一实例"。
- **打开条件很严格**：只有"点击的正是当前聚焦的图片节点"才打开（`focusMindNode === hitElement` 且 `isHitImage`），不是"点任意图片都放大"。

## 测试用例覆盖

- [ ] 无单测（依赖真实 DOM 布局，jsdom 下尺寸为 0）
- [ ] 建议补充（可用 happy-dom + 手动 mock 尺寸）：`open` 后 DOM 存在、`close` 后移除、Esc 关闭

## 相关概念（配置项）

`ImageViewerOptions`：`zoomStep`（默认传入 0.3）、`minZoom`（0.1）、`maxZoom`（5）、`enableKeyboard`（true）。`ImageState` 记录 `zoom/x/y/isDragging/dragStartX/dragStartY/imageStartX/imageStartY`。

## Props 定义

非组件。构造函数签名：`new ImageViewer(options?: ImageViewerOptions)`；方法：`open(url: string)`、内部 `close()`（以实现为准）。


## 状态管理

状态全在类实例字段里（`zoom`、`x`、`y`、`isDragging` 等），不进入 React。这是有意为之：拖拽/滚轮是高频更新，走 React 会明显掉帧。

## 功能页面

无。表现为一个覆盖画布的图片查看层，由 `with-image` 插件在点击图片时打开。
## 渲染逻辑

```
open(url)
 ├─ 若无 overlay → createElement 组装（overlay > container > img + close + controls）
 ├─ 设置 img.src = url
 ├─ 绑定 pointer 事件（拖拽）与 wheel（缩放）
 └─ enableKeyboard → 绑定 Esc / +/- 键

close()
 └─ 从 DOM 移除节点并解绑监听
```

## 数据结构

- `ImageViewerOptions`、`ImageState`（见上）。
- 所有几何状态保存在实例字段，不进入 React 状态。

## API 和服务

- 无网络请求：图片是 DataURL（插入时已转 base64），因此查看器不涉及跨域。

## 模块结构

```
libs/
└── image-viewer.ts   # ImageViewer 类
```

## 交互和事件

- 拖拽：pointerdown/move/up 记录偏移量后设置 `transform`。
- 缩放：wheel 调整 `zoom`，受 `minZoom/maxZoom` 约束。
- 键盘：Esc 关闭、`+`/`-` 缩放（`enableKeyboard` 为真时）。

## 复用说明

- 需要查看非图片内容（如 SVG 元素）时应新建 lib，不要往 `ImageViewer` 里加分支——它当前假设输入是 `string` URL。

## 依赖关系

- 上游：无第三方依赖（纯 DOM API）。
- 下游：`plugins/with-image.tsx`。

## 关联文档

- [../plugins/AGENTS.md](../plugins/AGENTS.md) — 谁在用它
- [../data/AGENTS.md](../data/AGENTS.md) — 图片如何变成 DataURL

## 技术栈

- 原生 DOM / Pointer Events / Wheel


## 常见改动指引

| 需求 | 改动位置 |
| --- | --- |
| 改缩放步长/范围 | 构造 `ImageViewer` 时的 options |
| 改遮罩样式 | 类内部创建的 DOM 样式（无独立 scss） |

## 易错点与约束

- 组件卸载/切换画布时必须调用 `destroy()`，否则事件监听与 DOM 残留。
<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
