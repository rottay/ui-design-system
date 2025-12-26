/**
 * Tooltip - Engine Router
 * Main entry point for the Tooltip component with engine-aware rendering.
 *
 * @module Tooltip
 * @description The Tooltip component provides contextual information when users
 * hover, focus, or click on an element. Supports multiple placement positions,
 * trigger types, and color variants across all three engines (Titan, Hermes, Apollo).
 *
 * @example
 * ```tsx
 * // Basic usage with default engine (Titan)
 * <Tooltip content="Helpful information">
 *   <Button>Hover me</Button>
 * </Tooltip>
 *
 * // With engine override
 * <Tooltip engine="hermes" content="DaisyUI styled tooltip">
 *   <span>Hover for info</span>
 * </Tooltip>
 *
 * // With placement and color
 * <Tooltip content="Success tip" placement="bottom" color="success">
 *   <IconButton>?</IconButton>
 * </Tooltip>
 *
 * // Controlled visibility
 * <Tooltip content="Controlled" visible={isOpen} onVisibleChange={setIsOpen}>
 *   <Button>Click me</Button>
 * </Tooltip>
 * ```
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { TooltipProps } from './types';
import { TooltipTrigger, TooltipContent } from './compound';

// Export types
export type {
  TooltipProps,
  TooltipPlacement,
  TooltipTrigger as TooltipTriggerType,
  TooltipState,
  TooltipTriggerProps,
  TooltipContentProps,
} from './types';
export { TOOLTIP_DEFAULTS, PLACEMENT_MAP } from './types';

// Export compound components
export { TooltipTrigger, TooltipContent };

// Export base component
export { BaseTooltip } from './base';

/**
 * Tooltip component with engine-aware rendering.
 *
 * Automatically selects the appropriate engine implementation based on the
 * `engine` prop or the current EngineProvider context. Supports compound
 * component pattern with Tooltip.Trigger and Tooltip.Content.
 *
 * Available engines:
 * - **titan**: Full-featured Ant Design implementation
 * - **hermes**: Lightweight DaisyUI/Tailwind implementation
 * - **apollo**: Vanilla HTML/CSS headless implementation
 *
 * @see {@link TooltipProps} for available props
 */
export const Tooltip = Object.assign(
  createEngineComponent<TooltipProps>('Tooltip', {
    titan: () => import('./engines/titan'),
    hermes: () => import('./engines/hermes'),
    apollo: () => import('./engines/apollo'),
  }),
  {
    /** Compound component for wrapping trigger elements */
    Trigger: TooltipTrigger,
    /** Compound component for tooltip content */
    Content: TooltipContent,
  }
);
