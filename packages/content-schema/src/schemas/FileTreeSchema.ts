import { z } from "zod";

/** Frontmatter contract for folder `_index.md` metadata notes. */
export const folderIndexFrontmatterSchema = z
  .object({
    name: z.string().min(1),
  })
  .strict();

export const fileTreeEntityNodeSchema = z.object({
  kind: z.literal("entity"),
  id: z.string().min(1),
  type: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  sourcePath: z.string(),
});

export type FileTreeEntityNodeSchema = z.infer<typeof fileTreeEntityNodeSchema>;

export type FileTreeFolderNodeSchema = {
  kind: "folder";
  name: string;
  sourcePath: string;
  slug: string;
  children: FileTreeNodeSchema[];
};

export type FileTreeNodeSchema = FileTreeFolderNodeSchema | FileTreeEntityNodeSchema;

export const fileTreeFolderNodeSchema: z.ZodType<FileTreeFolderNodeSchema> = z.lazy(() =>
  z.object({
    kind: z.literal("folder"),
    name: z.string().min(1),
    sourcePath: z.string(),
    slug: z.string().min(1),
    children: z.array(fileTreeNodeSchema),
  }),
);

export const fileTreeNodeSchema: z.ZodType<FileTreeNodeSchema> = z.lazy(() =>
  z.union([fileTreeFolderNodeSchema, fileTreeEntityNodeSchema]),
);

export const fileTreeSchema = z.object({
  scanRoot: z.string(),
  root: fileTreeFolderNodeSchema,
});
