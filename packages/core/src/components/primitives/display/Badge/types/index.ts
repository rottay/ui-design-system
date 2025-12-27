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
 * Maps size tokens to their corresponding CSS variable references.
 * @remarks These values reference CSS custom properties defined in design tokens.
 */
export const SIZE_MAP: Record<string, { minWidth: string; height: string; fontSize: string }> = {
  xs: { minWidth: 'var(--badge-xs-min-width)', height: 'var(--badge-xs-height)', fontSize: 'var(--badge-xs-font-size)' },
  sm: { minWidth: 'var(--badge-sm-min-width)', height: 'var(--badge-sm-height)', fontSize: 'var(--badge-sm-font-size)' },
  md: { minWidth: 'var(--badge-md-min-width)', height: 'var(--badge-md-height)', fontSize: 'var(--badge-md-font-size)' },
  lg: { minWidth: 'var(--badge-lg-min-width)', height: 'var(--badge-lg-height)', fontSize: 'var(--badge-lg-font-size)' },
  xl: { minWidth: 'var(--badge-xl-min-width)', height: 'var(--badge-xl-height)', fontSize: 'var(--badge-xl-font-size)' },
} as const;

/**
 * Dot indicator size mapping.
 * Defines the diameter of dot badges for each size variant using CSS variables.
 */
export const DOT_SIZE_MAP: Record<string, string> = {
  xs: 'var(--badge-dot-xs-size)',
  sm: 'var(--badge-dot-sm-size)',
  md: 'var(--badge-dot-md-size)',
  lg: 'var(--badge-dot-lg-size)',
  xl: 'var(--badge-dot-xl-size)',
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
