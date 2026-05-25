/**
 * API server origin (scheme + host + port), without `/api`.
 *
 * - **Local dev**: set `VITE_API_ORIGIN=http://localhost:3001` (cross-origin).
 * - **Production (Railway)**: leave unset or empty — the web service's Nginx
 *   reverse-proxies `/api/*` to the API over private networking, so same-origin
 *   (`""`) is correct and avoids all cross-site cookie issues.
 */
export function getApiOrigin(): string {
  const raw =
    import.meta.env.VITE_API_ORIGIN ?? import.meta.env.VITE_API_BASE_URL ?? "";
  const trimmed = String(raw).replace(/\/$/, "");
  if (trimmed.endsWith("/api")) {
    return trimmed.slice(0, -4);
  }
  return trimmed;
}

/** Base path for OpenAPI REST routes (`/api/characters`, etc.). */
export function getRestApiBase(): string {
  return `${getApiOrigin()}/api`;
}
