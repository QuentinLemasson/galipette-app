/**
 * Explicit `/not-found` route (e.g. opened from an unresolved wikilink).
 */

import { createRoute } from "@tanstack/react-router";
import { NotFound } from "../../common/components/NotFound";
import { rootRoute } from "./root";

export type NotFoundSearch = {
  operand?: string;
  link?: string;
};

/**
 * Search params accepted on `/not-found` for broken wikilink context.
 */
function parseNotFoundSearch(raw: Record<string, unknown>): NotFoundSearch {
  return {
    operand: typeof raw.operand === "string" ? raw.operand : undefined,
    link: typeof raw.link === "string" ? raw.link : undefined,
  };
}

function NotFoundRoutePage() {
  const { operand, link } = notFoundRoute.useSearch();
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

/**
 * Route mounted at `/not-found` for user-visible “not found” states (including broken wikilinks).
 */
export const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "not-found",
  validateSearch: parseNotFoundSearch,
  component: NotFoundRoutePage,
});
