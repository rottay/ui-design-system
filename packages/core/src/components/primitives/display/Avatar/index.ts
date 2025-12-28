/**
 * @fileoverview Avatar - Rottay Design System
 * @description User profile display with image, initials, and status indicators.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * The Avatar component displays user profile images with automatic fallback
 * to initials or custom content. It supports status indicators, grouping,
 * and badge overlays for notifications.
 *
 * **Multi-Engine Architecture:**
 * - **Titan**: Wraps Ant Design Avatar with Badge for status
 * - **Hermes**: DaisyUI avatar classes with mask shapes
 * - **Apollo**: Pure CSS implementation with inline styling
 *
 * **Key Features:**
 * - Image with automatic error fallback to initials
 * - Multiple sizes (xs, sm, md, lg, xl, 2xl, 3xl)
 * - Shape variants (circle, square, rounded)
 * - Color variants (default, primary, secondary, success, warning, error, gradient)
 * - Status indicators (online, offline, away, busy)
 * - Ring outline with custom color
 * - Avatar grouping with max limit and overlap
 * - Badge overlay for notifications
 *
 * **Compound Components:**
 * - `Avatar.Group` - Display multiple avatars in a stack
 * - `Avatar.Badge` - Notification badge overlay
 * - `Avatar.Fallback` - Custom fallback content
 *
 * **CSS Custom Properties:**
 * - `--avatar-{size}-size` - Avatar dimensions
 * - `--avatar-{size}-font-size` - Initials font size
 * - `--avatar-{variant}-bg` - Background color
 * - `--avatar-{variant}-color` - Text color
 * - `--avatar-status-{status}-color` - Status indicator color
 *
 * @example Basic Avatar
 * ```tsx
 * import { Avatar } from '@rottay/design-system';
 *
 * <Avatar src="/user.jpg" alt="John Doe" />
 * ```
 *
 * @example Initials Fallback
 * ```tsx
 * <Avatar name="John Doe" size="lg" variant="primary" />
 * ```
 *
 * @example With Status Indicator
 * ```tsx
 * <Avatar src="/user.jpg" status="online" ring />
 * ```
 *
 * @example Avatar Group
 * ```tsx
 * <Avatar.Group max={3}>
 *   <Avatar src="/user1.jpg" />
 *   <Avatar src="/user2.jpg" />
 *   <Avatar name="JD" />
 *   <Avatar name="AB" />
 * </Avatar.Group>
 * ```
 *
 * @example With Badge
 * ```tsx
 * <Avatar src="/user.jpg">
 *   <Avatar.Badge content={5} />
 * </Avatar>
 * ```
 *
 * @see {@link AvatarProps} for available props
 * @see {@link AvatarGroupProps} for group configuration
 * @see {@link Badge} for notification badges
 * @module Avatar
 * @category Display
 * @package @rottay/design-system
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
