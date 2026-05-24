/**
 * Type-level mirrors of Zod schemas plus graph and parse helper shapes used across core modules.
 */

import type { z } from "zod";

import type { afflictionSchema } from "../schemas/AfflictionSchema.js";
import type { creatureSchema } from "../schemas/CreatureSchema.js";
import type { damageTypeSchema } from "../schemas/DamageTypeSchema.js";
import {
  compiledMarkdownAstSchema,
  entityReferenceSchema,
  entityReferenceSourceSchema,
} from "../schemas/EntitySchema.js";
import type {
  fileTreeEntityNodeSchema,
  fileTreeFolderNodeSchema,
  fileTreeNodeSchema,
  fileTreeSchema,
  folderIndexFrontmatterSchema,
} from "../schemas/FileTreeSchema.js";
import type { RegisteredEntityType } from "../schemas/SchemaRegistry.js";
import type { skillSchema } from "../schemas/SkillSchema.js";
import type { spellSchema } from "../schemas/SpellSchema.js";
import type { techniqueSchema } from "../schemas/TechniqueSchema.js";

export type SpellEntity = z.infer<typeof spellSchema>;
export type DamageTypeEntity = z.infer<typeof damageTypeSchema>;
export type AfflictionEntity = z.infer<typeof afflictionSchema>;
export type SkillEntity = z.infer<typeof skillSchema>;
export type TechniqueEntity = z.infer<typeof techniqueSchema>;
export type CreatureEntity = z.infer<typeof creatureSchema>;

export type CompiledEntity =
  | SpellEntity
  | DamageTypeEntity
  | AfflictionEntity
  | SkillEntity
  | TechniqueEntity
  | CreatureEntity;
export type EntityType = RegisteredEntityType;

export type EntityReferenceSource = z.infer<typeof entityReferenceSourceSchema>;
export type EntityReference = z.infer<typeof entityReferenceSchema>;
export type CompiledMarkdownAst = z.infer<typeof compiledMarkdownAstSchema>;

/** Minimal vertex for `graph.json` (no duplicated entity payload). */
export type GraphNode = {
  id: string;
  type: string;
  label: string;
  sourcePath: string;
};

/** Directional edges `[fromId, toId]` (reference from → to). */
export type EntityGraph = {
  nodes: GraphNode[];
  edges: [string, string][];
};

/** Bidirectional maps in `slug-index.json` (URL slug ↔ canonical entity id). */
export type SlugIndex = {
  slugToId: Record<string, string>;
  idToSlug: Record<string, string>;
};

export type ParsedMarkdownFile = {
  absolutePath: string;
  sourcePath: string;
  frontmatter: unknown;
  content: string;
};

/** Where an unresolved operand was observed (markdown body vs YAML). */
export type BrokenWikiLinkOrigin = "markdown" | "frontMatter";

/**
 * One unresolved wiki-style reference after corpus resolution, for debugging
 * (`broken-links.json` and resolver output).
 */
export type BrokenWikiLinkRecord = {
  entityId: string;
  sourcePath: string;
  entitySlug: string;
  /** Left-hand operand from `[[operand]]` / `[[operand|alias]]` or front matter. */
  operand: string;
  /** Display text in the note (alias in markdown, label or operand elsewhere). */
  linkText: string;
  origins: readonly BrokenWikiLinkOrigin[];
};

export type FolderIndexFrontmatter = z.infer<typeof folderIndexFrontmatterSchema>;
export type FileTreeEntityNode = z.infer<typeof fileTreeEntityNodeSchema>;
export type FileTreeFolderNode = z.infer<typeof fileTreeFolderNodeSchema>;
export type FileTreeNode = z.infer<typeof fileTreeNodeSchema>;
export type FileTree = z.infer<typeof fileTreeSchema>;
