/**
 * Root route: hosts the persistent application layout.
 */

import { createRootRoute } from "@tanstack/react-router";
import { AppLayout } from "../components/AppLayout";
import { NotFound } from "../components/NotFound";

/**
 * Root route used to nest every other route under the shared application layout.
 */
export const rootRoute = createRootRoute({
  component: AppLayout,
  notFoundComponent: () => (
    <NotFound message="No route matched the requested URL." />
  ),
});
