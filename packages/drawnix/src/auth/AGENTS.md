# auth

> 📂 路径：`packages/drawnix/src/auth`
> 🏷️ 类型：**Module**（项目级会话）

---

## 概览

这个目录负责**整个 DrawMe 项目的登录态**，不是 Agent 私有功能。顶栏账户区、全局登录弹窗、Agent 面板、未来的云同步与协作都读取同一个会话快照。

会话本体是 `apps/api` 签发的 HttpOnly Cookie；浏览器不保存令牌。前端只保存 `AuthUser`（`{ id, email, displayName }`）的只读快照，所有请求使用 `credentials: 'same-origin'`。

## 状态模型

- `status`：`unknown`（尚未探测）/ `signed-out` / `signed-in`。
- `user`：已登录用户；`signed-out` 时为 `null`。
- `authRequired`：服务端是否要求登录；`false` 时顶栏隐藏登录入口，Agent 直接可用。
- `error`：最近一次会话请求的错误文案，仅用于展示。
- `dialogOpen`：全局登录弹窗开关，任何地方都通过 `openAuthDialog()` 打开。

状态是模块级单例 store，通过 `useSyncExternalStore` 暴露为 `useAuthSession()`。第一次挂载的消费者会在 `status === 'unknown'` 时请求 `GET /api/auth/me`；多个组件不会重复发请求。

## API

- `refreshAuthSession()`：拉取当前用户与 `authRequired`，401 视为未登录；网络错误回退到 `signed-out`，避免 UI 卡在 `unknown`。
- `signInWithPassword(email, password)`：调用 `POST /api/auth/login`，成功后写入全局快照。
- `signOut()`：调用 `POST /api/auth/logout` 并清空快照。
- `markSignedOut()`：受保护请求返回 401 时本地降级，不发额外请求。
- `openAuthDialog()` / `closeAuthDialog()`：控制全局弹窗。
- `fetchAuthProviders()`：读取 `GET /api/auth/providers`。端点缺失、返回非 2xx 或 payload 非法时一律返回 `[]`，不影响账号密码登录。

## OAuth 预留

后端通过 `AUTH_OAUTH_PROVIDERS`（JSON 数组）声明可用的 OAuth 登录方式：

```json
[{ "id": "github", "name": "GitHub", "startUrl": "/api/auth/oauth/github/start" }]
```

弹窗只把 `startUrl` 渲染成链接，不接触 client secret。未来的回调路由应在服务端完成授权码交换，然后复用 `sessionStore.create()` + `setSessionCookie()` 签发与密码登录完全相同的会话 Cookie。

`startUrl` 只允许站内相对路径（`/...`）或 `http(s)` 绝对地址；`//host`、非法 id、重复 id 会被配置解析层丢弃。

## 文件

```
auth/
├── session.ts          # 单例会话 store 与动作
├── use-auth-session.ts # useSyncExternalStore 适配器
├── providers.ts        # OAuth provider 列表读取与容错
├── auth-dialog.tsx     # Figma 风格全局登录/账号弹窗
├── auth-dialog.scss
└── index.ts
```

## 开发约束

- 不要在 Agent 面板或其他模块里另建登录表单；统一调用 `openAuthDialog()`。
- `authRequired === false` 时不要渲染登录/账户入口；服务端已经返回 `user_local`，直接按已登录处理。
- 不要把会话令牌、API Key 或用户信息写入 `localStorage`。
- 用户可见文案必须同时补齐 `zh/en/ru/ar/vi`，键名加到 `i18n/types.ts` 的 `Translations`。
- 弹窗与顶栏只使用 `--color-*` / `--island-*` CSS 变量，禁止写死主题色。
- 新增需要登录的请求遇到 401 时调用 `markSignedOut()`，由全局会话决定 UI。

## 关联文档

- [../agent/AGENTS.md](../agent/AGENTS.md) — Agent 如何消费会话
- [../../../../apps/api/AGENTS.md](../../../../apps/api/AGENTS.md) — 后端认证与 Cookie 契约
