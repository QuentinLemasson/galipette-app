import { posix as pathPosix } from "node:path";

import type { FolderIndexFrontmatter, ParsedMarkdownFile } from "@galipette/content-schema";
import { z } from "zod";

const folderIndexFrontmatterSchema = z
  .object({
    name: z.string().min(1),
  })
  .strict();

/**
 * Normalizes a vault path to a consistent format.
 * @param input - The input path to normalize.
 * @returns The normalized path.
 */
export function normalizeVaultPath(input: string): string {
  const trimmed = input.trim();
  if (trimmed === "." || trimmed === "") {
    return "";
  }
  const normalized = trimmed.replaceAll("\\", "/").replace(/^\/+|\/+$/g, "");
  return normalized === "." ? "" : normalized;
}

/**
 * Extracts the parent folder path from a note path.
 * @param sourcePath - The source path to extract the parent folder from.
 * @returns The parent folder path.
 */
export function folderPathFromNotePath(sourcePath: string): string {
  const normalized = normalizeVaultPath(sourcePath);
  const parent = pathPosix.dirname(normalized);
  return parent === "." ? "" : parent;
}

/**
 * Checks if a file is a folder index file.
 * @param sourcePath - The source path to check.
 * @returns True if the file is a folder index file, false otherwise.
 */
export function isFolderIndexFile(sourcePath: string): boolean {
  const normalized = normalizeVaultPath(sourcePath);
  return pathPosix.basename(normalized) === "_index.md";
}

/**
 * Parses the frontmatter of a folder index file.
 * @param parsedFile - The parsed file to parse the frontmatter of.
 * @returns The parsed frontmatter.
 */
export function parseFolderIndexFrontmatter(
  parsedFile: ParsedMarkdownFile,
): FolderIndexFrontmatter {
  const result = folderIndexFrontmatterSchema.safeParse(parsedFile.frontmatter);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid _index frontmatter in "${parsedFile.sourcePath}": ${details}`);
  }
  return result.data;
}
