'use client';

/**
 * TreeView - Classic Engine (Ant Design)
 */

import React, { useState, useMemo } from 'react';
import { Card, Tree, Input, Skeleton } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { TreeViewProps, TreeNode } from '../../types';
import type { DataNode } from 'antd/es/tree';

const { Search } = Input;

function toAntTreeData(nodes: TreeNode[], renderNode?: TreeViewProps['renderNode'], depth = 0): DataNode[] {
  return nodes.map((node) => ({
    key: node.key,
    title: renderNode ? renderNode(node, depth) : node.label,
    icon: node.icon,
    disabled: node.disabled,
    children: node.children ? toAntTreeData(node.children, renderNode, depth + 1) : undefined,
  }));
}

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
    <Card className={className} style={style} bodyStyle={{ padding: '12px 16px' }}>
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
