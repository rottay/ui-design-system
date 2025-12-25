'use client';

/**
 * Hermes Tree Engine
 *
 * DaisyUI implementation with unified props interface.
 */

import { useState, useCallback, useMemo } from 'react';
import type { TreeProps, TreeDataNode } from '../types';
import { flattenTreeData, getChildKeys } from '../../../../types/components/tree';

/**
 * Tree Node Component
 */
function TreeNode({
  node,
  level,
  expandedKeys,
  selectedKeys,
  checkedKeys,
  checkable,
  showLine,
  showIcon,
  disabled: treeDisabled,
  onExpand,
  onSelect,
  onCheck,
}: {
  node: TreeDataNode;
  level: number;
  expandedKeys: Set<React.Key>;
  selectedKeys: Set<React.Key>;
  checkedKeys: Set<React.Key>;
  checkable?: boolean;
  showLine?: boolean;
  showIcon?: boolean;
  disabled?: boolean;
  onExpand: (key: React.Key) => void;
  onSelect: (key: React.Key, node: TreeDataNode) => void;
  onCheck: (key: React.Key, node: TreeDataNode, checked: boolean) => void;
}) {
  const isExpanded = expandedKeys.has(node.key);
  const isSelected = selectedKeys.has(node.key);
  const isChecked = checkedKeys.has(node.key);
  const hasChildren = node.children && node.children.length > 0;
  const isDisabled = treeDisabled || node.disabled;

  return (
    <li className={node.className} style={node.style}>
      <div
        className={`flex items-center gap-1 py-1 px-2 rounded cursor-pointer ${
          isSelected ? 'bg-primary/10' : 'hover:bg-base-200'
        } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => !isDisabled && node.selectable !== false && onSelect(node.key, node)}
      >
        {/* Expand/Collapse icon */}
        {hasChildren ? (
          <button
            type="button"
            className="w-4 h-4 flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation();
              onExpand(node.key);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            >
              <path
                fillRule="evenodd"
                d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        ) : (
          <span className="w-4" />
        )}

        {/* Checkbox */}
        {checkable && node.checkable !== false && (
          <input
            type="checkbox"
            className="checkbox checkbox-sm"
            checked={isChecked}
            disabled={isDisabled || node.disableCheckbox}
            onChange={(e) => {
              e.stopPropagation();
              onCheck(node.key, node, e.target.checked);
            }}
            onClick={(e) => e.stopPropagation()}
          />
        )}

        {/* Icon */}
        {showIcon && node.icon && (
          <span className="w-4 h-4 flex items-center justify-center">
            {node.icon}
          </span>
        )}

        {/* Title */}
        <span className={`flex-1 select-none ${isSelected ? 'text-primary font-medium' : ''}`}>
          {node.title}
        </span>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <ul className={showLine ? 'border-l border-base-300 ml-2' : ''}>
          {node.children!.map((child) => (
            <TreeNode
              key={child.key}
              node={child}
              level={level + 1}
              expandedKeys={expandedKeys}
              selectedKeys={selectedKeys}
              checkedKeys={checkedKeys}
              checkable={checkable}
              showLine={showLine}
              showIcon={showIcon}
              disabled={treeDisabled}
              onExpand={onExpand}
              onSelect={onSelect}
              onCheck={onCheck}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

/**
 * Hermes Tree Component
 *
 * DaisyUI-styled tree display.
 */
export default function HermesTree(props: TreeProps) {
  const {
    treeData = [],
    checkable = false,
    checkedKeys: controlledCheckedKeys,
    defaultCheckedKeys = [],
    selectedKeys: controlledSelectedKeys,
    defaultSelectedKeys = [],
    multiple = false,
    expandedKeys: controlledExpandedKeys,
    defaultExpandedKeys = [],
    defaultExpandAll = false,
    showLine = false,
    showIcon = false,
    disabled = false,
    onCheck,
    onSelect,
    onExpand,
    className = '',
    style,
  } = props;

  // Get all keys for defaultExpandAll
  const getAllKeys = useCallback((nodes: TreeDataNode[]): React.Key[] => {
    const keys: React.Key[] = [];
    const traverse = (nodeList: TreeDataNode[]) => {
      for (const node of nodeList) {
        if (node.children && node.children.length > 0) {
          keys.push(node.key);
          traverse(node.children);
        }
      }
    };
    traverse(nodes);
    return keys;
  }, []);

  // State
  const [internalExpandedKeys, setInternalExpandedKeys] = useState<Set<React.Key>>(
    new Set(defaultExpandAll ? getAllKeys(treeData) : defaultExpandedKeys)
  );
  const [internalSelectedKeys, setInternalSelectedKeys] = useState<Set<React.Key>>(
    new Set(defaultSelectedKeys)
  );
  const [internalCheckedKeys, setInternalCheckedKeys] = useState<Set<React.Key>>(
    new Set(defaultCheckedKeys)
  );

  // Controlled vs uncontrolled
  const expandedKeys = controlledExpandedKeys
    ? new Set(controlledExpandedKeys)
    : internalExpandedKeys;

  const selectedKeys = controlledSelectedKeys
    ? new Set(controlledSelectedKeys)
    : internalSelectedKeys;

  const checkedKeys = controlledCheckedKeys
    ? new Set(Array.isArray(controlledCheckedKeys) ? controlledCheckedKeys : controlledCheckedKeys.checked)
    : internalCheckedKeys;

  // Handlers
  const handleExpand = useCallback((key: React.Key) => {
    const newKeys = new Set(expandedKeys);
    const isExpanded = newKeys.has(key);

    if (isExpanded) {
      newKeys.delete(key);
    } else {
      newKeys.add(key);
    }

    if (!controlledExpandedKeys) {
      setInternalExpandedKeys(newKeys);
    }

    const node = findNodeByKey(treeData, key);
    onExpand?.(Array.from(newKeys), {
      node: node!,
      expanded: !isExpanded,
      nativeEvent: {} as MouseEvent,
    });
  }, [expandedKeys, controlledExpandedKeys, treeData, onExpand]);

  const handleSelect = useCallback((key: React.Key, node: TreeDataNode) => {
    let newKeys: Set<React.Key>;

    if (multiple) {
      newKeys = new Set(selectedKeys);
      if (newKeys.has(key)) {
        newKeys.delete(key);
      } else {
        newKeys.add(key);
      }
    } else {
      newKeys = selectedKeys.has(key) ? new Set() : new Set([key]);
    }

    if (!controlledSelectedKeys) {
      setInternalSelectedKeys(newKeys);
    }

    onSelect?.(Array.from(newKeys), {
      event: 'select',
      selected: newKeys.has(key),
      node,
      selectedNodes: Array.from(newKeys).map(k => findNodeByKey(treeData, k)!).filter(Boolean),
      nativeEvent: {} as MouseEvent,
    });
  }, [selectedKeys, multiple, controlledSelectedKeys, treeData, onSelect]);

  const handleCheck = useCallback((key: React.Key, node: TreeDataNode, checked: boolean) => {
    const newKeys = new Set(checkedKeys);

    if (checked) {
      newKeys.add(key);
      // Add all children
      getChildKeys(node).forEach(k => newKeys.add(k));
    } else {
      newKeys.delete(key);
      // Remove all children
      getChildKeys(node).forEach(k => newKeys.delete(k));
    }

    if (!controlledCheckedKeys) {
      setInternalCheckedKeys(newKeys);
    }

    onCheck?.(Array.from(newKeys), {
      event: 'check',
      node,
      checked,
      nativeEvent: {} as MouseEvent,
      checkedNodes: Array.from(newKeys).map(k => findNodeByKey(treeData, k)!).filter(Boolean),
    });
  }, [checkedKeys, controlledCheckedKeys, treeData, onCheck]);

  return (
    <ul className={`menu bg-base-100 ${className}`} style={style}>
      {treeData.map((node) => (
        <TreeNode
          key={node.key}
          node={node}
          level={0}
          expandedKeys={expandedKeys}
          selectedKeys={selectedKeys}
          checkedKeys={checkedKeys}
          checkable={checkable}
          showLine={!!showLine}
          showIcon={showIcon}
          disabled={disabled}
          onExpand={handleExpand}
          onSelect={handleSelect}
          onCheck={handleCheck}
        />
      ))}
    </ul>
  );
}

// Helper to find node by key
function findNodeByKey(nodes: TreeDataNode[], key: React.Key): TreeDataNode | undefined {
  for (const node of nodes) {
    if (node.key === key) return node;
    if (node.children) {
      const found = findNodeByKey(node.children, key);
      if (found) return found;
    }
  }
  return undefined;
}
