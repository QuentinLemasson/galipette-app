/**
 * Entity detail route definition (`/entity/$<slug>`).
 */

import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "./root";
import { EntityPage } from "../components/EntityPage";

/**
 * Splat route mounted at `/entity/$`. The splat captures the remaining segments
 * as the entity's public `slug` (no `.md` suffix).
 */
export const entityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "entity/$",
  component: EntityPage,
});
