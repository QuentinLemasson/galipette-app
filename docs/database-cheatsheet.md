# Database cheat sheet (Galipette)

Commands assume **pnpm** from the **repository root** and a configured **`DATABASE_URL`** in **`apps/api/.env`** (see [`apps/api/.env.example`](../apps/api/.env.example)). Prisma reads that file via **`packages/database/prisma.config.ts`**.

---

## Connection string (“open” the database)

1. Ensure PostgreSQL is running and a database exists.
2. Set **`DATABASE_URL`**, for example:

   ```env
   DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/galipette?schema=public"
   ```

3. **CLI** commands (`migrate`, `studio`, `db execute`, …) use that URL through **`prisma.config.ts`** when you run them from the workspace scripts below (they `pnpm --filter @galipette/database` so the cwd is the database package).

4. **Application runtime** (`PrismaClient` in code) uses **`process.env.DATABASE_URL`** — load env the way your server or test runner expects (dotenv, Docker, platform secrets, etc.).

**Quick connectivity check:**

```bash
pnpm db:status
```

If the DB is unreachable, fix the URL / network / credentials first.

---

## Browse data (GUI)

```bash
pnpm db:studio
```

Opens **Prisma Studio** in the browser: inspect tables, filter rows, and edit cells manually. Useful for smoke tests and ad hoc fixes.

---

## Create / apply a migration (development)

After editing **`packages/database/prisma/schema.prisma`**:

```bash
pnpm db:generate
pnpm db:migrate
```

`migrate dev` creates a new migration from the diff, applies it to your dev database, and records it in **`_prisma_migrations`**.

**Prisma 7:** `migrate dev` does **not** run **`generate`** for you — run **`pnpm db:generate`** (or **`pnpm build:database`**) before building **`@galipette/shared-schemas`** or apps that import the client.

---

## Deploy migrations (CI / production)

Use on servers where you only apply existing SQL, not invent new migrations:

```bash
pnpm db:deploy
```

Typical pipeline: checkout → `pnpm install` → set **`DATABASE_URL`** → **`pnpm db:deploy`** → start app.

---

## Prototype schema without migration files (local only)

```bash
pnpm db:push
```

Syncs the database to the current schema **without** creating migration files. Fine for throwaway DBs; for anything versioned, prefer **`db:migrate`**.

---

## Validate schema (no DB required)

```bash
pnpm db:validate
```

---

## Add a new table / column

1. Edit **`packages/database/prisma/schema.prisma`** (add `model` / fields).
2. **`pnpm db:generate`** — refresh the generated client under **`packages/database/src/generated`**.
3. **`pnpm db:migrate`** — name the migration when prompted (or use your team’s workflow).
4. **`pnpm build:database`** then **`pnpm build:shared-schemas`** — refresh compiled packages.

---

## Run raw SQL from a file

Prisma 7 resolves the connection from **`prisma.config.ts`** (no `--url` on the CLI).

```bash
cd packages/database
pnpm exec prisma db execute --file ./path/to/script.sql
```

From root you can run:

```bash
pnpm --filter @galipette/database exec prisma db execute --file ./path/to/script.sql
```

Use a path relative to **`packages/database`** when you `cd` there, or pass an absolute path.

---

## Insert / delete / update data manually

**Option A — Prisma Studio (recommended for one-offs)**  
`pnpm db:studio` → edit rows in the UI.

**Option B — SQL**  
Write `INSERT` / `UPDATE` / `DELETE` in a `.sql` file and run **`db execute`** as above.

**Option C — REPL / script**  
Small **tsx** script in the repo (example pattern):

```ts
import { prisma } from "@galipette/database";

await prisma.character.create({
  data: {
    name: "Ari",
    player: "player-1",
    sheet: { create: { attributes: { force: 10 }, skillIds: ["skill-acrobatie"] } },
  },
});
await prisma.$disconnect();
```

Set **`DATABASE_URL`** in the environment before running.

---

## Useful diagnostics

| Goal                    | Command               |
| ----------------------- | --------------------- |
| Migration history vs DB | `pnpm db:status`      |
| Regenerate client only  | `pnpm db:generate`    |
| Build DB package        | `pnpm build:database` |

---

## Better Auth + invite tables

Better Auth uses the Prisma adapter: **`better-auth generate`** updates `schema.prisma`, then use the normal **`pnpm db:migrate`** flow above. Do **not** use `better-auth migrate` with Prisma.

Full step-by-step: **[Auth & invite database migrations](./auth-database-migrations.md)**.

---

## Package docs

- [`packages/database/README.md`](../packages/database/README.md) — architecture and scripts reference.
- [Auth & invite database migrations](./auth-database-migrations.md) — Better Auth schema generation + Prisma migrate.
- [Main README](../README.md) — full workspace command table.
