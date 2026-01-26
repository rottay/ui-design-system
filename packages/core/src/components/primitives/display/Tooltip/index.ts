'use client';

/**
 * @fileoverview Tooltip - Rottay Design System
 * @description Contextual information overlay triggered by user interaction.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * **Multi-Engine Architecture:**
 * - **Titan**: Ant Design Tooltip with collision detection
 * - **Hermes**: DaisyUI tooltip classes with Tailwind utilities
 * - **Apollo**: Pure CSS implementation with zero dependencies
 *
 * **Key Features:**
 * - 12 placement positions (top, bottom, left, right with start/end variants)
 * - Multiple trigger types (hover, click, focus, manual)
 * - Controlled and uncontrolled visibility modes
 * - Configurable show/hide delays
 * - Arrow indicator support
 * - Color variants (default, primary, secondary, success, warning, error)
 * - Interactive mode for hoverable content
 * - Full ARIA accessibility
 *
 * **Compound Components:**
 * - `Tooltip.Trigger` - Element that triggers tooltip display
 * - `Tooltip.Content` - Content displayed within the tooltip
 *
 * **CSS Custom Properties:**
 * - `--tooltip-bg` - Background color
 * - `--tooltip-color` - Text color
 * - `--tooltip-radius` - Border radius
 * - `--tooltip-padding` - Content padding
 * - `--tooltip-shadow` - Box shadow
 * - `--tooltip-arrow-size` - Arrow dimensions
 *
 * @example Basic Usage
 * ```tsx
 * import { Tooltip } from '@rottay/design-system';
 *
 * <Tooltip content="Helpful information">
 *   <Button>Hover me</Button>
 * </Tooltip>
 * ```
 *
 * @example With Placement and Color
 * ```tsx
 * <Tooltip content="Success tip" placement="bottom" color="success">
 *   <IconButton>?</IconButton>
 * </Tooltip>
 * ```
 *
 * @example Controlled Visibility
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false);
 *
 * <Tooltip
 *   content="Controlled tooltip"
 *   visible={isOpen}
 *   onVisibleChange={setIsOpen}
 *   trigger="click"
 * >
 *   <Button>Click me</Button>
 * </Tooltip>
 * ```
 *
 * @example Engine Override
 * ```tsx
 * <Tooltip engine="hermes" content="DaisyUI styled tooltip">
 *   <span>Hover for info</span>
 * </Tooltip>
 * ```
 *
 * @see {@link TooltipProps} for available props
 * @see {@link BaseTooltip} for CSS variable implementation
 * @module Tooltip
 * @category Display
 * @package @rottay/design-system
 */

import { createEngineComponent } from '../../../../core/engines/factory';
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
