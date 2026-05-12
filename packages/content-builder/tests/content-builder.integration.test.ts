import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { buildContent } from "../src/index.ts";
import { createTempVault, writeVaultMarkdown } from "./helpers/tempVault.ts";

describe("content builder (integration)", () => {
  it("builds compiled entities json on happy path", async () => {
    const temp = await createTempVault();

    try {
      await writeVaultMarkdown(
        temp.scanFolder,
        "spell.md",
        `---
id: spell.lightning-shot
type: spell
name: Tir de Foudre
damage:
  type: damage.lightning
  amount: 6
afflictions:
  - affliction.stunned
---
# Tir de Foudre

Un projectile electrique.
`,
      );

      const result = await buildContent({
        vaultPath: temp.vaultPath,
        subFolder: "entities",
        outputFilePath: join(temp.rootPath, "compiled-content", "entities.json"),
      });

      expect(result.entities).toHaveLength(1);
      expect(result.entities[0]).toMatchObject({
        id: "spell.lightning-shot",
        type: "spell",
        name: "Tir de Foudre",
        slug: "wiki/entities/spell",
        sourcePath: "entities/spell.md",
        data: {
          damage: {
            type: "damage.lightning",
            amount: 6,
          },
          afflictions: ["affliction.stunned"],
        },
      });

      const output = await readFile(
        join(temp.rootPath, "compiled-content", "entities.json"),
        "utf8",
      );
      expect(JSON.parse(output)).toHaveLength(1);

      const graphOutput = await readFile(
        join(temp.rootPath, "compiled-content", "graph.json"),
        "utf8",
      );
      const graph = JSON.parse(graphOutput) as {
        nodes: Array<{ id: string; type: string; label: string; sourcePath: string }>;
        edges: [string, string][];
      };
      expect(graph.nodes).toHaveLength(1);
      expect(graph.nodes[0]).toMatchObject({
        id: "spell.lightning-shot",
        type: "spell",
        label: "Tir de Foudre",
        sourcePath: "entities/spell.md",
      });
      expect(graph.edges).toEqual([]);

      const slugIndexOutput = await readFile(
        join(temp.rootPath, "compiled-content", "slug-index.json"),
        "utf8",
      );
      const slugIndex = JSON.parse(slugIndexOutput) as {
        slugToId: Record<string, string>;
        idToSlug: Record<string, string>;
      };
      expect(slugIndex.slugToId["wiki/entities/spell"]).toBe("spell.lightning-shot");
      expect(slugIndex.idToSlug["spell.lightning-shot"]).toBe("wiki/entities/spell");

      expect(result.slugIndex).toEqual(slugIndex);

      expect(result.brokenWikiLinks).toEqual([]);

      const brokenOutput = await readFile(
        join(temp.rootPath, "compiled-content", "broken-links.json"),
        "utf8",
      );
      expect(JSON.parse(brokenOutput)).toEqual([]);

      expect(result.diagnostics.brokenLinksFilePath).toBe(
        join(temp.rootPath, "compiled-content", "broken-links.json"),
      );
    } finally {
      await temp.cleanup();
    }
  });

  it("fails when id is missing", async () => {
    const temp = await createTempVault();
    try {
      await writeVaultMarkdown(
        temp.scanFolder,
        "invalid.md",
        `---
type: affliction
name: Stunned
---
# Stunned
`,
      );

      await expect(
        buildContent({
          vaultPath: temp.vaultPath,
          subFolder: "entities",
          outputFilePath: join(temp.rootPath, "compiled-content", "entities.json"),
        }),
      ).rejects.toThrow("Validation failed");
    } finally {
      await temp.cleanup();
    }
  });

  it("fails when type is invalid", async () => {
    const temp = await createTempVault();
    try {
      await writeVaultMarkdown(
        temp.scanFolder,
        "invalid-type.md",
        `---
id: entity.unknown
type: unknown
name: Unknown
---
# Unknown
`,
      );

      await expect(
        buildContent({
          vaultPath: temp.vaultPath,
          subFolder: "entities",
          outputFilePath: join(temp.rootPath, "compiled-content", "entities.json"),
        }),
      ).rejects.toThrow("Unknown entity type");
    } finally {
      await temp.cleanup();
    }
  });

  it("fails when damage amount is invalid", async () => {
    const temp = await createTempVault();
    try {
      await writeVaultMarkdown(
        temp.scanFolder,
        "invalid-damage.md",
        `---
id: spell.broken
type: spell
name: Broken Spell
damage:
  type: damage.fire
  amount: six
---
# Broken Spell
`,
      );

      await expect(
        buildContent({
          vaultPath: temp.vaultPath,
          subFolder: "entities",
          outputFilePath: join(temp.rootPath, "compiled-content", "entities.json"),
        }),
      ).rejects.toThrow("damage.amount");
    } finally {
      await temp.cleanup();
    }
  });

  it("fails when ids are duplicated", async () => {
    const temp = await createTempVault();
    try {
      const duplicated = `---
id: affliction.stunned
type: affliction
name: Stunned
---
# Stunned
`;

      await writeVaultMarkdown(temp.scanFolder, "a.md", duplicated);
      await writeVaultMarkdown(temp.scanFolder, "b.md", duplicated);

      await expect(
        buildContent({
          vaultPath: temp.vaultPath,
          subFolder: "entities",
          outputFilePath: join(temp.rootPath, "compiled-content", "entities.json"),
        }),
      ).rejects.toThrow('Duplicate id "affliction.stunned"');
    } finally {
      await temp.cleanup();
    }
  });

  it("resolves obsidian links in data and builds references graph", async () => {
    const temp = await createTempVault();
    try {
      await writeVaultMarkdown(
        temp.scanFolder,
        "spell.md",
        `---
id: spell.lightning-arc
type: spell
name: Lightning Arc
damage:
  type: "[[lightning|damage.lightning]]"
  amount: 2
afflictions:
  - "[[stunned|affliction.stunned]]"
---
# Lightning Arc

Uses wikilinks in frontmatter.
`,
      );
      await writeVaultMarkdown(
        temp.scanFolder,
        "damage.md",
        `---
id: damage.lightning
type: damage-type
name: Lightning
color: "#55aaff"
---
# Lightning
`,
      );

      const result = await buildContent({
        vaultPath: temp.vaultPath,
        subFolder: "entities",
        outputFilePath: join(temp.rootPath, "compiled-content", "entities.json"),
      });

      const spell = result.entities.find((entity) => entity.id === "spell.lightning-arc");
      expect(spell).toBeDefined();
      expect(spell).toMatchObject({
        references: expect.arrayContaining([
          expect.objectContaining({
            operand: "lightning",
            refSources: expect.arrayContaining(["frontMatter"]),
            targetLabel: "Lightning",
            targetEntityId: "damage.lightning",
            targetEntitySlug: "wiki/entities/damage",
          }),
          expect.objectContaining({
            operand: "stunned",
            refSources: expect.arrayContaining(["frontMatter"]),
            targetLabel: "stunned",
          }),
        ]),
        data: {
          damage: {
            type: "damage.lightning",
            amount: 2,
          },
          afflictions: ["affliction.stunned"],
        },
      });

      expect(result.graph.edges).toContainEqual(["spell.lightning-arc", "lightning"]);
      expect(result.graph.edges).toContainEqual(["spell.lightning-arc", "stunned"]);

      expect(result.brokenWikiLinks).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            entityId: "spell.lightning-arc",
            operand: "stunned",
            linkText: "stunned",
            origins: expect.arrayContaining(["frontMatter"]),
          }),
        ]),
      );
    } finally {
      await temp.cleanup();
    }
  });

  it("collects wikilinks from markdown body for references without normalizing content", async () => {
    const temp = await createTempVault();
    try {
      await writeVaultMarkdown(
        temp.scanFolder,
        "spell.md",
        `---
id: spell.body-only-links
type: spell
name: Body Only
damage:
  type: damage.lightning
  amount: 1
---
See [[display|damage.lightning]] and [[Other|affliction.stunned]] for details.
`,
      );

      const result = await buildContent({
        vaultPath: temp.vaultPath,
        subFolder: "entities",
        outputFilePath: join(temp.rootPath, "compiled-content", "entities.json"),
      });

      const spell = result.entities.find((entity) => entity.id === "spell.body-only-links");
      expect(spell).toBeDefined();
      expect(spell!.references).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            operand: "display",
            refSources: ["body"],
            targetLabel: "display",
          }),
          expect.objectContaining({
            operand: "Other",
            refSources: ["body"],
            targetLabel: "Other",
          }),
        ]),
      );
      expect(spell!.content).toContain("[[display|damage.lightning]]");
      expect(spell!.content).toContain("[[Other|affliction.stunned]]");
      expect(spell!.content).not.toMatch(/^damage\.lightning$/m);
      expect(result.graph.edges).toContainEqual(["spell.body-only-links", "display"]);
      expect(result.graph.edges).toContainEqual(["spell.body-only-links", "Other"]);

      expect(result.brokenWikiLinks).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            entityId: "spell.body-only-links",
            operand: "Other",
            linkText: "affliction.stunned",
            origins: ["markdown"],
          }),
          expect.objectContaining({
            entityId: "spell.body-only-links",
            operand: "display",
            linkText: "damage.lightning",
            origins: ["markdown"],
          }),
        ]),
      );
    } finally {
      await temp.cleanup();
    }
  });
});
