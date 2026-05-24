/**
 * Terminal-friendly formatting for the content-builder CLI (no extra dependencies).
 */

export {
  graphPathFromEntitiesPath,
  fileTreePathFromEntitiesPath,
  slugIndexPathFromEntitiesPath,
  brokenLinksPathFromEntitiesPath,
} from "../utils/artifactPaths.ts";

const LINE = "─".repeat(58);
const STRONG = "═".repeat(58);

/**
 * Prints a titled section header.
 *
 * @param title - Short heading text.
 */
export function printSection(
  title: string,
  write: (s: string) => void = process.stdout.write.bind(process.stdout),
): void {
  write(`\n${STRONG}\n  ${title}\n${STRONG}\n`);
}

/**
 * Prints a label/value row aligned for scanning.
 *
 * @param label - Left column (kept short).
 * @param value - Right column (paths may wrap in narrow terminals).
 */
export function printRow(
  label: string,
  value: string,
  write: (s: string) => void = process.stdout.write.bind(process.stdout),
): void {
  const labelPad = 18;
  const pad = Math.max(1, labelPad - label.length);
  write(`  ${label}${" ".repeat(pad)}${value}\n`);
}

/**
 * Short welcome line before prompts (optional).
 */
export function printCliIntro(
  write: (s: string) => void = process.stdout.write.bind(process.stdout),
): void {
  write(`\n${LINE}\n`);
  write(`  Galipette · content builder\n`);
  write(`${LINE}\n\n`);
}

/**
 * Prints resolved vault configuration after CLI args, env, and prompts are merged.
 *
 * @param params - Paths shown to the user for transparency.
 */
export function printConfigSummary(params: {
  vaultPath: string;
  subFolder: string;
  source: "cli" | "env" | "prompt";
}): void {
  printSection("Configuration");
  printRow("Vault", params.vaultPath);
  printRow("Scan folder", params.subFolder || ".");
  const origin =
    params.source === "cli"
      ? "command line"
      : params.source === "env"
        ? "environment / .env"
        : "interactive prompt";
  printRow("Vault path from", origin);
  process.stdout.write("\n");
}

/**
 * Prints a concise success summary after a successful build.
 *
 * @param params - Counts and artifact paths.
 */
export function printSuccessSummary(params: {
  markdownFiles: number;
  entityCount: number;
  graphNodeCount: number;
  graphEdgeCount: number;
  entitiesJsonPath: string;
  graphJsonPath: string;
  fileTreeJsonPath: string;
  slugIndexJsonPath: string;
  brokenLinksJsonPath: string;
}): void {
  printSection("Build succeeded");
  printRow("Markdown files", String(params.markdownFiles));
  printRow("Entities", String(params.entityCount));
  printRow("Graph nodes", String(params.graphNodeCount));
  printRow("Graph edges", String(params.graphEdgeCount));
  process.stdout.write("\n");
  printRow("Entities file", params.entitiesJsonPath);
  printRow("Graph file", params.graphJsonPath);
  printRow("File tree", params.fileTreeJsonPath);
  printRow("Slug index", params.slugIndexJsonPath);
  printRow("Broken links", params.brokenLinksJsonPath);
  process.stdout.write(`\n${LINE}\n\n`);
}

/**
 * Prints a structured failure message and optional log path.
 *
 * @param message - Primary error text (may contain newlines).
 * @param errorLogPath - Path to the Markdown error report, if any.
 */
export function printFailure(message: string, errorLogPath?: string): void {
  printSection("Build failed");
  const lines = message.trim().split("\n");
  for (const line of lines) {
    process.stdout.write(`  ${line}\n`);
  }
  if (errorLogPath) {
    process.stdout.write("\n");
    printRow("Error report", errorLogPath);
  }
  process.stdout.write(`\n${LINE}\n\n`);
}
