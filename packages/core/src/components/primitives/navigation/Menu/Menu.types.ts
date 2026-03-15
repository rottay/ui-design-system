/**
 * @fileoverview Menu Component Types - Rottay Design System
 * @description Type definitions for the Menu navigation component and its compound components.
 * Provides comprehensive TypeScript interfaces for menu items, events, and configuration.
 *
 * @remarks
 * These types support the multi-engine architecture of the Menu component,
 * ensuring type safety across Classic, Modern, and Rustic engine implementations.
 *
 * @module Menu/Types
 * @category Navigation
 * @package @rottay/design-system
 */

import type { ReactNode } from 'react';
import type { BaseComponentProps, WithChildren } from '../../../../contracts/common';
import type { EngineAwareProps } from '../../../../contracts/engine';

// ============================================================================
// Menu Mode Types
// ============================================================================

/**
 * Menu display mode types.
 *
 * @description
 * Defines how the menu is visually displayed and oriented.
 *
 * @remarks
 * - `vertical`: Items stacked vertically (default, ideal for sidebars)
 * - `horizontal`: Items arranged horizontally (ideal for top navigation)
 * - `inline`: Vertical with inline submenu expansion (ideal for collapsible sidebars)
 */
export type MenuMode = 'vertical' | 'horizontal' | 'inline';

/**
 * Menu item type identifier.
 *
 * @description
 * Special type markers for non-standard menu items.
 *
 * @remarks
 * - `group`: Groups items under a non-clickable title header
 * - `divider`: Renders a visual separator line
 */
export type MenuItemType = 'group' | 'divider';

// ============================================================================
// Menu Item Interface
// ============================================================================

/**
 * Menu item data interface.
 *
 * @description
 * Represents a single item in the menu's `items` array prop.
 * Supports regular items, submenus, groups, and dividers.
 *
 * @example Regular Item
 * ```tsx
 * const item: MenuItem = {
 *   key: 'home',
 *   label: 'Home',
 *   icon: <HomeIcon />,
 * };
 * ```
 *
 * @example Submenu with Children
 * ```tsx
 * const submenu: MenuItem = {
 *   key: 'products',
 *   label: 'Products',
 *   icon: <ShopIcon />,
 *   children: [
 *     { key: 'electronics', label: 'Electronics' },
 *     { key: 'clothing', label: 'Clothing' },
 *   ],
 * };
 * ```
 *
 * @example Group Item
 * ```tsx
 * const group: MenuItem = {
 *   key: 'account-group',
 *   type: 'group',
 *   title: 'Account',
 *   children: [
 *     { key: 'profile', label: 'Profile' },
 *     { key: 'settings', label: 'Settings' },
 *   ],
 * };
 * ```
 */
export interface MenuItem {
  /** Unique key for the menu item (required for selection and navigation) */
  key: string;

  /** Label to display (text or React node) */
  label: ReactNode;

  /** Icon to display before the label */
  icon?: ReactNode;

  /** Whether the item is disabled (non-interactive) */
  disabled?: boolean;

  /** Whether the item is a danger/destructive action (displays in red) */
  danger?: boolean;

  /** Child menu items (creates a submenu when present) */
  children?: MenuItem[];

  /** Type of menu item ('group' | 'divider') */
  type?: MenuItemType;

  /** Title for group type items */
  title?: string;
}

// ============================================================================
// Event Info Interfaces
// ============================================================================

/**
 * Menu selection event information.
 *
 * @description
 * Payload provided to the `onSelect` callback when a menu item is selected.
 *
 * @example
 * ```tsx
 * const handleSelect = (info: MenuSelectInfo) => {
 *   console.log('Selected key:', info.key);
 *   console.log('All selected:', info.selectedKeys);
 *   console.log('Path to item:', info.keyPath);
 * };
 * ```
 */
export interface MenuSelectInfo {
  /** The key of the selected item */
  key: string;

  /** Array of all currently selected keys */
  selectedKeys: string[];

  /** Path of keys from root to the selected item */
  keyPath: string[];
}

/**
 * Menu click event information.
 *
 * @description
 * Payload provided to the `onClick` callback when a menu item is clicked.
 *
 * @example
 * ```tsx
 * const handleClick = (info: MenuClickInfo) => {
 *   console.log('Clicked key:', info.key);
 *   console.log('DOM event:', info.domEvent);
 * };
 * ```
 */
export interface MenuClickInfo {
  /** The key of the clicked item */
  key: string;

  /** Path of keys from root to the clicked item */
  keyPath: string[];

  /** The original DOM event (mouse or keyboard) */
  domEvent: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>;
}

// ============================================================================
// Main Menu Props
// ============================================================================

/**
 * Base Menu component props.
 *
 * @description
 * Complete configuration options for the Menu component.
 * Extends base component props and engine-aware props for multi-engine support.
 *
 * @example Basic Usage
 * ```tsx
 * <Menu
 *   items={menuItems}
 *   mode="vertical"
 *   selectedKeys={['home']}
 *   onSelect={(info) => setSelected(info.selectedKeys)}
 * />
 * ```
 *
 * @example With All Options
 * ```tsx
 * <Menu
 *   items={menuItems}
 *   mode="inline"
 *   theme="dark"
 *   selectedKeys={selectedKeys}
 *   openKeys={openKeys}
 *   onSelect={handleSelect}
 *   onClick={handleClick}
 *   onOpenChange={handleOpenChange}
 *   inlineCollapsed={isCollapsed}
 *   inlineIndent={24}
 *   multiple={false}
 *   selectable={true}
 * />
 * ```
 */
export interface MenuProps extends BaseComponentProps, EngineAwareProps, WithChildren {
  /**
   * Menu items array (alternative to children).
   * @description Declarative way to define menu structure
   */
  items?: MenuItem[];

  /**
   * Menu display mode.
   * @default 'vertical'
   * @description
   * - `vertical`: Stacked items (sidebar navigation)
   * - `horizontal`: Inline items (top navigation)
   * - `inline`: Vertical with expandable submenus
   */
  mode?: MenuMode;

  /**
   * Currently selected keys (controlled mode).
   * @description When provided, component becomes controlled
   */
  selectedKeys?: string[];

  /**
   * Default selected keys (uncontrolled mode).
   * @description Initial selection when component mounts
   */
  defaultSelectedKeys?: string[];

  /**
   * Currently open submenu keys (controlled mode).
   * @description When provided, submenu expansion becomes controlled
   */
  openKeys?: string[];

  /**
   * Default open submenu keys (uncontrolled mode).
   * @description Initially expanded submenus when component mounts
   */
  defaultOpenKeys?: string[];

  /**
   * Whether to allow multiple selection.
   * @default false
   * @description Enable to allow selecting multiple menu items
   */
  multiple?: boolean;

  /**
   * Whether items are selectable.
   * @default true
   * @description Set to false for navigation-only menus
   */
  selectable?: boolean;

  /**
   * Whether inline menu is collapsed.
   * Only works when mode is 'inline'.
   * @default false
   * @description Collapses sidebar to show only icons
   */
  inlineCollapsed?: boolean;

  /**
   * Custom expand icon for submenus.
   * @description Override the default chevron icon
   */
  expandIcon?: ReactNode;

  /**
   * Callback when menu item is selected.
   * @param info - Selection event information
   */
  onSelect?: (info: MenuSelectInfo) => void;

  /**
   * Callback when menu item is clicked.
   * @param info - Click event information
   */
  onClick?: (info: MenuClickInfo) => void;

  /**
   * Callback when open submenus change.
   * @param openKeys - Array of currently open submenu keys
   */
  onOpenChange?: (openKeys: string[]) => void;

  /**
   * Inline indent size in pixels for nested items.
   * @default 24
   * @description Spacing for each nesting level
   */
  inlineIndent?: number;

  /**
   * Theme variant for the menu.
   * @default 'light'
   * @description Visual theme ('light' or 'dark')
   */
  theme?: 'light' | 'dark';
}

// ============================================================================
// Compound Component Props
// ============================================================================

/**
 * Menu.Item component props.
 *
 * @description
 * Props for individual menu items when using compound component syntax.
 *
 * @example
 * ```tsx
 * <Menu.Item
 *   itemKey="dashboard"
 *   icon={<DashboardIcon />}
 *   onClick={() => navigate('/dashboard')}
 * >
 *   Dashboard
 * </Menu.Item>
 * ```
 */
export interface MenuItemProps extends BaseComponentProps, WithChildren {
  /**
   * Unique key for menu item.
   * @description Used for selection tracking and event callbacks
   */
  itemKey?: string;

  /**
   * Icon to display before the label.
   * @description Typically a React icon component
   */
  icon?: ReactNode;

  /**
   * Whether item is disabled.
   * @default false
   * @description Prevents interaction and dims appearance
   */
  disabled?: boolean;

  /**
   * Whether item is a danger/destructive action.
   * @default false
   * @description Displays item in red/danger color
   */
  danger?: boolean;

  /**
   * Click handler for the menu item.
   * @param e - Mouse click event
   */
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;

  /**
   * Title attribute for tooltip on hover.
   * @description Useful for collapsed menus
   */
  title?: string;
}

/**
 * Menu.Group component props.
 *
 * @description
 * Props for grouping related menu items under a title header.
 *
 * @example
 * ```tsx
 * <Menu.Group title="Account Settings">
 *   <Menu.Item itemKey="profile">Profile</Menu.Item>
 *   <Menu.Item itemKey="security">Security</Menu.Item>
 * </Menu.Group>
 * ```
 */
export interface MenuGroupProps extends BaseComponentProps, WithChildren {
  /**
   * Group title displayed above the items.
   * @description Non-clickable header text or React node
   */
  title: ReactNode;
}

/**
 * Menu.SubMenu component props.
 *
 * @description
 * Props for expandable submenu containers with nested items.
 *
 * @example
 * ```tsx
 * <Menu.SubMenu
 *   itemKey="products"
 *   title="Products"
 *   icon={<ShopIcon />}
 * >
 *   <Menu.Item itemKey="electronics">Electronics</Menu.Item>
 *   <Menu.Item itemKey="clothing">Clothing</Menu.Item>
 * </Menu.SubMenu>
 * ```
 */
export interface MenuSubMenuProps extends BaseComponentProps, WithChildren {
  /**
   * Unique key for submenu.
   * @description Used for open state tracking
   */
  itemKey?: string;

  /**
   * SubMenu title/label displayed in the parent menu.
   * @description Clickable text or React node that toggles expansion
   */
  title: ReactNode;

  /**
   * Icon to display before the title.
   * @description Typically a React icon component
   */
  icon?: ReactNode;

  /**
   * Whether submenu is disabled.
   * @default false
   * @description Prevents expansion and dims appearance
   */
  disabled?: boolean;

  /**
   * Callback when submenu title is clicked.
   * @param e - Mouse click event
   */
  onTitleClick?: (e: React.MouseEvent<HTMLElement>) => void;

  /**
   * Custom expand icon for this submenu.
   * @description Override the default chevron icon
   */
  expandIcon?: ReactNode;
}

/**
 * Menu.Divider component props.
 *
 * @description
 * Props for visual separator lines between menu items or groups.
 *
 * @example
 * ```tsx
 * <Menu.Item itemKey="home">Home</Menu.Item>
 * <Menu.Divider dashed />
 * <Menu.Item itemKey="settings">Settings</Menu.Item>
 * ```
 */
export interface MenuDividerProps extends BaseComponentProps {
  /**
   * Whether the divider line is dashed.
   * @default false
   * @description Renders a dashed line instead of solid
   */
  dashed?: boolean;
}

// ============================================================================
// Default Values
// ============================================================================

/**
 * Default values for Menu component props.
 *
 * @description
 * Provides sensible defaults for optional Menu props.
 * Used internally by all engine implementations.
 *
 * @example
 * ```tsx
 * // These are the default values when props are not specified
 * const {
 *   mode = MENU_DEFAULTS.mode,           // 'vertical'
 *   selectable = MENU_DEFAULTS.selectable, // true
 *   multiple = MENU_DEFAULTS.multiple,     // false
 *   inlineCollapsed = MENU_DEFAULTS.inlineCollapsed, // false
 *   inlineIndent = MENU_DEFAULTS.inlineIndent, // 24
 *   theme = MENU_DEFAULTS.theme,           // 'light'
 * } = props;
 * ```
 */
export const MENU_DEFAULTS = {
  /** Default display mode */
  mode: 'vertical' as const,

  /** Default selectable state */
  selectable: true,

  /** Default multiple selection state */
  multiple: false,

  /** Default collapsed state */
  inlineCollapsed: false,

  /** Default indent size in pixels */
  inlineIndent: 24,

  /** Default theme variant */
  theme: 'light' as const,
};
