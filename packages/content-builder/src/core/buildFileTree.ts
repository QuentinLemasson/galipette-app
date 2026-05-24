import { posix as pathPosix } from "node:path";

import type {
  CompiledEntity,
  FileTree,
  FileTreeEntityNode,
  FileTreeFolderNode,
  FolderIndexFrontmatter,
} from "@galipette/content-schema";

import { normalizeVaultPath } from "./folderIndex.ts";
import { generateEntitySlug } from "./generateEntitySlug.ts";

type BuildFileTreeOptions = {
  entities: readonly CompiledEntity[];
  folderIndexes: ReadonlyMap<string, FolderIndexFrontmatter>;
  scanRoot: string;
};

type MutableFolderNode = {
  sourcePath: string;
  name: string;
  slug: string;
  folderChildren: Map<string, MutableFolderNode>;
  entityChildren: FileTreeEntityNode[];
};

/**
 * Infers the name of a folder from a source path.
 * @param sourcePath - The source path to infer the folder name from.
 * @param scanRoot - The scan root to infer the folder name from.
 * @returns The inferred folder name.
 */
function inferFolderName(sourcePath: string, scanRoot: string): string {
  if (sourcePath === "") {
    return "Vault";
  }
  const segment = sourcePath.split("/").filter(Boolean).at(-1);
  if (!segment) {
    return scanRoot || "Vault";
  }
  return segment.replaceAll(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Checks if a path is within the scan root.
 * @param path - The path to check.
 * @param scanRoot - The scan root to check.
 * @returns True if the path is within the scan root, false otherwise.
 */
function isWithinScanRoot(path: string, scanRoot: string): boolean {
  if (scanRoot === "") {
    return true;
  }
  return path === scanRoot || path.startsWith(`${scanRoot}/`);
}

/**
 * Extracts the parent folder path from a note path.
 * @param path - The path to extract the parent folder from.
 * @returns The parent folder path.
 */
function parentFolderPath(path: string): string | null {
  if (path === "") {
    return null;
  }
  const parent = pathPosix.dirname(path);
  return parent === "." ? "" : parent;
}

/**
 * Converts a mutable folder node to a file tree folder node.
 * @param node - The mutable folder node to convert.
 * @returns The file tree folder node.
 */
function toFolderNode(node: MutableFolderNode): FileTreeFolderNode {
  const sortedFolders = Array.from(node.folderChildren.values())
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(toFolderNode);
  const sortedEntities = node.entityChildren.slice().sort((a, b) => a.name.localeCompare(b.name));
  return {
    kind: "folder",
    name: node.name,
    sourcePath: node.sourcePath,
    slug: node.slug,
    children: [...sortedFolders, ...sortedEntities],
  };
}

/**
 * Builds the file tree from the given options.
 * @param options - The options to build the file tree from.
 * @returns The built file tree.
 */
export function buildFileTree(options: BuildFileTreeOptions): FileTree {
  const scanRoot = normalizeVaultPath(options.scanRoot);
  const folderByPath = new Map<string, MutableFolderNode>();

  const ensureFolder = (sourcePathInput: string): MutableFolderNode => {
    const sourcePath = normalizeVaultPath(sourcePathInput);
    if (!isWithinScanRoot(sourcePath, scanRoot)) {
      throw new Error(`Folder "${sourcePath}" is outside scan root "${scanRoot}".`);
    }
    const existing = folderByPath.get(sourcePath);
    if (existing) {
      return existing;
    }
    const indexMeta = options.folderIndexes.get(sourcePath);
    const node: MutableFolderNode = {
      sourcePath,
      name: indexMeta?.name ?? inferFolderName(sourcePath, scanRoot),
      slug: generateEntitySlug(sourcePath),
      folderChildren: new Map(),
      entityChildren: [],
    };
    folderByPath.set(sourcePath, node);

    if (sourcePath !== scanRoot) {
      const parent = parentFolderPath(sourcePath);
      if (parent !== null) {
        const parentNode = ensureFolder(parent);
        parentNode.folderChildren.set(sourcePath, node);
      }
    }

    return node;
  };

  const root = ensureFolder(scanRoot);

  for (const folderPath of options.folderIndexes.keys()) {
    ensureFolder(folderPath);
  }

  for (const entity of options.entities) {
    const entitySourcePath = normalizeVaultPath(entity.sourcePath);
    if (!isWithinScanRoot(entitySourcePath, scanRoot)) {
      continue;
    }
    const folderPath = parentFolderPath(entitySourcePath) ?? scanRoot;
    const folder = ensureFolder(folderPath);
    folder.entityChildren.push({
      kind: "entity",
      id: entity.id,
      type: entity.type,
      name: entity.name,
      slug: entity.slug,
      sourcePath: entity.sourcePath,
    });
  }

  return {
    scanRoot,
    root: toFolderNode(root),
  };
}
