/**
 * Popconfirm Component Types
 *
 * Unified type definitions for Popconfirm component across all engines.
 * Compatible with: titan (AntD), hermes (DaisyUI), apollo (Native HTML + Tailwind)
 */

import type { CSSProperties, ReactNode, ReactElement } from 'react';
import type { ButtonProps } from './button';

/**
 * Base props that ALL engines must support.
 * These are the core properties available regardless of the rendering engine.
 */
export interface PopconfirmBaseProps {
  // Content
  title: ReactNode;
  description?: ReactNode;
  children: ReactElement;

  // Visibility control
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;

  // Confirmation actions
  onConfirm?: (e?: React.MouseEvent<HTMLElement>) => void | Promise<void>;
  onCancel?: (e?: React.MouseEvent<HTMLElement>) => void;

  // Disabled state
  disabled?: boolean;

  // Styling
  className?: string;
  style?: CSSProperties;
}

/**
 * Extended props with engine-specific features.
 * Not all engines may support all these properties.
 */
export interface PopconfirmProps extends PopconfirmBaseProps {
  // Button text customization
  okText?: ReactNode;
  cancelText?: ReactNode;

  // Button styling
  okType?: ButtonProps['type'];
  okButtonProps?: Partial<ButtonProps>;
  cancelButtonProps?: Partial<ButtonProps>;

  // Icon customization
  icon?: ReactNode;
  showCancel?: boolean;

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

  // Trigger behavior
  trigger?: 'click' | 'hover' | 'focus' | 'contextMenu';

  // Overlay customization
  overlayClassName?: string;
  overlayStyle?: CSSProperties;

  // Z-index
  zIndex?: number;

  // Accessibility
  'aria-label'?: string;
}

/**
 * Type guard to check if popconfirm is controlled
 */
export function isControlledPopconfirm(props: PopconfirmProps): boolean {
  return props.open !== undefined;
}

/**
 * Type guard to check if popconfirm is uncontrolled
 */
export function isUncontrolledPopconfirm(props: PopconfirmProps): boolean {
  return props.open === undefined && props.defaultOpen !== undefined;
}
