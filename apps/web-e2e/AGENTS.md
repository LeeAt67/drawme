# web-e2e

> 📅 生成于：2026-10-27
> 📂 路径：`apps/web-e2e`
> 🏷️ 类型：**Module**（端到端测试）

---

## 概览

Playwright 测试工程，验证"真实浏览器里应用能起来"。当前只有冒烟级覆盖率，是**唯一**会启动完整 dev server 并断言 DOM 的测试层。

## 相关概念

- **`webServer` 自启**：`command: 'npx nx serve web'`，`reuseExistingServer: !process.env.CI`。本地开发时若 7200 已有 dev server，Playwright 会复用，所以**改了库代码后务必确认复用的是最新服务**，否则测试可能跑旧代码。
- **`BASE_URL`**：默认 `http://localhost:7200`，可用环境变量指向已部署环境做线上冒烟。
- **三浏览器矩阵**：chromium / firefox / webkit。移动端与 branded 浏览器配置是注释掉的，需要时自行解注释。
- **产物路径**：报告与 trace 都落在 `dist/.playwright/apps/web-e2e/`，已被 git 忽略。

## 状态管理

无（测试上下文由 Playwright fixture 提供）。

## 功能页面

- 覆盖主页面 `/` → [src/AGENTS.md](src/AGENTS.md)

## 核心功能和数据流

```
nx e2e web-e2e
  → playwright 读取 config
  → 复用或启动 nx serve web (7200)
  → 三浏览器并行执行 src/*.spec.ts
  → 失败时 trace: on-first-retry
```

## 模块内的组件

无。

## 服务和工具

- **`playwright.config.ts`**：`testDir: './src'`、`fullyParallel: true`、CI 下 `retries: 2` 且 `workers: 1`。

## 模块结构

```
web-e2e/
├── playwright.config.ts   # baseURL、webServer、三浏览器
├── project.json           # Nx e2e target（@nx/playwright 推断）
├── tsconfig.json
└── src/
    └── example.spec.ts    # 冒烟用例
```

## 测试用例覆盖

- [x] `src/example.spec.ts` → `loads the DrawMe board`：断言 `<title>` 匹配 `/DrawMe/`、`.drawnix` 与 `.drawnix .plait-board-container` 可见
- [ ] 工具切换、Agent 面板开关、导入导出链路均无 E2E 覆盖

## 关联文档

- [src/AGENTS.md](src/AGENTS.md)
- [../web/AGENTS.md](../web/AGENTS.md)
- [../../packages/drawnix/src/components/toolbar/AGENTS.md](../../packages/drawnix/src/components/toolbar/AGENTS.md) — 若要补工具栏 E2E，选择器以此为准

## 技术栈

- `@playwright/test` 1.36+
- `@nx/playwright`、`@nx/devkit`（`workspaceRoot`）


## 常见改动指引

| 需求 | 改动位置 |
| --- | --- |
| 对线上环境冒烟 | `BASE_URL=https://... nx e2e web-e2e` |
| 增加浏览器 | `projects` 数组（移动端/branded 配置已注释） |
| 改自启命令 | `webServer.command`（当前 `npx nx serve web`） |
| 调试失败 | `npx playwright show-report dist/.playwright/apps/web-e2e/playwright-report` |

## 易错点与约束

- `reuseExistingServer` 在本地为真，若 7200 上是旧代码的 dev server，测试会"通过但验证的是旧代码"。改动库代码后建议重启服务再跑。
- CI 下 `workers: 1`，本地并行；用例之间不要共享浏览器存储状态（localforage 会残留）。
- 测试产物在 `dist/.playwright/`，不要提交。

## 变更检查清单

- [ ] 新增用例是否依赖持久化状态（localforage 残留会导致顺序相关失败）。
- [ ] 是否在 CI 上也能通过（避免依赖本地已启动的服务）。
- [ ] 选择器是否使用稳定的类名/`aria-label`，而不是 DOM 层级。

## 排查思路

- 全部超时：检查 7200 是否被占用或 dev server 启动失败（`webServer` 会等待 URL 就绪）。
- 本地过、CI 失败：多为时序或浏览器差异，优先看 trace。
<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
