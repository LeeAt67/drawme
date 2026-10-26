<h2 align="center">DrawMe · AI Whiteboard &amp; Mind Mapping</h2>

<p align="center">
  An all-in-one whiteboard with mind maps, flowcharts, freehand drawing, and DrawMe Agent for natural-language diagram generation.
</p>

## Features

- 🧠 Mind maps, flowcharts, and freehand drawing
- 🖼️ Insert images, export PNG / SVG / JSON
- 💾 Auto-save in browser storage
- 🌌 Infinite canvas with zoom and scroll
- 🎨 Multiple themes with mobile support
- 📈 Mermaid to flowchart
- ✨ Markdown to mind map
- 🤖 DrawMe Agent: generate diagrams from natural language and insert them into the canvas

## Getting started

```bash
npm install
npm run start
```

The dev server runs at <http://localhost:7200>

## DrawMe Agent

Click the ✨ button on the right side of the top toolbar to open the agent, then describe what you need. The agent calls the `create_diagram` tool to build a Mermaid flowchart or a Markdown mind map and inserts it into the current canvas.

Highlights:

- Multi-turn conversation, tool calls, stop generation, and cascading insertion of multiple diagrams
- Works with OpenAI Chat Completions compatible endpoints; presets for OpenAI, DeepSeek, and Ollama
- Accepts either an API base URL or a full `/chat/completions` URL

Fill in the API address, model, and API key in "Model settings" to start. Leave the key empty to use a local model.

> **Security note**: this implementation calls the model endpoint directly from the browser and stores the configuration in `localStorage` under `drawme.agent.provider`. It is intended for local development or personal use. In production, proxy model requests through your backend so end users never see the API key; a proxy is also required when the model provider does not allow browser CORS requests.

## Repository layout

```
.
├── apps/
│   └── web                   # Web app entry
├── packages/
│   ├── drawnix               # Whiteboard application
│   ├── react-board           # React view layer for the board
│   └── react-text            # Text rendering module
├── scripts/                  # Build and release scripts
└── package.json
```

## Commands

```bash
npm run start      # start the dev server
npm run build      # build all projects
npm run build:web  # build the web app only
npm test           # run unit tests
npm run lint       # lint
npm run format     # format
```

## Docker

```bash
docker build -t drawme:latest .
docker run --rm -p 8080:80 drawme:latest
```

Open <http://localhost:8080> after the build finishes.

## License and third-party notices

This project is derived from the MIT-licensed Drawnix project and uses third-party components such as Plait, Slate, and Floating UI. Copyright and license notices are available in [LICENSE](LICENSE), [NOTICE](NOTICE), and in the license files shipped with each dependency.
