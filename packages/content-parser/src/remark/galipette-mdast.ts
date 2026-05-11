import type { Literal } from "mdast";

declare module "mdast" {
  interface WikiLink extends Literal {
    type: "wikiLink";
    operand: string;
    displayLabel: string;
    resource?: string;
    targetEntityId?: string;
    targetEntitySlug?: string;
  }

  interface StaticPhrasingContentMap {
    wikiLink: WikiLink;
  }
}

export {};
