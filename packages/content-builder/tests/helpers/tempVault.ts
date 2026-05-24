import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

/**
 * Paths for an isolated fake Obsidian vault used in integration tests.
 */
export type TempVaultFixture = {
  rootPath: string;
  vaultPath: string;
  scanFolder: string;
  cleanup: () => Promise<void>;
};

/**
 * Creates a temporary directory with a vault root and a default `entities` scan folder.
 *
 * @returns Fixture paths and a `cleanup` function that removes the temp tree.
 */
export async function createTempVault(): Promise<TempVaultFixture> {
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

/**
 * Writes a markdown file into the vault folder (relative path segments come from `filename`).
 *
 * @param folderPath - Directory that will contain the file (e.g. scan folder).
 * @param filename - File name including extension.
 * @param markdown - Full file contents.
 */
export async function writeVaultMarkdown(
  folderPath: string,
  filename: string,
  markdown: string,
): Promise<void> {
  const filePath = join(folderPath, filename);
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, markdown, "utf8");
}
