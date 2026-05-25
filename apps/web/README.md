# Web app

Minimal MVP that validates the [`@galipette/compiled-content`](../../packages/compiled-content/README.md) pipeline by exposing every compiled entity through a TanStack Router-powered explorer.

## Stack

- **React 19** + **TypeScript**
- **Vite** (dev server / bundler)
- **Tailwind CSS v4** (via `@galipette/ui/globals.css`; app shell in `src/index.css`)
- **TanStack Router** (code-based routes; entity detail uses a splat on **slug**)
- **Compiled mdast** (`entity.compiledContent`) rendered via small React components (paragraphs, headings, text, wikilinks, thematic breaks, and a generic fallback for other mdast nodes)
- **react-markdown** (fallback only when an entity has no `compiledContent`)
- **Plain `fetch`** against **`apps/api`** for the character roster (optional; see [HTTP API](../../apps/api/README.md))

## Routes

| Path               | Component                                     | Purpose                                                                                                                                                              |
| ------------------ | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                | `app/pages/HomePage`                          | Welcome screen + per-type entity counts + link to characters                                                                                                         |
| `/characters`      | `features/character/pages/CharacterListPage`  | Lists characters from **`GET /characters`** (Hono API)                                                                                                               |
| `/characters/<id>` | `features/character/pages/CharacterSheetPage` | Loads one character; edits attributes (JSON); **skills** = multi-select of compiled **`spell`** entities via `contentRepository.getByType("spell")`; **PATCH** saves |
| `/entity/<slug>`   | `features/wiki/pages/EntityPage`              | Resolves the entity by **`CompiledEntity.slug`** and renders metadata + compiled body                                                                                |
| `/not-found`       | `app/pages/NotFoundRoutePage`                 | Optional **`?operand=`** / **`?link=`** search params (used when opening an unresolved wikilink from entity content)                                                 |

The entity route uses a TanStack splat (`entity/$`) so the full **slug** (e.g. `wiki/skills/spells/lightning-arc`, no `.md` suffix) is represented as URL path segments, each segment URL-encoded where needed.

## HTTP API (characters)

In **production (Railway)**, the web service's Nginx reverse-proxies `/api/*` to the API over Railway's private network — see **[Railway reverse-proxy architecture](../../docs/railway-reverse-proxy.md)**. All requests are same-origin; no cross-site cookie issues apply.

In **local dev**, set `VITE_API_ORIGIN=http://localhost:3001` so the SPA calls the API cross-origin on a separate port. Start the API with **`pnpm dev:api`** from the repo root.

## Source layout (feature-first)

```
src/
├── app/                      # Shell & routing: router, layout, shell pages, route modules
│   ├── layout/
│   │   └── AppLayout.tsx       # Header, sidebar (wiki nav), `<Outlet>`
│   ├── pages/
│   │   ├── HomePage.tsx        # `/` landing
│   │   └── NotFoundRoutePage.tsx
│   ├── routes/                 # TanStack route definitions (URLs + bindings only)
│   │   ├── root.tsx
│   │   ├── home.tsx
│   │   ├── characters.tsx      # character list + sheet routes
│   │   ├── entity.tsx          # mounts wiki `EntityPage`
│   │   ├── not-found.tsx
│   │   └── not-found-search.ts
│   └── router.tsx
├── features/
│   ├── wiki/                   # Compiled wiki / vault explorer (entity detail, nav, mdast)
│   │   ├── components/         # EntityContent, CompiledMdast, WikiFileTree, …
│   │   ├── hooks/              # `useEntityBySlug`, `useNavigationTree`
│   │   ├── pages/
│   │   │   └── EntityPage.tsx  # `/entity/$` page
│   │   └── utils/
│   │       └── source-path.ts  # slug ↔ URL splat (`buildEntityHref`, `decodeEntitySlug`)
│   └── character/              # DB-backed roster (consumes `apps/api`)
│       ├── api.ts              # `fetch` helpers + DTO types
│       ├── skill-select-options.ts  # `getSkillSelectOptions()` → `contentRepository.getByType("spell")`
│       └── pages/
│           ├── CharacterListPage.tsx
│           ├── CharacterSheetPage.tsx
│           └── CharacterSheetRoutePage.tsx
├── common/                     # App-wide helpers not living in workspace packages
│   ├── components/
│   │   └── NotFound.tsx
│   ├── routing/
│   │   └── constants.ts        # `ENTITY_ROUTE_PREFIX`, `NOT_FOUND_ROUTE`
│   └── utils/
│       └── format-type-label.ts
├── index.css                   # App shell (#root layout only)
└── main.tsx                    # Mounts `<RouterProvider>`; imports `app/router`
```

**Boundaries:** `app` owns the router and top-level routes; feature folders own domain UI and data hooks for that domain. `common` holds small shared pieces (constants, pure formatters, cross-feature UI like `NotFound`) that are not worth extracting to `packages/` yet.

Each module still follows a **single responsibility**: routes only declare URLs and bind a component; feature components focus on rendering; hooks read from the content repository; utils stay pure.

## Data flow

```mermaid
flowchart LR
  CC["@galipette/compiled-content"]
  H1["useNavigationTree"]
  H2["useEntityBySlug"]
  WFT["WikiFileTree"]
  EC["EntityContent"]
  CC -->|getNavigationTree| H1
  CC -->|getFileTree| WFT
  CC -->|getBySlug| H2 --> EC
```

The web app never reaches into raw artifacts; it only consumes the public API of `@galipette/compiled-content`. Sidebar links use each entry’s **`slug`** to build `/entity/...` URLs. Resolved wikilinks in the body use the same **`buildEntityHref(targetEntitySlug)`**; unresolved wikilinks render as links to **`/not-found`** with search params (see `features/wiki/components/CompiledMdast.tsx`).

## Commands

```sh
# from the workspace root
pnpm --filter web dev      # start the Vite dev server (http://localhost:5173)
pnpm --filter web build    # type-check + production build
pnpm --filter web lint     # ESLint
pnpm --filter web preview  # serve the production build
```

The compiled-content package must be built (or the workspace symlink must resolve to fresh sources) before the app can read entity data:

```sh
pnpm build:compiled-content
```
