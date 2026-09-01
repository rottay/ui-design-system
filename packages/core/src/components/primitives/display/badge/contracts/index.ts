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
import type {
  BaseComponentProps,
  DisableableProps,
  LoadableProps,
  Size,
  Tone,
  Variant,
  WithChildren,
} from '../../../../../foundation/contracts/kernel/common';
import { TONE_TO_VARIANT } from '../../../../../foundation/contracts/kernel/common';
import type { EngineAwareProps } from '../../../../../foundation/contracts/runtime/engine';
import type { ResponsiveValue } from '@/foundation/contracts/kernel/responsive/values';

/** Badge size type alias derived from the global Size scale. */
export type BadgeSize = Size;

/**
 * @deprecated Legacy color axis; use {@link Tone} via the `tone` prop instead. Retained for
 * one release so existing values keep compiling.
 */
export type BadgeVariant = Variant;

/**
 * @deprecated Use the kernel {@link TONE_TO_VARIANT} map directly; this export now folds into
 * it and is retained under Badge's name for one release. Every {@link Tone} value Badge accepts
 * through the `tone` prop, mapped to the internal color-token key the engines render ('gradient'
 * and 'secondary' have no Tone equivalent and remain reachable only through the deprecated
 * `variant` prop). `'info'` is a real, already color-tokened key the engines' internal
 * `VARIANT_TOKENS` maps define but the deprecated `BadgeVariant` union never named, so it is
 * typed here rather than narrowed to `BadgeVariant`.
 */
export const TONE_TO_BADGE_VARIANT: Record<Tone, BadgeVariant | 'info'> = TONE_TO_VARIANT;

/**
 * Badge visual style.
 */
export type BadgeStyle = 'solid' | 'outline' | 'soft' | 'ghost';

/**
 * Structural role inside the compact-label family. It changes anatomy and
 * density, never semantic colour: `tone` remains the single colour meaning.
 */
export type BadgeKind = 'badge' | 'chip' | 'pill';

/** Logical positions mirror automatically in RTL. Physical aliases remain for compatibility. */
export type BadgePosition =
  | 'top-start'
  | 'top-end'
  | 'bottom-start'
  | 'bottom-end'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

/**
 * Badge status for status indicators.
 */
export type BadgeStatus = 'processing' | 'default' | 'success' | 'error' | 'warning';

/**
 * Badge component props.
 */
export interface BadgeBaseProps
  extends BaseComponentProps,
    DisableableProps,
    LoadableProps,
    EngineAwareProps,
    WithChildren {
  /**
   * Compact-label anatomy. `badge` preserves notification/count behaviour;
   * `chip` and `pill` expose selection, avatar, count and removal anatomy.
   * @default 'badge'
   */
  kind?: BadgeKind;
  /**
   * Badge size. Accepts a plain value or a responsive breakpoint object.
   * @default 'md'
   * @example
   * ```tsx
   * <Badge size="lg" />
   * <Badge size={{ base: 'sm', md: 'md', xl: 'lg' }} />
   * ```
   */
  size?: ResponsiveValue<BadgeSize>;

  /**
   * Badge semantic color. Takes precedence over the deprecated `variant` prop when both
   * are given.
   * @default 'neutral'
   */
  tone?: Tone;

  /**
   * @deprecated Use `tone` instead. Badge color variant.
   * @default 'default'
   */
  variant?: BadgeVariant;

  /**
   * Badge visual style.
   * @default 'soft'
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
   * @default 'top-end'
   */
  position?: BadgePosition;

  /**
   * Icon to show before content.
   */
  icon?: ReactNode;

  /** Avatar or compact identity mark rendered before the label. */
  avatar?: ReactNode;

  /** Controlled selected state for filter chips and selectable pills. */
  selected?: boolean;

  /** Selection callback. Providing it makes the main label keyboard interactive. */
  onSelectedChange?: (selected: boolean) => void;

  /**
   * @deprecated Use `removable` with a localized `removeLabel`. Kept for one
   * compatibility cycle so existing badges do not lose their close control.
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

  /** Truncate long labels at the tenant-owned max inline size. @default true */
  truncate?: boolean;
}

/**
 * Removal is deliberately discriminated: the preferred `removable` API can
 * never create an unnamed icon button. The legacy `closable` branch remains
 * accepted through {@link BadgeBaseProps} for source compatibility, but new
 * product code receives a compile-time requirement for localized copy.
 */
export type BadgeRemovalProps =
  | {
      removable: true;
      removeLabel: string;
    }
  | {
      removable?: false;
      /** May be prepared while removal is disabled, or used by legacy `closable`. */
      removeLabel?: string;
    };

export type BadgeProps = BadgeBaseProps & BadgeRemovalProps;

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
  position: 'top-end' as const,
  /** Default compact-label anatomy */
  kind: 'badge' as const,
  /** Default border radius style */
  radius: 'full' as const,
  /** Default visual style */
  badgeStyle: 'soft' as const,
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
 * Mapping of variant names to their soft-style (low-opacity tint) background.
 * A `var()` reference cannot be hex-suffixed for alpha -- computed-value-time
 * substitution splices the resolved token, it does not concatenate with a
 * trailing literal into a single color -- so the `soft` badgeStyle reads
 * these pre-computed tint tokens directly instead of deriving a tint from
 * VARIANT_COLOR_MAP. Shared by the classic and rustic engines, which both
 * already source their solid fill from VARIANT_COLOR_MAP above.
 */
export const VARIANT_SOFT_COLOR_MAP: Record<string, string> = {
  /** Low-opacity black tint for neutral / general-purpose badges. */
  default: 'var(--ds-color-alpha-black-100)',
  /** Low-opacity primary tint. */
  primary: 'var(--ds-color-alpha-primary-10)',
  /** Low-opacity secondary tint. */
  secondary: 'var(--ds-color-alpha-secondary-10)',
  /** Low-opacity success tint. */
  success: 'var(--ds-color-alpha-success-10)',
  /** Low-opacity warning tint. */
  warning: 'var(--ds-color-alpha-warning-10)',
  /** Low-opacity error tint. */
  error: 'var(--ds-color-alpha-error-10)',
  /** Low-opacity info tint. */
  info: 'var(--ds-color-alpha-info-10)',
} as const;

/**
 * Mapping of variant names to the text color used on top of their soft tint
 * (VARIANT_SOFT_COLOR_MAP). A deliberately darker/more saturated shade than
 * the solid fill token -- the solid fill is tuned for white text on top of
 * it at full opacity, not for use as small text on a light tenant surface,
 * where the solid hue alone can fall under the APCA UI floor. Mirrors the
 * modern engine's softColor token per variant.
 */
export const VARIANT_SOFT_TEXT_COLOR_MAP: Record<string, string> = {
  default: 'var(--ds-color-text-secondary)',
  primary: 'var(--ds-color-primary)',
  secondary: 'var(--ds-color-secondary-600)',
  success: 'var(--ds-color-success-700)',
  warning: 'var(--ds-color-warning-700)',
  error: 'var(--ds-color-error-700)',
  info: 'var(--ds-color-info-700)',
} as const;

/**
 * The foreground a SOLID badge paints on its own fill, derived per-variant from
 * an on-primary token rather than a flat value. Shared by the modern and rustic
 * engines so a tenant whose primary fill is light (rottay) does not get a
 * near-white label on a near-white badge. `default` reads the primary text
 * colour because its fill is a neutral surface, not a solid brand colour.
 */
export const VARIANT_SOLID_TEXT_COLOR_MAP: Record<string, string> = {
  default: 'var(--ds-color-text-primary)',
  primary: 'var(--ds-color-primary-foreground)',
  secondary: 'var(--ds-color-text-on-primary)',
  success: 'var(--ds-color-text-on-primary)',
  warning: 'var(--ds-color-text-on-primary)',
  error: 'var(--ds-color-text-on-primary)',
  info: 'var(--ds-color-text-on-primary)',
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
