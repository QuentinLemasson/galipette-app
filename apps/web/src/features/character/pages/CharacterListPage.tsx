/**
 * Lists characters from the HTTP API (simple fetch smoke test).
 */

import { Alert, AlertDescription } from "@galipette/ui/components/alert";
import { InlineCode } from "@galipette/ui/components/inline-code";
import { Typography } from "@galipette/ui/components/typography";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { fetchCharacters, type CharacterDto } from "../api";

const pageClass = "flex max-w-2xl flex-col gap-4";
const linkClass = "font-medium text-primary hover:underline";

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
      <section className={pageClass}>
        <Typography variant="muted">Loading characters…</Typography>
      </section>
    );
  }

  if (error !== null) {
    return (
      <section className={pageClass}>
        <Typography variant="h1" as="h1">
          Characters
        </Typography>
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Typography variant="muted">
          Is the API running (<InlineCode>pnpm dev:api</InlineCode>) and is{" "}
          <InlineCode>VITE_API_ORIGIN</InlineCode> (API running, CORS + session cookie)?
        </Typography>
      </section>
    );
  }

  return (
    <section className={pageClass}>
      <Typography variant="h1" as="h1">
        Characters
      </Typography>
      <Typography variant="muted">
        Data from <InlineCode>GET /api/characters</InlineCode>.
      </Typography>
      {rows !== null && rows.length === 0 ? (
        <Typography variant="body">No characters yet. Create one via the API or Prisma Studio.</Typography>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {rows?.map((c) => (
            <li key={c.id}>
              <Link to="/app/characters/$characterId" params={{ characterId: c.id }} className={linkClass}>
                <strong className="text-foreground">{c.name}</strong>
                <span className="font-normal text-muted-foreground"> — {c.player}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
