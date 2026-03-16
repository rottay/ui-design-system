/**
 * @fileoverview Menu Modern Engine - Rottay Design System
 * @description DaisyUI/Tailwind-based implementation of the Menu component.
 * Part of the Rottay Design System's multi-engine architecture.
 *
 * @remarks
 * The Modern engine leverages DaisyUI's menu component classes to provide
 * a lightweight, utility-first navigation menu with:
 * - Tailwind CSS utility classes for styling
 * - DaisyUI's menu component classes
 * - Minimal JavaScript for interactivity
 * - Fast rendering with smaller bundle size
 *
 * This implementation is ideal for projects already using Tailwind CSS
 * or requiring lightweight, rapid development.
 *
 * @example
 * ```tsx
 * import { Menu } from '@rottay/design-system';
 *
 * // Use Modern engine explicitly
 * <Menu
 *   engine="modern"
 *   items={menuItems}
 *   mode="vertical"
 *   theme="light"
 * />
 *
 * // Or via EngineProvider
 * <EngineProvider engine="modern">
 *   <Menu items={menuItems} mode="horizontal" />
 * </EngineProvider>
 * ```
 *
 * @see {@link MenuProps} for prop documentation
 * @see {@link Menu} for main component
 *
 * @module Menu/Engines/Modern
 * @category Navigation
 * @package @rottay/design-system
 */

'use client';

import React, { useState, useCallback } from 'react';
import type { CSSProperties } from 'react';
import type { MenuProps, MenuItem as MenuItemInterface, MenuSelectInfo, MenuClickInfo } from '../Menu.types';
import { MENU_DEFAULTS } from '../Menu.types';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Renders DaisyUI menu items recursively.
 *
 * @description
 * Transforms the menu items array into DaisyUI-styled elements,
 * handling all item types: regular items, submenus, groups, and dividers.
 *
 * @param items - Array of menu item configurations
 * @param onItemClick - Click handler for menu items
 * @param selectedKeys - Currently selected item keys
 * @param level - Current nesting level
 * @returns Rendered DaisyUI menu item nodes
 *
 * @internal
 */
function renderDaisyMenuItems(
  items: MenuItemInterface[],
  onItemClick: (key: string, keyPath: string[], e: React.MouseEvent<HTMLElement>) => void,
  selectedKeys: string[],
  level: number = 0
): React.ReactNode {
  return items.map((item) => {
    // DaisyUI uses the `divider` class to render a horizontal separator
    if (item.type === 'divider') {
      return <li key={item.key} className="divider" />;
    }

    // Groups display a non-interactive heading via DaisyUI's `menu-title` class.
    // Children are nested inside a <ul> to maintain DaisyUI's menu structure.
    if (item.type === 'group') {
      return (
        <li key={item.key} className="menu-title">
          <span>{item.title || item.label}</span>
          {item.children && (
            <ul>
              {renderDaisyMenuItems(item.children, onItemClick, selectedKeys, level + 1)}
            </ul>
          )}
        </li>
      );
    }

    // Submenus use the native <details>/<summary> pattern which DaisyUI
    // leverages for collapsible sections. This avoids custom JS state for
    // open/close and provides built-in keyboard toggling via Enter/Space.
    if (item.children && item.children.length > 0) {
      return (
        <li key={item.key}>
          <details>
            <summary className={item.disabled ? 'disabled' : ''}>
              {item.icon}
              {item.label}
            </summary>
            <ul>
              {renderDaisyMenuItems(item.children, onItemClick, selectedKeys, level + 1)}
            </ul>
          </details>
        </li>
      );
    }

    // Regular leaf items. DaisyUI uses `active` class for the selected state
    // and `text-error` for destructive/danger actions (e.g., "Delete").
    const isSelected = selectedKeys.includes(item.key);
    const itemClasses = [
      item.disabled ? 'disabled' : '',
      item.danger ? 'text-error' : '',
      isSelected ? 'active' : '',
    ].filter(Boolean).join(' ');

    return (
      <li key={item.key}>
        <a
          className={itemClasses}
          onClick={(e) => {
            e.preventDefault();
            if (!item.disabled) {
              onItemClick(item.key, [item.key], e as React.MouseEvent<HTMLElement>);
            }
          }}
          aria-disabled={item.disabled}
        >
          {item.icon}
          {item.label}
        </a>
      </li>
    );
  });
}

// ============================================================================
// ModernMenu Component
// ============================================================================

/**
 * DaisyUI/Tailwind implementation of the Menu component.
 *
 * @description
 * Renders the Menu component using DaisyUI classes for styling,
 * providing a lightweight alternative to the Classic engine.
 *
 * @remarks
 * - Uses DaisyUI's menu component classes
 * - Utility-first styling with Tailwind CSS
 * - Supports horizontal and vertical modes
 * - Theme-aware with base color classes
 * - Smaller bundle size than Classic
 *
 * @param props - {@link MenuProps}
 * @returns Rendered DaisyUI Menu component
 *
 * @example
 * ```tsx
 * <ModernMenu
 *   items={menuItems}
 *   mode="horizontal"
 *   selectedKeys={['dashboard']}
 *   onSelect={handleSelect}
 * />
 * ```
 */
export default function ModernMenu(props: MenuProps): React.ReactElement {
  const {
    items,
    mode = MENU_DEFAULTS.mode,
    selectedKeys: controlledSelectedKeys,
    defaultSelectedKeys = [],
    multiple = MENU_DEFAULTS.multiple,
    selectable = MENU_DEFAULTS.selectable,
    inlineCollapsed = MENU_DEFAULTS.inlineCollapsed,
    onSelect,
    onClick,
    theme = MENU_DEFAULTS.theme,
    children,
    className = '',
    style,
  } = props;

  // ========================================================================
  // State Management
  // ========================================================================

  /** Internal state for uncontrolled selection mode */
  const [internalSelectedKeys, setInternalSelectedKeys] = useState<string[]>(defaultSelectedKeys);

  /** Use controlled or uncontrolled state */
  const selectedKeys = controlledSelectedKeys ?? internalSelectedKeys;

  // ========================================================================
  // Event Handlers
  // ========================================================================

  /**
   * Handles menu item click events.
   * Manages selection state and triggers callbacks.
   */
  const handleItemClick = useCallback(
    (key: string, keyPath: string[], e: React.MouseEvent<HTMLElement>) => {
      // Fire click callback first, before selection logic, so consumers
      // can inspect the raw click even when selection is disabled
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
          // Multiple mode: toggle the clicked key on/off in the selection set
          newSelectedKeys = selectedKeys.includes(key)
            ? selectedKeys.filter((k) => k !== key)
            : [...selectedKeys, key];
        } else {
          // Single mode: replace entire selection with the clicked key
          newSelectedKeys = [key];
        }

        // Only update internal state when running in uncontrolled mode.
        // In controlled mode the parent owns the selectedKeys array.
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
  // Styles & Classes
  // ========================================================================

  /**
   * DaisyUI menu classes based on props.
   */
  // Build DaisyUI class list. `menu-compact` reduces padding/spacing when
  // the sidebar is collapsed, mimicking antd's inlineCollapsed behavior.
  // Background color tokens switch between DaisyUI's base shades for theming.
  const menuClasses = [
    'menu',
    mode === 'horizontal' ? 'menu-horizontal' : 'menu-vertical',
    inlineCollapsed ? 'menu-compact' : '',
    theme === 'dark' ? 'bg-base-300' : 'bg-base-100',
    'rounded-box',
    className,
  ].filter(Boolean).join(' ');

  /**
   * Custom styles for additional customization.
   */
  const menuStyle: CSSProperties = {
    ...style,
  };

  // ========================================================================
  // Render
  // ========================================================================

  return (
    <ul
      className={`rottay-menu rottay-menu--modern ${menuClasses}`}
      style={menuStyle}
      role="menu"
    >
      {items
        ? renderDaisyMenuItems(items, handleItemClick, selectedKeys)
        : children}
    </ul>
  );
}

ModernMenu.displayName = 'ModernMenu';
