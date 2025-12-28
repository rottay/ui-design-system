/**
 * @fileoverview Avatar Types - Rottay Design System
 * @description Type definitions for the Avatar component.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This module re-exports types from the centralized types definition
 * and provides default values and size mappings for the Avatar component.
 *
 * **Exported Types:**
 * - `AvatarProps` - Main component props interface
 * - `AvatarSize` - Size variant type ('xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl')
 * - `AvatarShape` - Shape variant type ('circle' | 'square' | 'rounded')
 * - `AvatarVariant` - Color variant type
 * - `AvatarStatus` - Status indicator type ('online' | 'offline' | 'away' | 'busy')
 * - `AvatarGroupProps` - Group component props
 * - `AvatarBadgeProps` - Badge compound props
 * - `AvatarFallbackProps` - Fallback compound props
 *
 * **Configuration Constants:**
 * - `AVATAR_DEFAULTS` - Default prop values
 * - `SIZE_MAP` - Pixel values for each size
 *
 * @example Type Usage
 * ```tsx
 * import type { AvatarProps, AvatarSize, AvatarStatus } from '@rottay/design-system';
 *
 * interface UserAvatarProps extends AvatarProps {
 *   userId: string;
 * }
 * ```
 *
 * @see {@link Avatar} for the main component
 * @module AvatarTypes
 * @category Display
 * @package @rottay/design-system
 */

export type {
  AvatarProps,
  AvatarSize,
  AvatarVariant,
  AvatarShape,
  AvatarStatus,
  AvatarGroupProps,
  AvatarBadgeProps,
  AvatarFallbackProps,
  AvatarStatusConfig,
} from '../../../../../types/primitives/display/Avatar';

/**
 * Default values for Avatar component props.
 * These are applied when no explicit value is provided.
 */
export const AVATAR_DEFAULTS = {
  /** Default avatar size */
  size: 'md' as const,
  /** Default avatar shape */
  shape: 'circle' as const,
  /** Default color variant */
  variant: 'default' as const,
  /** Whether bordered by default */
  bordered: false,
  /** Whether to show zero count by default */
  showZero: false,
  /** Whether to show ring by default */
  ring: false,
};

/**
 * Size mapping to pixel values.
 * Corresponds to CSS token values for each size variant.
 */
export const SIZE_MAP: Record<string, number> = {
  /** Extra small: 24px (1.5rem) */
  xs: 24,
  /** Small: 32px (2rem) */
  sm: 32,
  /** Medium: 40px (2.5rem) - default */
  md: 40,
  /** Large: 48px (3rem) */
  lg: 48,
  /** Extra large: 56px (3.5rem) */
  xl: 56,
  /** 2X large: 64px (4rem) */
  '2xl': 64,
  /** 3X large: 96px (6rem) */
  '3xl': 96,
};
