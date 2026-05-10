# Objective

Create the first POC content compilation pipeline.

The system has to :
- prompt / detect and obsidian vault path
- scan the specified sub-folder
- extract the markdown files with fast glob
- parse the yaml frontmatter with gray-matter
- validate the files with zod
- generate exploitable compiled json artifacts 

# Expected result 

Command
```bash
pnpm build:content
```

Generates /packages/compiled-content/entities.json

## Exammple output :

```json
[
  {
    "id": "spell.lightning-shot",
    "type": "spell",
    "name": "Tir de Foudre",

    "damage": {
      "type": "damage.lightning",
      "amount": 6
    },

    "afflictions": [
      "affliction.stunned"
    ]
  }
]
```

# Contraints

## Validation

Build has to fail fast.
- invalid frontmatter
- duplicated ids
- unknown types

No partial content, and generation of readable error logs.

# Expected structure

/packages/content-builder
    /src

        index.ts

        /core
            scanVault.ts
            parseFile.ts
            validateEntity.ts
            writeCompiledContent.ts

        /schemas
            // one shema === on entity type
            SpellSchema.ts
            DamageTypeSchema.ts
            AfflictionSchema.ts

        /types
            Entity.ts

# input example :

```markdown
---
id: spell.lightning-shot
type: spell

name: Tir de Foudre

damage:
  type: damage.lightning
  amount: 6

afflictions:
  - affliction.stunned
---

# Tir de Foudre

Un projectile électrique.
```

# types

```ts
type CompiledEntity = {
  id: string;
  type: string;
  name: string;

  content: string;

  sourcePath: string;
}
```

# schemas

One schema per entity type

```ts
const spellSchema = {
  id: string
  type: "spell"
  name: string

  damage: {
    type: string
    amount: number
  }

  afflictions?: string[]
}

const damageTypeSchema = {
  id: string
  type: "damage-type"

  name: string
  color?: string
}

const afflictionSchema = {
  id: string
  type: "affliction"

  name: string
}

```

# Test Suite

Install a test suite with the following :
- mock files
- happy path
- missind id
- invalid type
- invalid damage amount
- duplicate ids

# Definiton of done

Functional

✅ The builder compiles the vault

✅ JSON is generated correctly

✅ Zod validation works

✅ Explicit errors

✅ Duplicate IDs are detected

Technical

✅ Code is separated by responsibility

✅ No business logic in index.ts

✅ Correct TypeScript types

✅ Clean async/await usage

✅ No unnecessary 'any' types

Product

✅ A frontend developer can consume entities.json

✅ Data is reliable

✅ The system is extensible for future phases


Ensure lisibility, Maintainability and explicability.
Follow SOLID + DRY patterns

Objective ==> a robust but simple content compiler