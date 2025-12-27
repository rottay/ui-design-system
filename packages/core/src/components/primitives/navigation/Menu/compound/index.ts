/**
 * @fileoverview Menu Compound Components - Rottay Design System
 * @description Barrel export for Menu compound components including Item, Group,
 * SubMenu, and Divider for building menu structures with JSX composition.
 *
 * @remarks
 * These compound components provide an alternative to the declarative `items` prop,
 * allowing more flexible and composable menu structures. They work seamlessly
 * across all engine implementations (Titan, Hermes, Apollo).
 *
 * @example Using Compound Components
 * ```tsx
 * import { Menu } from '@rottay/design-system';
 *
 * <Menu mode="vertical">
 *   <Menu.Item itemKey="home" icon={<HomeIcon />}>Home</Menu.Item>
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
 * @see {@link MenuItem} for individual menu items
 * @see {@link MenuGroup} for grouping related items
 * @see {@link MenuSubMenu} for expandable nested menus
 * @see {@link MenuDivider} for visual separators
 *
 * @module Menu/Compound
 * @category Navigation
 * @package @rottay/design-system
 */

// ============================================================================
// Compound Component Exports
// ============================================================================

export { MenuItem } from './Item';
export { MenuGroup } from './Group';
export { MenuSubMenu } from './SubMenu';
export { MenuDivider } from './Divider';

// ============================================================================
// Type Exports
// ============================================================================

export type { MenuItemProps, MenuGroupProps, MenuSubMenuProps, MenuDividerProps } from '../types';
