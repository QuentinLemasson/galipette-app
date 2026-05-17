/**
 * Explicit `/not-found` route (e.g. opened from an unresolved wikilink).
 */

import { createRoute } from "@tanstack/react-router";

import { NotFoundRoutePage } from "../pages/NotFoundRoutePage";

import { parseNotFoundSearch } from "./not-found-search";
import { rootRoute } from "./root";

export type { NotFoundSearch } from "./not-found-search";

/**
 * Route mounted at `/not-found` for user-visible “not found” states (including broken wikilinks).
 */
export const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "not-found",
  validateSearch: parseNotFoundSearch,
  component: NotFoundRoutePage,
});
