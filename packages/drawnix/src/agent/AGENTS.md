# agent

> 📅 生成于：2026-10-27
> 📂 路径：`packages/drawnix/src/agent`
> 🏷️ 类型：**Module**（DrawMe Agent）

---

## 概览

DrawMe Agent 是一个**纯前端**的对话式画图助手：面板收集自然语言 → 调用 OpenAI 兼容的 `/chat/completions` → 模型返回 `tool_calls` → 前端把 Mermaid/Markdown 解析成 Plait 元素并插入画布。

它横跨三件事：UI（`agent-panel`）、工具协议（`tool-definition` + `agent-service`）、画布写入（`diagram`）。配置与提示词分别落在 `config` 与 `prompt`。

## 相关概念

- **`create_diagram` 工具**：唯一的函数工具，参数 `{ format: 'mermaid'|'markdown', content, title? }`。模型负责选语法，前端只做校验与渲染。
- **最多 5 步**：`runAgentTurn` 的 `maxSteps` 默认 5，防止模型在"调用工具 → 再调用工具"之间无限循环；触顶时返回固定中文提示而不是抛错。
- **级联插入**：同一轮里多次调用 `create_diagram` 时，第二次会使用上一次返回的 `nextCursor`（首个图右侧 80px），因此多图横向排列而不是重叠。该游标保存在 `agent-panel` 的局部变量里，**跨轮不保留**。
- **密钥仅本地**：配置存 `localStorage` 的 `drawme.agent.provider`，请求从浏览器直发。生产环境必须改成后端代理，否则密钥会暴露给终端用户。
- **配置未就绪时的行为**：`isAgentProviderConfigReady` 为假时点击发送会**直接打开设置面板**，不发送请求。

## 测试用例覆盖

- [x] `agent-service.spec.ts` — 使用注入的 `fetchImpl` 覆盖：纯文本回复、单工具调用、未知工具、多步循环、触顶、HTTP 错误、AbortSignal
- [x] `config.spec.ts` — `normalizeBaseUrl`（去尾斜杠）、完整 `/chat/completions` 地址识别、读写与非法 JSON 回退
- [x] `tool-definition.spec.ts` — 参数校验：非法 JSON、非法 format、空内容、超 20000 字符、代码围栏剥离
- [ ] `agent-panel.tsx`（发送、停止、错误提示）与 `diagram.ts`（几何计算）无单测

## 相关概念（数据契约）

- `AgentProviderConfig`、`AgentTurnResult`、`AgentToolEvent`、`AgentDiagramFormat`、`AgentInsertionCursor` 均定义在 `types.ts`，类型本身以源码为准，这里只强调约束：`baseUrl` 允许是裸 base 或完整 endpoint；`apiKey` 允许为空（本地模型）。

## Props 定义

本模块无对外 Props；`AgentPanel` 不接收参数，完全依赖 `useDrawnix()` 与 `useBoard()`：

- `appState.agentPanelOpen`：面板可见性开关，由创建工具栏的 ✨ 按钮切换。
- `board`：插入目标。
- `showToast`：插入成功后提示。


## 状态管理

面板只持有三类局部状态，均为会话级、不持久化：

- `messages`：对话记录（含 `toolEvents` 与 `isError`），刷新即丢失。
- `input` / `isRunning` / `activity`：输入内容、请求中标记、进度文案。
- `insertionCursor`：发送函数的局部变量，仅在本轮工具调用间传递，用于让同一轮的多个图表横向排布。

跨组件状态只有两个：`appState.agentPanelOpen`（显隐）与 `localStorage` 的 `drawme.agent.provider`（模型配置）。不要把消息记录放进 `appState`，否则每次流式进度都会触发整个画布树重渲染。

## 功能页面

不是页面，而是画布右上角的浮层 `<aside class="agent-panel">`，包含两个视图：

- **模型连接**（`settingsOpen=true`）：API 地址、模型、密钥与三个预设（OpenAI / DeepSeek / Ollama）。
- **对话视图**（默认）：空态建议、消息列表、工具事件行、输入区与停止按钮。
## 渲染逻辑

### 面板状态机

```
settingsOpen = !localStorage 中已有 apiKey      ← 初始值，因此"没填过密钥"直接进设置页
 ├─ 打开：渲染 <AgentSettings>（内部再分 OpenAI/DeepSeek/Ollama 预设）
 └─ 关闭：渲染消息列表 + 输入区
```

### 发送流程

1. `sendMessage(text = input)`：空串或 `isRunning` 时直接返回（防重复提交）。
2. 配置不完整 → `setSettingsOpen(true)` 并终止。
3. 把历史消息（过滤掉 `isError`）作为 `history`，构造 `buildAgentSystemPrompt({ language, context })`，其中 `context` 是当前 `board.children.length` 与选中数——**每次发送都重新计算**，模型因此知道画布规模。
4. `runAgentTurn` 内循环请求；`onProgress` 把模型文本打到 `activity`（"正在思考"区域）。
5. `executeTool` 中：`parseCreateDiagramArguments` → `insertAgentDiagram` → 返回 `{ ok, summary, output }`，`summary` 直接展示在消息的工具事件行。
6. 结束后：追加 assistant 消息；若任一工具成功则 `showToast('agent.toast.inserted')`。
7. `AbortError` 与其它错误分别落到 `agent.error.aborted` / `agent.error.request`，标记 `isError` 且不进入后续 history。

### 插入几何

`insertAgentDiagram` 不传 `cursor` 时按"当前视口中心"定位：用 `getViewportOrigination` + 容器尺寸 / zoom 反推出视口中心的画布坐标，再减去图宽高的一半。因此**缩放状态下插入位置仍然居中**；若直接使用屏幕坐标会偏。

元素尺寸由 `getElementBounds` 计算，会先过滤掉 `PlaitGroupElement`（组元素没有 `points`），再用 `RectangleClient.getBoundingRectangle` 求并集。

## 数据结构

- 消息：`{ id, role: 'user'|'assistant', content, toolEvents?, isError? }`，`id` 由时间戳 + 随机串生成。
- 工具事件：`{ id, name, ok, summary }`，只保留展示所需字段，原始 output 只回传给模型。
- 游标：`{ x, y }`，画布坐标系（非屏幕坐标）。

## API 和服务

- **`runAgentTurn(options)`**：唯一的网络编排入口。可注入 `fetchImpl`（测试用）、`signal`（中止）、`maxSteps`。
  - 请求体固定带 `tools: [CREATE_DIAGRAM_TOOL_DEFINITION]`、`tool_choice: 'auto'`、`stream: false`。
  - 只有 `config.apiKey` 非空时才加 `Authorization`，因此本地模型可留空。
  - 非 2xx 时优先解析 `error.message`，否则回退原文或状态码。
- **`insertAgentDiagram(board, format, content, cursor?)`**：动态 `import()` 解析器，Mermaid 首轮失败会尝试把双引号替换为单引号重试（常见语法容错）。
- **`parseCreateDiagramArguments(raw)`**：接受字符串或对象；会剥离 ` ```mermaid/markdown ` 围栏；内容上限 20000 字符。

## 模块结构

```
agent/
├── agent-panel.tsx        # 面板 UI + 发送状态机 + 级联游标
├── agent-panel.scss       # 436 行，含移动端全屏布局
├── agent-settings.tsx     # 模型地址/模型/密钥表单 + 预设
├── agent-service.ts       # 对话循环、请求、工具分发
├── agent-service.spec.ts
├── config.ts              # 读取/规范化/保存配置
├── config.spec.ts
├── prompt.ts              # 中英系统提示词（含画布上下文）
├── tool-definition.ts     # create_diagram 定义 + 参数校验
├── tool-definition.spec.ts
├── diagram.ts             # 解析 Mermaid/Markdown 并插入画布
└── types.ts               # 数据契约
```

## 交互和事件

- Enter 发送、Shift+Enter 换行；`isComposing` 判断用于避免中文输入法回车误发送。
- 运行中显示"停止"按钮（`StopIcon`），点击 `abortController.abort()`。
- 消息区自动滚动到底部：`useEffect` 依赖 `[messages, activity, isRunning]`。
- 面板关闭走 `appState.agentPanelOpen = false`，与工具栏按钮共用同一状态。

## 复用说明

- 想在别处复用"生成并插入"能力，直接调用 `insertAgentDiagram` 即可，不需要面板。
- 想换模型协议（如 Responses API），只需替换 `agent-service.ts` 的 `requestChatCompletion` 与 `normalizeToolCalls`，`diagram.ts` 无需改动。

## 依赖关系

- 上游：`hooks/use-drawnix`（`agentPanelOpen`）、`i18n`、`components/icons`、`@drawme/react-board` 的 `useBoard`。
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
