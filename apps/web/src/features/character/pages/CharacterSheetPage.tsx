/**
 * Character + sheet editor: loads one character and PATCHes changes (KISS forms + fetch).
 */

import { Alert, AlertDescription } from "@galipette/ui/components/alert";
import { Button } from "@galipette/ui/components/button";
import { InlineCode } from "@galipette/ui/components/inline-code";
import { Input } from "@galipette/ui/components/input";
import { Typography } from "@galipette/ui/components/typography";
import { cn } from "@galipette/ui/lib/utils";
import { Link } from "@tanstack/react-router";
import { useMemo, useCallback, useEffect, useState, type FormEvent } from "react";

import { fetchCharacter, patchCharacter, type CharacterDto } from "../api";
import { getSkillSelectOptions, SKILL_OPTION_ENTITY_TYPE } from "../skill-select-options";

export type CharacterSheetPageProps = {
  characterId: string;
};

const pageClass = "flex max-w-2xl flex-col gap-4";
const linkClass = "text-sm font-medium text-primary hover:underline";
const fieldClass = "flex flex-col gap-1.5 text-sm";
const labelClass = "font-medium text-foreground";
const textareaClass = cn(
  "flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 font-mono text-sm shadow-xs outline-none",
  "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
  "disabled:pointer-events-none disabled:opacity-50 dark:bg-input/30",
);

function formStateFromCharacter(c: CharacterDto) {
  return {
    row: c,
    name: c.name,
    player: c.player,
    attrsJson: JSON.stringify(c.sheet?.attributes ?? {}, null, 2),
    skillIds: [...(c.sheet?.skillIds ?? [])],
  };
}

function toggleSkillId(ids: string[], id: string, checked: boolean): string[] {
  if (checked) {
    return ids.includes(id) ? ids : [...ids, id];
  }
  return ids.filter((x) => x !== id);
}

export function CharacterSheetPage({ characterId }: CharacterSheetPageProps) {
  const skillOptions = useMemo(() => getSkillSelectOptions(), []);
  const optionIdSet = useMemo(() => new Set(skillOptions.map((o) => o.id)), [skillOptions]);

  const [row, setRow] = useState<CharacterDto | null>(null);
  const [name, setName] = useState("");
  const [player, setPlayer] = useState("");
  const [attrsJson, setAttrsJson] = useState("{}");
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const orphanSkillIds = useMemo(
    () => selectedSkillIds.filter((id) => !optionIdSet.has(id)),
    [selectedSkillIds, optionIdSet],
  );

  const reload = useCallback(
    async (showSpinner: boolean) => {
      if (showSpinner) setLoading(true);
      try {
        const c = await fetchCharacter(characterId);
        const next = formStateFromCharacter(c);
        setRow(next.row);
        setName(next.name);
        setPlayer(next.player);
        setAttrsJson(next.attrsJson);
        setSelectedSkillIds(next.skillIds);
        setError(null);
        setSaveMessage(null);
      } catch (e: unknown) {
        setRow(null);
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    },
    [characterId],
  );

  useEffect(() => {
    let cancelled = false;
    fetchCharacter(characterId)
      .then((c) => {
        if (cancelled) return;
        const next = formStateFromCharacter(c);
        setRow(next.row);
        setName(next.name);
        setPlayer(next.player);
        setAttrsJson(next.attrsJson);
        setSelectedSkillIds(next.skillIds);
        setError(null);
        setSaveMessage(null);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setRow(null);
        setError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [characterId]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaveMessage(null);
    let attributes: Record<string, number>;
    try {
      const parsed = JSON.parse(attrsJson) as unknown;
      if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("Attributes must be a JSON object.");
      }
      attributes = parsed as Record<string, number>;
      for (const [k, v] of Object.entries(attributes)) {
        if (typeof v !== "number" || Number.isNaN(v)) {
          throw new Error(`Attribute "${k}" must be a number.`);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON for attributes.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const updated = await patchCharacter(characterId, {
        name,
        player,
        sheet: { attributes, skillIds: selectedSkillIds },
      });
      setRow(updated);
      const next = formStateFromCharacter(updated);
      setName(next.name);
      setPlayer(next.player);
      setAttrsJson(next.attrsJson);
      setSelectedSkillIds(next.skillIds);
      setSaveMessage("Saved.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className={pageClass}>
        <Typography variant="muted">Loading character…</Typography>
      </section>
    );
  }

  if (error !== null && row === null) {
    return (
      <section className={pageClass}>
        <Link to="/app/characters" className={linkClass}>
          ← Characters
        </Link>
        <Typography variant="h1" as="h1">
          Character
        </Typography>
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </section>
    );
  }

  return (
    <section className={pageClass}>
      <Link to="/app/characters" className={linkClass}>
        ← Characters
      </Link>
      <Typography variant="h1" as="h1">
        {row?.name ?? "Character"}
      </Typography>
      <Typography variant="muted">
        <InlineCode>
          GET/PATCH /api/characters/{characterId}
        </InlineCode>
      </Typography>

      {saveMessage !== null ? (
        <Typography variant="body" className="text-primary">
          {saveMessage}
        </Typography>
      ) : null}
      {error !== null ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <form className="flex max-w-xl flex-col gap-4" onSubmit={onSubmit}>
        <label className={fieldClass}>
          <span className={labelClass}>Name</span>
          <Input value={name} onChange={(ev) => setName(ev.target.value)} required minLength={1} />
        </label>
        <label className={fieldClass}>
          <span className={labelClass}>Player</span>
          <Input
            value={player}
            onChange={(ev) => setPlayer(ev.target.value)}
            required
            minLength={1}
          />
        </label>
        <label className={fieldClass}>
          <span className={labelClass}>Sheet attributes (JSON object: string → number)</span>
          <textarea
            className={textareaClass}
            value={attrsJson}
            onChange={(ev) => setAttrsJson(ev.target.value)}
            rows={8}
            spellCheck={false}
          />
        </label>

        <fieldset className="rounded-lg border border-border bg-card p-4">
          <legend className="px-1 text-sm font-semibold text-foreground">
            Skills{" "}
            <span className="font-normal text-muted-foreground">
              (compiled <InlineCode>{SKILL_OPTION_ENTITY_TYPE}</InlineCode> entities)
            </span>
          </legend>
          {skillOptions.length === 0 ? (
            <Typography variant="muted" className="mt-2">
              No compiled spells in the bundle. Run the content builder so entities exist for this
              type.
            </Typography>
          ) : (
            <div
              className="mt-3 flex max-h-[280px] flex-col gap-1.5 overflow-y-auto"
              role="group"
              aria-label="Skill selection"
            >
              {skillOptions.map((opt) => (
                <label key={opt.id} className="flex cursor-pointer items-center gap-2.5 text-sm">
                  <input
                    type="checkbox"
                    className="size-4 shrink-0"
                    checked={selectedSkillIds.includes(opt.id)}
                    onChange={(ev) =>
                      setSelectedSkillIds((prev) => toggleSkillId(prev, opt.id, ev.target.checked))
                    }
                  />
                  <span className="flex-1">{opt.name}</span>
                  <InlineCode className="max-w-[42%] truncate">{opt.id}</InlineCode>
                </label>
              ))}
            </div>
          )}
          {orphanSkillIds.length > 0 ? (
            <div className="mt-3 border-t border-dashed border-border pt-3">
              <Typography variant="muted">
                Selected ids not present in the current spell catalog (uncheck to remove):
              </Typography>
              <div className="mt-2 flex max-h-[280px] flex-col gap-1.5 overflow-y-auto">
                {orphanSkillIds.map((id) => (
                  <label key={id} className="flex cursor-pointer items-center gap-2.5 text-sm">
                    <input
                      type="checkbox"
                      className="size-4 shrink-0"
                      checked
                      onChange={(ev) =>
                        setSelectedSkillIds((prev) => toggleSkillId(prev, id, ev.target.checked))
                      }
                    />
                    <InlineCode>{id}</InlineCode>
                  </label>
                ))}
              </div>
            </div>
          ) : null}
        </fieldset>

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
          <Button type="button" variant="outline" disabled={saving} onClick={() => void reload(true)}>
            Reload
          </Button>
        </div>
      </form>
    </section>
  );
}
