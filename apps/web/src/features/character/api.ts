/**
 * Minimal client for the Galipette HTTP API (KISS: plain fetch, no cache library).
 *
 * Calls the API cross-origin via `VITE_API_ORIGIN` (see `src/lib/api-origin.ts`).
 */

import { getRestApiBase } from "../../lib/api-origin";

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

const fetchOptions: RequestInit = { credentials: "include" };

async function parseError(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { error?: string };
    return body.error ?? res.statusText;
  } catch {
    return await res.text().catch(() => res.statusText);
  }
}

export async function fetchCharacters(): Promise<CharacterDto[]> {
  const res = await fetch(`${getRestApiBase()}/characters`, fetchOptions);
  if (!res.ok) {
    throw new Error(await parseError(res));
  }
  return res.json() as Promise<CharacterDto[]>;
}

export async function fetchCharacter(id: string): Promise<CharacterDto> {
  const res = await fetch(`${getRestApiBase()}/characters/${encodeURIComponent(id)}`, fetchOptions);
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

export async function patchCharacter(id: string, body: CharacterPatchBody): Promise<CharacterDto> {
  const res = await fetch(`${getRestApiBase()}/characters/${encodeURIComponent(id)}`, {
    ...fetchOptions,
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(await parseError(res));
  }
  return res.json() as Promise<CharacterDto>;
}
