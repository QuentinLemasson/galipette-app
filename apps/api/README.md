# HTTP API

Small **Node** service that exposes a typed REST surface over PostgreSQL via **Prisma**. It is intentionally minimal: character CRUD today, with **OpenAPI 3** and **Swagger UI** generated from the same Zod DTOs the handlers use ([`@galipette/shared-schemas`](../../packages/shared-schemas/README.md)).

## Stack

- **Hono** + **`@hono/node-server`** (HTTP server)
- **`@hono/zod-openapi`** — route definitions, validation, and OpenAPI document generation
- **`@hono/swagger-ui`** — interactive docs at `/docs`
- **`@galipette/database`** — Prisma client ([`packages/database`](../../packages/database/README.md))
- **`@galipette/shared-schemas`** — request/response Zod schemas and inferred DTO types

## Prerequisites

1. Copy [`.env.example`](./.env.example) to **`.env`** and set **`DATABASE_URL`** (and auth/CORS vars as needed). The API and Prisma CLI both read this file (see `src/env.ts` and [`packages/database/prisma.config.ts`](../../packages/database/prisma.config.ts)).
2. Workspace packages built so imports resolve:

   ```sh
   pnpm build:database
   pnpm build:shared-schemas
   ```

## HTTP surface

| Method   | Path               | Purpose                                                  |
| -------- | ------------------ | -------------------------------------------------------- |
| `GET`    | `/health`          | Liveness (`{ "ok": true }`)                              |
| `GET`    | `/openapi.json`    | OpenAPI 3.0 document                                     |
| `GET`    | `/docs`            | Swagger UI (loads `/openapi.json`)                       |
| `GET`    | `/characters`      | List characters (newest first), including optional sheet |
| `GET`    | `/characters/{id}` | Get one character                                        |
| `POST`   | `/characters`      | Create character (optional nested sheet)                 |
| `PATCH`  | `/characters/{id}` | Partial update (character fields and/or sheet)           |
| `DELETE` | `/characters/{id}` | Delete character (cascade sheet)                         |

Validation failures on OpenAPI routes return **400** with `{ "error": string }` (see the app `defaultHook` in `src/app.ts`).

## Source layout

```
src/
├── app.ts                    # OpenAPIHono factory, defaultHook, doc + Swagger + health
├── index.ts                  # dotenv, port, @hono/node-server listen
├── lib/
│   └── serialize-character.ts   # Prisma row → CharacterResponse DTO
├── repositories/
│   └── characters.ts         # Prisma-only data access (no HTTP types)
└── routes/
    └── characters/
        ├── definitions.ts    # createRoute(...) specs
        ├── handlers.ts       # c.req.valid → repository → JSON responses
        └── register.ts       # app.openapi(...) wiring
scripts/
└── generate-openapi.ts       # Writes shared-schemas OpenAPI YAML (no DB required)
```

**Single responsibility:** `definitions` only describe HTTP/OpenAPI; `handlers` only orchestrate request/response; `repositories` only talk to the database; `lib` only maps entities to wire DTOs.

## OpenAPI contract

Regenerate the checked-in YAML whenever you change routes or DTO metadata in shared-schemas:

```sh
# from the workspace root
pnpm generate:openapi
```

Output: [`packages/shared-schemas/openapi/galipette-api.yaml`](../../packages/shared-schemas/openapi/galipette-api.yaml).

The generator sets a dummy `DATABASE_URL` only if unset so the Prisma client module can load; it does not connect to a real database.

## Commands

```sh
# from the workspace root
pnpm dev:api              # tsx watch — http://localhost:3001 (default)
pnpm build:api            # emit dist/ with tsc
pnpm --filter api start   # after build: node dist/index.js
pnpm generate:openapi     # refresh galipette-api.yaml
```

From **`apps/api`**:

```sh
pnpm dev
pnpm build
pnpm start
pnpm generate:openapi
```

**Port:** `PORT` overrides the default **3001** (`src/index.ts`).

## Authentication (Better Auth)

Auth is configured in `src/lib/auth.ts` (Discord OAuth, invite hooks). Database tables are managed through Prisma in `@galipette/database`.

When you change auth providers or plugins, regenerate the Prisma models and migrate:

See **[Auth & invite database migrations](../../docs/auth-database-migrations.md)**.

## Related

- [`@galipette/shared-schemas`](../../packages/shared-schemas/README.md) — DTOs and generated OpenAPI YAML
- [`@galipette/database`](../../packages/database/README.md) — schema, migrations, Prisma
- [Database cheat sheet](../../docs/database-cheatsheet.md) — local DB workflows
- [Auth & invite database migrations](../../docs/auth-database-migrations.md) — Better Auth schema + Prisma migrate
- [Railway reverse-proxy architecture](../../docs/railway-reverse-proxy.md) — why the API is proxied through the web service and how cookies work
