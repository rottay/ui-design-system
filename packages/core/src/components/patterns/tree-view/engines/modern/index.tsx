'use client';

/**
 * TreeView - Modern Engine (DaisyUI/Tailwind)
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

function TreeNodeItem({
  node, depth, expanded, selected, checked, renderNode, checkable, draggable,
  onToggle, onSelectNode, onCheckNode,
}: {
  node: TreeNode; depth: number; expanded: boolean; selected: boolean; checked: boolean;
  renderNode?: TreeViewProps['renderNode']; checkable?: boolean; draggable?: boolean;
  onToggle: (key: string) => void; onSelectNode: (key: string) => void; onCheckNode: (key: string) => void;
}) {
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div>
      <div
        className={`flex items-center gap-1.5 px-2 py-1 rounded-md cursor-pointer hover:bg-base-200 transition-colors ${
          selected ? 'bg-primary/10 text-primary font-medium' : ''
        } ${node.disabled ? 'opacity-40 pointer-events-none' : ''}`}
        style={{ paddingLeft: `${depth * 1.25 + 0.5}rem` }}
        onClick={() => onSelectNode(node.key)}
        draggable={draggable}
      >
        {/* Expand toggle */}
        <button
          className={`btn btn-ghost btn-xs btn-square ${hasChildren ? '' : 'invisible'}`}
          onClick={(e) => { e.stopPropagation(); onToggle(node.key); }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-90' : ''}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>

        {/* Checkbox */}
        {checkable && (
          <input
            type="checkbox"
            className="checkbox checkbox-xs checkbox-primary"
            checked={checked}
            onChange={() => onCheckNode(node.key)}
            onClick={(e) => e.stopPropagation()}
          />
        )}

        {/* Drag handle */}
        {draggable && (
          <span className="text-base-content/30 cursor-grab text-xs">::</span>
        )}

        {/* Icon */}
        {node.icon && <span className="flex-shrink-0">{node.icon}</span>}

        {/* Label */}
        <span className="text-sm truncate flex-1">
          {renderNode ? renderNode(node, depth) : node.label}
        </span>
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <div>
          {node.children!.map((child) => (
            <TreeNodeItemWrapper key={child.key} node={child} depth={depth + 1} renderNode={renderNode} checkable={checkable} draggable={draggable} onToggle={onToggle} onSelectNode={onSelectNode} onCheckNode={onCheckNode} />
          ))}
        </div>
      )}
    </div>
  );
}

// Wrapper to access context from parent
function TreeNodeItemWrapper(props: Omit<Parameters<typeof TreeNodeItem>[0], 'expanded' | 'selected' | 'checked'> & {}) {
  // This is a workaround; in real implementation, context would be used
  return null;
}

export default function ModernTreeView(props: TreeViewProps) {
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
            className={`flex items-center gap-1.5 px-2 py-1 rounded-md cursor-pointer hover:bg-base-200 transition-colors ${
              selected ? 'bg-primary/10 text-primary font-medium' : ''
            } ${node.disabled ? 'opacity-40 pointer-events-none' : ''}`}
            style={{ paddingLeft: `${depth * 1.25 + 0.5}rem` }}
            onClick={() => handleSelect(node.key)}
            draggable={draggable}
          >
            <button
              className={`btn btn-ghost btn-xs btn-square ${hasChildren ? '' : 'invisible'}`}
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
              <input type="checkbox" className="checkbox checkbox-xs checkbox-primary" checked={checked} onChange={() => handleCheck(node.key)} onClick={(e) => e.stopPropagation()} />
            )}
            {draggable && <span className="text-base-content/30 cursor-grab text-xs">::</span>}
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
      <div className={`card bg-base-100 shadow-sm ${className ?? ''}`} style={style}>
        <div className="card-body animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-6 bg-base-300 rounded" style={{ marginLeft: `${(i % 3) * 1.25}rem`, width: `${70 - (i % 3) * 10}%` }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`card bg-base-100 shadow-sm ${className ?? ''}`} style={style}>
      <div className="card-body p-3">
        {searchable && (
          <input
            type="text"
            className="input input-bordered input-sm w-full mb-2"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        )}
        <div>{renderNodes(filteredData, 0)}</div>
      </div>
    </div>
  );
}
