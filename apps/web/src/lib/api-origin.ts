/**
 * API server origin (scheme + host + port), without `/api`.
 * REST clients use `${getApiOrigin()}/api/...`; Better Auth uses `getApiOrigin()` as `baseURL`.
 */
export function getApiOrigin(): string {
  const raw =
    import.meta.env.VITE_API_ORIGIN ??
    import.meta.env.VITE_API_BASE_URL ??
    "http://localhost:3001";
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
