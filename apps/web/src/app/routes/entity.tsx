/**
 * Entity detail route definition (`/entity/$<slug>`).
 * Binds the wiki feature’s entity explorer page.
 */

import { createRoute } from "@tanstack/react-router";
import { EntityPage } from "../../features/wiki/pages/EntityPage";
import { rootRoute } from "./root";

/**
 * Splat route mounted at `/entity/$`. The splat captures the remaining segments
 * as the entity's public `slug` (no `.md` suffix).
 */
export const entityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "entity/$",
  component: EntityPage,
});
