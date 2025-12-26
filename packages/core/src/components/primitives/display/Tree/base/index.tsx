/**
 * Tree - Base Component
 * Uses CSS variables from design tokens for consistent styling.
 * This is extended by engine-specific implementations.
 */

'use client';

import React, { forwardRef, useState, useCallback } from 'react';
import type { TreeProps, TreeDataNode } from '../types';
import { TREE_DEFAULTS } from '../types';

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
  halfCheckedKeys: React.Key[];
  findNode: (key: React.Key) => TreeDataNode | undefined;
}

/**
 * Renders a single tree node with its children.
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
  halfCheckedKeys,
  findNode,
}) => {
  const hasChildren = children && children.length > 0;

  // CSS variable-based styling
  const nodeVars: React.CSSProperties = {
    '--tree-node-indent': `${level * 24}px`,
    '--tree-node-bg': isSelected ? 'var(--tree-selected-bg)' : 'transparent',
    '--tree-node-color': isSelected ? 'var(--tree-selected-color)' : 'inherit',
    '--tree-node-opacity': disabled ? '0.5' : '1',
  } as React.CSSProperties;

  const nodeStyle: React.CSSProperties = {
    ...nodeVars,
    display: 'flex',
    alignItems: 'center',
    padding: 'var(--tree-node-padding-y) var(--tree-node-padding-x)',
    paddingLeft: `calc(var(--tree-node-indent) + var(--tree-node-padding-x))`,
    cursor: disabled ? 'not-allowed' : 'pointer',
    borderRadius: 'var(--tree-node-border-radius)',
    backgroundColor: 'var(--tree-node-bg)',
    color: 'var(--tree-node-color)',
    opacity: 'var(--tree-node-opacity)',
    transition: 'var(--tree-transition)',
  };

  const switcherStyle: React.CSSProperties = {
    width: 'var(--tree-switcher-size)',
    height: 'var(--tree-switcher-size)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 'var(--tree-icon-margin)',
    transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
    transition: 'transform 0.2s',
    fontSize: 'var(--tree-icon-size)',
    flexShrink: 0,
  };

  const checkboxStyle: React.CSSProperties = {
    marginRight: 'var(--tree-checkbox-margin)',
    width: 'var(--tree-checkbox-size)',
    height: 'var(--tree-checkbox-size)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    accentColor: 'var(--tree-checkbox-color)',
    flexShrink: 0,
  };

  const iconStyle: React.CSSProperties = {
    marginRight: 'var(--tree-icon-margin)',
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  };

  const childrenContainerStyle: React.CSSProperties = {
    borderLeft: showLine ? '1px solid var(--tree-line-color)' : 'none',
    marginLeft: `calc(var(--tree-node-indent) + 12px)`,
  };

  const handleNodeClick = (e: React.MouseEvent) => {
    if (disabled) return;
    e.stopPropagation();
    const node = findNode(nodeKey);
    if (node) {
      onSelect(nodeKey, node);
    }
  };

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(nodeKey);
  };

  const handleCheckChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const node = findNode(nodeKey);
    if (node) {
      onCheck(nodeKey, node);
    }
  };

  return (
    <div className="rottay-tree-node" data-key={nodeKey}>
      <div
        className={`rottay-tree-node__content ${isSelected ? 'rottay-tree-node--selected' : ''} ${disabled ? 'rottay-tree-node--disabled' : ''}`}
        style={nodeStyle}
        onClick={handleNodeClick}
        onMouseEnter={(e) => {
          if (!isSelected && !disabled) {
            e.currentTarget.style.backgroundColor = 'var(--tree-hover-bg)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isSelected) {
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}
        role="treeitem"
        aria-selected={isSelected}
        aria-expanded={hasChildren ? isExpanded : undefined}
        aria-disabled={disabled}
      >
        {/* Expand/collapse switcher */}
        {hasChildren && !isLeaf ? (
          <span
            className="rottay-tree-node__switcher"
            style={switcherStyle}
            onClick={handleToggleClick}
            role="button"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            <svg
              width="1em"
              height="1em"
              viewBox="0 0 16 16"
              fill="currentColor"
            >
              <path d="M6 4l4 4-4 4z" />
            </svg>
          </span>
        ) : (
          <span style={{ width: 'var(--tree-switcher-size)', flexShrink: 0 }} />
        )}

        {/* Checkbox */}
        {checkable && (
          <input
            type="checkbox"
            className="rottay-tree-node__checkbox"
            style={checkboxStyle}
            checked={isChecked}
            ref={(el) => {
              if (el) {
                el.indeterminate = isHalfChecked;
              }
            }}
            disabled={disabled}
            onChange={handleCheckChange}
            onClick={(e) => e.stopPropagation()}
            aria-label={`Select ${title}`}
          />
        )}

        {/* Icon */}
        {showIcon && icon && (
          <span className="rottay-tree-node__icon" style={iconStyle}>
            {icon}
          </span>
        )}

        {/* Title */}
        <span className="rottay-tree-node__title">{title}</span>
      </div>

      {/* Children */}
      {isExpanded && hasChildren && (
        <div
          className="rottay-tree-node__children"
          style={childrenContainerStyle}
          role="group"
        >
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
              isHalfChecked={halfCheckedKeys.includes(childKey)}
              onToggle={onToggle}
              onSelect={onSelect}
              onCheck={onCheck}
              showLine={showLine}
              showIcon={showIcon}
              checkable={checkable}
              expandedKeys={expandedKeys}
              selectedKeys={selectedKeys}
              checkedKeys={checkedKeys}
              halfCheckedKeys={halfCheckedKeys}
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
 * Base Tree component using CSS variables.
 * This is extended by engine-specific implementations.
 *
 * @example
 * ```tsx
 * <BaseTree
 *   treeData={[
 *     { key: '1', title: 'Parent', children: [...] }
 *   ]}
 *   checkable
 *   defaultExpandedKeys={['1']}
 * />
 * ```
 */
export const BaseTree = forwardRef<HTMLDivElement, TreeProps>((props, ref) => {
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
  const [halfCheckedKeys, _setHalfCheckedKeys] = useState<React.Key[]>([]);

  // Resolve controlled vs uncontrolled state
  const actualExpandedKeys = controlledExpandedKeys ?? expandedKeys;
  const actualSelectedKeys = controlledSelectedKeys ?? selectedKeys;
  const actualCheckedKeys = Array.isArray(controlledCheckedKeys)
    ? controlledCheckedKeys
    : (controlledCheckedKeys?.checked ?? checkedKeys);
  const actualHalfCheckedKeys = Array.isArray(controlledCheckedKeys)
    ? halfCheckedKeys
    : (controlledCheckedKeys?.halfChecked ?? halfCheckedKeys);

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
    // Note: For simplicity, half-checked logic is not implemented in base
    // Engine implementations can add more sophisticated cascade checking
    onCheck?.(newKeys, { node, checked: !actualCheckedKeys.includes(key) });
  };

  // CSS variables for the tree container
  const treeVars: React.CSSProperties = {
    '--tree-bg': 'var(--tree-container-bg, transparent)',
    '--tree-hover-bg': 'var(--tree-node-hover-bg, rgba(0, 0, 0, 0.04))',
    '--tree-selected-bg': 'var(--tree-node-selected-bg, rgba(24, 144, 255, 0.1))',
    '--tree-selected-color': 'var(--tree-node-selected-color, #1890ff)',
    '--tree-line-color': 'var(--tree-connector-color, #e8e8e8)',
    '--tree-node-padding-x': 'var(--tree-padding-x, 8px)',
    '--tree-node-padding-y': 'var(--tree-padding-y, 4px)',
    '--tree-node-border-radius': 'var(--tree-border-radius, 4px)',
    '--tree-switcher-size': 'var(--tree-switcher-width, 20px)',
    '--tree-icon-size': 'var(--tree-icon-font-size, 12px)',
    '--tree-icon-margin': 'var(--tree-icon-gap, 4px)',
    '--tree-checkbox-size': 'var(--tree-checkbox-width, 16px)',
    '--tree-checkbox-margin': 'var(--tree-checkbox-gap, 8px)',
    '--tree-checkbox-color': 'var(--tree-checkbox-accent, #1890ff)',
    '--tree-transition': 'var(--tree-animation-duration, 0.2s)',
  } as React.CSSProperties;

  const containerStyle: React.CSSProperties = {
    ...treeVars,
    ...style,
  };

  return (
    <div
      ref={ref}
      className={`rottay-tree ${className}`}
      style={containerStyle}
      role="tree"
      aria-multiselectable={props.multiple}
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
          isHalfChecked={actualHalfCheckedKeys.includes(nodeKey)}
          onToggle={handleToggle}
          onSelect={handleSelect}
          onCheck={handleCheck}
          showLine={!!showLine}
          showIcon={showIcon}
          checkable={checkable}
          expandedKeys={actualExpandedKeys}
          selectedKeys={actualSelectedKeys}
          checkedKeys={actualCheckedKeys}
          halfCheckedKeys={actualHalfCheckedKeys}
          findNode={findNode}
        />
      );
      })}
    </div>
  );
});

BaseTree.displayName = 'BaseTree';
