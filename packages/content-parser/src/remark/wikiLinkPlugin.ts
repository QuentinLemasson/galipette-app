/**
 * Remark plugin: splits mdast `text` nodes into plain text and `wikiLink` phrasing nodes.
 */

import "./galipette-mdast.js";
import type { Parent, Root, Text } from "mdast";
import type { WikiLink } from "mdast";

import {
  extractObsidianLinkDisplay,
  extractObsidianLinkLeftOperand,
} from "../obsidian/operands.js";

type WikiChunk =
  | { kind: "text"; value: string }
  | {
      kind: "wiki";
      operand: string;
      displayLabel: string;
      resource?: string;
    };

function splitTextWithWikiLinks(raw: string): WikiChunk[] {
  if (raw.length === 0) {
    return [{ kind: "text", value: "" }];
  }
  const parts: WikiChunk[] = [];
  let cursor = 0;
  const len = raw.length;
  while (cursor < len) {
    const idx = raw.indexOf("[[", cursor);
    if (idx === -1) {
      parts.push({ kind: "text", value: raw.slice(cursor) });
      break;
    }
    if (idx > cursor) {
      parts.push({ kind: "text", value: raw.slice(cursor, idx) });
    }
    const closeIdx = raw.indexOf("]]", idx + 2);
    if (closeIdx === -1) {
      parts.push({ kind: "text", value: raw.slice(idx) });
      break;
    }
    const inner = raw.slice(idx + 2, closeIdx);
    let after = closeIdx + 2;
    let resource: string | undefined;
    if (raw.slice(after).startsWith("(")) {
      const endParen = raw.indexOf(")", after);
      if (endParen !== -1) {
        resource = raw.slice(after + 1, endParen).trim();
        after = endParen + 1;
      }
    }
    parts.push({
      kind: "wiki",
      operand: extractObsidianLinkLeftOperand(inner),
      displayLabel: extractObsidianLinkDisplay(inner),
      resource,
    });
    cursor = after;
  }
  return parts;
}

function wikiChunksToNodes(chunks: WikiChunk[]): Array<Text | WikiLink> {
  const out: Array<Text | WikiLink> = [];
  for (const chunk of chunks) {
    if (chunk.kind === "text") {
      if (chunk.value.length > 0) {
        out.push({ type: "text", value: chunk.value });
      }
      continue;
    }
    const node: WikiLink = {
      type: "wikiLink",
      operand: chunk.operand,
      displayLabel: chunk.displayLabel,
      value: chunk.displayLabel,
      ...(chunk.resource !== undefined ? { resource: chunk.resource } : {}),
    };
    out.push(node);
  }
  return out;
}

function shouldParseTextInAncestorChain(ancestors: readonly Parent[]): boolean {
  return !ancestors.some((a) => a.type === "inlineCode" || a.type === "code");
}

function walk(node: Root | Parent, ancestors: Parent[]): void {
  if (!("children" in node) || !Array.isArray(node.children)) {
    return;
  }

  const children = node.children;
  for (let i = 0; i < children.length; i++) {
    const child = children[i]!;
    if (child.type === "text" && shouldParseTextInAncestorChain(ancestors)) {
      const chunks = splitTextWithWikiLinks(child.value);
      const replacement = wikiChunksToNodes(chunks);
      if (
        replacement.length !== 1 ||
        replacement[0]!.type !== "text" ||
        replacement[0]!.value !== child.value
      ) {
        (children as unknown as Array<Text | WikiLink>).splice(i, 1, ...replacement);
        i += replacement.length - 1;
      }
      continue;
    }

    if ("children" in child && Array.isArray((child as Parent).children)) {
      walk(child as Parent, [...ancestors, node]);
    }
  }
}

/**
 * Remark transformer that recognizes Obsidian `[[link]]`, `[[target|label]]`, and `[[...]](url)`.
 */
export function remarkGalipetteWikiLinks() {
  return (tree: Root) => {
    walk(tree, []);
  };
}
