# drawnix

> 📅 生成于：2026-10-27
> 📂 路径：`packages/drawnix`
> 🏷️ 类型：**Module**（业务主体）

---

## 概览

`@drawme/drawnix` 是整个产品的业务主体，向外只暴露三样东西（见 `src/index.ts`）：`Drawnix` 组件及类型、`utils/*` 工具、`i18n`。

它承担：插件装配、应用态管理、全部工具与面板 UI、画布导入导出、自由绘制、链接浮层、Agent 对话。**它不认识宿主**——不碰路由、不碰 localforage，所有持久化通过回调交还给宿主。

## 相关概念

- **`Drawnix` 是"装配器"**：board 能力由 `plugins` 数组按顺序包裹，顺序有语义（例如 `withCommonPlugin` 必须在 `withImagePlugin` 之前提供 `renderImage`；`buildToolStateSyncPlugin` 必须在最后，才能观察到其它插件改写后的 pointer）。
- **两层状态**：React 的 `appState` 与 Plait board 的 `board.appState`。组件内每次渲染都执行 `board.appState = appState`，插件通过 `(board as DrawnixBoard).appState` 读最新值；反过来插件调用 `updateAppState` 回写。**任何只改一侧的写法都会造成 UI 与 board 不一致**。
- **工具态回写**：`buildToolStateSyncPlugin` 在 `pointerUp` / `globalPointerUp` 之后比较 `board.pointer` 与 `toolState.pointer`，不一致才回写。这就是"点击画布后工具栏自动更新选中项"的实现。
- **初始化不触发回调**：`onToolStateChange`、`onPreferenceChange` 都用 `hasMountedXxxRef` 跳过首次执行，避免"刚加载就把默认值写回存档"覆盖用户数据。

## 状态管理

- 应用态（`DrawnixState`，定义于 `src/hooks/use-drawnix.tsx`）：`toolState`、`isMobile`、`isPencilMode`、`fileHandle`、`openDialogType`、`openCleanConfirm`、`agentPanelOpen`、`copyTransparent`、`exportTransparent`、`linkState`。
- 主题态独立：`themeColorMode`（`useState`），与 `appState` 分开，因为它同时驱动 CSS 类名与 `Wrapper` 的 `theme`。
- 设备判断：`MobileDetect` 在 `useState` 初始化函数里执行一次，结果写入 `isMobile`，并用于 `.drawnix--mobile` 类名与工具栏布局。

## 功能页面

库不自带页面，UI 全部是绝对定位的浮层，挂在 `.drawnix` 容器内：

- 左上 `.app-toolbar`、顶部居中 `.draw-toolbar`、右上 `.zoom-toolbar`、右下 `.theme-toolbar`
- 选中态 `.popup-toolbar`、链接 `.link-popup`
- 浮层：`.agent-panel`、`TTDDialog`、`CleanConfirm`、`Toast`、`Tutorial`

## 核心功能和数据流

```
Drawnix(props)
 ├─ useState<DrawnixState>  ────────────────┐
 ├─ board.appState = appState ◀────────────┘
 ├─ plugins = [withDraw, withGroup, withMind, withMindExtend, withCommonPlugin,
 │             buildDrawnixHotkeyPlugin, withFreehand, buildPencilPlugin,
 │             buildTextLinkPlugin, buildToolStateSyncPlugin]
 └─ <Wrapper>
      ├─ <Board afterInit>  → applyToolStateToBoard + setBoard
      └─ 各浮层组件
```

保存/导出链路不走 React：`utils/image.ts` 与 `data/json.ts` 直接读 `board`，因此这类函数可以在插件的键盘回调里被调用。

## 模块内的组件

目录级细节见各子文档：

- [src/AGENTS.md](src/AGENTS.md) — 入口、插件装配、`drawnix.tsx`
- [src/agent/AGENTS.md](src/agent/AGENTS.md) — DrawMe Agent
- [src/components/AGENTS.md](src/components/AGENTS.md) — 通用 UI 与工具栏
- [src/plugins/AGENTS.md](src/plugins/AGENTS.md) — 插件与自由绘制
- [src/data/AGENTS.md](src/data/AGENTS.md) — 导入导出与图片
- [src/hooks/AGENTS.md](src/hooks/AGENTS.md) — 应用态与 Context
- [src/i18n/AGENTS.md](src/i18n/AGENTS.md) — 多语言
- [src/styles/AGENTS.md](src/styles/AGENTS.md) — 主题变量与布局
- [src/utils/AGENTS.md](src/utils/AGENTS.md) — 颜色/导出/快捷提示
- [src/transforms/AGENTS.md](src/transforms/AGENTS.md) — 属性变换
- [src/constants/AGENTS.md](src/constants/AGENTS.md)、[src/libs/AGENTS.md](src/libs/AGENTS.md)
- [testing/AGENTS.md](testing/AGENTS.md) — 测试夹具

## 服务和工具

- 无 HTTP 客户端封装；唯一的网络请求在 `src/agent/agent-service.ts`。
- 浏览器能力：`browser-fs-access`（文件保存/打开）、`navigator.clipboard`（复制 SVG/PNG）、`localforage` **未使用**（持久化由宿主完成）。

## 模块结构

```
packages/drawnix/
├── src/
│   ├── index.ts          # 导出 drawnix / utils / i18n
│   ├── drawnix.tsx       # 装配器（本模块核心）
│   ├── constants.ts      # MIME、VERSIONS、EVENT
│   ├── agent/            # Agent 面板与服务
│   ├── components/       # 工具栏、菜单、浮层、通用控件
│   ├── constants/        # 颜色表、画笔预设 id
│   ├── data/             # 文件读写、blob、图片插入
│   ├── hooks/            # DrawnixContext / DrawnixState
│   ├── i18n/             # 5 语言
│   ├── libs/             # ImageViewer
│   ├── plugins/          # 插件与 freehand
│   ├── styles/           # 主题与布局
│   ├── transforms/       # 属性变换
│   └── utils/            # 导出、颜色、快捷提示
├── testing/              # setupDrawnixTestingBoard
├── vite.config.ts        # 库模式，external 列表
└── tsconfig*.json
```

## 测试用例覆盖

- [x] `src/agent/agent-service.spec.ts` — 工具调用循环、错误分支（详见 agent 文档）
- [x] `src/agent/config.spec.ts` — 配置规范化与存储
- [x] `src/agent/tool-definition.spec.ts` — 工具参数校验
- [x] `src/hooks/use-drawnix.spec.ts` — `mergeToolState` 合并语义
- [x] `src/i18n/index.spec.ts` — 翻译回退与语言切换
- [x] `src/plugins/with-tool-state-sync.spec.ts` — board 到 toolState 的同步
- [x] `src/plugins/freehand/*.spec.ts` — 生成器、工具函数、指针
- [x] `src/components/toast/toast.spec.tsx`、`freehand-style-preset-item.spec.tsx`
- [ ] `drawnix.tsx` 自身、导入导出、键盘快捷键无单测（依赖真实 DOM/文件系统）

## 关联文档

- [../AGENTS.md](../AGENTS.md)
- [../react-board/AGENTS.md](../react-board/AGENTS.md)
- [src/AGENTS.md](src/AGENTS.md)

## 技术栈

- React 19、`@plait/core|common|draw|mind|text-plugins` 0.94
- `@floating-ui/react`（Popover/Dialog/Select）
- `browser-fs-access`、`mobile-detect`、`is-hotkey`、`laser-pen`
- `@plait-board/mermaid-to-drawnix`、`@plait-board/markdown-to-drawnix`（Agent 动态 import）

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
