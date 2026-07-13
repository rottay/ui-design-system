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
import type { CSSProperties } from 'react';
import type { MenuDividerProps } from '../../Menu.types';

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
}: MenuDividerProps): React.ReactElement {
  // ========================================================================
  // Styles
  // ========================================================================

  /**
   * Divider styles using CSS variables for theming.
   * Supports both solid and dashed variants.
   */
  const dividerStyle: CSSProperties = {
    height: '1px',
    margin: 'var(--ds-menu-divider-margin, 8px 0)',
    backgroundColor: 'var(--ds-menu-divider-color, var(--ds-color-border))',
    borderStyle: dashed ? 'dashed' : 'solid',
    borderWidth: dashed ? '1px 0 0 0' : 0,
    borderColor: dashed ? 'var(--ds-menu-divider-color, var(--ds-color-border))' : 'transparent',
    ...style,
  };

  // ========================================================================
  // Render
  // ========================================================================

  return (
    <li
      className={`rottay-menu-divider ${dashed ? 'rottay-menu-divider--dashed' : ''} ${className}`}
      style={dividerStyle}
      role="separator"
      data-part="divider"
    />
  );
}

MenuDivider.displayName = 'Menu.Divider';
