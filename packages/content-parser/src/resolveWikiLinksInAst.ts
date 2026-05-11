/**
 * Walks mdast and attaches `targetEntityId` / `targetEntitySlug` on each `wikiLink` node.
 */

import "./remark/galipette-mdast.js";
import type { Root } from "mdast";
import type { WikiLink } from "mdast";
import type { CompiledEntity } from "@galipette/content-schema";
import { resolveReferenceToken } from "@galipette/content-schema";
import type { Parent } from "mdast";

function walk(node: Root | Parent, resolve: (operand: string) => CompiledEntity | undefined): void {
  if (!("children" in node) || !Array.isArray(node.children)) {
    return;
  }
  for (const child of node.children) {
    if ((child as { type?: string }).type === "wikiLink") {
      const w = child as unknown as WikiLink;
      const target = resolve(w.operand);
      if (target) {
        w.targetEntityId = target.id;
        w.targetEntitySlug = target.slug;
      }
      continue;
    }
    if ("children" in child && Array.isArray((child as Parent).children)) {
      walk(child as Parent, resolve);
    }
  }
}

/**
 * Mutates the tree in place, resolving each wiki operand against the vault corpus.
 */
export function resolveWikiLinksInAst(
  tree: Root,
  entities: readonly CompiledEntity[],
  byId: ReadonlyMap<string, CompiledEntity>,
): void {
  const resolve = (operand: string) => resolveReferenceToken(operand, entities, byId);
  walk(tree, resolve);
}
