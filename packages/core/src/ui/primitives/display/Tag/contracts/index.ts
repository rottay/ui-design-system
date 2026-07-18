/**
 * @fileoverview Tag Types - Rottay Design System
 * @description Type definitions for the Tag component.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This module provides default values and configuration maps for the Tag component.
 *
 * **Exported Types:**
 * - `TagProps` - Main component props interface
 * - `TagSize` - Size variant type (xs, sm, md, lg, xl)
 * - `TagVariant` - Color variant type (default, primary, secondary, etc.)
 * - `TagRadius` - Border radius options (none, sm, md, lg, full)
 *
 * **Configuration Constants:**
 * - `TAG_DEFAULTS` - Default prop values
 * - `SIZE_MAP` - Size to dimensions mapping (CSS variables)
 * - `RADIUS_MAP` - Radius to CSS value mapping
 * - `VARIANT_COLORS` - Variant color configurations
 *
 * @example Type Usage
 * ```tsx
 * import type { TagProps, TagVariant } from '@rottay/design-system';
 *
 * const variant: TagVariant = 'success';
 * ```
 *
 * @see {@link Tag} for the main component
 * @module TagTypes
 * @category Display
 * @package @rottay/design-system
 */

import type { ReactNode } from 'react';
import type { BaseComponentProps, Size, Tone, Variant, WithChildren } from '../../../../../foundation/contracts/kernel/common';
import { TONE_TO_VARIANT } from '../../../../../foundation/contracts/kernel/common';
import type { EngineAwareProps } from '../../../../../foundation/contracts/runtime/engine';

/** Tag size type alias derived from the global Size scale. */
export type TagSize = Size;

/**
 * @deprecated Legacy color axis; use {@link Tone} via the `tone` prop instead. Retained for
 * one release so existing values keep compiling.
 */
export type TagVariant = Variant;

/**
 * The {@link Tone} values Tag accepts through the `tone` prop. `'info'` is excluded: no engine
 * defines color tokens for it (unlike Badge/Callout, Tag's variant maps only ever covered
 * 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error').
 */
export type TagTone = Exclude<Tone, 'info'>;

/**
 * @deprecated Use the kernel {@link TONE_TO_VARIANT} map directly; this export now folds into
 * it and is retained under Tag's name for one release. Every {@link TagTone} value mapped to the
 * internal color-token key `variant` has always used. `TONE_TO_VARIANT`'s extra `info` key is
 * harmless here: this binding's `Record<TagTone, TagVariant>` type does not require it.
 */
export const TONE_TO_TAG_VARIANT: Record<TagTone, TagVariant> = TONE_TO_VARIANT;

/**
 * Tag component props.
 */
export interface TagProps extends BaseComponentProps, EngineAwareProps, WithChildren {
  /**
   * Tag size.
   * @default 'md'
   */
  size?: TagSize;

  /**
   * Tag semantic color. Takes precedence over the deprecated `variant` prop when both
   * are given.
   * @default 'neutral'
   */
  tone?: TagTone;

  /**
   * @deprecated Use `tone` instead. Tag color variant.
   * @default 'default'
   */
  variant?: TagVariant;

  /**
   * Tag icon.
   */
  icon?: ReactNode;

  /**
   * Whether the tag can be closed.
   * @default false
   */
  closable?: boolean;

  /**
   * Tag close callback.
   */
  onClose?: () => void;

  /**
   * Whether the tag is clickable.
   */
  clickable?: boolean;

  /**
   * Tag click callback.
   */
  onClick?: () => void;

  /**
   * Whether the tag has a border.
   * @default false
   */
  bordered?: boolean;

  /**
   * Tag border radius.
   * @default 'md'
   */
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'full';

  /**
   * Custom tag color.
   */
  color?: string;

  /**
   * Whether the tag has an "outlined" style.
   */
  outlined?: boolean;
}

/**
 * Tag radius options for border-radius customization.
 */
export type TagRadius = 'none' | 'sm' | 'md' | 'lg' | 'full';

/**
 * Default values for the Tag component.
 * These constants ensure consistent defaults across all engine implementations.
 */
export const TAG_DEFAULTS = {
  /** Default size */
  size: 'md' as const,
  /** Default variant */
  variant: 'default' as const,
  /** Default closable state */
  closable: false,
  /** Default bordered state */
  bordered: false,
  /** Default radius */
  radius: 'md' as const,
  /** Default outlined state */
  outlined: false,
  /** Default clickable state */
  clickable: false,
} as const;

/**
 * Size mapping using CSS tokens.
 * Used for consistent sizing across all engine implementations.
 * Values reference CSS custom properties defined in foundation/tokens/css/presentation/components/tag.css
 */
export const SIZE_MAP: Record<string, { padding: string; fontSize: string; height: string }> = {
  xs: { padding: 'var(--ds-tag-xs-padding)', fontSize: 'var(--ds-tag-xs-font-size)', height: 'var(--ds-tag-xs-height)' },
  sm: { padding: 'var(--ds-tag-sm-padding)', fontSize: 'var(--ds-tag-sm-font-size)', height: 'var(--ds-tag-sm-height)' },
  md: { padding: 'var(--ds-tag-md-padding)', fontSize: 'var(--ds-tag-md-font-size)', height: 'var(--ds-tag-md-height)' },
  lg: { padding: 'var(--ds-tag-lg-padding)', fontSize: 'var(--ds-tag-lg-font-size)', height: 'var(--ds-tag-lg-height)' },
  xl: { padding: 'var(--ds-tag-xl-padding)', fontSize: 'var(--ds-tag-xl-font-size)', height: 'var(--ds-tag-xl-height)' },
};

/**
 * Radius mapping to CSS values.
 */
export const RADIUS_MAP: Record<TagRadius, string> = {
  none: 'var(--ds-tag-radius-none, 0)',
  sm: 'var(--ds-tag-radius-sm, 0.1875rem)',
  md: 'var(--ds-tag-radius-md, 0.375rem)',
  lg: 'var(--ds-tag-radius-lg, 0.5rem)',
  full: 'var(--ds-tag-radius-full, 9999px)',
};

/**
 * Color mapping for semantic tag variants.
 *
 * Each variant provides three visual styles:
 * - `solid` - Filled background with contrasting text.
 * - `outline` - Transparent background with colored border and text.
 * - `subtle` - Light-tinted background with colored text, no visible border.
 *
 * All values reference CSS custom properties for multi-tenant theming support.
 *
 * @constant
 * @example
 * ```ts
 * const { bg, text, border } = VARIANT_COLORS.success.solid;
 * ```
 */
export const VARIANT_COLORS = {
  /** Neutral / default colors for general-purpose tags. */
  default: {
    solid: { bg: 'var(--ds-color-neutral-200)', text: 'var(--ds-color-neutral-700)', border: 'var(--ds-color-neutral-300)' },
    outline: { bg: 'transparent', text: 'var(--ds-color-neutral-700)', border: 'var(--ds-color-neutral-400)' },
    subtle: { bg: 'var(--ds-color-neutral-100)', text: 'var(--ds-color-neutral-700)', border: 'transparent' },
  },
  /** Primary brand color for emphasis and key actions. */
  primary: {
    solid: { bg: 'var(--ds-color-primary-500)', text: 'white', border: 'var(--ds-color-primary-500)' },
    outline: { bg: 'transparent', text: 'var(--ds-color-primary-500)', border: 'var(--ds-color-primary-500)' },
    subtle: { bg: 'var(--ds-color-primary-100)', text: 'var(--ds-color-primary-500)', border: 'transparent' },
  },
  /** Secondary color for complementary or supporting tags. */
  secondary: {
    solid: { bg: 'var(--ds-color-secondary-500)', text: 'white', border: 'var(--ds-color-secondary-500)' },
    outline: { bg: 'transparent', text: 'var(--ds-color-secondary-500)', border: 'var(--ds-color-secondary-500)' },
    subtle: { bg: 'var(--ds-color-secondary-100)', text: 'var(--ds-color-secondary-500)', border: 'transparent' },
  },
  /** Success color for positive states (e.g., "Active", "Approved"). */
  success: {
    solid: { bg: 'var(--ds-color-success-500)', text: 'white', border: 'var(--ds-color-success-500)' },
    outline: { bg: 'transparent', text: 'var(--ds-color-success-500)', border: 'var(--ds-color-success-500)' },
    subtle: { bg: 'var(--ds-color-success-100)', text: 'var(--ds-color-success-500)', border: 'transparent' },
  },
  /** Warning color for cautionary states (e.g., "Pending", "Expiring"). */
  warning: {
    solid: { bg: 'var(--ds-color-warning-500)', text: 'white', border: 'var(--ds-color-warning-500)' },
    outline: { bg: 'transparent', text: 'var(--ds-color-warning-500)', border: 'var(--ds-color-warning-500)' },
    subtle: { bg: 'var(--ds-color-warning-100)', text: 'var(--ds-color-warning-500)', border: 'transparent' },
  },
  /** Error color for negative states (e.g., "Failed", "Rejected"). */
  error: {
    solid: { bg: 'var(--ds-color-error-500)', text: 'white', border: 'var(--ds-color-error-500)' },
    outline: { bg: 'transparent', text: 'var(--ds-color-error-500)', border: 'var(--ds-color-error-500)' },
    subtle: { bg: 'var(--ds-color-error-100)', text: 'var(--ds-color-error-500)', border: 'transparent' },
  },
} as const;
