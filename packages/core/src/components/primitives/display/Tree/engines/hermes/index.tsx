/**
 * Tree - Hermes Engine (DaisyUI/Tailwind)
 *
 * Lightweight tree implementation using DaisyUI classes and Tailwind CSS.
 * Provides a utility-first approach with minimal JavaScript.
 *
 * @module Tree/Hermes
 */

'use client';

import React, { useState, useCallback } from 'react';
import type { TreeProps, TreeDataNode } from '../../types';
import { TREE_DEFAULTS } from '../../types';

/**
 * Internal props for rendering tree nodes recursively.
 */
interface TreeNodeInternalProps extends TreeDataNode {
  level: number;
  isExpanded: boolean;
  isSelected: boolean;
  isChecked: boolean;
  isHalfChecked: boolean;
  onToggle: (key: React.Key) => void;
  onSelect: (key: React.Key, node: TreeDataNode) => void;
  onCheck: (key: React.Key, node: TreeDataNode) => void;
  showLine?: boolean;
  showIcon?: boolean;
  checkable?: boolean;
  expandedKeys: React.Key[];
  selectedKeys: React.Key[];
  checkedKeys: React.Key[];
  findNode: (key: React.Key) => TreeDataNode | undefined;
}

/**
 * Internal tree node component for Hermes engine.
 */
const TreeNodeInternal: React.FC<TreeNodeInternalProps> = ({
  key: nodeKey,
  title,
  children,
  disabled,
  isLeaf,
  icon,
  level,
  isExpanded,
  isSelected,
  isChecked,
  isHalfChecked,
  onToggle,
  onSelect,
  onCheck,
  showLine,
  showIcon,
  checkable,
  expandedKeys,
  selectedKeys,
  checkedKeys,
  findNode,
}) => {
  const hasChildren = children && children.length > 0;
  const paddingLeft = level * 24;

  const handleClick = () => {
    if (disabled) return;
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
    const node = findNode(nodeKey);
    if (node) {
      onCheck(nodeKey, node);
    }
  };

  return (
    <div className="rottay-tree-node" data-key={nodeKey}>
      {/* Node content */}
      <div
        className={`
          flex items-center py-1 px-2 rounded cursor-pointer
          transition-colors duration-200
          ${isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-base-200'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        style={{ paddingLeft }}
        onClick={handleClick}
        role="treeitem"
        aria-selected={isSelected}
        aria-expanded={hasChildren ? isExpanded : undefined}
        aria-disabled={disabled}
      >
        {/* Expand/collapse arrow */}
        {hasChildren && !isLeaf ? (
          <button
            type="button"
            className="btn btn-ghost btn-xs btn-circle mr-1 flex-shrink-0"
            onClick={handleToggle}
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            <span
              className={`
                inline-block transition-transform duration-200
                ${isExpanded ? 'rotate-90' : ''}
              `}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 16 16"
                fill="currentColor"
              >
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
            className={`
              checkbox checkbox-sm checkbox-primary mr-2 flex-shrink-0
              ${isHalfChecked ? 'checkbox-indeterminate' : ''}
            `}
            checked={isChecked}
            disabled={disabled}
            onChange={handleCheck}
            onClick={(e) => e.stopPropagation()}
            aria-label={`Select ${title}`}
          />
        )}

        {/* Icon */}
        {showIcon && icon && (
          <span className="mr-2 flex-shrink-0 flex items-center">{icon}</span>
        )}

        {/* Title */}
        <span className="truncate">{title}</span>
      </div>

      {/* Line connector */}
      {showLine && level > 0 && (
        <div
          className="absolute left-0 top-1/2 w-4 border-t border-base-300"
          style={{ left: paddingLeft - 16 }}
        />
      )}

      {/* Children */}
      {isExpanded && hasChildren && (
        <div
          className={showLine ? 'border-l border-base-300 ml-3' : ''}
          role="group"
        >
          {children!.map((child) => {
            const { key: childKey, ...childRest } = child;
            return (
            <TreeNodeInternal
              key={childKey}
              {...childRest}
              level={level + 1}
              isExpanded={expandedKeys.includes(childKey)}
              isSelected={selectedKeys.includes(childKey)}
              isChecked={checkedKeys.includes(childKey)}
              isHalfChecked={false}
              onToggle={onToggle}
              onSelect={onSelect}
              onCheck={onCheck}
              showLine={showLine}
              showIcon={showIcon}
              checkable={checkable}
              expandedKeys={expandedKeys}
              selectedKeys={selectedKeys}
              checkedKeys={checkedKeys}
              findNode={findNode}
            />
          );
          })}
        </div>
      )}
    </div>
  );
};

/**
 * Hermes Tree component using DaisyUI/Tailwind.
 *
 * @example
 * ```tsx
 * <HermesTree
 *   treeData={data}
 *   checkable
 *   defaultExpandedKeys={['1']}
 *   onSelect={(keys) => console.log(keys)}
 * />
 * ```
 */
export default function HermesTree(props: TreeProps): React.ReactElement {
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
    onExpand,
    onSelect,
    onCheck,
    className = '',
    style,
  } = props;

  // Helper to get all keys from tree data
  const getAllKeys = useCallback((nodes: TreeDataNode[]): React.Key[] => {
    const keys: React.Key[] = [];
    const traverse = (nodes: TreeDataNode[]) => {
      nodes.forEach((node) => {
        keys.push(node.key);
        if (node.children) traverse(node.children);
      });
    };
    traverse(nodes);
    return keys;
  }, []);

  // Helper to find a node by key
  const findNode = useCallback(
    (key: React.Key): TreeDataNode | undefined => {
      const search = (nodes: TreeDataNode[]): TreeDataNode | undefined => {
        for (const node of nodes) {
          if (node.key === key) return node;
          if (node.children) {
            const found = search(node.children);
            if (found) return found;
          }
        }
        return undefined;
      };
      return search(treeData);
    },
    [treeData]
  );

  // State management
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>(
    defaultExpandAll ? getAllKeys(treeData) : defaultExpandedKeys
  );
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>(defaultSelectedKeys);
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>(
    Array.isArray(defaultCheckedKeys) ? defaultCheckedKeys : []
  );

  // Resolve controlled vs uncontrolled state
  const actualExpandedKeys = controlledExpandedKeys ?? expandedKeys;
  const actualSelectedKeys = controlledSelectedKeys ?? selectedKeys;
  const actualCheckedKeys = Array.isArray(controlledCheckedKeys)
    ? controlledCheckedKeys
    : (controlledCheckedKeys?.checked ?? checkedKeys);

  // Event handlers
  const handleToggle = (key: React.Key) => {
    const newKeys = actualExpandedKeys.includes(key)
      ? actualExpandedKeys.filter((k) => k !== key)
      : [...actualExpandedKeys, key];
    setExpandedKeys(newKeys);
    const node = findNode(key);
    if (node) {
      onExpand?.(newKeys, { node, expanded: !actualExpandedKeys.includes(key) });
    }
  };

  const handleSelect = (key: React.Key, node: TreeDataNode) => {
    const newKeys = actualSelectedKeys.includes(key)
      ? actualSelectedKeys.filter((k) => k !== key)
      : [key];
    setSelectedKeys(newKeys);
    onSelect?.(newKeys, { node, selected: !actualSelectedKeys.includes(key) });
  };

  const handleCheck = (key: React.Key, node: TreeDataNode) => {
    const newKeys = actualCheckedKeys.includes(key)
      ? actualCheckedKeys.filter((k) => k !== key)
      : [...actualCheckedKeys, key];
    setCheckedKeys(newKeys);
    onCheck?.(newKeys, { node, checked: !actualCheckedKeys.includes(key) });
  };

  return (
    <div
      className={`rottay-tree rottay-tree--hermes ${className}`}
      style={style}
      role="tree"
    >
      {treeData.map((node) => {
        const { key: nodeKey, ...nodeRest } = node;
        return (
        <TreeNodeInternal
          key={nodeKey}
          {...nodeRest}
          level={0}
          isExpanded={actualExpandedKeys.includes(nodeKey)}
          isSelected={actualSelectedKeys.includes(nodeKey)}
          isChecked={actualCheckedKeys.includes(nodeKey)}
          isHalfChecked={false}
          onToggle={handleToggle}
          onSelect={handleSelect}
          onCheck={handleCheck}
          showLine={!!showLine}
          showIcon={showIcon}
          checkable={checkable}
          expandedKeys={actualExpandedKeys}
          selectedKeys={actualSelectedKeys}
          checkedKeys={actualCheckedKeys}
          findNode={findNode}
        />
      );
      })}
    </div>
  );
}

HermesTree.displayName = 'Tree.Hermes';
