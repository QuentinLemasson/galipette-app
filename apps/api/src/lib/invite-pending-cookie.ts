import { symmetricDecrypt, symmetricEncrypt } from "better-auth/crypto";
import type { SymmetricEncryptOptions } from "better-auth/crypto";
import { inviteLog } from "./invite-logger.js";

/** Logical cookie name passed to `createAuthCookie` (Better Auth adds prefix). */
export const INVITE_PENDING_COOKIE_NAME = "invite_pending";

const PENDING_INVITE_MAX_AGE_SEC = 600;

type AuthSecret = SymmetricEncryptOptions["key"];

export type InviteCookieContext = {
  path?: string;
  context?: {
    createAuthCookie: (
      name: string,
      options?: Record<string, unknown>,
    ) => { name: string; attributes: Record<string, unknown> };
    secretConfig?: AuthSecret;
    secret?: string;
  };
  setCookie?: (name: string, value: string, attributes: Record<string, unknown>) => void;
  getCookie?: (name: string) => string | undefined;
  request?: Request;
  headers?: Headers;
};

function isApiHttps(): boolean {
  return (process.env.BETTER_AUTH_URL ?? "").startsWith("https://");
}

function pendingInviteCookieAttributes(): Record<string, unknown> {
  const crossSite = isApiHttps();
  // Cross-origin web (5173) → API (3001): None+Secure on HTTPS; lax on local HTTP.
  // Browsers treat http://localhost as a secure context for Secure cookies.
  return {
    maxAge: PENDING_INVITE_MAX_AGE_SEC,
    path: "/api/auth",
    sameSite: crossSite ? "none" : "lax",
    secure: crossSite,
    httpOnly: true,
  };
}

function getAuthSecret(ctx?: InviteCookieContext): AuthSecret {
  const secret =
    ctx?.context?.secretConfig ?? ctx?.context?.secret ?? process.env.BETTER_AUTH_SECRET;
  if (!secret) {
    throw new Error("BETTER_AUTH_SECRET is required for invite pending cookies");
  }
  return secret;
}

function createPendingInviteCookieDef(ctx: InviteCookieContext) {
  if (!ctx.context?.createAuthCookie) {
    throw new Error("Better Auth cookie context is required");
  }
  return ctx.context.createAuthCookie(INVITE_PENDING_COOKIE_NAME, pendingInviteCookieAttributes());
}

function getCookieFromRequest(request: Request, cookieName: string): string | undefined {
  const header = request.headers.get("cookie");
  if (!header) return undefined;

  for (const segment of header.split(";")) {
    const trimmed = segment.trim();
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const name = trimmed.slice(0, eq);
    if (name === cookieName) {
      return decodeURIComponent(trimmed.slice(eq + 1));
    }
  }

  return undefined;
}

export function describeCookieHeader(request: Request | undefined): {
  present: boolean;
  names: string[];
} {
  const header = request?.headers.get("cookie");
  if (!header) return { present: false, names: [] };
  const names = header
    .split(";")
    .map((s) => s.trim().split("=")[0])
    .filter(Boolean);
  return { present: true, names };
}

async function encryptInviteToken(secret: AuthSecret, token: string): Promise<string> {
  return symmetricEncrypt({
    key: secret,
    data: JSON.stringify({ token }),
  });
}

async function decryptInviteToken(
  secret: AuthSecret,
  encrypted: string,
): Promise<string | undefined> {
  try {
    const payload = await symmetricDecrypt({ key: secret, data: encrypted });
    const parsed = JSON.parse(payload) as { token?: string };
    return typeof parsed.token === "string" ? parsed.token : undefined;
  } catch {
    return undefined;
  }
}

export async function setPendingInviteCookie(
  ctx: InviteCookieContext,
  token: string,
): Promise<void> {
  if (!ctx.setCookie) {
    throw new Error("setCookie is required to store pending invite");
  }

  const secret = getAuthSecret(ctx);
  const cookie = createPendingInviteCookieDef(ctx);
  const encrypted = await encryptInviteToken(secret, token);
  ctx.setCookie(cookie.name, encrypted, cookie.attributes);
  inviteLog("cookie", "set pending invite cookie", {
    path: ctx.path,
    cookieName: cookie.name,
    attributes: cookie.attributes,
    token,
  });
}

export async function readPendingInviteCookie(
  ctx: InviteCookieContext,
): Promise<string | undefined> {
  const secret = getAuthSecret(ctx);
  const cookieNames: string[] = [];

  let encrypted: string | undefined;
  let source: "getCookie" | "request" | "fuzzy" | undefined;

  if (ctx.context?.createAuthCookie) {
    const cookie = createPendingInviteCookieDef(ctx);
    cookieNames.push(cookie.name);
    encrypted = ctx.getCookie?.(cookie.name);
    if (encrypted) source = "getCookie";
    if (!encrypted && ctx.request) {
      encrypted = getCookieFromRequest(ctx.request, cookie.name);
      if (encrypted) source = "request";
    }
  } else if (ctx.request) {
    const header = ctx.request.headers.get("cookie") ?? "";
    const match = header
      .split(";")
      .map((s) => s.trim())
      .find((s) => s.includes(INVITE_PENDING_COOKIE_NAME));
    if (match) {
      cookieNames.push(match.split("=")[0] ?? INVITE_PENDING_COOKIE_NAME);
      const eq = match.indexOf("=");
      if (eq !== -1) {
        encrypted = decodeURIComponent(match.slice(eq + 1));
        source = "fuzzy";
      }
    }
  }

  const { present, names } = describeCookieHeader(ctx.request);
  inviteLog("cookie", "read pending invite cookie", {
    path: ctx.path,
    expectedNames: cookieNames,
    source,
    hasEncryptedValue: Boolean(encrypted),
    requestCookiePresent: present,
    requestCookieNames: names,
  });

  if (!encrypted) return undefined;

  const token = await decryptInviteToken(secret, encrypted);
  inviteLog("cookie", "decrypted pending invite cookie", {
    path: ctx.path,
    token,
    decryptOk: Boolean(token),
  });
  return token;
}

export function clearPendingInviteCookie(ctx: InviteCookieContext): void {
  if (!ctx.setCookie || !ctx.context?.createAuthCookie) {
    inviteLog("cookie", "clear skipped (no setCookie/createAuthCookie)", { path: ctx.path });
    return;
  }

  const cookie = createPendingInviteCookieDef(ctx);
  ctx.setCookie(cookie.name, "", { ...cookie.attributes, maxAge: 0 });
  inviteLog("cookie", "cleared pending invite cookie", {
    path: ctx.path,
    cookieName: cookie.name,
  });
}
