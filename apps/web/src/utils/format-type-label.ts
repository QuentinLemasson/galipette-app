/**
 * Presentation helpers for entity-type discriminators.
 */

/**
 * @description Turns a raw entity-type discriminator (e.g. `damage-type`) into a
 *   human-readable, capitalized label (`Damage type`). Handles kebab-case,
 *   snake_case, and camelCase inputs.
 * @param type - Raw entity type as authored in front matter.
 * @returns Capitalized, space-separated label suitable for display.
 */
export function formatTypeLabel(type: string): string {
  if (!type) {
    return "";
  }

  const normalized = type
    .replace(/[-_]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .trim();

  if (normalized.length === 0) {
    return "";
  }

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}
