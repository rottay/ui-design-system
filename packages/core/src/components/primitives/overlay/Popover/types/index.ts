/**
 * Popover Component Types
 *
 * Type definitions for the Popover component including trigger types,
 * placement options, and component props.
 *
 * @module PopoverTypes
 */
import type { ReactNode, CSSProperties } from 'react';

/**
 * Trigger methods for opening the popover.
 * - 'click': Opens on click
 * - 'hover': Opens on mouse hover
 * - 'focus': Opens when element receives focus
 */
export type PopoverTrigger = 'click' | 'hover' | 'focus';

/**
 * Placement options for the popover.
 * Supports 12 positions around the trigger element.
 */
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

/**
 * Props for the Popover component.
 * A floating panel for displaying rich content on user interaction.
 *
 * @example
 * ```tsx
 * <Popover
 *   content={<div>Rich content here</div>}
 *   title="Popover Title"
 *   trigger="click"
 *   placement="bottom"
 * >
 *   <Button>Open Popover</Button>
 * </Popover>
 * ```
 */
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

/**
 * Default values for Popover component props.
 * These are applied when no explicit value is provided.
 */
export const POPOVER_DEFAULTS: Partial<PopoverProps> = {
  /** Default trigger method */
  trigger: 'hover',
  /** Default placement */
  placement: 'top',
  /** Show arrow by default */
  arrow: true,
  /** Delay before showing on hover (ms) */
  mouseEnterDelay: 100,
  /** Delay before hiding on mouse leave (ms) */
  mouseLeaveDelay: 100,
  /** Keep popover mounted when hidden */
  destroyTooltipOnHide: false,
  /** Default z-index */
  zIndex: 1030,
};
