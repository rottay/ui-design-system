/**
 * @fileoverview Card Component Type Definitions
 * @description Centralized type exports and default values for the Card component.
 * Re-exports types from the centralized type system and provides component-specific defaults.
 *
 * @module Card/types
 * @package @es-rottay/designsystem-core
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
 * Mapping of padding size names to pixel values.
 * Corresponds to CSS custom properties defined in design tokens.
 *
 * @constant
 * @type {Record<string, number>}
 * @example
 * // Access padding value
 * const paddingPx = PADDING_MAP['md']; // 16
 */
export const PADDING_MAP: Record<string, number> = {
  none: 0,
  sm: 12,   // --card-sm-padding: 0.75rem
  md: 16,   // --card-md-padding: 1rem
  lg: 24,   // --card-lg-padding: 1.5rem
};

/**
 * Mapping of shadow intensity names to CSS box-shadow values.
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
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
};

/**
 * Mapping of border radius names to CSS values.
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
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
};
