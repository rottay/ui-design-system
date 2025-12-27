/**
 * Avatar Component
 *
 * A versatile avatar component for displaying user profile images, initials,
 * or fallback icons. Supports multiple sizes, shapes, variants, and status indicators.
 * Includes compound components for grouping, badges, and fallback content.
 *
 * @component
 * @example
 * ```tsx
 * // Basic avatar with image
 * <Avatar src="/user.jpg" alt="John Doe" />
 *
 * // Avatar with initials fallback
 * <Avatar name="John Doe" />
 *
 * // Avatar with status indicator
 * <Avatar src="/user.jpg" status="online" />
 *
 * // Avatar group
 * <Avatar.Group max={3}>
 *   <Avatar src="/user1.jpg" />
 *   <Avatar src="/user2.jpg" />
 *   <Avatar name="JD" />
 * </Avatar.Group>
 *
 * // Avatar with badge
 * <Avatar src="/user.jpg">
 *   <Avatar.Badge content={5} />
 * </Avatar>
 * ```
 *
 * @see {@link AvatarProps} for available props
 * @see {@link AvatarGroupProps} for group configuration
 * @see {@link AvatarBadgeProps} for badge configuration
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { AvatarProps } from './types';
import { AvatarGroup, AvatarBadge, AvatarFallback } from './compound';

// Export types
export type { AvatarProps, AvatarSize, AvatarShape, AvatarStatus, AvatarVariant } from './types';
export { AVATAR_DEFAULTS } from './types';

// Export compound components
export { AvatarGroup, AvatarBadge, AvatarFallback };
export type { AvatarGroupProps, AvatarBadgeProps, BadgeStatus, AvatarFallbackProps } from './compound';

// Export base component
export { BaseAvatar } from './base';

/**
 * Avatar component with multi-engine support.
 * Displays user profile images with fallback to initials or icons.
 *
 * @param props - Avatar configuration props
 * @param props.src - Image URL for the avatar
 * @param props.alt - Alternative text for accessibility
 * @param props.name - User name (used to generate initials)
 * @param props.size - Avatar size ('xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl')
 * @param props.shape - Avatar shape ('circle' | 'square' | 'rounded')
 * @param props.variant - Color variant for initials background
 * @param props.status - User presence status indicator
 * @param props.ring - Whether to show a ring around the avatar
 * @returns The rendered Avatar component
 */
export const Avatar = Object.assign(
  createEngineComponent<AvatarProps>('Avatar', {
    titan: () => import('./engines/titan'),
    hermes: () => import('./engines/hermes'),
    apollo: () => import('./engines/apollo'),
  }),
  {
    /** Compound component for displaying multiple avatars in a stack */
    Group: AvatarGroup,
    /** Compound component for displaying a badge on the avatar */
    Badge: AvatarBadge,
    /** Compound component for custom fallback content */
    Fallback: AvatarFallback,
  }
);
