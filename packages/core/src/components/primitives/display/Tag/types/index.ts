/**
 * Tag - Core Interface
 * Re-exports from centralized types for consistent typing across the design system.
 *
 * @module Tag/types
 * @description Provides type definitions for the Tag component, including
 * size variants, color variants, and component props.
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
  xs: { padding: 'var(--tag-xs-padding)', fontSize: 'var(--tag-xs-font-size)', height: 'var(--tag-xs-height)' },
  sm: { padding: 'var(--tag-sm-padding)', fontSize: 'var(--tag-sm-font-size)', height: 'var(--tag-sm-height)' },
  md: { padding: 'var(--tag-md-padding)', fontSize: 'var(--tag-md-font-size)', height: 'var(--tag-md-height)' },
  lg: { padding: 'var(--tag-lg-padding)', fontSize: 'var(--tag-lg-font-size)', height: 'var(--tag-lg-height)' },
  xl: { padding: 'var(--tag-xl-padding)', fontSize: 'var(--tag-xl-font-size)', height: 'var(--tag-xl-height)' },
};

/**
 * Radius mapping to CSS values.
 */
export const RADIUS_MAP: Record<TagRadius, string> = {
  none: '0',
  sm: '0.125rem',
  md: '0.25rem',
  lg: '0.5rem',
  full: '9999px',
};

/**
 * Color mapping for semantic variants.
 * Provides consistent color values for solid, outline, and subtle styles.
 */
export const VARIANT_COLORS = {
  default: {
    solid: { bg: 'var(--color-neutral-200)', text: 'var(--color-neutral-700)', border: 'var(--color-neutral-300)' },
    outline: { bg: 'transparent', text: 'var(--color-neutral-700)', border: 'var(--color-neutral-400)' },
    subtle: { bg: 'var(--color-neutral-100)', text: 'var(--color-neutral-700)', border: 'transparent' },
  },
  primary: {
    solid: { bg: 'var(--color-primary)', text: 'white', border: 'var(--color-primary)' },
    outline: { bg: 'transparent', text: 'var(--color-primary)', border: 'var(--color-primary)' },
    subtle: { bg: 'var(--color-primary-light)', text: 'var(--color-primary)', border: 'transparent' },
  },
  secondary: {
    solid: { bg: 'var(--color-secondary)', text: 'white', border: 'var(--color-secondary)' },
    outline: { bg: 'transparent', text: 'var(--color-secondary)', border: 'var(--color-secondary)' },
    subtle: { bg: 'var(--color-secondary-light)', text: 'var(--color-secondary)', border: 'transparent' },
  },
  success: {
    solid: { bg: 'var(--color-success)', text: 'white', border: 'var(--color-success)' },
    outline: { bg: 'transparent', text: 'var(--color-success)', border: 'var(--color-success)' },
    subtle: { bg: 'var(--color-success-light)', text: 'var(--color-success)', border: 'transparent' },
  },
  warning: {
    solid: { bg: 'var(--color-warning)', text: 'white', border: 'var(--color-warning)' },
    outline: { bg: 'transparent', text: 'var(--color-warning)', border: 'var(--color-warning)' },
    subtle: { bg: 'var(--color-warning-light)', text: 'var(--color-warning)', border: 'transparent' },
  },
  error: {
    solid: { bg: 'var(--color-error)', text: 'white', border: 'var(--color-error)' },
    outline: { bg: 'transparent', text: 'var(--color-error)', border: 'var(--color-error)' },
    subtle: { bg: 'var(--color-error-light)', text: 'var(--color-error)', border: 'transparent' },
  },
} as const;
