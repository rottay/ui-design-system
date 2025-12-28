/**
 * @fileoverview Tag Types - Rottay Design System
 * @description Type definitions for the Tag component.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This module re-exports types from the centralized types definition
 * and provides default values and configuration maps for the Tag component.
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

export type {
  TagProps,
  TagSize,
  TagVariant,
} from '../../../../../types/primitives/display/Tag';

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
 * Values reference CSS custom properties defined in tokens/css/components/tag.css
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
  sm: 'var(--ds-tag-radius-sm, 0.125rem)',
  md: 'var(--ds-tag-radius-md, 0.25rem)',
  lg: 'var(--ds-tag-radius-lg, 0.5rem)',
  full: 'var(--ds-tag-radius-full, 9999px)',
};

/**
 * Color mapping for semantic variants.
 * Provides consistent color values for solid, outline, and subtle styles.
 */
export const VARIANT_COLORS = {
  default: {
    solid: { bg: 'var(--ds-color-neutral-200)', text: 'var(--ds-color-neutral-700)', border: 'var(--ds-color-neutral-300)' },
    outline: { bg: 'transparent', text: 'var(--ds-color-neutral-700)', border: 'var(--ds-color-neutral-400)' },
    subtle: { bg: 'var(--ds-color-neutral-100)', text: 'var(--ds-color-neutral-700)', border: 'transparent' },
  },
  primary: {
    solid: { bg: 'var(--ds-color-primary-500)', text: 'white', border: 'var(--ds-color-primary-500)' },
    outline: { bg: 'transparent', text: 'var(--ds-color-primary-500)', border: 'var(--ds-color-primary-500)' },
    subtle: { bg: 'var(--ds-color-primary-100)', text: 'var(--ds-color-primary-500)', border: 'transparent' },
  },
  secondary: {
    solid: { bg: 'var(--ds-color-secondary-500)', text: 'white', border: 'var(--ds-color-secondary-500)' },
    outline: { bg: 'transparent', text: 'var(--ds-color-secondary-500)', border: 'var(--ds-color-secondary-500)' },
    subtle: { bg: 'var(--ds-color-secondary-100)', text: 'var(--ds-color-secondary-500)', border: 'transparent' },
  },
  success: {
    solid: { bg: 'var(--ds-color-success-500)', text: 'white', border: 'var(--ds-color-success-500)' },
    outline: { bg: 'transparent', text: 'var(--ds-color-success-500)', border: 'var(--ds-color-success-500)' },
    subtle: { bg: 'var(--ds-color-success-100)', text: 'var(--ds-color-success-500)', border: 'transparent' },
  },
  warning: {
    solid: { bg: 'var(--ds-color-warning-500)', text: 'white', border: 'var(--ds-color-warning-500)' },
    outline: { bg: 'transparent', text: 'var(--ds-color-warning-500)', border: 'var(--ds-color-warning-500)' },
    subtle: { bg: 'var(--ds-color-warning-100)', text: 'var(--ds-color-warning-500)', border: 'transparent' },
  },
  error: {
    solid: { bg: 'var(--ds-color-error-500)', text: 'white', border: 'var(--ds-color-error-500)' },
    outline: { bg: 'transparent', text: 'var(--ds-color-error-500)', border: 'var(--ds-color-error-500)' },
    subtle: { bg: 'var(--ds-color-error-100)', text: 'var(--ds-color-error-500)', border: 'transparent' },
  },
} as const;
