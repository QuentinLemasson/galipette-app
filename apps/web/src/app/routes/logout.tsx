/**
 * Logout route definition (`/logout`).
 */

import { createRoute } from "@tanstack/react-router";

import { LogoutPage } from "../pages/LogoutPage";

import { rootRoute } from "./root";

export const logoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/logout",
  component: LogoutPage,
});
