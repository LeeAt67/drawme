# web-e2e/src

> 📅 生成于：2026-10-27
> 📂 路径：`apps/web-e2e/src`
> 🏷️ 类型：**Module**（测试用例）

---

## 概览

存放 Playwright 测试文件，`playwright.config.ts` 的 `testDir` 指向此处。文件名需匹配 `*.spec.ts`。

## 相关概念

- **稳定的选择器**：库内可用的锚点类是 `.drawnix`（根容器）、`.plait-board-container`（board 容器）、`.draw-toolbar`、`.app-toolbar`、`.agent-panel`、`.zoom-toolbar`、`.theme-toolbar`。这些类名属于**对外契约**，改样式时不要顺手重命名。
- **品牌断言**：标题断言依赖 `apps/web/index.html` 的 `<title>`；品牌改名必须同步此文件，否则 E2E 失败。

## 状态管理

无。

## 功能页面

- 主页面冒烟验证（`/`）

## 核心功能和数据流

```
page.goto('/')  →  断言 title
                →  断言 .drawnix 可见
                →  断言 .drawnix .plait-board-container 可见
```

## 模块内的组件

- `example.spec.ts`：单用例 `loads the DrawMe board`。

## 服务和工具

- 无自定义 fixture、无 page object。新增复杂场景建议先抽 page object，避免选择器散落。

## 模块结构

```
src/
└── example.spec.ts
```

## 测试用例覆盖

- [x] 页面加载与画布容器渲染
- [ ] 建议补充：工具切换（`.draw-toolbar` 内按钮 `aria-label`）、Agent 面板开合（`.agent-panel` 出现/消失）、深色主题切换、刷新后存档恢复

## 关联文档

- [../AGENTS.md](../AGENTS.md)
- [../../packages/drawnix/src/components/AGENTS.md](../../packages/drawnix/src/components/AGENTS.md) — 选择器来源

## 技术栈

- `@playwright/test`


## 常见改动指引

| 场景 | 建议写法 |
| --- | --- |
| 工具切换 | `page.locator('.draw-toolbar button[aria-label="画笔 — P"]').click()` |
| 面板开合 | 断言 `page.locator('.agent-panel')` 的存在/消失 |
| 清空确认 | 触发 `Ctrl+Backspace` 后断言 `.clean-confirm` 可见 |
| 主题切换 | `page.locator('.theme-toolbar select').selectOption('dark')` |

## 易错点与约束

- 画布内容渲染在 SVG 内，元素不可用文本选择器稳定定位；优先断言容器与工具栏状态。
- 每次 `page.goto('/')` 前如需干净状态，应 `context.clearCookies()` 并清理 IndexedDB（localforage 会恢复上次画布）。
- 标题断言与 `index.html` 强耦合，品牌改名会同时影响实现与测试。

## 变更检查清单

- [ ] 用例是否自带状态清理（清空 IndexedDB / localStorage）。
- [ ] 断言是否避免依赖具体文案（多语言下会失败）。
- [ ] 是否需要等待画布初始化（`.plait-board-container` 出现后再操作）。
- [ ] 交互后是否有明确的可见结果可断言（面板出现、工具栏高亮）。

## 后续可补的用例

| 场景 | 断言点 |
| --- | --- |
| 打开 Agent | `.agent-panel` 可见，入口按钮带 `tool-icon--selected` |
| 关闭 Agent | `.agent-panel` 消失，按钮选中态移除 |
| 切换工具 | 对应 `input[type=radio]` 为 checked |
| 切换主题 | 根节点类名含 `theme--dark` |
| 清空画布 | `.clean-confirm` 可见，确认后画布元素数归零 |

## 排查思路

- 选择器找不到：先用 `page.locator(...).count()` 打印数量，确认类名是否被改动。
- 偶发失败：优先检查是否等待了画布初始化与动画结束。
<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
