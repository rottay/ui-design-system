/**
 * Dropdown Component Types
 *
 * Unified type definitions for Dropdown component across all engines.
 * Compatible with: titan (AntD), hermes (DaisyUI), apollo (Native HTML + Tailwind)
 */

import type { CSSProperties, ReactNode, ReactElement } from 'react';

/**
 * Menu item definition for dropdown
 */
export interface DropdownMenuItem {
  // Required
  key: string;
  label: ReactNode;

  // Optional
  disabled?: boolean;
  icon?: ReactNode;
  danger?: boolean;
  divider?: boolean;

  // Nested items (submenu)
  children?: DropdownMenuItem[];

  // Click handler
  onClick?: (info: { key: string; keyPath: string[]; domEvent: React.MouseEvent }) => void;

  // Accessibility
  'aria-label'?: string;
}

/**
 * Menu structure for dropdown
 */
export interface DropdownMenu {
  items?: DropdownMenuItem[];
  onClick?: (info: { key: string; keyPath: string[]; domEvent: React.MouseEvent }) => void;
  className?: string;
  style?: CSSProperties;
}

/**
 * Base props that ALL engines must support.
 * These are the core properties available regardless of the rendering engine.
 */
export interface DropdownBaseProps {
  // Content
  children: ReactElement;

  // Menu definition
  menu?: DropdownMenu;

  // Visibility control
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, info?: { source: 'trigger' | 'menu' }) => void;

  // Trigger behavior
  trigger?: ('click' | 'hover' | 'contextMenu')[];

  // Styling
  className?: string;
  style?: CSSProperties;

  // Accessibility
  'aria-label'?: string;
}

/**
 * Extended props with engine-specific features.
 * Not all engines may support all these properties.
 */
export interface DropdownProps extends DropdownBaseProps {
  // Placement options
  placement?:
    | 'top'
    | 'topLeft'
    | 'topRight'
    | 'bottom'
    | 'bottomLeft'
    | 'bottomRight'
    | 'left'
    | 'leftTop'
    | 'leftBottom'
    | 'right'
    | 'rightTop'
    | 'rightBottom';

  // Overlay customization
  overlayClassName?: string;
  overlayStyle?: CSSProperties;

  // Dropdown interaction
  disabled?: boolean;
  destroyPopupOnHide?: boolean;

  // Arrow display
  arrow?: boolean | { pointAtCenter: boolean };

  // Z-index
  zIndex?: number;

  // Align configuration for precise positioning
  align?: {
    offset?: [number, number];
  };

  // Auto adjust position when overflow
  autoAdjustOverflow?: boolean;

  // Get popup container
  getPopupContainer?: (triggerNode: HTMLElement) => HTMLElement;

  // Mouse events
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;

  // Custom dropdown render (for advanced use cases)
  dropdownRender?: (menu: ReactNode) => ReactNode;

  // Loading state
  loading?: boolean;

  // Danger mode (for destructive actions)
  danger?: boolean;
}

/**
 * Dropdown button variant props
 */
export interface DropdownButtonProps extends Omit<DropdownProps, 'children'> {
  // Button props
  type?: 'default' | 'primary' | 'dashed' | 'text' | 'link';
  size?: 'small' | 'middle' | 'large';
  icon?: ReactNode;
  loading?: boolean;
  danger?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;

  // Button content
  children?: ReactNode;

  // Split button with additional click handler
  buttonsRender?: (buttons: ReactNode[]) => ReactNode[];
}

/**
 * Type guard to check if dropdown is controlled
 */
export function isControlledDropdown(props: DropdownProps): boolean {
  return props.open !== undefined;
}

/**
 * Type guard to check if dropdown is uncontrolled
 */
export function isUncontrolledDropdown(props: DropdownProps): boolean {
  return props.open === undefined && props.defaultOpen !== undefined;
}
