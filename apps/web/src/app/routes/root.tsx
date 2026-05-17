/**
 * Root route: hosts the persistent application layout.
 */

import { createRootRoute } from "@tanstack/react-router";
import { NotFound } from "../../common/components/NotFound";
import { AppLayout } from "../layout/AppLayout";

/**
 * Root route used to nest every other route under the shared application layout.
 */
export const rootRoute = createRootRoute({
  component: AppLayout,
  notFoundComponent: () => <NotFound message="No route matched the requested URL." />,
});
