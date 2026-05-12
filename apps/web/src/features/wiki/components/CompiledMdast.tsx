/**
 * Renders serialized mdast (`compiledContent`) with small leaf components for
 * block/inline nodes used in the vault pipeline (paragraphs, headings, wikilinks, …).
 */

import { Fragment, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import type { CompiledMarkdownAst } from "@galipette/compiled-content";
import { NOT_FOUND_ROUTE } from "../../../common/routing/constants";
import { buildEntityHref } from "../utils/source-path";

type JsonNode = {
  type: string;
  children?: JsonNode[];
  value?: string;
  depth?: number;
  operand?: string;
  displayLabel?: string;
  targetEntitySlug?: string;
  targetEntityId?: string;
  resource?: string;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function asJsonNode(raw: unknown): JsonNode | null {
  if (!isRecord(raw) || typeof raw.type !== "string") {
    return null;
  }
  return raw as JsonNode;
}

type AstTextProps = {
  node: JsonNode;
};

/**
 * Inline mdast `text` literal.
 */
export function AstText({ node }: AstTextProps) {
  const text = typeof node.value === "string" ? node.value : "";
  if (text.length === 0) {
    return null;
  }
  return <span className="entity-content__ast-text">{text}</span>;
}

type AstWikiLinkProps = {
  node: JsonNode;
};

/**
 * Resolved or unresolved Obsidian wikilink; internal targets route by entity slug.
 */
export function AstWikiLink({ node }: AstWikiLinkProps) {
  const label =
    typeof node.displayLabel === "string" && node.displayLabel.length > 0
      ? node.displayLabel
      : typeof node.value === "string"
        ? node.value
        : node.operand ?? "";

  if (typeof node.resource === "string" && node.resource.length > 0) {
    return (
      <a href={node.resource} className="entity-content__wikilink entity-content__wikilink--external">
        {label}
      </a>
    );
  }

  if (typeof node.targetEntitySlug === "string" && node.targetEntitySlug.length > 0) {
    return (
      <Link
        to={buildEntityHref(node.targetEntitySlug)}
        className="entity-content__wikilink entity-content__wikilink--internal"
      >
        {label}
      </Link>
    );
  }

  const operand =
    typeof node.operand === "string" && node.operand.length > 0 ? node.operand : "_";

  return (
    <Link
      to={NOT_FOUND_ROUTE}
      search={{ operand, link: label }}
      className="entity-content__wikilink entity-content__wikilink--broken-nav"
      title={`Unresolved wikilink (operand: ${operand})`}
    >
      {label}
    </Link>
  );
}

type AstHeadingProps = {
  node: JsonNode;
  children: ReactNode;
};

const HEADING_TAGS = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;

/**
 * Markdown heading mapped to `h1`–`h6`.
 */
export function AstHeading({ node, children }: AstHeadingProps) {
  const depth =
    typeof node.depth === "number" && node.depth >= 1 && node.depth <= 6 ? node.depth : 1;
  const Tag = HEADING_TAGS[depth - 1];
  return <Tag className="entity-content__ast-heading">{children}</Tag>;
}

type AstParagraphProps = {
  children: ReactNode;
};

/**
 * Markdown paragraph block.
 */
export function AstParagraph({ children }: AstParagraphProps) {
  return <p className="entity-content__ast-paragraph">{children}</p>;
}

type AstNodeProps = {
  node: unknown;
};

/**
 * Recursive mdast JSON renderer.
 */
export function AstNode({ node }: AstNodeProps) {
  const n = asJsonNode(node);
  if (!n) {
    return null;
  }

  const kids = Array.isArray(n.children)
    ? n.children.map((child, i) => <AstNode key={i} node={child} />)
    : null;

    // TODO : use a lazy registry approach to avoid
    // - re-rendering the whole tree when a single node changes
    // - lazy rendering of nodes that are not in the viewport
    // - node-caching
  switch (n.type) {
    case "root":
      return <Fragment>{kids}</Fragment>;
    case "paragraph":
      return <AstParagraph>{kids}</AstParagraph>;
    case "heading":
      return <AstHeading node={n}>{kids}</AstHeading>;
    case "text":
      return <AstText node={n} />;
    case "wikiLink":
      return <AstWikiLink node={n} />;
    case "break":
    case "lineBreak":
      return <br className="entity-content__ast-br" />;
    case "thematicBreak":
      return <hr className="entity-content__ast-hr" />;
    default:
      if (kids) {
        return <Fragment>{kids}</Fragment>;
      }
      return null;
  }
}

type CompiledMdastProps = {
  ast: CompiledMarkdownAst;
};

/**
 * Renders a compiled mdast root (`type: "root"`).
 */
export function CompiledMdast({ ast }: CompiledMdastProps) {
  return <AstNode node={ast} />;
}
