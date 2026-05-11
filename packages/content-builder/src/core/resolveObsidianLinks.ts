/**
 * Wikilink discovery and front matter normalization for Obsidian-style references.
 */

import {
  extractObsidianLinkDisplay,
  extractObsidianLinkLeftOperand,
} from "@galipette/content-parser";

const OBSIDIAN_LINK_PATTERN = /\[\[([^[\]]+)\]\]/g;

/**
 * Replaces every `[[link]]` substring with the alias / display segment for string values.
 *
 * @param value - Raw string possibly containing multiple wikilinks.
 * @returns Same structure with links substituted by display text (`target|alias` → `alias`).
 */
function normalizeString(value: string): string {
  return value.replace(OBSIDIAN_LINK_PATTERN, (_match, linkBody: string) =>
    extractObsidianLinkDisplay(linkBody),
  );
}

/**
 * Depth-first walk that records unique left operands from all `[[...]]` occurrences.
 *
 * @param value - YAML-serialized structure or markdown substring.
 * @param references - Mutable accumulator of resolved operands (deduped later).
 */
function visitCollect(value: unknown, references: string[]): void {
  if (typeof value === "string") {
    for (const match of value.matchAll(OBSIDIAN_LINK_PATTERN)) {
      const operand = extractObsidianLinkLeftOperand(match[1]);
      if (operand) {
        references.push(operand);
      }
    }
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      visitCollect(item, references);
    }
    return;
  }

  if (value && typeof value === "object") {
    for (const nested of Object.values(value as Record<string, unknown>)) {
      visitCollect(nested, references);
    }
  }
}

/**
 * Recursively applies {@link normalizeString} to every string in a plain object tree.
 *
 * @param value - Front matter subtree.
 * @returns Clone-like normalized structure safe for schema parsing.
 */
function visitNormalize(value: unknown): unknown {
  if (typeof value === "string") {
    return normalizeString(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => visitNormalize(item));
  }

  if (value && typeof value === "object") {
    const input = value as Record<string, unknown>;
    const output: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(input)) {
      output[key] = visitNormalize(nested);
    }
    return output;
  }

  return value;
}

/**
 * Collects unique left operands from wikilinks embedded in YAML front matter only.
 * Body references are merged later via `@galipette/content-resolver` after markdown → mdast.
 *
 * @param frontmatter - Parsed YAML object from gray-matter (before operand substitution).
 * @returns Deduplicated operands contributed by front matter for merged `references`.
 */
export function collectObsidianReferencesFromFrontmatter(frontmatter: unknown): string[] {
  const references: string[] = [];
  visitCollect(frontmatter, references);
  return Array.from(new Set(references));
}

/**
 * Strips wikilink markup from front matter string fields so schemas see plain operands.
 *
 * @param frontmatter - Raw front matter object from gray-matter.
 * @returns Structurally identical tree with strings normalized (same generic type assertion).
 */
export function normalizeObsidianFrontmatter<T>(frontmatter: T): T {
  return visitNormalize(frontmatter) as T;
}

export { extractObsidianLinkLeftOperand } from "@galipette/content-parser";
