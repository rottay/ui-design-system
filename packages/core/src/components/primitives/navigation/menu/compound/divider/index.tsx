/**
 * @fileoverview Menu.Divider Compound Component - Rottay Design System
 * @description Visual separator component for dividing menu sections.
 * Part of the Menu compound component API for JSX composition.
 *
 * @remarks
 * The MenuDivider component creates a horizontal line to visually separate
 * menu items or groups. Supports solid and dashed line styles.
 * Uses CSS variables for consistent theming across the design system.
 *
 * @example Basic Usage
 * ```tsx
 * <Menu.Item itemKey="home">Home</Menu.Item>
 * <Menu.Divider />
 * <Menu.Item itemKey="settings">Settings</Menu.Item>
 * ```
 *
 * @example Dashed Divider
 * ```tsx
 * <Menu.Item itemKey="profile">Profile</Menu.Item>
 * <Menu.Divider dashed />
 * <Menu.Item itemKey="logout" danger>Logout</Menu.Item>
 * ```
 *
 * @example Separating Groups
 * ```tsx
 * <Menu mode="vertical">
 *   <Menu.Group title="Navigation">
 *     <Menu.Item itemKey="home">Home</Menu.Item>
 *     <Menu.Item itemKey="dashboard">Dashboard</Menu.Item>
 *   </Menu.Group>
 *   <Menu.Divider />
 *   <Menu.Group title="Settings">
 *     <Menu.Item itemKey="preferences">Preferences</Menu.Item>
 *     <Menu.Item itemKey="account">Account</Menu.Item>
 *   </Menu.Group>
 * </Menu>
 * ```
 *
 * @see {@link MenuDividerProps} for prop documentation
 * @see {@link Menu} for parent component
 *
 * @module Menu/Compound/Divider
 * @category Navigation
 * @package @rottay/design-system
 */

'use client';

import React from 'react';
import type { MenuDividerProps } from '../../contracts';

// ============================================================================
// MenuDivider Component
// ============================================================================

/**
 * Visual separator component for menus.
 *
 * @description
 * Renders a horizontal line to visually separate menu items or groups.
 * Supports solid (default) and dashed line styles.
 *
 * @remarks
 * - Uses CSS variables for color and spacing customization
 * - Includes proper ARIA separator role
 * - Supports both solid and dashed line styles
 * - Non-interactive element
 *
 * @param props - {@link MenuDividerProps}
 * @returns Rendered divider element
 *
 * @example
 * ```tsx
 * <MenuDivider />
 * // or
 * <MenuDivider dashed />
 * ```
 */
export function MenuDivider({
  dashed = false,
  className = '',
  style,
  'data-part': dataPart,
  // Caller passthrough (id / aria-* / data-* / data-testid): forwarded to the
  // divider element, BEFORE the engine's own stamps.
  ...rest
}: MenuDividerProps): React.ReactElement {
  // ========================================================================
  // Render
  // ========================================================================

  /* Geometry (1px block size, block margins) lives in `menu-compounds.css`
     on the `rottay-menu-divider` BEM class; only the caller's own `style`
     stays inline. */
  return (
    <li
      {...rest}
      className={`rottay-menu-divider ${dashed ? 'rottay-menu-divider--dashed' : ''} ${className}`}
      style={style}
      role="separator"
      data-part={dataPart ?? 'divider'}
    />
  );
}

MenuDivider.displayName = 'Menu.Divider';
