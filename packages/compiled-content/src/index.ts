/**
 * Typed access to compiled vault artifacts (`entities.json`, `graph.json`) and a readonly repository API.
 */

export type { CompiledEntity, EntityGraph, GraphNode } from "@galipette/content-schema";

export { entities, graph } from "./artifacts.js";
export {
  contentRepository,
  resolveReferenceToken,
  EntityNotFoundError,
  type ContentRepository,
} from "./content-repository.js";
export type {
  NavigationEntry,
  NavigationCategory,
} from "./utils/build-navigation-tree.js";
