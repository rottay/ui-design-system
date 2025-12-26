/**
 * Popover Types
 */
import type { ReactNode, CSSProperties } from 'react';

export type PopoverTrigger = 'click' | 'hover' | 'focus';
export type PopoverPlacement =
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

export interface PopoverProps {
  /** Content of the popover */
  content: ReactNode;
  /** Title of the popover */
  title?: ReactNode;
  /** Trigger method */
  trigger?: PopoverTrigger | PopoverTrigger[];
  /** Placement of the popover */
  placement?: PopoverPlacement;
  /** Whether the popover is open (controlled) */
  open?: boolean;
  /** Default open state */
  defaultOpen?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Whether to show arrow */
  arrow?: boolean | { pointAtCenter: boolean };
  /** The trigger element */
  children: ReactNode;
  /** Mouse enter delay in ms */
  mouseEnterDelay?: number;
  /** Mouse leave delay in ms */
  mouseLeaveDelay?: number;
  /** Destroy tooltip when hidden */
  destroyTooltipOnHide?: boolean;
  /** Additional class name */
  className?: string;
  /** Additional styles */
  style?: CSSProperties;
  /** Overlay class name */
  overlayClassName?: string;
  /** Overlay styles */
  overlayStyle?: CSSProperties;
  /** z-index */
  zIndex?: number;
}

export const POPOVER_DEFAULTS: Partial<PopoverProps> = {
  trigger: 'hover',
  placement: 'top',
  arrow: true,
  mouseEnterDelay: 100,
  mouseLeaveDelay: 100,
  destroyTooltipOnHide: false,
  zIndex: 1030,
};
