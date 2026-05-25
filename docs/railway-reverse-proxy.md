# Railway reverse-proxy architecture

> **TL;DR** — The web app's Nginx proxies every `/api/*` request to the API
> service over Railway's private network. From the browser's perspective both
> the SPA and the API live on the **same origin**, which eliminates all
> cross-site cookie issues.

## Why the change was made

The original deployment used two separate public Railway domains:

| Service | Public URL |
|---------|-----------|
| Web (Nginx + Vite SPA) | `galipette-app.up.railway.app` |
| API (Hono + Node) | `galipette-api.up.railway.app` |

The web app called the API cross-origin with `credentials: "include"`.
Discord OAuth worked like this:

```
Browser (galipette-app) → POST /sign-in/social → galipette-api
                        → redirect to Discord
Discord                 → redirect to galipette-api/callback
galipette-api           → set session cookie, redirect to galipette-app
```

This broke for two compounding reasons:

### 1. `*.up.railway.app` is on the Public Suffix List

Railway's `up.railway.app` domain is registered on the
[Public Suffix List](https://publicsuffix.org/). This means browsers treat
`galipette-app.up.railway.app` and `galipette-api.up.railway.app` as
**different sites** — not subdomains of a shared parent. Cookies cannot be
shared with `Domain=.up.railway.app`, and every cross-domain cookie is
considered third-party.

### 2. Modern browsers partition or block third-party cookies

- **Firefox (Total Cookie Protection)**: partitions cookies by top-level
  site. A session cookie set during a top-level navigation to
  `galipette-api` lives in a different partition than the one the web app
  needs when making a `fetch()` from `galipette-app`. The cookie is
  invisible across partitions even with `SameSite=None; Secure`.

- **Chrome (third-party cookie deprecation)**: rejects `SameSite=None`
  cookies that lack the `Partitioned` attribute, and will fully block
  unpartitioned third-party cookies.

The OAuth state cookie (`__Secure-better-auth.state`) was rejected on the
initial cross-site fetch. Even after switching to database-backed state
(`storeStateStrategy: "database"` + `skipStateCookieCheck`), the session
cookie set during the callback redirect was partitioned into a context
the web app could never read.

### Why a custom domain wasn't viable

Sharing a registrable domain (e.g. `app.galipette.fr` / `api.galipette.fr`)
with `crossSubDomainCookies` would fix partitioning, but the project uses
Railway's built-in `*.up.railway.app` domains exclusively.

## Current architecture

```
Browser
  │
  │  https://galipette-app.up.railway.app
  │
  ▼
┌──────────────────────────────────────┐
│  Web service  (Nginx)                │
│                                      │
│  /              → SPA static files   │
│  /api/*         → proxy_pass ────────┼──── private network ────▶ API service
│  /health        → 200 "ok"           │     (api.railway.internal:3001)
└──────────────────────────────────────┘
```

All browser traffic goes to a **single origin**. The Nginx `location /api/`
block forwards requests to the API container over Railway's private
WireGuard mesh. Cookies are first-party, `SameSite=Lax` works, and no
browser partitioning or blocking applies.

## Key configuration

### Nginx (`apps/web/nginx.conf`)

```nginx
location /api/ {
    proxy_pass http://API_UPSTREAM/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto https;
    ...
}
```

`API_UPSTREAM` is a placeholder replaced at container startup by
`docker-entrypoint.sh` using the `API_UPSTREAM` env var.

### Entrypoint (`apps/web/docker-entrypoint.sh`)

Injects `PORT` and `API_UPSTREAM` into the Nginx config via `sed`, then
starts Nginx.

### API server (`apps/api/src/index.ts`)

```ts
serve({ fetch: app.fetch, port, hostname: "::" }, ...)
```

`hostname: "::"` binds Node.js to all IPv6 (and IPv4 via dual-stack)
interfaces. Railway's private networking routes over IPv6 internally, so
this is required for the API to accept proxied connections.

### Frontend origin (`apps/web/src/lib/api-origin.ts`)

```ts
const raw = import.meta.env.VITE_API_ORIGIN ?? "";
```

Defaults to `""` (same-origin / relative paths). In local dev, set
`VITE_API_ORIGIN=http://localhost:3001` to call the API cross-origin on a
separate port.

### Better Auth (`apps/api/src/lib/auth.ts`)

```ts
advanced: {
  useSecureCookies: baseURL.startsWith("https://"),
},
```

`useSecureCookies` is derived from the `baseURL`. No `SameSite=None`,
`crossSubDomainCookies`, `storeStateStrategy`, or `skipStateCookieCheck`
overrides are needed — standard cookie defaults work because everything is
same-origin.

## Railway environment variables

### Web service

| Variable | Value | Purpose |
|----------|-------|---------|
| `API_UPSTREAM` | `api.railway.internal:3001` | Nginx proxy target (private network) |
| `VITE_API_ORIGIN` | *(unset or empty)* | Same-origin in production |

### API service

| Variable | Value | Purpose |
|----------|-------|---------|
| `BETTER_AUTH_URL` | `https://galipette-app.up.railway.app` | Auth routes are accessed through the web domain |
| `WEB_ORIGIN` | `https://galipette-app.up.railway.app` | CORS allowlist (harmless for same-origin, needed for local dev parity) |
| `PORT` | `3001` | Explicit port the Hono server binds to |

### Discord Developer Portal

OAuth2 redirect URI must point through the web domain:

```
https://galipette-app.up.railway.app/api/auth/callback/discord
```

## Local development

Local dev is unchanged. The API runs on `localhost:3001`, the Vite dev
server on `localhost:5173`. Set `VITE_API_ORIGIN=http://localhost:3001` in
`apps/web/.env` and start both:

```sh
pnpm dev        # Vite SPA on :5173
pnpm dev:api    # Hono API on :3001
```

CORS is handled by the API's Hono middleware (`WEB_ORIGIN` defaults to
`http://localhost:5173`). Cross-origin cookies work locally because
`localhost` is a secure context and there are no third-party restrictions
within the same machine.
