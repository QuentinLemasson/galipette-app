/**
 * Validation schema for entities whose `type` is spell (damage and optional afflictions).
 */

import { z } from "zod";

import { createEntitySchema } from "./EntitySchema.js";

const spellSpecificSchema = {
  damage: z
    .object({
      type: z.string().min(1),
      amount: z.number(),
    })
    .optional(),
  afflictions: z.array(z.string().min(1)).optional(),
  canalization: z.string().min(1).optional(),
  range: z
    .enum(["personal", "touch", "short", "medium", "long", "infinite", "vision", "none"])
    .optional(),
} satisfies z.ZodRawShape;

/** Zod schema instance registered under the `spell` type key. */
export const spellSchema = createEntitySchema("spell", spellSpecificSchema);
