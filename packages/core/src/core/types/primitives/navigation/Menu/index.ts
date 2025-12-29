import type { ReactNode, MouseEvent } from 'react';
import type { BaseComponentProps, WithChildren } from '../../../common';
import type { EngineAwareProps } from '../../../engine';

/**
 * Modo del Menu.
 */
export type MenuMode = 'horizontal' | 'vertical' | 'inline';

/**
 * Tema del Menu.
 */
export type MenuTheme = 'light' | 'dark';

/**
 * Item del Menu.
 */
export interface MenuItem {
  /** Key única del item */
  key: string;
  /** Label del item */
  label: ReactNode;
  /** Icono del item */
  icon?: ReactNode;
  /** Si el item está deshabilitado */
  disabled?: boolean;
  /** Si el item está peligroso/destructivo */
  danger?: boolean;
  /** Hijos del item (submenu) */
  children?: MenuItem[];
  /** URL si el item es un link */
  href?: string;
  /** Target si el item es un link */
  target?: '_blank' | '_self' | '_parent' | '_top';
  /** Metadata adicional */
  meta?: Record<string, any>;
}

/**
 * Props del componente Menu.
 */
export interface MenuProps extends BaseComponentProps, EngineAwareProps {
  /**
   * Modo del menu.
   * @default 'vertical'
   */
  mode?: MenuMode;

  /**
   * Tema del menu.
   * @default 'light'
   */
  theme?: MenuTheme;

  /**
   * Items del menu.
   */
  items?: MenuItem[];

  /**
   * Keys de items seleccionados.
   */
  selectedKeys?: string[];

  /**
   * Keys de items seleccionados por defecto.
   */
  defaultSelectedKeys?: string[];

  /**
   * Keys de submenus abiertos.
   */
  openKeys?: string[];

  /**
   * Keys de submenus abiertos por defecto.
   */
  defaultOpenKeys?: string[];

  /**
   * Callback cuando se selecciona un item.
   */
  onSelect?: (item: MenuItem, key: string) => void;

  /**
   * Callback cuando cambian los items seleccionados.
   */
  onSelectionChange?: (keys: string[]) => void;

  /**
   * Callback cuando cambian los submenus abiertos.
   */
  onOpenChange?: (openKeys: string[]) => void;

  /**
   * Si permitir múltiple selección.
   */
  multiple?: boolean;

  /**
   * Si el menu puede colapsar (inline mode).
   */
  collapsible?: boolean;

  /**
   * Si el menu está colapsado.
   */
  collapsed?: boolean;

  /**
   * Callback cuando cambia el estado collapsed.
   */
  onCollapsedChange?: (collapsed: boolean) => void;

  /**
   * Ancho del menu cuando está colapsado.
   * @default 80
   */
  collapsedWidth?: number;

  /**
   * Si mostrar tooltips cuando está colapsado.
   * @default true
   */
  showTooltipsWhenCollapsed?: boolean;

  /**
   * Si el menu tiene borde.
   */
  bordered?: boolean;

  /**
   * Contenido del menu (MenuItems como children).
   */
  children?: ReactNode;
}

/**
 * Props del componente Menu.Item.
 */
export interface MenuItemProps extends BaseComponentProps, WithChildren {
  /**
   * Key única del item.
   */
  key: string;

  /**
   * Icono del item.
   */
  icon?: ReactNode;

  /**
   * Si el item está deshabilitado.
   */
  disabled?: boolean;

  /**
   * Si el item está peligroso/destructivo.
   */
  danger?: boolean;

  /**
   * Callback cuando se hace click en el item.
   */
  onClick?: (event: MouseEvent<HTMLElement>) => void;

  /**
   * URL si el item es un link.
   */
  href?: string;

  /**
   * Target si el item es un link.
   */
  target?: '_blank' | '_self' | '_parent' | '_top';
}

/**
 * Props del componente Menu.SubMenu.
 */
export interface MenuSubMenuProps extends BaseComponentProps, WithChildren {
  /**
   * Key única del submenu.
   */
  key: string;

  /**
   * Título del submenu.
   */
  title: ReactNode;

  /**
   * Icono del submenu.
   */
  icon?: ReactNode;

  /**
   * Si el submenu está deshabilitado.
   */
  disabled?: boolean;

  /**
   * Callback cuando se abre/cierra el submenu.
   */
  onTitleClick?: (event: MouseEvent<HTMLElement>) => void;
}

/**
 * Props del componente Menu.ItemGroup.
 */
export interface MenuItemGroupProps extends BaseComponentProps, WithChildren {
  /**
   * Título del grupo.
   */
  title?: ReactNode;
}

/**
 * Props del componente Menu.Divider.
 */
export interface MenuDividerProps extends BaseComponentProps {
  /**
   * Si el divider es dashed.
   */
  dashed?: boolean;
}

/**
 * Estado del Menu.
 */
export interface MenuState {
  /** Keys seleccionados */
  selectedKeys: string[];
  /** Keys de submenus abiertos */
  openKeys: string[];
  /** Si está colapsado */
  collapsed: boolean;
}
