/**
 * Tree - Classic Engine (Ant Design)
 *
 * Full-featured tree implementation using Ant Design's Tree component.
 * Provides comprehensive functionality including virtual scrolling,
 * drag-and-drop, and checkable nodes with cascading selection.
 *
 * @module Tree/Classic
 */

'use client';

import React from 'react';
import { Tree as AntTree } from 'antd';
import type { TreeProps } from '../Tree.types';
import { TREE_DEFAULTS } from '../Tree.types';

/**
 * Classic Tree component using Ant Design.
 *
 * @example
 * ```tsx
 * <ClassicTree
 *   treeData={data}
 *   checkable
 *   defaultExpandedKeys={['1']}
 *   onSelect={(keys) => console.log(keys)}
 * />
 * ```
 */
export default function ClassicTree(props: TreeProps): React.ReactElement {
  const {
    treeData,
    checkable = TREE_DEFAULTS.checkable,
    defaultExpandedKeys,
    expandedKeys,
    defaultSelectedKeys,
    selectedKeys,
    defaultCheckedKeys,
    checkedKeys,
    multiple = TREE_DEFAULTS.multiple,
    autoExpandParent = TREE_DEFAULTS.autoExpandParent,
    showLine = TREE_DEFAULTS.showLine,
    showIcon = TREE_DEFAULTS.showIcon,
    defaultExpandAll = TREE_DEFAULTS.defaultExpandAll,
    defaultExpandParent,
    draggable = TREE_DEFAULTS.draggable,
    blockNode = TREE_DEFAULTS.blockNode,
    height,
    switcherIcon,
    onExpand,
    onSelect,
    onCheck,
    onDragStart,
    onDrop,
    children,
    className,
    style,
  } = props;

  return (
    <AntTree
      treeData={treeData as never}
      checkable={checkable}
      defaultExpandedKeys={defaultExpandedKeys as React.Key[]}
      expandedKeys={expandedKeys as React.Key[]}
      defaultSelectedKeys={defaultSelectedKeys as React.Key[]}
      selectedKeys={selectedKeys as React.Key[]}
      defaultCheckedKeys={defaultCheckedKeys as React.Key[]}
      checkedKeys={checkedKeys as React.Key[] | { checked: React.Key[]; halfChecked: React.Key[] }}
      multiple={multiple}
      autoExpandParent={autoExpandParent}
      showLine={showLine}
      showIcon={showIcon}
      defaultExpandAll={defaultExpandAll}
      defaultExpandParent={defaultExpandParent}
      draggable={draggable}
      blockNode={blockNode}
      height={height}
      switcherIcon={switcherIcon as never}
      onExpand={onExpand as never}
      onSelect={onSelect as never}
      onCheck={onCheck as never}
      onDragStart={onDragStart as never}
      onDrop={onDrop as never}
      className={`rottay-tree rottay-tree--classic ${className || ''}`}
      style={style}
    >
      {children}
    </AntTree>
  );
}

ClassicTree.displayName = 'Tree.Classic';
