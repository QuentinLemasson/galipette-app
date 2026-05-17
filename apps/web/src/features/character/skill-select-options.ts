/**
 * Options for the character sheet “skills” multi-select, backed by compiled content.
 *
 * Uses {@link contentRepository.getByType} — today **`spell`** entities are the selectable
 * pool; their canonical **`id`** is what the API persists in `CharacterSheet.skillIds`.
 */

import { contentRepository } from "@galipette/compiled-content";

/** Compiled entity `type` passed to {@link contentRepository.getByType} for skill rows. */
export const SKILL_OPTION_ENTITY_TYPE = "spell" as const;

export type SkillSelectOption = {
  id: string;
  name: string;
};

export function getSkillSelectOptions(): SkillSelectOption[] {
  return contentRepository
    .getByType(SKILL_OPTION_ENTITY_TYPE)
    .map((entity) => ({ id: entity.id, name: entity.name }))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
}
