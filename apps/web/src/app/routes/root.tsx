/**
 * Root route: hosts the persistent application layout.
 */

import { createRootRoute, Outlet } from "@tanstack/react-router";

import { NotFound } from "../../common/components/NotFound";

/**
 * Root route used to nest every other route under the shared application layout.
 */
export const rootRoute = createRootRoute({
  component: () => <Outlet />,
  notFoundComponent: () => <NotFound message="No route matched the requested URL." />,
});
