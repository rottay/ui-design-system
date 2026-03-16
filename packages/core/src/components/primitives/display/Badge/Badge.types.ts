/**
 * @fileoverview Badge Types - Rottay Design System
 * @description Type definitions for the Badge component.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This module provides default values and configuration maps for the Badge component.
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

import type { ReactNode } from 'react';
import type { BaseComponentProps, Size, Variant, WithChildren } from '../../../../contracts/common';
import type { EngineAwareProps } from '../../../../contracts/engine';

/** Badge size type alias derived from the global Size scale. */
export type BadgeSize = Size;

/**
 * Badge variants.
 */
export type BadgeVariant = Variant;

/**
 * Badge visual style.
 */
export type BadgeStyle = 'solid' | 'outline' | 'soft' | 'ghost';

/**
 * Badge status for status indicators.
 */
export type BadgeStatus = 'processing' | 'default' | 'success' | 'error' | 'warning';

/**
 * Badge component props.
 */
export interface BadgeProps extends BaseComponentProps, EngineAwareProps, WithChildren {
  /**
   * Badge size.
   * @default 'md'
   */
  size?: BadgeSize;

  /**
   * Badge color variant.
   * @default 'default'
   */
  variant?: BadgeVariant;

  /**
   * Badge visual style.
   * @default 'solid'
   */
  badgeStyle?: BadgeStyle;

  /**
   * Badge content (number or text). Alternative to count.
   */
  content?: number | string;

  /**
   * Number to display on badge. Alternative to content.
   */
  count?: number;

  /**
   * Whether to show the badge as a small dot.
   */
  dot?: boolean;

  /**
   * Whether to show zero when count is 0.
   * @default false
   */
  showZero?: boolean;

  /**
   * Maximum number to show before using "+".
   * For example, if max=99 and content=100, shows "99+".
   * @default 99
   */
  max?: number;

  /**
   * @deprecated Use max instead. Maximum number before showing "+".
   * @default 99
   */
  overflowCount?: number;

  /**
   * Status indicator for dot badges.
   */
  status?: BadgeStatus;

  /**
   * Text to show next to status dot.
   */
  text?: string;

  /**
   * Offset of the badge from default position [x, y].
   */
  offset?: [number, number];

  /**
   * Whether the badge is visible.
   * @default true
   */
  visible?: boolean;

  /**
   * Whether to show a pulsing animation (for notifications).
   */
  pulse?: boolean;

  /**
   * Badge position when over another element.
   * @default 'top-right'
   */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

  /**
   * Icon to show before content.
   */
  icon?: ReactNode;

  /**
   * Whether the badge can be closed.
   */
  closable?: boolean;

  /**
   * Badge close callback.
   */
  onClose?: () => void;

  /**
   * Whether the badge is clickable.
   */
  clickable?: boolean;

  /**
   * Badge click callback.
   */
  onClick?: () => void;

  /**
   * Whether the badge has a border.
   */
  bordered?: boolean;

  /**
   * Badge border radius.
   * @default 'full'
   */
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
}

/**
 * Badge.Ribbon component props (ribbon/banner badge).
 */
export interface BadgeRibbonProps extends BaseComponentProps {
  /**
   * Ribbon text.
   */
  text: string;

  /**
   * Color variant.
   * @default 'primary'
   */
  variant?: BadgeVariant;

  /**
   * Ribbon position.
   * @default 'top-right'
   */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

  /**
   * Element the ribbon is placed on.
   */
  children: ReactNode;
}

/**
 * Badge.Count component props (numeric counter).
 */
export interface BadgeCountProps extends BaseComponentProps {
  /**
   * Number to show.
   */
  count: number;

  /**
   * Maximum number before showing "+".
   * @default 99
   */
  max?: number;

  /**
   * Color variant.
   * @default 'error'
   */
  variant?: BadgeVariant;

  /**
   * Whether to show the counter even when 0.
   * @default false
   */
  showZero?: boolean;

  /**
   * Whether to show the counter.
   * @default true
   */
  visible?: boolean;

  /**
   * Element the counter is placed on.
   */
  children?: ReactNode;
}

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
 * Uses CSS variable references for multi-tenant support.
 */
export const VARIANT_COLOR_MAP: Record<string, string> = {
  /** Neutral gray background for general-purpose badges. */
  default: 'var(--ds-badge-default-bg)',
  /** Primary brand color background for emphasis. */
  primary: 'var(--ds-badge-primary-bg)',
  /** Secondary color background for complementary badges. */
  secondary: 'var(--ds-badge-secondary-bg)',
  /** Green background for positive / success states. */
  success: 'var(--ds-badge-success-bg)',
  /** Amber/yellow background for cautionary states. */
  warning: 'var(--ds-badge-warning-bg)',
  /** Red background for error / destructive states. */
  error: 'var(--ds-badge-error-bg)',
  /** Blue background for informational notices. */
  info: 'var(--ds-badge-info-bg)',
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
  /** Animated pulsing dot indicating an in-progress operation. */
  processing: 'var(--ds-color-primary-500, #1890ff)',
  /** Neutral dot for idle / inactive status. */
  default: 'var(--ds-color-neutral-300, #d9d9d9)',
  /** Green dot for successful / healthy status. */
  success: 'var(--ds-color-success-500, #52c41a)',
  /** Red dot for failed / critical status. */
  error: 'var(--ds-color-error-500, #ff4d4f)',
  /** Amber dot for degraded / attention-needed status. */
  warning: 'var(--ds-color-warning-500, #faad14)',
} as const;
