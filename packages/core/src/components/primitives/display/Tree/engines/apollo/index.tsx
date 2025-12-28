/**
 * Tree - Apollo Engine (Vanilla HTML/CSS)
 *
 * Headless tree implementation using vanilla HTML and CSS.
 * Maximum accessibility and customization with no external dependencies.
 *
 * @module Tree/Apollo
 */

'use client';

import React, { useState, useCallback } from 'react';
import type { TreeProps, TreeDataNode } from '../../types';
import { TREE_DEFAULTS } from '../../types';

/**
 * Internal props for rendering tree nodes recursively.
 */
interface TreeNodeRenderProps extends TreeDataNode {
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
 * Internal tree node component for Apollo engine.
 */
const TreeNodeRender: React.FC<TreeNodeRenderProps> = ({
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
  const paddingLeft = level * 24 + 8;

  const nodeStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: '4px 8px',
    paddingLeft,
    cursor: disabled ? 'not-allowed' : 'pointer',
    borderRadius: 'var(--ds-tree-node-radius, 4px)',
    backgroundColor: isSelected ? 'var(--ds-tree-node-selected-bg, rgba(24, 144, 255, 0.1))' : 'transparent',
    color: isSelected ? 'var(--ds-tree-node-selected-color, var(--ds-color-primary-500, #1890ff))' : 'inherit',
    opacity: disabled ? 0.5 : 1,
    transition: 'var(--ds-tree-transition, background-color 0.2s ease)',
  };

  const switcherStyle: React.CSSProperties = {
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '4px',
    transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
    transition: 'transform 0.2s ease',
    flexShrink: 0,
  };

  const checkboxStyle: React.CSSProperties = {
    marginRight: '8px',
    width: '16px',
    height: '16px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    accentColor: 'var(--ds-tree-checkbox-color, var(--ds-color-primary-500, #1890ff))',
    flexShrink: 0,
  };

  const iconStyle: React.CSSProperties = {
    marginRight: '8px',
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  };

  const childrenStyle: React.CSSProperties = {
    borderLeft: showLine ? '1px solid var(--ds-tree-line-color, #e8e8e8)' : 'none',
    marginLeft: paddingLeft + 10,
  };

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

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isSelected && !disabled) {
      e.currentTarget.style.backgroundColor = 'var(--ds-tree-node-hover-bg, rgba(0, 0, 0, 0.04))';
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isSelected) {
      e.currentTarget.style.backgroundColor = 'transparent';
    }
  };

  return (
    <div className="rottay-tree-node" data-key={nodeKey}>
      <div
        style={nodeStyle}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        role="treeitem"
        aria-selected={isSelected}
        aria-expanded={hasChildren ? isExpanded : undefined}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        {/* Expand/collapse arrow */}
        {hasChildren && !isLeaf ? (
          <span
            style={switcherStyle}
            onClick={handleToggle}
            role="button"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onToggle(nodeKey);
              }
            }}
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
        ) : (
          <span style={{ width: '24px', flexShrink: 0 }} />
        )}

        {/* Checkbox */}
        {checkable && (
          <input
            type="checkbox"
            style={checkboxStyle}
            checked={isChecked}
            ref={(el) => {
              if (el) {
                el.indeterminate = isHalfChecked;
              }
            }}
            disabled={disabled}
            onChange={handleCheck}
            onClick={(e) => e.stopPropagation()}
            aria-label={`Select ${title}`}
          />
        )}

        {/* Icon */}
        {showIcon && icon && <span style={iconStyle}>{icon}</span>}

        {/* Title */}
        <span>{title}</span>
      </div>

      {/* Children */}
      {isExpanded && hasChildren && (
        <div style={childrenStyle} role="group">
          {children!.map((child) => {
            const { key: childKey, ...childRest } = child;
            return (
            <TreeNodeRender
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
 * Apollo Tree component using vanilla HTML/CSS.
 *
 * @example
 * ```tsx
 * <ApolloTree
 *   treeData={data}
 *   checkable
 *   defaultExpandedKeys={['1']}
 *   onSelect={(keys) => console.log(keys)}
 * />
 * ```
 */
export default function ApolloTree(props: TreeProps): React.ReactElement {
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

  const containerStyle: React.CSSProperties = {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: '14px',
    lineHeight: 1.5,
    ...style,
  };

  return (
    <div
      className={`rottay-tree rottay-tree--apollo ${className}`}
      style={containerStyle}
      role="tree"
    >
      {treeData.map((node) => {
        const { key: nodeKey, ...nodeRest } = node;
        return (
        <TreeNodeRender
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

ApolloTree.displayName = 'Tree.Apollo';
