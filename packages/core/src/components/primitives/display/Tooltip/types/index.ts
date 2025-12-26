/**
 * Tooltip - Core Interface
 * Re-exports from centralized types for consistent type definitions
 *
 * @module Tooltip/types
 * @description Type definitions for the Tooltip component and its compound components.
 * These types are re-exported from the centralized types directory to maintain
 * a single source of truth for type definitions across the design system.
 */

export type {
  TooltipProps,
  TooltipPlacement,
  TooltipTrigger,
  TooltipState,
} from '../../../../../types/primitives/display/Tooltip';

import type { BaseComponentProps } from '../../../../../types/common';

/**
 * Props for the Tooltip.Trigger compound component.
 * Used to wrap the element that triggers the tooltip.
 */
export interface TooltipTriggerProps extends BaseComponentProps {
  /**
   * The trigger element that activates the tooltip.
   * Must be a valid React element.
   */
  children: React.ReactElement;

  /**
   * When true, clones props to the child element instead of wrapping.
   * Useful for preserving the original element type.
   * @default false
   */
  asChild?: boolean;
}

/**
 * Props for the Tooltip.Content compound component.
 * Used to define the content displayed within the tooltip.
 */
export interface TooltipContentProps extends BaseComponentProps {
  /**
   * The content to display inside the tooltip.
   * Can be any valid React node.
   */
  children: React.ReactNode;

  /**
   * Whether to show the tooltip arrow.
   * @default true
   */
  arrow?: boolean;

  /**
   * Side of the tooltip where the arrow appears.
   * @default 'top'
   */
  side?: 'top' | 'bottom' | 'left' | 'right';
}

/**
 * Default values for Tooltip component props.
 * Used across all engine implementations for consistent defaults.
 */
export const TOOLTIP_DEFAULTS = {
  /** Default placement position */
  placement: 'top' as const,
  /** Default trigger type */
  trigger: 'hover' as const,
  /** Whether to show arrow by default */
  arrow: true,
  /** Default delay before showing tooltip (ms) */
  showDelay: 200,
  /** Default delay before hiding tooltip (ms) */
  hideDelay: 0,
  /** Default tooltip color */
  color: 'default' as const,
  /** Default border radius */
  radius: 'md' as const,
  /** Default offset from trigger element (px) */
  offset: 8,
  /** Default max width (px) */
  maxWidth: 300,
  /** Default disabled state */
  disabled: false,
  /** Default interactive state */
  interactive: false,
};

/**
 * Placement to CSS position mapping.
 * Maps tooltip placements to their CSS positioning values.
 */
export const PLACEMENT_MAP: Record<string, React.CSSProperties> = {
  top: { bottom: '100%', left: '50%', transform: 'translateX(-50%)' },
  'top-start': { bottom: '100%', left: '0' },
  'top-end': { bottom: '100%', right: '0' },
  bottom: { top: '100%', left: '50%', transform: 'translateX(-50%)' },
  'bottom-start': { top: '100%', left: '0' },
  'bottom-end': { top: '100%', right: '0' },
  left: { right: '100%', top: '50%', transform: 'translateY(-50%)' },
  'left-start': { right: '100%', top: '0' },
  'left-end': { right: '100%', bottom: '0' },
  right: { left: '100%', top: '50%', transform: 'translateY(-50%)' },
  'right-start': { left: '100%', top: '0' },
  'right-end': { left: '100%', bottom: '0' },
};
