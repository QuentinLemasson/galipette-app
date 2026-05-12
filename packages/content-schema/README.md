# Content schema

**Objective.** Shared Zod schemas and TypeScript types for compiled vault entities: one place to validate Markdown-derived payloads and keep `CompiledEntity`, graph shapes, and helpers aligned across the builder and consumers.

**Registered entity kinds** (front matter `type` → schema):

| Key | Role |
|-----|------|
| `spell` | Skills/spells with damage and optional afflictions. |
| `damage-type` | Damage categories (e.g. elemental flavors). |
| `affliction` | Status effects / conditions. |

The union `CompiledEntity` covers all of the above; `schemaByType` maps each key to its Zod schema.

Every entity shares a shell that includes **`references`**: an array of **`EntityReference`** objects — `operand`, `refSources`, **`targetLabel`**, and when the operand resolves in the corpus, **`targetEntityId`** and **`targetEntitySlug`** (same resolution rules as graph tokens). Optional **`compiledContent`** is the serialized mdast root from the build pipeline. **`resolveReferenceToken`** maps operands to entities (exact id, then suffix match).

For debugging unresolved links across the vault, **`BrokenWikiLinkRecord`** (and **`BrokenWikiLinkOrigin`**: `markdown` \| `frontMatter`) describes one deduped operand per entity: `entityId`, `sourcePath`, `entitySlug`, `operand`, **`linkText`** (alias in markdown when present), and **`origins`** indicating where the operand was seen. The content builder writes these rows to **`broken-links.json`**; **`resolveCompiledEntities`** returns the same data as **`brokenWikiLinks`**.
