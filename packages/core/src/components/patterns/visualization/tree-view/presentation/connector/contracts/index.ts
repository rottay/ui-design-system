import type { ReactNode } from "react";

/**
 * A node in a repo/module tree (spec section 3: tree structures as real content devices —
 * "what you get"). `label` is real, screenreader-visible content — never decorative ASCII.
 *
 * Named for the connector, not for the family. The engine-dispatched `PatternTreeView` in
 * this same family owns a `TreeNode` of its own with an entirely different shape (`key`,
 * `icon`, `disabled`, `data`), and while both types lived under one bare name a consumer
 * could import either and typecheck against neither.
 */
export interface TreeViewConnectorNode {
  /** The node's content: a file name, module name, path segment, etc. */
  label: ReactNode;
  /** Nested entries, rendered as a semantic nested list under this node. */
  children?: TreeViewConnectorNode[];
  /** Optional link destination; when set, `label` renders inside an anchor. */
  href?: string;
}

export interface TreeViewConnectorProps {
  /**
   * A single root node, or a list of sibling root nodes (e.g. several top-level modules with
   * no common parent). A lone root node renders without a connector — like the top path
   * printed by the `tree` CLI; an array of roots renders each entry with its own `├──`/`└──`
   * connector, as siblings.
   */
  data: TreeViewConnectorNode | TreeViewConnectorNode[];
  /** Extra class names on the root list. */
  className?: string;
  /** Accessible label for the tree region (e.g. "Repository structure"). */
  "aria-label"?: string;
}
