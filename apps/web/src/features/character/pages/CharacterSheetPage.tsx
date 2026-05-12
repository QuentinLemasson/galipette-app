/**
 * Character + sheet editor: loads one character and PATCHes changes (KISS forms + fetch).
 */

import { Link } from "@tanstack/react-router";
import { useMemo, useCallback, useEffect, useState } from "react";
import {
  fetchCharacter,
  patchCharacter,
  type CharacterDto,
} from "../api";
import { getSkillSelectOptions, SKILL_OPTION_ENTITY_TYPE } from "../skill-select-options";

export type CharacterSheetPageProps = {
  characterId: string;
};

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
  const optionIdSet = useMemo(
    () => new Set(skillOptions.map((o) => o.id)),
    [skillOptions],
  );

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

  async function onSubmit(e: React.FormEvent) {
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

    const skillIds = selectedSkillIds;

    setSaving(true);
    setError(null);
    try {
      const updated = await patchCharacter(characterId, {
        name,
        player,
        sheet: { attributes, skillIds },
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
      <section className="character-page">
        <p className="character-page__muted">Loading character…</p>
      </section>
    );
  }

  if (error !== null && row === null) {
    return (
      <section className="character-page">
        <p>
          <Link to="/characters" className="character-page__link">
            ← Characters
          </Link>
        </p>
        <h1>Character</h1>
        <p className="character-page__error" role="alert">
          {error}
        </p>
      </section>
    );
  }

  return (
    <section className="character-page">
      <p>
        <Link to="/characters" className="character-page__link">
          ← Characters
        </Link>
      </p>
      <h1>{row?.name ?? "Character"}</h1>
      <p className="character-page__muted">
        <code>GET/PATCH /characters/{characterId}</code>
      </p>

      {saveMessage !== null ? (
        <p className="character-page__ok">{saveMessage}</p>
      ) : null}
      {error !== null ? (
        <p className="character-page__error" role="alert">
          {error}
        </p>
      ) : null}

      <form className="character-form" onSubmit={onSubmit}>
        <label className="character-form__field">
          <span>Name</span>
          <input
            value={name}
            onChange={(ev) => setName(ev.target.value)}
            required
            minLength={1}
          />
        </label>
        <label className="character-form__field">
          <span>Player</span>
          <input
            value={player}
            onChange={(ev) => setPlayer(ev.target.value)}
            required
            minLength={1}
          />
        </label>
        <label className="character-form__field">
          <span>Sheet attributes (JSON object: string → number)</span>
          <textarea
            value={attrsJson}
            onChange={(ev) => setAttrsJson(ev.target.value)}
            rows={8}
            spellCheck={false}
          />
        </label>

        <fieldset className="character-form__fieldset">
          <legend className="character-form__legend">
            Skills{" "}
            <span className="character-page__muted">
              (compiled <code>{SKILL_OPTION_ENTITY_TYPE}</code> entities —{" "}
              <code>contentRepository.getByType(&quot;{SKILL_OPTION_ENTITY_TYPE}&quot;)</code>
              )
            </span>
          </legend>
          {skillOptions.length === 0 ? (
            <p className="character-page__muted">
              No compiled spells in the bundle. Run the content builder so
              entities exist for this type.
            </p>
          ) : (
            <div
              className="character-form__skill-list"
              role="group"
              aria-label="Skill selection"
            >
              {skillOptions.map((opt) => (
                <label key={opt.id} className="character-form__skill-row">
                  <input
                    type="checkbox"
                    checked={selectedSkillIds.includes(opt.id)}
                    onChange={(ev) =>
                      setSelectedSkillIds((prev) =>
                        toggleSkillId(prev, opt.id, ev.target.checked),
                      )
                    }
                  />
                  <span>{opt.name}</span>
                  <code className="character-form__skill-id">{opt.id}</code>
                </label>
              ))}
            </div>
          )}
          {orphanSkillIds.length > 0 ? (
            <div className="character-form__orphan-skills">
              <p className="character-page__muted">
                Selected ids not present in the current spell catalog (uncheck to
                remove):
              </p>
              <div className="character-form__skill-list">
                {orphanSkillIds.map((id) => (
                  <label key={id} className="character-form__skill-row">
                    <input
                      type="checkbox"
                      checked
                      onChange={(ev) =>
                        setSelectedSkillIds((prev) =>
                          toggleSkillId(prev, id, ev.target.checked),
                        )
                      }
                    />
                    <code>{id}</code>
                  </label>
                ))}
              </div>
            </div>
          ) : null}
        </fieldset>

        <div className="character-form__actions">
          <button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </button>
          <button type="button" disabled={saving} onClick={() => void reload(true)}>
            Reload
          </button>
        </div>
      </form>
    </section>
  );
}
