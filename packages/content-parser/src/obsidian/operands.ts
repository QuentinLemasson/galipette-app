/**
 * Operand / display extraction from the inner text of `[[...]]` (brackets excluded).
 */

/**
 * Wikilink resolution token: text before `|`, or the whole inner text when there is no pipe.
 */
export function extractObsidianLinkLeftOperand(linkBody: string): string {
  const trimmed = linkBody.trim();
  const pipeIndex = trimmed.indexOf("|");
  if (pipeIndex === -1) {
    return trimmed;
  }
  return trimmed.slice(0, pipeIndex).trim();
}

/**
 * Human-facing text for front matter substitution: alias after `|`, otherwise the full inner text.
 */
export function extractObsidianLinkDisplay(linkBody: string): string {
  const trimmed = linkBody.trim();
  const pipeIndex = trimmed.indexOf("|");
  if (pipeIndex === -1) {
    return trimmed;
  }
  return trimmed.slice(pipeIndex + 1).trim();
}
