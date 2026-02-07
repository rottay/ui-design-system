'use client';

/**
 * @fileoverview Menu Component - Rottay Design System
 * @description A versatile navigation menu component supporting horizontal, vertical,
 * and inline modes with nested submenus and grouping capabilities.
 * Part of the Rottay Design System's navigation primitives collection.
 *
 * @remarks
 * The Menu component is built on Rottay's multi-engine architecture, allowing
 * seamless rendering across Classic (Ant Design), Modern (DaisyUI), and Rustic
 * (Vanilla) engines. This ensures consistent behavior while adapting to your
 * project's styling framework.
 *
 * Multi-tenant theming is fully supported - menu styling automatically adapts
 * to your tenant's brand colors, spacing, and typography tokens.
 *
 * @example Basic Vertical Menu
 * ```tsx
 * import { Menu } from '@rottay/design-system';
 *
 * const items = [
 *   { key: 'home', label: 'Home', icon: <HomeIcon /> },
 *   { key: 'products', label: 'Products', icon: <ShopIcon /> },
 *   { key: 'about', label: 'About Us', icon: <InfoIcon /> },
 *   { key: 'contact', label: 'Contact', icon: <MailIcon /> },
 * ];
 *
 * function Sidebar() {
 *   return (
 *     <Menu
 *       items={items}
 *       mode="vertical"
 *       onSelect={(info) => console.log('Selected:', info.key)}
 *     />
 *   );
 * }
 * ```
 *
 * @example Horizontal Navigation
 * ```tsx
 * import { Menu } from '@rottay/design-system';
 *
 * const navItems = [
 *   { key: 'dashboard', label: 'Dashboard' },
 *   { key: 'analytics', label: 'Analytics' },
 *   { key: 'reports', label: 'Reports' },
 *   { key: 'settings', label: 'Settings' },
 * ];
 *
 * function TopNavigation() {
 *   return (
 *     <Menu
 *       items={navItems}
 *       mode="horizontal"
 *       defaultSelectedKeys={['dashboard']}
 *     />
 *   );
 * }
 * ```
 *
 * @example With Submenus and Groups
 * ```tsx
 * import { Menu } from '@rottay/design-system';
 *
 * const menuItems = [
 *   {
 *     key: 'products',
 *     label: 'Products',
 *     icon: <ShopIcon />,
 *     children: [
 *       { key: 'electronics', label: 'Electronics' },
 *       { key: 'clothing', label: 'Clothing' },
 *       { key: 'accessories', label: 'Accessories' },
 *     ],
 *   },
 *   { type: 'divider', key: 'divider-1' },
 *   {
 *     type: 'group',
 *     key: 'account-group',
 *     title: 'Account',
 *     children: [
 *       { key: 'profile', label: 'Profile' },
 *       { key: 'settings', label: 'Settings' },
 *       { key: 'logout', label: 'Logout', danger: true },
 *     ],
 *   },
 * ];
 *
 * function NavigationMenu() {
 *   return <Menu items={menuItems} mode="inline" />;
 * }
 * ```
 *
 * @example With Compound Components
 * ```tsx
 * import { Menu } from '@rottay/design-system';
 *
 * <Menu mode="vertical">
 *   <Menu.Item itemKey="home" icon={<HomeIcon />}>
 *     Home
 *   </Menu.Item>
 *   <Menu.SubMenu itemKey="products" title="Products" icon={<ShopIcon />}>
 *     <Menu.Item itemKey="electronics">Electronics</Menu.Item>
 *     <Menu.Item itemKey="clothing">Clothing</Menu.Item>
 *   </Menu.SubMenu>
 *   <Menu.Divider />
 *   <Menu.Group title="Account">
 *     <Menu.Item itemKey="profile">Profile</Menu.Item>
 *     <Menu.Item itemKey="logout" danger>Logout</Menu.Item>
 *   </Menu.Group>
 * </Menu>
 * ```
 *
 * @example Collapsible Sidebar Menu
 * ```tsx
 * import { Menu, Button } from '@rottay/design-system';
 * import { useState } from 'react';
 *
 * function CollapsibleSidebar() {
 *   const [collapsed, setCollapsed] = useState(false);
 *
 *   return (
 *     <aside style={{ width: collapsed ? 80 : 256 }}>
 *       <Button onClick={() => setCollapsed(!collapsed)}>
 *         {collapsed ? 'Expand' : 'Collapse'}
 *       </Button>
 *       <Menu
 *         mode="inline"
 *         inlineCollapsed={collapsed}
 *         items={menuItems}
 *       />
 *     </aside>
 *   );
 * }
 * ```
 *
 * @example Multi-Tenant Theming
 * ```tsx
 * // Menu automatically inherits tenant theme
 * <ThemeProvider tenant="acme-corp">
 *   <Menu items={items} theme="dark">
 *     {/* Uses ACME Corp's brand colors and styling *\/}
 *   </Menu>
 * </ThemeProvider>
 * ```
 *
 * @example Engine Override
 * ```tsx
 * // Force a specific rendering engine
 * <Menu engine="modern" items={items} mode="vertical">
 *   {/* Renders with DaisyUI/Tailwind styling *\/}
 * </Menu>
 * ```
 *
 * @see {@link MenuProps} for complete prop documentation
 * @see {@link MenuItem} for menu item compound component
 * @see {@link MenuSubMenu} for submenu compound component
 * @see {@link MenuGroup} for grouping compound component
 * @see {@link MenuDivider} for divider compound component
 *
 * @module Menu
 * @category Navigation
 * @package @rottay/design-system
 */

import { createEngineComponent } from '../../../../core/engines/factory';
import type { MenuProps } from './types';
import { MenuItem, MenuGroup, MenuSubMenu, MenuDivider } from './compound';

// ============================================================================
// Type Exports
// ============================================================================

export type {
  MenuProps,
  MenuItem as MenuItemType,
  MenuMode,
  MenuItemType as MenuItemTypeEnum,
  MenuSelectInfo,
  MenuClickInfo,
  MenuItemProps,
  MenuGroupProps,
  MenuSubMenuProps,
  MenuDividerProps,
} from './types';
export { MENU_DEFAULTS } from './types';

// ============================================================================
// Compound Component Exports
// ============================================================================

export { MenuItem, MenuGroup, MenuSubMenu, MenuDivider };

// ============================================================================
// Base Component Export
// ============================================================================


// ============================================================================
// Main Component
// ============================================================================

/**
 * Menu component with multi-engine support and compound components.
 *
 * @description
 * A versatile navigation menu that supports multiple display modes. Ideal for:
 * - Sidebar navigation
 * - Top navigation bars
 * - Dropdown menus
 * - Context menus
 * - Application dashboards
 *
 * @remarks
 * - Supports vertical, horizontal, and inline display modes
 * - Nested submenus with smooth expand/collapse animations
 * - Menu item grouping with titles
 * - Full keyboard navigation (Arrow keys, Enter, Escape)
 * - Controlled and uncontrolled selection modes
 * - Multiple selection support
 * - Dark and light themes
 * - Collapsible inline mode for sidebars
 * - Fully accessible with ARIA attributes
 * - Adapts to tenant theming automatically
 *
 * @param props - {@link MenuProps}
 * @returns React component with Item, SubMenu, Group, and Divider compound components
 *
 * @example
 * ```tsx
 * <Menu mode="vertical" selectedKeys={['home']} onSelect={handleSelect}>
 *   <Menu.Item itemKey="home">Home</Menu.Item>
 *   <Menu.SubMenu itemKey="products" title="Products">
 *     <Menu.Item itemKey="electronics">Electronics</Menu.Item>
 *   </Menu.SubMenu>
 *   <Menu.Divider />
 *   <Menu.Item itemKey="settings">Settings</Menu.Item>
 * </Menu>
 * ```
 */
export const Menu = Object.assign(
  createEngineComponent<MenuProps>('Menu', {
    /** Ant Design implementation - full-featured with animations */
    classic: () => import('./engines/classic'),
    /** DaisyUI/Tailwind implementation - utility-first styling */
    modern: () => import('./engines/modern'),
    /** Vanilla HTML/CSS implementation - zero dependencies, full keyboard navigation */
    rustic: () => import('./engines/rustic'),
  }),
  {
    /**
     * Individual menu item.
     * Represents a clickable navigation option.
     * @see {@link MenuItem}
     */
    Item: MenuItem,

    /**
     * Menu item grouping with a title.
     * Groups related menu items under a non-clickable header.
     * @see {@link MenuGroup}
     */
    Group: MenuGroup,

    /**
     * Expandable submenu container.
     * Contains nested menu items with expand/collapse behavior.
     * @see {@link MenuSubMenu}
     */
    SubMenu: MenuSubMenu,

    /**
     * Visual separator between menu items.
     * Creates a horizontal line to separate menu sections.
     * @see {@link MenuDivider}
     */
    Divider: MenuDivider,
  }
);
