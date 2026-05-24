"use client";

import { ChevronRightIcon, FileTextIcon, FolderIcon, FolderOpenIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@galipette/ui/components/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@galipette/ui/components/collapsible";
import { cn } from "@galipette/ui/lib/utils";

export type FileTreeEntityNode = {
  kind: "entity";
  id: string;
  name: string;
  slug: string;
  type?: string;
};

export type FileTreeFolderNode = {
  kind: "folder";
  name: string;
  /** Stable key when present (e.g. compiled `slug`). */
  slug?: string;
  children: FileTreeNode[];
};

export type FileTreeNode = FileTreeEntityNode | FileTreeFolderNode;

export type FileTreeProps = {
  root: FileTreeFolderNode;
  renderEntityLink: (node: FileTreeEntityNode) => React.ReactNode;
  className?: string;
  /** When true, folder nodes start expanded. */
  defaultExpanded?: boolean;
};

type FileTreeBranchProps = {
  nodes: FileTreeNode[];
  depth: number;
  renderEntityLink: (node: FileTreeEntityNode) => React.ReactNode;
  defaultExpanded: boolean;
};

type FileTreeFolderItemProps = {
  node: FileTreeFolderNode;
  depth: number;
  renderEntityLink: (node: FileTreeEntityNode) => React.ReactNode;
  defaultExpanded: boolean;
};

type FileTreeEntityItemProps = {
  node: FileTreeEntityNode;
  depth: number;
  renderEntityLink: (node: FileTreeEntityNode) => React.ReactNode;
};

function treeItemIndent(depth: number): React.CSSProperties | undefined {
  if (depth <= 0) {
    return undefined;
  }
  return { paddingLeft: `${depth * 12 + 8}px` };
}

function FileTreeEntityItem({ node, depth, renderEntityLink }: FileTreeEntityItemProps) {
  return (
    <li
      role="treeitem"
      className="list-none"
      style={treeItemIndent(depth)}
    >
      <div className="flex h-7 min-w-0 items-center gap-1.5 rounded-md px-2 text-sidebar-foreground hover:bg-sidebar-accent">
        <FileTextIcon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
        <span className="min-w-0 flex-1 truncate text-sm">{renderEntityLink(node)}</span>
      </div>
    </li>
  );
}

function FileTreeFolderItem({
  node,
  depth,
  renderEntityLink,
  defaultExpanded,
}: FileTreeFolderItemProps) {
  const [open, setOpen] = React.useState(defaultExpanded);

  if (node.children.length === 0) {
    return null;
  }

  return (
    <li
      role="treeitem"
      aria-expanded={open}
      className="list-none"
      style={treeItemIndent(depth)}
    >
      <Collapsible open={open} onOpenChange={setOpen} className="group/folder">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="xs"
            className="h-7 w-full justify-start gap-1.5 px-2 font-medium text-sidebar-foreground"
          >
            <ChevronRightIcon
              className="size-3.5 shrink-0 text-muted-foreground transition-transform group-data-[state=open]/folder:rotate-90"
              aria-hidden
            />
            {open ? (
              <FolderOpenIcon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
            ) : (
              <FolderIcon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
            )}
            <span className="min-w-0 flex-1 truncate text-left">{node.name}</span>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <FileTreeBranch
            nodes={node.children}
            depth={depth + 1}
            renderEntityLink={renderEntityLink}
            defaultExpanded={defaultExpanded}
          />
        </CollapsibleContent>
      </Collapsible>
    </li>
  );
}

function FileTreeBranch({ nodes, depth, renderEntityLink, defaultExpanded }: FileTreeBranchProps) {
  if (nodes.length === 0) {
    return null;
  }

  return (
    <ul role="group" className="flex flex-col gap-0.5 py-0.5">
      {nodes.map((node) =>
        node.kind === "folder" ? (
          <FileTreeFolderItem
            key={`folder:${node.slug ?? node.name}`}
            node={node}
            depth={depth}
            renderEntityLink={renderEntityLink}
            defaultExpanded={defaultExpanded}
          />
        ) : (
          <FileTreeEntityItem
            key={node.id}
            node={node}
            depth={depth}
            renderEntityLink={renderEntityLink}
          />
        ),
      )}
    </ul>
  );
}

/**
 * Vault-style hierarchical tree with collapsible folders and injectable entity links.
 */
function FileTree({
  root,
  renderEntityLink,
  className,
  defaultExpanded = true,
}: FileTreeProps) {
  if (root.children.length === 0) {
    return (
      <p className={cn("px-2 py-3 text-xs text-muted-foreground italic", className)}>
        No entries in the file tree.
      </p>
    );
  }

  return (
    <nav aria-label="Content file tree" className={cn("px-1 py-2", className)}>
      <ul role="tree" className="m-0 list-none p-0">
        <FileTreeBranch
          nodes={root.children}
          depth={0}
          renderEntityLink={renderEntityLink}
          defaultExpanded={defaultExpanded}
        />
      </ul>
    </nav>
  );
}

export { FileTree };
