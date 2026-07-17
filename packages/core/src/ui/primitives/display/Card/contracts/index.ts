/**
 * @fileoverview Card Types - Rottay Design System
 * @description Type definitions for the Card component.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This module provides default values and configuration maps for the Card component.
 *
 * **Exported Types:**
 * - `CardProps` - Main component props interface
 * - `CardVariant` - Visual variant type (elevated, outlined, filled, ghost)
 * - `CardSize` - Size variant type
 * - `CardHeaderProps` - Header compound props
 * - `CardBodyProps` - Body compound props
 * - `CardFooterProps` - Footer compound props
 * - `CardImageProps` - Image compound props
 *
 * **Configuration Constants:**
 * - `CARD_DEFAULTS` - Default prop values
 * - `PADDING_MAP` - Size to padding mapping
 * - `SHADOW_MAP` - Shadow intensity mapping
 * - `RADIUS_MAP` - Border radius mapping
 *
 * @example Type Usage
 * ```tsx
 * import type { CardProps, CardVariant } from '@rottay/design-system';
 *
 * const variant: CardVariant = 'elevated';
 * ```
 *
 * @see {@link Card} for the main component
 * @module CardTypes
 * @category Display
 * @package @rottay/design-system
 */

import type { ReactNode } from 'react';
import type { BaseComponentProps, Size, WithChildren, ClickableProps, ShadowedProps, BorderedProps } from '../../../../../foundation/contracts/kernel/common';
import type { EngineAwareProps } from '../../../../../foundation/contracts/runtime/engine';
import type { ResponsiveValue } from '@/foundation/contracts/kernel/responsive/values';

/** Card size type alias derived from the global Size scale. */
export type CardSize = Size;

/**
 * Card variants - specific to Card component.
 */
export type CardVariant = 'elevated' | 'outlined' | 'filled' | 'ghost';

/**
 * Card color variants for semantic styling.
 * Applies a colored left border and subtle background tint.
 */
export type CardColorVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';

/**
 * Card component props.
 */
export interface CardProps extends BaseComponentProps, EngineAwareProps, WithChildren, ClickableProps, ShadowedProps, BorderedProps {
  /**
   * Card size.
   * @default 'md'
   */
  size?: CardSize;

  /**
   * Card visual variant.
   * @default 'elevated'
   */
  variant?: CardVariant;

  /**
   * Card color variant for semantic styling.
   * Applies a colored left border and subtle background tint.
   * @default 'default'
   */
  colorVariant?: CardColorVariant;

  /**
   * Card title.
   */
  title?: ReactNode;

  /**
   * Card description/subtitle.
   */
  description?: ReactNode;

  /**
   * Cover image URL.
   */
  cover?: string;

  /**
   * Cover image position.
   * @default 'top'
   */
  coverPosition?: 'top' | 'bottom' | 'left' | 'right';

  /**
   * Card actions (buttons, links, etc).
   */
  actions?: ReactNode[];

  /**
   * Extra content for the header area.
   */
  extra?: ReactNode;

  /**
   * Whether the card is in loading state.
   */
  loading?: boolean;

  /**
   * Whether the card has a hover effect.
   * @default false
   */
  hoverable?: boolean;

  /**
   * Whether the card can be selected.
   */
  selectable?: boolean;

  /**
   * Whether the card is selected.
   */
  selected?: boolean;

  /**
   * Selection change callback.
   */
  onSelect?: (selected: boolean) => void;

  /**
   * Card border radius.
   * @default 'md'
   */
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl';

  /**
   * Card content padding. Accepts a plain value or a responsive breakpoint object.
   * @default 'md'
   * @example
   * ```tsx
   * <Card padding="lg" />
   * <Card padding={{ base: 'sm', md: 'md', xl: 'lg' }} />
   * ```
   */
  padding?: ResponsiveValue<'none' | 'sm' | 'md' | 'lg'>;

  /**
   * Whether to show a divider between header and body.
   * @default false
   */
  divider?: boolean;

  /**
   * Card background color.
   */
  backgroundColor?: string;
}

/**
 * Card.Header component props.
 */
export interface CardHeaderProps extends BaseComponentProps, WithChildren {
  /**
   * Header title.
   */
  title?: ReactNode;

  /**
   * Header subtitle.
   */
  subtitle?: ReactNode;

  /**
   * Header avatar or icon.
   */
  avatar?: ReactNode;

  /**
   * Extra content (typically on the right).
   */
  extra?: ReactNode;

  /**
   * Whether to show a divider below the header.
   * @default false
   */
  divider?: boolean;

  /**
   * Header padding.
   * @default 'md'
   */
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

/**
 * Card.Body component props.
 */
export interface CardBodyProps extends BaseComponentProps, WithChildren {
  /**
   * Body padding.
   * @default 'md'
   */
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

/**
 * Card.Footer component props.
 */
export interface CardFooterProps extends BaseComponentProps, WithChildren {
  /**
   * Footer actions (array of elements).
   */
  actions?: ReactNode[];

  /**
   * Whether to show a divider above the footer.
   * @default false
   */
  divider?: boolean;

  /**
   * Footer padding.
   * @default 'md'
   */
  padding?: 'none' | 'sm' | 'md' | 'lg';

  /**
   * Actions alignment.
   * @default 'end'
   */
  align?: 'start' | 'center' | 'end' | 'space-between';
}

/**
 * Card.Cover component props (cover image).
 */
export interface CardCoverProps extends BaseComponentProps {
  /**
   * Image URL.
   */
  src: string;

  /**
   * Alternative text.
   */
  alt?: string;

  /**
   * Image height.
   */
  height?: number | string;

  /**
   * Whether the image covers full width.
   * @default true
   */
  fullWidth?: boolean;

  /**
   * Image object-fit.
   * @default 'cover'
   */
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';

  /**
   * Image load error callback.
   */
  onError?: () => void;

  /**
   * Image load success callback.
   */
  onLoad?: () => void;
}

/**
 * Card.Meta component props (card metadata).
 */
export interface CardMetaProps extends BaseComponentProps {
  /**
   * Meta avatar.
   */
  avatar?: ReactNode;

  /**
   * Meta title.
   */
  title?: ReactNode;

  /**
   * Meta description.
   */
  description?: ReactNode;
}

/**
 * Card.Image component props.
 */
export interface CardImageProps extends BaseComponentProps {
  /**
   * Image source URL.
   */
  src: string;

  /**
   * Image alt text.
   */
  alt: string;

  /**
   * Image height.
   * @default 200
   */
  height?: number | string;

  /**
   * Object fit behavior.
   * @default 'cover'
   */
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';

  /**
   * Image position relative to card.
   * @default 'top'
   */
  position?: 'top' | 'bottom' | 'cover';

  /**
   * Overlay content to show on top of the image.
   */
  overlay?: ReactNode;

  /**
   * Whether to show a gradient overlay.
   * @default false
   */
  gradient?: boolean;

  /**
   * Border radius for the image.
   * @default 'inherit'
   */
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'inherit';

  /**
   * Image load success callback.
   */
  onLoad?: () => void;

  /**
   * Image load error callback.
   */
  onError?: (error: Error) => void;
}

/**
 * Default values for Card component properties.
 * These defaults align with the design system specifications.
 *
 * @constant
 * @type {Object}
 * @property {string} variant - Default visual variant ('elevated')
 * @property {string} size - Default size ('md')
 * @property {string} shadow - Default shadow level ('md')
 * @property {string} padding - Default content padding ('md')
 * @property {boolean} hoverable - Whether card shows hover effects
 * @property {boolean} clickable - Whether card is clickable
 * @property {boolean} bordered - Whether card has a border
 * @property {boolean} loading - Whether card shows loading state
 * @property {string} radius - Default border radius ('md')
 */
export const CARD_DEFAULTS = {
  variant: 'elevated' as const,
  colorVariant: 'default' as const,
  size: 'md' as const,
  shadow: 'md' as const,
  padding: 'md' as const,
  hoverable: false,
  clickable: false,
  bordered: true,
  loading: false,
  radius: 'md' as const,
};

/**
 * Mapping of padding size names to CSS variable references.
 * Corresponds to CSS custom properties defined in design tokens.
 *
 * @constant
 * @type {Record<string, string>}
 * @example
 * // Access padding value
 * const padding = PADDING_MAP['md']; // 'var(--ds-card-md-padding)'
 */
export const PADDING_MAP: Record<string, string> = {
  none: '0',
  sm: 'var(--ds-card-sm-padding, 12px)',
  md: 'var(--ds-card-md-padding, 16px)',
  lg: 'var(--ds-card-lg-padding, 24px)',
};

/**
 * Mapping of shadow intensity names to CSS variable references.
 * Provides consistent elevation across the design system.
 *
 * @constant
 * @type {Record<string, string>}
 * @example
 * // Apply shadow style
 * style={{ boxShadow: SHADOW_MAP['md'] }}
 */
export const SHADOW_MAP: Record<string, string> = {
  none: 'none',
  sm: 'var(--ds-card-shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05))',
  md: 'var(--ds-card-shadow, 0 4px 6px -1px rgba(0, 0, 0, 0.1))',
  lg: 'var(--ds-card-shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1))',
  xl: 'var(--ds-card-shadow-xl, 0 20px 25px -5px rgba(0, 0, 0, 0.1))',
};

/**
 * Mapping of border radius names to CSS variable references.
 * Ensures consistent rounded corners throughout the design system.
 *
 * @constant
 * @type {Record<string, string>}
 * @example
 * // Apply border radius
 * style={{ borderRadius: RADIUS_MAP['lg'] }}
 */
export const RADIUS_MAP: Record<string, string> = {
  none: '0',
  sm: 'var(--ds-card-radius-sm, 4px)',
  md: 'var(--ds-card-radius, 12px)',
  lg: 'var(--ds-card-radius-lg, 12px)',
  xl: 'var(--ds-card-radius-xl, 16px)',
};

/**
 * Mapping of color variants to CSS styles.
 * Each variant provides a semantic frame color and background tint.
 *
 * @constant
 * @type {Record<string, { borderColor: string; background: string }>}
 */
export const COLOR_VARIANT_MAP: Record<string, { borderColor: string; background: string }> = {
  /** No color accent - standard card appearance. */
  default: {
    borderColor: 'transparent',
    background: 'transparent',
  },
  /** Primary brand accent - left border + subtle tinted background. */
  primary: {
    borderColor: 'var(--ds-color-primary-500, #3b82f6)',
    background: 'var(--ds-color-primary-50, rgba(59, 130, 246, 0.05))',
  },
  /** Success accent for positive content (e.g., completion, approval). */
  success: {
    borderColor: 'var(--ds-color-success-500, #22c55e)',
    background: 'var(--ds-color-success-50, rgba(34, 197, 94, 0.05))',
  },
  /** Warning accent for cautionary content (e.g., expiring, degraded). */
  warning: {
    borderColor: 'var(--ds-color-warning-500, #f59e0b)',
    background: 'var(--ds-color-warning-50, rgba(245, 158, 11, 0.05))',
  },
  /** Error accent for critical content (e.g., failures, blocked). */
  error: {
    borderColor: 'var(--ds-color-error-500, #ef4444)',
    background: 'var(--ds-color-error-50, rgba(239, 68, 68, 0.05))',
  },
  /** Informational accent for neutral-positive notices. */
  info: {
    borderColor: 'var(--ds-color-info-500, #3b82f6)',
    background: 'var(--ds-color-info-50, rgba(59, 130, 246, 0.05))',
  },
};
