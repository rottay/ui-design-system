'use client';

/**
 * @fileoverview Tooltip - Contextual overlay triggered by hover, click, or focus.
 * 12 placement positions, controlled/uncontrolled visibility, and color variants.
 * Compound sub-components: Trigger and Content for advanced composition.
 *
 * @example
 * ```tsx
 * import { Tooltip } from '@rottay/design-system';
 *
 * <Tooltip content="Helpful information" placement="bottom">
 *   <Button>Hover me</Button>
 * </Tooltip>
 * ```
 *
 * @module Tooltip
 * @category Display
 */

import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import type { TooltipProps } from './contracts';
import { TooltipTrigger, TooltipContent } from './compound';

export type {
  TooltipProps,
  TooltipPlacement,
  TooltipTrigger as TooltipTriggerType,
  TooltipState,
  TooltipTriggerProps,
  TooltipContentProps,
} from './contracts';
export { TOOLTIP_DEFAULTS, PLACEMENT_MAP } from './contracts';

export { TooltipTrigger, TooltipContent };

/**
 * Tooltip with Trigger and Content compound sub-components.
 * The simple API (`content` prop) covers most cases; the compound pattern
 * is for advanced scenarios where trigger/content need separate wrappers.
 */
export const Tooltip = Object.assign(
  createEngineComponent<TooltipProps>('Tooltip', {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }),
  {
    /** Wraps the element that activates the tooltip on hover/click/focus. */
    Trigger: TooltipTrigger,
    /** Wraps rich content displayed inside the tooltip popup. */
    Content: TooltipContent,
  }
);
