/**
 * @fileoverview Tooltip Compound Components - Rottay Design System
 * @description Barrel export for Tooltip compound components.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This module exports compound components for advanced Tooltip composition.
 * These components enable the compound component pattern for flexible tooltip creation.
 *
 * **Available Components:**
 * - `TooltipTrigger` - Wraps the element that triggers tooltip display
 * - `TooltipContent` - Renders content within the tooltip popup
 *
 * **Usage Pattern:**
 * Compound components allow for more control over tooltip structure and behavior,
 * enabling complex tooltip implementations with custom trigger and content arrangements.
 *
 * @example Compound Pattern
 * ```tsx
 * import { Tooltip } from '@rottay/design-system';
 *
 * <Tooltip>
 *   <Tooltip.Trigger asChild>
 *     <Button>Hover me</Button>
 *   </Tooltip.Trigger>
 *   <Tooltip.Content arrow side="bottom">
 *     <p>Custom tooltip content</p>
 *   </Tooltip.Content>
 * </Tooltip>
 * ```
 *
 * @see {@link Tooltip} for the main component
 * @see {@link TooltipTrigger} for trigger component
 * @see {@link TooltipContent} for content component
 * @module Tooltip/compound
 * @category Display
 * @package @rottay/design-system
 */

export { TooltipTrigger } from './Trigger';
export { TooltipContent } from './Content';

export type { TooltipTriggerProps, TooltipContentProps } from '../types';
