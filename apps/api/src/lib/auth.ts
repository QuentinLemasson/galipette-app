import { betterAuth } from "better-auth";
import { prisma } from "@galipette/database";
import { prismaAdapter } from "better-auth/adapters/prisma";
import {
  createInviteDatabaseHooks,
  inviteBeforeHook,
} from "./auth-invite-hooks.js";

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
    },
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL,
  trustedOrigins: [
    process.env.WEB_ORIGIN ?? "http://localhost:5173",
    baseURL,
  ],
  hooks: {
    before: inviteBeforeHook,
  },
  databaseHooks: createInviteDatabaseHooks(),
});
