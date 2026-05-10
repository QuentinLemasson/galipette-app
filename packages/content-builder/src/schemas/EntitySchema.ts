import { z } from "zod";

export const entityShellSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  content: z.string(),
  sourcePath: z.string(),
});

export function createEntitySchema<
  TType extends string,
  TSpecific extends z.ZodRawShape,
>(type: TType, specificShape?: TSpecific) {
  const typeShape = z.object({ type: z.literal(type) });
  if (!specificShape) {
    return entityShellSchema.extend(typeShape.shape);
  }

  return entityShellSchema
    .extend(typeShape.shape)
    .extend(specificShape);
}
