/**
 * Tree - Rustic Engine (Vanilla HTML/CSS)
 *
 * Full-featured headless tree implementation using vanilla HTML and CSS variables.
 * Supports drag-and-drop, async loading, search/filter, checkable with
 * half-checked cascading, tree lines, keyboard navigation, and full ARIA.
 * Maximum accessibility and customization with no external dependencies.
 *
 * @module Tree/Rustic
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

function highlightText(
  text: React.ReactNode,
  searchValue: string,
): React.ReactNode {
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
        style={{
          backgroundColor: 'var(--ds-tree-highlight-bg, #fef3c7)',
          color: 'var(--ds-tree-highlight-color, #92400e)',
          borderRadius: '2px',
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
// CSS-in-JS styles (all using CSS variables)
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
    backgroundColor: 'var(--ds-tree-drop-indicator-color, var(--ds-color-primary))',
    borderRadius: '1px',
    animation: 'rottay-tree-drop-line-in 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
  } as React.CSSProperties,
};

// ---------------------------------------------------------------------------
// Keyframes injection (once)
// ---------------------------------------------------------------------------

let stylesInjected = false;
function injectKeyframes() {
  if (stylesInjected || typeof document === 'undefined') return;
  stylesInjected = true;
  const sheet = document.createElement('style');
  sheet.textContent = `
    @keyframes rottay-tree-spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes rottay-tree-drop-line-in {
      from { opacity: 0; transform: scaleX(0.5); }
      to { opacity: 1; transform: scaleX(1); }
    }
  `;
  document.head.appendChild(sheet);
}

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
  dropTarget: { key: TreeEngineKey; position: 'before' | 'inside' | 'after' } | null;
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
}) => {
  const normalizedNodeKey = normalizeTreeKey(nodeKey);
  const hasChildren = children && children.length > 0;
  const showExpander = (hasChildren || (!isLeaf && !hasChildren)) && !isLeaf;
  const paddingLeft = level * 24 + 8;

  const isDraggable = propDraggable && !disabled;
  const isDropTarget = dropTarget?.key === normalizedNodeKey;
  const dropPosition = isDropTarget ? dropTarget!.position : null;

  const displayTitle = searchValue ? highlightText(title, searchValue) : title;

  // Node row style
  const nodeStyle: React.CSSProperties = {
    display: blockNode ? 'flex' : 'inline-flex',
    width: blockNode ? '100%' : undefined,
    alignItems: 'center',
    padding: '4px 8px',
    paddingLeft,
    cursor: disabled ? 'not-allowed' : 'pointer',
    borderRadius: 'var(--ds-tree-node-radius, 4px)',
    backgroundColor: isSelected
      ? 'var(--ds-tree-node-selected-bg, var(--ds-color-alpha-primary-10))'
      : isDropTarget && dropPosition === 'inside'
        ? 'var(--ds-tree-drop-bg, rgba(59, 130, 246, 0.05))'
        : 'transparent',
    color: isSelected
      ? 'var(--ds-tree-node-selected-color, var(--ds-color-primary))'
      : 'inherit',
    opacity: disabled ? 0.5 : !isFiltered && filteredKeys ? 0.4 : 1,
    transition: 'background-color 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.15s',
    outline: 'none',
    boxShadow: isFocused
      ? '0 0 0 2px var(--ds-tree-focus-ring-color, var(--ds-color-primary-200, rgba(59, 130, 246, 0.3)))'
      : isDropTarget && dropPosition === 'inside'
        ? 'inset 0 0 0 2px var(--ds-tree-drop-indicator-color, var(--ds-color-primary))'
        : undefined,
    position: 'relative',
    borderLeft: isSelected
      ? '3px solid var(--ds-color-primary, var(--ds-tree-node-selected-color))'
      : '3px solid transparent',
  };

  const switcherStyle: React.CSSProperties = {
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '4px',
    transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
    transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    flexShrink: 0,
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    padding: 0,
    color: 'inherit',
  };

  const checkboxStyle: React.CSSProperties = {
    marginRight: '8px',
    width: '16px',
    height: '16px',
    cursor: disabled || disableCheckbox ? 'not-allowed' : 'pointer',
    accentColor: 'var(--ds-tree-checkbox-color, var(--ds-color-primary))',
    flexShrink: 0,
  };

  const iconStyle: React.CSSProperties = {
    marginRight: '8px',
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  };

  // Tree line styles
  const treeLineConnectors: React.ReactNode[] = [];
  if (showLine && level > 0) {
    // Vertical lines from ancestors
    for (let i = 0; i < parentIsLast.length; i++) {
      if (!parentIsLast[i]) {
        treeLineConnectors.push(
          <div
            key={`vline-${i}`}
            style={{
              position: 'absolute',
              left: i * 24 + 12,
              top: 0,
              bottom: 0,
              borderLeft: '1px solid var(--ds-tree-line-color, var(--ds-color-border-primary))',
              pointerEvents: 'none',
            }}
          />,
        );
      }
    }
    // Horizontal connector
    treeLineConnectors.push(
      <div
        key="hline"
        style={{
          position: 'absolute',
          left: (level - 1) * 24 + 12,
          top: '50%',
          width: 12,
          borderTop: '1px solid var(--ds-tree-line-color, var(--ds-color-border-primary))',
          pointerEvents: 'none',
        }}
      />,
    );
    // Vertical line from parent (half or full)
    if (isLast) {
      treeLineConnectors.push(
        <div
          key="vline-self"
          style={{
            position: 'absolute',
            left: (level - 1) * 24 + 12,
            top: 0,
            height: '50%',
            borderLeft: '1px solid var(--ds-tree-line-color, var(--ds-color-border-primary))',
            pointerEvents: 'none',
          }}
        />,
      );
    } else {
      treeLineConnectors.push(
        <div
          key="vline-self"
          style={{
            position: 'absolute',
            left: (level - 1) * 24 + 12,
            top: 0,
            bottom: 0,
            borderLeft: '1px solid var(--ds-tree-line-color, var(--ds-color-border-primary))',
            pointerEvents: 'none',
          }}
        />,
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

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isSelected && !disabled && !(isDropTarget && dropPosition === 'inside')) {
      e.currentTarget.style.backgroundColor =
        'var(--ds-tree-node-hover-bg, rgba(0, 0, 0, 0.04))';
      e.currentTarget.style.borderLeft = '3px solid var(--ds-color-primary, #1677ff)';
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isSelected && !(isDropTarget && dropPosition === 'inside')) {
      e.currentTarget.style.backgroundColor = 'transparent';
      e.currentTarget.style.borderLeft = '3px solid transparent';
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
      data-key={normalizedNodeKey}
      style={{ position: 'relative' }}
      ref={(el) => nodeRef(normalizedNodeKey, el)}
    >
      {/* Tree line connectors */}
      {treeLineConnectors}

      {/* Drop indicator line */}
      {isDropTarget && dropPosition && dropPosition !== 'inside' && (
        <div
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
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        role="treeitem"
        aria-selected={isSelected}
        aria-expanded={showExpander ? isExpanded : undefined}
        aria-disabled={disabled}
        aria-checked={checkable ? (isHalfChecked ? 'mixed' : isChecked) : undefined}
        aria-level={level + 1}
        tabIndex={isFocused ? 0 : -1}
        data-tree-node-key={normalizedNodeKey}
        draggable={isDraggable}
        onDragStart={
          isDraggable
            ? (e) => onDragStartInternal(normalizedNodeKey, e)
            : undefined
        }
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

        {/* Checkbox */}
        {checkable && (
          <input
            type="checkbox"
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
        {showIcon && icon && <span style={iconStyle}>{icon}</span>}

        {/* Title */}
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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

  // Inject keyframe animation for spinner
  useEffect(() => {
    injectKeyframes();
  }, []);

  // Refs
  const treeContainerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Map<TreeEngineKey, HTMLDivElement>>(new Map());
  const loadedKeysRef = useRef<Set<TreeEngineKey>>(new Set());

  const registerNodeRef = useCallback(
    (key: TreeEngineKey, el: HTMLDivElement | null) => {
      if (el) nodeRefs.current.set(key, el);
      else nodeRefs.current.delete(key);
    },
    [],
  );

  // Find node helper
  const findNode = useCallback(
    (key: TreeEngineKey): TreeDataNode | undefined => findNodeByKey(treeData, key),
    [treeData],
  );

  // Parent map
  const parentMap = useMemo(() => buildParentMap(treeData), [treeData]);

  // State
  const [expandedKeys, setExpandedKeys] = useState<TreeEngineKey[]>(
    defaultExpandAll ? collectAllKeys(treeData) : defaultExpandedKeys.map(normalizeTreeKey),
  );
  const [selectedKeys, setSelectedKeys] = useState<TreeEngineKey[]>(
    defaultSelectedKeys.map(normalizeTreeKey),
  );
  const [checkedKeys, setCheckedKeys] = useState<TreeEngineKey[]>(
    Array.isArray(defaultCheckedKeys) ? defaultCheckedKeys.map(normalizeTreeKey) : [],
  );
  const [focusedKey, setFocusedKey] = useState<TreeEngineKey | null>(null);
  const [loadingKeys, setLoadingKeys] = useState<TreeEngineKey[]>([]);
  const [dragKey, setDragKey] = useState<TreeEngineKey | null>(null);
  const [dropTarget, setDropTarget] = useState<{
    key: TreeEngineKey;
    position: 'before' | 'inside' | 'after';
  } | null>(null);

  // Resolve controlled vs uncontrolled
  const actualExpandedKeys = controlledExpandedKeys
    ? controlledExpandedKeys.map(normalizeTreeKey)
    : expandedKeys;
  const actualSelectedKeys = controlledSelectedKeys
    ? controlledSelectedKeys.map(normalizeTreeKey)
    : selectedKeys;
  const actualCheckedKeys = Array.isArray(controlledCheckedKeys)
    ? controlledCheckedKeys.map(normalizeTreeKey)
    : (controlledCheckedKeys?.checked.map(normalizeTreeKey) ?? checkedKeys);

  // Half-checked computation
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

  // Auto-expand parents of search matches
  useEffect(() => {
    if (filterResult && filterResult.expandKeys.length > 0) {
      setExpandedKeys((prev) => {
        const combined = new Set([...prev, ...filterResult.expandKeys]);
        return Array.from(combined);
      });
    }
  }, [filterResult]);

  // Visible flat keys for keyboard navigation
  const visibleKeys = useMemo(
    () => flattenVisibleKeys(treeData, actualExpandedKeys),
    [treeData, actualExpandedKeys],
  );

  // -----------------------------------------------------------------------
  // Event handlers
  // -----------------------------------------------------------------------

  const handleToggle = useCallback(
    async (key: TreeEngineKey) => {
      const isExpanding = !actualExpandedKeys.includes(key);
      const newKeys = isExpanding
        ? [...actualExpandedKeys, key]
        : actualExpandedKeys.filter((k) => k !== key);
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
    [actualExpandedKeys, findNode, onExpand, loadData],
  );

  const handleSelect = useCallback(
    (key: TreeEngineKey, node: TreeDataNode) => {
      if (node.selectable === false) return;
      const newKeys = actualSelectedKeys.includes(key)
        ? actualSelectedKeys.filter((k) => k !== key)
        : [key];
      setSelectedKeys(newKeys);
      onSelect?.(newKeys, { node, selected: !actualSelectedKeys.includes(key) });
    },
    [actualSelectedKeys, onSelect],
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

        // Bubble up: check parents if all children are checked
        let changed = true;
        while (changed) {
          changed = false;
          for (const [childK, parentK] of parentMap) {
            const parentNode = findNode(parentK);
            if (!parentNode || !parentNode.children) continue;
            const allChildrenChecked = parentNode.children.every((c) =>
              newChecked.includes(normalizeTreeKey(c.key)),
            );
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
        onCheck?.(
          { checked: newChecked, halfChecked: newHalfChecked },
          { node, checked: isChecking },
        );
      }
    },
    [actualCheckedKeys, treeCheckStrictly, parentMap, findNode, treeData, onCheck],
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
    [findNode, onDragStart],
  );

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
    [dragKey],
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
    [dragKey, dropTarget, findNode, onDrop],
  );

  const handleDragEnd = useCallback(() => {
    setDragKey(null);
    setDropTarget(null);
  }, []);

  // -----------------------------------------------------------------------
  // Keyboard navigation
  // -----------------------------------------------------------------------

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
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
            nodeRefs.current
              .get(nextKey)
              ?.querySelector<HTMLElement>('[data-tree-node-key]')
              ?.focus();
          }
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          if (currentIndex > 0) {
            const prevKey = visibleKeys[currentIndex - 1];
            setFocusedKey(prevKey);
            nodeRefs.current
              .get(prevKey)
              ?.querySelector<HTMLElement>('[data-tree-node-key]')
              ?.focus();
          }
          break;
        }
        case 'ArrowRight': {
          e.preventDefault();
          const node = findNode(focusedKey);
          if (
            node &&
            node.children &&
            node.children.length > 0 &&
            !actualExpandedKeys.includes(focusedKey)
          ) {
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
              nodeRefs.current
                .get(parentKey)
                ?.querySelector<HTMLElement>('[data-tree-node-key]')
                ?.focus();
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
    ],
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
