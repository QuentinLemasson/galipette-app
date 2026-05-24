/**
 * Renders serialized mdast (`compiledContent`) with router-aware wikilinks.
 */

import type { CompiledMarkdownAst } from "@galipette/compiled-content";
import {
  AstBreak,
  AstHeading,
  AstHr,
  AstParagraph,
  AstText,
} from "@galipette/ui/components/mdast";
import { Wikilink } from "@galipette/ui/components/wikilink";
import { Link } from "@tanstack/react-router";
import { Fragment } from "react";

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
        : (node.operand ?? "");

  if (typeof node.resource === "string" && node.resource.length > 0) {
    return (
      <Wikilink variant="external" href={node.resource}>
        {label}
      </Wikilink>
    );
  }

  if (typeof node.targetEntitySlug === "string" && node.targetEntitySlug.length > 0) {
    return (
      <Wikilink variant="internal" asChild>
        <Link to={buildEntityHref(node.targetEntitySlug)}>{label}</Link>
      </Wikilink>
    );
  }

  const operand = typeof node.operand === "string" && node.operand.length > 0 ? node.operand : "_";

  return (
    <Wikilink variant="broken" asChild title={`Unresolved wikilink (operand: ${operand})`}>
      <Link to={NOT_FOUND_ROUTE} search={{ operand, link: label }}>
        {label}
      </Link>
    </Wikilink>
  );
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

  switch (n.type) {
    case "root":
      return <Fragment>{kids}</Fragment>;
    case "paragraph":
      return <AstParagraph>{kids}</AstParagraph>;
    case "heading": {
      const depth =
        typeof n.depth === "number" && n.depth >= 1 && n.depth <= 6 ? n.depth : 1;
      return <AstHeading depth={depth}>{kids}</AstHeading>;
    }
    case "text": {
      const text = typeof n.value === "string" ? n.value : "";
      return <AstText text={text} />;
    }
    case "wikiLink":
      return <AstWikiLink node={n} />;
    case "break":
    case "lineBreak":
      return <AstBreak />;
    case "thematicBreak":
      return <AstHr />;
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
