import { Typography } from "@galipette/ui/components/typography";
import { useEffect } from "react";

import { authClient } from "../auth/auth-client";
import { router } from "../router";

export function LogoutPage() {
  const signOut = async () => {
    await authClient.signOut();
    router.navigate({ to: "/login" });
  };

  useEffect(() => {
    signOut();
  }, []);

  return (
    <section className="flex max-w-md flex-col gap-4 items-center justify-center h-screen">
      <Typography variant="muted">Deconnexion en cours...</Typography>
    </section>
  );
}
