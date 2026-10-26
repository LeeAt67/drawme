# testing

> 📅 生成于：2026-10-27
> 📂 路径：`packages/drawnix/testing`
> 🏷️ 类型：**Module**（测试夹具）

---

## 概览

给 Vitest 用的共享夹具：`setupDrawnixTestingBoard`（在 `@plait/core` 的 `setupTestingBoard` 之上补 `appState` / `pointer` / `creationMode`），让插件测试可以拿到一个"像真的" `DrawnixBoard`。

它**不参与生产构建**（`tsconfig.lib.json` 不包含），只在 `*.spec.ts(x)` 中 import。

## 相关概念

- **`DrawnixTestingBoardFixture`**：`TestingBoardFixture` 的扩展，`board` 类型为 `DrawnixBoard`，因此测试里可以直接读 `board.appState`、调用被插件覆盖过的方法。
- **`appState` 深合并**：`DrawnixTestingAppStateOverrides` 允许只传 `toolState.pointer`，其余字段由 `createTestingAppState` 补默认值（`isMobile:false`、`openDialogType:null`、`agentPanelOpen:false` 等）。测试里**不要**自己拼整个 `DrawnixState`，容易与真实默认值漂移。
- **`pointer` 与 `creationMode`**：分别初始化 `board.pointer` 和 `setCreationMode`，这是模拟"当前处于某工具/某模式"的唯一入口。
- **必须 `destroy()`**：夹具会在 DOM 上创建 board 宿主，`afterEach` 里 `fixture?.destroy()` 是既有约定（见 `with-tool-state-sync.spec.ts`）。

## 测试用例覆盖

- [x] 被 `plugins/with-tool-state-sync.spec.ts` 使用（构造真实 board 并触发 `pointerUp`）
- [ ] 夹具自身无测试（工具代码，可按需补）

## 相关概念（典型用法）

```ts
const observer = createBoardEventObserver(['pointerUp']);
fixture = setupDrawnixTestingBoard(
  [observer.plugin, somePlugin, buildToolStateSyncPlugin(syncFn)],
  [],
  { pointer: BasicShapes.rectangle, appState: { toolState: { pointer: BasicShapes.rectangle } } }
);
fixture.board.pointerUp(createPointerEvent('pointerup', 0, 0, undefined, undefined, { view: null }));
```

注意 `createPointerEvent` 需要传 `{ view: null }` 才能在 jsdom 下构造。

## Props 定义

`setupDrawnixTestingBoard(plugins, value, options?)`：

- `plugins: PlaitPlugin[]` — 按顺序生效，**顺序即语义**。
- `value: PlaitElement[]` — 初始元素。
- `options?: SetupDrawnixTestingBoardOptions` — `{ appState?, pointer?, creationMode?, ...SetupTestingBoardOptions }`。


## 状态管理

夹具本身无状态，只是把 `appState` 注入 board；每次调用生成独立 fixture，测试之间不共享。`destroy()` 释放 DOM 与 board。

## 功能页面

无（测试专用）。
## 渲染逻辑

```
setupDrawnixTestingBoard
 ├─ initializeDrawnixState 被插到 plugins 最前面：
 │    ├─ board.appState = createTestingAppState(overrides)  // mergeToolState + 固定默认值
 │    ├─ pointer !== undefined → BoardTransforms.updatePointerType
 │    └─ creationMode !== undefined → setCreationMode
 ├─ setupTestingBoard([initializeDrawnixState, ...plugins], children, rest)
 └─ 返回 { ...fixture, board: fixture.board as DrawnixBoard }
```

关键点：`initializeDrawnixState` 是**作为第一个插件**注入的，所以后续插件执行时 `board.appState` 一定已存在；如果把它放到后面，插件内部读 `appState` 会拿到 `undefined`。

## 数据结构

- `DrawnixTestingAppStateOverrides = Partial<Omit<DrawnixState,'toolState'>> & { toolState?: Partial<DrawnixToolState> }`。
- `DrawnixTestingBoardFixture`：带 `DrawnixBoard` 的 `TestingBoardFixture`。

## API 和服务

- `index.ts` 只 re-export `./setup-testing-board`，新增夹具请继续在此导出。

## 模块结构

```
testing/
├── index.ts
└── setup-testing-board.ts
```

## 交互和事件

无（测试环境）。

## 复用说明

- 新增插件测试：用本夹具 + `createBoardEventObserver`（`@plait/core`）断言事件是否透传，避免 mock 整个 board。
- 若需要特定元素（如 freehand），通过 `value` 传入真实元素对象，而不是伪造 `board.children`。

## 依赖关系

- 上游：`@plait/core`（`setupTestingBoard`）、`../src/hooks/use-drawnix`、`@plait/common`。
- 下游：`packages/drawnix/src/**/*.spec.ts(x)`。

## 关联文档

- [../src/hooks/AGENTS.md](../src/hooks/AGENTS.md) — `DrawnixState` 默认值
- [../src/plugins/AGENTS.md](../src/plugins/AGENTS.md) — 主要使用方

## 技术栈

- Vitest + `@plait/core` 测试工具

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
