/**
 * @fileoverview Badge Component - Engine Router
 * @description Main entry point for the Badge component. This module creates an
 * engine-aware Badge component that automatically selects the appropriate
 * rendering implementation based on the current engine context.
 *
 * The Badge component displays counts, status indicators, or labels that can be
 * positioned over other elements or used standalone.
 *
 * @module components/primitives/display/Badge
 *
 * @example
 * // Basic usage with count
 * import { Badge } from '@es-rottay/designsystem-core';
 *
 * <Badge count={5} variant="primary">
 *   <Avatar src="/user.jpg" />
 * </Badge>
 *
 * @example
 * // Standalone badge
 * <Badge content="New" variant="success" />
 *
 * @example
 * // Dot indicator with animation
 * <Badge dot pulse variant="error">
 *   <NotificationIcon />
 * </Badge>
 *
 * @example
 * // Using specific engine
 * <Badge engine="hermes" count={10}>
 *   <MailIcon />
 * </Badge>
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { BadgeProps } from './types';

// Export types
export type {
  BadgeProps,
  BadgeVariant,
  BadgeSize,
  BadgeStyle,
  BadgeStatus,
  BadgeRibbonProps,
  BadgeCountProps,
} from './types';

// Export default values and configuration maps
export {
  BADGE_DEFAULTS,
  VARIANT_COLOR_MAP,
  SIZE_MAP,
  DOT_SIZE_MAP,
  STATUS_COLOR_MAP,
} from './types';

// Export base component for direct access
export { BaseBadge } from './base';

/**
 * Badge component with automatic engine selection.
 *
 * This component uses the design system's engine factory to dynamically
 * load the appropriate implementation based on the current engine context
 * (Titan/Ant Design, Hermes/DaisyUI, or Apollo/Pure CSS).
 *
 * @component
 * @see {@link BadgeProps} for available props
 */
export const Badge = createEngineComponent<BadgeProps>('Badge', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});
