/**
 * @fileoverview Menu.Group Compound Component - Rottay Design System
 * @description Groups related menu items under a non-clickable title header.
 * Part of the Menu compound component API for JSX composition.
 *
 * @remarks
 * The MenuGroup component organizes menu items into logical sections with
 * a visible title. The title is non-interactive and serves as a visual
 * separator for related items. Uses CSS variables for consistent theming.
 *
 * @example Basic Usage
 * ```tsx
 * <Menu.Group title="Account Settings">
 *   <Menu.Item itemKey="profile">Profile</Menu.Item>
 *   <Menu.Item itemKey="security">Security</Menu.Item>
 *   <Menu.Item itemKey="notifications">Notifications</Menu.Item>
 * </Menu.Group>
 * ```
 *
 * @example Multiple Groups
 * ```tsx
 * <Menu mode="vertical">
 *   <Menu.Group title="Navigation">
 *     <Menu.Item itemKey="home">Home</Menu.Item>
 *     <Menu.Item itemKey="dashboard">Dashboard</Menu.Item>
 *   </Menu.Group>
 *   <Menu.Divider />
 *   <Menu.Group title="Actions">
 *     <Menu.Item itemKey="create">Create New</Menu.Item>
 *     <Menu.Item itemKey="import">Import Data</Menu.Item>
 *   </Menu.Group>
 * </Menu>
 * ```
 *
 * @see {@link MenuGroupProps} for prop documentation
 * @see {@link Menu} for parent component
 *
 * @module Menu/Compound/Group
 * @category Navigation
 * @package @rottay/design-system
 */

'use client';

import React from 'react';
import type { CSSProperties } from 'react';
import type { MenuGroupProps } from '../../types';

// ============================================================================
// MenuGroup Component
// ============================================================================

/**
 * Menu item grouping component with title.
 *
 * @description
 * Renders a group of menu items with a non-clickable title header.
 * Useful for organizing menus into logical sections.
 *
 * @remarks
 * - Title is non-interactive (no click handler)
 * - Uses uppercase styling for visual distinction
 * - Children are rendered in a nested list with proper ARIA grouping
 * - Uses CSS variables for theming consistency
 *
 * @param props - {@link MenuGroupProps}
 * @returns Rendered menu group element
 *
 * @example
 * ```tsx
 * <MenuGroup title="User Management">
 *   <MenuItem itemKey="users">Users</MenuItem>
 *   <MenuItem itemKey="roles">Roles</MenuItem>
 * </MenuGroup>
 * ```
 */
export function MenuGroup({
  title,
  children,
  className = '',
  style,
}: MenuGroupProps): React.ReactElement {
  // ========================================================================
  // Styles
  // ========================================================================

  /**
   * Container styles for the group.
   */
  const groupStyle: CSSProperties = {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    ...style,
  };

  /**
   * Title header styles using CSS variables.
   */
  const titleStyle: CSSProperties = {
    padding: 'var(--ds-menu-group-title-padding, 8px 16px 4px)',
    fontSize: 'var(--ds-menu-group-title-font-size, 12px)',
    fontWeight: 'var(--ds-menu-group-title-font-weight, 600)',
    color: 'var(--ds-menu-group-title-color, var(--ds-color-text-muted))',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    userSelect: 'none',
  };

  /**
   * Content container styles.
   */
  const contentStyle: CSSProperties = {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  };

  // ========================================================================
  // Render
  // ========================================================================

  return (
    <li
      className={`rottay-menu-group ${className}`}
      style={groupStyle}
      role="presentation"
    >
      {/* Group title header */}
      <div
        className="rottay-menu-group__title"
        style={titleStyle}
        role="presentation"
      >
        {title}
      </div>

      {/* Grouped menu items */}
      <ul
        className="rottay-menu-group__content"
        style={contentStyle}
        role="group"
        aria-label={typeof title === 'string' ? title : undefined}
      >
        {children}
      </ul>
    </li>
  );
}

MenuGroup.displayName = 'Menu.Group';
