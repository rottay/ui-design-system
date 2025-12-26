/**
 * Menu - Core Interface
 */

import type { ReactNode } from 'react';
import type { BaseComponentProps, WithChildren } from '../../../../../types/common';
import type { EngineAwareProps } from '../../../../../types/engine';

/**
 * Menu mode types.
 */
export type MenuMode = 'vertical' | 'horizontal' | 'inline';

/**
 * Menu item type.
 */
export type MenuItemType = 'group' | 'divider';

/**
 * Menu item interface.
 */
export interface MenuItem {
  /** Unique key for the menu item */
  key: string;
  /** Label to display */
  label: ReactNode;
  /** Icon to display before label */
  icon?: ReactNode;
  /** Whether item is disabled */
  disabled?: boolean;
  /** Whether item is a danger item (red color) */
  danger?: boolean;
  /** Child menu items (for submenu) */
  children?: MenuItem[];
  /** Type of menu item */
  type?: MenuItemType;
  /** Title for group type */
  title?: string;
}

/**
 * Menu select info.
 */
export interface MenuSelectInfo {
  key: string;
  selectedKeys: string[];
  keyPath: string[];
}

/**
 * Menu click info.
 */
export interface MenuClickInfo {
  key: string;
  keyPath: string[];
  domEvent: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>;
}

/**
 * Base Menu component props.
 */
export interface MenuProps extends BaseComponentProps, EngineAwareProps, WithChildren {
  /**
   * Menu items array (alternative to children).
   */
  items?: MenuItem[];

  /**
   * Menu mode.
   * @default 'vertical'
   */
  mode?: MenuMode;

  /**
   * Currently selected keys (controlled).
   */
  selectedKeys?: string[];

  /**
   * Default selected keys (uncontrolled).
   */
  defaultSelectedKeys?: string[];

  /**
   * Currently open submenus (controlled).
   */
  openKeys?: string[];

  /**
   * Default open submenus (uncontrolled).
   */
  defaultOpenKeys?: string[];

  /**
   * Whether to allow multiple selection.
   * @default false
   */
  multiple?: boolean;

  /**
   * Whether items are selectable.
   * @default true
   */
  selectable?: boolean;

  /**
   * Whether inline menu is collapsed.
   * Only works when mode is 'inline'.
   * @default false
   */
  inlineCollapsed?: boolean;

  /**
   * Custom expand icon for submenus.
   */
  expandIcon?: ReactNode;

  /**
   * Callback when menu item is selected.
   */
  onSelect?: (info: MenuSelectInfo) => void;

  /**
   * Callback when menu item is clicked.
   */
  onClick?: (info: MenuClickInfo) => void;

  /**
   * Callback when open submenus change.
   */
  onOpenChange?: (openKeys: string[]) => void;

  /**
   * Inline indent size in pixels.
   * @default 24
   */
  inlineIndent?: number;

  /**
   * Theme variant.
   * @default 'light'
   */
  theme?: 'light' | 'dark';
}

/**
 * Menu.Item component props.
 */
export interface MenuItemProps extends BaseComponentProps, WithChildren {
  /**
   * Unique key for menu item.
   */
  itemKey?: string;

  /**
   * Icon to display before label.
   */
  icon?: ReactNode;

  /**
   * Whether item is disabled.
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether item is a danger item (red color).
   * @default false
   */
  danger?: boolean;

  /**
   * Click handler.
   */
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;

  /**
   * Title attribute.
   */
  title?: string;
}

/**
 * Menu.Group component props.
 */
export interface MenuGroupProps extends BaseComponentProps, WithChildren {
  /**
   * Group title.
   */
  title: ReactNode;
}

/**
 * Menu.SubMenu component props.
 */
export interface MenuSubMenuProps extends BaseComponentProps, WithChildren {
  /**
   * Unique key for submenu.
   */
  itemKey?: string;

  /**
   * SubMenu title/label.
   */
  title: ReactNode;

  /**
   * Icon to display before title.
   */
  icon?: ReactNode;

  /**
   * Whether submenu is disabled.
   * @default false
   */
  disabled?: boolean;

  /**
   * Callback when submenu title is clicked.
   */
  onTitleClick?: (e: React.MouseEvent<HTMLElement>) => void;

  /**
   * Custom expand icon.
   */
  expandIcon?: ReactNode;
}

/**
 * Menu.Divider component props.
 */
export interface MenuDividerProps extends BaseComponentProps {
  /**
   * Whether the divider is dashed.
   * @default false
   */
  dashed?: boolean;
}

/**
 * Default values for Menu.
 */
export const MENU_DEFAULTS = {
  mode: 'vertical' as const,
  selectable: true,
  multiple: false,
  inlineCollapsed: false,
  inlineIndent: 24,
  theme: 'light' as const,
};
