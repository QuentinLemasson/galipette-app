# Content builder

This package turns a folder of Obsidian-flavored Markdown notes into validated JSON that the rest of the application can load without parsing Markdown at runtime. It is meant to stay small, explicit, and easy to extend when new entity kinds appear.

## Role in the application

Game or narrative content lives in Markdown files with YAML front matter. The builder scans that tree, validates each note against a schema, resolves wiki-style links for reference tracking, and writes compiled artifacts next to the workspace packages so front-end code can import stable data only.

## Pipeline

The flow is linear: discover files, parse each note, collect **front-matter-only** wikilink operands, normalize wiki links inside YAML so structured data stores **display** text (`[[target|alias]]` → `alias`), validate with schema rules, dedupe ids/slugs across the run, then **`@galipette/content-resolver`** parses Markdown bodies with Remark into mdast (`compiledContent`), merges operands from body + front matter with `refSources`, resolves wiki targets to entity ids/slugs on AST nodes, and returns a deduped **`brokenWikiLinks`** list alongside resolved entities. The builder then builds the reference graph, writes **`entities.json`**, **`graph.json`**, **`slug-index.json`**, and **`broken-links.json`**.

```mermaid
flowchart LR
  subgraph inputs
    V[Vault path]
    S[Subfolder]
  end
  subgraph scan
    G[Glob markdown]
    R[Read files]
  end
  subgraph parse
    FM[Front matter]
    MD[Body content]
  end
  subgraph links
    FMREF[FM operands]
    NORM[Normalize FM display]
  end
  subgraph validate
    Z[Schema per type]
    DUP[Unique ids / slugs]
  end
  subgraph resolve
    RES[@galipette/content-resolver]
  end
  subgraph outputs
    E[Entities JSON]
    GR[Graph JSON]
    SI[Slug index JSON]
    BL[Broken links JSON]
    LOG[Error log on failure]
  end
  V --> G
  S --> G
  G --> R
  R --> FM
  R --> MD
  FM --> FMREF
  FM --> NORM
  NORM --> Z
  FMREF --> RES
  MD --> RES
  Z --> DUP
  DUP --> RES
  RES --> E
  RES --> GR
  RES --> SI
  DUP -.->|errors| LOG
```

The diagram simplifies I/O: **`resolveCompiledEntities`** returns both **`entities`** and **`brokenWikiLinks`**; **`writeCompiledContent`** writes entities, graph, slug index, and **`broken-links.json`** in one directory.

## Artifacts

Successful runs produce a dense list of entities under the shared compiled-content package area (each with optional **`compiledContent`** mdast JSON from Remark), plus a separate graph file whose nodes carry only identifiers and labels needed for visualization or navigation, and whose edges record directional references between entity ids using **operand** strings. A **`slug-index.json`** file is written beside them with two flat maps: `slugToId` and `idToSlug`, derived from each entity’s generated slug (see below). A **`broken-links.json`** file lists unresolved wiki operands (**`BrokenWikiLinkRecord`** from content-schema): `entityId`, `sourcePath`, `entitySlug`, `operand`, `linkText`, and **`origins`** (`markdown` and/or `frontMatter`) for debugging broken vault links. The programmatic **`buildContent`** API returns the same list as **`brokenWikiLinks`** on the result object, and **`diagnostics.brokenLinksFilePath`** points at the written JSON. Failures write a Markdown report under this package so every validation issue from the full pass is visible in one place.

## Slugs

Each entity gets a **`slug`** field computed from the vault-relative file path (Obsidian source path): the Markdown extension is stripped, path segments stay separated by `/`, and each segment is normalized with [`slugify`](https://github.com/simov/slugify) (`lower`, `strict`, `trim`). The slugified **`WIKI_NAMESPACE`** (default **`wiki`**) is prefixed once—unless the path already begins with that same segment (after slugifying the first folder name), so `wiki/notes/foo.md` becomes `wiki/notes/foo`, not `wiki/wiki/notes/foo`. Front matter does not supply `slug`; it is deterministic from the file location.

Duplicate ids and **duplicate slugs** (two files resolving to the same slug) both fail the build with explicit errors.

## Consuming compiled output

Runtime code should import **`@galipette/compiled-content`**, not raw JSON paths. That package bundles the emitted `entities.json` and `graph.json`, re-exports `@galipette/content-schema` types, and exposes a readonly **`contentRepository`** (id/**slug**/type lookups, reference resolution, graph navigation helpers). Prefer the repository for lookups and indexes; fall back to `entities` / `graph` exports when you need the full arrays. For unresolved-link audits, read **`broken-links.json`** from the same output directory (or use **`buildContent`’s** `brokenWikiLinks` return value).

See the [compiled-content README](../compiled-content/README.md) for philosophy, API snippets, and how wikilink operands align with graph edges.

## Wikilink rules

- **Graph / reference operands** use the **left** segment of `[[left|right]]` (the link key), or the full inner text when there is no pipe — same as before for edges and `references[].operand`.
- **Front matter substitution** rewrites each `[[...]]` to the **display** segment: with a pipe, the **right** side (alias); without a pipe, the full inner text. That keeps validated `data` fields human-facing while operands stay stable for the graph.
- **Body** Markdown is stored verbatim in `content`; **`compiledContent`** holds the parsed mdast with `wikiLink` nodes and resolved `targetEntityId` / `targetEntitySlug` when the operand maps to an entity.
- **`references`** is a merged list of `{ operand, refSources }` where `refSources` includes `frontMatter` and/or `body`.

## Programmatic API

`buildContent` resolves to **`BuildResult`**: `entities`, `graph`, `slugIndex`, **`brokenWikiLinks`** (same array written to **`broken-links.json`**), and **`diagnostics`** (includes **`brokenLinksFilePath`**, `outputFilePath`, `slugIndexFilePath`, …).

Path helpers are re-exported from the package entry for scripts:

```ts
import { brokenLinksPathFromEntitiesPath, graphPathFromEntitiesPath } from "@galipette/content-builder";
```

## Operating the tool

The workspace root exposes scripts that delegate to this package. You can pass a vault path and subfolder via flags or environment variables documented in the repository overview; when arguments are missing, the CLI prompts interactively. Output paths default to the shared compiled-content location so consumers always read from one predictable directory.

## Tests

Automated checks live under the package tests folder. Helpers create temporary vault layouts so integration scenarios stay isolated from real notes. Run the workspace test script that targets this package when changing validation or graph behavior.
