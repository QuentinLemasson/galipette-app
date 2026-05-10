import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { dirname, resolve } from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { scanVault } from "./core/scanVault.ts";
import { parseFile } from "./core/parseFile.ts";
import { validateEntity } from "./core/validateEntity.ts";
import { writeCompiledContent } from "./core/writeCompiledContent.ts";
import type { CompiledEntity } from "./types/Entity.ts";

export type BuildContentOptions = {
  vaultPath: string;
  subFolder: string;
  outputFilePath?: string;
};

type BuildDiagnostics = {
  markdownFilesScanned: number;
  outputFilePath: string;
  errorLogPath?: string;
};

type BuildResult = {
  entities: CompiledEntity[];
  diagnostics: BuildDiagnostics;
};

const moduleDir = dirname(fileURLToPath(import.meta.url));
const buildErrorLogPath = resolve(moduleDir, "..", "logs", "build-errors.md");
const defaultCompiledContentPath = resolve(
  moduleDir,
  "..",
  "..",
  "compiled-content",
  "entities.json",
);

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
      (
        await rl.question("Enter Obsidian vault absolute path: ")
      ).trim();
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

export async function buildContent(options: BuildContentOptions): Promise<BuildResult> {
  const markdownFiles = await scanVault(options.vaultPath, options.subFolder);
  const entities: CompiledEntity[] = [];
  const knownIds = new Map<string, string>();
  const errors: string[] = [];

  const outputPath =
    options.outputFilePath ?? defaultCompiledContentPath;
  const errorLogPath = buildErrorLogPath;

  for (const filePath of markdownFiles) {
    try {
      const parsedFile = await parseFile(filePath, options.vaultPath);
      const entity = validateEntity(parsedFile.frontmatter, parsedFile);

      const firstSeenIn = knownIds.get(entity.id);
      if (firstSeenIn) {
        errors.push(
          `Duplicate id "${entity.id}" in "${parsedFile.sourcePath}" (already used in "${firstSeenIn}").`,
        );
        continue;
      }

      knownIds.set(entity.id, parsedFile.sourcePath);
      entities.push(entity);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(message);
    }
  }

  if (errors.length > 0) {
    const content = [
      `# Content Build Errors`,
      ``,
      `Generated at: ${new Date().toISOString()}`,
      `Total errors: ${errors.length}`,
      ``,
      ...errors.map((message, index) => `${index + 1}. ${message}`),
      "",
    ].join("\n");

    await mkdir(dirname(errorLogPath), { recursive: true });
    await writeFile(errorLogPath, content, "utf8");

    throw new Error(
      `Build failed with ${errors.length} error(s).\n${errors
        .map((message, index) => `${index + 1}. ${message}`)
        .join("\n")}\nError log: ${errorLogPath}`,
    );
  }

  await writeCompiledContent(entities, outputPath);
  return {
    entities,
    diagnostics: {
      markdownFilesScanned: markdownFiles.length,
      outputFilePath: outputPath,
    },
  };
}

function parseCliArgs(args: string[]): { vaultPathArg?: string; subFolderArg?: string } {
  const vaultFlag = args.findIndex((arg) => arg === "--vault");
  const subFolderFlag = args.findIndex((arg) => arg === "--subfolder");

  const vaultPathArg =
    vaultFlag >= 0 ? args[vaultFlag + 1] : args[0];
  const subFolderArg =
    subFolderFlag >= 0 ? args[subFolderFlag + 1] : args[1];

  return { vaultPathArg, subFolderArg };
}

async function runCli(): Promise<void> {
  const { vaultPathArg, subFolderArg } = parseCliArgs(process.argv.slice(2));
  output.write("Starting content build...\n");
  const options = await promptForMissingOptions(vaultPathArg, subFolderArg);
  const result = await buildContent(options);

  const scannedPath = resolve(options.vaultPath, options.subFolder);
  output.write(
    `Scanned ${result.diagnostics.markdownFilesScanned} markdown file(s) in "${scannedPath}".\n`,
  );
  output.write(`Compiled content generated at "${result.diagnostics.outputFilePath}".\n`);
}

const isExecutedAsScript =
  typeof process.argv[1] === "string" &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isExecutedAsScript) {
  runCli().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "Unknown error";
    output.write(`Content build failed: ${message}\n`);
    process.exitCode = 1;
  });
}