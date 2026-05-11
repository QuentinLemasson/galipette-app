/**
 * Interactive / flag-driven CLI entry that delegates to {@link buildContent}.
 */

import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { loadEnv } from "../loadEnv";
import {
  graphPathFromEntitiesPath,
} from "../utils/artifactPaths.ts";
import {
  printCliIntro,
  printConfigSummary,
  printFailure,
  printSuccessSummary,
} from "./cliOutput.ts";
import { buildContent } from "../core/buildContent.ts";
import type { BuildContentOptions } from "../types/build.ts";

/**
 * Parses optional `--vault` / `--subfolder` flags and positional vault and subfolder args.
 *
 * @param args - Typically `process.argv.slice(2)` when running as CLI.
 * @returns Parsed optional vault and subfolder strings.
 */
export function parseCliArgs(args: string[]): {
  vaultPathArg?: string;
  subFolderArg?: string;
} {
  const vaultFlag = args.findIndex((arg) => arg === "--vault");
  const subFolderFlag = args.findIndex((arg) => arg === "--subfolder");

  const vaultPathArg = vaultFlag >= 0 ? args[vaultFlag + 1] : args[0];
  const subFolderArg = subFolderFlag >= 0 ? args[subFolderFlag + 1] : args[1];

  return { vaultPathArg, subFolderArg };
}

/**
 * How the vault path was obtained (for CLI messaging only).
 */
export function vaultConfigurationSource(vaultPathArg?: string): "cli" | "env" | "prompt" {
  if (vaultPathArg) {
    return "cli";
  }
  if (process.env.OBSIDIAN_VAULT_PATH) {
    return "env";
  }
  return "prompt";
}

/**
 * Extracts a written error log path from a thrown build error message, if present.
 */
export function errorLogPathFromMessage(message: string): string | undefined {
  const match = message.match(/Error log:\s*(.+?)(?:\r?\n)?$/m);
  return match?.[1]?.trim();
}

/**
 * Resolves vault path and scan subfolder from CLI args, environment variables, or prompts.
 *
 * @param vaultPathArg - Optional vault path from `--vault` or first positional argument.
 * @param subFolderArg - Optional subfolder from `--subfolder` or second positional argument.
 * @returns Resolved {@link BuildContentOptions}.
 */
async function promptForMissingOptions(
  vaultPathArg?: string,
  subFolderArg?: string,
): Promise<BuildContentOptions> {
  const rl = createInterface({ input, output });

  try {
    const envVaultPath = process.env.OBSIDIAN_VAULT_PATH;
    const envSubFolder = process.env.OBSIDIAN_VAULT_SUBFOLDER;

    const vaultPath =
      vaultPathArg ??
      envVaultPath ??
      (await rl.question("Enter Obsidian vault absolute path: ")).trim();
    const subFolder =
      subFolderArg ??
      envSubFolder ??
      (await rl.question("Enter vault sub-folder to scan (default: .): ")).trim() ??
      ".";

    if (!vaultPath) {
      throw new Error("Vault path is required.");
    }

    return {
      vaultPath,
      subFolder: subFolder || ".",
    };
  } finally {
    rl.close();
  }
}

/**
 * Runs an interactive or flag-driven build and prints progress to stdout.
 *
 * @returns Resolves when compilation succeeds; rejects on validation failure.
 */
export async function runCli(): Promise<void> {
  loadEnv();
  printCliIntro();
  const { vaultPathArg, subFolderArg } = parseCliArgs(process.argv.slice(2));
  const configSource = vaultConfigurationSource(vaultPathArg);
  const options = await promptForMissingOptions(vaultPathArg, subFolderArg);
  printConfigSummary({
    vaultPath: options.vaultPath,
    subFolder: options.subFolder,
    source: configSource,
  });

  const result = await buildContent(options);

  printSuccessSummary({
    markdownFiles: result.diagnostics.markdownFilesScanned,
    entityCount: result.entities.length,
    graphNodeCount: result.graph.nodes.length,
    graphEdgeCount: result.graph.edges.length,
    entitiesJsonPath: result.diagnostics.outputFilePath,
    graphJsonPath: graphPathFromEntitiesPath(result.diagnostics.outputFilePath),
    slugIndexJsonPath: result.diagnostics.slugIndexFilePath,
  });
}
