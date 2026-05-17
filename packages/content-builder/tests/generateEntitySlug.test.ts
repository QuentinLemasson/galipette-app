import { describe, expect, it, afterEach } from "vitest";
import { generateEntitySlug, getWikiNamespace } from "../src/core/generateEntitySlug.ts";

describe("generateEntitySlug", () => {
  const originalWikiNs = process.env.WIKI_NAMESPACE;

  afterEach(() => {
    if (originalWikiNs === undefined) {
      delete process.env.WIKI_NAMESPACE;
    } else {
      process.env.WIKI_NAMESPACE = originalWikiNs;
    }
  });

  it("prefixes WIKI_NAMESPACE and slugifies each path segment, stripping .md", () => {
    delete process.env.WIKI_NAMESPACE;
    expect(getWikiNamespace()).toBe("wiki");
    expect(generateEntitySlug("entities/My Spell.md")).toBe("wiki/entities/my-spell");
    expect(generateEntitySlug("notes/sub/Élément.md")).toBe("wiki/notes/sub/element");
  });

  it("honors WIKI_NAMESPACE and slugifies the namespace segment", () => {
    process.env.WIKI_NAMESPACE = "game wiki";
    expect(generateEntitySlug("foo/bar.md")).toBe("game-wiki/foo/bar");
  });

  it("preserves slashes between segments", () => {
    delete process.env.WIKI_NAMESPACE;
    expect(generateEntitySlug("a/b/c.md")).toBe("wiki/a/b/c");
  });

  it("does not duplicate namespace when source path already starts with that segment", () => {
    delete process.env.WIKI_NAMESPACE;
    expect(generateEntitySlug("wiki/compendium/My Page.md")).toBe("wiki/compendium/my-page");
    expect(generateEntitySlug("Wiki/caps-folder/note.md")).toBe("wiki/caps-folder/note");
  });
});
