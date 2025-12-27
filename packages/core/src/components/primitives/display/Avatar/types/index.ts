/**
 * Avatar Component Types
 *
 * Type definitions for the Avatar component including size, shape,
 * variant options, and compound component props.
 *
 * @module AvatarTypes
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
