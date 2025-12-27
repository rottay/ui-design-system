/**
 * @fileoverview Menu Base Component - Rottay Design System
 * @description Base implementation of the Menu component using CSS variables
 * for consistent styling across the design system.
 *
 * @remarks
 * This base component provides the foundation for engine-specific implementations.
 * It uses CSS custom properties (variables) from the design tokens to ensure
 * consistent theming and easy customization through tenant configurations.
 *
 * The base component handles:
 * - Controlled and uncontrolled selection state
 * - Menu item rendering from the `items` prop
 * - CSS variable-based theming
 * - Basic accessibility attributes
 *
 * @module Menu/Base
 * @category Navigation
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef, useState, useCallback } from 'react';
import type { CSSProperties } from 'react';
import type { MenuProps, MenuItem as MenuItemType, MenuSelectInfo, MenuClickInfo } from '../types';
import { MENU_DEFAULTS } from '../types';
import { MenuItem, MenuGroup, MenuSubMenu, MenuDivider } from '../compound';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Renders menu items from the items prop recursively.
 *
 * @description
 * Transforms the declarative `items` array into rendered React components.
 * Handles all item types: regular items, submenus, groups, and dividers.
 *
 * @param items - Array of menu item configurations
 * @param onItemClick - Click handler for menu items
 * @param selectedKeys - Currently selected item keys
 * @param inlineIndent - Indentation size for nested items
 * @param level - Current nesting level (for indentation calculation)
 * @returns Rendered menu item React nodes
 *
 * @internal
 */
function renderMenuItems(
  items: MenuItemType[],
  onItemClick: (key: string, keyPath: string[], e: React.MouseEvent<HTMLElement>) => void,
  selectedKeys: string[],
  inlineIndent: number,
  level: number = 0
): React.ReactNode {
  return items.map((item) => {
    // Handle divider type
    if (item.type === 'divider') {
      return <MenuDivider key={item.key} />;
    }

    // Handle group type
    if (item.type === 'group') {
      return (
        <MenuGroup key={item.key} title={item.title || item.label}>
          {item.children && renderMenuItems(item.children, onItemClick, selectedKeys, inlineIndent, level + 1)}
        </MenuGroup>
      );
    }

    // Handle submenu (item with children)
    if (item.children && item.children.length > 0) {
      return (
        <MenuSubMenu
          key={item.key}
          itemKey={item.key}
          title={item.label}
          icon={item.icon}
          disabled={item.disabled}
        >
          {renderMenuItems(item.children, onItemClick, selectedKeys, inlineIndent, level + 1)}
        </MenuSubMenu>
      );
    }

    // Handle regular menu item
    const isSelected = selectedKeys.includes(item.key);
    return (
      <MenuItem
        key={item.key}
        itemKey={item.key}
        icon={item.icon}
        disabled={item.disabled}
        danger={item.danger}
        onClick={(e) => onItemClick(item.key, [item.key], e)}
        style={{
          paddingLeft: level > 0 ? `${inlineIndent * level}px` : undefined,
          backgroundColor: isSelected ? 'var(--menu-item-selected-bg, rgba(0, 0, 0, 0.04))' : undefined,
          color: isSelected ? 'var(--menu-item-selected-color, var(--menu-item-color))' : undefined,
        }}
      >
        {item.label}
      </MenuItem>
    );
  });
}

// ============================================================================
// Base Menu Component
// ============================================================================

/**
 * Base Menu component using CSS variables.
 *
 * @description
 * This is the foundational Menu component that uses CSS custom properties
 * for styling. It is extended by engine-specific implementations (Titan,
 * Hermes, Apollo) to provide framework-specific optimizations.
 *
 * @remarks
 * - Uses CSS variables from design tokens for theming
 * - Supports both `items` prop and compound component children
 * - Handles controlled and uncontrolled selection state
 * - Provides ARIA attributes for accessibility
 *
 * @example
 * ```tsx
 * import { BaseMenu } from '@rottay/design-system';
 *
 * <BaseMenu
 *   items={menuItems}
 *   mode="vertical"
 *   selectedKeys={['home']}
 *   onSelect={(info) => console.log(info)}
 * />
 * ```
 */
export const BaseMenu = forwardRef<HTMLUListElement, MenuProps>(
  (props, ref) => {
    const {
      items,
      mode = MENU_DEFAULTS.mode,
      selectedKeys: controlledSelectedKeys,
      defaultSelectedKeys = [],
      openKeys: controlledOpenKeys,
      defaultOpenKeys = [],
      multiple = MENU_DEFAULTS.multiple,
      selectable = MENU_DEFAULTS.selectable,
      inlineCollapsed = MENU_DEFAULTS.inlineCollapsed,
      expandIcon: _expandIcon,
      onSelect,
      onClick,
      onOpenChange: _onOpenChange,
      inlineIndent = MENU_DEFAULTS.inlineIndent,
      theme = MENU_DEFAULTS.theme,
      children,
      className = '',
      style = {},
    } = props;

    // Suppress unused warnings - these are used by engine implementations
    void _expandIcon;
    void _onOpenChange;

    // ========================================================================
    // State Management
    // ========================================================================

    // Internal state for uncontrolled mode
    const [internalSelectedKeys, setInternalSelectedKeys] = useState<string[]>(defaultSelectedKeys);
    const [_internalOpenKeys, _setInternalOpenKeys] = useState<string[]>(defaultOpenKeys);

    // Use controlled or uncontrolled state
    const selectedKeys = controlledSelectedKeys ?? internalSelectedKeys;
    const _openKeys = controlledOpenKeys ?? _internalOpenKeys;

    // Suppress unused warnings - these are used by engine implementations
    void _openKeys;

    // ========================================================================
    // Event Handlers
    // ========================================================================

    /**
     * Handles menu item click events.
     * Updates selection state and triggers callbacks.
     */
    const handleItemClick = useCallback(
      (key: string, keyPath: string[], e: React.MouseEvent<HTMLElement>) => {
        // Call onClick callback
        const clickInfo: MenuClickInfo = {
          key,
          keyPath,
          domEvent: e,
        };
        onClick?.(clickInfo);

        // Handle selection if selectable
        if (selectable) {
          let newSelectedKeys: string[];

          if (multiple) {
            // Toggle selection in multiple mode
            newSelectedKeys = selectedKeys.includes(key)
              ? selectedKeys.filter((k) => k !== key)
              : [...selectedKeys, key];
          } else {
            // Single selection
            newSelectedKeys = [key];
          }

          // Update internal state if uncontrolled
          if (controlledSelectedKeys === undefined) {
            setInternalSelectedKeys(newSelectedKeys);
          }

          // Call onSelect callback
          const selectInfo: MenuSelectInfo = {
            key,
            selectedKeys: newSelectedKeys,
            keyPath,
          };
          onSelect?.(selectInfo);
        }
      },
      [selectedKeys, multiple, selectable, controlledSelectedKeys, onClick, onSelect]
    );

    // ========================================================================
    // CSS Variables & Styles
    // ========================================================================

    // Build CSS variables for theming
    const menuVars: CSSProperties = {
      '--menu-bg': theme === 'dark' ? 'var(--menu-dark-bg, #001529)' : 'var(--menu-light-bg, #fff)',
      '--menu-item-color': theme === 'dark' ? 'var(--menu-dark-item-color, rgba(255, 255, 255, 0.65))' : 'var(--menu-light-item-color, rgba(0, 0, 0, 0.88))',
      '--menu-item-selected-color': theme === 'dark' ? 'var(--menu-dark-item-selected-color, #fff)' : 'var(--menu-light-item-selected-color, #1677ff)',
      '--menu-item-selected-bg': theme === 'dark' ? 'var(--menu-dark-item-selected-bg, #1677ff)' : 'var(--menu-light-item-selected-bg, #e6f4ff)',
      '--menu-submenu-indent': `${inlineIndent}px`,
    } as CSSProperties;

    // Computed styles
    const menuStyle: CSSProperties = {
      ...menuVars,
      display: mode === 'horizontal' ? 'flex' : 'block',
      flexDirection: mode === 'horizontal' ? 'row' : undefined,
      listStyle: 'none',
      padding: 'var(--menu-padding, 4px)',
      margin: 0,
      backgroundColor: 'var(--menu-bg)',
      borderRadius: 'var(--menu-border-radius, 8px)',
      width: inlineCollapsed && mode === 'inline' ? 'var(--menu-collapsed-width, 80px)' : undefined,
      transition: 'width 0.2s ease, background-color 0.2s ease',
      ...style,
    };

    // CSS class names
    const modeClass = `rottay-menu--${mode}`;
    const themeClass = `rottay-menu--${theme}`;
    const collapsedClass = inlineCollapsed ? 'rottay-menu--collapsed' : '';

    // ========================================================================
    // Render
    // ========================================================================

    return (
      <ul
        ref={ref}
        className={`rottay-menu ${modeClass} ${themeClass} ${collapsedClass} ${className}`}
        style={menuStyle}
        role="menu"
        aria-orientation={mode === 'horizontal' ? 'horizontal' : 'vertical'}
      >
        {items
          ? renderMenuItems(items, handleItemClick, selectedKeys, inlineIndent)
          : children}
      </ul>
    );
  }
);

BaseMenu.displayName = 'BaseMenu';
