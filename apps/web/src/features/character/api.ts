/**
 * Minimal client for the Galipette HTTP API (KISS: plain fetch, no cache library).
 *
 * In dev, Vite proxies `/api` → the API server (see `vite.config.ts`). Set
 * `VITE_API_BASE_URL` to call a remote API (no proxy rewrite).
 */

export type CharacterSheetDto = {
  id: string;
  characterId: string;
  attributes: Record<string, number>;
  skillIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type CharacterDto = {
  id: string;
  name: string;
  player: string;
  createdAt: string;
  updatedAt: string;
  sheet: CharacterSheetDto | null;
};

function apiBase(): string {
  const raw = import.meta.env.VITE_API_BASE_URL;
  if (typeof raw === "string" && raw.length > 0) {
    return raw.replace(/\/$/, "");
  }
  return "/api";
}

async function parseError(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { error?: string };
    return body.error ?? res.statusText;
  } catch {
    return await res.text().catch(() => res.statusText);
  }
}

export async function fetchCharacters(): Promise<CharacterDto[]> {
  const res = await fetch(`${apiBase()}/characters`);
  if (!res.ok) {
    throw new Error(await parseError(res));
  }
  return res.json() as Promise<CharacterDto[]>;
}

export async function fetchCharacter(id: string): Promise<CharacterDto> {
  const res = await fetch(`${apiBase()}/characters/${encodeURIComponent(id)}`);
  if (!res.ok) {
    throw new Error(await parseError(res));
  }
  return res.json() as Promise<CharacterDto>;
}

export type CharacterPatchBody = {
  name?: string;
  player?: string;
  sheet?: {
    attributes?: Record<string, number>;
    skillIds?: string[];
  };
};

export async function patchCharacter(
  id: string,
  body: CharacterPatchBody,
): Promise<CharacterDto> {
  const res = await fetch(`${apiBase()}/characters/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(await parseError(res));
  }
  return res.json() as Promise<CharacterDto>;
}
