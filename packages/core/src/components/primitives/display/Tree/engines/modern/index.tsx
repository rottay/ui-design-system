/**
 * Tree - Modern Engine (DaisyUI/Tailwind)
 *
 * Full-featured tree implementation using DaisyUI classes and Tailwind CSS.
 * Supports drag-and-drop, async loading, search/filter, checkable with
 * half-checked cascading, tree lines, keyboard navigation, and full ARIA.
 *
 * @module Tree/Modern
 */

'use client';

import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import type { TreeProps, TreeDataNode } from '../../types';
import { TREE_DEFAULTS } from '../../types';
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
} from '../../utils';

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
      <span className="bg-warning/30 text-warning-content rounded-sm px-0.5">
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

const DropIndicator: React.FC<{ position: 'before' | 'inside' | 'after'; level: number }> = ({
  position,
  level,
}) => {
  if (position === 'inside') return null;
  const left = level * 24;
  return (
    <div
      className="absolute left-0 right-0 pointer-events-none z-10"
      style={{
        top: position === 'before' ? -1 : undefined,
        bottom: position === 'after' ? -1 : undefined,
        paddingLeft: left,
      }}
    >
      <div className="h-0.5 bg-primary rounded-full" style={{ animation: 'rottay-drop-indicator 0.3s ease-out' }} />
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
  dropTarget: { key: TreeEngineKey; position: 'before' | 'inside' | 'after' } | null;
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
  const showExpander = (hasChildren || (!isLeaf && !hasChildren)) && !isLeaf;
  const paddingLeft = level * 24;

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
    <div
      className="rottay-tree-node relative"
      data-key={nodeKey}
      ref={(el) => nodeRef(nodeKey, el)}
    >
      {/* Tree lines */}
      {showLine && level > 0 && (
        <>
          {parentIsLast.map((pIsLast, i) =>
            !pIsLast ? (
              <div
                key={i}
                className="absolute top-0 bottom-0 border-l border-base-300"
                style={{ left: i * 24 + 12 }}
              />
            ) : null,
          )}
          <div
            className="absolute border-t border-base-300"
            style={{
              left: (level - 1) * 24 + 12,
              top: '50%',
              width: 12,
            }}
          />
          {isLast && (
            <div
              className="absolute border-l border-base-300"
              style={{
                left: (level - 1) * 24 + 12,
                top: 0,
                height: '50%',
              }}
            />
          )}
          {!isLast && (
            <div
              className="absolute border-l border-base-300"
              style={{
                left: (level - 1) * 24 + 12,
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
      <div
        className={[
          'flex items-center py-1 px-2 rounded cursor-pointer',
          'transition-all duration-200 relative',
          isSelected ? 'bg-primary/10 border-l-2 border-primary text-primary font-medium' : 'hover:bg-base-200/50 hover:border-l-2 hover:border-primary/30',
          disabled ? 'opacity-50 cursor-not-allowed' : '',
          isFocused ? 'ring-2 ring-primary/30 ring-offset-1 rounded' : '',
          blockNode ? 'w-full' : 'inline-flex',
          isDropTarget && dropPosition === 'inside'
            ? 'ring-2 ring-primary ring-inset bg-primary/5'
            : '',
        ]
          .filter(Boolean)
          .join(' ')}
        style={{ paddingLeft }}
        onClick={handleClick}
        role="treeitem"
        aria-selected={isSelected}
        aria-expanded={showExpander ? isExpanded : undefined}
        aria-disabled={disabled}
        aria-checked={checkable ? (isHalfChecked ? 'mixed' : isChecked) : undefined}
        aria-level={level + 1}
        tabIndex={isFocused ? 0 : -1}
        data-tree-node-key={nodeKey}
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
            className="btn btn-ghost btn-xs btn-circle mr-1 flex-shrink-0"
            onClick={handleToggle}
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
            tabIndex={-1}
          >
            <span
              className={[
                'inline-block transition-transform duration-200',
                isExpanded ? 'rotate-90' : '',
              ].join(' ')}
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                <path d="M6 4l4 4-4 4z" />
              </svg>
            </span>
          </button>
        ) : (
          <span className="w-6 mr-1 flex-shrink-0" />
        )}

        {/* Checkbox */}
        {checkable && (
          <input
            type="checkbox"
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
            aria-label={`Select ${typeof title === 'string' ? title : ''}`}
            tabIndex={-1}
          />
        )}

        {/* Icon */}
        {showIcon && icon && (
          <span className="mr-2 flex-shrink-0 flex items-center">{icon}</span>
        )}

        {/* Title */}
        <span className={[
          'truncate',
          !isFiltered && filteredKeys ? 'opacity-40' : '',
        ].join(' ')}>
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
    return computeHalfCheckedKeys(treeData, actualCheckedKeys, parentMap);
  }, [treeData, actualCheckedKeys, parentMap, checkable, treeCheckStrictly]);

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
        // Independent mode: toggle only this node
        const newKeys = actualCheckedKeys.includes(key)
          ? actualCheckedKeys.filter((k) => k !== key)
          : [...actualCheckedKeys, key];
        setCheckedKeys(newKeys);
        onCheck?.(newKeys, { node, checked: !actualCheckedKeys.includes(key) });
      } else {
        // Cascade mode: check/uncheck node + all descendants, then recompute parents
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

        const newHalfChecked = computeHalfCheckedKeys(treeData, newChecked, parentMap);
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
    ],
  );

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <div
      ref={treeContainerRef}
      className={`rottay-tree rottay-tree--modern ${className}`}
      style={style}
      role="tree"
      aria-multiselectable={props.multiple || false}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <style dangerouslySetInnerHTML={{ __html: `@keyframes rottay-drop-indicator{from{opacity:0;transform:scaleX(0.3)}to{opacity:1;transform:scaleX(1)}}` }} />
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
