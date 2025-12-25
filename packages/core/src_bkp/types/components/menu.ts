/**
 * Menu Component Types
 *
 * Unified type definitions for Menu component across all engines.
 * Compatible with: titan (AntD), hermes (DaisyUI), apollo (Native HTML + Tailwind)
 */

import type { CSSProperties, ReactNode, Key } from 'react';

/**
 * Individual menu item definition
 */
export interface MenuItem {
  // Required
  key: string;
  label: ReactNode;

  // Optional
  children?: MenuItem[];
  disabled?: boolean;
  icon?: ReactNode;
  danger?: boolean;
  title?: string;
  type?: 'group' | 'divider';

  // Accessibility
  'aria-label'?: string;
}

/**
 * Info object for click/select callbacks
 */
export interface MenuInfo {
  key: string;
  keyPath: string[];
  item: MenuItem;
  domEvent: React.MouseEvent | React.KeyboardEvent;
}

/**
 * Base props that ALL engines must support.
 * These are the core properties available regardless of the rendering engine.
 */
export interface MenuBaseProps {
  // Menu items (primary way to define menu structure)
  items?: MenuItem[];

  // Selection control
  selectedKeys?: string[];
  defaultSelectedKeys?: string[];
  onSelect?: (info: MenuInfo) => void;
  onClick?: (info: MenuInfo) => void;

  // Styling
  className?: string;
  style?: CSSProperties;

  // Accessibility
  id?: string;
  'aria-label'?: string;
}

/**
 * Extended props with engine-specific features.
 * Not all engines may support all these properties.
 */
export interface MenuProps extends MenuBaseProps {
  // Menu display mode
  mode?: 'vertical' | 'horizontal' | 'inline';

  // Theme (titan primary support)
  theme?: 'light' | 'dark';

  // Open/close control for submenus
  openKeys?: string[];
  defaultOpenKeys?: string[];
  onOpenChange?: (openKeys: string[]) => void;

  // Selection options
  selectable?: boolean;
  multiple?: boolean;

  // Inline mode options
  inlineCollapsed?: boolean;
  inlineIndent?: number;

  // Trigger for submenu (titan)
  triggerSubMenuAction?: 'hover' | 'click';

  // Expandable icon customization
  expandIcon?: ReactNode | ((props: { isOpen: boolean }) => ReactNode);

  // Additional handlers
  onDeselect?: (info: MenuInfo) => void;

  // Keyboard navigation
  keyboard?: boolean;
}

/**
 * Type guard to check if menu has controlled selection
 */
export function isControlledMenu(props: MenuProps): boolean {
  return props.selectedKeys !== undefined;
}

/**
 * Type guard to check if menu has controlled open state
 */
export function isControlledOpenKeys(props: MenuProps): boolean {
  return props.openKeys !== undefined;
}
