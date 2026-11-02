<h2 align="center">DrawMe · AI 白板与思维导图</h2>

<p align="center">
  一体化白板工具：思维导图、流程图、自由绘制，以及用自然语言生成图表的 DrawMe Agent。
</p>

## 特性

- 🧠 思维导图、流程图、自由绘制
- 🖼️ 插入图片，导出 PNG / SVG / JSON
- 💾 自动保存（浏览器本地缓存）
- 🌌 无限画布：缩放、滚动
- 🎨 多主题模式，适配移动设备
- 📈 Mermaid 转流程图
- ✨ Markdown 转思维导图
- 🤖 DrawMe Agent：用自然语言生成图表并直接插入画布

## 快速开始

```bash
npm install
cp apps/api/.env.example apps/api/.env   # 只需填写模型密钥，本地默认免密码
npm run start:all                        # 同时启动 Web (7200) 与 API (8787)
```

默认启动地址：<http://localhost:7200>

## DrawMe Agent

点击顶部工具栏右侧的 ✨ 按钮打开 Agent，用自然语言描述需求。Agent 会调用 `create_diagram` 工具生成 Mermaid 流程图或 Markdown 思维导图，并直接插入当前画布。

主要能力：

- 支持多轮对话、工具调用、停止生成和多个图表的级联插入
- 兼容任意 OpenAI Chat Completions 接口，模型与地址由服务端环境变量配置
- 本地默认免密码运行，使用固定的 `user_local` 身份；生产环境可恢复项目级登录
- 浏览器只调用同源 `/api/agent/*`，API Key 永远不进入前端

本地开发默认设置 `AUTH_DISABLED=true`，打开 Agent 面板即可直接对话，不会弹出登录框。浏览器只持有会话 Cookie 或本地身份，模型密钥仍只存在于服务端。

### 服务端配置

Agent 请求经由 `apps/api`（Fastify）代理转发，配置项见 `apps/api/.env.example`：

```dotenv
AGENT_API_BASE_URL=https://api.openai.com/v1
AGENT_API_KEY=sk-...
AGENT_MODEL=gpt-4o-mini
# 本地开发免密码；生产环境改为 false 并配置登录账号
AUTH_DISABLED=true
# AUTH_ADMIN_EMAIL=admin@drawme.local
# AUTH_ADMIN_PASSWORD=change-me
```

开发时 `apps/web` 的 Vite dev server 会把 `/api` 代理到 `http://localhost:8787`；生产环境可由 API 通过 `WEB_DIST_DIR` 同时托管构建后的前端，或由反向代理统一到同一域名。

> **安全说明**：API Key 只保存在服务端环境变量中，浏览器无法读取。`AUTH_DISABLED=true` 会让任何能访问 API 的人使用该密钥，只适合本机或可信内网。公开部署前必须改为 `AUTH_DISABLED=false`，配置 `AUTH_ADMIN_EMAIL` / `AUTH_ADMIN_PASSWORD_HASH`，并设置 `COOKIE_SECURE=true`。

## 仓库结构

```
.
├── apps/
│   ├── web                   # Web 应用入口
│   └── api                   # Fastify BFF：Agent 代理与后续业务后端
├── packages/
│   ├── drawnix               # 白板应用
│   ├── react-board           # 白板 React 视图层
│   └── react-text            # 文本渲染模块
├── scripts/                  # 构建与发版脚本
└── package.json
```

> 每个目录下都有 `AGENTS.md`，描述该目录的职责、关键约束与常见改动位置，供 AI 编码助手检索。建议从根目录 [AGENTS.md](AGENTS.md) 开始阅读。

## 常用命令

```bash
npm run start      # 启动开发服务器
npm run start:api  # 仅启动 API 服务
npm run start:all  # 同时启动 Web 与 API
npm run build      # 构建全部项目
npm run build:web  # 仅构建 Web 应用
npm run build:api  # 仅构建 API
npm test           # 运行单元测试
npm run lint       # 代码检查
npm run format     # 代码格式化
```

## Docker

```bash
docker build -t drawme:latest .
docker run --rm -p 8080:8080 \
  -e AGENT_API_KEY=sk-... \
  -e AGENT_MODEL=gpt-4o-mini \
  -e AUTH_DISABLED=false \
  -e AUTH_ADMIN_EMAIL=admin@example.com \
  -e AUTH_ADMIN_PASSWORD=change-me \
  -e COOKIE_SECURE=false \
  drawme:latest
```

镜像内由 Fastify 同时提供 `/api/*` 与构建后的前端静态文件（`WEB_DIST_DIR`），构建完成后访问 8080 端口。

## 许可与第三方声明

本项目基于 MIT 许可的 Drawnix 项目二次开发，并使用了 Plait、Slate、Floating UI 等第三方组件。各组件版权与许可声明见 [LICENSE](LICENSE)、[NOTICE](NOTICE) 及对应依赖包附带的许可文件。
