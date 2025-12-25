/**
 * Tooltip Component Types
 *
 * Unified type definitions for Tooltip component across all engines.
 * Compatible with: titan (AntD), hermes (DaisyUI), apollo (Native HTML + Tailwind)
 */

import type { CSSProperties, ReactNode, ReactElement } from 'react';

/**
 * Base props that ALL engines must support.
 * These are the core properties available regardless of the rendering engine.
 */
export interface TooltipBaseProps {
  // Content
  title?: ReactNode;
  children: ReactElement;

  // Visibility control
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;

  // Trigger behavior
  trigger?: 'hover' | 'focus' | 'click' | 'contextMenu';

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
export interface TooltipProps extends TooltipBaseProps {
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

  // Color variants (titan primary support)
  color?:
    | string
    | 'pink'
    | 'red'
    | 'yellow'
    | 'orange'
    | 'cyan'
    | 'green'
    | 'blue'
    | 'purple'
    | 'geekblue'
    | 'magenta'
    | 'volcano'
    | 'gold'
    | 'lime';

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

  // Destroy tooltip on hide
  destroyTooltipOnHide?: boolean;

  // Get popup container
  getPopupContainer?: (triggerNode: HTMLElement) => HTMLElement;

  // Fresh content on every open (for dynamic content)
  fresh?: boolean;

  // Mouse events
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;

  // Custom popup visible state
  afterOpenChange?: (open: boolean) => void;
}

/**
 * Type guard to check if tooltip is controlled
 */
export function isControlledTooltip(props: TooltipProps): boolean {
  return props.open !== undefined;
}

/**
 * Type guard to check if tooltip is uncontrolled
 */
export function isUncontrolledTooltip(props: TooltipProps): boolean {
  return props.open === undefined && props.defaultOpen !== undefined;
}

/**
 * Helper to determine if tooltip should show
 */
export function shouldShowTooltip(props: TooltipProps): boolean {
  return !!(props.title || props.children);
}
