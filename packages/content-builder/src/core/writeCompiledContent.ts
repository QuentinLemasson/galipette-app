import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import type { CompiledEntity } from "../types/Entity.js";

export async function writeCompiledContent(
  entities: CompiledEntity[],
  outputFilePath: string,
): Promise<void> {
  await mkdir(dirname(outputFilePath), { recursive: true });
  await writeFile(outputFilePath, JSON.stringify(entities, null, 2), "utf8");
}
