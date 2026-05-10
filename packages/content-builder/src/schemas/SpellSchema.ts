import { z } from "zod";
import { createEntitySchema } from "./EntitySchema.js";

const spellSpecificSchema = {
  damage: z.object({
    type: z.string().min(1),
    amount: z.number(),
  }),
  afflictions: z.array(z.string().min(1)).optional(),
} satisfies z.ZodRawShape;

export const spellSchema = createEntitySchema("spell", spellSpecificSchema);
