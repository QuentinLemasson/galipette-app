import { createAuthClient } from "better-auth/react";

import { getApiOrigin } from "../../lib/api-origin";

export const authClient = createAuthClient({
  baseURL: getApiOrigin(),
  fetchOptions: {
    credentials: "include",
  },
});
