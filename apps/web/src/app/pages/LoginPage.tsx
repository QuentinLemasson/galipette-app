/**
 * `/login` — Discord sign-in for everyone; invite link required only to register.
 */

import { Alert, AlertDescription } from "@galipette/ui/components/alert";
import { Button } from "@galipette/ui/components/button";
import { Typography } from "@galipette/ui/components/typography";
import { useSearch } from "@tanstack/react-router";
import { useCallback, useState } from "react";

import { authClient } from "../auth/auth-client";
import { INVITE_HEADER } from "../auth/invite-header";
import type { LoginSearch } from "../routes/login-search";

function resolveCallbackURL(redirect: string | undefined): string {
  const fallback = `${window.location.origin}/app/home`;
  if (!redirect) return fallback;

  try {
    const url = new URL(redirect, window.location.origin);
    if (url.origin === window.location.origin) return url.href;
  } catch {
    /* use fallback */
  }

  return fallback;
}

export function LoginPage() {
  const { invite, redirect } = useSearch({ from: "/login" }) as LoginSearch;
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const connectDiscord = useCallback(async () => {
    setError(null);
    setPending(true);
    try {
      const { error: signInError } = await authClient.signIn.social({
        provider: "discord",
        callbackURL: resolveCallbackURL(redirect),
        ...(invite
          ? {
              requestSignUp: true,
              fetchOptions: {
                headers: {
                  [INVITE_HEADER]: invite,
                },
              },
            }
          : {}),
      });
      if (signInError) {
        setError(signInError.message ?? "Could not start Discord sign-in.");
      }
    } catch {
      setError("Could not start Discord sign-in.");
    } finally {
      setPending(false);
    }
  }, [redirect, invite]);

  return (
    <section className="flex max-w-md flex-col gap-4">
      <Typography variant="h1" as="h1">
        Sign in
      </Typography>

      {invite ? (
        <Typography variant="body" className="leading-relaxed">
          You have an invitation link — connect Discord to sign in or create your account.
        </Typography>
      ) : (
        <Typography variant="body" className="leading-relaxed">
          Connect with Discord if you already have an account. New players need an invitation link
          from your DM.
        </Typography>
      )}

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Button type="button" disabled={pending} onClick={() => void connectDiscord()}>
        {pending ? "Redirecting…" : "Connect via Discord"}
      </Button>
    </section>
  );
}
