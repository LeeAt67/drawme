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
cp apps/api/.env.example apps/api/.env   # set the model key; local auth is off by default
npm run start:all                        # start Web (7200) and API (8787)
```

The dev server runs at <http://localhost:7200>

## DrawMe Agent

Click the ✨ button on the right side of the top toolbar to open the agent, then describe what you need. The agent calls the `create_diagram` tool to build a Mermaid flowchart or a Markdown mind map and inserts it into the current canvas.

Highlights:

- Multi-turn conversation, tool calls, stop generation, and cascading insertion of multiple diagrams
- Works with any OpenAI Chat Completions compatible endpoint; model and URL are configured on the server
- Passwordless local mode with a fixed `user_local` identity; production can re-enable project sign-in
- The browser only calls the same-origin `/api/agent/*`; the API key never reaches the frontend

Local development sets `AUTH_DISABLED=true` by default, so the agent panel is usable immediately and never shows a sign-in form. The model key still lives only on the server.

### Server configuration

Agent requests are proxied by `apps/api` (Fastify). See `apps/api/.env.example`:

```dotenv
AGENT_API_BASE_URL=https://api.openai.com/v1
AGENT_API_KEY=sk-...
AGENT_MODEL=gpt-4o-mini
# Passwordless for local development; set false and configure an account in production
AUTH_DISABLED=true
# AUTH_ADMIN_EMAIL=admin@drawme.local
# AUTH_ADMIN_PASSWORD=change-me
```

In development the Vite dev server proxies `/api` to `http://localhost:8787`. In production the API can also serve the built frontend through `WEB_DIST_DIR`, or you can put both behind one reverse proxy.

> **Security note**: the API key lives only in server-side environment variables and is never exposed to the browser. `AUTH_DISABLED=true` lets anyone who can reach the API spend that key, so use it only on a local machine or trusted network. Before a public deployment, set `AUTH_DISABLED=false`, configure `AUTH_ADMIN_EMAIL` / `AUTH_ADMIN_PASSWORD_HASH`, and set `COOKIE_SECURE=true`.

## Repository layout

```
.
├── apps/
│   ├── web                   # Web app entry
│   └── api                   # Fastify BFF: agent proxy and future backend
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
npm run start:api  # start the API only
npm run start:all  # start Web and API together
npm run build      # build all projects
npm run build:web  # build the web app only
npm run build:api  # build the API only
npm test           # run unit tests
npm run lint       # lint
npm run format     # format
```

## Docker

```bash
docker build -t drawme:latest .
docker run --rm -p 8080:8080 \
  -e AGENT_API_KEY=sk-... \
  -e AGENT_MODEL=gpt-4o-mini \
  -e AUTH_DISABLED=false \
  -e AUTH_ADMIN_EMAIL=admin@example.com \
  -e AUTH_ADMIN_PASSWORD=change-me \
  -e COOKIE_SECURE=false \
  drawme:latest
```

Inside the image Fastify serves both `/api/*` and the built frontend from `WEB_DIST_DIR`, so the app is available on port 8080.

Open <http://localhost:8080> after the build finishes.

## License and third-party notices

This project is derived from the MIT-licensed Drawnix project and uses third-party components such as Plait, Slate, and Floating UI. Copyright and license notices are available in [LICENSE](LICENSE), [NOTICE](NOTICE), and in the license files shipped with each dependency.
