/**
 * Home route definition (mounted at `/`).
 */

import { createRoute } from "@tanstack/react-router";
import { HomePage } from "../pages/HomePage";
import { rootRoute } from "./root";

/**
 * Index route mounted at `/`.
 */
export const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});
