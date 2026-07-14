'use client';

/**
 * @fileoverview Modern (token-driven) engine for the TreeView pattern.
 *
 * A fully custom tree implementation without Ant Design's Tree component.
 * Manages expand/collapse, selection, and check state internally (via Sets)
 * while supporting controlled mode through external key arrays. Each node row
 * uses DS token inline styles for consistent styling, and an inline SVG
 * chevron that rotates on expand.
 *
 * @example
 * <ModernTreeView
 *   data={[{ key: '1', label: 'Folder', children: [{ key: '1-1', label: 'File.ts' }] }]}
 *   searchable
 *   multiple
 *   onSelect={(keys) => setSelected(keys)}
 * />
 */

import React, { useState, useMemo, useCallback } from 'react';
import type { TreeViewProps, TreeNode } from '../TreeView.types';
import { panelCardStyle } from '../../../_internal/engines/modern/styles';

const ROOT_CLASS_NAME = 'ds-pattern-tree-view ds-engine-modern';

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
 * Modern (token-driven) engine for the TreeView pattern component.
 *
 * Unlike the Classic engine which delegates to Ant Design's Tree, this engine
 * implements all tree interactions from scratch using Sets for O(1) key
 * lookups. It supports both controlled and uncontrolled modes for expanded,
 * selected, and checked keys.
 *
 * @param props - {@link TreeViewProps} controlling tree data, selection, checking, and drag-drop.
 * @returns A searchable, interactive tree rendered with DS token inline styles.
 */
export default function ModernTreeView(props: TreeViewProps) {
  const {
    data, renderNode, onSelect, onExpand, expandedKeys: controlledExpanded,
    selectedKeys: controlledSelected, defaultExpandedKeys, checkable, checkedKeys: controlledChecked,
    onCheck, draggable, onDrop, searchable, searchPlaceholder = 'Search...', multiple,
    loading, className, style,
  } = props;

  // Internal state for uncontrolled mode. When controlled key arrays are
  // provided, these are ignored in favor of the external source of truth.
  const [internalExpanded, setInternalExpanded] = useState<Set<string>>(new Set(defaultExpandedKeys ?? []));
  const [internalSelected, setInternalSelected] = useState<Set<string>>(new Set());
  const [internalChecked, setInternalChecked] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  // Resolve controlled vs. uncontrolled sets. New Set() is cheap for typical
  // tree sizes (<1000 nodes) and avoids stale-reference bugs.
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

  /** Recursively renders tree nodes with depth-based indentation via paddingLeft. */
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
            className={`flex items-center gap-1.5 px-2 py-1 rounded-md cursor-pointer transition-colors ${
              selected ? 'font-medium' : ''
            } ${node.disabled ? 'opacity-40 pointer-events-none' : ''}`}
            style={{
              paddingLeft: `${depth * 1.25 + 0.5}rem`,
              ...(selected ? { background: 'color-mix(in srgb, var(--ds-color-primary) 10%, transparent)', color: 'var(--ds-color-primary)' } : {}),
            }}
            onClick={() => handleSelect(node.key)}
            draggable={draggable}
          >
            <button
              data-part="toggle"
              data-visible={Boolean(hasChildren)}
              data-expanded={expanded}
              style={{ background: 'transparent', color: 'var(--ds-color-text-primary)', height: 24, width: 24, padding: 0, fontSize: 12, borderRadius: 'var(--ds-radius-md)', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', visibility: hasChildren ? 'visible' : 'hidden' }}
              onClick={(e) => { e.stopPropagation(); handleToggle(node.key); }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-90' : ''}`}
                viewBox="0 0 20 20" fill="currentColor"
              >
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            {checkable && (
              <input data-part="checkbox" type="checkbox" style={{ width: 14, height: 14, cursor: 'pointer', accentColor: 'var(--ds-color-primary)' }} checked={checked} onChange={() => handleCheck(node.key)} onClick={(e) => e.stopPropagation()} />
            )}
            {draggable && <span data-part="drag-handle" className="cursor-grab text-xs" style={{ color: 'var(--ds-color-text-secondary)' }}>::</span>}
            {node.icon && <span className="flex-shrink-0">{node.icon}</span>}
            <span className="text-sm truncate flex-1">{renderNode ? renderNode(node, depth) : node.label}</span>
          </div>
          {hasChildren && expanded && renderNodes(node.children!, depth + 1)}
        </div>
      );
    });
  }

  if (loading) {
    return (
      <div data-part="root" data-loading="true" className={[ROOT_CLASS_NAME, className].filter(Boolean).join(' ')} style={{ ...panelCardStyle, boxShadow: 'var(--ds-elevation-1)', ...style }}>
        <div data-part="skeleton-list" className="animate-pulse" style={{ padding: 20 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div data-part="skeleton" key={i} style={{ height: 24, borderRadius: 'var(--ds-radius-sm)', marginLeft: `${(i % 3) * 1.25}rem`, width: `${70 - (i % 3) * 10}%`, background: 'var(--ds-surface-panel)' }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div data-part="root" data-loading="false" data-empty={filteredData.length === 0} className={[ROOT_CLASS_NAME, className].filter(Boolean).join(' ')} style={{ ...panelCardStyle, boxShadow: 'var(--ds-elevation-1)', ...style }}>
      <div style={{ padding: 12 }}>
        {searchable && (
          <input
            data-part="search-input"
            type="text"
            className="w-full mb-2"
            style={{ padding: '6px 10px', fontSize: 13, borderRadius: 'var(--ds-radius-md)', border: '1px solid var(--ds-color-border)', background: 'transparent', color: 'inherit', width: '100%' }}
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        )}
        <div data-part="tree">{renderNodes(filteredData, 0)}</div>
      </div>
    </div>
  );
}
