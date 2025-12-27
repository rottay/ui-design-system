/**
 * @fileoverview Menu Titan Engine - Rottay Design System
 * @description Ant Design-based implementation of the Menu component.
 * Part of the Rottay Design System's multi-engine architecture.
 *
 * @remarks
 * The Titan engine leverages Ant Design's Menu component to provide a
 * full-featured navigation menu with:
 * - Rich animations and transitions
 * - Complete keyboard navigation
 * - Nested submenus with smooth expand/collapse
 * - Dark and light theme support
 * - Inline collapse functionality for sidebars
 *
 * This implementation is ideal for enterprise applications requiring
 * polished UI and comprehensive interaction patterns.
 *
 * @example
 * ```tsx
 * import { Menu } from '@rottay/design-system';
 *
 * // Uses Titan engine by default
 * <Menu
 *   items={menuItems}
 *   mode="inline"
 *   theme="dark"
 *   inlineCollapsed={isSidebarCollapsed}
 * />
 *
 * // Explicitly use Titan engine
 * <Menu engine="titan" items={menuItems} mode="vertical" />
 * ```
 *
 * @see {@link MenuProps} for prop documentation
 * @see {@link Menu} for main component
 *
 * @module Menu/Engines/Titan
 * @category Navigation
 * @package @rottay/design-system
 */

'use client';

import React, { useMemo } from 'react';
import { Menu as AntMenu } from 'antd';
import type { MenuProps as AntMenuProps } from 'antd';
import type { ItemType } from 'antd/es/menu/interface';
import type { MenuProps, MenuItem as MenuItemInterface, MenuSelectInfo, MenuClickInfo } from '../../types';
import { MENU_DEFAULTS } from '../../types';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Converts Rottay MenuItem format to Ant Design's ItemType format.
 *
 * @description
 * Recursively transforms our menu item structure to Ant Design's
 * expected format, handling regular items, submenus, groups, and dividers.
 *
 * @param items - Array of Rottay menu items
 * @returns Array of Ant Design menu items
 *
 * @internal
 */
function convertMenuItems(items: MenuItemInterface[]): ItemType[] {
  return items.map((item) => {
    // Handle divider type
    if (item.type === 'divider') {
      return {
        type: 'divider' as const,
        key: item.key,
      };
    }

    // Handle group type
    if (item.type === 'group') {
      return {
        type: 'group' as const,
        key: item.key,
        label: item.title || item.label,
        children: item.children ? convertMenuItems(item.children) : undefined,
      };
    }

    // Handle submenu (item with children)
    if (item.children && item.children.length > 0) {
      return {
        key: item.key,
        label: item.label,
        icon: item.icon,
        disabled: item.disabled,
        danger: item.danger,
        children: convertMenuItems(item.children),
      };
    }

    // Handle regular item
    return {
      key: item.key,
      label: item.label,
      icon: item.icon,
      disabled: item.disabled,
      danger: item.danger,
    };
  });
}

// ============================================================================
// TitanMenu Component
// ============================================================================

/**
 * Ant Design implementation of the Menu component.
 *
 * @description
 * Wraps Ant Design's Menu component with Rottay's interface, providing
 * seamless integration with the design system's theming and multi-tenant
 * capabilities.
 *
 * @remarks
 * - Full Ant Design feature support
 * - Converts Rottay props to Ant Design format
 * - Maintains consistent event interfaces
 * - Supports all menu modes (vertical, horizontal, inline)
 * - Theme-aware styling
 *
 * @param props - {@link MenuProps}
 * @returns Rendered Ant Design Menu component
 *
 * @example
 * ```tsx
 * <TitanMenu
 *   items={menuItems}
 *   mode="vertical"
 *   selectedKeys={['home']}
 *   onSelect={handleSelect}
 * />
 * ```
 */
export default function TitanMenu(props: MenuProps): React.ReactElement {
  const {
    items,
    mode = MENU_DEFAULTS.mode,
    selectedKeys,
    defaultSelectedKeys,
    openKeys,
    defaultOpenKeys,
    multiple = MENU_DEFAULTS.multiple,
    selectable = MENU_DEFAULTS.selectable,
    inlineCollapsed = MENU_DEFAULTS.inlineCollapsed,
    expandIcon,
    onSelect,
    onClick,
    onOpenChange,
    inlineIndent = MENU_DEFAULTS.inlineIndent,
    theme = MENU_DEFAULTS.theme,
    children,
    className,
    style,
  } = props;

  // ========================================================================
  // Item Conversion
  // ========================================================================

  /**
   * Memoized conversion of items to Ant Design format.
   */
  const antItems = useMemo(() => {
    return items ? convertMenuItems(items) : undefined;
  }, [items]);

  // ========================================================================
  // Event Handlers
  // ========================================================================

  /**
   * Handles selection events from Ant Design Menu.
   * Converts to Rottay's MenuSelectInfo format.
   */
  const handleSelect = (info: { key: string; selectedKeys: string[]; keyPath: string[] }) => {
    const selectInfo: MenuSelectInfo = {
      key: info.key,
      selectedKeys: info.selectedKeys,
      keyPath: info.keyPath,
    };
    onSelect?.(selectInfo);
  };

  /**
   * Handles click events from Ant Design Menu.
   * Converts to Rottay's MenuClickInfo format.
   */
  const handleClick: AntMenuProps['onClick'] = (info) => {
    const clickInfo: MenuClickInfo = {
      key: info.key,
      keyPath: info.keyPath,
      domEvent: info.domEvent as React.MouseEvent<HTMLElement>,
    };
    onClick?.(clickInfo);
  };

  // ========================================================================
  // Props Assembly
  // ========================================================================

  /**
   * Assembled props for Ant Design Menu component.
   */
  const antMenuProps: Partial<AntMenuProps> = {
    items: antItems,
    mode,
    selectedKeys,
    defaultSelectedKeys,
    openKeys,
    defaultOpenKeys,
    multiple,
    selectable,
    inlineCollapsed,
    expandIcon,
    onSelect: handleSelect as AntMenuProps['onSelect'],
    onClick: handleClick,
    onOpenChange,
    inlineIndent,
    theme,
    className: `rottay-menu rottay-menu--titan ${className || ''}`,
    style,
  };

  // ========================================================================
  // Render
  // ========================================================================

  // If using children instead of items, render them directly
  if (children && !items) {
    return (
      <AntMenu {...antMenuProps}>
        {children}
      </AntMenu>
    );
  }

  return <AntMenu {...antMenuProps} />;
}

TitanMenu.displayName = 'TitanMenu';
