# Content resolver

Single compilation step after schema validation and duplicate id/slug checks: merges front-matter wikilink operands with operands discovered from the Markdown AST, attaches **`compiledContent`** (mdast root JSON), and builds **`references`** with **`refSources`** (`body` / `frontMatter`).

Depends on **`@galipette/content-parser`** and **`@galipette/content-schema`**. Invoked by **`@galipette/content-builder`** immediately before graph generation and artifact writes.
