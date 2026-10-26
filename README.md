<h2 align="center">DrawMe · AI 白板与思维导图</h2>

<p align="center">
  一体化白板工具：思维导图、流程图、自由绘制，以及用自然语言生成图表的 DrawMe Agent。
</p>

## 特性

- 🧠 思维导图、流程图、自由绘制
- 🖼️ 插入图片，导出 PNG / SVG / JSON
- 💾 自动保存（浏览器本地缓存）
- 🌌 无限画布：缩放、滚动
- 🎨 多主题模式，适配移动设备
- 📈 Mermaid 转流程图
- ✨ Markdown 转思维导图
- 🤖 DrawMe Agent：用自然语言生成图表并直接插入画布

## 快速开始

```bash
npm install
npm run start
```

默认启动地址：<http://localhost:7200>

## DrawMe Agent

点击顶部工具栏右侧的 ✨ 按钮打开 Agent，用自然语言描述需求。Agent 会调用 `create_diagram` 工具生成 Mermaid 流程图或 Markdown 思维导图，并直接插入当前画布。

主要能力：

- 支持多轮对话、工具调用、停止生成和多个图表的级联插入
- 兼容 OpenAI Chat Completions 接口，内置 OpenAI、DeepSeek、Ollama 预设
- 模型地址支持填写 API Base URL，或完整的 `/chat/completions` 地址

在「模型设置」中填写 API 地址、模型名称和 API Key 后即可使用；API Key 可留空以连接本地模型。

> **安全说明**：当前实现由浏览器直接请求模型服务，配置保存在 `localStorage` 的 `drawme.agent.provider` 中，仅适合本地开发或个人使用。生产环境应通过服务端代理模型请求，避免向终端用户暴露 API Key；若模型服务不支持浏览器跨域请求（CORS），也需要使用代理。

## 仓库结构

```
.
├── apps/
│   └── web                   # Web 应用入口
├── packages/
│   ├── drawnix               # 白板应用
│   ├── react-board           # 白板 React 视图层
│   └── react-text            # 文本渲染模块
├── scripts/                  # 构建与发版脚本
└── package.json
```

> 每个目录下都有 `AGENTS.md`，描述该目录的职责、关键约束与常见改动位置，供 AI 编码助手检索。建议从根目录 [AGENTS.md](AGENTS.md) 开始阅读。

## 常用命令

```bash
npm run start      # 启动开发服务器
npm run build      # 构建全部项目
npm run build:web  # 仅构建 Web 应用
npm test           # 运行单元测试
npm run lint       # 代码检查
npm run format     # 代码格式化
```

## Docker

```bash
docker build -t drawme:latest .
docker run --rm -p 8080:80 drawme:latest
```

构建完成后访问 <http://localhost:8080>。

## 许可与第三方声明

本项目基于 MIT 许可的 Drawnix 项目二次开发，并使用了 Plait、Slate、Floating UI 等第三方组件。各组件版权与许可声明见 [LICENSE](LICENSE)、[NOTICE](NOTICE) 及对应依赖包附带的许可文件。
