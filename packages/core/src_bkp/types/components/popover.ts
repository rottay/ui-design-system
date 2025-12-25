/**
 * Popover Component Types
 *
 * Unified type definitions for Popover component across all engines.
 * Compatible with: titan (AntD), hermes (DaisyUI), apollo (Native HTML + Tailwind)
 */

import type { CSSProperties, ReactNode, ReactElement } from 'react';

/**
 * Base props that ALL engines must support.
 * These are the core properties available regardless of the rendering engine.
 */
export interface PopoverBaseProps {
  // Content
  title?: ReactNode;
  content?: ReactNode;
  children: ReactElement;

  // Visibility control
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;

  // Trigger behavior
  trigger?: 'hover' | 'focus' | 'click';

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
export interface PopoverProps extends PopoverBaseProps {
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
  overlayInnerStyle?: CSSProperties;

  // Arrow display
  arrow?: boolean | { pointAtCenter: boolean };

  // Z-index
  zIndex?: number;

  // Show/hide timing (in milliseconds)
  mouseEnterDelay?: number;
  mouseLeaveDelay?: number;

  // Align configuration for precise positioning
  align?: {
    offset?: [number, number];
  };

  // Auto adjust position when overflow
  autoAdjustOverflow?: boolean;

  // Destroy popover on hide
  destroyTooltipOnHide?: boolean;

  // Get popup container
  getPopupContainer?: (triggerNode: HTMLElement) => HTMLElement;

  // Fresh content on every open (for dynamic content)
  fresh?: boolean;

  // Custom popup visible state
  afterOpenChange?: (open: boolean) => void;
}

/**
 * Type guard to check if popover is controlled
 */
export function isControlledPopover(props: PopoverProps): boolean {
  return props.open !== undefined;
}

/**
 * Type guard to check if popover is uncontrolled
 */
export function isUncontrolledPopover(props: PopoverProps): boolean {
  return props.open === undefined && props.defaultOpen !== undefined;
}

/**
 * Helper to determine if popover should show
 */
export function shouldShowPopover(props: PopoverProps): boolean {
  return !!(props.content || props.title);
}
