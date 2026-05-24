/**
 * Wiki entity detail route (`/app/wiki/$` splat, under authenticated app shell).
 */

import { createRoute } from "@tanstack/react-router";

import { EntityPage } from "../../features/wiki/pages/EntityPage";

import { appRoute } from "./app";

/**
 * Splat route mounted at `/app/wiki/$`. The splat is the entity path after the wiki
 * route prefix (no `wiki/` namespace segment, no `.md` suffix).
 */
export const wikiRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "wiki/$",
  component: EntityPage,
});
