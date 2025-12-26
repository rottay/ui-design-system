/**
 * Badge - Engine Router
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { BadgeProps } from './types';

// Export types
export type { BadgeProps, BadgeVariant, BadgeSize, BadgeStyle, BadgeStatus, BadgeRibbonProps, BadgeCountProps } from './types';
export { BADGE_DEFAULTS, VARIANT_COLOR_MAP, SIZE_MAP, DOT_SIZE_MAP, STATUS_COLOR_MAP } from './types';

// Export base component
export { BaseBadge } from './base';

// Create engine-aware Badge component
export const Badge = createEngineComponent<BadgeProps>('Badge', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});
