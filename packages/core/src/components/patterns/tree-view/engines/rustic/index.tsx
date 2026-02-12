'use client';

/**
 * TreeView - Rustic Engine (Vanilla HTML/CSS with --ds-* vars)
 */

import React, { useState, useMemo, useCallback } from 'react';
import type { TreeViewProps, TreeNode } from '../../types';

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

const s = {
  container: {
    fontFamily: 'var(--ds-font-family-base)',
    color: 'var(--ds-color-neutral-900)',
    background: 'var(--ds-color-neutral-0, #fff)',
    border: '1px solid var(--ds-color-neutral-200)',
    borderRadius: 'var(--ds-radius-lg)',
    padding: '0.75rem 1rem',
  } as React.CSSProperties,
  searchInput: {
    width: '100%',
    padding: '0.375rem 0.625rem',
    fontSize: 'var(--ds-font-size-sm)',
    border: '1px solid var(--ds-color-neutral-300)',
    borderRadius: 'var(--ds-radius-md)',
    outline: 'none',
    background: 'var(--ds-color-neutral-0, #fff)',
    color: 'var(--ds-color-neutral-900)',
    marginBottom: '0.5rem',
  } as React.CSSProperties,
  nodeRow: (depth: number, selected: boolean, disabled?: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.25rem 0.5rem',
    paddingLeft: `${depth * 1.25 + 0.5}rem`,
    borderRadius: 'var(--ds-radius-md)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.4 : 1,
    background: selected ? 'var(--ds-color-primary-50, #eff6ff)' : 'transparent',
    color: selected ? 'var(--ds-color-primary-700)' : 'var(--ds-color-neutral-900)',
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
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    color: 'var(--ds-color-neutral-500)',
    fontSize: 12,
    flexShrink: 0,
    visibility: visible ? 'visible' : 'hidden',
  } as React.CSSProperties),
  checkbox: {
    width: 14,
    height: 14,
    accentColor: 'var(--ds-color-primary-600)',
    cursor: 'pointer',
    flexShrink: 0,
  } as React.CSSProperties,
  dragHandle: {
    color: 'var(--ds-color-neutral-300)',
    cursor: 'grab',
    fontSize: 'var(--ds-font-size-xs)',
    flexShrink: 0,
    userSelect: 'none' as const,
  } as React.CSSProperties,
  skeleton: (w: string, h: string) => ({
    width: w,
    height: h,
    borderRadius: 'var(--ds-radius-md)',
    background: 'var(--ds-color-neutral-200)',
    animation: 'pulse 1.5s ease-in-out infinite',
  } as React.CSSProperties),
};

export default function RusticTreeView(props: TreeViewProps) {
  const {
    data, renderNode, onSelect, onExpand, expandedKeys: controlledExpanded,
    selectedKeys: controlledSelected, defaultExpandedKeys, checkable, checkedKeys: controlledChecked,
    onCheck, draggable, onDrop, searchable, searchPlaceholder = 'Search...', multiple,
    loading, className, style,
  } = props;

  const [internalExpanded, setInternalExpanded] = useState<Set<string>>(new Set(defaultExpandedKeys ?? []));
  const [internalSelected, setInternalSelected] = useState<Set<string>>(new Set());
  const [internalChecked, setInternalChecked] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

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

  function renderNodes(nodes: TreeNode[], depth: number): React.ReactNode {
    return nodes.map((node) => {
      const hasChildren = node.children && node.children.length > 0;
      const expanded = expandedSet.has(node.key);
      const selected = selectedSet.has(node.key);
      const checked = checkedSet.has(node.key);

      return (
        <div key={node.key}>
          <div
            style={s.nodeRow(depth, selected, node.disabled)}
            onClick={() => !node.disabled && handleSelect(node.key)}
            draggable={draggable && !node.disabled}
          >
            <button
              style={s.toggleBtn(!!hasChildren)}
              onClick={(e) => { e.stopPropagation(); handleToggle(node.key); }}
            >
              {expanded ? '\u25BE' : '\u25B8'}
            </button>
            {checkable && (
              <input
                type="checkbox"
                style={s.checkbox}
                checked={checked}
                onChange={() => handleCheck(node.key)}
                onClick={(e) => e.stopPropagation()}
              />
            )}
            {draggable && <span style={s.dragHandle}>::</span>}
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
      <div className={className} style={{ ...s.container, ...style }}>
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{ ...s.skeleton(`${70 - (i % 3) * 10}%`, '1.25rem'), marginLeft: `${(i % 3) * 1.25}rem`, marginBottom: '0.375rem' }} />
        ))}
      </div>
    );
  }

  return (
    <div className={className} style={{ ...s.container, ...style }}>
      {searchable && (
        <input
          type="text"
          style={s.searchInput}
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      )}
      <div>{renderNodes(filteredData, 0)}</div>
    </div>
  );
}
