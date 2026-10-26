# DrawMe 项目知识库

> 📅 生成于：2026-10-27
> 📂 路径：仓库根目录
> 🏷️ 类型：**Workspace Root**（Nx monorepo）

---

## 概览

DrawMe 是一个基于 [Plait](https://github.com/worktile/plait) 画图框架的白板应用，支持思维导图、流程图、自由绘制，并内置 `DrawMe Agent`（用自然语言生成图表并插入画布）。

工程形态是 **Nx 22 + Vite 8 + React 19 + TypeScript** 的 monorepo，拆成三类产物：

- `apps/web`：唯一可运行的 Web 应用（Vite dev server 端口 7200）。
- `packages/*`：三个内部库，通过 `tsconfig.base.json` 的 `paths` 以源码方式被引用，**不经过 npm 发布**（三者的 `private` 均为 `true`）。
- `apps/web-e2e`：Playwright 端到端测试。

包名已统一为 `@drawme/*`：`@drawme/drawnix`、`@drawme/react-board`、`@drawme/react-text`。改动 import 时若只改目录不改 `tsconfig.base.json`，dev server 会在启动时报 `Failed to resolve import`。

## 相关概念

- **Board**：Plait 的 `PlaitBoard` 实例，持有 `children`（元素树）、`viewport`、`theme`、`pointer`，并通过 `board.xxx = (...) => {}` 的方式被插件层层包裹。
- **Plugin**：形如 `(board: PlaitBoard) => PlaitBoard` 的高阶函数。所有交互能力（绘制、框选、快捷键、图片、手写笔、工具态同步）都是插件叠加的结果，顺序在 `Drawnix` 组件里显式声明。
- **appState**：Drawnix 自己的应用态（`DrawnixState`），与 board 是**双向**关系：board 变化会经插件回写 `toolState`，`appState` 变化又会写回 `board.appState`。详见 [packages/drawnix/src/AGENTS.md](packages/drawnix/src/AGENTS.md)。
- **ToolState**：当前工具（手形 / 选择 / 思维导图 / 文本 / 画笔 / 箭头 / 形状），以及"上一次用的形状/箭头/笔刷"与笔刷预设。
- **Agent**：浏览器直连 OpenAI 兼容接口的对话式画图助手，通过函数调用工具 `create_diagram` 把 Mermaid / Markdown 转成画布元素。

## 状态管理

- 无 Redux / MobX。全局态是 React Context：`DrawnixContext`（应用态）+ `I18nContext`（语言）+ `BoardContext`（board 与 listRender）。
- 持久化由**宿主应用**负责，不在库内：`apps/web` 用 `localforage` 存画布内容、工具态、偏好；Agent 配置单独存 `localStorage`。

## 功能页面

- 白板主页面（唯一路由 `/`）：[apps/web/src/app/AGENTS.md](apps/web/src/app/AGENTS.md)

## 核心功能和数据流

```
用户操作 → board 事件 (pointer/hotkey) → 插件链
        → Plait Transforms 修改 children
        → Wrapper 的 onContextChange 冒泡
        → apps/web/app.tsx 写入 localforage
        → onChange → setValue → 重新渲染
```

Agent 链路独立于上述链路，只共用 `board.insertFragment`：

```
输入框 → runAgentTurn（OpenAI 兼容 /chat/completions）
       → 模型返回 tool_calls(create_diagram)
       → parseCreateDiagramArguments → parseDiagramElements
       → board.insertFragment 插入元素
```

## 模块结构

```
.
├── apps/
│   ├── web/                    # Web 应用（Vite，端口 7200）
│   │   ├── index.html          # SEO meta / JSON-LD
│   │   ├── public/             # 静态资源、_headers、_redirects
│   │   └── src/                # 入口、App 页面
│   └── web-e2e/                # Playwright 测试
├── packages/
│   ├── drawnix/                # 白板应用库（业务主体）
│   ├── react-board/            # board 的 React 渲染层（Board/Wrapper/useBoard）
│   └── react-text/             # 基于 Slate 的文本编辑层
├── scripts/                    # 版本脚本
├── tsconfig.base.json          # 三个 @drawme/* 路径别名
└── package.json                # Nx 22 workspace
```

## 文档导航

- [apps/AGENTS.md](apps/AGENTS.md) — 应用层总览
- [packages/AGENTS.md](packages/AGENTS.md) — 三个内部库的职责边界
- [packages/drawnix/AGENTS.md](packages/drawnix/AGENTS.md) — 白板业务模块
- [packages/drawnix/src/AGENTS.md](packages/drawnix/src/AGENTS.md) — 入口组件与插件装配
- [packages/drawnix/src/agent/AGENTS.md](packages/drawnix/src/agent/AGENTS.md) — DrawMe Agent
- [packages/react-board/AGENTS.md](packages/react-board/AGENTS.md) — 渲染层
- [packages/react-text/AGENTS.md](packages/react-text/AGENTS.md) — 文本层
- [scripts/AGENTS.md](scripts/AGENTS.md) — 版本脚本

## 技术栈

- **框架**：React 19.2、TypeScript ~6.0、Vite 8、Nx 22.6
- **画图内核**：`@plait/core`、`@plait/common`、`@plait/draw`、`@plait/mind`、`@plait/text-plugins`（0.94.x）
- **富文本**：Slate 0.116 + slate-react + slate-history
- **浮层/交互**：`@floating-ui/react` 0.26
- **样式**：SCSS（`sass`），BEM 命名 + CSS 变量主题
- **测试**：Vitest 4（jsdom）、Testing Library、Playwright
- **工具链**：`oxlint`、`oxfmt`

## 开发规范

- 命令：`npm run start`（7200）、`npm run build`、`npm run build:web`、`npm test`、`npm run lint`、`npm run format`。
- 新增面向用户的文案必须同时补 5 种语言（`zh/en/ru/ar/vi`），键名加到 `i18n/types.ts` 的 `Translations`，否则 `t()` 会回退成键名本身。
- 主题色不要写死，使用 `--color-*` / `--island-*` CSS 变量，否则深色主题会失效。
- 画布内部坐标与屏幕坐标必须经 `toViewBoxPoint` / `toHostPoint` 转换，直接使用 `event.clientX` 会导致缩放后定位错乱。
- 修改 `packages/*/src` 的公共 API 时同步检查 `tsconfig.base.json` 与各 `vite.config.ts` 的 `external` 列表。


## 关联文档

- [apps/AGENTS.md](apps/AGENTS.md) — 宿主应用层
- [packages/AGENTS.md](packages/AGENTS.md) — 三个内部库的边界
- [packages/drawnix/AGENTS.md](packages/drawnix/AGENTS.md) — 业务主体
- [packages/drawnix/src/agent/AGENTS.md](packages/drawnix/src/agent/AGENTS.md) — Agent 实现
- [packages/react-board/AGENTS.md](packages/react-board/AGENTS.md) — 渲染运行时
- [packages/react-text/AGENTS.md](packages/react-text/AGENTS.md) — 文本编辑层
- [scripts/AGENTS.md](scripts/AGENTS.md) — 发版脚本
<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
