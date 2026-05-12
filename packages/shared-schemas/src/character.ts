import { extendZodWithOpenApi } from "@hono/zod-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

/** Matches `CharacterSheet.attributes` JSON: arbitrary string keys → numbers. */
export const characterAttributesSchema = z
  .record(z.string(), z.number())
  .openapi({ description: "Numeric stats keyed by attribute name." });

/** Skill / content references only (no DB Skill model yet). */
export const skillIdsSchema = z
  .array(z.string())
  .openapi({ description: "Opaque skill or compiled-content identifiers." });

export const characterSheetWriteSchema = z
  .object({
    attributes: characterAttributesSchema.default({}),
    skillIds: skillIdsSchema.default([]),
  })
  .openapi("CharacterSheetWrite");

export const characterCreateSchema = z
  .object({
    name: z.string().min(1).openapi({ example: "Ariane" }),
    player: z.string().min(1).openapi({ example: "PlayerOne" }),
    sheet: characterSheetWriteSchema.optional(),
  })
  .openapi("CharacterCreate");

export const characterUpdateSchema = z
  .object({
    name: z.string().min(1).optional(),
    player: z.string().min(1).optional(),
  })
  .strict()
  .openapi("CharacterUpdate");

export const characterSheetUpdateSchema = z
  .object({
    attributes: characterAttributesSchema.optional(),
    skillIds: skillIdsSchema.optional(),
  })
  .strict()
  .openapi("CharacterSheetUpdate");

/** PATCH body: optional character fields plus optional nested sheet update. */
export const characterPatchSchema = z
  .object({
    name: z.string().min(1).optional(),
    player: z.string().min(1).optional(),
    sheet: characterSheetUpdateSchema.optional(),
  })
  .strict()
  .openapi("CharacterPatch");

export const characterSheetResponseSchema = z
  .object({
    id: z.string(),
    characterId: z.string(),
    attributes: characterAttributesSchema,
    skillIds: z.array(z.string()),
    createdAt: z.string().openapi({ format: "date-time" }),
    updatedAt: z.string().openapi({ format: "date-time" }),
  })
  .openapi("CharacterSheet");

export const characterResponseSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    player: z.string(),
    createdAt: z.string().openapi({ format: "date-time" }),
    updatedAt: z.string().openapi({ format: "date-time" }),
    sheet: characterSheetResponseSchema.nullable(),
  })
  .openapi("Character");

export const apiErrorSchema = z
  .object({ error: z.string() })
  .openapi("ApiError");

export const idPathParamsSchema = z.object({
  id: z
    .string()
    .min(1)
    .openapi({ param: { name: "id", in: "path" }, example: "clxxxxxxxx" }),
});

export type CharacterAttributes = z.infer<typeof characterAttributesSchema>;
export type SkillIds = z.infer<typeof skillIdsSchema>;
export type CharacterSheetWrite = z.infer<typeof characterSheetWriteSchema>;
export type CharacterCreate = z.infer<typeof characterCreateSchema>;
export type CharacterUpdate = z.infer<typeof characterUpdateSchema>;
export type CharacterSheetUpdate = z.infer<typeof characterSheetUpdateSchema>;
export type CharacterPatch = z.infer<typeof characterPatchSchema>;
export type CharacterResponse = z.infer<typeof characterResponseSchema>;
