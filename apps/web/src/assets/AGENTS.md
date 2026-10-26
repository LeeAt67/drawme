# assets

> 📅 生成于：2026-10-27
> 📂 路径：`apps/web/src/assets`
> 🏷️ 类型：**Module**（应用内静态资源）

---

## 概览

Vite 的 `src/assets` 约定目录，用于**参与构建**的图片/字体等资源（会被哈希并打包）。当前仅有 `.gitkeep` 占位，没有实际资源。

## 相关概念

- **与 `apps/web/public` 的区别**：`public/` 原样复制、文件名固定，适合 favicon/robots；`src/assets/` 经过构建管线（哈希、小文件内联），适合组件引用的图片。两者不要混用。
- **导入方式**：`import logo from './assets/logo.svg'` 会得到最终 URL；直接写字符串路径则不会参与构建，部署到子路径时会失效（`index.html` 用了 `<base href="/" />`）。

## 测试用例覆盖

- [ ] 无（当前无资源）

## 相关概念（当前内容）

| 文件 | 说明 |
| --- | --- |
| `.gitkeep` | 占位，保持目录被 git 跟踪 |

## Props 定义

非组件。

## 渲染逻辑

无。

## 数据结构

无。

## API 和服务

无。

## 模块结构

```
assets/
└── .gitkeep
```

## 交互和事件

无。

## 复用说明

- 需要站点级固定文件（favicon、robots、`_headers`）放 `public/`；需要被组件 import 的图片放这里。

## 依赖关系

- 下游：`apps/web/src/**`（当前没有引用）。

## 关联文档

- [../AGENTS.md](../AGENTS.md)
- [../../public/AGENTS.md](../../public/AGENTS.md) — 非构建期静态资源

## 技术栈

- Vite 资源处理


## 状态管理

无状态（纯静态资源）。资源一旦被 import，其 URL 由构建工具在编译期确定，运行期不可变。

## 功能页面

无。

## 模块结构

```
assets/
└── .gitkeep
```

## 变更检查清单

- [ ] 文件体积是否值得放进构建产物（大图建议放 `public/` 或 CDN）。
- [ ] 是否使用 `import` 而非硬编码路径。
- [ ] 是否需要为深色主题准备第二套资源。

## 排查思路

- 资源 404：确认使用 `import` 且路径大小写正确（Windows 大小写不敏感、部署后敏感）。
- 图片过大：考虑压缩或移到 `public/` 以避免进入主包。
<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
