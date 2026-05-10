export {
  entityShellSchema,
  createEntitySchema,
} from "./schemas/EntitySchema.js";
export { afflictionSchema } from "./schemas/AfflictionSchema.js";
export { damageTypeSchema } from "./schemas/DamageTypeSchema.js";
export { spellSchema } from "./schemas/SpellSchema.js";
export {
  schemaByType,
  type RegisteredEntityType,
} from "./schemas/SchemaRegistry.js";
export type {
  SpellEntity,
  DamageTypeEntity,
  AfflictionEntity,
  CompiledEntity,
  EntityType,
  GraphNode,
  EntityGraph,
  ParsedMarkdownFile,
} from "./types/Entity.js";
