# app

> 📅 生成于：2026-10-27
> 📂 路径：`apps/web/src/app`
> 🏷️ 类型：**Page**（唯一页面）

---

## 概览

`App` 是 DrawMe 的唯一页面，也是"白板 + 持久化"的粘合层。它做四件事：

1. 首次加载时从 `localforage` 读回画布、工具态、偏好；
2. 控制新手教程的显隐；
3. 把回调（内容/工具态/偏好/语言变化）写回 `localforage`；
4. 渲染 `<Drawnix>` 并透传 `initial*` 初始值。

它**不**参与任何画布渲染或交互决策——这些全部在库内。

## 相关概念

- **教程触发条件**：只有两种情况下 `tutorial=true` —— 没有任何存档，或存档里 `children.length === 0`。一旦内容非空就永久关闭；该判断在 `onChange` 与初始加载两处分别维护，改动任一处都要同步另一处。
- **StrictMode 下的 `loaded` 守卫**：`loaded` 为 `false` 时返回 `null`，避免用空画布覆盖真实存档。这是"先读后画"的关键，删除该守卫会出现白屏闪烁后内容被清空。
- **名称残留**：`localforage.config({ name: 'Drawnix' })` 仍是旧品牌名。**不要改**，否则老用户本地 IndexedDB 库名变化会导致存档丢失；如确需改名必须自带迁移逻辑。
- **语言类型**：页面内定义了本地 `Language = 'zh' | 'en' | 'ru' | 'ar' | 'vi'`，与库的 `i18n/types.ts` 保持一致；新增语言需两处同步。

## 测试用例覆盖

- [x] `app.spec.tsx`（Vitest 占位断言，无实际行为校验）
- [x] E2E 间接覆盖：`apps/web-e2e/src/example.spec.ts` 通过页面标题与 `.drawnix` 可见性验证页面成功挂载
- [ ] 存档恢复、教程显隐、偏好回写无自动化用例（改动时请手工验证刷新与二次进入）

## 路由信息

- 无路由库。路径固定 `/`，由 `apps/web/public/_redirects` 的 `/* /index.html 200` 兜底。
- 无 URL 参数；所有可变状态来自 `localforage`。

## 数据结构

- `AppValue`：`{ children: PlaitElement[]; viewport?: Viewport; theme?: PlaitTheme }`，即存档结构。
- `MainBoardPreference`：`{ language: Language; copyTransparent: boolean; exportTransparent: boolean }`。
- 三个存储键常量：`main_board_content`、`main_board_tool_state`、`main_board_preference`。键名变更等同数据迁移事故。

## 页面状态和数据

| 状态 | 类型 | 作用 |
| --- | --- | --- |
| `value` | `AppValue` | 画布内容、视口、主题 |
| `initialToolState` | `Partial<DrawnixToolState>` | 恢复上次选中的工具 |
| `preference` | `MainBoardPreference` | 语言与导出透明偏好 |
| `loaded` | `boolean` | 首帧守卫，防止空画布覆盖存档 |
| `tutorial` | `boolean` | 新手引导显隐 |

`updatePreference` 采用函数式更新并在更新函数内部写盘，保证"内存态与磁盘态同源"，不要在调用处另写一次 `setItem`。

## 子组件

- `<Drawnix>`（来自 `@drawme/drawnix`）：唯一子组件，见 [../../../packages/drawnix/src/AGENTS.md](../../../packages/drawnix/src/AGENTS.md)。

## 页面文件结构

```
app/
├── app.tsx           # 页面组件（本文件）
├── app.module.scss   # 页面级样式（当前仅 1 行占位）
└── app.spec.tsx      # 冒烟测试
```

## 页面流程

1. 挂载 → `useEffect` 并发读取三个键（`Promise.all`）。
2. 有内容 → 写入 `value`，`tutorial=false`；无内容或空内容 → `tutorial=true`。
3. 有工具态 → `setInitialToolState`；有偏好 → `setPreference`。
4. `loaded=true` → 渲染 `<Drawnix initialLanguage initialPreference ... />`。
5. 用户操作 → 库回调：
   - `onChange` → 写 `main_board_content`，内容非空则关闭教程；
   - `onToolStateChange` → 写 `main_board_tool_state`；
   - `onLanguageChange` / `onPreferenceChange` → `updatePreference` 写 `main_board_preference`。

## 路由配置

无。

## 关联文档

- [../AGENTS.md](../AGENTS.md) — 宿主总览
- [../../../packages/drawnix/src/AGENTS.md](../../../packages/drawnix/src/AGENTS.md) — Drawnix 组件与 appState
- [../../../packages/drawnix/src/hooks/AGENTS.md](../../../packages/drawnix/src/hooks/AGENTS.md) — `DrawnixState` / `DrawnixToolState`

## 技术栈

- React 19 hooks（`useState` / `useEffect`）
- `localforage`（IndexedDB → localStorage 降级）
- `@drawme/drawnix` 的 `Drawnix`、`DrawnixToolState`


## 易错点与约束

- `loaded` 守卫不能去掉，否则首帧会用空画布覆盖存档。
- `localforage.config` 的 `name: 'Drawnix'` 是历史值，改动等同数据迁移。
- `onToolStateChange` 用于持久化，不要在里面 `setState`（会与库内部状态形成回环）。
<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
