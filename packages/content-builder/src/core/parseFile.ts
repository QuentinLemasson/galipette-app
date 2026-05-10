import { readFile } from "node:fs/promises";
import { relative } from "node:path";
import matter from "gray-matter";
import type { ParsedMarkdownFile } from "../types/Entity.js";

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
    sourcePath: relative(vaultPath, absolutePath),
    frontmatter: data,
    content: content.trim(),
  };
}
