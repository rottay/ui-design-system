import type { BaseComponentProps } from '../../../../../types/common';
import type { EngineAwareProps } from '../../../../../types/engine';

/**
 * Tooltip placement options.
 */
export type TooltipPlacement =
  | 'top' | 'top-start' | 'top-end'
  | 'bottom' | 'bottom-start' | 'bottom-end'
  | 'left' | 'left-start' | 'left-end'
  | 'right' | 'right-start' | 'right-end';

/**
 * Tooltip trigger types.
 */
export type TooltipTrigger = 'hover' | 'click' | 'focus';

/**
 * Props for the Tooltip component.
 */
export interface TooltipProps extends BaseComponentProps, EngineAwareProps {
  /** Tooltip content */
  content: React.ReactNode;
  /** Trigger element */
  children: React.ReactElement;
  /** Tooltip placement */
  placement?: TooltipPlacement;
  /** Trigger type */
  trigger?: TooltipTrigger | TooltipTrigger[];
  /** Show arrow */
  arrow?: boolean;
  /** Open delay in ms */
  openDelay?: number;
  /** Close delay in ms */
  closeDelay?: number;
  /** Controlled open state */
  open?: boolean;
  /** Default open state */
  defaultOpen?: boolean;
  /** Open change callback */
  onOpenChange?: (open: boolean) => void;
  /** Disabled state */
  disabled?: boolean;
  /** Max width */
  maxWidth?: number | string;
}

/**
 * Props for the Tooltip.Trigger component.
 */
export interface TooltipTriggerProps extends BaseComponentProps {
  /** Trigger element */
  children: React.ReactElement;
  /** Render as child element */
  asChild?: boolean;
}

/**
 * Props for the Tooltip.Content component.
 */
export interface TooltipContentProps extends BaseComponentProps {
  /** Content to display */
  children: React.ReactNode;
  /** Show arrow */
  arrow?: boolean;
}
