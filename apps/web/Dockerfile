# Galipette web — Vite SPA built with pnpm, served by Nginx (Railway).
#
# Build from the monorepo root:
#   docker build -f apps/web/Dockerfile --build-arg VITE_API_ORIGIN=https://your-api.example.com -t galipette-web .
#
# Railway: leave the service root at the repo root, set Dockerfile path to
# `apps/web/Dockerfile`, and add a build variable `VITE_API_ORIGIN` (your public API URL).

# ---- build ----
FROM node:24-alpine AS builder

RUN corepack enable && corepack prepare pnpm@11.0.9 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps apps
COPY packages packages
COPY tsconfig.base.json ./

RUN pnpm install --frozen-lockfile --filter web...

ARG VITE_API_ORIGIN=
ENV VITE_API_ORIGIN=${VITE_API_ORIGIN}

RUN pnpm --filter @galipette/content-schema build \
    && pnpm --filter @galipette/compiled-content build \
    && pnpm --filter web build

# ---- serve ----
FROM nginxinc/nginx-unprivileged:alpine AS runner

# Image defaults to non-root; root is required to chmod and normalize the entrypoint.
USER root

COPY apps/web/nginx.conf /etc/nginx/nginx.conf
COPY apps/web/docker-entrypoint.sh /docker-entrypoint.sh
RUN sed -i 's/\r$//' /docker-entrypoint.sh && chmod +x /docker-entrypoint.sh

COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

USER nginx

EXPOSE 8080

ENTRYPOINT ["/docker-entrypoint.sh"]
