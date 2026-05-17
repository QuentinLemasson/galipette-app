/**
 * `/login` — Discord sign-in for everyone; invite link required only to register.
 */

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
    <section className="login-page">
      <h1>Sign in</h1>

      {invite ? (
        <p className="login-page__lead">
          You have an invitation link — connect Discord to sign in or create your account.
        </p>
      ) : (
        <p className="login-page__lead">
          Connect with Discord if you already have an account. New players need an invitation link
          from your DM.
        </p>
      )}

      {error && <p className="login-page__error">{error}</p>}
      <p className="login-page__actions">
        <button
          type="button"
          className="login-page__primary"
          disabled={pending}
          onClick={() => void connectDiscord()}
        >
          {pending ? "Redirecting…" : "Connect via Discord"}
        </button>
      </p>
    </section>
  );
}
