/**
 * Recursively lists Markdown files under a vault subfolder using fast-glob.
 */

import fg from "fast-glob";
import { resolve } from "node:path";
import { stat } from "node:fs/promises";

/**
 * Returns sorted absolute paths to every `.md` file under `vaultPath/subFolder`.
 *
 * @param vaultPath - Absolute path to the vault root.
 * @param subFolder - Path segment(s) relative to the vault to scan.
 * @returns Sorted list of absolute file paths.
 * @throws Error if the target folder is missing or not a directory.
 */
export async function scanVault(vaultPath: string, subFolder: string): Promise<string[]> {
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
