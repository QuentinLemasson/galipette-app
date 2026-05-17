/**
 * Reads a Markdown file and splits YAML front matter from body content.
 */

import { readFile } from "node:fs/promises";
import { relative } from "node:path";

import type { ParsedMarkdownFile } from "@galipette/content-schema";
import matter from "gray-matter";

/**
 * Normalizes Windows-style separators to forward slashes for stable JSON output.
 *
 * @param path - Relative or absolute path string.
 * @returns Path using `/` separators only.
 */
function normalizePathSeparators(path: string): string {
  return path.replaceAll("\\", "/");
}

/**
 * Loads a note from disk and returns front matter, trimmed body, and vault-relative path.
 *
 * @param absolutePath - Absolute path to the Markdown file.
 * @param vaultPath - Absolute path to the vault root (used for `sourcePath`).
 * @returns Parsed structure suitable for validation and link extraction.
 * @throws Error when front matter is missing or not a YAML mapping object.
 */
export async function parseFile(
  absolutePath: string,
  vaultPath: string,
): Promise<ParsedMarkdownFile> {
  const sourceText = await readFile(absolutePath, "utf8");
  const { data, content } = matter(sourceText);

  if (!data || Array.isArray(data) || typeof data !== "object") {
    throw new Error(`Invalid frontmatter in "${absolutePath}".`);
  }

  return {
    absolutePath,
    sourcePath: normalizePathSeparators(relative(vaultPath, absolutePath)),
    frontmatter: data,
    content: content.trim(),
  };
}
