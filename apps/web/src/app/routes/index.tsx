// routes/index.tsx
import { createRoute, redirect } from "@tanstack/react-router";

import { authClient } from "../auth/auth-client";

import { rootRoute } from "./root";

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: async () => {
    const { data: session } = await authClient.getSession();
    throw redirect({
      to: session ? "/app/home" : "/login",
    });
  },
});
