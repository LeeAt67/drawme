# api

> 📂 路径：`apps/api`
> 🏷️ 类型：**App**（Fastify BFF / 未来主后端）

---

## 概览

`apps/api` 是 DrawMe 的服务端进程，当前承担 **账号认证 + Agent BFF**：先通过 `/api/auth/*` 建立 HttpOnly Cookie 会话，再向前端暴露受保护的 `/api/agent/*`，在服务端注入 `model`、`tools`、`tool_choice`、`stream`，并代理任意 OpenAI Chat Completions 兼容接口。本地开发可用 `AUTH_DISABLED=true` 跳过登录，所有请求固定使用 `user_local`。

它按**模块化单体**组织，而不是微服务：后续账号、团队、文档、分享、计费、模板会在 `src/modules/*` 下独立成模块，共享同一个进程与数据库连接。

## 技术选型

- **Fastify 5**：schema 友好、插件隔离清晰、默认性能与日志能力足够；相比 Express 更适合长期演进，相比 Nest 更轻。
- **@fastify/cookie**：签发/清理不可读的会话 Cookie；令牌是 256-bit 随机值，服务端只保存 SHA-256 哈希。
- **Node scrypt**：密码哈希使用随机盐 + `timingSafeEqual`，不引入额外密码库。
- **zod**：请求体校验与错误消息统一；不引入额外 ORM/校验体系。
- **Node 22 原生 fetch**：调用上游模型，不引入 OpenAI SDK，避免版本耦合。
- **tsx watch**：仅开发期热重载；生产构建为 CJS（根 `package.json` 未设 `type: module`），入口 `dist/apps/api/main.js`。

## 环境变量

见 `.env.example`。真实 `.env` 不入库。

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `AGENT_API_BASE_URL` | `https://api.openai.com/v1` | 上游 base URL，也可给完整 `/chat/completions` |
| `AGENT_API_KEY` | 空 | 未设置时 `/api/agent/chat` 返回 `503 agent_not_configured` |
| `AGENT_MODEL` | `gpt-4o-mini` | 服务端强制注入的模型名 |
| `AGENT_TIMEOUT_MS` | `60000` | 上游请求超时 |
| `AGENT_RATE_LIMIT_PER_MINUTE` | `20` | 按会话 Cookie（无 Cookie 时按 IP）限流 |
| `PORT` / `HOST` | `8787` / `0.0.0.0` | 监听地址 |
| `WEB_DIST_DIR` | 空 | 可选，API 同时托管 `dist/apps/web` 并做 SPA fallback |
| `AUTH_DISABLED` | `false` | `true` 时免密码，所有请求使用 `user_local`；公开部署必须关闭 |
| `AUTH_ADMIN_EMAIL` | `admin@drawme.local` | 登录邮箱；`AUTH_DISABLED=false` 且未配置账号时 API 拒绝启动 |
| `AUTH_ADMIN_PASSWORD` | 空 | 开发用明文密码，启动时用 scrypt 哈希 |
| `AUTH_ADMIN_PASSWORD_HASH` | 空 | 生产首选，`scrypt$<salt>$<hash>` 格式 |
| `AUTH_RATE_LIMIT_PER_MINUTE` | `10` | 登录接口按 IP 限流，`0` 表示关闭 |
| `AUTH_OAUTH_PROVIDERS` | 空 | JSON 数组，声明 OAuth 登录方式（`id` / `name` / `startUrl`） |
| `SESSION_TTL_HOURS` | `168` | 会话有效期（小时） |
| `SESSION_COOKIE_NAME` | 见说明 | 未设置时开发用 `drawme_session`，`COOKIE_SECURE=true` 时用 `__Host-drawme_session` |
| `COOKIE_SECURE` | 生产为 `true` | 只允许 HTTPS 发送 Cookie |
| `ALLOWED_ORIGINS` | 空 | 逗号分隔的额外可信 Origin；非生产自动信任 `localhost:7200` |

## 接口契约

```
GET /api/health
=> { ok: true }

POST /api/auth/login
body { email, password }
=> Set-Cookie + { user: { id, email, displayName } }

GET /api/auth/me
=> { user, authRequired: boolean } | 401 authentication_required

# AUTH_DISABLED=true 时
GET /api/auth/me
=> { user: { id: 'user_local', email: 'local@drawme.local', displayName: 'Local user' }, authRequired: false }

POST /api/auth/login
=> 409 auth_disabled

GET /api/auth/providers            # 公开
=> { providers: Array<{ id, name, startUrl }> }   # 免密码模式下恒为 []

POST /api/auth/logout
=> { ok: true } + 清除 Cookie

GET /api/agent/config            # 需要登录；AUTH_DISABLED=true 时直接放行
=> { configured: boolean; model: string }

POST /api/agent/chat             # 需要登录；AUTH_DISABLED=true 时直接放行
body { messages: Array<{ role, content, tool_calls?, tool_call_id? }> }
=> { message: { role: 'assistant'; content: string | null; tool_calls?: [...] } }

error
=> { error: { code: string; message: string } }
```

前端**只允许**发送 `{ messages }`；模型、工具定义、鉴权头全部由服务端补齐。

## 模块结构

```
src/
├── main.ts                 # 加载 .env，监听端口
├── app.ts                  # Fastify 装配、错误处理、静态托管
├── config.ts               # 环境变量解析与端点拼接
├── shared/errors.ts        # 统一错误码/消息
└── modules/
    ├── auth/
    │   ├── routes.ts       # login/me/logout/providers
    │   ├── guard.ts        # 会话校验与 request.authContext
    │   ├── local-user.ts   # AUTH_DISABLED=true 时的固定本地身份
    │   ├── origin.ts       # unsafe /api 请求的 Origin/Referer 校验
    │   ├── session-store.ts # 内存会话，存 token 哈希
    │   ├── session-cookie.ts
    │   ├── password.ts     # scrypt 哈希/校验
    │   ├── user-store.ts   # 当前单管理员的内存用户表
    │   └── seed.ts         # 从环境变量创建管理员
    └── agent/
        ├── routes.ts       # GET /config、POST /chat
        ├── schema.ts       # zod：消息、工具调用、长度上限
        ├── service.ts      # 上游 fetch 与响应裁剪
        └── tool-definition.ts  # create_diagram 定义（与前端一致）
```

## 开发约束

- 错误处理必须在注册子插件**之前**设置，Fastify 子插件继承注册时的处理器。
- `bodyLimit` 已限制为 256KB；新增路由不要放宽到无上限。
- 任何密钥只读环境变量，禁止写入日志、响应或仓库。
- 新增需要登录的接口必须挂 `onRequest: requireAuth`；不要在前端校验登录态。
- `AUTH_DISABLED=true` 时 `requireAuth` 注入 `user_local`，不再读取 Cookie；该模式不得用于公开部署。
- `GET /api/auth/providers` 必须保持公开且无副作用；它只暴露可展示的登录方式，不包含 client secret。
- Cookie 只存放不透明会话令牌，禁止把用户信息、角色或 API Key 塞进 Cookie。
- 所有修改状态的 `/api/*` 请求都会校验 Origin/Referer；新增可信域名走 `ALLOWED_ORIGINS`。
- 当前会话是**进程内存**实现，API 重启即失效；扩容或多实例前必须替换为 Redis/数据库。
- 新增业务表从第一天带 `workspace_id`；画布 JSON 必须带 `schemaVersion`。
- 权限模型先固定 `owner` / `editor` / `viewer`，分享走 token。

## OAuth 预留

`AUTH_OAUTH_PROVIDERS` 是 JSON 数组，例如：

```json
[{ "id": "github", "name": "GitHub", "startUrl": "/api/auth/oauth/github/start" }]
```

解析层会丢弃非法 id、重复 id、空名称以及不安全的 `startUrl`（`//host`），并把数量限制在 10 个以内；配置写错不会阻止 API 启动。前端只拿到这个列表并渲染链接。

后续实现 OAuth 时，在服务端新增 `/api/auth/oauth/:provider/start` 与 callback：callback 完成授权码交换后，创建或绑定本地用户，再复用 `sessionStore.create()` + `setSessionCookie()` 签发与密码登录相同的 HttpOnly 会话。client id/secret 只能放在环境变量，禁止下发浏览器。

## 测试

- Vitest：`npx nx test api`
- 覆盖配置解析、认证路由/Cookie/CSRF/密码哈希、agent 鉴权、zod 校验、上游服务与工具定义；上游一律 mock，不发真实请求。
