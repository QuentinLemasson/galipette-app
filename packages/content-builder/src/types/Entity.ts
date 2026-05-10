import type { z } from "zod";
import type { spellSchema } from "../schemas/SpellSchema.js";
import type { damageTypeSchema } from "../schemas/DamageTypeSchema.js";
import type { afflictionSchema } from "../schemas/AfflictionSchema.js";
import type { RegisteredEntityType } from "../schemas/SchemaRegistry.js";

export type SpellEntity = z.infer<typeof spellSchema>;
export type DamageTypeEntity = z.infer<typeof damageTypeSchema>;
export type AfflictionEntity = z.infer<typeof afflictionSchema>;

export type CompiledEntity = SpellEntity | DamageTypeEntity | AfflictionEntity;
export type EntityType = RegisteredEntityType;

export type ParsedMarkdownFile = {
  absolutePath: string;
  sourcePath: string;
  frontmatter: unknown;
  content: string;
};
