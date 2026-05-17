import { prisma } from "@galipette/database";
import { APIError, getOAuthState } from "better-auth/api";
import { createToken } from "../lib/create-token.js";
import { inviteLog, INVITE_OAUTH_STATE_KEY } from "../lib/invite-logger.js";
import {
  describeCookieHeader,
  readPendingInviteCookie,
  type InviteCookieContext,
} from "../lib/invite-pending-cookie.js";

export const INVITE_HEADER = "x-invite-token";

/**
 * Read the invite token from the headers of the request
 * @param headers - The headers of the request.
 * @returns The invite token.
 */
export function readInviteTokenFromHeaders(
  headers: Headers | undefined,
): string | undefined {
  const value = headers?.get(INVITE_HEADER)?.trim();
  return value || undefined;
}

/**
 * Read the headers from the request.
 * @param hookCtx - The hook context.
 * @returns The headers.
 */
function readHeadersFromHookContext(hookCtx: unknown): Headers | undefined {
  if (!hookCtx || typeof hookCtx !== "object") return undefined;

  const ctx = hookCtx as { request?: Request; headers?: Headers };

  if (ctx.request?.headers) return ctx.request.headers;
  if (ctx.headers instanceof Headers) return ctx.headers;

  return undefined;
}

/**
 * Read the invite token from the OAuth state.
 * @param hookCtx - The hook context.
 * @returns The invite token.
 */
async function readInviteFromOAuthState(
  hookCtx: InviteCookieContext,
): Promise<string | undefined> {
  if (!hookCtx.path?.includes("/callback")) return undefined;

  const oauthState = await getOAuthState();
  const token = oauthState
    ? (oauthState as Record<string, unknown>)[INVITE_OAUTH_STATE_KEY]
    : undefined;
  const value = typeof token === "string" ? token.trim() : undefined;

  inviteLog("oauth-state", "read invite from request OAuth state", {
    path: hookCtx.path,
    token: value,
    hasOAuthState: Boolean(oauthState),
  });

  return value || undefined;
}

/**
 * Read the invite token from the hook context.
 * @param hookCtx - The hook context.
 * @returns The invite token.
 */
export async function readInviteTokenFromHookContext(
  hookCtx: unknown,
): Promise<string | undefined> {
  if (!hookCtx || typeof hookCtx !== "object") {
    inviteLog("resolve", "hook context missing or not an object");
    return undefined;
  }

  const ctx = hookCtx as InviteCookieContext;
  const headers = readHeadersFromHookContext(hookCtx);
  const headerToken = readInviteTokenFromHeaders(headers);

  if (headerToken) {
    inviteLog("resolve", "using invite from header", {
      path: ctx.path,
      token: headerToken,
    });
    return headerToken;
  }

  const cookieToken = await readPendingInviteCookie(ctx);
  if (cookieToken) {
    inviteLog("resolve", "using invite from pending cookie", {
      path: ctx.path,
      token: cookieToken,
    });
    return cookieToken;
  }

  const oauthToken = await readInviteFromOAuthState(ctx);
  if (oauthToken) {
    inviteLog("resolve", "using invite from OAuth state", {
      path: ctx.path,
      token: oauthToken,
    });
    return oauthToken;
  }

  const cookieInfo = describeCookieHeader(ctx.request);
  inviteLog("resolve", "no invite token found", {
    path: ctx.path,
    hasRequest: Boolean(ctx.request),
    hasCreateAuthCookie: Boolean(ctx.context?.createAuthCookie),
    hasGetCookie: typeof ctx.getCookie === "function",
    headerNames: headers
      ? [...headers.keys()].filter((k) => k.toLowerCase() === INVITE_HEADER)
      : [],
    requestCookiePresent: cookieInfo.present,
    requestCookieNames: cookieInfo.names,
  });

  return undefined;
}

/**
 * Read-only invite check (no DB write). Used before OAuth redirect.
 * @param token - The invite token.
 * @returns The invite token.
 * @throws {APIError} - If the invite token is invalid.
 * @throws {APIError} - If the invite token has already been used.
 * @throws {APIError} - If the invite token has expired.
 * @throws {APIError} - If the invite token is required.
 */
export async function validateInviteToken(token: string | undefined): Promise<void> {
  if (!token?.trim()) {
    throw new APIError("BAD_REQUEST", { message: "Invite token is required" });
  }

  const row = await prisma.inviteToken.findUnique({
    where: { token: token.trim() },
  });

  if (!row) {
    throw new APIError("FORBIDDEN", { message: "Invalid invite token" });
  }

  if (row.used) {
    throw new APIError("FORBIDDEN", { message: "Invite token has already been used" });
  }

  if (row.expiresAt <= new Date()) {
    throw new APIError("FORBIDDEN", { message: "Invite token has expired" });
  }

  inviteLog("validate", "invite token ok", { token: token.trim() });
}

/**
 * Atomically validates and marks an invite as used (check + consume in one step).
 * Safe under concurrent sign-ups for the same token.
 * @param token - The invite token.
 * @param userId - The user ID.
 * @returns The invite token.
 */
export async function consumeInviteToken(
  token: string | undefined,
  userId?: string,
): Promise<void> {
  if (!token?.trim()) {
    inviteLog("consume", "rejected — token missing", { userId });
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
    inviteLog("consume", "rejected — invalid or already used", {
      token: token.trim(),
      userId,
      count: result.count,
    });
    throw new APIError("FORBIDDEN", {
      message: "Invalid, expired, or already used invite token",
    });
  }

  inviteLog("consume", "invite consumed", { token: token.trim(), userId });
}

/**
 * Create an invite token.
 * @param expiresAt - Numbers of days until the invite token will expire.
 */
export async function createInviteToken(expiresAt: number) {
  const token = createToken();
  const date = new Date();
  date.setDate(date.getDate() + expiresAt);
  const invite = await prisma.inviteToken.create({
    data: {
      token,
      expiresAt: date,
    },
  });
  return invite;
}
