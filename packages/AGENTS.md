# packages

> 📅 生成于：2026-10-27
> 📂 路径：`packages/`
> 🏷️ 类型：**Module**（内部库集合）

---

## 概览

三个**不发布**的内部库，按"内核 → 渲染 → 文本"分层，全部以源码形式被 `apps/web` 引用（`tsconfig.base.json` 的 `paths`）。三者 `package.json` 均已设为 `private: true`。

| 包 | 包名 | 职责 |
| --- | --- | --- |
| `drawnix` | `@drawme/drawnix` | 白板业务：工具栏、面板、插件、Agent、导入导出、i18n |
| `react-board` | `@drawme/react-board` | board 的 React 运行时：`Wrapper` 建 board、`Board` 建 SVG 宿主、`useBoard` 取上下文 |
| `react-text` | `@drawme/react-text` | 基于 Slate 的文本编辑渲染，供 board 通过 `renderText` 挂载 |

## 相关概念

- **依赖方向是单向的**：`drawnix → react-board → react-text`，反向依赖会造成循环。`drawnix` 中所有 `useBoard` 都从 `@drawme/react-board` 导入。
- **"库"不等于"无状态"**：`react-board` 持有 board 实例与 `listRender`；`drawnix` 通过插件与 Context 操作它。
- **`external` 声明**：每个库的 `vite.config.ts` 都列出 external，新增跨包依赖时必须同步，否则会把 React/Plait 打进产物导致一个页面出现两份实例。

## 状态管理

- `react-board` 的 `BoardContext`（`{ v, board, listRender }`）是唯一的"渲染上下文"。
- `drawnix` 的 `DrawnixContext`（`{ appState, setAppState, showToast }`）是唯一的"应用上下文"。
- 两者**不是**同一份状态：`appState` 变化不一定触发 board 重渲染，反之亦然；跨层同步靠 `board.appState = appState` 赋值 + 插件回写（见 `drawnix.tsx`）。

## 功能页面

无（库不定义路由/页面）。

## 核心功能和数据流

```
apps/web
   └── <Drawnix>            (packages/drawnix)
         └── <Wrapper>      (packages/react-board)  ← createBoard + 内置插件
               └── <Board>  (packages/react-board)  ← SVG 宿主 + 事件绑定
                     └── renderText → <Text>        (packages/react-text)
```

## 模块内的组件

- [drawnix/AGENTS.md](drawnix/AGENTS.md)
- [react-board/AGENTS.md](react-board/AGENTS.md)
- [react-text/AGENTS.md](react-text/AGENTS.md)

## 服务和工具

- 每个包独立 `vite.config.ts`（库模式，`formats: ['es','cjs']`）与 `tsconfig.lib.json`（构建）/ `tsconfig.spec.json`（测试）。

## 模块结构

```
packages/
├── drawnix/       # 业务主体（含 src/agent、src/components、src/plugins ...）
├── react-board/   # React 渲染层（src/board.tsx、src/wrapper.tsx、src/hooks、src/plugins）
└── react-text/    # 文本编辑层（src/text.tsx、src/plugins、src/styles）
```

## 测试用例覆盖

- [x] 各包 `nx test`（Vitest）均在 CI 中运行：`nx run-many -t=test`
- 具体覆盖面见各子包 AGENTS.md 的"测试用例覆盖"章节

## 关联文档

- [../AGENTS.md](../AGENTS.md)
- [../tsconfig.base.json](../tsconfig.base.json) — `@drawme/*` 路径别名

## 技术栈

- Vite 8 库模式 + `vite-plugin-dts`
- `@plait/*` 0.94（drawnix）/ 0.93（react-board、react-text 的 dependency 声明）
- Slate 0.116（react-text）


## 常见改动指引

| 需求 | 改动位置 |
| --- | --- |
| 新增内部库 | `packages/<name>` + `tsconfig.base.json` 的 `paths` |
| 重命名包 | 包内 `package.json`、所有 import、`paths`、`vite.config.ts` 的 `external` 四处同改 |
| 恢复 npm 发布 | 三个 `package.json` 的 `private: false` + 重新引入 publish 脚本 |
| 排查"两个 React 实例" | 检查各 `vite.config.ts` 的 `rollupOptions.external` |

## 易错点与约束

- 依赖方向只能是 `drawnix → react-board → react-text`；反向 import 会形成循环。
- 库之间通过源码别名引用，不做版本对齐，因此 API 变更必须一次性全改。
- `@plait/*` 的版本在 `drawnix`(0.94) 与 `react-board`/`react-text`(0.93) 的 dependency 声明中不一致，以根 `package.json` 实际安装版本为准。

## 变更检查清单

- [ ] 包名变更后是否同时改了 `paths`、`external` 与所有 import。
- [ ] 新增跨包依赖是否形成循环。
- [ ] 是否需要把包恢复为 `private: false`（仅当确定要发布）。
<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
