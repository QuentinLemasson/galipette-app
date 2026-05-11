/**
 * Builds URL-friendly entity slugs from vault-relative paths and {@link WIKI_NAMESPACE}.
 */

import slugify from "slugify";

const DEFAULT_WIKI_NAMESPACE = "wiki";

const MARKDOWN_EXT = /\.(?:md|markdown)$/i;

/** Shared slugify options: lowercase ASCII slugs, strip unsafe characters. */
const SLUG_OPTIONS = {
  lower: true,
  strict: true,
  trim: true,
} as const;

/**
 * Reads `WIKI_NAMESPACE` from the environment (after {@link loadEnv}); defaults to `"wiki"`.
 */
export function getWikiNamespace(): string {
  const raw = process.env.WIKI_NAMESPACE?.trim();
  return raw && raw.length > 0 ? raw : DEFAULT_WIKI_NAMESPACE;
}

function stripMarkdownExtension(vaultRelativePath: string): string {
  return vaultRelativePath.replace(MARKDOWN_EXT, "");
}

function slugifyPathSegments(vaultRelativePathWithoutExt: string): string[] {
  const segments = vaultRelativePathWithoutExt.split("/").filter(Boolean);
  return segments.map((segment) => slugify(segment, SLUG_OPTIONS));
}

/**
 * Produces `{namespace}/{slugified/path}` from the vault-relative Obsidian path, unless the path’s
 * first segment already matches the slugified `WIKI_NAMESPACE` (e.g. `wiki/notes/foo.md` → no duplicate `wiki/` prefix).
 * Forward slashes are kept as hierarchy separators; each segment is normalized with `slugify`.
 * File extensions `.md` / `.markdown` are removed before slugifying.
 *
 * @param vaultRelativeSourcePath - Path relative to the vault root (e.g. `notes/My Page.md`).
 */
export function generateEntitySlug(vaultRelativeSourcePath: string): string {
  const namespaceSegment = slugify(getWikiNamespace(), SLUG_OPTIONS);
  const withoutExt = stripMarkdownExtension(vaultRelativeSourcePath.trim());
  const slugSegments = slugifyPathSegments(withoutExt);
  const pathPart = slugSegments.join("/");

  if (slugSegments.length > 0 && slugSegments[0] === namespaceSegment) {
    return pathPart.length > 0 ? pathPart : namespaceSegment;
  }

  return pathPart.length > 0
    ? `${namespaceSegment}/${pathPart}`
    : namespaceSegment;
}
