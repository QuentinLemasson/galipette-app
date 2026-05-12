# Content resolver

Single compilation step after schema validation and duplicate id/slug checks: merges front-matter wikilink operands with operands discovered from the Markdown AST, attaches **`compiledContent`** (mdast root JSON), and builds **`references`** with **`refSources`** (`body` / `frontMatter`).

Depends on **`@galipette/content-parser`** and **`@galipette/content-schema`**. Invoked by **`@galipette/content-builder`** immediately before graph generation and artifact writes.

## API

### `resolveCompiledEntities`

```ts
import { resolveCompiledEntities, type PendingCompiledEntity } from "@galipette/content-resolver";

const pending: PendingCompiledEntity[] = [/* … */];
const corpus = [/* validated entities */];

const { entities, brokenWikiLinks } = resolveCompiledEntities(pending, corpus);
```

Returns:

- **`entities`** — same length as `pending`; each item includes **`compiledContent`** and merged **`references`** with resolved `targetEntityId` / `targetEntitySlug` when the operand matches the corpus.
- **`brokenWikiLinks`** — flat **`BrokenWikiLinkRecord[]`** from `@galipette/content-schema`, sorted by `sourcePath` then `operand`. Each row describes an unresolved operand (`entityId`, `sourcePath`, `entitySlug`, `operand`, `linkText`, **`origins`**: `markdown` for in-body `[[…]]`, `frontMatter` for YAML-collected operands). The builder persists this array as **`broken-links.json`**.

### `collectBrokenWikiLinksForEntity`

Recomputes broken-link rows for a single already-resolved **`CompiledEntity`** (useful in tests or tooling).

```ts
import { collectBrokenWikiLinksForEntity } from "@galipette/content-resolver";

const rows = collectBrokenWikiLinksForEntity(entity);
```
