/**
 * Tooltip - Compound Components
 * Re-exports all compound components for the Tooltip.
 *
 * @module Tooltip/compound
 * @description Barrel export for Tooltip compound components.
 * These components are used with the compound component pattern (Tooltip.Trigger, Tooltip.Content).
 */

export { TooltipTrigger } from './Trigger';
export { TooltipContent } from './Content';

export type { TooltipTriggerProps, TooltipContentProps } from '../types';
