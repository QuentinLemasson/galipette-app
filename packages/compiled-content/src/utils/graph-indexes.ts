/**
 * Readonly maps derived from `graph.json` nodes and edges.
 */

import type { GraphNode } from "@galipette/content-schema";

export function buildEdgeAdjacencyMaps(edges: readonly [string, string][]): {
  outgoing: Map<string, string[]>;
  incoming: Map<string, string[]>;
} {
  const outgoing = new Map<string, string[]>();
  const incoming = new Map<string, string[]>();

  for (const [from, to] of edges) {
    const outList = outgoing.get(from);
    if (outList) {
      outList.push(to);
    } else {
      outgoing.set(from, [to]);
    }
    const inList = incoming.get(to);
    if (inList) {
      inList.push(from);
    } else {
      incoming.set(to, [from]);
    }
  }

  return { outgoing, incoming };
}

export function buildGraphNodeByIdMap(nodes: readonly GraphNode[]): Map<string, GraphNode> {
  return new Map(nodes.map((node) => [node.id, node]));
}
