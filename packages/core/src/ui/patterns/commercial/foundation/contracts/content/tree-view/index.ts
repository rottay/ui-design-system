import type { ReactNode } from "react";

/**
 * A node in a repo/module tree (spec section 3: tree structures as real content devices —
 * "what you get"). `label` is real, screenreader-visible content — never decorative ASCII.
 */
export interface TreeNode {
  /** The node's content: a file name, module name, path segment, etc. */
  label: ReactNode;
  /** Nested entries, rendered as a semantic nested list under this node. */
  children?: TreeNode[];
  /** Optional link destination; when set, `label` renders inside an anchor. */
  href?: string;
}

export interface TreeViewProps {
  /**
   * A single root node, or a list of sibling root nodes (e.g. several top-level modules with
   * no common parent). A lone root node renders without a connector — like the top path
   * printed by the `tree` CLI; an array of roots renders each entry with its own `├──`/`└──`
   * connector, as siblings.
   */
  data: TreeNode | TreeNode[];
  /** Extra class names on the root list. */
  className?: string;
  /** Accessible label for the tree region (e.g. "Repository structure"). */
  "aria-label"?: string;
}
