/**
 * Badge - Core Interface
 * Re-exports from centralized types
 */

export type {
  BadgeProps,
  BadgeSize,
  BadgeVariant,
  BadgeStyle,
  BadgeStatus,
  BadgeRibbonProps,
  BadgeCountProps,
} from '../../../../../types/primitives/display/Badge';

// Default values
export const BADGE_DEFAULTS = {
  variant: 'default' as const,
  size: 'md' as const,
  showZero: false,
  overflowCount: 99,
  dot: false,
  position: 'top-right' as const,
  radius: 'full' as const,
  badgeStyle: 'solid' as const,
  visible: true,
};

// Variant to color mapping
export const VARIANT_COLOR_MAP: Record<string, string> = {
  default: '#d9d9d9',
  primary: '#1890ff',
  secondary: '#722ed1',
  success: '#52c41a',
  warning: '#faad14',
  error: '#ff4d4f',
  info: '#1890ff',
};

// Size mapping to pixel values (matches CSS tokens)
export const SIZE_MAP: Record<string, { minWidth: number; height: number; fontSize: number }> = {
  xs: { minWidth: 14, height: 14, fontSize: 9 },
  sm: { minWidth: 16, height: 16, fontSize: 10 },
  md: { minWidth: 20, height: 20, fontSize: 12 },
  lg: { minWidth: 24, height: 24, fontSize: 14 },
  xl: { minWidth: 28, height: 28, fontSize: 16 },
};

// Dot size by badge size
export const DOT_SIZE_MAP: Record<string, number> = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 10,
  xl: 12,
};

// Status color mapping
export const STATUS_COLOR_MAP: Record<string, string> = {
  processing: '#1890ff',
  default: '#d9d9d9',
  success: '#52c41a',
  error: '#ff4d4f',
  warning: '#faad14',
};
