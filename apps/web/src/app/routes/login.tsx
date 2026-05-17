/**
 * Public login route (`/login`). Invite token is read from `?token=…`.
 */

import { createRoute } from "@tanstack/react-router";
import { LoginPage } from "../pages/LoginPage";
import { parseLoginSearch } from "./login-search";
import { rootRoute } from "./root";

export type { LoginSearch } from "./login-search";

export const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  validateSearch: parseLoginSearch,
  component: LoginPage,
});
