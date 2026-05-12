import type { Character, CharacterSheet } from "@galipette/database";
import type { CharacterResponse } from "@galipette/shared-schemas";

function asAttributes(value: unknown): Record<string, number> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, number>;
  }
  return {};
}

export function serializeCharacter(
  row: Character & { sheet: CharacterSheet | null },
): CharacterResponse {
  return {
    id: row.id,
    name: row.name,
    player: row.player,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    sheet: row.sheet
      ? {
          id: row.sheet.id,
          characterId: row.sheet.characterId,
          attributes: asAttributes(row.sheet.attributes),
          skillIds: row.sheet.skillIds,
          createdAt: row.sheet.createdAt.toISOString(),
          updatedAt: row.sheet.updatedAt.toISOString(),
        }
      : null,
  };
}
