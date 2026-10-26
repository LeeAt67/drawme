<p align="center">
  <picture style="width: 320px">
    <source media="(prefers-color-scheme: light)" srcset="https://github.com/plait-board/drawnix/blob/develop/apps/web/public/logo/logo_drawnix_h.svg?raw=true" />
    <source media="(prefers-color-scheme: dark)" srcset="https://github.com/plait-board/drawnix/blob/develop/apps/web/public/logo/logo_drawnix_h_dark.svg?raw=true" />
    <img src="https://github.com/plait-board/drawnix/blob/develop/apps/web/public/logo/logo_drawnix_h.svg?raw=true" width="360" alt="Drawnix logo and name" />
  </picture>
</p>
<div align="center">
  <h2>
    开源白板工具（SaaS），一体化白板，包含思维导图、流程图、自由画等
  <br />
  </h2>
</div>

<div align="center">
  <figure>
    <a target="_blank" rel="noopener">
      <img src="https://github.com/plait-board/drawnix/blob/develop/apps/web/public/product_showcase/case-2.png" alt="Product showcase" width="80%" />
    </a>
    <figcaption>
      <p align="center">
        All in one 白板，思维导图、流程图、自由画等
      </p>
    </figcaption>
  </figure>
  <a href="https://hellogithub.com/repository/plait-board/drawnix" target="_blank">
    <picture style="width: 250">
      <source media="(prefers-color-scheme: light)" srcset="https://abroad.hellogithub.com/v1/widgets/recommend.svg?rid=4dcea807fab7468a962c153b07ae4e4e&claim_uid=zmFSY5k8EuZri43&theme=neutral" />
      <source media="(prefers-color-scheme: dark)" srcset="https://abroad.hellogithub.com/v1/widgets/recommend.svg?rid=4dcea807fab7468a962c153b07ae4e4e&claim_uid=zmFSY5k8EuZri43&theme=dark" />
      <img src="https://abroad.hellogithub.com/v1/widgets/recommend.svg?rid=4dcea807fab7468a962c153b07ae4e4e&claim_uid=zmFSY5k8EuZri43&theme=neutral" alt="Featured｜HelloGitHub" style="width: 250px; height: 54px;" width="250" height="54"/>
    </picture>
  </a>

  <br />

  <a href="https://trendshift.io/repositories/13979" target="_blank"><img src="https://trendshift.io/api/badge/repositories/13979" alt="plait-board%2Fdrawnix | Trendshift" style="width: 250px; height: 55px;" width="250" height="55"/></a>

  <br />

  <a href="https://atomgit.com/plait-board/drawnix" target="_blank"><img src="https://atomgit.com/plait-board/drawnix/star/new_badge.svg" alt="AtomGit G-Star" height="54" /></a>
</div>

[*English README*](https://github.com/plait-board/drawnix/blob/develop/README_en.md)

## 特性

- 💯 免费 + 开源
- ⚒️ 思维导图、流程图
- 🖌 画笔
- 😀 插入图片
- 🚀 基于插件机制
- 🖼️ 📃 导出为 PNG, JSON(`.drawnix`)
- 💾 自动保存（浏览器缓存）
- ⚡ 编辑特性：撤销、重做、复制、粘贴等
- 🌌 无限画布：缩放、滚动
- 🎨 主题模式
- 📱 移动设备适配
- 📈 支持 mermaid 语法转流程图
- ✨ 支持 markdown 文本转思维导图（新支持 🔥🔥🔥）
- 🤖 DrawMe Agent：用自然语言生成图表并直接插入画布


## DrawMe Agent

本项目在 Drawnix 白板基础上增加了 DrawMe Agent。点击右上角工具栏的 ✨ 按钮打开 Agent，用自然语言描述需求，Agent 会调用 `create_diagram` 工具生成 Mermaid 流程图或 Markdown 思维导图，并直接插入当前画布。

主要能力：

- 支持多轮对话、工具调用、停止生成和多个图表的级联插入
- 兼容 OpenAI Chat Completions 接口，内置 OpenAI、DeepSeek、Ollama 预设
- 模型地址支持填写 API Base URL，或完整的 `/chat/completions` 地址

本地使用：

```bash
npm install
npm run start
```

打开页面后点击工具栏的 ✨ 按钮，在“模型设置”中填写 API 地址、模型名称和 API Key。API Key 可留空以连接本地模型。

> **安全说明**：当前实现从浏览器直接请求模型服务，并将配置保存在 `localStorage` 的 `drawnix.agent.provider` 中，仅适合本地开发或个人使用。生产环境应通过服务端代理模型请求，避免向终端用户暴露 API Key。若模型服务不支持浏览器跨域请求（CORS），也需要使用代理。


## 关于名称

***Drawnix***  ，源于绘画(  ***Draw***  )与凤凰(  ***Phoenix***  )的灵感交织。

凤凰象征着生生不息的创造力，而 *Draw* 代表着人类最原始的表达方式。在这里，每一次创作都是一次艺术的涅槃，每一笔绘画都是灵感的重生。

创意如同凤凰，浴火方能重生，而  ***Drawnix***  要做技术与创意之火的守护者。

*Draw Beyond, Rise Above.*


## 与 Plait 画图框架

*Drawnix* 的定位是一个开箱即用、开源、免费的工具产品，它的底层是 *Plait* 框架，*Plait* 是我司开源的一款画图框架，代表着公司在知识库产品([PingCode Wiki](https://pingcode.com/product/wiki?utm_source=drawnix))上的重要技术沉淀。


Drawnix 是插件架构，与前面说到开源工具比技术架构更复杂一些，但是插件架构也有优势，比如能够支持多种 UI 框架（*Angular、React*），能够集成不同富文本框架（当前仅支持 *Slate* 框架），在开发上可以很好的实现业务的分层，开发各种细粒度的可复用插件，可以扩展更多的画板的应用场景。


## 仓储结构

```
drawnix/
├── apps/
│   ├── web                   # drawnix.com
│   │    └── index.html       # HTML
├── dist/                     # 构建产物
├── packages/
│   └── drawnix/              # 白板应用
│   └── react-board/          # 白板 React 视图层
│   └── react-text/           # 文本渲染模块
├── package.json
├── ...
└── README.md
└── README_en.md

```

## 应用

[*https://drawnix.com*](https://drawnix.com) 是 *drawnix* 的最小化应用。

近期会高频迭代 drawnix.com，直到发布 *Dawn（破晓）* 版本。


## 开发

```
npm install

npm run start
```

## Docker

```
docker pull pubuzhixing/drawnix:latest
```

## 依赖

- [plait](https://github.com/worktile/plait) - 开源画图框架
- [slate](https://github.com/ianstormtaylor/slate)  - 富文本编辑器框架
- [floating-ui](https://github.com/floating-ui/floating-ui)  - 一个超级好用的创建弹出层基础库



## 贡献

欢迎任何形式的贡献：

提交 Issue 或 Pull Request 前，请先阅读 [贡献指南](CONTRIBUTING.md)。

- 提 Bug

- 贡献代码

## 感谢支持

特别感谢公司对开源项目的大力支持，也感谢为本项目贡献代码、提供建议的朋友。

<p align="left">
  <a href="https://pingcode.com?utm_source=drawnix" target="_blank">
      <img src="https://cdn-aliyun.pingcode.com/static/site/img/pingcode-logo.4267e7b.svg" width="120" alt="PingCode" />
  </a>
</p>

## License

[MIT License](https://github.com/plait-board/drawnix/blob/master/LICENSE)
