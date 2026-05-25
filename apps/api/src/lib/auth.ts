import { prisma } from "@galipette/database";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import {
  createInviteDatabaseHooks,
  inviteAfterHook,
  inviteBeforeHook,
} from "./auth-invite-hooks.js";
import { parseWebOrigins } from "./cors.js";
import { inviteLog } from "./invite-logger.js";

const port = Number(process.env.PORT ?? 3001);
const baseURL = process.env.BETTER_AUTH_URL ?? `http://localhost:${port}`;
const webOrigins = parseWebOrigins();
const trustedOrigins = [...webOrigins, baseURL];
const discordRedirectUri = `${baseURL}/api/auth/callback/discord`;

inviteLog("auth-init", "Better Auth configuration", {
  baseURL,
  discordRedirectUri,
  trustedOrigins,
  webOrigins,
  port,
  hasSecret: Boolean(process.env.BETTER_AUTH_SECRET),
  hasDiscordClientId: Boolean(process.env.DISCORD_CLIENT_ID),
});

// #region agent log
const baseURLIsHttps = baseURL.startsWith("https://");
inviteLog("auth-init", "useSecureCookies auto-detect prediction", {
  baseURLIsHttps,
  note: "Better Auth derives useSecureCookies from request.url at runtime, NOT from baseURL config. Behind Railway proxy, request.url is http:// even though baseURL is https://",
});
// #endregion

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  socialProviders: {
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      redirectUri: discordRedirectUri,
      disableImplicitSignUp: true,
    },
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL,
  trustedOrigins,
  // Allow cross-site cookies for all domains while using HTTPS & keep secure cookies for localhost.
  advanced: {
    useSecureCookies: true,
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
    },
  },
  hooks: {
    before: inviteBeforeHook,
    after: inviteAfterHook,
  },
  databaseHooks: createInviteDatabaseHooks(),
});
