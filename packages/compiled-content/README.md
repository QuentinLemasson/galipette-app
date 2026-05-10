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
| `entities` | Full `CompiledEntity[]` from `entities.json`. |
| `graph` | `EntityGraph` (`nodes` + directed `edges`) from `graph.json`. |
| `contentRepository` | Query helpers over those artifacts. |
| `resolveReferenceToken` | Map wikilink operands to entities (see below). |
| `EntityNotFoundError` | Thrown by `requireById` / `requireGraphNode`. |

Wikilink operands in `references` and graph edge targets are the **same strings** the content builder emitted (often short tokens like `lightning`, not always full ids).

---

## Snippets

### `entities` / `graph`

```ts
import { entities, graph } from "@galipette/compiled-content";

const first = entities[0];
const edgeCount = graph.edges.length;
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

Operands collected from front matter and body wikilinks for this entity id.

```ts
import { contentRepository } from "@galipette/compiled-content";

const tokens = contentRepository.getReferences("spell.lightning-arc");
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

### `resolveReferenceToken`

```ts
import { resolveReferenceToken } from "@galipette/compiled-content";

const damageType = resolveReferenceToken("lightning");
```

---

## Build

From the workspace root, build this package with the workspace script, or `pnpm --filter @galipette/compiled-content build`. Artifacts under `src/data/` are produced by `@galipette/content-builder`.
