/**
 * Entity detail route definition (`/entity/$<slug>`).
 * Binds the wiki feature’s entity explorer page.
 */

import { createRoute } from "@tanstack/react-router";

import { EntityPage } from "../../features/wiki/pages/EntityPage";

import { appRoute } from "./app";

/**
 * Splat route mounted at `/entity/$`. The splat captures the remaining segments
 * as the entity's public `slug` (no `.md` suffix).
 */
export const wikiRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "wiki/$",
  // TODO : rename this route to wiki route
  component: EntityPage,
});
