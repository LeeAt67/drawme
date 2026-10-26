# scripts

> 📅 生成于：2026-10-27
> 📂 路径：`scripts`
> 🏷️ 类型：**Module**（构建/发版脚本）

---

## 概览

Node 脚本集合，目前只有 `release-version.js`：用 Nx release 打版本 + 生成 CHANGELOG + 提交 + 打 tag。

**注意**：原 `publish.js`（把三个库发到 npm）已被删除，因为三个包都设为 `private: true`、项目不再以 npm 包形式分发。

## 相关概念

- **依赖 `nx release`**：脚本内部 `execSync('nx release version')`，版本号来源是 `packages/react-text/package.json`（历史遗留，选择它只是因为它最先被 bump）。`nx.json` 的 release 配置里 `git.commit/tag` 都是 `false`，所以提交与打 tag 由脚本自己完成——**不要**在 `nx.json` 里打开，否则会重复提交。
- **CHANGELOG 依赖**：`nx release changelog <version>` 会写 `CHANGELOG.md`。该文件目前已被删除，脚本运行时会重新生成。
- **无校验**：脚本不检查工作区是否干净、不检查分支，直接 `git add .` 全量提交。运行前请自行确认。
- **与 CI 的关系**：`.github/workflows/` 里没有被删除的 `publish.yml` 引用本脚本；发布镜像走 Docker 构建。

## 相关概念（执行顺序）

```
nx release version            → 修改 package.json 版本
读取 packages/react-text/package.json 的 version
nx release changelog <version> → 生成 CHANGELOG.md
git add .  →  git commit -m "chore(release): publish <version>"
git tag -a v<version> -m "v<version>"
```

## 测试用例覆盖

- [ ] 无测试（脚本类代码，建议在临时分支演练）
- [ ] 建议：运行前 `git status` 干净、`nx release version --dry-run` 预演

## Props 定义

非组件。无 CLI 参数：直接 `node scripts/release-version.js`。


## 状态管理

无（一次性命令脚本）。脚本执行过程中唯一状态是 `packages/react-text/package.json` 的 `version`，它在 `nx release version` 之后被读取并用于 changelog、commit 与 tag。

## 功能页面

无（CLI 脚本）。
## 渲染逻辑

无 UI。纯 `child_process.execSync` 顺序执行；任一步失败会抛错并中断（`stdio: 'inherit'` 便于看到 nx 输出）。

## 数据结构

无。

## API 和服务

- `child_process.execSync`、`require()` 读 `package.json`。

## 模块结构

```
scripts/
└── release-version.js
```

## 交互和事件

无。

## 复用说明

- 若将来需要发布 npm 包：恢复 `publish.js` 的同时必须把三个 `package.json` 的 `private` 改回 `false`，并在 `package.json` 里加回 `pub` 脚本。

## 依赖关系

- 上游：`nx`（22.6）、`node` 20+。
- 下游：人工执行；`package.json` 的 `release` 脚本指向它。

## 关联文档

- [../AGENTS.md](../AGENTS.md)
- [../nx.json](../nx.json) — release 配置（commit/tag 关闭）
- [../package.json](../package.json) — `release` 脚本

## 技术栈

- Node.js（CommonJS）、Nx release、git


## 常见改动指引

| 需求 | 改动位置 |
| --- | --- |
| 换版本号来源 | 脚本中 `require('../packages/react-text/package.json')` |
| 增加发布步骤 | 在 `git tag` 之后追加（当前无 npm 发布） |
| 预演 | 手动执行 `npx nx release version --dry-run` |

## 易错点与约束

- 脚本会 `git add .` 全量暂存，运行前必须确认工作区干净。
- `nx.json` 的 release 已关闭 `git.commit/tag`，若打开会与本脚本重复提交。
<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
