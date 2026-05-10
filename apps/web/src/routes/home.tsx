/**
 * Home route definition (mounted at `/`).
 */

import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "./root";
import { HomePage } from "../components/HomePage";

/**
 * Index route mounted at `/`.
 */
export const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});
