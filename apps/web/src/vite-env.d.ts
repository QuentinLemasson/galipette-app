/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** API server origin without `/api` (e.g. `http://localhost:3001`). */
  readonly VITE_API_ORIGIN?: string;
  /** @deprecated Use `VITE_API_ORIGIN`. */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
