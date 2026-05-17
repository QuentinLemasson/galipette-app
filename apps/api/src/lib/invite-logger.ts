/** OAuth state field carrying the invite through the Discord redirect. */
export const INVITE_OAUTH_STATE_KEY = "galipetteInvite";

function isEnabled(): boolean {
  return process.env.INVITE_DEBUG !== "false";
}

function maskToken(token: string | undefined): string | undefined {
  if (!token) return undefined;
  if (token.length <= 8) return "***";
  return `${token.slice(0, 4)}…${token.slice(-4)} (${token.length} chars)`;
}

function redact(value: unknown): unknown {
  if (value == null) return value;
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(redact);
  if (typeof value !== "object") return value;

  const out: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    if (
      key === "token" ||
      key === "inviteToken" ||
      key === "headerToken" ||
      key === "cookieToken" ||
      key === "oauthStateToken" ||
      key === INVITE_OAUTH_STATE_KEY
    ) {
      out[key] = maskToken(typeof entry === "string" ? entry : undefined);
    } else if (key === "cookie" || key === "cookieHeader") {
      out[key] =
        typeof entry === "string"
          ? entry.replace(/=([^;]+)/g, "=***")
          : entry;
    } else {
      out[key] = redact(entry);
    }
  }
  return out;
}

export function inviteLog(
  phase: string,
  message: string,
  details?: Record<string, unknown>,
): void {
  if (!isEnabled()) return;
  const suffix = details ? ` ${JSON.stringify(redact(details))}` : "";
  console.log(`[invite] ${phase}: ${message}${suffix}`);
}
