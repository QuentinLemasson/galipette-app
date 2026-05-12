import { z } from "zod";

/** Matches `CharacterSheet.attributes` JSON: arbitrary string keys → numbers. */
export const characterAttributesSchema = z.record(z.string(), z.number());

/** Skill / content references only (no DB Skill model yet). */
export const skillIdsSchema = z.array(z.string());

export const characterSheetWriteSchema = z.object({
  attributes: characterAttributesSchema.default({}),
  skillIds: skillIdsSchema.default([]),
});

export const characterCreateSchema = z.object({
  name: z.string().min(1),
  player: z.string().min(1),
  sheet: characterSheetWriteSchema.optional(),
});

export const characterUpdateSchema = z
  .object({
    name: z.string().min(1).optional(),
    player: z.string().min(1).optional(),
  })
  .strict();

export const characterSheetUpdateSchema = z
  .object({
    attributes: characterAttributesSchema.optional(),
    skillIds: skillIdsSchema.optional(),
  })
  .strict();

export type CharacterAttributes = z.infer<typeof characterAttributesSchema>;
export type SkillIds = z.infer<typeof skillIdsSchema>;
export type CharacterSheetWrite = z.infer<typeof characterSheetWriteSchema>;
export type CharacterCreate = z.infer<typeof characterCreateSchema>;
export type CharacterUpdate = z.infer<typeof characterUpdateSchema>;
export type CharacterSheetUpdate = z.infer<typeof characterSheetUpdateSchema>;
