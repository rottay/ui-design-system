/**
 * Menu - Engine Router
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { MenuProps } from './types';
import { MenuItem, MenuGroup, MenuSubMenu, MenuDivider } from './compound';

// Export types
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

// Export compound components
export { MenuItem, MenuGroup, MenuSubMenu, MenuDivider };

// Export base component
export { BaseMenu } from './base';

// Create engine-aware Menu component
export const Menu = Object.assign(
  createEngineComponent<MenuProps>('Menu', {
    titan: () => import('./engines/titan'),
    hermes: () => import('./engines/hermes'),
    apollo: () => import('./engines/apollo'),
  }),
  {
    Item: MenuItem,
    Group: MenuGroup,
    SubMenu: MenuSubMenu,
    Divider: MenuDivider,
  }
);
