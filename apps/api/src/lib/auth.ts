import { betterAuth } from "better-auth";
import { prisma } from "@galipette/database";
import { prismaAdapter } from "better-auth/adapters/prisma";
import {
  createInviteDatabaseHooks,
  inviteAfterHook,
  inviteBeforeHook,
} from "./auth-invite-hooks.js";
import { parseWebOrigins } from "./cors.js";

const port = Number(process.env.PORT ?? 3001);
const baseURL = process.env.BETTER_AUTH_URL ?? `http://localhost:${port}`;

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  socialProviders: {
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      redirectUri: `${baseURL}/api/auth/callback/discord`,
      disableImplicitSignUp: true,
    },
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL,
  trustedOrigins: [...parseWebOrigins(), baseURL],
  hooks: {
    before: inviteBeforeHook,
    after: inviteAfterHook,
  },
  databaseHooks: createInviteDatabaseHooks(),
});
