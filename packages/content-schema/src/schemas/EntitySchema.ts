/**
 * Shared Zod shell for every entity: identity, shell fields, body text, and references slot.
 */

import { z } from "zod";

/** Where a wikilink operand was collected (merged per operand on the entity). */
export const entityReferenceSourceSchema = z.enum(["body", "frontMatter"]);

/** Operand string plus resolved target metadata for UI and navigation. */
export const entityReferenceSchema = z.object({
  operand: z.string().min(1),
  refSources: z.array(entityReferenceSourceSchema).min(1),
  /** Resolved target display name, or the operand when nothing matches the corpus. */
  targetLabel: z.string().min(1),
  targetEntityId: z.string().min(1).optional(),
  targetEntitySlug: z.string().min(1).optional(),
});

/**
 * Serialized mdast root (`type: "root"` plus arbitrary nested JSON).
 * `.passthrough()` keeps compatibility with full remark trees at runtime.
 */
export const compiledMarkdownAstSchema = z.looseObject({
  type: z.literal("root"),
});

/** Fields common to all compiled entities before type-specific `data` is applied. */
export const entityShellSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  name: z.string().min(1),
  content: z.string(),
  slug: z.string().min(1),
  sourcePath: z.string(),
  references: z.array(entityReferenceSchema).default([]),
  /** Remark/mdast root JSON produced after wikilink resolution (see `@galipette/content-parser`). */
  compiledContent: compiledMarkdownAstSchema.optional(),
});

/**
 * Composes the shell with a literal `type` and a nested `data` object from optional fields.
 *
 * @param type - Discriminator string matching front matter `type`.
 * @param specificShape - Optional Zod shape for keys stored under `data`.
 * @returns Zod object schema for one entity kind.
 */
export function createEntitySchema<TType extends string, TSpecific extends z.ZodRawShape>(
  type: TType,
  specificShape?: TSpecific,
) {
  return entityShellSchema.extend({
    type: z.literal(type),
    data: z.object(specificShape ?? {}).default({}),
  });
}
