/**
 * Maps parsed front matter plus file metadata to a typed, validated entity record.
 */

import { ZodError } from "zod";
import { schemaByType } from "@galipette/content-schema";
import type { CompiledEntity, ParsedMarkdownFile } from "@galipette/content-schema";
import { generateEntitySlug } from "./generateEntitySlug.ts";

/**
 * Validates normalized front matter against the schema for its declared `type`.
 * Shell fields (`id`, `type`, `name`) stay at the root; all other keys sit under `data`.
 *
 * @param frontmatter - YAML object after Obsidian link normalization (not raw strings only).
 * @param file - Parsed file carrying `content` and `sourcePath` for the shell.
 * @returns A validated entity matching the registry schema for that type.
 * @throws Error on unknown type or Zod validation failure with path details.
 */
export function validateEntity(frontmatter: unknown, file: ParsedMarkdownFile): CompiledEntity {
  if (!frontmatter || Array.isArray(frontmatter) || typeof frontmatter !== "object") {
    throw new Error(`Invalid frontmatter in "${file.sourcePath}".`);
  }

  const frontmatterObject = frontmatter as Record<string, unknown>;
  const { id, type, name, ...specificData } = frontmatterObject;

  const mergedCandidate = {
    id,
    type,
    name,
    slug: generateEntitySlug(file.sourcePath),
    data: specificData,
    content: file.content,
    sourcePath: file.sourcePath,
    references: [],
  } as Record<string, unknown>;

  const rawType = mergedCandidate.type;
  if (typeof rawType !== "string" || !(rawType in schemaByType)) {
    throw new Error(`Unknown entity type "${String(rawType)}" in "${file.sourcePath}".`);
  }

  try {
    return schemaByType[rawType].parse(mergedCandidate);
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      const details = error.issues
        .map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`)
        .join("; ");
      throw new Error(`Validation failed in "${file.sourcePath}": ${details}`);
    }
    throw error;
  }
}
