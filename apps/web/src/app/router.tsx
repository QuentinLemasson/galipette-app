/**
 * Composes the route tree and creates the singleton TanStack Router instance.
 */

import { createRouter } from "@tanstack/react-router";
import { rootRoute } from "./routes/root";
import { homeRoute } from "./routes/home";
import { characterListRoute, characterSheetRoute } from "./routes/characters";
import { wikiRoute } from "./routes/wiki";
import { notFoundRoute } from "./routes/not-found";
import { appRoute } from "./routes/app";
import { loginRoute } from "./routes/login";
import { indexRoute } from "./routes/index";

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  appRoute.addChildren([homeRoute, characterSheetRoute, characterListRoute, wikiRoute]),
  notFoundRoute,
]);

/**
 * Application router instance shared by `RouterProvider`.
 */
export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
