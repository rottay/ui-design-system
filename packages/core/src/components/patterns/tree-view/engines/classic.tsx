'use client';

/**
 * @fileoverview Classic (Ant Design) engine for the TreeView pattern.
 *
 * Wraps Ant Design's Tree component inside a Card with an optional search
 * input. The consumer's `TreeNode[]` data is recursively converted to Ant
 * Design's `DataNode[]` format via `toAntTreeData`. Supports checkable mode,
 * drag-and-drop reordering, multi-select, and client-side filtering.
 *
 * @example
 * <ClassicTreeView
 *   data={[{ key: 'root', label: 'Root', children: [{ key: 'child', label: 'Child' }] }]}
 *   searchable
 *   checkable
 *   onSelect={(keys) => console.log(keys)}
 * />
 */

import React, { useState, useMemo } from 'react';
import { Card, Tree, Input, Skeleton } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { TreeViewProps, TreeNode } from '../TreeView.types';
import type { DataNode } from 'antd/es/tree';

const { Search } = Input;

/**
 * Recursively converts the pattern's `TreeNode[]` into Ant Design's `DataNode[]`.
 * When a custom `renderNode` is provided, it replaces the default label string
 * with the consumer's ReactNode, receiving the current depth for indentation-aware rendering.
 */
function toAntTreeData(nodes: TreeNode[], renderNode?: TreeViewProps['renderNode'], depth = 0): DataNode[] {
  return nodes.map((node) => ({
    key: node.key,
    title: renderNode ? renderNode(node, depth) : node.label,
    icon: node.icon,
    disabled: node.disabled,
    children: node.children ? toAntTreeData(node.children, renderNode, depth + 1) : undefined,
  }));
}

// Recursive filter that keeps a node if it matches OR if any descendant matches,
// preserving the ancestor chain so matched deep nodes are still reachable.
function filterTree(nodes: TreeNode[], query: string): TreeNode[] {
  const q = query.toLowerCase();
  return nodes
    .map((node) => {
      const children = node.children ? filterTree(node.children, query) : [];
      const labelStr = typeof node.label === 'string' ? node.label : '';
      if (labelStr.toLowerCase().includes(q) || children.length > 0) {
        // When children match but the parent doesn't, keep all original children
        // so the user sees the full subtree beneath the matching descendant.
        return { ...node, children: children.length > 0 ? children : node.children };
      }
      return null;
    })
    .filter(Boolean) as TreeNode[];
}

/**
 * Classic (Ant Design) engine for the TreeView pattern component.
 *
 * Delegates most tree logic (expand/collapse, selection, check, drag-drop) to
 * Ant Design's Tree component while adding search filtering on top. The
 * `onDrop` callback is normalized from Ant's `TreeDragEvent` into the
 * pattern's simpler `{ dragKey, dropKey, position }` shape.
 *
 * @param props - {@link TreeViewProps} controlling tree data, selection, checking, and drag-drop.
 * @returns A searchable, interactive tree rendered with Ant Design primitives.
 */
export default function ClassicTreeView(props: TreeViewProps) {
  const {
    data,
    renderNode,
    onSelect,
    onExpand,
    expandedKeys: controlledExpanded,
    selectedKeys: controlledSelected,
    defaultExpandedKeys,
    checkable,
    checkedKeys,
    onCheck,
    draggable,
    onDrop,
    searchable,
    searchPlaceholder = 'Search...',
    multiple,
    loading,
    className,
    style,
  } = props;

  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    return filterTree(data, searchQuery);
  }, [data, searchQuery]);

  const treeData = useMemo(() => toAntTreeData(filteredData, renderNode), [filteredData, renderNode]);

  if (loading) {
    return (
      <Card className={className} style={style}>
        <Skeleton active paragraph={{ rows: 6 }} />
      </Card>
    );
  }

  return (
    <Card className={className} style={style} styles={{ body: { padding: '12px 16px' } }}>
      {searchable && (
        <Search
          placeholder={searchPlaceholder}
          prefix={<SearchOutlined />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          allowClear
          style={{ marginBottom: 12 }}
        />
      )}
      <Tree
        treeData={treeData}
        checkable={checkable}
        draggable={draggable}
        multiple={multiple}
        selectedKeys={controlledSelected}
        expandedKeys={controlledExpanded}
        defaultExpandedKeys={defaultExpandedKeys}
        checkedKeys={checkedKeys}
        onSelect={(keys) => onSelect?.(keys as string[])}
        onExpand={(keys) => onExpand?.(keys as string[])}
        onCheck={(keys) => onCheck?.(Array.isArray(keys) ? keys as string[] : keys.checked as string[])}
        /* Normalize Ant Design's verbose drag event into the pattern's
           simplified { dragKey, dropKey, position } shape. dropToGap
           distinguishes "between siblings" from "into a parent". */
        onDrop={(info) => {
          if (!onDrop) return;
          const dragKey = info.dragNode.key as string;
          const dropKey = info.node.key as string;
          const position = info.dropToGap ? (info.dropPosition < 0 ? 'before' : 'after') : 'inside';
          onDrop({ dragKey, dropKey, position: position as 'before' | 'after' | 'inside' });
        }}
        showLine
        showIcon
      />
    </Card>
  );
}
