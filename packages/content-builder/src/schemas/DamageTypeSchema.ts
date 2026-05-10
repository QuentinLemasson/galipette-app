import { z } from "zod";
import { createEntitySchema } from "./EntitySchema.js";

const damageTypeSpecificSchema = {
  color: z
    .string()
    .regex(/^#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/, {
      message: "Color must be a valid hex code (e.g., #RRGGBB or #RRGGBBAA)",
    })
    .optional(),
} satisfies z.ZodRawShape;

export const damageTypeSchema = createEntitySchema(
  "damage-type",
  damageTypeSpecificSchema,
);
