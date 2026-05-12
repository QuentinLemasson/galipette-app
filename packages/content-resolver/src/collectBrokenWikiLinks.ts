/**
 * Aggregates unresolved wiki operands from merged references and from mdast `wikiLink` nodes.
 */

import "@galipette/content-parser";
import type { Parent } from "mdast";
import type { Root } from "mdast";
import type { WikiLink } from "mdast";
import type {
  BrokenWikiLinkOrigin,
  BrokenWikiLinkRecord,
  CompiledEntity,
  CompiledMarkdownAst,
  EntityReference,
} from "@galipette/content-schema";

type Agg = {
  linkText: string;
  origins: Set<BrokenWikiLinkOrigin>;
};

function refSourcesToOrigins(refSources: EntityReference["refSources"]): BrokenWikiLinkOrigin[] {
  const out: BrokenWikiLinkOrigin[] = [];
  for (const s of refSources) {
    if (s === "body") {
      out.push("markdown");
    } else if (s === "frontMatter") {
      out.push("frontMatter");
    }
  }
  return out;
}

function walkBrokenWikiInAst(tree: Root, byOperand: Map<string, Agg>): void {
  function walk(node: Root | Parent): void {
    if (!("children" in node) || !node.children) {
      return;
    }
    for (const child of node.children) {
      if ((child as { type?: string }).type === "wikiLink") {
        const w = child as unknown as WikiLink;
        if (w.targetEntitySlug) {
          continue;
        }
        const operand = w.operand;
        const linkText = w.displayLabel || w.value || operand;
        let agg = byOperand.get(operand);
        if (!agg) {
          agg = { linkText, origins: new Set() };
          byOperand.set(operand, agg);
        }
        agg.origins.add("markdown");
        if (linkText.length > 0) {
          agg.linkText = linkText;
        }
        continue;
      }
      if ("children" in child && Array.isArray((child as Parent).children)) {
        walk(child as Parent);
      }
    }
  }

  walk(tree);
}

/**
 * Builds deduped broken-link rows for one compiled entity (unresolved operands only).
 */
export function collectBrokenWikiLinksForEntity(entity: CompiledEntity): BrokenWikiLinkRecord[] {
  const byOperand = new Map<string, Agg>();

  for (const ref of entity.references) {
    if (ref.targetEntityId) {
      continue;
    }
    const origins = refSourcesToOrigins(ref.refSources);
    if (origins.length === 0) {
      continue;
    }
    const operand = ref.operand;
    let agg = byOperand.get(operand);
    if (!agg) {
      agg = { linkText: ref.targetLabel, origins: new Set() };
      byOperand.set(operand, agg);
    }
    for (const o of origins) {
      agg.origins.add(o);
    }
  }

  const ast = entity.compiledContent as CompiledMarkdownAst | undefined;
  if (ast && ast.type === "root") {
    walkBrokenWikiInAst(ast as unknown as Root, byOperand);
  }

  const rows: BrokenWikiLinkRecord[] = [];
  for (const [operand, agg] of byOperand) {
    rows.push({
      entityId: entity.id,
      sourcePath: entity.sourcePath,
      entitySlug: entity.slug,
      operand,
      linkText: agg.linkText,
      origins: Array.from(agg.origins).sort((a, b) => a.localeCompare(b)),
    });
  }

  return rows.sort((a, b) => a.operand.localeCompare(b.operand));
}
