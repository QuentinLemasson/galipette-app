/**
 * Central lookup from front matter `type` string to the matching Zod schema.
 */

import { afflictionSchema } from "./AfflictionSchema.js";
import { creatureSchema } from "./CreatureSchema.js";
import { damageTypeSchema } from "./DamageTypeSchema.js";
import { ruleSchema } from "./RuleSchema.js";
import { skillSchema } from "./SkillSchema.js";
import { spellSchema } from "./SpellSchema.js";
import { techniqueSchema } from "./TechniqueSchema.js";

/** Maps supported entity type keys to their validation schemas. */
export const schemaByType = {
  spell: spellSchema,
  "damage-type": damageTypeSchema,
  affliction: afflictionSchema,
  skill: skillSchema,
  rule: ruleSchema,
  technique: techniqueSchema,
  creature: creatureSchema,
} as const;

/** Union of keys present in {@link schemaByType}. */
export type RegisteredEntityType = keyof typeof schemaByType;
