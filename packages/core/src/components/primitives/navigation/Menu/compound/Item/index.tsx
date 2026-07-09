/**
 * @fileoverview Menu.Item Compound Component - Rottay Design System
 * @description Individual menu item component for rendering clickable navigation options.
 * Part of the Menu compound component API for JSX composition.
 *
 * @remarks
 * The MenuItem component represents a single clickable item in the menu.
 * It supports icons, disabled states, danger styling, and keyboard navigation.
 * Uses CSS variables for consistent theming across the design system.
 *
 * @example Basic Usage
 * ```tsx
 * <Menu.Item itemKey="home" icon={<HomeIcon />}>
 *   Home
 * </Menu.Item>
 * ```
 *
 * @example Disabled Item
 * ```tsx
 * <Menu.Item itemKey="premium" disabled>
 *   Premium Features
 * </Menu.Item>
 * ```
 *
 * @example Danger Item
 * ```tsx
 * <Menu.Item itemKey="delete" danger onClick={handleDelete}>
 *   Delete Account
 * </Menu.Item>
 * ```
 *
 * @see {@link MenuItemProps} for prop documentation
 * @see {@link Menu} for parent component
 *
 * @module Menu/Compound/Item
 * @category Navigation
 * @package @rottay/design-system
 */

'use client';

import React from 'react';
import type { CSSProperties } from 'react';
import type { MenuItemProps } from '../../Menu.types';

// ============================================================================
// MenuItem Component
// ============================================================================

/**
 * Individual menu item component.
 *
 * @description
 * Renders a single clickable menu item with optional icon, disabled state,
 * and danger styling. Supports keyboard navigation with Enter and Space keys.
 *
 * @remarks
 * - Uses CSS variables for theming consistency
 * - Fully accessible with ARIA attributes
 * - Supports keyboard navigation (Enter, Space)
 * - Danger items display in red for destructive actions
 *
 * @param props - {@link MenuItemProps}
 * @returns Rendered menu item element
 *
 * @example
 * ```tsx
 * <MenuItem itemKey="settings" icon={<GearIcon />} onClick={openSettings}>
 *   Settings
 * </MenuItem>
 * ```
 */
export function MenuItem({
  itemKey,
  icon,
  disabled = false,
  danger = false,
  onClick,
  title,
  children,
  className = '',
  style,
}: MenuItemProps): React.ReactElement {
  // ========================================================================
  // Event Handlers
  // ========================================================================

  /**
   * Handles click events on the menu item.
   * Prevents default behavior when disabled.
   */
  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  /**
   * Handles keyboard events for accessibility.
   * Triggers click on Enter or Space key press.
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLLIElement>) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.(e as unknown as React.MouseEvent<HTMLElement>);
    }
  };

  // ========================================================================
  // Styles
  // ========================================================================

  /**
   * CSS styles using CSS variables for theming.
   */
  const itemStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--ds-menu-item-gap, 8px)',
    padding: 'var(--ds-menu-item-padding, 8px 16px)',
    minHeight: 'var(--ds-menu-item-height, 40px)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    color: danger
      ? 'var(--ds-menu-item-danger-color, var(--ds-color-error))'
      : 'var(--ds-menu-item-color, inherit)',
    backgroundColor: 'transparent',
    borderRadius: 'var(--ds-menu-border-radius, 8px)',
    transition: 'all 0.2s ease',
    userSelect: 'none',
    ...style,
  };

  // ========================================================================
  // Render
  // ========================================================================

  return (
    <li
      className={`rottay-menu-item ${disabled ? 'rottay-menu-item--disabled' : ''} ${danger ? 'rottay-menu-item--danger' : ''} ${className}`}
      style={itemStyle}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="menuitem"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      title={title}
      data-key={itemKey}
    >
      {/* Icon container */}
      {icon && <span className="rottay-menu-item__icon">{icon}</span>}

      {/* Label text */}
      <span className="rottay-menu-item__label">{children}</span>
    </li>
  );
}

MenuItem.displayName = 'Menu.Item';
