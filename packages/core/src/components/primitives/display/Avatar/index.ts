/**
 * Avatar - Engine Router
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { AvatarProps } from './types';
import { AvatarGroup, AvatarBadge, AvatarFallback } from './compound';

// Export types
export type { AvatarProps, AvatarSize, AvatarShape } from './types';
export { AVATAR_DEFAULTS } from './types';

// Export compound components
export { AvatarGroup, AvatarBadge, AvatarFallback };
export type { AvatarGroupProps, AvatarBadgeProps, BadgeStatus, AvatarFallbackProps } from './compound';

// Export base component
export { BaseAvatar } from './base';

// Create engine-aware Avatar component
export const Avatar = Object.assign(
  createEngineComponent<AvatarProps>('Avatar', {
    titan: () => import('./engines/titan'),
    hermes: () => import('./engines/hermes'),
    apollo: () => import('./engines/apollo'),
  }),
  {
    Group: AvatarGroup,
    Badge: AvatarBadge,
    Fallback: AvatarFallback,
  }
);
