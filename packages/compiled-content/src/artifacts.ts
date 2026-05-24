/**
 * Raw compiled vault payloads (`entities.json`, `graph.json`, `slug-index.json`, `file-tree.json`).
 */

import type { CompiledEntity, EntityGraph, FileTree, SlugIndex } from "@galipette/content-schema";

import entitiesJson from "./data/entities.json" with { type: "json" };
import fileTreeJson from "./data/file-tree.json" with { type: "json" };
import graphJson from "./data/graph.json" with { type: "json" };
import slugIndexJson from "./data/slug-index.json" with { type: "json" };

/** Validated entity records from the latest content build. */
export const entities = entitiesJson as unknown as CompiledEntity[];

/** Lightweight navigation graph (nodes + directed reference edges). */
export const graph = graphJson as unknown as EntityGraph;

/** Precompiled folder tree mirroring the source vault layout. */
export const fileTree = fileTreeJson as unknown as FileTree;

/** Bidirectional slug ↔ id index emitted next to `entities.json`. */
export const slugIndex = slugIndexJson as unknown as SlugIndex;
