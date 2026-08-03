import type { TreeNode, TreeViewProps } from '../../../foundation/contracts/content/tree-view';

import "./TreeView.css";

const CONNECTOR_MID = "├── "; // ├ ─ ─ (space)
const CONNECTOR_LAST = "└── "; // └ ─ ─ (space)
const GUIDE_CONTINUE = "│   "; // │ (three spaces)
const GUIDE_BLANK = "    "; // four spaces

interface TreeItemProps {
  node: TreeNode;
  /**
   * For each ancestor level (excluding this node): `true` when that ancestor was the last
   * child of its own list (its column stays blank below it), `false` when it had a later
   * sibling (its column keeps drawing a `│` guide down past this row).
   */
  guides: boolean[];
  /** Whether this node is the last among its own siblings — picks `└──` vs `├──`. */
  isLast: boolean;
  /**
   * `false` only for a single, connector-less root (a lone root prints plain, like the `tree`
   * CLI's invocation path); `true` for every other row, including that root's own children.
   */
  showConnector: boolean;
}

function TreeItem({ node, guides, isLast, showConnector }: TreeItemProps): React.JSX.Element {
  const children = node.children ?? [];
  const hasChildren = children.length > 0;
  const prefix = guides.map((ancestorWasLast) => (ancestorWasLast ? GUIDE_BLANK : GUIDE_CONTINUE)).join("");
  const childGuides = showConnector ? [...guides, isLast] : guides;

  return (
    <li className="rt-tree-view__item" data-part="item" role="listitem">
      <span className="rt-tree-view__row" data-part="row">
        {showConnector && (
          <span className="rt-tree-view__connector" data-part="connector" aria-hidden="true">
            {prefix}
            {isLast ? CONNECTOR_LAST : CONNECTOR_MID}
          </span>
        )}
        <span className="rt-tree-view__label" data-part="label">
          {node.href ? (
            <a className="rt-tree-view__link" data-part="link" href={node.href}>
              {node.label}
            </a>
          ) : (
            node.label
          )}
        </span>
      </span>
      {hasChildren && (
        <ul className="rt-tree-view__group" data-part="group" role="list">
          {children.map((child, index) => (
            <TreeItem
              key={index}
              node={child}
              guides={childGuides}
              isLast={index === children.length - 1}
              showConnector
            />
          ))}
        </ul>
      )}
    </li>
  );
}

/**
 * A repo/module tree rendered with box-drawing connectors (spec section 3: tree structures as
 * real content devices — "what you get").
 *
 * The hierarchy itself is a semantic nested list (`ul`/`li`, with an explicit `role="list"` /
 * `role="listitem"` structure so the semantics survive `list-style` removal in every browser);
 * a screenreader reads parent/child containment natively, and labels — real text, or real links
 * when `href` is set — are the only content it encounters. The `├── `, `└── `, and `│` connector
 * glyphs are purely decorative: `aria-hidden` and prefixed onto each row, computed from
 * last-child position and ancestor continuation, never the sole carrier of the hierarchy. Pure
 * presentational markup: no state, no client-only APIs, safe to render on the server.
 */
export function TreeView({ data, className, "aria-label": ariaLabel }: TreeViewProps): React.JSX.Element {
  const isList = Array.isArray(data);
  const roots = isList ? data : [data];
  const classes = ["rt-tree-view", className].filter(Boolean).join(" ");

  return (
    <ul className={classes} data-part="root" role="list" aria-label={ariaLabel}>
      {roots.map((node, index) => (
        <TreeItem
          key={index}
          node={node}
          guides={[]}
          isLast={index === roots.length - 1}
          showConnector={isList}
        />
      ))}
    </ul>
  );
}

export type { TreeNode, TreeViewProps } from '../../../foundation/contracts/content/tree-view';
