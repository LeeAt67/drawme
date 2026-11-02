FROM node:22 AS builder

WORKDIR /builder

COPY . /builder

RUN npm ci \
    && npm run build \
    && npm prune --omit=dev

FROM node:22-slim AS runner

WORKDIR /app

ENV NODE_ENV=production \
    PORT=8080 \
    HOST=0.0.0.0 \
    WEB_DIST_DIR=/app/dist/apps/web

COPY --from=builder /builder/package.json ./package.json
COPY --from=builder /builder/node_modules ./node_modules
COPY --from=builder /builder/dist/apps/api ./dist/apps/api
COPY --from=builder /builder/dist/apps/web ./dist/apps/web

EXPOSE 8080

CMD ["node", "dist/apps/api/main.js"]
