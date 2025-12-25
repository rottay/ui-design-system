/**
 * Badge - Engine Router
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { BadgeProps } from './types';

export { type BadgeProps, type BadgeVariant, type BadgeSize, BADGE_DEFAULTS } from './types';


// Export base component
export { BaseBadge } from './base';

export const Badge = createEngineComponent<BadgeProps>('Badge', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});
