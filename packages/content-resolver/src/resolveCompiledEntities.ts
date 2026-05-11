/**
 * Post-validation step: mdast + merged references with sources, wired to the entity corpus.
 */

import type { Parent } from "mdast";
import type { Root } from "mdast";
import type {
  CompiledEntity,
  CompiledMarkdownAst,
  EntityReference,
  EntityReferenceSource,
} from "@galipette/content-schema";
import { resolveReferenceToken } from "@galipette/content-schema";
import {
  parseEntityMarkdownToAst,
  resolveWikiLinksInAst,
} from "@galipette/content-parser";

function collectWikiOperands(tree: Root): string[] {
  const operands: string[] = [];

  function walk(node: Root | Parent): void {
    if (!("children" in node) || !node.children) {
      return;
    }
    for (const child of node.children) {
      if ((child as { type?: string }).type === "wikiLink") {
        operands.push(
          (child as unknown as { type: "wikiLink"; operand: string }).operand,
        );
      } else if ("children" in child && Array.isArray((child as Parent).children)) {
        walk(child as Parent);
      }
    }
  }

  walk(tree);
  return operands;
}

function mergeReferenceRecords(
  fmOperands: readonly string[],
  bodyOperands: readonly string[],
  corpus: readonly CompiledEntity[],
  byId: ReadonlyMap<string, CompiledEntity>,
): EntityReference[] {
  const map = new Map<string, Set<EntityReferenceSource>>();
  for (const op of fmOperands) {
    let set = map.get(op);
    if (!set) {
      set = new Set();
      map.set(op, set);
    }
    set.add("frontMatter");
  }
  for (const op of bodyOperands) {
    let set = map.get(op);
    if (!set) {
      set = new Set();
      map.set(op, set);
    }
    set.add("body");
  }

  return Array.from(map.entries())
    .map(([operand, sources]) => {
      const target = resolveReferenceToken(operand, corpus, byId);
      const refSources = Array.from(sources).sort(
        (a, b) => a.localeCompare(b),
      ) as EntityReferenceSource[];
      const base: EntityReference = {
        operand,
        refSources,
        targetLabel: target?.name ?? operand,
        ...(target
          ? {
              targetEntityId: target.id,
              targetEntitySlug: target.slug,
            }
          : {}),
      };
      return base;
    })
    .sort((a, b) => a.operand.localeCompare(b.operand));
}

export type PendingCompiledEntity = {
  entity: CompiledEntity;
  /** Left operands from `[[...]]` in YAML front matter only (before body parsing). */
  fmOperands: readonly string[];
};

/**
 * Parses each entity's Markdown body to mdast, resolves wiki targets to ids/slugs, and merges
 * reference operands from front matter and body with `refSources`.
 */
export function resolveCompiledEntities(
  pending: readonly PendingCompiledEntity[],
  corpus: readonly CompiledEntity[],
): CompiledEntity[] {
  const byId = new Map(corpus.map((e) => [e.id, e]));

  return pending.map(({ entity, fmOperands }) => {
    const tree = parseEntityMarkdownToAst(entity.content);
    resolveWikiLinksInAst(tree, corpus, byId);
    const bodyOperands = collectWikiOperands(tree);
    const references = mergeReferenceRecords(fmOperands, bodyOperands, corpus, byId);

    return {
      ...entity,
      compiledContent: tree as unknown as CompiledMarkdownAst,
      references,
    };
  });
}
