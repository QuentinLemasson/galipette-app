/**
 * Readonly access layer over compiled entities and graph (indexes + queries).
 */

import type {
  CompiledEntity,
  EntityGraph,
  EntityReference,
  FileTree,
  GraphNode,
} from "@galipette/content-schema";

import { entities, fileTree, graph } from "./artifacts.js";
import { buildNavigationTree, type NavigationCategory } from "./utils/build-navigation-tree.js";
import {
  buildByIdMap,
  buildBySlugMap,
  buildIdsByType,
  buildReferencerIdsByToken,
} from "./utils/entity-indexes.js";
import { buildEdgeAdjacencyMaps, buildGraphNodeByIdMap } from "./utils/graph-indexes.js";
import { resolveReferenceToken as resolveToken } from "./utils/resolve-reference-token.js";

/** Thrown by {@link contentRepository.requireById} when no entity matches. */
export class EntityNotFoundError extends Error {
  readonly id: string;

  constructor(id: string) {
    super(`Entity not found: "${id}"`);
    this.name = "EntityNotFoundError";
    this.id = id;
  }
}

const byId = buildByIdMap(entities);
const bySlug = buildBySlugMap(entities);
const idsByType = buildIdsByType(entities);
const referencerIdsByToken = buildReferencerIdsByToken(entities);

const { outgoing: outgoingEdgeTargets, incoming: incomingEdgeSources } = buildEdgeAdjacencyMaps(
  graph.edges,
);

const graphNodeById = buildGraphNodeByIdMap(graph.nodes);

const navigationTree = buildNavigationTree(entities);

/**
 * Resolves an Obsidian reference operand / graph edge target to an entity when unambiguous.
 * Tries exact id first, then ids ending with `.{token}` (may return undefined if ambiguous).
 */
export function resolveReferenceToken(token: string): CompiledEntity | undefined {
  return resolveToken(token, entities, byId);
}

/**
 * Readonly repository of compiled entities and graph.
 */
export const contentRepository = {
  /** All compiled entities. */
  get entities(): readonly CompiledEntity[] {
    return entities;
  },

  /** The compiled graph. */
  get graph(): EntityGraph {
    return graph;
  },

  /** Precompiled vault-like file tree (`file-tree.json`). */
  get fileTree(): FileTree {
    return fileTree;
  },

  /** All compiled entities. */
  getAll(): readonly CompiledEntity[] {
    return entities;
  },

  /** The compiled entity with the given id. */
  getById(id: string): CompiledEntity | undefined {
    return byId.get(id);
  },

  /** The compiled entity with the given id, or throws if not found. */
  requireById(id: string): CompiledEntity {
    const entity = byId.get(id);
    if (!entity) {
      throw new EntityNotFoundError(id);
    }
    return entity;
  },

  /** Whether the compiled entity with the given id exists. */
  exists(id: string): boolean {
    return byId.has(id);
  },

  /** All compiled entities of the given type. */
  getByType(type: string): CompiledEntity[] {
    const ids = idsByType.get(type);
    if (!ids) {
      return [];
    }
    return ids.map((id) => byId.get(id)!);
  },

  /** Distinct `type` values present in the compiled set. */
  getTypes(): readonly string[] {
    return Array.from(idsByType.keys()).sort((a, b) => a.localeCompare(b));
  },

  /** All compiled entity ids. */
  getIds(): readonly string[] {
    return entities.map((e) => e.id);
  },

  /** The number of compiled entities. */
  count(): number {
    return entities.length;
  },

  /**
   * Wikilink operands stored on the entity (same strings as in `graph.json` edge targets),
   * each tagged with where it was collected (`body` vs `frontMatter`).
   */
  getReferences(entityId: string): readonly EntityReference[] {
    return byId.get(entityId)?.references ?? [];
  },

  /**
   * Entity ids that list `token` in their `references` array (exact token match).
   */
  getReferencersByToken(token: string): readonly string[] {
    return referencerIdsByToken.get(token) ?? [];
  },

  /**
   * Entities that reference `entityId`, using {@link resolveReferenceToken} on each operand.
   */
  getReferencedBy(entityId: string): CompiledEntity[] {
    return entities.filter((e) =>
      e.references.some((ref) => resolveToken(ref.operand, entities, byId)?.id === entityId),
    );
  },

  /** The graph node with the given id. */
  getGraphNode(id: string): GraphNode | undefined {
    return graphNodeById.get(id);
  },

  /** The graph node with the given id, or throws if not found. */
  requireGraphNode(id: string): GraphNode {
    const node = graphNodeById.get(id);
    if (!node) {
      throw new EntityNotFoundError(id);
    }
    return node;
  },

  /** Outgoing graph edges `[from, to]` where `from === entityId` (targets are reference tokens). */
  getOutgoingEdgeTargets(entityId: string): readonly string[] {
    return outgoingEdgeTargets.get(entityId) ?? [];
  },

  /** Incoming graph edges: entity ids that reference `token` as an edge target. */
  getIncomingEdgeSources(token: string): readonly string[] {
    return incomingEdgeSources.get(token) ?? [];
  },

  /** The first compiled entity that matches the predicate. */
  find(predicate: (entity: CompiledEntity) => boolean): CompiledEntity | undefined {
    return entities.find(predicate);
  },

  /** All compiled entities that match the predicate. */
  filter(predicate: (entity: CompiledEntity) => boolean): CompiledEntity[] {
    return entities.filter(predicate);
  },

  /** The compiled entity with the given source path. */
  getBySourcePath(sourcePath: string): CompiledEntity | undefined {
    return entities.find((e) => e.sourcePath === sourcePath);
  },

  /** The compiled entity with the given public URL slug (no `.md` suffix). */
  getBySlug(slug: string): CompiledEntity | undefined {
    return bySlug.get(slug);
  },

  /** Precompiled vault-like file tree (`file-tree.json`). */
  getFileTree(): FileTree {
    return fileTree;
  },

  /**
   * Lightweight navigation tree (entities grouped by `type`) carrying only
   * `id`, `type`, `name`, `slug`, and `sourcePath` — suitable for menus and link rendering
   * without shipping body content or type-specific payloads.
   */
  getNavigationTree(): readonly NavigationCategory[] {
    return navigationTree;
  },
};

export type ContentRepository = typeof contentRepository;
