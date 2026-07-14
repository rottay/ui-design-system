/**
 * @fileoverview Modern Tree engine -- DaisyUI/Tailwind implementation.
 *
 * Full-featured hierarchical tree built with DaisyUI classes and Tailwind utilities.
 * Implements expand/collapse, checkable nodes with cascading half-checked state,
 * drag-and-drop reordering, async child loading, search/filter with auto-expand,
 * tree-line connectors, and WAI-ARIA TreeView keyboard navigation -- all without
 * Ant Design.
 *
 * The component is split into a recursive `TreeNodeInternal` (one per visible node)
 * and a root `ModernTree` that manages shared state and event handlers.
 *
 * Engine: **DaisyUI / Tailwind CSS**
 *
 * @example
 * ```tsx
 * <Tree engine="modern" treeData={files} showLine draggable onDrop={handleReorder} />
 * ```
 *
 * @module Tree/Modern
 * @category Display
 * @package @rottay/design-system
 */

'use client';

import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
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

// Wraps the matching substring in a warning-tinted span for search highlighting.
// Uses DS tokens so the highlight tracks tenant themes across light and dark modes.
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
      <span className="rottay-tree-search-highlight rounded-sm px-0.5" data-part="tree-node-highlight">
        {match}
      </span>
      {after}
    </>
  );
}

// ---------------------------------------------------------------------------
// Loading spinner
// ---------------------------------------------------------------------------

const LoadingSpinner: React.FC = () => (
  <span className="inline-block w-4 h-4 mr-1 flex-shrink-0 animate-spin">
    <svg viewBox="0 0 16 16" fill="none" className="w-full h-full">
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
);

// ---------------------------------------------------------------------------
// Drop indicator line
// ---------------------------------------------------------------------------

const DropIndicator: React.FC<{
  position: 'before' | 'inside' | 'after';
  level: number;
}> = ({ position, level }) => {
  if (position === 'inside') return null;
  const left = level * 24;
  return (
    <div
      className="absolute left-0 right-0 pointer-events-none z-10"
      data-part="drop-indicator"
      style={{
        top: position === 'before' ? -1 : undefined,
        bottom: position === 'after' ? -1 : undefined,
        paddingLeft: left,
      }}
    >
      <div
        className="h-0.5 rounded-full"
        style={{
          animation: 'rottay-drop-indicator var(--ds-motion-slow) ease-out',
        }}
      />
    </div>
  );
};

// ---------------------------------------------------------------------------
// TreeNodeInternal
// ---------------------------------------------------------------------------

interface TreeNodeInternalProps extends TreeDataNode {
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

const TreeNodeInternal: React.FC<TreeNodeInternalProps> = ({
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
}) => {
  const hasChildren = children && children.length > 0;
  // Non-leaf nodes without children are assumed to support async loading,
  // so they get an expander arrow that triggers loadData on first click.
  const showExpander = (hasChildren || (!isLeaf && !hasChildren)) && !isLeaf;
  // Modern engine uses paddingLeft via inline style because Tailwind's pl-*
  // utilities are static and don't support dynamic token values.
  const paddingLeft = level === 0 ? 0 : `calc(${level} * var(--ds-tree-indent, 24px))`;

  const isDraggable = propDraggable && !disabled;
  const isDropTarget = dropTarget?.key === nodeKey;
  const dropPosition = isDropTarget ? dropTarget!.position : null;

  const displayTitle = searchValue ? highlightText(title, searchValue) : title;

  const handleClick = () => {
    if (disabled) return;
    onFocus(nodeKey);
    const node = findNode(nodeKey);
    if (node) {
      onSelect(nodeKey, node);
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(nodeKey);
  };

  const handleCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (disableCheckbox || disabled) return;
    const node = findNode(nodeKey);
    if (node) {
      onCheck(nodeKey, node);
    }
  };

  return (
    <div className="rottay-tree-node relative" data-part="node" data-key={nodeKey} ref={(el) => nodeRef(nodeKey, el)}>
      {/* Tree lines */}
      {showLine && level > 0 && (
        <>
          {parentIsLast.map((pIsLast, i) =>
            !pIsLast ? (
              <div
                key={i}
                className="absolute top-0 bottom-0 border-l"
                data-part="connector"
                data-axis="vertical"
                style={{
                  left: `calc(${i} * var(--ds-tree-indent, 24px) + 12px)`,
                }}
              />
            ) : null
          )}
          <div
            className="absolute border-t"
            data-part="connector"
            data-axis="horizontal"
            style={{
              left: `calc(${level - 1} * var(--ds-tree-indent, 24px) + 12px)`,
              top: '50%',
              width: 12,
            }}
          />
          {isLast && (
            <div
              className="absolute border-l"
              data-part="connector"
              data-axis="vertical"
              style={{
                left: `calc(${level - 1} * var(--ds-tree-indent, 24px) + 12px)`,
                top: 0,
                height: '50%',
              }}
            />
          )}
          {!isLast && (
            <div
              className="absolute border-l"
              data-part="connector"
              data-axis="vertical"
              style={{
                left: `calc(${level - 1} * var(--ds-tree-indent, 24px) + 12px)`,
                top: 0,
                bottom: 0,
              }}
            />
          )}
        </>
      )}

      {/* Drop indicator */}
      {isDropTarget && dropPosition && dropPosition !== 'inside' && (
        <DropIndicator position={dropPosition} level={level} />
      )}

      {/* Node content */}
      {/* Node row classes use DaisyUI color utilities with opacity modifiers.
          The border-l-2 accent appears on hover (30% opacity) and selected (full),
          providing a progressive disclosure of the selection state. */}
      <div
        className={[
          'flex items-center py-1 px-2 rounded cursor-pointer',
          'transition-all duration-200 relative',
          isSelected ? 'border-l-2 font-medium' : '',
          disabled ? 'opacity-50 cursor-not-allowed' : '',
          isFocused ? 'ring-2 ring-offset-1 rounded' : '',
          blockNode ? 'w-full' : 'inline-flex',
          // "inside" drop target uses ring-inset so the indicator does not
          // overlap adjacent nodes (ring-2 alone would extend outward).
          isDropTarget && dropPosition === 'inside' ? 'ring-2 ring-inset' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        style={{
          padding: 'var(--ds-tree-node-padding, 4px 8px)',
          paddingLeft,
          ...(isFocused
            ? ({
                '--tw-ring-color': 'color-mix(in srgb, var(--ds-color-primary) 30%, transparent)',
              } as React.CSSProperties)
            : {}),
          ...(isDropTarget && dropPosition === 'inside'
            ? ({
                '--tw-ring-color': 'var(--ds-color-primary)',
              } as React.CSSProperties)
            : {}),
        }}
        onClick={handleClick}
        role="treeitem"
        aria-selected={isSelected}
        aria-expanded={showExpander ? isExpanded : undefined}
        aria-disabled={disabled}
        aria-checked={checkable ? (isHalfChecked ? 'mixed' : isChecked) : undefined}
        aria-level={level + 1}
        tabIndex={isFocused ? 0 : -1}
        data-tree-node-key={nodeKey}
        data-part="row"
        data-selected={isSelected ? 'true' : 'false'}
        data-expanded={showExpander ? (isExpanded ? 'true' : 'false') : undefined}
        data-disabled={disabled || undefined}
        data-focused={isFocused || undefined}
        data-drop-target={isDropTarget || undefined}
        data-drop-position={isDropTarget ? dropPosition : undefined}
        draggable={isDraggable}
        onDragStart={isDraggable ? (e) => onDragStartInternal(nodeKey, e) : undefined}
        onDragOver={
          propDraggable
            ? (e) => {
                e.preventDefault();
                onDragOverInternal(nodeKey, e, level);
              }
            : undefined
        }
        onDrop={
          propDraggable
            ? (e) => {
                e.preventDefault();
                onDropInternal(nodeKey, e);
              }
            : undefined
        }
        onDragEnd={propDraggable ? onDragEndInternal : undefined}
      >
        {/* Expand/collapse arrow or loading spinner */}
        {isLoading ? (
          <LoadingSpinner />
        ) : showExpander ? (
          <button
            type="button"
            data-part="tree-node-toggle"
            style={{
              width: 'var(--ds-tree-switcher-size, 24px)',
              height: 'var(--ds-tree-switcher-size, 24px)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              fontSize: 12,
              marginRight: 4,
              flexShrink: 0,
            }}
            onClick={handleToggle}
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
            tabIndex={-1}
          >
            <span
              className={['inline-block transition-transform duration-200', isExpanded ? 'rotate-90' : ''].join(' ')}
            >
              <svg
                width="var(--ds-tree-icon-size, 12px)"
                height="var(--ds-tree-icon-size, 12px)"
                viewBox="0 0 16 16"
                fill="currentColor"
              >
                <path d="M6 4l4 4-4 4z" />
              </svg>
            </span>
          </button>
        ) : (
          <span className="w-6 mr-1 flex-shrink-0" />
        )}

        {/* Checkbox */}
        {/* DaisyUI checkbox-primary provides themed coloring. The indeterminate
            state is set via ref because there is no HTML attribute for it --
            the checkbox-indeterminate class only styles, it does not set the property. */}
        {checkable && (
          <input
            type="checkbox"
            data-part="checkbox"
            className={[
              'checkbox checkbox-sm checkbox-primary mr-2 flex-shrink-0',
              isHalfChecked ? 'checkbox-indeterminate' : '',
            ].join(' ')}
            checked={isChecked}
            ref={(el) => {
              if (el) el.indeterminate = isHalfChecked && !isChecked;
            }}
            disabled={disabled || disableCheckbox}
            onChange={handleCheck}
            onClick={(e) => e.stopPropagation()}
            style={{ marginRight: 'var(--ds-tree-checkbox-margin, 8px)' }}
            aria-label={`Select ${typeof title === 'string' ? title : ''}`}
            tabIndex={-1}
          />
        )}

        {/* Icon */}
        {showIcon && icon && (
          <span
            className="mr-2 flex-shrink-0 flex items-center"
            data-part="icon"
            style={{
              width: 'var(--ds-tree-icon-size, 16px)',
              height: 'var(--ds-tree-icon-size, 16px)',
            }}
          >
            {icon}
          </span>
        )}

        {/* Title */}
        <span
          data-part="tree-node-label"
          className={['truncate', !isFiltered && filteredKeys ? 'opacity-40' : ''].join(' ')}
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
              <TreeNodeInternal
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
// ModernTree (main export)
// ---------------------------------------------------------------------------

/**
 * Modern Tree engine backed by DaisyUI/Tailwind.
 *
 * Manages expand, select, check, drag-and-drop, async loading, search/filter,
 * and keyboard navigation state. Renders tree nodes recursively via
 * `TreeNodeInternal`. Supports both controlled and uncontrolled modes for
 * expandedKeys, selectedKeys, and checkedKeys.
 *
 * @param props - Unified DS TreeProps (see Tree.types.ts)
 * @returns A DaisyUI-styled tree with role="tree" ARIA semantics
 */
export default function ModernTree(props: TreeProps): React.ReactElement {
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
  // keys we normalize them on every render (cheap string coercion). When
  // uncontrolled, internal state is the source of truth.
  const actualExpandedKeys = controlledExpandedKeys ? controlledExpandedKeys.map(normalizeTreeKey) : expandedKeys;
  const actualSelectedKeys = controlledSelectedKeys ? controlledSelectedKeys.map(normalizeTreeKey) : selectedKeys;
  const actualCheckedKeys = Array.isArray(controlledCheckedKeys)
    ? controlledCheckedKeys.map(normalizeTreeKey)
    : controlledCheckedKeys?.checked.map(normalizeTreeKey) ?? checkedKeys;

  // Half-checked (indeterminate) keys: a parent is half-checked when some but
  // not all of its descendants are checked. Skipped in strict mode because
  // parent/child checking is independent there.
  const halfCheckedKeys = useMemo(() => {
    if (!checkable || treeCheckStrictly) return [];
    return computeHalfCheckedKeys(treeData, actualCheckedKeys, parentMap);
  }, [treeData, actualCheckedKeys, parentMap, checkable, treeCheckStrictly]);

  // Search/filter
  const filterResult = useMemo(() => {
    if (!filterTreeNode || !searchValue) return null;
    return filterTree(treeData, filterTreeNode, searchValue);
  }, [treeData, filterTreeNode, searchValue]);

  const filteredKeys = filterResult?.filteredKeys ?? null;

  // Auto-expand ancestor nodes of search matches so the user can see the
  // matching nodes without manually opening each parent. Merges with existing
  // expanded keys to avoid collapsing nodes the user already opened.
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

      // Async loading
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
        // Independent mode: toggle only this node
        const newKeys = actualCheckedKeys.includes(key)
          ? actualCheckedKeys.filter((k) => k !== key)
          : [...actualCheckedKeys, key];
        setCheckedKeys(newKeys);
        onCheck?.(newKeys, { node, checked: !actualCheckedKeys.includes(key) });
      } else {
        // Cascade mode: toggling a node propagates downward to all descendants
        // and then bubbles upward to fix parent states. This two-phase approach
        // is simpler than a single-pass algorithm and handles arbitrary depth.
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

        // Bubble up: check parents if all their children are now checked
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

        const newHalfChecked = computeHalfCheckedKeys(treeData, newChecked, parentMap);
        onCheck?.({ checked: newChecked, halfChecked: newHalfChecked }, { node, checked: isChecking });
      }
    },
    [actualCheckedKeys, treeCheckStrictly, parentMap, findNode, treeData, onCheck]
  );

  // -----------------------------------------------------------------------
  // Drag and drop -- uses HTML5 Drag and Drop API. Drop position is inferred
  // from cursor Y within the target node: top 25% = before, middle = inside
  // (reparent), bottom 25% = after. This 3-zone model matches macOS Finder
  // and Windows Explorer tree drag semantics.
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

  const handleDragOver = useCallback(
    (key: TreeEngineKey, e: React.DragEvent, level: number) => {
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
  // ArrowUp/Down = move focus, ArrowRight = expand or no-op if leaf,
  // ArrowLeft = collapse or move to parent, Space = toggle checkbox,
  // Enter = select node. Focus is tracked via focusedKey state and
  // programmatically moved to the DOM element via nodeRefs.
  // -----------------------------------------------------------------------

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Auto-focus the first visible node when the tree receives keyboard
      // input but no node is focused yet (e.g., first Tab into the tree).
      if (!focusedKey) {
        if (visibleKeys.length > 0) setFocusedKey(visibleKeys[0]);
        return;
      }
      const currentIndex = visibleKeys.indexOf(focusedKey);
      if (currentIndex === -1) return;

      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          if (currentIndex < visibleKeys.length - 1) {
            const nextKey = visibleKeys[currentIndex + 1];
            setFocusedKey(nextKey);
            nodeRefs.current.get(nextKey)?.querySelector<HTMLElement>('[data-tree-node-key]')?.focus();
          }
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          if (currentIndex > 0) {
            const prevKey = visibleKeys[currentIndex - 1];
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
            // Move to parent
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

  return (
    <div
      ref={treeContainerRef}
      className={`rottay-tree rottay-tree--modern ${className}`}
      data-part="root"
      style={style}
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
          <TreeNodeInternal
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

ModernTree.displayName = 'Tree.Modern';
