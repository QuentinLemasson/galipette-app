/**
 * Lists characters from the HTTP API (simple fetch smoke test).
 */

import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fetchCharacters, type CharacterDto } from "../api";

export function CharacterListPage() {
  const [rows, setRows] = useState<CharacterDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchCharacters()
      .then((data) => {
        if (!cancelled) setRows(data);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : String(e));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <section className="character-page">
        <p className="character-page__muted">Loading characters…</p>
      </section>
    );
  }

  if (error !== null) {
    return (
      <section className="character-page">
        <h1>Characters</h1>
        <p className="character-page__error" role="alert">
          {error}
        </p>
        <p className="character-page__muted">
          Is the API running (<code>pnpm dev:api</code>) and is <code>VITE_API_ORIGIN</code> (API
          running, CORS + session cookie)?
        </p>
      </section>
    );
  }

  return (
    <section className="character-page">
      <h1>Characters</h1>
      <p className="character-page__muted">
        Data from <code>GET /api/characters</code>.
      </p>
      {rows !== null && rows.length === 0 ? (
        <p>No characters yet. Create one via the API or Prisma Studio.</p>
      ) : (
        <ul className="character-page__list">
          {rows?.map((c) => (
            <li key={c.id}>
              <Link
                to="/app/characters/$characterId"
                params={{ characterId: c.id }}
                className="character-page__link"
              >
                <strong>{c.name}</strong>
                <span className="character-page__meta"> — {c.player}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
