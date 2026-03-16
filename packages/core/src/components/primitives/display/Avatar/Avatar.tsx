'use client';

/**
 * @fileoverview Avatar - User profile display with image, initials, and status indicators.
 * Supports grouping (Avatar.Group), badge overlays (Avatar.Badge), and custom
 * fallback content (Avatar.Fallback). Each engine renders differently: Classic
 * wraps Ant Design, Modern uses DaisyUI masks, Rustic is pure CSS.
 *
 * @example
 * ```tsx
 * import { Avatar } from '@rottay/design-system';
 *
 * <Avatar src="/user.jpg" alt="John Doe" status="online" ring />
 *
 * <Avatar.Group max={3}>
 *   <Avatar src="/user1.jpg" />
 *   <Avatar name="Jane Doe" size="lg" variant="primary" />
 * </Avatar.Group>
 * ```
 *
 * @module Avatar
 * @category Display
 */

import { createEngineComponent } from '../../../../engines/factory';
import type { AvatarProps } from './Avatar.types';
import { AvatarGroup, AvatarBadge, AvatarFallback } from './compound';

export type { AvatarProps, AvatarSize, AvatarShape, AvatarStatus, AvatarVariant } from './Avatar.types';
export { AVATAR_DEFAULTS } from './Avatar.types';

export { AvatarGroup, AvatarBadge, AvatarFallback };
export type { AvatarGroupProps, AvatarBadgeProps, BadgeStatus, AvatarFallbackProps } from './compound';

/**
 * Avatar component -- engine-aware entry point.
 * Sub-components are attached via Object.assign so consumers can use the
 * `Avatar.Group` / `Avatar.Badge` / `Avatar.Fallback` compound API.
 */
export const Avatar = Object.assign(
  createEngineComponent<AvatarProps>('Avatar', {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }),
  {
    /** Renders a stack of overlapping avatars with an optional "+N" overflow indicator. */
    Group: AvatarGroup,
    /** Positions a numeric or dot badge over the avatar (e.g. unread count). */
    Badge: AvatarBadge,
    /** Replaces the default initials when no image is available (e.g. a custom icon). */
    Fallback: AvatarFallback,
  }
);
