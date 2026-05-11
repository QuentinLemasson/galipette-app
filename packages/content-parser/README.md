# Content parser

Build-only Markdown tooling using **unified** / **remark-parse** plus a Galipette **`remarkGalipetteWikiLinks`** transform.

## Responsibilities

- Split Obsidian-style syntax into mdast nodes: `[[target]]`, `[[target|alias]]`, `[[...]](url)` as typed **`wikiLink`** phrasing nodes (`operand`, `displayLabel`, optional `resource`).
- **`extractObsidianLinkLeftOperand`** / **`extractObsidianLinkDisplay`** — shared helpers for YAML normalization vs graph operands (also used by `content-builder`).
- **`parseEntityMarkdownToAst`** — runs parse + plugin pipeline (`runSync`) and strips **`position`** from all nodes (`unist-util-remove-position`) so bundled mdast JSON stays small.
- **`resolveWikiLinksInAst`** — fills `targetEntityId` / `targetEntitySlug` on each `wikiLink` using `@galipette/content-schema` **`resolveReferenceToken`**.

Does **not** scan vaults or write JSON; `@galipette/content-resolver` orchestrates this package against the validated entity corpus.
