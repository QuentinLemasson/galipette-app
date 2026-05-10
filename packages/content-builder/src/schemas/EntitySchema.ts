/**
 * Shared Zod shell for every entity: identity, shell fields, body text, and references slot.
 */

import { z } from "zod";

/** Fields common to all compiled entities before type-specific `data` is applied. */
export const entityShellSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  name: z.string().min(1),
  content: z.string(),
  sourcePath: z.string(),
  references: z.array(z.string().min(1)).default([]),
});

/**
 * Composes the shell with a literal `type` and a nested `data` object from optional fields.
 *
 * @param type - Discriminator string matching front matter `type`.
 * @param specificShape - Optional Zod shape for keys stored under `data`.
 * @returns Zod object schema for one entity kind.
 */
export function createEntitySchema<
  TType extends string,
  TSpecific extends z.ZodRawShape,
>(type: TType, specificShape?: TSpecific) {
  return entityShellSchema.extend({
    type: z.literal(type),
    data: z.object(specificShape ?? {}).default({}),
  });
}
