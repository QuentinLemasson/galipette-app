/**
 * Raw compiled vault payloads (`entities.json`, `graph.json`).
 */

import type { CompiledEntity, EntityGraph } from "@galipette/content-schema";
import entitiesJson from "./data/entities.json" with { type: "json" };
import graphJson from "./data/graph.json" with { type: "json" };

/** Validated entity records from the latest content build. */
export const entities = entitiesJson as unknown as CompiledEntity[];

/** Lightweight navigation graph (nodes + directed reference edges). */
export const graph = graphJson as unknown as EntityGraph;
