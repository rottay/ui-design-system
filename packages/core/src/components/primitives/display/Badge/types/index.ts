/**
 * @fileoverview Badge Component Type Definitions
 * @description Re-exports centralized types and provides default configuration values
 * for the Badge component. The Badge component displays counts, status indicators,
 * or small labels attached to other UI elements.
 * @module components/primitives/display/Badge/types
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

/**
 * Default configuration values for the Badge component.
 * These values are used when props are not explicitly provided.
 */
export const BADGE_DEFAULTS = {
  /** Default color variant */
  variant: 'default' as const,
  /** Default size */
  size: 'md' as const,
  /** Whether to show zero count by default */
  showZero: false,
  /** Maximum count before showing overflow indicator (e.g., "99+") */
  overflowCount: 99,
  /** Whether to render as a dot indicator */
  dot: false,
  /** Default position when attached to an element */
  position: 'top-right' as const,
  /** Default border radius style */
  radius: 'full' as const,
  /** Default visual style */
  badgeStyle: 'solid' as const,
  /** Whether the badge is visible */
  visible: true,
} as const;

/**
 * Mapping of variant names to their corresponding background colors.
 * Uses hex color values that align with design system tokens.
 */
export const VARIANT_COLOR_MAP: Record<string, string> = {
  default: '#d9d9d9',
  primary: '#1890ff',
  secondary: '#722ed1',
  success: '#52c41a',
  warning: '#faad14',
  error: '#ff4d4f',
  info: '#1890ff',
} as const;

/**
 * Size configuration mapping.
 * Maps size tokens to their corresponding pixel dimensions.
 * @remarks These values align with CSS custom properties defined in design tokens.
 */
export const SIZE_MAP: Record<string, { minWidth: number; height: number; fontSize: number }> = {
  xs: { minWidth: 14, height: 14, fontSize: 9 },
  sm: { minWidth: 16, height: 16, fontSize: 10 },
  md: { minWidth: 20, height: 20, fontSize: 12 },
  lg: { minWidth: 24, height: 24, fontSize: 14 },
  xl: { minWidth: 28, height: 28, fontSize: 16 },
} as const;

/**
 * Dot indicator size mapping.
 * Defines the diameter of dot badges for each size variant.
 */
export const DOT_SIZE_MAP: Record<string, number> = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 10,
  xl: 12,
} as const;

/**
 * Status indicator color mapping.
 * Maps status types to their corresponding display colors.
 */
export const STATUS_COLOR_MAP: Record<string, string> = {
  processing: '#1890ff',
  default: '#d9d9d9',
  success: '#52c41a',
  error: '#ff4d4f',
  warning: '#faad14',
} as const;
