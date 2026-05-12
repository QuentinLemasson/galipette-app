/**
 * Search params for `/not-found` (broken wikilink context).
 */

export type NotFoundSearch = {
  operand?: string;
  link?: string;
};

export function parseNotFoundSearch(raw: Record<string, unknown>): NotFoundSearch {
  return {
    operand: typeof raw.operand === "string" ? raw.operand : undefined,
    link: typeof raw.link === "string" ? raw.link : undefined,
  };
}
