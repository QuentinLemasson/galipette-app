/**
 * `/login` — Discord sign-in for everyone; invite link required only to register.
 */

import { Alert, AlertDescription } from "@galipette/ui/components/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@galipette/ui/components/avatar";
import { Button } from "@galipette/ui/components/button";
import { Typography } from "@galipette/ui/components/typography";
import { useSearch } from "@tanstack/react-router";
import { useCallback, useState } from "react";

import { authClient } from "../auth/auth-client";
import { INVITE_HEADER } from "../auth/invite-header";
import type { LoginSearch } from "../routes/login-search";

const LABELS = {
  TITLE: "L'application officielle de la Galipette Cendrée",
  DESCRIPTION_SIGN_IN:
    "Grâce à ce lien d'invitation, vous pouvez liez votre compte Discord à la Galipette Cendrée.",
  DESCRIPTION_SIGN_UP:
    "Connectez-vous avec Discord pour vous inscrire. Les nouveaux joueurs ont besoin d'un lien d'invitation dans vos messages privés.",
  BUTTON_SIGN_IN: "Se connecter avec Discord",
  BUTTON_SIGN_UP: "Créer un compte avec Discord",
  ERROR: "Impossible de démarrer la connexion avec Discord.",
};

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
        setError(signInError.message ?? LABELS.ERROR);
      }
    } catch {
      setError(LABELS.ERROR);
    } finally {
      setPending(false);
    }
  }, [redirect, invite]);

  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <section className="flex max-w-md flex-col gap-4">
        <div className="flex items-start gap-2">
          <Avatar className="w-10 h-10">
            <AvatarImage src="/galipette-logo.png" />
            <AvatarFallback>GA</AvatarFallback>
          </Avatar>
          <Typography variant="h1">{LABELS.TITLE}</Typography>
        </div>

        {invite ? (
          <Typography variant="body" className="leading-relaxed">
            {LABELS.DESCRIPTION_SIGN_IN}
          </Typography>
        ) : (
          <Typography variant="body" className="leading-relaxed">
            {LABELS.DESCRIPTION_SIGN_UP}
          </Typography>
        )}

        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{LABELS.ERROR}</AlertDescription>
          </Alert>
        ) : null}

        <Button type="button" disabled={pending} onClick={() => void connectDiscord()}>
          {pending ? "Redirection…" : LABELS.BUTTON_SIGN_IN}
        </Button>
      </section>
    </div>
  );
}
