import { APIError, createAuthMiddleware } from "better-auth/api";

import {
  consumeInviteToken,
  readInviteTokenFromHeaders,
  readInviteTokenFromHookContext,
  validateInviteToken,
} from "../repositories/invite-tokens.js";
import { isExistingOAuthAccount } from "../repositories/oauth-accounts.js";

import { inviteLog, INVITE_OAUTH_STATE_KEY } from "./invite-logger.js";
import {
  clearPendingInviteCookie,
  setPendingInviteCookie,
  type InviteCookieContext,
} from "./invite-pending-cookie.js";

type SocialSignInBody = {
  provider?: string;
  requestSignUp?: boolean;
  additionalData?: Record<string, unknown>;
  idToken?: {
    token: string;
    nonce?: string;
  };
};

function readRequestHeaders(ctx: { request?: Request; headers?: Headers }): Headers | undefined {
  if (ctx.request?.headers) return ctx.request.headers;
  if (ctx.headers instanceof Headers) return ctx.headers;
  return undefined;
}

async function primePendingInviteCookie(ctx: InviteCookieContext, token: string): Promise<void> {
  await validateInviteToken(token);
  await setPendingInviteCookie(ctx, token);
}

/**
 * On social sign-in start: validate invite from header and store in HttpOnly cookie
 * so it survives the OAuth redirect. Does not consume the invite.
 * Sign-in without a header is allowed (returning users).
 */
export const inviteBeforeHook = createAuthMiddleware(async (ctx) => {
  if (ctx.path !== "/sign-in/social") return;

  inviteLog("sign-in", "social sign-in started", {
    path: ctx.path,
    provider: (ctx.body as SocialSignInBody | undefined)?.provider,
  });

  const headers = readRequestHeaders(ctx);
  const headerToken = readInviteTokenFromHeaders(headers);
  const body = ctx.body as SocialSignInBody | undefined;

  if (body?.idToken && body.provider) {
    const providers = ctx.context.socialProviders as
      | Array<{ id: string; verifyIdToken?: unknown; getUserInfo?: unknown }>
      | undefined;
    const provider = providers?.find((p) => p.id === body.provider) as
      | {
          verifyIdToken: (token: string, nonce?: string) => Promise<boolean>;
          getUserInfo: (input: { idToken: string }) => Promise<{
            user?: { id?: string | number };
          } | null>;
        }
      | undefined;

    if (provider?.verifyIdToken && provider.getUserInfo) {
      const { token, nonce } = body.idToken;
      if (await provider.verifyIdToken(token, nonce)) {
        const userInfo = await provider.getUserInfo({ idToken: token });
        const providerAccountId = userInfo?.user?.id;
        if (providerAccountId != null) {
          const existing = await isExistingOAuthAccount(
            ctx.context.internalAdapter,
            body.provider,
            String(providerAccountId),
          );
          if (existing) {
            inviteLog("sign-in", "idToken path — existing account, skip invite priming");
            return;
          }
        }
      }
    }
  }

  if (!headerToken) {
    inviteLog("sign-in", "no invite header — sign-in only (no priming, no requestSignUp)");
    return;
  }

  if (body && typeof body === "object") {
    body.requestSignUp = true;
    body.additionalData = {
      ...(body.additionalData ?? {}),
      [INVITE_OAUTH_STATE_KEY]: headerToken,
    };
  }

  inviteLog("sign-in", "priming invite (validate + cookie + OAuth state)", {
    token: headerToken,
    requestSignUp: true,
  });

  await primePendingInviteCookie(ctx as InviteCookieContext, headerToken);
});

/** Clear pending invite cookie after OAuth callback (returning users must not retain it). */
export const inviteAfterHook = createAuthMiddleware(async (ctx) => {
  if (!ctx.path.includes("/callback/")) return;

  inviteLog("callback", "OAuth callback after hook — clearing pending cookie", {
    path: ctx.path,
  });
  clearPendingInviteCookie(ctx as InviteCookieContext);
});

export function createInviteDatabaseHooks() {
  return {
    user: {
      create: {
        before: async (user: Record<string, unknown>, hookCtx?: unknown) => {
          inviteLog("user.create", "before hook — resolving invite", {
            userId: typeof user.id === "string" ? user.id : undefined,
            hookCtxPresent: Boolean(hookCtx),
            path:
              hookCtx && typeof hookCtx === "object"
                ? (hookCtx as InviteCookieContext).path
                : undefined,
          });

          const inviteToken = await readInviteTokenFromHookContext(hookCtx);
          const userId = typeof user.id === "string" ? user.id : undefined;

          if (!inviteToken) {
            inviteLog("user.create", "rejected — registration requires an invite");
            throw new APIError("FORBIDDEN", {
              message: "An invitation is required to create an account",
            });
          }

          try {
            await consumeInviteToken(inviteToken, userId);
          } catch (error) {
            inviteLog("user.create", "consume failed", {
              userId,
              token: inviteToken,
              error: error instanceof Error ? error.message : String(error),
            });
            throw error;
          }

          if (hookCtx && typeof hookCtx === "object") {
            clearPendingInviteCookie(hookCtx as InviteCookieContext);
          }

          return { data: user };
        },
      },
    },
  };
}
