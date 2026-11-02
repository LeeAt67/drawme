# 图表生成架构

> 状态：设计稿（P0 未实现）
> 范围：`packages/drawnix/src/agent` 的「生成 → 校验 → 插入」链路
> 目标：把「生成 mermaid 字符串」升级为「生成结构化图表规格，按图表族选择渲染通道」

---

## 1. 现状（事实基线）

| 能力 | 实现 | 限制 |
| --- | --- | --- |
| 工具协议 | 单个 `create_diagram`，参数 `{ format: 'mermaid' \| 'markdown', content }` | 只有两种 format，模型必须自己记住语法 |
| 解析 | `@plait-board/mermaid-to-drawnix` 0.0.8 + `@plait-board/markdown-to-drawnix` | 见下表 |
| 校验 | `parseCreateDiagramArguments`：类型、长度、代码围栏 | 只校验外层参数，不校验图表语义 |
| 插入 | `board.insertFragment` + `getElementBounds` 计算尺寸 | 无分组、无命名、无幂等标记 |
| 定位 | 居中 / 上一张右侧 80px / 批注区域下方 | 仅游标，无栅格对齐 |
| 失败处理 | 抛错 → 工具结果 `ok:false` → 模型可重试 | 错误信息是自由文本，模型修正效率低 |

### mermaid-to-drawnix 的真实能力边界

`parseMermaid.js` 按 `diagram.type` 分支：

| Mermaid 图表类型 | 产物 | 是否可编辑 |
| --- | --- | --- |
| `flowchart-v2`（flowchart / graph） | geometry + arrowLine + text + group | ✅ 完全可编辑 |
| `sequence` | 参与者 / 消息 / 激活块 | ✅ 可编辑 |
| `classDiagram` | 类框 + 关系线 | ✅ 可编辑 |
| 其它全部（er / gantt / pie / state / journey / mindmap / timeline / quadrant / gitGraph / sankey / C4 …） | **一张 SVG 图片**（`graphImage` → `type: 'image'`） | ❌ 不可编辑、不可改色、不随主题变化 |

结论：**「能画」不等于「能编辑」**。甘特、饼图、ER 现在只是一张贴图。这是架构要解决的核心问题。

---

## 2. 设计目标

1. **覆盖更多图表族**，且明确每个图表的「可编辑 / 图片」等级，不假装可编辑。
2. **模型产出的稳定性**优先于语法自由度：用结构化规格（JSON）约束，而不是让它自由写 mermaid。
3. **可扩展**：新增一种图表 = 新增一个 renderer 文件，不改 agent 链路。
4. **可恢复**：渲染失败时把结构化错误回给模型，触发定向修复，而不是整段重写。
5. **可迭代**：规格随元素一起落库，支持后续「重新生成 / 换主题 / 改密度」。

非目标（本阶段）：多人协作下的图表同步、图表与数据源绑定、导出为独立文件。

---

## 3. 分族：按「结构」而不是「图表名」归类

图表名是无穷的，结构是有限的。所有图表归入 6 种 shape：

| shape | 结构 | 覆盖的 kind |
| --- | --- | --- |
| `network` | 节点 + 边（可分组） | flowchart、state、er、class、dependency、org、architecture |
| `tree` | 单根层级 | mindmap、outline、org-tree、taxonomy |
| `sequence` | 参与者泳道 + 有序消息 | sequence、api-flow、message-flow |
| `timeline` | 时间轴 + 区间/里程碑 | gantt、roadmap、timeline、milestone |
| `matrix` | 行 × 列网格 | table、matrix2x2、swot、comparison、priority |
| `data` | 分类 + 数值系列 | bar、line、pie、area、kpi |

`kind` 决定语义与默认样式，`shape` 决定 layout 与 renderer。

---

## 4. 总体架构

```
自然语言
   │
   ▼
LLM（tool call）
   │  ChartSpec(JSON)  或  { source: 'mermaid' | 'markdown', code }   ← 逃生通道
   ▼
┌───────────────────────────────────────────────┐
│ validateChartSpec   ← JSON Schema + 语义检查   │  errors[]  ──┐
└───────────────────────────────────────────────┘               │
   │ ok                                                          │
   ▼                                                            │
┌───────────────────────────────────────────────┐               │
│ ChartRendererRegistry.resolve(spec)           │               │
│   kind → renderer（按 shape 回退）             │               │
└───────────────────────────────────────────────┘               │
   │                                                            │
   ▼                                                            │
┌───────────────────────────────────────────────┐               │
│ renderer.render(spec, ctx)                    │               │
│   ctx: { theme, fontSize, measureText, board } │               │
│   → { elements, capability, bounds, warnings } │               │
└───────────────────────────────────────────────┘               │
   │                                                            │
   │ render error ──────────────────────────────────────────────┤
   ▼                                                            │
insertChart(board, elements, spec, cursor)                      │
   │  分组 + 命名 + data.agent 标记 + 选中                          │
   ▼                                                            │
画布                                                             │
                                                                │
   tool result { ok, warnings, errors: StructuredError[] } ──────┘
                 ↑ 回填给模型，触发定向修复（最多 2 次）
```

三段式职责：

- **Spec 层**：模型只负责「内容 + 语义」，不负责坐标与语法细节。
- **Renderer 层**：负责「结构 → Plait 元素」，内部可自由使用 mermaid 转换器 / elkjs / 自绘。
- **Writer 层**：负责「落盘语义」——分组、命名、定位、幂等标记。

---

## 5. ChartSpec v1

```ts
export type ChartShape = 'network' | 'tree' | 'sequence' | 'timeline' | 'matrix' | 'data';

export type ChartKind =
  // network
  | 'flowchart' | 'state' | 'er' | 'class' | 'dependency' | 'org' | 'architecture'
  // tree
  | 'mindmap' | 'outline' | 'taxonomy'
  // sequence
  | 'sequence'
  // timeline
  | 'gantt' | 'roadmap' | 'timeline'
  // matrix
  | 'table' | 'matrix2x2' | 'swot' | 'comparison'
  // data
  | 'bar' | 'line' | 'pie' | 'area' | 'kpi';

export type ChartSpec = {
  version: 1;
  kind: ChartKind;
  title?: string;
  /** 布局提示，不保证被采纳 */
  layout?: { direction?: 'TB' | 'LR' | 'RL' | 'BT'; density?: 'compact' | 'normal' | 'roomy' };
  style?: { accent?: string; palette?: 'default' | 'mono' | 'warm' | 'cool' };
} & ChartPayload;

type ChartPayload =
  | { shape?: 'network'; nodes: NetworkNode[]; edges: NetworkEdge[]; groups?: NetworkGroup[] }
  | { shape?: 'tree'; root: TreeNode }
  | { shape?: 'sequence'; actors: SequenceActor[]; messages: SequenceMessage[] }
  | { shape?: 'timeline'; unit: 'day' | 'week' | 'month' | 'quarter'; events: TimelineEvent[] }
  | { shape?: 'matrix'; columns: string[]; rows: MatrixRow[] }
  | { shape?: 'data'; categories: string[]; series: DataSeries[] };

export type NetworkNode = {
  id: string;
  label: string;
  shape?: 'rect' | 'round' | 'diamond' | 'circle' | 'cylinder' | 'hexagon';
  group?: string;
  note?: string;
};

export type NetworkEdge = {
  from: string;
  to: string;
  label?: string;
  style?: 'solid' | 'dashed';
  arrow?: 'forward' | 'both' | 'none';
};

export type TreeNode = { label: string; note?: string; children?: TreeNode[] };

export type SequenceActor = { id: string; label: string; kind?: 'actor' | 'system' | 'database' };
export type SequenceMessage = {
  from: string;
  to: string;
  label: string;
  style?: 'sync' | 'async' | 'return';
};

export type TimelineEvent = {
  id: string;
  label: string;
  start: string;      // ISO 日期或 '2026-Q1'
  end?: string;
  milestone?: boolean;
  group?: string;
};

export type MatrixRow = { label: string; cells: (string | null)[] };

export type DataSeries = {
  label: string;
  values: number[];
  type?: 'bar' | 'line' | 'area';
};
```

设计约束：

- `version` 必填，为后续迁移留位置。
- `shape` 可省略，由 `kind` 推导；显式给出时以显式为准（用于「用 flowchart 语法画状态机」这类跨语义场景）。
- 所有 id 只在 spec 内部有效，避免模型编造跨图引用。
- 文本一律单行字符串，禁止在 label 里塞换行或 markdown（渲染层统一处理截断）。

### 逃生通道

模型对 mermaid 已经很强，不是所有场景都值得强约束。工具参数保留：

```ts
{ kind: 'raw', source: 'mermaid' | 'markdown', code: string }
```

走旧链路（`parseDiagramElements`），产物标记 `capability: 'image' | 'editable'`，UI 不区分但诊断日志记录。这样 P0 可以只加 spec 通道，raw 继续工作。

---

## 6. Renderer 协议

```ts
export type RenderCapability = 'editable' | 'image';

export type RenderWarning = {
  code: 'degraded-to-image' | 'label-truncated' | 'layout-fallback' | 'unsupported-style';
  message: string;
};

export type RenderError = {
  code: 'invalid-node-ref' | 'cycle' | 'too-large' | 'empty' | 'render-failed';
  message: string;
  /** 指向 spec 中的位置，便于模型定向修复 */
  path?: string;
};

export type RenderResult = {
  elements: PlaitElement[];
  capability: RenderCapability;
  bounds: { width: number; height: number };
  warnings: RenderWarning[];
};

export type ChartRenderer = {
  id: string;
  /** 支持的 kind；undefined 表示按 shape 兜底 */
  kinds?: ChartKind[];
  shape: ChartShape;
  capability: (spec: ChartSpec) => RenderCapability;
  render: (spec: ChartSpec, ctx: RenderContext) => Promise<RenderResult>;
};

export type RenderContext = {
  theme: 'default' | 'dark' | 'colorful' | 'soft' | 'retro' | 'starry';
  fontSize: number;
  measureText: (text: string, font: { size: number; weight?: number }) => { width: number; height: number };
  /** 只读，用于取视口/缩放，不用于修改画布 */
  board: PlaitBoard;
};
```

### 注册表与解析顺序

```ts
const RENDERERS: ChartRenderer[] = [
  networkRenderer,   // editable：elkjs 布局 + geometry/arrowLine
  treeRenderer,      // editable：@plait/mind
  sequenceRenderer,  // editable：mermaid sequence 转换器
  timelineRenderer,  // editable：自算时间轴
  matrixRenderer,    // editable：自算网格
  dataRenderer,      // image（P2 后转 editable）
  mermaidFallback,   // image：任意 mermaid 代码
];

resolve(spec):
  1. 精确匹配 kind 的 renderer
  2. 同 shape 的 renderer
  3. mermaidFallback（附带 degraded-to-image 警告）
```

---

## 7. 各 shape 的实现路线

| shape | 布局 | 图元 | 落地难度 | 优先级 |
| --- | --- | --- | --- | --- |
| `network` | elkjs `layered`（flowchart/state/dependency/org）、`force` 留给 architecture | `createGeometryElement` + `createArrowLineElement`（已在 mermaid converter 中使用） | 中 | P0（复用现有 converter） |
| `tree` | `@plait/mind` 自带布局 | `MindElement` | 低 | P0（markdown 转换器已有） |
| `sequence` | 自算泳道（复用 mermaid sequence 转换器坐标算法） | geometry + arrow + rect | 中 | P0（直接包一层） |
| `timeline` | 自算：时间刻度 → x，分组 → y | rect（bars）+ diamond（milestone） | 中 | P1 |
| `matrix` | 自算：等宽列 + 行高按内容 | rect + text | 低 | P1 |
| `data` | 自算：坐标轴 + 比例尺 | rect（bar）/polyline（line）/path（pie） | 高 | P2 |

**P0 的取巧点**：`network` / `sequence` 不重写转换器，而是把 spec 序列化成 mermaid，再交给现有转换器：

```ts
networkSpecToMermaid(spec): string   // nodes → `A[Label]`, edges → `A -->|label| B`
sequenceSpecToMermaid(spec): string
```

好处：P0 立刻支持 7 种 kind，且产物可编辑；代价是多一次字符串序列化。P1 再逐步替换为直出 Plait 元素，以获得更好的分组与样式控制。

---

## 8. 校验与修复循环

```ts
validateChartSpec(spec): { spec: ChartSpec; warnings: RenderWarning[]; errors: RenderError[] }
```

检查项：

1. 结构：必填字段、数组非空、`kind` 合法。
2. 引用：`edge.from/to`、`node.group`、`actor.id` 必须存在（`invalid-node-ref`）。
3. 规模：`nodes ≤ 200`、`messages ≤ 120`、`cells ≤ 400`（`too-large`），超过则建议拆分。
4. 语义：`timeline.end ≥ start`（`invalid-range`）、`data.series[].values.length === categories.length`。
5. 可读性：label 长度 > 40 字符 → `label-truncated` 警告（不阻断）。

修复循环（复用 `runAgentTurn` 的 `maxSteps`）：

```
render 失败
  → 工具结果 { ok: false, errors: [{ code, path, message }] }
  → 模型看到结构化错误，只改出错部分
  → 最多 2 次修复，第 3 次失败则提示用户
```

对比现状的收益：现在错误是自由文本（`Mermaid did not produce any drawing elements.`），模型只能整段重写；有 `path` 后可以精确改一个节点。

---

## 9. 能力协商

system prompt 不再写死「用 Mermaid」，而是由注册表生成：

```ts
buildDiagramCapabilitySection(): string
// 例：
// 可编辑：flowchart, state, dependency, org, sequence, class, mindmap, outline, table, matrix2x2, swot
// 仅图片（不可编辑，避免用于需要后续修改的内容）：gantt, roadmap, pie, er
// 推荐：流程/架构 → flowchart；层级 → mindmap；两两对比 → matrix2x2
```

好处：加 renderer 时 prompt 自动更新，不会出现「模型产了不支持的 kind」。

---

## 10. 插入语义（Writer）

```ts
insertChart(board, result, spec, cursor?): InsertedChart
```

1. **分组**：同一次生成的元素放入一个 `group`（`createGroup`），拖动时整体移动。
2. **命名**：`group` 名 = `spec.title ?? kindLabel(kind)`，图层面板可读。
3. **幂等标记**：写入 `element.data.agent = { specId, version: 1, kind, spec }`，用于：
   - 「重新生成这张图」 → 删旧插新
   - 「换成暗色」 → 只改 style，不重新请求模型
4. **定位**：沿用 `AgentInsertionCursor`；同轮多图横向 80px；批注场景用 `getAnnotationInsertionPoint`。
5. **选中**：插入后选中新元素，便于用户立即拖动或删除。
6. **尺寸**：用 `bounds` 做碰撞避免——若目标区域与现有元素重叠，向下偏移一个行高。

---

## 11. 工具协议演进

```ts
// v1（现状，保留）
{ format: 'mermaid' | 'markdown', content, title? }

// v2（新增，spec 优先）
{
  kind: ChartKind | 'raw',
  spec?: ChartSpec,          // kind !== 'raw' 时必填
  source?: 'mermaid' | 'markdown',  // kind === 'raw' 时必填
  code?: string,
  title?: string
}
```

`parseCreateDiagramArguments` 保留为兼容层：v1 参数内部转成 `{ kind: 'raw', source: format, code: content }`。

模型侧策略（写进 prompt）：

1. 能用 spec 表达的图表，一律用 spec；
2. 只有 spec 覆盖不到、且用户明确要求 mermaid 语法时，才用 raw；
3. 一次调用只能产出一张图。

---

## 12. 分阶段落地

### P0 — 通道拆分（半天到一天）

- [ ] `chart/spec.ts`：`ChartSpec` 类型 + `kindToShape`
- [ ] `chart/validate.ts`：结构 + 引用 + 规模校验，返回结构化错误
- [ ] `chart/registry.ts`：`resolveChartRenderer`
- [ ] `chart/renderers/network.ts`、`sequence.ts`：spec → mermaid → 现有转换器
- [ ] `chart/renderers/tree.ts`：spec → markdown → `parseMarkdownToDrawnix`
- [ ] `tool-definition.ts`：参数扩展 v2，保留 v1 兼容
- [ ] `prompt.ts`：改为能力段动态生成

### P1 — 自绘两类高频图表（一到两天）

- [ ] `matrix` renderer：表格 / 2×2 / SWOT，纯 geometry + text，可编辑
- [ ] `timeline` renderer：甘特 / 路线图，时间刻度自算
- [ ] `org` 走 tree renderer 的变体（横向布局 + 卡片样式）

### P2 — 数据图表与再生成（更后）

- [ ] `data` renderer：柱 / 折线 / 饼，先自绘静态图元
- [ ] 基于 `element.data.agent` 的「重新生成 / 换主题」
- [ ] 基于 elkjs 的 network 直出（去掉 mermaid 中转），支持分组框与正交连线

---

## 13. 风险与取舍

| 风险 | 说明 | 应对 |
| --- | --- | --- |
| elkjs 体积 | 压缩后 ~1.5MB，直接进主包会拖慢首屏 | 动态 `import()`，仅在首次渲染 network 时加载 |
| 模型产 spec 不稳定 | JSON 结构比自由文本更容易出错 | JSON Schema 严格校验 + 结构化错误回填 + few-shot 示例 |
| 自绘图元与现有主题不一致 | 主题色需走 CSS 变量，但画布元素是 SVG 属性 | 从 `board` 读取当前主题，映射到 `--color-*` 计算值 |
| 图片降级体验 | 用户以为是矢量图，实际是位图 | 插入后在消息里标注「此图表为图片，不可编辑」 |
| spec 与 raw 双轨 | 维护两套链路 | raw 只保留 mermaid/markdown，不再扩展；P2 后评估下线 |

---

## 14. 与现有代码的接缝

| 现有 | 演进 |
| --- | --- |
| `agent/diagram.ts` 的 `parseDiagramElements` | 保留，作为 `mermaidFallback` renderer 的内部实现 |
| `agent/diagram.ts` 的 `insertAgentDiagram` | 拆成 `insertChart`，增加分组与 `data.agent` 标记 |
| `agent/tool-definition.ts` | 参数升级到 v2，保留 v1 解析分支 |
| `agent/prompt.ts` | 规则段改为能力段 + kind 选择指引 |
| `agent/types.ts` | `AgentDiagramFormat` 保留；新增 `ChartKind` 等从 `chart/spec` 导入 |
| `agent/annotation.ts` | 不变；批注只影响插入游标 |
---

## 15. 函数调用（Function Calling）层

> 第 11 章只说了「工具协议从 v1 升到 v2」，这一章给出完整设计。核心结论：**工具不是 prompt 里的字符串，而是有注册表、有 schema、有错误契约、有预算的接口层**。

### 15.1 旧实现的三处硬伤

| 问题 | 现状 | 后果 |
| --- | --- | --- |
| 单工具 | 只有 `create_diagram(format, content)` | 模型只能吐自由文本，校验只能靠 mermaid 解析器报错，错误无法定位到字段 |
| 名字硬编码 | `agent-service.ts` 里 `if (toolCall.name !== CREATE_DIAGRAM_TOOL_NAME)` | 加一个工具要同时改前端循环、面板执行器、服务端注入、prompt 四处 |
| 定义双份 | 前端、服务端各一份 `tool-definition.ts`，靠一个 `toEqual` 测试防漂移 | 改 schema 时容易只改一边；测试失败信息也不告诉你该改哪边 |

### 15.2 工具集：按「读写」和「确定性」拆

| 工具 | 类别 | 何时用 | 产物 |
| --- | --- | --- | --- |
| `create_chart` | 写 · 结构化 | 默认路径。所有能用 ChartSpec 表达的图 | 可编辑 Plait 元素 |
| `create_diagram` | 写 · 逃生通道 | 甘特 / 复杂 ER / 带方法的类图 / 用户直接贴源码 | 可编辑或图片降级 |
| `inspect_board` | 读 | 用户说「这块」「选中的」「上面那张」 | 元素 id / type / label 列表 |

不做的：`update_chart`、`delete_element`、`focus_selection`。理由是要先有 `element.data.agent = { chartId, spec }` 的幂等标记（第 10 章 P1），否则「更新哪张图」只能靠坐标猜。**读工具先于写工具上线，是因为读的副作用为零。**

### 15.3 单一注册表，服务端代码生成

```
packages/drawnix/src/agent/tools/registry.ts   ← 唯一手写源
        │  npm run sync:agent-tools
        ├──> apps/api/src/modules/agent/tool-definitions.generated.ts   （服务端注入 tools）
        └──> packages/drawnix/src/agent/tool-definition.ts              （兼容旧导出）
```

- 注册表必须**零运行时依赖**（只 import 类型和 `CHART_KINDS` 常量），否则 Node 端生成脚本会被 React / DOM 拖累。
- 生成文件带 `AUTO-GENERATED` 头，`tool-definition.spec.ts` 仍做全量 `toEqual`，手改生成文件会立刻失败。
- 生成脚本：`scripts/sync-agent-tools.mjs`，`node --import tsx` 直接读 TS。

### 15.4 Schema 设计原则

1. **扁平优先**：`nodes` / `edges` / `root` / `actors` / `messages` 平铺在顶层，靠 `kind` 决定用哪组。不用 `oneOf`——多数模型对 `oneOf` 的遵守率明显低于「可选字段 + 服务端校验」。
2. **闭合**：每层 `additionalProperties: false`。模型编造字段会直接被 schema 拦掉，而不是静默忽略。
3. **带上限**：`maxItems` 写进 schema（nodes 80 / edges 160 / messages 60），同时在校验器里再兜一次。
4. **文案即约束**：`description` 写清单位、方向、id 字符集（`[A-Za-z0-9_-]`），比事后报错便宜。
5. **`required` 只放最小集**：`create_chart` 只要求 `kind`。缺 `nodes` 这类错误由校验器返回带 `path` 的结构化错误，模型能一次改对。

### 15.5 编排：串行、预算、收敛

```ts
for (let step = 0; step < maxSteps; step += 1) {       // 默认 5 步
  const assistant = await chat({ messages, tool_choice });
  if (!assistant.tool_calls?.length) return text;       // 收敛
  messages.push(assistant);

  for (const call of assistant.tool_calls) {            // 严格串行
    if (executed >= maxToolCalls) { ...tool_budget_exceeded; break; }
    const result = isAgentTool(call.name)
      ? await executeTool(call)
      : { ok: false, error: { code: 'unknown_tool' } };
    messages.push({ role: 'tool', tool_call_id: call.id, content: JSON.stringify(result.output) });
  }
}
```

- **必须串行**：插入游标是共享状态，两张图并行插入会重叠。schema 层无法禁止模型一次返回多个 `tool_calls`，只能在执行层串行。
- **两道上限**：`maxSteps`（轮次）× `maxToolCalls`（单轮工具数，默认 8）＝ 单次对话最多 40 次工具调用，但实际通常 1–2 次就收敛。
- **`tool_choice` 三态**：
  - `auto`：默认。
  - `{ type: 'function', function: { name: 'create_chart' } }`：修复轮强制回到结构化工具，防止模型逃回 `create_diagram` 的自由文本。
  - `required`：暂不用。会让「你好」这类闲聊也强行调工具。
- `tool_choice` 只允许 `auto` 或注册表里的工具名，服务端 zod 校验，非法名字 400。

### 15.6 错误契约

所有工具统一返回，成功和失败都是 JSON（`role: 'tool'` 的 content 必须是字符串）：

```json
{
  "ok": false,
  "error": {
    "code": "invalid-node-ref",
    "path": "edges[0].to",
    "message": "Unknown reference \"api2\".",
    "hint": "Use one of: web, api, db.",
    "problems": [{ "code": "invalid-node-ref", "path": "edges[0].to", "message": "..." }]
  }
}
```

| code | 产生位置 | 模型该做什么 |
| --- | --- | --- |
| `empty` | 校验器 | 补必填字段 |
| `invalid-node-ref` | 校验器 | 改成存在的 id |
| `invalid-range` | 校验器 | 补齐 cells / values 长度 |
| `too-large` | 校验器 | 拆图或删节点 |
| `unsupported-kind` | 渲染器 | 换 kind，或降级到 `create_diagram` |
| `render-failed` | mermaid 转换器 | 简化图，或降级到 raw |
| `tool_budget_exceeded` | 执行循环 | 停止生成，先交付已有结果 |

关键点：**`path` 是绝对字段路径**（`rows[2].cells`），不是自然语言描述。模型对「第 3 行的列数不对」这种话不敏感，对 `rows[2].cells` 敏感。

### 15.7 修复循环

```
第 1 次 create_chart → ok:false
   ↓ 把 error 原样回填（不改写、不吞掉）
第 2 次 create_chart（同一工具，自动降级到简化 spec）
   ↓ 仍失败
第 3 次：换 create_diagram(raw mermaid)，或直接向用户解释
```

- 不在客户端做「自动重试」：重试需要模型重新组织内容，客户端没有这个能力。
- 修复轮可以把 `tool_choice` 强制指向 `create_chart`，减少模型「放弃结构化、改吐一段 mermaid」的倾向。
- 服务端不重写错误文案，只做长度截断，保证 `path` 不被破坏。

### 15.8 前后端职责边界

| 层 | 负责 | 不负责 |
| --- | --- | --- |
| 服务端 | 注入 `tools`、校验 `tool_choice` 白名单、透传上游错误、限流、鉴权 | 不理解 chart 语义，不校验 spec |
| 前端 | 注册表、参数校验、spec→mermaid、插入画布、生成结构化错误、执行预算 | 不持有 API Key，不直接调模型 |
| 模型 | 选工具、填参数、读错误改字段 | 不直接操作 DOM / 画布 |

服务端「不理解语义」是刻意的：schema 演进只改前端注册表，服务端重新生成一次即可，不需要跟着改业务逻辑。

### 15.9 已落地

- `packages/drawnix/src/agent/tools/registry.ts` — 3 个工具定义 + 白名单
- `packages/drawnix/src/agent/tools/inspect.ts` — `inspect_board` 实现（含 Slate 文本提取）
- `packages/drawnix/src/agent/chart/parse.ts` — ChartSpec 校验，错误带 `path` / `hint`
- `packages/drawnix/src/agent/chart/source.ts` — spec → mermaid / markdown（network / tree / sequence）
- `packages/drawnix/src/agent/agent-service.ts` — 注册表白名单、`maxToolCalls`、`toolChoice`
- `apps/api/src/modules/agent/tool-definitions.generated.ts` — 生成产物
- `scripts/sync-agent-tools.mjs` + `npm run sync:agent-tools`
- 测试：`chart/parse.spec.ts`、`chart/source.spec.ts`、`tools/registry.spec.ts`、服务端 `tool-definition.spec.ts`（全量一致性）
