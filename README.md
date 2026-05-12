# Galipette App

This repository is a pnpm workspace that hosts a web client and supporting packages. Shared tooling compiles authored Markdown content into JSON consumed by the application, keeping runtime bundles free of parsers and keeping gameplay data auditable in source control.

The content stack is split by concern: **schemas** define shared shapes, **parser** turns Markdown into mdast (wikilinks, no positions in output), **resolver** merges references and attaches `compiledContent`, **builder** scans the vault and orchestrates validation plus writes, and **compiled-content** is the read-only surface the web app imports.

## Quick links

| Package | README |
|---------|--------|
| `@galipette/content-schema` | [packages/content-schema/README.md](packages/content-schema/README.md) |
| `@galipette/content-parser` | [packages/content-parser/README.md](packages/content-parser/README.md) |
| `@galipette/content-resolver` | [packages/content-resolver/README.md](packages/content-resolver/README.md) |
| `@galipette/content-builder` | [packages/content-builder/README.md](packages/content-builder/README.md) |
| `@galipette/compiled-content` | [packages/compiled-content/README.md](packages/compiled-content/README.md) |
| Web app | [apps/web/README.md](apps/web/README.md) |

## Layout

Applications live under `apps/`; reusable libraries under `packages/`. The content pipeline builds TypeScript packages in dependency order, then the builder emits JSON into `packages/compiled-content` so consumers share one artifact location.

```mermaid
flowchart TB
  subgraph packages["packages/"]
    SCH["@galipette/content-schema"]
    PAR["@galipette/content-parser"]
    RES["@galipette/content-resolver"]
    BLD["@galipette/content-builder"]
    OUT["@galipette/compiled-content"]
  end
  subgraph apps["apps/"]
    WEB["web"]
  end
  SCH --> PAR
  SCH --> RES
  PAR --> RES
  SCH --> BLD
  PAR --> BLD
  RES --> BLD
  BLD --> OUT
  WEB --> OUT
```

## Content workflow

Authors maintain notes in an Obsidian vault layout. The **content builder** scans a chosen subfolder, validates each file against **content-schema**, then **content-resolver** (using **content-parser** / Remark) produces `compiledContent` and merged `references`, plus a flat **`brokenWikiLinks`** report for debugging. The builder then writes **`entities.json`**, **`graph.json`**, **`slug-index.json`**, and **`broken-links.json`** (same directory). The web application loads artifacts through **compiled-content** — it does not re-parse Markdown for resolved entities — and exposes a TanStack Router explorer where entity detail URLs use each note’s public **`slug`** (path derived from the vault file, without `.md`). Unresolved in-body wikilinks in the UI link to **`/not-found`** with search params carrying operand context.

```mermaid
sequenceDiagram
  participant Author
  participant Vault as Markdown vault
  participant Builder as Content builder
  participant Resolver as Content resolver
  participant Parser as Content parser
  participant Artifacts as Compiled JSON
  participant App as Web app
  Author->>Vault: Edit notes
  Builder->>Vault: Scan and parse front matter
  Builder->>Builder: Validate (content-schema)
  Builder->>Resolver: Resolved entities + corpus
  Resolver->>Parser: Parse body mdast + wikilinks
  Resolver->>Artifacts: merged references + compiledContent + brokenWikiLinks list
  Builder->>Artifacts: entities, graph, slug-index, broken-links.json
  App->>Artifacts: Load at build or runtime
```

## Commands

From the repository root, after `pnpm install`:

| Script | Purpose |
|--------|---------|
| `pnpm build:content` | Builds the full content chain in order: **schema** → **parser** → **resolver** → **builder** (runs the builder CLI against your configured vault) → **compiled-content** TypeScript package. |
| `pnpm build:content-schema` | TypeScript build for `@galipette/content-schema` only. |
| `pnpm build:content-parser` | TypeScript build for `@galipette/content-parser` only. |
| `pnpm build:content-resolver` | TypeScript build for `@galipette/content-resolver` only. |
| `pnpm build:content-builder` | Runs the content builder package entry (vault → JSON). |
| `pnpm build:compiled-content` | TypeScript build for `@galipette/compiled-content` only. |
| `pnpm test:content` | Runs tests for schema, content-builder, and compiled-content. |
| `pnpm dev` | Starts the web app. |

Package-level scripts and CLI flags (vault path, subfolder, env) are documented in [packages/content-builder/README.md](packages/content-builder/README.md).

## Contributing

Keep behavioral changes covered by the **content-builder** test suite when touching validation, graph output, resolver behavior, or **`broken-links.json`** output. Prefer extending **content-schema** registries over special-casing the pipeline. Changes to Remark wikilink parsing belong in **content-parser**; orchestration, merged `references`, and the **`brokenWikiLinks`** aggregate belong in **content-resolver**.
