/**
 * Central lookup from front matter `type` string to the matching Zod schema.
 */

import { spellSchema } from "./SpellSchema.js";
import { damageTypeSchema } from "./DamageTypeSchema.js";
import { afflictionSchema } from "./AfflictionSchema.js";

/** Maps supported entity type keys to their validation schemas. */
export const schemaByType = {
  spell: spellSchema,
  "damage-type": damageTypeSchema,
  affliction: afflictionSchema,
} as const;

/** Union of keys present in {@link schemaByType}. */
export type RegisteredEntityType = keyof typeof schemaByType;
