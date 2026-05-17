/**
 * Composes the route tree and creates the singleton TanStack Router instance.
 */

import { createRouter } from "@tanstack/react-router";

import { appRoute } from "./routes/app";
import { characterListRoute, characterSheetRoute } from "./routes/characters";
import { homeRoute } from "./routes/home";
import { indexRoute } from "./routes/index";
import { loginRoute } from "./routes/login";
import { notFoundRoute } from "./routes/not-found";
import { rootRoute } from "./routes/root";
import { wikiRoute } from "./routes/wiki";

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
