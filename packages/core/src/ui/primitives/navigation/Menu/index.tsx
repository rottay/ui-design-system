'use client';

/**
 * @fileoverview Menu -- navigation menu supporting horizontal, vertical, and
 * inline modes with nested submenus, item grouping, and collapsible sidebar.
 *
 * @example
 * ```tsx
 * import { Menu } from '@rottay/design-system';
 *
 * // Items array API
 * <Menu mode="inline" items={[
 *   { key: 'home', label: 'Home', icon: <HomeIcon /> },
 *   { key: 'products', label: 'Products', children: [
 *     { key: 'electronics', label: 'Electronics' },
 *   ]},
 * ]} />
 *
 * // Compound component API
 * <Menu mode="vertical">
 *   <Menu.Item itemKey="home">Home</Menu.Item>
 *   <Menu.SubMenu itemKey="products" title="Products">
 *     <Menu.Item itemKey="electronics">Electronics</Menu.Item>
 *   </Menu.SubMenu>
 *   <Menu.Divider />
 *   <Menu.Group title="Account">
 *     <Menu.Item itemKey="logout" danger>Logout</Menu.Item>
 *   </Menu.Group>
 * </Menu>
 * ```
 *
 * @module Menu
 * @category Navigation
 */

import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import type { MenuProps } from './contracts';
import { MenuItem, MenuGroup, MenuSubMenu, MenuDivider } from './compound';

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
} from './contracts';
export { MENU_DEFAULTS } from './contracts';

export { MenuItem, MenuGroup, MenuSubMenu, MenuDivider };

// Assemble compound component: Menu + Menu.Item/SubMenu/Group/Divider
export const Menu = Object.assign(
  createEngineComponent<MenuProps>('Menu', {
    /** Ant Design implementation - full-featured with animations */
    classic: () => import('./engines/classic'),
    /** Rottay-native premium implementation - token-driven, skin-painted */
    modern: () => import('./engines/modern'),
    /** Vanilla HTML/CSS implementation - zero dependencies, full keyboard navigation */
    rustic: () => import('./engines/rustic'),
  }),
  {
    /** Clickable navigation option. */
    Item: MenuItem,
    /** Non-clickable header that groups related items. */
    Group: MenuGroup,
    /** Expandable container for nested menu items. */
    SubMenu: MenuSubMenu,
    /** Horizontal line separating menu sections. */
    Divider: MenuDivider,
  }
);
