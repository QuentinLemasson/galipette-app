# Content schema

**Objective.** Shared Zod schemas and TypeScript types for compiled vault entities: one place to validate Markdown-derived payloads and keep `CompiledEntity`, graph shapes, and helpers aligned across the builder and consumers.

**Registered entity kinds** (front matter `type` → schema):

| Key | Role |
|-----|------|
| `spell` | Skills/spells with damage and optional afflictions. |
| `damage-type` | Damage categories (e.g. elemental flavors). |
| `affliction` | Status effects / conditions. |

The union `CompiledEntity` covers all of the above; `schemaByType` maps each key to its Zod schema.
