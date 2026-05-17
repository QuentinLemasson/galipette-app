/**
 * Raw compiled vault payloads (`entities.json`, `graph.json`, `slug-index.json`).
 */

import type { CompiledEntity, EntityGraph, SlugIndex } from "@galipette/content-schema";

import entitiesJson from "./data/entities.json" with { type: "json" };
import graphJson from "./data/graph.json" with { type: "json" };
import slugIndexJson from "./data/slug-index.json" with { type: "json" };

/** Validated entity records from the latest content build. */
export const entities = entitiesJson as unknown as CompiledEntity[];

/** Lightweight navigation graph (nodes + directed reference edges). */
export const graph = graphJson as unknown as EntityGraph;

/** Bidirectional slug ↔ id index emitted next to `entities.json`. */
export const slugIndex = slugIndexJson as unknown as SlugIndex;
