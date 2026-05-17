import { createRoute, Outlet, redirect } from "@tanstack/react-router";
import { rootRoute } from "./root";
import { authClient } from "../auth/auth-client";

export const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app",
  beforeLoad: async () => {
    const { data: session } = await authClient.getSession();
    if (!session) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
  },
  component: () => <Outlet />,
});
