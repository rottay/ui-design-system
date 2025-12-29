import type { ReactNode } from 'react';
import type { BaseComponentProps, WithChildren } from '../../../common';
import type { EngineAwareProps } from '../../../engine';

/**
 * Tooltip placement.
 */
export type TooltipPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end';

/**
 * Tooltip trigger.
 */
export type TooltipTrigger = 'hover' | 'click' | 'focus' | 'manual';

/**
 * Tooltip component props.
 */
export interface TooltipProps extends BaseComponentProps, EngineAwareProps, WithChildren {
  /**
   * Tooltip content.
   */
  content: ReactNode;

  /**
   * Tooltip placement.
   * @default 'top'
   */
  placement?: TooltipPlacement;

  /**
   * Trigger that opens the tooltip.
   * @default 'hover'
   */
  trigger?: TooltipTrigger | TooltipTrigger[];

  /**
   * Whether the tooltip is visible (controlled mode).
   */
  visible?: boolean;

  /**
   * Whether the tooltip is visible by default (uncontrolled mode).
   */
  defaultVisible?: boolean;

  /**
   * Visibility change callback.
   */
  onVisibleChange?: (visible: boolean) => void;

  /**
   * Delay in ms before showing the tooltip.
   * @default 0
   */
  showDelay?: number;

  /**
   * Delay in ms before hiding the tooltip.
   * @default 0
   */
  hideDelay?: number;

  /**
   * Tooltip color.
   * @default 'default'
   */
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';

  /**
   * Whether to show the tooltip arrow.
   * @default true
   */
  arrow?: boolean;

  /**
   * Tooltip border radius.
   * @default 'md'
   */
  radius?: 'none' | 'sm' | 'md' | 'lg';

  /**
   * Offset from the trigger element.
   * @default 8
   */
  offset?: number;

  /**
   * Whether the tooltip is disabled.
   */
  disabled?: boolean;

  /**
   * Tooltip z-index.
   */
  zIndex?: number;

  /**
   * Tooltip trigger element.
   */
  children: ReactNode;

  /**
   * Whether to allow interaction with tooltip content.
   * @default false
   */
  interactive?: boolean;
}

/**
 * Tooltip state.
 */
export interface TooltipState {
  /** Whether visible */
  visible: boolean;
  /** Calculated position */
  position?: { x: number; y: number };
  /** Whether hovering */
  hovering: boolean;
}
