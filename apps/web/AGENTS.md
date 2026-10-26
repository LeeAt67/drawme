# web

> 📅 生成于：2026-10-27
> 📂 路径：`apps/web`
> 🏷️ 类型：**Module**（应用外壳）

---

## 概览

`apps/web` 是 DrawMe 的浏览器宿主：负责 HTML 骨架、初始挂载、把画布状态持久化到浏览器，并把 `packages/drawnix` 的 `Drawnix` 组件渲染出来。

它刻意保持"薄"：**不实现**任何工具、面板、插件；所有交互能力都来自 `@drawme/drawnix`。因此排查 UI 问题时应先看库，只有在"数据没存住 / 语言没恢复 / 构建拆包"时才属于本目录。

## 相关概念

- **入口链**：`index.html` → `/src/main.tsx` → `./app/app`。`index.html` 里的 `<base href="/" />` 决定静态资源根路径，部署到子路径时必须同步修改。
- **`_headers` / `_redirects`**：Cloudflare Pages 风格的静态部署配置。`_redirects` 的 `/* /index.html 200` 是 SPA 刷新不 404 的关键；本地 Vite dev server 不读这两个文件。
- **SEO 元数据**：品牌名（DrawMe）、描述、OG/Twitter、JSON-LD 全部硬编码在 `index.html`，改品牌时这里是唯一入口。
- **构建产物**：`vite.config.ts` 的 `build.outDir` 指向仓库根 `dist/apps/web`，`Dockerfile` 与 Cloudflare Pages 都按该路径取产物。

## 状态管理

本目录**没有**全局 store，状态全部在 [src/app/AGENTS.md](src/app/AGENTS.md) 描述的 `App` 组件里，通过 props 传给 `Drawnix`，再通过回调收回。

## 功能页面

- 白板主页面（`/`）→ [src/app/AGENTS.md](src/app/AGENTS.md)

## 核心功能和数据流

```
index.html  ──加载 /src/main.tsx──▶ main.tsx
                                      │ StrictMode
                                      ▼
                                   App（读写 localforage）
                                      │ props + callbacks
                                      ▼
                                  <Drawnix>（库）
```

## 模块内的组件

- `App`（路径：`src/app/app.tsx`）— 唯一页面组件，见 [src/app/AGENTS.md](src/app/AGENTS.md)

## 服务和工具

- **`vite.config.ts`**：端口固定 `7200`（E2E 与文档均依赖此端口）、`cacheDir` 隔离、`test.environment: jsdom`。
- **`public/`**：`favicon.ico`、`robots.txt`（已移除上游域名与 sitemap 引用）、`_headers`（长缓存 + HTML 不缓存）、`_redirects`（SPA 回退）。
- 无 API 客户端、无路由库。

## 模块结构

```
apps/web/
├── index.html            # 标题/描述/OG/JSON-LD（品牌唯一来源）
├── project.json          # Nx 项目（targets 由插件推断）
├── vite.config.ts        # dev 7200 / preview 4300 / 产物 dist/apps/web
├── tsconfig*.json        # app / spec 两套
├── public/
│   ├── _headers          # 缓存策略
│   ├── _redirects        # SPA 回退
│   ├── favicon.ico
│   └── robots.txt
└── src/
    ├── main.tsx          # createRoot + StrictMode
    ├── styles.scss       # 全局样式重置与字体
    ├── assets/           # 静态图片占位（当前为空）
    └── app/              # App 组件 + 样式 + 冒烟测试
```

## 测试用例覆盖

- [x] `src/app/app.spec.tsx`：Vitest 冒烟占位
- [x] `apps/web-e2e/src/example.spec.ts`：Playwright 校验标题与画布容器可见
- [ ] `_redirects` SPA 回退、localforage 恢复流程无自动化覆盖

## 关联文档

- [src/AGENTS.md](src/AGENTS.md)
- [src/app/AGENTS.md](src/app/AGENTS.md)
- [public/AGENTS.md](public/AGENTS.md)
- [../../packages/drawnix/AGENTS.md](../../packages/drawnix/AGENTS.md)

## 技术栈

- Vite 8 + `@vitejs/plugin-react` + `nxViteTsPaths`（把 `@drawme/*` 解析到源码）
- React 19、TypeScript
- Vitest 4（jsdom）


## 常见改动指引

| 需求 | 改动位置 |
| --- | --- |
| 改 SEO/分享卡片 | `index.html` 的 meta 与 JSON-LD |
| 允许子路径部署 | `index.html` 的 `<base href>` + `vite.config.ts` 的 `base` |
| 换图标 | `public/favicon.ico`（代码无需改动） |
| 改静态缓存策略 | `public/_headers` |
<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
