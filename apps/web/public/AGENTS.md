# public

> 📅 生成于：2026-10-27
> 📂 路径：`apps/web/public`
> 🏷️ 类型：**Module**（静态资源与部署配置）

---

## 概览

`apps/web/public` 的内容会被 Vite **原样复制**到构建产物根目录，不做哈希、不做转换。因此这里只放"必须保持固定文件名"的东西：favicon、robots、以及托管平台读取的部署配置文件。

## 相关概念

- **`_headers`**：Cloudflare Pages 语法。当前策略是"静态资源长缓存（1 年 immutable）+ HTML 不缓存（`max-age=0`）"。修改时注意：给 `*.html` 加长缓存会导致发版后用户拿到旧页面。
- **`_redirects`**：`/* /index.html 200` 表示所有未命中路径都返回 `index.html` 且状态码 200（不是 302），这是 SPA 刷新不 404 的标准做法。
- **`robots.txt`**：已移除上游 `drawnix.com` 的 sitemap 引用与 sitemap.xml 文件；如需重新启用 SEO，请为本项目域名重新生成 sitemap。

## 状态管理

无。

## 功能页面

无（非代码目录）。

## 核心功能和数据流

```
public/*  ──Vite build 原样复制──▶  dist/apps/web/*
dist/apps/web  ──Dockerfile / Cloudflare Pages──▶ 静态托管
```

## 模块内的组件

无。

## 服务和工具

| 文件 | 作用 | 注意 |
| --- | --- | --- |
| `favicon.ico` | 站点图标 | 仍是旧品牌图标，换品牌时替换此文件即可，代码无需改动 |
| `robots.txt` | 爬虫规则 | 含 `Disallow: /admin/`、`/private/`，本项目暂无这些路径 |
| `_headers` | 缓存策略 | Cloudflare Pages 专用，其他平台忽略 |
| `_redirects` | SPA 回退 | Cloudflare Pages 专用 |

## 模块结构

```
public/
├── _headers
├── _redirects
├── favicon.ico
└── robots.txt
```

## 测试用例覆盖

- [ ] 无自动化测试（静态文件，靠部署后人工验证刷新与缓存头）

## 关联文档

- [../AGENTS.md](../AGENTS.md) — 应用外壳
- [../index.html](../../index.html) — 引用 favicon 的入口

## 技术栈

- Cloudflare Pages 静态部署约定
- Vite `publicDir` 复制机制


## 常见改动指引

| 需求 | 改动位置 |
| --- | --- |
| 重新启用 sitemap | 新建 `sitemap.xml`（按本项目域名），并在 `robots.txt` 加 `Sitemap:` |
| 禁止搜索引擎收录预览环境 | `robots.txt` 改为 `Disallow: /` |
| 静态资源加长缓存 | `_headers` 的 `/*` 规则 |
| HTML 不缓存 | `_headers` 的 `/*.html` 与 `/` 规则 |

## 易错点与约束

- `_headers` 与 `_redirects` 只被 Cloudflare Pages 识别，本地 dev server 与 Docker（busybox httpd）都不会应用。
- 给 `*.html` 配 `immutable` 会让用户长期拿到旧版本，发版后需要改名才能失效。
- `_redirects` 必须是 200 重写而不是 301/302，否则浏览器地址栏会变化。
- `public/` 里的文件不会被打包哈希，改动文件名等于破坏外部引用。

## 变更检查清单

- [ ] `robots.txt` 是否仍指向已删除的 sitemap。
- [ ] `_headers` 是否仍保持 HTML 不缓存。
- [ ] `_redirects` 是否仍为 200 重写。
- [ ] 新增静态文件是否需要加入 `_headers` 的缓存规则。
- [ ] 品牌相关文件（favicon）是否已替换。

## 排查思路

- 刷新 404：先确认 `_redirects` 是否被部署平台识别（Cloudflare Pages 的 Output 目录必须是构建产物根）。
- 更新不生效：检查 `_headers` 是否给 HTML 设了长缓存，或浏览器 Service Worker 是否缓存了旧资源。
<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
