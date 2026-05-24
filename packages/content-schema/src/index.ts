export {
  entityShellSchema,
  entityReferenceSchema,
  entityReferenceSourceSchema,
  compiledMarkdownAstSchema,
  createEntitySchema,
} from "./schemas/EntitySchema.js";
export {
  folderIndexFrontmatterSchema,
  fileTreeEntityNodeSchema,
  fileTreeFolderNodeSchema,
  fileTreeNodeSchema,
  fileTreeSchema,
} from "./schemas/FileTreeSchema.js";
export { resolveReferenceToken } from "./resolve-reference-token.js";
export { afflictionSchema } from "./schemas/AfflictionSchema.js";
export { damageTypeSchema } from "./schemas/DamageTypeSchema.js";
export { spellSchema } from "./schemas/SpellSchema.js";
export { schemaByType, type RegisteredEntityType } from "./schemas/SchemaRegistry.js";
export type {
  SpellEntity,
  DamageTypeEntity,
  AfflictionEntity,
  CompiledEntity,
  EntityType,
  EntityReference,
  EntityReferenceSource,
  CompiledMarkdownAst,
  GraphNode,
  EntityGraph,
  SlugIndex,
  ParsedMarkdownFile,
  BrokenWikiLinkOrigin,
  BrokenWikiLinkRecord,
  FolderIndexFrontmatter,
  FileTreeEntityNode,
  FileTreeFolderNode,
  FileTreeNode,
  FileTree,
} from "./types/Entity.js";
