---
name: add-shadcn-components
description: >-
  Adds shadcn/ui registry components to the Galipette monorepo UI package and
  wires them in apps/web. Use when adding, installing, or integrating shadcn,
  @shadcn, avatar, sidebar, button, or other registry components.
---

# Add shadcn components (Galipette)

## Package boundaries

| Package       | Role                                                                                                      |
| ------------- | --------------------------------------------------------------------------------------------------------- |
| `packages/ui` | **Install target** — `components.json`, shadcn primitives, hooks, `globals.css`                           |
| `apps/web`    | **Consumer** — imports `@galipette/ui/components/*`, `@galipette/ui/hooks/*`, `@galipette/ui/globals.css` |

Never run `shadcn add` from `apps/web`. Never copy generated component files into `apps/web`.

## Add components (CLI)

From repo root:

```bash
cd packages/ui
```

If a dependency file already exists (e.g. `button.tsx`), **decline overwrites** so customizations are kept:

```powershell
"n","n","n","n","n","n","n","n","n","n" | pnpm dlx shadcn@latest add @shadcn/<name> -y
```

Examples:

```bash
pnpm dlx shadcn@latest add @shadcn/avatar @shadcn/card -y
```

Discover registry items via the **user-shadcn** MCP (`list_items_in_registries`, `get_add_command_for_items`) or:

```bash
pnpm dlx shadcn@latest view @shadcn
```

`components.json` aliases must stay pointed at `@galipette/ui/*` (already configured).

## Wire the consumer (`apps/web`)

1. **Dependency** — `apps/web/package.json` must include `"@galipette/ui": "workspace:*"`.
2. **Styles** — `apps/web/src/main.tsx` imports `@galipette/ui/globals.css` once (before app CSS). Tailwind scans app + UI via `@source` in `packages/ui/src/styles/globals.css`.
3. **Imports** — use subpath exports, not the package root:

```tsx
import { Button } from "@galipette/ui/components/button";
import { Avatar, AvatarFallback, AvatarImage } from "@galipette/ui/components/avatar";
import { SidebarProvider, Sidebar, SidebarContent } from "@galipette/ui/components/sidebar";
```

4. **Providers** — `SidebarProvider` already wraps `TooltipProvider`. Only add extra providers if a component’s install notes require it and it is not already nested.

## Verify

```bash
pnpm install
pnpm --filter @galipette/ui build
pnpm --filter web build
```

For local dev: `pnpm dev` from repo root.

## Checklist

- [ ] CLI run from `packages/ui`
- [ ] New files under `packages/ui/src/components/` (and `hooks/` if needed)
- [ ] Did not overwrite existing customized components unless intended (`-o` / `--overwrite`)
- [ ] `apps/web` imports from `@galipette/ui/...` only
- [ ] `globals.css` imported in `main.tsx`
- [ ] `pnpm --filter web build` passes
