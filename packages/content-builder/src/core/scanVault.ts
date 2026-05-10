import fg from "fast-glob";
import { resolve } from "node:path";
import { stat } from "node:fs/promises";

export async function scanVault(
  vaultPath: string,
  subFolder: string,
): Promise<string[]> {
  const baseDirectory = resolve(vaultPath, subFolder);

  let folderStats;
  try {
    folderStats = await stat(baseDirectory);
  } catch {
    throw new Error(`Vault sub-folder does not exist: "${baseDirectory}".`);
  }

  if (!folderStats.isDirectory()) {
    throw new Error(`Vault sub-folder is not a directory: "${baseDirectory}".`);
  }

  const files = await fg("**/*.md", {
    cwd: baseDirectory,
    absolute: true,
    onlyFiles: true,
    unique: true,
  });

  return files.sort((a, b) => a.localeCompare(b));
}
