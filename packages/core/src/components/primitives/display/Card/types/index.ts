/**
 * @fileoverview Card Types - Rottay Design System
 * @description Type definitions for the Card component.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This module re-exports types from the centralized types definition
 * and provides default values and configuration maps for the Card component.
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

export type {
  CardProps,
  CardSize,
  CardVariant,
  CardHeaderProps,
  CardBodyProps,
  CardFooterProps,
  CardCoverProps,
  CardMetaProps,
  CardImageProps,
} from '../../../../../types/primitives/display/Card';

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
  md: 'var(--ds-card-radius, 8px)',
  lg: 'var(--ds-card-radius-lg, 12px)',
  xl: 'var(--ds-card-radius-xl, 16px)',
};
