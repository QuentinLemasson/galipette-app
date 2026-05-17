/**
 * Markdown → mdast with Galipette wiki link nodes.
 */

import "./remark/galipette-mdast.js";
import type { Root } from "mdast";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { removePosition } from "unist-util-remove-position";

import { remarkGalipetteWikiLinks } from "./remark/wikiLinkPlugin.js";

const processor = unified().use(remarkParse).use(remarkGalipetteWikiLinks);

/** Parses Markdown to mdast with wiki nodes; strips `position` on every node for smaller compiled JSON. */
export function parseEntityMarkdownToAst(markdown: string): Root {
  const tree = processor.runSync(processor.parse(markdown)) as Root;
  removePosition(tree);
  return tree;
}
