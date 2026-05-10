/**
 * Extracts the stored operand from the inner text of an Obsidian wikilink (without brackets).
 * With a pipe, the left segment is returned; without a pipe, the whole trimmed text is used.
 *
 * @param linkBody - Text between `[[` and `]]`, may contain one optional `|` alias separator.
 * @returns Trimmed left operand or full label when no pipe exists.
 */
export function extractObsidianLinkLeftOperand(linkBody: string): string {
  const trimmed = linkBody.trim();
  const pipeIndex = trimmed.indexOf("|");
  if (pipeIndex === -1) {
    return trimmed;
  }
  return trimmed.slice(0, pipeIndex).trim();
}
