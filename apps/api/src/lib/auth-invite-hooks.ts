import { createAuthMiddleware } from "better-auth/api";
import {
  consumeInviteToken,
  readInviteTokenFromHookContext,
} from "../repositories/invite-tokens.js";
import { isExistingOAuthAccount } from "../repositories/oauth-accounts.js";

type SocialSignInBody = {
  provider?: string;
  idToken?: {
    token: string;
    nonce?: string;
  };
};

/**
 * Redirect OAuth: invite is enforced in `databaseHooks.user.create.before` only.
 * ID-token OAuth: skip invite when the provider account already exists (sign-in).
 */
export const inviteBeforeHook = createAuthMiddleware(async (ctx) => {
  if (ctx.path !== "/sign-in/social") return;

  const body = ctx.body as SocialSignInBody | undefined;
  if (!body?.idToken || !body.provider) return;

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
  if (!provider?.verifyIdToken || !provider.getUserInfo) return;

  const { token, nonce } = body.idToken;
  if (!(await provider.verifyIdToken(token, nonce))) return;

  const userInfo = await provider.getUserInfo({ idToken: token });
  const providerAccountId = userInfo?.user?.id;
  if (providerAccountId == null) return;

  const existing = await isExistingOAuthAccount(
    ctx.context.internalAdapter,
    body.provider,
    String(providerAccountId),
  );
  if (existing) return;

  // New user (idToken): invite is consumed in `databaseHooks.user.create.before`.
});

export function createInviteDatabaseHooks() {
  return {
    user: {
      create: {
        before: async (user: Record<string, unknown>, hookCtx?: unknown) => {
          const inviteToken = readInviteTokenFromHookContext(hookCtx);
          const userId = typeof user.id === "string" ? user.id : undefined;
          await consumeInviteToken(inviteToken, userId);
          return { data: user };
        },
      },
    },
  };
}
