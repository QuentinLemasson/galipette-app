/**
 * Search params for `/login` (invite invite + post-auth redirect).
 */

export type LoginSearch = {
  invite?: string;
  redirect?: string;
};

export function parseLoginSearch(raw: Record<string, unknown>): LoginSearch {
  return {
    invite:
      typeof raw.invite === "string" && raw.invite.trim().length > 0
        ? raw.invite.trim()
        : undefined,
    redirect:
      typeof raw.redirect === "string" && raw.redirect.trim().length > 0
        ? raw.redirect.trim()
        : undefined,
  };
}
