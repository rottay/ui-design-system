/**
 * @fileoverview Badge Types - Rottay Design System
 * @description Type definitions for the Badge component.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This module re-exports types from the centralized types definition
 * and provides default values and configuration maps for the Badge component.
 *
 * **Exported Types:**
 * - `BadgeProps` - Main component props interface
 * - `BadgeSize` - Size variant type ('xs' | 'sm' | 'md' | 'lg' | 'xl')
 * - `BadgeVariant` - Color variant type (default, primary, secondary, etc.)
 * - `BadgeStyle` - Visual style type (solid, outline, soft, ghost)
 * - `BadgeStatus` - Status indicator type (processing, success, error, etc.)
 * - `BadgeRibbonProps` - Ribbon badge props (future)
 * - `BadgeCountProps` - Count badge props (future)
 *
 * **Configuration Constants:**
 * - `BADGE_DEFAULTS` - Default prop values
 * - `VARIANT_COLOR_MAP` - Variant to color mapping
 * - `SIZE_MAP` - Size to dimensions mapping
 * - `DOT_SIZE_MAP` - Dot size per size variant
 * - `STATUS_COLOR_MAP` - Status to color mapping
 *
 * @example Type Usage
 * ```tsx
 * import type { BadgeProps, BadgeVariant } from '@rottay/design-system';
 *
 * const variant: BadgeVariant = 'success';
 * ```
 *
 * @see {@link Badge} for the main component
 * @module BadgeTypes
 * @category Display
 * @package @rottay/design-system
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
 * Uses CSS variable references with fallback hex values.
 */
export const VARIANT_COLOR_MAP: Record<string, string> = {
  default: 'var(--ds-color-neutral-300, #d9d9d9)',
  primary: 'var(--ds-color-primary-500, #1890ff)',
  secondary: 'var(--ds-color-secondary-500, #722ed1)',
  success: 'var(--ds-color-success-500, #52c41a)',
  warning: 'var(--ds-color-warning-500, #faad14)',
  error: 'var(--ds-color-error-500, #ff4d4f)',
  info: 'var(--ds-color-info-500, #1890ff)',
} as const;

/**
 * Size configuration mapping.
 * Maps size tokens to their corresponding CSS variable references.
 * @remarks These values reference CSS custom properties defined in design tokens.
 */
export const SIZE_MAP: Record<string, { minWidth: string; height: string; fontSize: string }> = {
  xs: { minWidth: 'var(--ds-badge-xs-min-width)', height: 'var(--ds-badge-xs-height)', fontSize: 'var(--ds-badge-xs-font-size)' },
  sm: { minWidth: 'var(--ds-badge-sm-min-width)', height: 'var(--ds-badge-sm-height)', fontSize: 'var(--ds-badge-sm-font-size)' },
  md: { minWidth: 'var(--ds-badge-md-min-width)', height: 'var(--ds-badge-md-height)', fontSize: 'var(--ds-badge-md-font-size)' },
  lg: { minWidth: 'var(--ds-badge-lg-min-width)', height: 'var(--ds-badge-lg-height)', fontSize: 'var(--ds-badge-lg-font-size)' },
  xl: { minWidth: 'var(--ds-badge-xl-min-width)', height: 'var(--ds-badge-xl-height)', fontSize: 'var(--ds-badge-xl-font-size)' },
} as const;

/**
 * Dot indicator size mapping.
 * Defines the diameter of dot badges for each size variant using CSS variables.
 */
export const DOT_SIZE_MAP: Record<string, string> = {
  xs: 'var(--ds-badge-dot-xs-size)',
  sm: 'var(--ds-badge-dot-sm-size)',
  md: 'var(--ds-badge-dot-md-size)',
  lg: 'var(--ds-badge-dot-lg-size)',
  xl: 'var(--ds-badge-dot-xl-size)',
} as const;

/**
 * Status indicator color mapping.
 * Maps status types to their corresponding display colors.
 */
export const STATUS_COLOR_MAP: Record<string, string> = {
  processing: 'var(--ds-color-primary-500, #1890ff)',
  default: 'var(--ds-color-neutral-300, #d9d9d9)',
  success: 'var(--ds-color-success-500, #52c41a)',
  error: 'var(--ds-color-error-500, #ff4d4f)',
  warning: 'var(--ds-color-warning-500, #faad14)',
} as const;
