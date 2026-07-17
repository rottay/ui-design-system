/**
 * @fileoverview Avatar Compound Components - Rottay Design System
 * @description Compound components for enhanced Avatar functionality.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This module exports compound components that extend Avatar functionality:
 *
 * **AvatarGroup:**
 * Displays multiple avatars in an overlapping stack with configurable
 * max limit and "+N" overflow indicator.
 *
 * **AvatarBadge:**
 * Notification badge overlay for displaying counts or status dots
 * on the avatar corner.
 *
 * **AvatarFallback:**
 * Custom fallback content when image fails to load (alternative to
 * automatic initials).
 *
 * @example Avatar Group
 * ```tsx
 * <Avatar.Group max={3} size="md">
 *   <Avatar src="/user1.jpg" />
 *   <Avatar src="/user2.jpg" />
 *   <Avatar name="JD" />
 * </Avatar.Group>
 * ```
 *
 * @example Avatar with Badge
 * ```tsx
 * <Avatar src="/user.jpg">
 *   <Avatar.Badge content={99} max={99} />
 * </Avatar>
 * ```
 *
 * @see {@link Avatar} for the main component
 * @module AvatarCompound
 * @category Display
 * @package @rottay/design-system
 */

export { AvatarGroup } from './Group';
export { AvatarBadge } from './Badge';
export { AvatarFallback } from './Fallback';

export type { AvatarGroupProps } from './Group';
export type { AvatarBadgeProps, BadgeStatus } from './Badge';
export type { AvatarFallbackProps } from './Fallback';
