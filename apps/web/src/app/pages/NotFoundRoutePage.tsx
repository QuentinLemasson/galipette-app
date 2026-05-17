/**
 * `/not-found` page body (search params carry wikilink context).
 */

import { useSearch } from "@tanstack/react-router";

import { NotFound } from "../../common/components/NotFound";
import type { NotFoundSearch } from "../routes/not-found-search";

export function NotFoundRoutePage() {
  const { operand, link } = useSearch({
    from: "/not-found",
  }) as NotFoundSearch;
  const message =
    operand !== undefined && operand.length > 0
      ? [
          "This page was opened from a wikilink that does not resolve to any entity in the compiled corpus.",
          link && link.length > 0 ? `Shown link text: “${link}”.` : null,
          `Operand: “${operand}”.`,
        ]
          .filter(Boolean)
          .join(" ")
      : "No route matched the requested URL, or no wikilink context was provided.";

  return <NotFound message={message} />;
}
