# `@galipette/shared-schemas`

Shared **Zod** validators and **TypeScript** types for API boundaries (and later backend / frontend apps). Prisma entity types are **re-exported** from **`@galipette/database`** so callers can align runtime validation with the database layer without duplicating model definitions.

## Contents

| Area | Exports |
|------|---------|
| Character DTOs | `characterCreateSchema`, `characterUpdateSchema`, `characterPatchSchema`, `characterSheetWriteSchema`, `characterSheetUpdateSchema`, `characterAttributesSchema`, `skillIdsSchema` |
| API / OpenAPI | `characterResponseSchema`, `characterSheetResponseSchema`, `apiErrorSchema`, `idPathParamsSchema`; generated [`openapi/galipette-api.yaml`](./openapi/galipette-api.yaml) |
| Inferred types | `CharacterCreate`, `CharacterUpdate`, `CharacterPatch`, `CharacterSheetWrite`, `CharacterSheetUpdate`, `CharacterResponse`, `CharacterAttributes`, `SkillIds` |
| Prisma models (types) | `Character`, `CharacterSheet`, `Prisma` |

Source: [`src/character.ts`](./src/character.ts), barrel [`src/index.ts`](./src/index.ts).

## OpenAPI

DTO Zod objects are extended for OpenAPI (`extendZodWithOpenApi` via `@hono/zod-openapi`) so the **`apps/api`** Hono app can emit a machine-readable spec. Regenerate the checked-in contract after changing routes or DTO metadata:

```bash
pnpm generate:openapi
```

Output: [`openapi/galipette-api.yaml`](./openapi/galipette-api.yaml) (OpenAPI 3.0).

## Build order

This package depends on **`@galipette/database`**. After changing the Prisma schema, run from the repo root:

```bash
pnpm build:database
pnpm build:shared-schemas
```

Or rely on CI ordering: **database** (generate + `tsc`) before **shared-schemas**.

## Usage

```ts
import {
  characterCreateSchema,
  type CharacterCreate,
  type Character,
} from "@galipette/shared-schemas";

const parsed = characterCreateSchema.safeParse(body);
if (!parsed.success) {
  // handle Zod error
}
```

Use **`parsed.data`** for inserts nested with Prisma; keep **`skillIds`** as opaque string ids until they map to compiled content.

## Related

- [`@galipette/database`](../database/README.md) — schema, migrations, `prisma` client.
- [Database cheat sheet](../../docs/database-cheatsheet.md) — operational DB workflows.
