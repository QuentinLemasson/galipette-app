# Compiled content

## Philosophy

This package is the **stable read surface** for vault output: JSON artifacts bundled at build time and accessed through typed exports. Consumers should not re-parse Markdown or duplicate indexing logic—everything needed for navigation, lookup, and reference resolution is prepared once and exposed as a **readonly, synchronous API** (`contentRepository` plus raw `entities` / `graph` when you need the full payloads).

Goals:

- **Predictable imports** — same shapes as `@galipette/content-schema`.
- **Fast lookups** — maps built at module load (by id, type, graph edges, reverse reference index).
- **No hidden I/O** — data is static; suitable for bundlers and SSR.

Internal index construction lives under `src/utils/`; the public surface remains `src/index.ts`.

---

## Overview

| Export | Purpose |
|--------|---------|
| `entities` | Full `CompiledEntity[]` from `entities.json` (includes optional **`compiledContent`** mdast JSON and structured **`references`**). |
| `graph` | `EntityGraph` (`nodes` + directed `edges`) from `graph.json`. |
| `slugIndex` | `{ slugToId, idToSlug }` maps from `slug-index.json` (built by content-builder). |
| `contentRepository` | Query helpers over those artifacts. |
| `resolveReferenceToken` | Map wikilink operands to entities (see below). |
| `EntityNotFoundError` | Thrown by `requireById` / `requireGraphNode`. |
| `NavigationEntry` / `NavigationCategory` | Lightweight types for the navigation tree. |

Each `references` entry is a **`EntityReference`**: `operand` (same token as in `graph.json` edges), `refSources`, **`targetLabel`**, and when the operand resolves to an entity, **`targetEntityId`** and **`targetEntitySlug`**. Use this shape as the standard cross-link API in the app.

---

## Snippets

### `entities` / `graph` / `slugIndex`

```ts
import { entities, graph, slugIndex } from "@galipette/compiled-content";

const first = entities[0];
const edgeCount = graph.edges.length;
const id = slugIndex.slugToId["wiki/skills/spells/lightning-arc"];
const slug = slugIndex.idToSlug["spell.lightning-arc"];
```

### `contentRepository.getAll()`

```ts
import { contentRepository } from "@galipette/compiled-content";

const all = contentRepository.getAll();
```

### `contentRepository.entities` (getter)

```ts
import { contentRepository } from "@galipette/compiled-content";

const all = contentRepository.entities;
```

### `contentRepository.graph`

```ts
import { contentRepository } from "@galipette/compiled-content";

const { nodes, edges } = contentRepository.graph;
```

### `contentRepository.getById`

```ts
import { contentRepository } from "@galipette/compiled-content";

const spell = contentRepository.getById("spell.lightning-arc");
```

### `contentRepository.requireById`

```ts
import { contentRepository, EntityNotFoundError } from "@galipette/compiled-content";

try {
  const spell = contentRepository.requireById("spell.lightning-arc");
} catch (e) {
  if (e instanceof EntityNotFoundError) {
    console.error(e.id);
  }
}
```

### `contentRepository.exists`

```ts
import { contentRepository } from "@galipette/compiled-content";

if (contentRepository.exists("spell.lightning-arc")) {
  // ...
}
```

### `contentRepository.getByType`

```ts
import { contentRepository } from "@galipette/compiled-content";

const spells = contentRepository.getByType("spell");
```

### `contentRepository.getTypes`

```ts
import { contentRepository } from "@galipette/compiled-content";

const types = contentRepository.getTypes(); // sorted distinct `type` strings
```

### `contentRepository.getIds`

```ts
import { contentRepository } from "@galipette/compiled-content";

const ids = contentRepository.getIds();
```

### `contentRepository.count`

```ts
import { contentRepository } from "@galipette/compiled-content";

const n = contentRepository.count();
```

### `contentRepository.getReferences`

Reference operands for this entity id, each with `refSources` (`body` / `frontMatter`) indicating where the wikilink was collected during build.

```ts
import { contentRepository } from "@galipette/compiled-content";

const refs = contentRepository.getReferences("spell.lightning-arc");
for (const ref of refs) {
  console.log(ref.operand, ref.refSources);
}
```

### `contentRepository.getReferencersByToken`

Entity ids that cite this operand exactly (reverse index on `references`).

```ts
import { contentRepository } from "@galipette/compiled-content";

const ids = contentRepository.getReferencersByToken("lightning");
```

### `contentRepository.getReferencedBy`

Entities whose operands resolve to the given entity id (uses `resolveReferenceToken` per operand).

```ts
import { contentRepository } from "@galipette/compiled-content";

const incoming = contentRepository.getReferencedBy("damage.lightning");
```

### `contentRepository.getGraphNode` / `requireGraphNode`

```ts
import { contentRepository, EntityNotFoundError } from "@galipette/compiled-content";

const node = contentRepository.getGraphNode("spell.lightning-arc");
const stub = contentRepository.requireGraphNode("spell.lightning-arc");
```

### `contentRepository.getOutgoingEdgeTargets`

Targets from `graph.edges` where the source id matches (tokens, not necessarily full entity ids).

```ts
import { contentRepository } from "@galipette/compiled-content";

const targets = contentRepository.getOutgoingEdgeTargets("spell.lightning-arc");
```

### `contentRepository.getIncomingEdgeSources`

Source entity ids for edges whose target operand equals `token`.

```ts
import { contentRepository } from "@galipette/compiled-content";

const sources = contentRepository.getIncomingEdgeSources("lightning");
```

### `contentRepository.find` / `filter`

```ts
import { contentRepository } from "@galipette/compiled-content";

const one = contentRepository.find((e) => e.name.includes("Arc"));
const many = contentRepository.filter((e) => e.type === "affliction");
```

### `contentRepository.getBySourcePath`

```ts
import { contentRepository } from "@galipette/compiled-content";

const entity = contentRepository.getBySourcePath("wiki/skills/spells/lightning-arc.md");
```

### `contentRepository.getNavigationTree`

Lightweight projection of the corpus suitable for menus / link rendering: entities are grouped by `type` and each entry exposes only `id`, `type`, `name`, and `sourcePath` (no Markdown body, no type-specific `data`). Categories are sorted alphabetically by `type`; entries within a category are sorted by `name` (locale-aware).

```ts
import { contentRepository, type NavigationCategory } from "@galipette/compiled-content";

const tree: readonly NavigationCategory[] = contentRepository.getNavigationTree();

for (const category of tree) {
  console.log(category.type, category.entries.length);
  for (const entry of category.entries) {
    console.log("  ", entry.name, "->", entry.sourcePath);
  }
}
```

### `resolveReferenceToken`

```ts
import { resolveReferenceToken } from "@galipette/compiled-content";

const damageType = resolveReferenceToken("lightning");
```

---

## Build

From the workspace root, build this package with the workspace script, or `pnpm --filter @galipette/compiled-content build`. Artifacts under `src/data/` (`entities.json`, `graph.json`, **`slug-index.json`**) are produced by `@galipette/content-builder` (after `@galipette/content-resolver` enriches entities with mdast and merged references).
