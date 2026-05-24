/**
 * Presentational mdast leaf nodes for compiled wiki content.
 */

import * as React from "react";

import { ProseBreak, ProseHr, ProseParagraph } from "@galipette/ui/components/prose";
import { Typography } from "@galipette/ui/components/typography";

const HEADING_VARIANTS = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;

type AstTextProps = {
  text: string;
};

function AstText({ text }: AstTextProps) {
  if (text.length === 0) {
    return null;
  }
  return <span data-slot="ast-text">{text}</span>;
}

type AstHeadingProps = {
  depth: number;
  children: React.ReactNode;
};

function AstHeading({ depth, children }: AstHeadingProps) {
  const clamped = depth >= 1 && depth <= 6 ? depth : 1;
  const variant = HEADING_VARIANTS[clamped - 1];

  return (
    <Typography variant={variant} as={variant}>
      {children}
    </Typography>
  );
}

type AstParagraphProps = {
  children: React.ReactNode;
};

function AstParagraph({ children }: AstParagraphProps) {
  return <ProseParagraph>{children}</ProseParagraph>;
}

const AstBreak = ProseBreak;
const AstHr = ProseHr;

export { AstBreak, AstHeading, AstHr, AstParagraph, AstText };
