# apps

> 📅 生成于：2026-10-27
> 📂 路径：`apps/`
> 🏷️ 类型：**Module**（应用层）

---

## 概览

`apps/` 只放**可运行的应用**，不放可复用逻辑。当前有两个 Nx 项目：

- `web`：唯一的浏览器应用。职责是"宿主"——初始化画布、把用户数据持久化到浏览器、提供入口 HTML 与静态资源。它**不含**任何画图/Agent 业务逻辑。
- `web-e2e`：Playwright 端到端测试工程，通过 `BASE_URL`（默认 `http://localhost:7200`）驱动 `web`。

这种切分的意义：`packages/*` 是纯库，不认识 `localforage`、不认识路由；换一个宿主（比如 Electron 壳、SaaS 后端版）时只替换 `apps/` 层即可。

## 相关概念

- **宿主职责边界**：库只暴露 `Drawnix` 组件与回调；"存哪里、存什么、默认语言是什么"全部由 `apps/web` 决定。
- **Nx 目标**：`web` 提供 `serve` / `build` / `test` / `preview`，由 `@nx/vite`、`@nx/vitest` 插件自动推断，`project.json` 里没有手写 targets。
- **workspaceRoot**：`web-e2e` 的 `playwright.config.ts` 用 `@nx/devkit` 的 `workspaceRoot` 作为 `webServer.cwd`，保证从仓库根启动 dev server。

## 状态管理

- `apps/web` 的持久化键（`localforage`）：`main_board_content`（画布）、`main_board_tool_state`（当前工具）、`main_board_preference`（语言与透明背景偏好）。
- Agent 的模型配置**不在**这里，由库内部写入 `localStorage` 的 `drawme.agent.provider`。

## 功能页面

- `/`：白板主页面 → [web/src/app/AGENTS.md](web/src/app/AGENTS.md)

## 核心功能和数据流

```
index.html (meta/JSON-LD)
  → src/main.tsx (StrictMode 挂载)
  → src/app/app.tsx (读 localforage → 渲染 <Drawnix>)
  → 变更回调 → 写回 localforage
```

## 模块内的组件

- `web`（路径：`web/`）— 应用外壳，见 [web/AGENTS.md](web/AGENTS.md)
- `web-e2e`（路径：`web-e2e/`）— E2E 测试，见 [web-e2e/AGENTS.md](web-e2e/AGENTS.md)

## 服务和工具

- 无独立服务层。唯一的外部依赖是 `localforage`（IndexedDB 优先，降级 localStorage）。

## 模块结构

```
apps/
├── web/
│   ├── index.html          # 入口 HTML，含 SEO/OG/JSON-LD
│   ├── project.json        # Nx 项目声明（targets 由插件推断）
│   ├── vite.config.ts      # 端口 7200，产物 dist/apps/web
│   ├── public/             # favicon、robots.txt、_headers、_redirects
│   └── src/
│       ├── main.tsx        # ReactDOM 挂载
│       ├── styles.scss     # 全局重置
│       └── app/            # App 组件（唯一页面）
└── web-e2e/
    ├── playwright.config.ts
    └── src/example.spec.ts
```

## 测试用例覆盖

- [x] Playwright 冒烟测试：`apps/web-e2e/src/example.spec.ts` 校验页面标题与 `.drawnix`、`.plait-board-container` 可见
- [x] Vitest 冒烟测试：`apps/web/src/app/app.spec.tsx`（仅 `expect(true)` 占位）
- [ ] 持久化（localforage 读写）尚无自动化用例

## 关联文档

- [web/AGENTS.md](web/AGENTS.md)
- [web-e2e/AGENTS.md](web-e2e/AGENTS.md)
- [../packages/drawnix/AGENTS.md](../packages/drawnix/AGENTS.md) — 被宿主的库

## 技术栈

- Vite 8 + `@vitejs/plugin-react`
- `localforage`（持久化）
- Playwright（`@playwright/test`）三浏览器：chromium / firefox / webkit


## 常见改动指引

| 需求 | 改动位置 |
| --- | --- |
| 换品牌名/描述 | `apps/web/index.html`（标题、OG、JSON-LD） |
| 改默认语言 | `apps/web/src/app/app.tsx` 的 `preference.language` 默认值 |
| 换持久化后端 | `apps/web/src/app/app.tsx`（把 localforage 换掉即可，库无感知） |
| 改端口 | `apps/web/vite.config.ts` + `apps/web-e2e/playwright.config.ts` 的 `baseURL` |
| 加一条 E2E | `apps/web-e2e/src/` 新增 `*.spec.ts` |

## 变更检查清单

- [ ] 改端口后同步 `web-e2e` 的 `baseURL` 与 `webServer.url`。
- [ ] 改品牌名后同步 `index.html` 标题与 E2E 的标题断言。
- [ ] 新增持久化键后，考虑旧存档的兼容（缺键时要有默认值）。
<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
