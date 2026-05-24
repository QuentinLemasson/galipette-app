/**
 * Typed access to compiled vault artifacts (`entities.json`, `graph.json`) and a readonly repository API.
 */

export type {
  CompiledEntity,
  CompiledMarkdownAst,
  EntityGraph,
  EntityReference,
  EntityReferenceSource,
  FileTree,
  FileTreeEntityNode,
  FileTreeFolderNode,
  FileTreeNode,
  GraphNode,
  SlugIndex,
} from "@galipette/content-schema";

export { entities, fileTree, graph, slugIndex } from "./artifacts.js";
export {
  contentRepository,
  resolveReferenceToken,
  EntityNotFoundError,
  type ContentRepository,
} from "./content-repository.js";
export type { NavigationEntry, NavigationCategory } from "./utils/build-navigation-tree.js";
