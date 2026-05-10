import { ZodError } from "zod";
import { schemaByType } from "../schemas/SchemaRegistry.js";
import type { CompiledEntity, ParsedMarkdownFile } from "../types/Entity.js";

export function validateEntity(frontmatter: unknown, file: ParsedMarkdownFile): CompiledEntity {
  if (!frontmatter || Array.isArray(frontmatter) || typeof frontmatter !== "object") {
    throw new Error(`Invalid frontmatter in "${file.sourcePath}".`);
  }

  const mergedCandidate = {
    ...frontmatter,
    content: file.content,
    sourcePath: file.sourcePath,
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
