/**
 * TreeNode - Compound Component
 *
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
import type { TreeNodeProps } from '../../Tree.types';

/**
 * TreeNode component for declarative tree structure.
 * Note: This is primarily used for JSX-based tree definition.
 * The actual rendering is handled by the parent Tree component.
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

    // Base CSS variables
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
