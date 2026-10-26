# web/src

> 📅 生成于：2026-10-27
> 📂 路径：`apps/web/src`
> 🏷️ 类型：**Module**（应用源码入口）

---

## 概览

`apps/web/src` 只有三样东西：React 挂载入口（`main.tsx`）、全局样式（`styles.scss`）、页面目录（`app/`）。它是"宿主逻辑"与"库能力"的分界线——这里之后的一切都应该来自 `@drawme/drawnix`。

## 相关概念

- **StrictMode 双渲染**：`main.tsx` 用 `<StrictMode>` 包裹 `App`。`App` 的 `useEffect` 会执行两次，因此 `localforage.getItem` 等初始化逻辑必须幂等；且不要在其中做"只能执行一次"的副作用。
- **`styles.scss` 与库样式的关系**：库自身通过 `packages/drawnix/src/styles/index.scss` 引入 Plait 主题与 `.drawnix` 作用域样式。本目录的 `styles.scss` 只做 html/body 级别的重置，不应覆盖 `.drawnix` 内部类名。
- **无路由**：应用是单页单视图，`_redirects` 里的 SPA 回退只是为将来可能出现的前端路由兜底。

## 状态管理

无。所有状态在 `app/app.tsx`。

## 功能页面

- [app/AGENTS.md](app/AGENTS.md) — 白板主页面

## 核心功能和数据流

```
main.tsx
  getElementById('root')  ──(非空断言)──▶ createRoot
  render(<StrictMode><App/></StrictMode>)
```

## 模块内的组件

- 无共享组件。`app/` 是唯一组件目录。

## 服务和工具

- 无。

## 模块结构

```
src/
├── main.tsx        # 挂载入口
├── styles.scss     # 全局重置
├── assets/         # 资源占位
└── app/
    ├── app.tsx         # 页面组件（宿主逻辑）
    ├── app.module.scss # 页面样式
    └── app.spec.tsx    # 冒烟测试
```

## 测试用例覆盖

- [x] `app/app.spec.tsx`（占位断言）
- [ ] 挂载入口无测试（`main.tsx` 依赖真实 DOM，通常由 E2E 覆盖）

## 关联文档

- [../AGENTS.md](../AGENTS.md)
- [app/AGENTS.md](app/AGENTS.md)
- [../../../packages/drawnix/src/AGENTS.md](../../../packages/drawnix/src/AGENTS.md)

## 技术栈

- React 19（`react-dom/client`）
- SCSS


## 常见改动指引

| 需求 | 改动位置 |
| --- | --- |
| 加全局样式 | `styles.scss`（只做 html/body 级重置） |
| 加全局 Provider | `main.tsx`（注意 StrictMode 双渲染） |
| 加页面 | 新建 `src/<page>/` 目录并在 `app.tsx` 挂载（当前无路由库） |

## 易错点与约束

- `main.tsx` 对 `#root` 用了非空断言，删掉 `<div id="root">` 会直接崩溃。
- `styles.scss` 不要覆盖 `.drawnix` 内部类名（如 `.draw-toolbar`），否则会与库样式冲突且难以定位。
- StrictMode 下 `useEffect` 执行两次，任何"只能跑一次"的初始化都要加守卫。

## 变更检查清单

- [ ] 新增全局样式是否只影响 html/body，不侵入 `.drawnix`。
- [ ] 新增 Provider 是否放在 `Drawnix` 外层（库内部也需要 i18n 时注意顺序）。
- [ ] 是否引入了额外的路由库（当前刻意保持单页）。

## 排查思路

- 页面空白：确认 `index.html` 的 `#root` 存在、`main.tsx` 无编译错误。
- 样式丢失：确认 `styles.scss` 被 `main.tsx` 或 `index.html` 引入。
## 与库的边界

`main.tsx` 与 `styles.scss` 是"宿主适配层"：它们可以依赖浏览器 API 与全局样式，但不应 import 任何 `packages/*` 的内部模块（只能走 `@drawme/*` 公开入口），否则会把内部实现细节耦合进宿主。
<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
