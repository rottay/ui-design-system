'use client';

/**
 * @fileoverview Rustic (Vanilla CSS) engine for the TreeView pattern.
 *
 * Zero-dependency tree implementation using authored engine CSS and bounded
 * runtime layout values backed by `--ds-*` custom properties. Interactive affordances (expand/collapse toggle,
 * selection highlight, checkbox, drag handle) are built from native HTML
 * elements without any CSS framework. Style objects are pre-computed in the
 * `s` namespace for readability and to avoid repeated object allocations
 * during renders.
 *
 * @example
 * <RusticTreeView
 *   data={[{ key: 'src', label: 'src/', children: [{ key: 'index', label: 'index.ts' }] }]}
 *   searchable
 *   checkable
 *   draggable
 * />
 */

import React, { useState, useMemo, useCallback } from 'react';
import type { TreeViewProps, TreeNode } from '../TreeView.types';

const ROOT_CLASS_NAME = 'ds-pattern-tree-view ds-engine-rustic';

/**
 * Recursively filters the tree, keeping any node whose label matches the query
 * or whose descendants match, preserving the full ancestor chain.
 */
function filterTree(nodes: TreeNode[], query: string): TreeNode[] {
  const q = query.toLowerCase();
  return nodes
    .map((node) => {
      const children = node.children ? filterTree(node.children, query) : [];
      const labelStr = typeof node.label === 'string' ? node.label : '';
      if (labelStr.toLowerCase().includes(q) || children.length > 0) {
        return { ...node, children: children.length > 0 ? children : node.children };
      }
      return null;
    })
    .filter(Boolean) as TreeNode[];
}

/**
 * Pre-computed style objects for tree UI elements.
 * Using a namespace object avoids recreating style objects on every render
 * and keeps the JSX clean. Function-valued entries (nodeRow, toggleBtn,
 * skeleton) accept dynamic parameters for state-dependent styling.
 */
const s = {
  container: {
    fontFamily: 'var(--ds-font-family-base)',
    padding: '0.75rem 1rem',
  } as React.CSSProperties,
  searchInput: {
    width: '100%',
    padding: '0.375rem 0.625rem',
    fontSize: 'var(--ds-font-size-sm)',
    marginBottom: '0.5rem',
  } as React.CSSProperties,
  nodeRow: (depth: number, selected: boolean, disabled?: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.25rem 0.5rem',
    paddingLeft: `${depth * 1.25 + 0.5}rem`,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.4 : 1,
    fontWeight: selected ? 500 : 400,
    fontSize: 'var(--ds-font-size-sm)',
    transition: 'background 100ms',
  } as React.CSSProperties),
  toggleBtn: (visible: boolean) => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 20,
    height: 20,
    cursor: 'pointer',
    padding: 0,
    fontSize: 12,
    flexShrink: 0,
    visibility: visible ? 'visible' : 'hidden',
  } as React.CSSProperties),
  checkbox: {
    width: 14,
    height: 14,
    cursor: 'pointer',
    flexShrink: 0,
  } as React.CSSProperties,
  dragHandle: {
    cursor: 'grab',
    fontSize: 'var(--ds-font-size-xs)',
    flexShrink: 0,
    userSelect: 'none' as const,
  } as React.CSSProperties,
  skeleton: (w: string, h: string) => ({
    width: w,
    height: h,
    animation: 'pulse 1.5s ease-in-out infinite',
  } as React.CSSProperties),
};

/**
 * Rustic (Vanilla CSS) engine for the TreeView pattern component.
 *
 * Implements expand/collapse, selection, check, and drag-drop from scratch
 * using Sets for O(1) lookups, just like the Modern engine, but renders
 * everything with inline styles instead of Tailwind classes. Supports both
 * controlled and uncontrolled modes.
 *
 * @param props - {@link TreeViewProps} controlling tree data, selection, checking, and drag-drop.
 * @returns A searchable, interactive tree rendered with inline CSS and DS tokens.
 */
export default function RusticTreeView(props: TreeViewProps) {
  const {
    data, renderNode, onSelect, onExpand, expandedKeys: controlledExpanded,
    selectedKeys: controlledSelected, defaultExpandedKeys, checkable, checkedKeys: controlledChecked,
    onCheck, draggable, onDrop, searchable, searchPlaceholder = 'Search...', multiple,
    loading, className, style,
  } = props;

  // Internal state for uncontrolled mode. Ignored when controlled key arrays
  // are provided by the consumer.
  const [internalExpanded, setInternalExpanded] = useState<Set<string>>(new Set(defaultExpandedKeys ?? []));
  const [internalSelected, setInternalSelected] = useState<Set<string>>(new Set());
  const [internalChecked, setInternalChecked] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  // Resolve controlled vs. uncontrolled. Creating a new Set per render is
  // acceptable for typical tree sizes and avoids stale-reference bugs.
  const expandedSet = controlledExpanded ? new Set(controlledExpanded) : internalExpanded;
  const selectedSet = controlledSelected ? new Set(controlledSelected) : internalSelected;
  const checkedSet = controlledChecked ? new Set(controlledChecked) : internalChecked;

  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    return filterTree(data, searchQuery);
  }, [data, searchQuery]);

  const handleToggle = useCallback((key: string) => {
    const next = new Set(expandedSet);
    if (next.has(key)) next.delete(key); else next.add(key);
    if (!controlledExpanded) setInternalExpanded(next);
    onExpand?.([...next]);
  }, [expandedSet, controlledExpanded, onExpand]);

  const handleSelect = useCallback((key: string) => {
    let next: Set<string>;
    if (multiple) {
      next = new Set(selectedSet);
      if (next.has(key)) next.delete(key); else next.add(key);
    } else {
      next = new Set([key]);
    }
    if (!controlledSelected) setInternalSelected(next);
    onSelect?.([...next]);
  }, [selectedSet, controlledSelected, onSelect, multiple]);

  const handleCheck = useCallback((key: string) => {
    const next = new Set(checkedSet);
    if (next.has(key)) next.delete(key); else next.add(key);
    if (!controlledChecked) setInternalChecked(next);
    onCheck?.([...next]);
  }, [checkedSet, controlledChecked, onCheck]);

  /** Recursively renders tree nodes. Depth drives left-padding via `s.nodeRow`. */
  function renderNodes(nodes: TreeNode[], depth: number): React.ReactNode {
    return nodes.map((node) => {
      const hasChildren = node.children && node.children.length > 0;
      const expanded = expandedSet.has(node.key);
      const selected = selectedSet.has(node.key);
      const checked = checkedSet.has(node.key);

      return (
        <div
          data-part="node"
          data-depth={depth}
          data-expanded={expanded}
          data-selected={selected}
          data-checked={checked}
          data-disabled={Boolean(node.disabled)}
          key={node.key}
        >
          <div
            data-part="node-row"
            data-selected={selected}
            data-disabled={Boolean(node.disabled)}
            className="ds-tree-view-rustic__node-row"
            style={s.nodeRow(depth, selected, node.disabled)}
            onClick={() => !node.disabled && handleSelect(node.key)}
            draggable={draggable && !node.disabled}
          >
            <button
              data-part="toggle"
              data-visible={Boolean(hasChildren)}
              data-expanded={expanded}
              className="ds-tree-view-rustic__toggle"
              style={s.toggleBtn(!!hasChildren)}
              onClick={(e) => { e.stopPropagation(); handleToggle(node.key); }}
            >
              {expanded ? '\u25BE' : '\u25B8'}
            </button>
            {checkable && (
              <input
                data-part="checkbox"
                className="ds-tree-view-rustic__checkbox"
                type="checkbox"
                style={s.checkbox}
                checked={checked}
                onChange={() => handleCheck(node.key)}
                onClick={(e) => e.stopPropagation()}
              />
            )}
            {draggable && <span data-part="drag-handle" className="ds-tree-view-rustic__drag-handle" style={s.dragHandle}>::</span>}
            {node.icon && <span style={{ flexShrink: 0 }}>{node.icon}</span>}
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {renderNode ? renderNode(node, depth) : node.label}
            </span>
          </div>
          {hasChildren && expanded && renderNodes(node.children!, depth + 1)}
        </div>
      );
    });
  }

  if (loading) {
    return (
      <div data-part="root" data-loading="true" className={[ROOT_CLASS_NAME, className].filter(Boolean).join(' ')} style={{ ...s.container, ...style }}>
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
        {[1, 2, 3, 4, 5].map((i) => (
          <div data-part="skeleton" className="ds-tree-view-rustic__skeleton" key={i} style={{ ...s.skeleton(`${70 - (i % 3) * 10}%`, '1.25rem'), marginLeft: `${(i % 3) * 1.25}rem`, marginBottom: '0.375rem' }} />
        ))}
      </div>
    );
  }

  return (
    <div data-part="root" data-loading="false" data-empty={filteredData.length === 0} className={[ROOT_CLASS_NAME, className].filter(Boolean).join(' ')} style={{ ...s.container, ...style }}>
      {searchable && (
        <input
          data-part="search-input"
          className="ds-tree-view-rustic__search-input"
          type="text"
          style={s.searchInput}
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      )}
      <div data-part="tree">{renderNodes(filteredData, 0)}</div>
    </div>
  );
}
