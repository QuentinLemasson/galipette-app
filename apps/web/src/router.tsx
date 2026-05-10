/**
 * Composes the route tree and creates the singleton TanStack Router instance.
 */

import { createRouter } from "@tanstack/react-router";
import { rootRoute } from "./routes/root";
import { homeRoute } from "./routes/home";
import { entityRoute } from "./routes/entity";

const routeTree = rootRoute.addChildren([homeRoute, entityRoute]);

/**
 * Application router instance shared by `RouterProvider`.
 */
export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
