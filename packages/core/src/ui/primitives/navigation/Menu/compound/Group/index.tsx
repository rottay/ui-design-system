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
import type { MenuGroupProps } from '../../contracts';

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
  'data-part': dataPart,
  // Caller passthrough (id / aria-* / data-* / data-testid): forwarded to the
  // group root element, BEFORE the engine's own stamps.
  ...rest
}: MenuGroupProps): React.ReactElement {
  // ========================================================================
  // Render
  // ========================================================================

  /* Layout and paint (list resets, title padding/typography/uppercase
     tracking) live in `menu-compounds.css` on the `rottay-menu-group` BEM
     classes; only the caller's own `style` stays inline. The former inline
     title block carried a font-size literal, which the typographic-roles law
     forbids in components. */
  return (
    <li
      {...rest}
      className={`rottay-menu-group ${className}`}
      style={style}
      role="presentation"
      data-part={dataPart ?? 'group'}
    >
      {/* Group title header */}
      <div
        className="rottay-menu-group__title"
        role="presentation"
        data-part="group-label"
      >
        {title}
      </div>

      {/* Grouped menu items */}
      <ul
        className="rottay-menu-group__content"
        role="group"
        data-part="panel"
        aria-label={typeof title === 'string' ? title : undefined}
      >
        {children}
      </ul>
    </li>
  );
}

MenuGroup.displayName = 'Menu.Group';
