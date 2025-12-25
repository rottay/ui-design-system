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
