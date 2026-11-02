# agent

> 📅 生成于：2026-10-27
> 📂 路径：`packages/drawnix/src/agent`
> 🏷️ 类型：**Module**（DrawMe Agent）

---

## 概览

DrawMe Agent 是一个**前后端分离**的对话式画图助手：面板收集自然语言 → POST 同源 `/api/agent/chat`（`apps/api` 的 Fastify BFF 代理 OpenAI 兼容的 `/chat/completions`）→ 模型返回 `tool_calls` → 前端把 Mermaid/Markdown 解析成 Plait 元素并插入画布。

它横跨三件事：UI（`agent-panel`）、工具协议（`tool-definition` + `agent-service`）、画布写入（`diagram`）。配置与提示词分别落在 `config` 与 `prompt`。

## 相关概念

- **工具注册表**：`tools/registry.ts` 是唯一手写源，导出 `create_chart` / `create_diagram` / `inspect_board` 三个工具定义与白名单。服务端的 tools 数组由 `npm run sync:agent-tools` 生成到 `apps/api/src/modules/agent/tool-definitions.generated.ts`，两边由 `toEqual` 测试锁死。**新增工具只改注册表**。
- **三工具分工**：`create_chart` 走结构化 `ChartSpec`（默认路径）；`create_diagram` 是 mermaid/markdown 逃生通道；`inspect_board` 读画布（`summary` / `selection` / `all`），用于"这块/选中的"这类指代。
- **结构化错误**：工具失败统一返回 `{ ok:false, error:{ code, path?, message, hint?, problems? } }`，`path` 是 spec 的绝对字段路径（如 `edges[0].to`），模型据此定向修复；`ChartSpecError` 携带 `problems` 数组。
- **步数与预算**：`maxSteps` 默认 5，`maxToolCalls` 默认 8；工具调用**严格串行**（插入游标是共享状态），超预算返回 `tool_budget_exceeded` 并结束本轮。
- **级联插入**：同一轮里多次调用绘图工具时，第二次会使用上一次返回的 `nextCursor`（首个图右侧 80px），因此多图横向排列而不是重叠。该游标保存在 `agent-panel` 的局部变量里，**跨轮不保留**。
- **密钥仅在服务端**：`AGENT_API_KEY` 等环境变量由 `apps/api` 读取，浏览器只拿到 `{ configured, model }`；前端**不得**再出现 API Key 输入框或 `Authorization` 头。
- **登录态属于整个项目**：会话由 `src/auth` 的全局 store 持有，登录入口在顶栏账户区与 `AuthDialog`，Agent 面板只消费 `useAuthSession()`，不得再实现自己的登录表单。`authRequired=false`（本地免密码模式）时顶栏不显示登录入口，Agent 直接使用 `user_local`。
- **配置未就绪时的行为**：面板不再有独立设置视图。仅在 `authRequired=true` 且明确 `signed-out` 时，点击发送才打开项目级 `AuthDialog`；`GET /api/agent/config` 返回 `configured=false` 时，发送会在对话里追加一条错误提示并重新拉取配置；请求失败用 toast 提示。聊天返回 401 时调用 `markSignedOut()` 并打开全局登录弹窗。

## 测试用例覆盖

- [x] `agent-service.spec.ts` — 使用注入的 `fetchImpl` 覆盖：同源请求、纯文本回复、单工具调用、未知工具、多步循环、触顶、代理 HTTP 错误、空响应
- [x] `config.spec.ts` — `/api/agent/config` 拉取、`{ configured, model }` 规范化、错误消息回退
- [x] `auth.spec.ts` — `/api/auth/me`、登录/退出、用户规范化、同源 credentials 与错误码
- [x] `tool-definition.spec.ts` — 参数校验：非法 JSON、非法 format、空内容、超 20000 字符、代码围栏剥离
- [x] `annotation.spec.ts` — 矩形归一化、元素文本提取、类型统计、批注上下文拼装（中/英）
- [ ] `agent-panel.tsx`（发送、停止、错误提示）与 `diagram.ts`（几何计算）无单测

## 相关概念（数据契约）

- `AgentServerConfig`、`AgentTurnResult`、`AgentToolEvent`、`AgentDiagramFormat`、`AgentInsertionCursor` 均定义在 `types.ts`，类型本身以源码为准。`AgentServerConfig` 只包含 `{ configured: boolean; model: string }`，是服务端能力的只读快照。

## Props 定义

本模块无对外 Props；`AgentPanel` 不接收参数，完全依赖 `useDrawnix()` 与 `useBoard()`：

- `appState.layout.agentOpen`：输入框可见性开关，由创建工具栏 / 导航栏的 ✨ 按钮与 `Alt+0` 切换。
- `board`：插入目标。
- `showToast`：插入成功后提示。


## 状态管理

面板只持有五类局部状态，均为会话级、不持久化：

- `messages`：对话记录（含 `toolEvents` 与 `isError`），刷新即丢失。
- `input` / `isRunning` / `activity`：输入内容、请求中标记、进度文案。
- `annotationMode` / `draftRect` / `annotation`：框选进行态、拖拽中的屏幕矩形、已提交的画布批注。
- `status` / `user` / `authRequired`：来自 `useAuthSession()` 的只读会话快照；登录受服务端控制，本地免密码模式下无需任何登录操作。
- `insertionCursor`：发送函数的局部变量，仅在本轮工具调用间传递，用于让同一轮的多个图表横向排布。

跨组件状态只有 `appState.layout.agentOpen`（显隐）。它与 `layout.toolbarCollapsed` **互斥**：打开 Agent 会收起底部工具栏，收起工具栏会关闭 Agent；两组联动常量在 `components/shell/use-layout.ts` 的 `layoutForAgentOpenChange` / `layoutForToolbarCollapseChange` 中，快捷键与按钮共用。服务端配置是面板内的一次性快照（`serverConfig`），请求进行中用 `serverConfigLoadingRef` 去重，不持久化到浏览器。不要把消息记录放进 `appState`，否则每次流式进度都会触发整个画布树重渲染。

## 功能页面

不是页面，而是挂在画布底部的浮动输入框 `<section class="dx-agent">`，**只有一个对话视图**：输入框常驻，有消息时在输入框上方展开消息列表、工具事件行与停止按钮。没有空态建议、没有设置页、没有独立登录表单；登录与账号信息统一在顶栏账户区。打开时自动聚焦输入框，Esc 或右侧关闭按钮收起。
## 渲染逻辑

### 面板状态机

```
面板打开 → 读取全局会话（本地免密码模式返回 user_local）
 ├─ authRequired=false：直接拉取配置并对话，不显示登录入口
 ├─ signed-out：直接渲染对话；发送时打开全局 AuthDialog
 └─ signed-in → GET /api/agent/config（结果只用于发送前检查）
     └─ 面板始终渲染消息列表 + 输入区
```

### 发送流程

1. `sendMessage(text = input)`：空串或 `isRunning` 时直接返回（防重复提交）。
2. `authRequired=true` 且明确未登录 → `openAuthDialog()`；`serverConfig?.configured !== true` → 追加错误消息并重新拉取配置，本轮不发送。
3. 把历史消息（过滤掉 `isError`）作为 `history`，构造 `buildAgentSystemPrompt({ language, context })`，其中 `context` 是当前 `board.children.length` 与选中数——**每次发送都重新计算**，模型因此知道画布规模。带批注的轮次用 `buildAnnotationMessage` 把区域坐标、元素类型计数与文本片段拼进 user message；绘图插入游标取批注区域左下角，避免盖住原内容。
4. `runAgentTurn` 内循环请求；`onProgress` 把模型文本打到 `activity`（"正在思考"区域）。
5. `executeTool` 中按工具名分发：`inspect_board` → `parseInspectArguments` + `inspectBoard`；`create_chart` → `parseChartSpec` → `buildChartSource` → `insertAgentDiagram`；`create_diagram` → `parseCreateDiagramArguments` → `insertAgentDiagram`。统一返回 `{ ok, summary, output }`，`summary` 直接展示在消息的工具事件行，`output` 原样回填给模型。
6. 结束后：追加 assistant 消息；若任一工具成功则 `showToast('agent.toast.inserted')`。
7. `AbortError` 与其它错误分别落到 `agent.error.aborted` / `agent.error.request`，标记 `isError` 且不进入后续 history。

### 插入几何

`insertAgentDiagram` 不传 `cursor` 时按"当前视口中心"定位：用 `getViewportOrigination` + 容器尺寸 / zoom 反推出视口中心的画布坐标，再减去图宽高的一半。因此**缩放状态下插入位置仍然居中**；若直接使用屏幕坐标会偏。

元素尺寸由 `getElementBounds` 计算，会先过滤掉 `PlaitGroupElement`（组元素没有 `points`），再用 `RectangleClient.getBoundingRectangle` 求并集。

## 数据结构

- 消息：`{ id, role: 'user'|'assistant', content, toolEvents?, isError? }`，`id` 由时间戳 + 随机串生成。
- 批注：`BoardAnnotation = { id, rect, elementCount, typeCounts, texts, elements, createdAt }`，`rect` 使用画布 viewBox 坐标；只存在面板局部 state，不写入 `appState` 或画布。
- 带批注的用户消息额外保存 `annotation`（展示用）与 `historyContent`（真正发给模型的结构化区域上下文），后续轮次沿用 `historyContent`。
- 工具事件：`{ id, name, ok, summary }`，只保留展示所需字段，原始 output 只回传给模型。
- 游标：`{ x, y }`，画布坐标系（非屏幕坐标）。

## API 和服务

- **`fetchAuthSession()` / `fetchCurrentUser()` / `loginAgent(email, password)` / `logoutAgent()`**：`auth.ts` 封装 `/api/auth/*`，全部使用 `credentials: 'same-origin'`。`fetchAuthSession` 同时读取 `authRequired`；401 视为需要登录。
- **`runAgentTurn(options)`**：唯一的网络编排入口。可注入 `fetchImpl`（测试用）、`signal`（中止）、`maxSteps`、`maxToolCalls`、`toolChoice`。
  - 只向同源 `POST /api/agent/chat` 发送 `{ messages, tool_choice }`；`model`、`tools`、`stream` 由服务端注入，`tool_choice` 服务端只放行 `auto` 与注册表内工具名。
  - 不发送任何鉴权头；会话 Cookie 自动携带，API Key 由服务端持有。
  - 非 2xx 时抛出带 `status` / `code` 的 `AgentApiError`；401 由面板识别为会话过期。
- **`insertAgentDiagram(board, format, content, cursor?)`**：动态 `import()` 解析器，Mermaid 首轮失败会尝试把双引号替换为单引号重试（常见语法容错）。
- **`parseCreateDiagramArguments(raw)`**：接受字符串或对象；会剥离 ` ```mermaid/markdown ` 围栏；内容上限 20000 字符。
- **`parseChartSpec(raw)`**：校验 ChartSpec v1，按 `kind` 分派到 network/tree/sequence/timeline/matrix/data 六族；产出带 `path` 的 `ChartSpecError`。
- **`buildChartSource(spec)`**：P0 渲染通道，network → mermaid flowchart、tree → markdown 思维导图、sequence → mermaid sequenceDiagram；timeline/matrix/data 抛 `unsupported-kind` 并给出 `create_diagram` 降级提示。

## 模块结构

```
agent/
├── annotation.ts          # 框选矩形归一化、元素摘要、批注上下文拼装
├── annotation.spec.ts
├── agent-panel.tsx        # 面板 UI + 发送状态机 + 级联游标
├── agent-panel.scss       # 底部浮动输入框与消息气泡，含移动端适配
├── auth.ts                # /api/auth/me、login、logout 底层客户端（由 src/auth 复用）
├── auth.spec.ts
├── agent-service.ts       # 对话循环、请求、工具分发
├── agent-service.spec.ts
├── config.ts              # 同源 Agent API 端点、AgentApiError、拉取服务端配置
├── config.spec.ts
├── prompt.ts              # 中英系统提示词（含画布上下文）
├── tool-definition.ts     # 从注册表派生 create_diagram 定义 + 参数校验
├── tool-definition.spec.ts
├── diagram.ts             # 解析 Mermaid/Markdown 并插入画布
├── types.ts               # 数据契约
├── chart/
│   ├── spec.ts            # ChartKind / ChartSpec / Renderer 契约
│   ├── parse.ts           # ChartSpec 校验（结构化错误 + path）
│   └── source.ts          # spec → mermaid / markdown（P0 中转）
└── tools/
    ├── registry.ts        # 工具定义唯一手写源（服务端代码生成自此）
    ├── inspect.ts         # inspect_board 实现
    └── registry.spec.ts
```

## 交互和事件

- Enter 发送、Shift+Enter 换行；`isComposing` 判断用于避免中文输入法回车误发送。
- 输入框左侧「批注选区」按钮进入框选模式：`.dx-agent__annotation-layer` 覆盖画布并接管 pointer 事件；松手后用 `toHostPoint` → `toViewBoxPoint` 把屏幕矩形转成画布坐标。
- 批注摘要用 `getRectangleByElements` + `RectangleClient.isHit` 收集相交元素，输出类型计数与文本片段；输入框上方显示可移除的批注 chip，发送后清空。
- 批注 chip / 框选提示用 `--color-surface-mid`、`--color-surface-high` + `--color-border-outline-variant` 与画布分层（`--island-bg-color` 在暗夜主题下与画布几乎同色）；次要文字浅色用 `--color-gray-70`，`.drawnix.theme--dark` 下覆盖为 `--color-gray-60`，两套主题对比度均 ≥ 4.5:1。
- 运行中显示"停止"按钮（`StopIcon`），点击 `abortController.abort()`。
- 消息区自动滚动到底部：`useEffect` 依赖 `[messages, activity, isRunning]`。
- 关闭走 `useLayout().closeAgent()`（同时恢复工具栏），与 ✨ 按钮、`Alt+0` 共用同一状态。

## 复用说明

- 想在别处复用"生成并插入"能力，直接调用 `insertAgentDiagram` 即可，不需要面板。
- 想换模型协议（如 Responses API），只需替换 `agent-service.ts` 的 `requestChatCompletion` 与 `normalizeToolCalls`，`diagram.ts` 无需改动。

## 依赖关系

- 上游：`hooks/use-drawnix`（`layout.agentOpen`）、`components/shell/use-layout`（互斥开关）、`i18n`、`components/icons`、`@drawme/react-board` 的 `useBoard`。
- 上游（认证）：`../auth` 的全局会话 store；底层仍是 `apps/api` 的 `/api/auth/*` 同源 Cookie。
- 下游（动态）：`@plait-board/mermaid-to-drawnix`、`@plait-board/markdown-to-drawnix`、`@plait/core`（视口与 Rectangle）。

## 关联文档

- [../components/toolbar/AGENTS.md](../components/toolbar/AGENTS.md) — 打开 Agent 的 ✨ 按钮
- [../styles/AGENTS.md](../styles/AGENTS.md) — `.agent-panel` 样式是否被全局样式影响
- [../../AGENTS.md](../../AGENTS.md) — 库总览

## 技术栈

- OpenAI Chat Completions 协议（tool calling）
- `fetch` + `AbortController`
- `@plait/core`（`getViewportOrigination`、`RectangleClient`、`WritableClipboardOperationType.paste`）

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
