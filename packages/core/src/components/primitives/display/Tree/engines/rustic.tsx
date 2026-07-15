/**
 * @fileoverview Rustic Tree engine -- pure HTML/CSS (zero UI-library dependencies).
 *
 * Full-featured hierarchical tree using authored engine CSS, bounded runtime layout values,
 * `var(--ds-*)` custom properties, and semantic HTML. Implements expand/collapse, checkable nodes
 * with cascading half-checked state, drag-and-drop reordering, async child loading,
 * search/filter with auto-expand, tree-line connectors, and WAI-ARIA TreeView
 * keyboard navigation -- all without DaisyUI, Tailwind, or Ant Design.
 *
 * Hover states are managed via imperative `style` mutations on mouse events
 * because inline styles cannot express `:hover` pseudo-selectors. Keyframe
 * animations are supplied by the shared primitive-motion stylesheet.
 *
 * Engine: **Vanilla HTML + CSS custom properties**
 *
 * @example
 * ```tsx
 * <Tree engine="rustic" treeData={departments} checkable showLine blockNode />
 * ```
 *
 * @module Tree/Rustic
 * @category Display
 * @package @rottay/design-system
 */

'use client';

import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { arrayValueAt } from '@/_internal/utils/collections';
import type { TreeProps, TreeDataNode } from '../Tree.types';
import { TREE_DEFAULTS } from '../Tree.types';
import {
  type TreeEngineKey,
  normalizeTreeKey,
  collectAllKeys,
  findNodeByKey,
  buildParentMap,
  getDescendantKeys,
  flattenVisibleKeys,
  computeHalfCheckedKeys,
  filterTree,
} from '../utils';

// ---------------------------------------------------------------------------
// Highlight helper
// ---------------------------------------------------------------------------

// Highlights the first occurrence of the search term within a tree node's title.
// Only works on string titles -- React elements pass through unchanged since
// we cannot safely split arbitrary JSX.
function highlightText(text: React.ReactNode, searchValue: string): React.ReactNode {
  if (!searchValue || typeof text !== 'string') return text;
  const idx = text.toLowerCase().indexOf(searchValue.toLowerCase());
  if (idx === -1) return text;
  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + searchValue.length);
  const after = text.slice(idx + searchValue.length);
  return (
    <>
      {before}
      <span
        className="rottay-tree-highlight"
        data-part="tree-node-highlight"
        style={{
          padding: '0 2px',
        }}
      >
        {match}
      </span>
      {after}
    </>
  );
}

// ---------------------------------------------------------------------------
// CSS-in-JS style objects use CSS variables.
// Rustic engine uses runtime style props with CSS custom property fallbacks
// so tenant themes override colors without any class-based system.
// ---------------------------------------------------------------------------

const styles = {
  spinner: {
    display: 'inline-block',
    width: '16px',
    height: '16px',
    marginRight: '4px',
    flexShrink: 0,
    animation: 'rottay-tree-spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite',
  } as React.CSSProperties,

  dropIndicator: (level: number): React.CSSProperties => ({
    position: 'absolute',
    left: 0,
    right: 0,
    paddingLeft: level * 24,
    pointerEvents: 'none',
    zIndex: 10,
  }),

  dropLine: {
    height: '2px',
    animation: 'rottay-tree-drop-line-in 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
  } as React.CSSProperties,
};

// ---------------------------------------------------------------------------
// TreeNodeRender
// ---------------------------------------------------------------------------

interface TreeNodeRenderProps extends TreeDataNode {
  nodeKey: TreeEngineKey;
  level: number;
  isExpanded: boolean;
  isSelected: boolean;
  isChecked: boolean;
  isHalfChecked: boolean;
  isLoading: boolean;
  isFocused: boolean;
  isFiltered: boolean;
  onToggle: (key: TreeEngineKey) => void;
  onSelect: (key: TreeEngineKey, node: TreeDataNode) => void;
  onCheck: (key: TreeEngineKey, node: TreeDataNode) => void;
  onFocus: (key: TreeEngineKey) => void;
  showLine?: boolean;
  showIcon?: boolean;
  checkable?: boolean;
  blockNode?: boolean;
  draggable?: boolean;
  expandedKeys: TreeEngineKey[];
  selectedKeys: TreeEngineKey[];
  checkedKeys: TreeEngineKey[];
  halfCheckedKeys: TreeEngineKey[];
  loadingKeys: TreeEngineKey[];
  focusedKey: TreeEngineKey | null;
  filteredKeys: Set<TreeEngineKey> | null;
  searchValue?: string;
  findNode: (key: TreeEngineKey) => TreeDataNode | undefined;
  onDragStartInternal: (key: TreeEngineKey, e: React.DragEvent) => void;
  onDragOverInternal: (key: TreeEngineKey, e: React.DragEvent, level: number) => void;
  onDropInternal: (key: TreeEngineKey, e: React.DragEvent) => void;
  onDragEndInternal: () => void;
  dropTarget: {
    key: TreeEngineKey;
    position: 'before' | 'inside' | 'after';
  } | null;
  nodeRef: (key: TreeEngineKey, el: HTMLDivElement | null) => void;
  isLast: boolean;
  parentIsLast: boolean[];
}

const TreeNodeRender: React.FC<TreeNodeRenderProps> = ({
  nodeKey,
  title,
  children,
  disabled,
  disableCheckbox,
  isLeaf,
  icon,
  level,
  isExpanded,
  isSelected,
  isChecked,
  isHalfChecked,
  isLoading,
  isFocused,
  isFiltered,
  onToggle,
  onSelect,
  onCheck,
  onFocus,
  showLine,
  showIcon,
  checkable,
  blockNode,
  draggable: propDraggable,
  expandedKeys,
  selectedKeys,
  checkedKeys,
  halfCheckedKeys,
  loadingKeys,
  focusedKey,
  filteredKeys,
  searchValue,
  findNode,
  onDragStartInternal,
  onDragOverInternal,
  onDropInternal,
  onDragEndInternal,
  dropTarget,
  nodeRef,
  isLast,
  parentIsLast,
}: TreeNodeRenderProps) => {
  const normalizedNodeKey = normalizeTreeKey(nodeKey);
  const hasChildren = children && children.length > 0;
  // Show the expand arrow when: has children OR is a non-leaf that might
  // load children asynchronously (loadData pattern). True leaves never expand.
  const showExpander = (hasChildren || (!isLeaf && !hasChildren)) && !isLeaf;
  // 24px per level creates the indentation hierarchy. 8px base offset
  // keeps root nodes from touching the container edge.
  const paddingLeft = level * 24 + 8;

  const isDraggable = propDraggable && !disabled;
  const isDropTarget = dropTarget?.key === normalizedNodeKey;
  const dropPosition = isDropTarget ? dropTarget!.position : null;

  const displayTitle = searchValue ? highlightText(title, searchValue) : title;

  // Node row style -- blockNode fills the full width (directory-tree style),
  // inline-flex only takes the width of its content (tag-picker style).
  const nodeStyle: React.CSSProperties = {
    display: blockNode ? 'flex' : 'inline-flex',
    width: blockNode ? '100%' : undefined,
    alignItems: 'center',
    padding: '4px 8px',
    paddingLeft,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : !isFiltered && filteredKeys ? 0.4 : 1,
    transition:
      'background-color 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.15s',
    position: 'relative',
  };

  // The expand/collapse arrow rotates 90deg to point downward when expanded.
  // cubic-bezier(0.16, 1, 0.3, 1) is an "ease-out-expo" feel -- fast start,
  // gentle deceleration -- used consistently across the rustic engine.
  const switcherStyle: React.CSSProperties = {
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '4px',
    transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    flexShrink: 0,
    cursor: 'pointer',
    padding: 0,
  };

  const checkboxStyle: React.CSSProperties = {
    marginRight: '8px',
    width: '16px',
    height: '16px',
    cursor: disabled || disableCheckbox ? 'not-allowed' : 'pointer',
    flexShrink: 0,
  };

  const iconStyle: React.CSSProperties = {
    marginRight: '8px',
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  };

  // Tree line connectors create the visual hierarchy lines seen in directory
  // tree UIs. Three types of lines are drawn per node:
  // 1. Vertical lines from non-last ancestors (continuous down the left edge)
  // 2. Horizontal connector from parent to this node
  // 3. Vertical segment from parent -- full height if not last child, half if last
  const treeLineConnectors: React.ReactNode[] = [];
  if (showLine && level > 0) {
    for (let i = 0; i < parentIsLast.length; i++) {
      if (!parentIsLast[i]) {
        treeLineConnectors.push(
          <div
            key={`vline-${i}`}
            data-part="connector"
            data-axis="vertical"
            style={{
              position: 'absolute',
              left: i * 24 + 12,
              top: 0,
              bottom: 0,
              pointerEvents: 'none',
            }}
          />
        );
      }
    }
    // Horizontal connector
    treeLineConnectors.push(
      <div
        key="hline"
        data-part="connector"
        data-axis="horizontal"
        style={{
          position: 'absolute',
          left: (level - 1) * 24 + 12,
          top: '50%',
          width: 12,
          pointerEvents: 'none',
        }}
      />
    );
    // Vertical line from parent (half or full)
    if (isLast) {
      treeLineConnectors.push(
        <div
          key="vline-self"
          data-part="connector"
          data-axis="vertical"
          style={{
            position: 'absolute',
            left: (level - 1) * 24 + 12,
            top: 0,
            height: '50%',
            pointerEvents: 'none',
          }}
        />
      );
    } else {
      treeLineConnectors.push(
        <div
          key="vline-self"
          data-part="connector"
          data-axis="vertical"
          style={{
            position: 'absolute',
            left: (level - 1) * 24 + 12,
            top: 0,
            bottom: 0,
            pointerEvents: 'none',
          }}
        />
      );
    }
  }

  const handleClick = () => {
    if (disabled) return;
    onFocus(normalizedNodeKey);
    const node = findNode(normalizedNodeKey);
    if (node) {
      onSelect(normalizedNodeKey, node);
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(normalizedNodeKey);
  };

  const handleCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (disableCheckbox || disabled) return;
    const node = findNode(normalizedNodeKey);
    if (node) {
      onCheck(normalizedNodeKey, node);
    }
  };

  // Loading spinner SVG
  const loadingSpinner = isLoading ? (
    <span style={styles.spinner}>
      <svg viewBox="0 0 16 16" fill="none" style={{ width: '100%', height: '100%' }}>
        <circle
          cx="8"
          cy="8"
          r="6"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="28"
          strokeDashoffset="8"
          strokeLinecap="round"
        />
      </svg>
    </span>
  ) : null;

  return (
    <div
      className="rottay-tree-node"
      data-part="node"
      data-key={normalizedNodeKey}
      style={{ position: 'relative' }}
      ref={(el) => nodeRef(normalizedNodeKey, el)}
    >
      {/* Tree line connectors */}
      {treeLineConnectors}

      {/* Drop indicator line */}
      {isDropTarget && dropPosition && dropPosition !== 'inside' && (
        <div
          data-part="drop-indicator"
          style={{
            ...styles.dropIndicator(level),
            top: dropPosition === 'before' ? -1 : undefined,
            bottom: dropPosition === 'after' ? -1 : undefined,
          }}
        >
          <div style={styles.dropLine} />
        </div>
      )}

      {/* Node content */}
      <div
        style={nodeStyle}
        onClick={handleClick}
        role="treeitem"
        aria-selected={isSelected}
        aria-expanded={showExpander ? isExpanded : undefined}
        aria-disabled={disabled}
        aria-checked={checkable ? (isHalfChecked ? 'mixed' : isChecked) : undefined}
        aria-level={level + 1}
        tabIndex={isFocused ? 0 : -1}
        data-tree-node-key={normalizedNodeKey}
        data-part="row"
        data-selected={isSelected ? 'true' : 'false'}
        data-expanded={showExpander ? (isExpanded ? 'true' : 'false') : undefined}
        data-disabled={disabled || undefined}
        data-focused={isFocused || undefined}
        data-drop-target={isDropTarget || undefined}
        data-drop-position={isDropTarget ? dropPosition : undefined}
        draggable={isDraggable}
        onDragStart={isDraggable ? (e) => onDragStartInternal(normalizedNodeKey, e) : undefined}
        onDragOver={
          propDraggable
            ? (e) => {
                e.preventDefault();
                onDragOverInternal(normalizedNodeKey, e, level);
              }
            : undefined
        }
        onDrop={
          propDraggable
            ? (e) => {
                e.preventDefault();
                onDropInternal(normalizedNodeKey, e);
              }
            : undefined
        }
        onDragEnd={propDraggable ? onDragEndInternal : undefined}
      >
        {/* Expand/collapse arrow or loading spinner */}
        {isLoading ? (
          loadingSpinner
        ) : showExpander ? (
          <span
            data-part="tree-node-toggle"
            style={switcherStyle}
            onClick={handleToggle}
            role="button"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
            tabIndex={-1}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
              <path d="M6 4l4 4-4 4z" />
            </svg>
          </span>
        ) : (
          <span style={{ width: '24px', flexShrink: 0 }} />
        )}

        {/* Checkbox -- uses a ref callback to set the native indeterminate property
            which cannot be set via a React attribute (HTML has no indeterminate attr). */}
        {checkable && (
          <input
            type="checkbox"
            data-part="checkbox"
            style={checkboxStyle}
            checked={isChecked}
            ref={(el) => {
              if (el) {
                el.indeterminate = isHalfChecked && !isChecked;
              }
            }}
            disabled={disabled || disableCheckbox}
            onChange={handleCheck}
            onClick={(e) => e.stopPropagation()}
            aria-label={`Select ${typeof title === 'string' ? title : ''}`}
            tabIndex={-1}
          />
        )}

        {/* Icon */}
        {showIcon && icon && (
          <span data-part="icon" style={iconStyle}>
            {icon}
          </span>
        )}

        {/* Title */}
        <span
          data-part="tree-node-label"
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {displayTitle}
        </span>
      </div>

      {/* Children */}
      {isExpanded && hasChildren && (
        <div role="group">
          {children!.map((child, index) => {
            const { key: rawChildKey, ...childRest } = child;
            const childKey = normalizeTreeKey(rawChildKey);
            if (filteredKeys && !filteredKeys.has(childKey)) return null;
            const childIsLast = index === children!.length - 1;
            return (
              <TreeNodeRender
                key={childKey}
                nodeKey={childKey}
                {...childRest}
                level={level + 1}
                isExpanded={expandedKeys.includes(childKey)}
                isSelected={selectedKeys.includes(childKey)}
                isChecked={checkedKeys.includes(childKey)}
                isHalfChecked={halfCheckedKeys.includes(childKey)}
                isLoading={loadingKeys.includes(childKey)}
                isFocused={focusedKey === childKey}
                isFiltered={filteredKeys ? filteredKeys.has(childKey) : true}
                onToggle={onToggle}
                onSelect={onSelect}
                onCheck={onCheck}
                onFocus={onFocus}
                showLine={showLine}
                showIcon={showIcon}
                checkable={checkable}
                blockNode={blockNode}
                draggable={propDraggable}
                expandedKeys={expandedKeys}
                selectedKeys={selectedKeys}
                checkedKeys={checkedKeys}
                halfCheckedKeys={halfCheckedKeys}
                loadingKeys={loadingKeys}
                focusedKey={focusedKey}
                filteredKeys={filteredKeys}
                searchValue={searchValue}
                findNode={findNode}
                onDragStartInternal={onDragStartInternal}
                onDragOverInternal={onDragOverInternal}
                onDropInternal={onDropInternal}
                onDragEndInternal={onDragEndInternal}
                dropTarget={dropTarget}
                nodeRef={nodeRef}
                isLast={childIsLast}
                parentIsLast={[...parentIsLast, isLast]}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// RusticTree (main export)
// ---------------------------------------------------------------------------

/**
 * Rustic Tree engine -- dependency-free, inline-styled hierarchical tree.
 *
 * Manages expand, select, check, drag-and-drop, async loading, search/filter,
 * and keyboard navigation state. Renders tree nodes recursively via
 * `TreeNodeRender`. Supports both controlled and uncontrolled modes.
 *
 * @param props - Unified DS TreeProps (see Tree.types.ts)
 * @returns A vanilla HTML tree with role="tree" ARIA semantics
 */
export default function RusticTree(props: TreeProps): React.ReactElement {
  const {
    treeData = [],
    checkable = TREE_DEFAULTS.checkable,
    defaultExpandedKeys = [],
    defaultSelectedKeys = [],
    defaultCheckedKeys = [],
    expandedKeys: controlledExpandedKeys,
    selectedKeys: controlledSelectedKeys,
    checkedKeys: controlledCheckedKeys,
    showLine = TREE_DEFAULTS.showLine,
    showIcon = TREE_DEFAULTS.showIcon,
    defaultExpandAll = TREE_DEFAULTS.defaultExpandAll,
    draggable = TREE_DEFAULTS.draggable,
    blockNode = TREE_DEFAULTS.blockNode,
    treeCheckStrictly = TREE_DEFAULTS.treeCheckStrictly,
    treeLine,
    loadData,
    filterTreeNode,
    searchValue,
    onExpand,
    onSelect,
    onCheck,
    onDragStart,
    onDrop,
    className = '',
    style,
  } = props;

  const resolvedShowLine = treeLine ?? showLine;

  // Refs
  const treeContainerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Map<TreeEngineKey, HTMLDivElement>>(new Map());
  const loadedKeysRef = useRef<Set<TreeEngineKey>>(new Set());

  const registerNodeRef = useCallback((key: TreeEngineKey, el: HTMLDivElement | null) => {
    if (el) nodeRefs.current.set(key, el);
    else nodeRefs.current.delete(key);
  }, []);

  // Find node helper
  const findNode = useCallback(
    (key: TreeEngineKey): TreeDataNode | undefined => findNodeByKey(treeData, key),
    [treeData]
  );

  // Parent map
  const parentMap = useMemo(() => buildParentMap(treeData), [treeData]);

  // State
  const [expandedKeys, setExpandedKeys] = useState<TreeEngineKey[]>(
    defaultExpandAll ? collectAllKeys(treeData) : defaultExpandedKeys.map(normalizeTreeKey)
  );
  const [selectedKeys, setSelectedKeys] = useState<TreeEngineKey[]>(defaultSelectedKeys.map(normalizeTreeKey));
  const [checkedKeys, setCheckedKeys] = useState<TreeEngineKey[]>(
    Array.isArray(defaultCheckedKeys) ? defaultCheckedKeys.map(normalizeTreeKey) : []
  );
  const [focusedKey, setFocusedKey] = useState<TreeEngineKey | null>(null);
  const [loadingKeys, setLoadingKeys] = useState<TreeEngineKey[]>([]);
  const [dragKey, setDragKey] = useState<TreeEngineKey | null>(null);
  const [dropTarget, setDropTarget] = useState<{
    key: TreeEngineKey;
    position: 'before' | 'inside' | 'after';
  } | null>(null);

  // Resolve controlled vs uncontrolled -- when the consumer provides controlled
  // keys we normalize them on every render. When uncontrolled, internal state
  // is the source of truth.
  const actualExpandedKeys = controlledExpandedKeys ? controlledExpandedKeys.map(normalizeTreeKey) : expandedKeys;
  const actualSelectedKeys = controlledSelectedKeys ? controlledSelectedKeys.map(normalizeTreeKey) : selectedKeys;
  const actualCheckedKeys = Array.isArray(controlledCheckedKeys)
    ? controlledCheckedKeys.map(normalizeTreeKey)
    : controlledCheckedKeys?.checked.map(normalizeTreeKey) ?? checkedKeys;

  // Half-checked (indeterminate) keys: a parent is half-checked when some but
  // not all of its descendants are checked. Skipped in strict mode where
  // parent/child checking is independent.
  const halfCheckedKeys = useMemo(() => {
    if (!checkable || treeCheckStrictly) return [];
    return computeHalfCheckedKeys(treeData, actualCheckedKeys);
  }, [treeData, actualCheckedKeys, checkable, treeCheckStrictly]);

  // Search/filter
  const filterResult = useMemo(() => {
    if (!filterTreeNode || !searchValue) return null;
    return filterTree(treeData, filterTreeNode, searchValue);
  }, [treeData, filterTreeNode, searchValue]);

  const filteredKeys = filterResult?.filteredKeys ?? null;

  // Auto-expand ancestor nodes of search matches so the user sees matching
  // nodes without manually opening each parent. Merges with existing expanded
  // keys to avoid collapsing nodes the user already opened.
  useEffect(() => {
    if (filterResult && filterResult.expandKeys.length > 0) {
      setExpandedKeys((prev) => {
        const combined = new Set([...prev, ...filterResult.expandKeys]);
        return Array.from(combined);
      });
    }
  }, [filterResult]);

  // Flatten the tree into a linear list of keys representing the currently
  // visible nodes (respecting which branches are expanded). This powers
  // ArrowUp/ArrowDown keyboard navigation with O(1) index lookups.
  const visibleKeys = useMemo(() => flattenVisibleKeys(treeData, actualExpandedKeys), [treeData, actualExpandedKeys]);

  // -----------------------------------------------------------------------
  // Event handlers
  // -----------------------------------------------------------------------

  const handleToggle = useCallback(
    async (key: TreeEngineKey) => {
      const isExpanding = !actualExpandedKeys.includes(key);
      const newKeys = isExpanding ? [...actualExpandedKeys, key] : actualExpandedKeys.filter((k) => k !== key);
      setExpandedKeys(newKeys);

      const node = findNode(key);
      if (node) {
        onExpand?.(newKeys, { node, expanded: isExpanding });
      }

      // Async (lazy) loading: when a non-leaf node is expanded for the first
      // time and has no children, call loadData to fetch them from the server.
      // loadedKeysRef prevents duplicate fetches on subsequent expand/collapse cycles.
      if (isExpanding && loadData && node && !node.isLeaf && !loadedKeysRef.current.has(key)) {
        const hasExistingChildren = node.children && node.children.length > 0;
        if (!hasExistingChildren) {
          setLoadingKeys((prev) => [...prev, key]);
          try {
            await loadData(node);
            loadedKeysRef.current.add(key);
          } finally {
            setLoadingKeys((prev) => prev.filter((k) => k !== key));
          }
        }
      }
    },
    [actualExpandedKeys, findNode, onExpand, loadData]
  );

  const handleSelect = useCallback(
    (key: TreeEngineKey, node: TreeDataNode) => {
      if (node.selectable === false) return;
      const newKeys = actualSelectedKeys.includes(key) ? actualSelectedKeys.filter((k) => k !== key) : [key];
      setSelectedKeys(newKeys);
      onSelect?.(newKeys, {
        node,
        selected: !actualSelectedKeys.includes(key),
      });
    },
    [actualSelectedKeys, onSelect]
  );

  const handleCheck = useCallback(
    (key: TreeEngineKey, node: TreeDataNode) => {
      if (treeCheckStrictly) {
        const newKeys = actualCheckedKeys.includes(key)
          ? actualCheckedKeys.filter((k) => k !== key)
          : [...actualCheckedKeys, key];
        setCheckedKeys(newKeys);
        onCheck?.(newKeys, { node, checked: !actualCheckedKeys.includes(key) });
      } else {
        const isChecking = !actualCheckedKeys.includes(key);
        const descendantKeys = getDescendantKeys(node);
        let newChecked: TreeEngineKey[];

        if (isChecking) {
          const toAdd = [key, ...descendantKeys];
          const combined = new Set([...actualCheckedKeys, ...toAdd]);
          newChecked = Array.from(combined);
        } else {
          const toRemove = new Set([key, ...descendantKeys]);
          newChecked = actualCheckedKeys.filter((k) => !toRemove.has(k));
        }

        // Cascade upward: iteratively check/uncheck parent nodes based on
        // whether all their children are now checked. Runs in a loop because
        // checking a parent may satisfy another grandparent's "all checked" condition.
        let changed = true;
        while (changed) {
          changed = false;
          for (const [childK, parentK] of parentMap) {
            const parentNode = findNode(parentK);
            if (!parentNode || !parentNode.children) continue;
            const allChildrenChecked = parentNode.children.every((c) => newChecked.includes(normalizeTreeKey(c.key)));
            if (allChildrenChecked && !newChecked.includes(parentK)) {
              newChecked.push(parentK);
              changed = true;
            } else if (!allChildrenChecked && newChecked.includes(parentK)) {
              newChecked = newChecked.filter((k) => k !== parentK);
              changed = true;
            }
          }
        }

        setCheckedKeys(newChecked);

        const newHalfChecked = computeHalfCheckedKeys(treeData, newChecked);
        onCheck?.({ checked: newChecked, halfChecked: newHalfChecked }, { node, checked: isChecking });
      }
    },
    [actualCheckedKeys, treeCheckStrictly, parentMap, findNode, treeData, onCheck]
  );

  // -----------------------------------------------------------------------
  // Drag and drop
  // -----------------------------------------------------------------------

  const handleDragStart = useCallback(
    (key: TreeEngineKey, e: React.DragEvent) => {
      setDragKey(key);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', String(key));
      const node = findNode(key);
      if (node) onDragStart?.({ node });
    },
    [findNode, onDragStart]
  );

  // Drop position is determined by where the cursor sits within the target node:
  // top 25% = before, middle 50% = inside (reparent), bottom 25% = after.
  // This 3-zone approach matches Finder/Explorer tree drag semantics.
  const handleDragOver = useCallback(
    (key: TreeEngineKey, e: React.DragEvent, _level: number) => {
      if (dragKey === null || dragKey === key) {
        setDropTarget(null);
        return;
      }
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const y = e.clientY - rect.top;
      const h = rect.height;
      let position: 'before' | 'inside' | 'after';
      if (y < h * 0.25) {
        position = 'before';
      } else if (y > h * 0.75) {
        position = 'after';
      } else {
        position = 'inside';
      }
      setDropTarget({ key, position });
    },
    [dragKey]
  );

  const handleDrop = useCallback(
    (key: TreeEngineKey, _e: React.DragEvent) => {
      if (dragKey === null || !dropTarget) return;
      const dragNode = findNode(dragKey);
      const dropNode = findNode(key);
      if (dragNode && dropNode) {
        const positionMap = { before: -1, inside: 0, after: 1 };
        onDrop?.({
          dragNode,
          dropNode,
          dropPosition: positionMap[dropTarget.position],
        });
      }
      setDragKey(null);
      setDropTarget(null);
    },
    [dragKey, dropTarget, findNode, onDrop]
  );

  const handleDragEnd = useCallback(() => {
    setDragKey(null);
    setDropTarget(null);
  }, []);

  // -----------------------------------------------------------------------
  // Keyboard navigation -- follows WAI-ARIA TreeView pattern:
  // ArrowUp/Down = move focus, ArrowRight = expand, ArrowLeft = collapse/parent,
  // Space = toggle checkbox, Enter = select node.
  // -----------------------------------------------------------------------

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Auto-focus the first visible node when the tree receives keyboard input
      // but no node is focused yet (e.g., first Tab into the tree).
      if (!focusedKey) {
        const firstKey = arrayValueAt(visibleKeys, 0);
        if (firstKey !== undefined) setFocusedKey(firstKey);
        return;
      }
      const currentIndex = visibleKeys.indexOf(focusedKey);
      if (currentIndex === -1) return;

      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          if (currentIndex < visibleKeys.length - 1) {
            const nextKey = arrayValueAt(visibleKeys, currentIndex + 1);
            if (nextKey === undefined) break;
            setFocusedKey(nextKey);
            nodeRefs.current.get(nextKey)?.querySelector<HTMLElement>('[data-tree-node-key]')?.focus();
          }
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          if (currentIndex > 0) {
            const prevKey = arrayValueAt(visibleKeys, currentIndex - 1);
            if (prevKey === undefined) break;
            setFocusedKey(prevKey);
            nodeRefs.current.get(prevKey)?.querySelector<HTMLElement>('[data-tree-node-key]')?.focus();
          }
          break;
        }
        case 'ArrowRight': {
          e.preventDefault();
          const node = findNode(focusedKey);
          if (node && node.children && node.children.length > 0 && !actualExpandedKeys.includes(focusedKey)) {
            handleToggle(focusedKey);
          }
          break;
        }
        case 'ArrowLeft': {
          e.preventDefault();
          if (actualExpandedKeys.includes(focusedKey)) {
            handleToggle(focusedKey);
          } else {
            const parentKey = parentMap.get(focusedKey);
            if (parentKey !== undefined) {
              setFocusedKey(parentKey);
              nodeRefs.current.get(parentKey)?.querySelector<HTMLElement>('[data-tree-node-key]')?.focus();
            }
          }
          break;
        }
        case ' ': {
          e.preventDefault();
          if (checkable) {
            const node = findNode(focusedKey);
            if (node && !node.disabled && !node.disableCheckbox) {
              handleCheck(focusedKey, node);
            }
          }
          break;
        }
        case 'Enter': {
          e.preventDefault();
          const node = findNode(focusedKey);
          if (node && !node.disabled) {
            handleSelect(focusedKey, node);
          }
          break;
        }
      }
    },
    [
      focusedKey,
      visibleKeys,
      actualExpandedKeys,
      findNode,
      parentMap,
      checkable,
      handleToggle,
      handleCheck,
      handleSelect,
    ]
  );

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  const containerStyle: React.CSSProperties = {
    fontFamily:
      'var(--ds-tree-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif)',
    fontSize: 'var(--ds-tree-font-size, 14px)',
    lineHeight: 'var(--ds-tree-line-height, 1.5)',
    ...style,
  };

  return (
    <div
      ref={treeContainerRef}
      className={`rottay-tree rottay-tree--rustic ${className}`}
      data-part="root"
      style={containerStyle}
      role="tree"
      aria-multiselectable={props.multiple || false}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      {treeData.map((node, index) => {
        const { key: rawNodeKey, ...nodeRest } = node;
        const nodeKey = normalizeTreeKey(rawNodeKey);
        if (filteredKeys && !filteredKeys.has(nodeKey)) return null;
        const nodeIsLast = index === treeData.length - 1;
        return (
          <TreeNodeRender
            key={nodeKey}
            nodeKey={nodeKey}
            {...nodeRest}
            level={0}
            isExpanded={actualExpandedKeys.includes(nodeKey)}
            isSelected={actualSelectedKeys.includes(nodeKey)}
            isChecked={actualCheckedKeys.includes(nodeKey)}
            isHalfChecked={halfCheckedKeys.includes(nodeKey)}
            isLoading={loadingKeys.includes(nodeKey)}
            isFocused={focusedKey === nodeKey}
            isFiltered={filteredKeys ? filteredKeys.has(nodeKey) : true}
            onToggle={handleToggle}
            onSelect={handleSelect}
            onCheck={handleCheck}
            onFocus={setFocusedKey}
            showLine={!!resolvedShowLine}
            showIcon={showIcon}
            checkable={checkable}
            blockNode={blockNode}
            draggable={draggable}
            expandedKeys={actualExpandedKeys}
            selectedKeys={actualSelectedKeys}
            checkedKeys={actualCheckedKeys}
            halfCheckedKeys={halfCheckedKeys}
            loadingKeys={loadingKeys}
            focusedKey={focusedKey}
            filteredKeys={filteredKeys}
            searchValue={searchValue}
            findNode={findNode}
            onDragStartInternal={handleDragStart}
            onDragOverInternal={handleDragOver}
            onDropInternal={handleDrop}
            onDragEndInternal={handleDragEnd}
            dropTarget={dropTarget}
            nodeRef={registerNodeRef}
            isLast={nodeIsLast}
            parentIsLast={[]}
          />
        );
      })}
    </div>
  );
}

RusticTree.displayName = 'Tree.Rustic';
