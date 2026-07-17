/**
 * @fileoverview TreeNode compound component.
 * Allows declarative tree building with JSX syntax.
 * Used as Tree.TreeNode for defining tree structure inline.
 *
 * @example
 * ```tsx
 * <Tree>
 *   <Tree.TreeNode key="1" title="Parent">
 *     <Tree.TreeNode key="1-1" title="Child" />
 *   </Tree.TreeNode>
 * </Tree>
 * ```
 */

'use client';

import React, { forwardRef } from 'react';
import type { TreeNodeProps } from '../../contracts';

/**
 * TreeNode component for declarative tree structure.
 *
 * Primarily used for JSX-based tree definition. The parent Tree component
 * consumes these nodes and handles the actual rendering and interaction logic.
 *
 * @param props - TreeNodeProps including title, icon, disabled state, and nested children
 * @param ref - Forwarded ref to the root div element
 * @returns A treeitem div with icon, title, and optional nested children group
 *
 * @example
 * ```tsx
 * <Tree>
 *   <TreeNode key="docs" title="Documents" icon={<FolderIcon />}>
 *     <TreeNode key="readme" title="README.md" />
 *     <TreeNode key="license" title="LICENSE" disabled />
 *   </TreeNode>
 * </Tree>
 * ```
 */
export const TreeNode = forwardRef<HTMLDivElement, TreeNodeProps>(
  (props, ref) => {
    const {
      title,
      children,
      icon,
      disabled,
      className = '',
      style,
    } = props;

    // CSS custom properties for theming; opacity is reduced when the node is disabled
    const nodeVars: React.CSSProperties = {
      '--ds-tree-node-opacity': disabled ? '0.5' : '1',
    } as React.CSSProperties;

    const nodeStyle: React.CSSProperties = {
      ...nodeVars,
      display: 'flex',
      alignItems: 'center',
      padding: '4px 8px',
      opacity: 'var(--ds-tree-node-opacity)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      ...style,
    };

    return (
      <div
        ref={ref}
        className={`rottay-tree-node ${disabled ? 'rottay-tree-node--disabled' : ''} ${className}`}
        style={nodeStyle}
        role="treeitem"
        aria-disabled={disabled}
      >
        {icon && <span className="rottay-tree-node__icon">{icon}</span>}
        <span className="rottay-tree-node__title">{title}</span>
        {children && (
          <div className="rottay-tree-node__children" role="group">
            {children}
          </div>
        )}
      </div>
    );
  }
);

TreeNode.displayName = 'Tree.TreeNode';

export type { TreeNodeProps };
