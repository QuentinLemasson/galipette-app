import { prisma } from "@galipette/database";
import { APIError } from "better-auth/api";
import { createToken } from "../lib/create-token.js";
import { InviteToken } from "../../../../packages/database/dist/generated/prisma/client.js";

export const INVITE_HEADER = "x-invite-token";

export function readInviteTokenFromHeaders(
  headers: Headers | undefined,
): string | undefined {
  const value = headers?.get(INVITE_HEADER)?.trim();
  return value || undefined;
}

export function readInviteTokenFromHookContext(hookCtx: unknown): string | undefined {
  if (!hookCtx || typeof hookCtx !== "object") return undefined;

  const ctx = hookCtx as { request?: Request; headers?: Headers };

  if (ctx.request?.headers) {
    return readInviteTokenFromHeaders(ctx.request.headers);
  }

  if (ctx.headers instanceof Headers) {
    return readInviteTokenFromHeaders(ctx.headers);
  }

  return undefined;
}

/**
 * Atomically validates and marks an invite as used (check + consume in one step).
 * Safe under concurrent sign-ups for the same token.
 */
export async function consumeInviteToken(
  token: string | undefined,
  userId?: string,
): Promise<void> {
  if (!token?.trim()) {
    throw new APIError("BAD_REQUEST", { message: "Invite token is required" });
  }

  const now = new Date();
  const result = await prisma.inviteToken.updateMany({
    where: {
      token: token.trim(),
      used: false,
      expiresAt: { gt: now },
    },
    data: {
      used: true,
      usedAt: now,
      ...(userId ? { usedBy: userId } : {}),
    },
  });

  if (result.count !== 1) {
    throw new APIError("FORBIDDEN", {
      message: "Invalid, expired, or already used invite token",
    });
  }
}

/**
 * Create an invite token.
 * @param expiresAt - Numbers of days until the invite token will expire.
 * @returns The invite token.
 */
export async function createInviteToken(expiresAt: number): Promise<InviteToken> {
  // token creation
  const token = createToken();
  // date calculation
  const date = new Date();
  date.setDate(date.getDate() + expiresAt);
  // prisma transaction
  const invite = await prisma.inviteToken.create({
    data: {
      token,
      expiresAt: date,
    },
  });
  return invite;
}