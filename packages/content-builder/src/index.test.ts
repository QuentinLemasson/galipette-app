import { describe, expect, it } from "vitest";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { buildContent } from "./index.js";

async function createTempVault(): Promise<{
  rootPath: string;
  vaultPath: string;
  scanFolder: string;
  cleanup: () => Promise<void>;
}> {
  const rootPath = await mkdtemp(join(tmpdir(), "content-builder-"));
  const vaultPath = join(rootPath, "vault");
  const scanFolder = join(vaultPath, "entities");
  await mkdir(scanFolder, { recursive: true });

  return {
    rootPath,
    vaultPath,
    scanFolder,
    cleanup: async () => rm(rootPath, { recursive: true, force: true }),
  };
}

async function writeMarkdown(
  folderPath: string,
  filename: string,
  markdown: string,
): Promise<void> {
  await writeFile(join(folderPath, filename), markdown, "utf8");
}

describe("content builder", () => {
  it("builds compiled entities json on happy path", async () => {
    const temp = await createTempVault();

    try {
      await writeMarkdown(
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
      });

      const output = await readFile(
        join(temp.rootPath, "compiled-content", "entities.json"),
        "utf8",
      );
      expect(JSON.parse(output)).toHaveLength(1);
    } finally {
      await temp.cleanup();
    }
  });

  it("fails when id is missing", async () => {
    const temp = await createTempVault();
    try {
      await writeMarkdown(
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
      await writeMarkdown(
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
      await writeMarkdown(
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

      await writeMarkdown(temp.scanFolder, "a.md", duplicated);
      await writeMarkdown(temp.scanFolder, "b.md", duplicated);

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
});
