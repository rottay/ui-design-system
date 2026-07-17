/**
 * @fileoverview Classic Tree engine -- thin Ant Design wrapper.
 *
 * Delegates all tree behavior (expand/collapse, drag-and-drop, checkbox cascading,
 * virtual scroll, keyboard navigation) to antd's Tree component. The engine
 * exists so the DS exposes a unified TreeProps surface while Ant Design handles
 * rendering, accessibility, and performance internally.
 *
 * Engine: **Ant Design** (`antd/Tree`)
 *
 * @example
 * ```tsx
 * <Tree engine="classic" treeData={nodes} checkable onCheck={(keys) => setChecked(keys)} />
 * ```
 *
 * @module Tree/Classic
 * @category Display
 * @package @rottay/design-system
 */

'use client';

import React from 'react';
import { Tree as AntTree } from 'antd';
import type { TreeProps } from '../../contracts';
import { TREE_DEFAULTS } from '../../contracts';

/**
 * Classic Tree backed by Ant Design's Tree component.
 *
 * Nearly all props pass through to antd unchanged. The `as never` / `as React.Key[]`
 * casts bridge the DS's string-only key types with antd's broader `React.Key`
 * (string | number) -- safe because antd coerces keys to strings internally.
 *
 * @param props - Unified DS TreeProps (see Tree.types.ts)
 * @returns An Ant Design Tree element wrapped with DS class names
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

  // The `as never` and `as React.Key[]` casts bridge the DS's string-based key
  // types with antd's broader React.Key (string | number). This is safe because
  // antd coerces keys to strings internally anyway.
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
