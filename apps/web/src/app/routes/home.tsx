/**
 * Home route definition (mounted at `/`).
 */

import { createRoute } from "@tanstack/react-router";

import { HomePage } from "../pages/HomePage";

import { appRoute } from "./app";

/**
 * Index route mounted at `/`.
 */
export const homeRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/home",
  component: HomePage,
});
