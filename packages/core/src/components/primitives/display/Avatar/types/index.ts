/**
 * Avatar - Core Interface
 * Re-exports from centralized types
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

// Default values
export const AVATAR_DEFAULTS = {
  size: 'md' as const,
  shape: 'circle' as const,
  variant: 'default' as const,
  bordered: false,
  showZero: false,
  ring: false,
};

// Size mapping to pixel values (matches CSS tokens)
export const SIZE_MAP: Record<string, number> = {
  xs: 24,   // --avatar-xs-size: 1.5rem
  sm: 32,   // --avatar-sm-size: 2rem
  md: 40,   // --avatar-md-size: 2.5rem (default)
  lg: 48,   // --avatar-lg-size: 3rem
  xl: 56,   // --avatar-xl-size: 3.5rem
  '2xl': 64,  // --avatar-2xl-size: 4rem
  '3xl': 96,  // --avatar-3xl-size: 6rem
};
