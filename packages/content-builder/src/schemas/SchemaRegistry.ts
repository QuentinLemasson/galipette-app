import { spellSchema } from "./SpellSchema.js";
import { damageTypeSchema } from "./DamageTypeSchema.js";
import { afflictionSchema } from "./AfflictionSchema.js";

export const schemaByType = {
  spell: spellSchema,
  "damage-type": damageTypeSchema,
  affliction: afflictionSchema,
} as const;

export type RegisteredEntityType = keyof typeof schemaByType;
