/**
 * Validation schema for entities whose `type` is spell (damage and optional afflictions).
 */

import { z } from "zod";

import { createEntitySchema } from "./EntitySchema.js";

const spellSpecificSchema = {
  damage: z.object({
    type: z.string().min(1),
    amount: z.number(),
  }),
  afflictions: z.array(z.string().min(1)).optional(),
} satisfies z.ZodRawShape;

/** Zod schema instance registered under the `spell` type key. */
export const spellSchema = createEntitySchema("spell", spellSpecificSchema);
