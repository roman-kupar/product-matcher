FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY client/package.json client/
COPY service/package.json service/
RUN npm ci

# --- Service: compile TypeScript, run plain JS (the service has no runtime dependencies) ---
FROM deps AS service-build
COPY service service
RUN npm run build --workspace=service

FROM node:24-alpine AS service
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3001
COPY --from=service-build /app/service/package.json ./
COPY --from=service-build /app/service/dist ./dist
USER node
EXPOSE 3001
HEALTHCHECK --interval=10s --timeout=3s CMD wget -qO- http://127.0.0.1:3001/api/health >/dev/null || exit 1
CMD ["node", "dist/index.js"]

# --- Web: build the static UI, serve it with nginx, which also proxies /api to the service ---
FROM deps AS web-build
COPY client client
RUN npm run build --workspace=client

FROM nginx:1.29-alpine AS web
COPY client/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=web-build /app/client/dist /usr/share/nginx/html
EXPOSE 80
