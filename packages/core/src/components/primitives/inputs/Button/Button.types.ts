/**
 * @fileoverview Button Types - Rottay Design System
 * @description Type definitions, interfaces, and constants for the Button component.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * This module provides comprehensive type definitions for the Button component,
 * including all props, variants, sizes, shapes, and configuration objects.
 * Types are re-exported from the centralized type system and augmented with
 * component-specific defaults and CSS variable mappings.
 *
 * **Available Types:**
 * - `ButtonProps` - Main component props interface
 * - `ButtonSize` - Size variants (xs, sm, md, lg, xl)
 * - `ButtonVariant` - Visual style variants (primary, secondary, outline, etc.)
 * - `ButtonShape` - Shape options (default, round, circle)
 * - `ButtonGroupProps` - Props for Button.Group compound component
 * - `IconButtonProps` - Props for icon-only buttons
 *
 * **CSS Custom Properties:**
 * The type definitions include mappings to CSS variables for consistent theming:
 * - Size: `--ds-button-{size}-height`, `--ds-button-{size}-padding`, `--ds-button-{size}-font-size`
 * - Variant: `--ds-button-{variant}-bg`, `--ds-button-{variant}-color`, etc.
 * - Shape: `--ds-button-border-radius`, `--ds-button-border-radius-round`, etc.
 *
 * @example Using Types
 * ```tsx
 * import type { ButtonProps, ButtonSize, ButtonVariant } from '@rottay/design-system';
 *
 * // Custom button wrapper with typed props
 * const MyButton: React.FC<ButtonProps> = (props) => {
 *   return <Button {...props} />;
 * };
 *
 * // Typed size and variant
 * const size: ButtonSize = 'lg';
 * const variant: ButtonVariant = 'primary';
 * ```
 *
 * @example Using Constants
 * ```tsx
 * import { BUTTON_DEFAULTS, SIZE_MAP, VARIANT_MAP } from '@rottay/design-system';
 *
 * // Access default values
 * console.log(BUTTON_DEFAULTS.variant); // 'primary'
 * console.log(BUTTON_DEFAULTS.size);    // 'md'
 *
 * // Access CSS variable mappings
 * console.log(SIZE_MAP.lg.height); // 'var(--ds-button-lg-height)'
 * ```
 *
 * @see {@link Button} for the main component
 * @see {@link ButtonGroup} for grouping buttons
 * @module ButtonTypes
 * @category Inputs
 * @package @rottay/design-system
 */

// ============================================================================
// TYPE RE-EXPORTS
// Re-export types from centralized type definitions
// ============================================================================

export type {
  ButtonProps,
  ButtonSize,
  ButtonVariant,
  ButtonShape,
  ButtonHtmlType,
  ButtonGroupProps,
  IconButtonProps,
  ButtonLoadingConfig,
} from '../../../../contracts/primitives/inputs/Button';

// ============================================================================
// DEFAULT VALUES
// Default configuration values for the Button component
// ============================================================================

/**
 * Default values for Button component props.
 * These are applied when no explicit value is provided.
 *
 * @constant
 * @type {Object}
 * @property {string} variant - Default visual style ('primary')
 * @property {string} size - Default size ('md')
 * @property {string} htmlType - Default HTML button type ('button')
 * @property {string} iconPosition - Default icon position ('start')
 * @property {string} shape - Default shape ('default')
 * @property {boolean} disabled - Default disabled state (false)
 * @property {boolean} loading - Default loading state (false)
 * @property {boolean} block - Default full-width mode (false)
 * @property {boolean} danger - Default danger mode (false)
 */
export const BUTTON_DEFAULTS = {
  variant: 'primary' as const,
  size: 'md' as const,
  htmlType: 'button' as const,
  iconPosition: 'start' as const,
  shape: 'default' as const,
  disabled: false,
  loading: false,
  block: false,
  danger: false,
};

// ============================================================================
// SIZE MAPPING
// Maps size variants to CSS custom properties
// ============================================================================

/**
 * Size configuration mapping to CSS custom properties.
 * Each size variant maps to height, padding, and font-size CSS variables
 * that are defined in the tenant's theme.
 *
 * @constant
 * @type {Record<string, { height: string; padding: string; fontSize: string }>}
 *
 * @example
 * ```css
 * :root {
 *   --ds-button-md-height: 40px;
 *   --ds-button-md-padding: 0 16px;
 *   --ds-button-md-font-size: 14px;
 * }
 * ```
 */
export const SIZE_MAP = {
  xs: { height: 'var(--ds-button-xs-height)', padding: 'var(--ds-button-xs-padding)', fontSize: 'var(--ds-button-xs-font-size)' },
  sm: { height: 'var(--ds-button-sm-height)', padding: 'var(--ds-button-sm-padding)', fontSize: 'var(--ds-button-sm-font-size)' },
  md: { height: 'var(--ds-button-md-height)', padding: 'var(--ds-button-md-padding)', fontSize: 'var(--ds-button-md-font-size)' },
  lg: { height: 'var(--ds-button-lg-height)', padding: 'var(--ds-button-lg-padding)', fontSize: 'var(--ds-button-lg-font-size)' },
  xl: { height: 'var(--ds-button-xl-height)', padding: 'var(--ds-button-xl-padding)', fontSize: 'var(--ds-button-xl-font-size)' },
};

// ============================================================================
// VARIANT MAPPING
// Maps visual variants to CSS custom properties with fallback values
// ============================================================================

/**
 * Variant color configuration mapping to CSS custom properties.
 * Each variant defines background, text color, border, and hover states
 * with sensible fallback values for when CSS variables are not defined.
 *
 * @constant
 * @type {Record<string, { bg: string; color: string; borderColor: string; hoverBg: string }>}
 *
 * @example
 * ```css
 * :root {
 *   --ds-button-primary-bg: #0066CC;
 *   --ds-button-primary-color: #FFFFFF;
 *   --ds-button-primary-hover-bg: #0052A3;
 * }
 * ```
 */
export const VARIANT_MAP = {
  primary: {
    bg: 'var(--ds-button-primary-bg, #0066CC)',
    color: 'var(--ds-button-primary-color, #FFFFFF)',
    borderColor: 'var(--ds-button-primary-border, transparent)',
    hoverBg: 'var(--ds-button-primary-hover-bg, #0052A3)',
  },
  secondary: {
    bg: 'var(--ds-button-secondary-bg, #F5F5F5)',
    color: 'var(--ds-button-secondary-color, #333333)',
    borderColor: 'var(--ds-button-secondary-border, #D9D9D9)',
    hoverBg: 'var(--ds-button-secondary-hover-bg, #E8E8E8)',
  },
  outline: {
    bg: 'var(--ds-button-outline-bg, transparent)',
    color: 'var(--ds-button-outline-color, #0066CC)',
    borderColor: 'var(--ds-button-outline-border, #0066CC)',
    hoverBg: 'var(--ds-button-outline-hover-bg, rgba(0, 102, 204, 0.1))',
  },
  ghost: {
    bg: 'var(--ds-button-ghost-bg, transparent)',
    color: 'var(--ds-button-ghost-color, #333333)',
    borderColor: 'var(--ds-button-ghost-border, transparent)',
    hoverBg: 'var(--ds-button-ghost-hover-bg, rgba(0, 0, 0, 0.05))',
  },
  link: {
    bg: 'var(--ds-button-link-bg, transparent)',
    color: 'var(--ds-button-link-color, #0066CC)',
    borderColor: 'var(--ds-button-link-border, transparent)',
    hoverBg: 'var(--ds-button-link-hover-bg, transparent)',
  },
  danger: {
    bg: 'var(--ds-button-danger-bg, #EF4444)',
    color: 'var(--ds-button-danger-color, #FFFFFF)',
    borderColor: 'var(--ds-button-danger-border, transparent)',
    hoverBg: 'var(--ds-button-danger-hover-bg, #DC2626)',
  },
  default: {
    bg: 'var(--ds-button-default-bg, #FFFFFF)',
    color: 'var(--ds-button-default-color, #333333)',
    borderColor: 'var(--ds-button-default-border, #D9D9D9)',
    hoverBg: 'var(--ds-button-default-hover-bg, #F5F5F5)',
  },
  text: {
    bg: 'var(--ds-button-text-bg, transparent)',
    color: 'var(--ds-button-text-color, #333333)',
    borderColor: 'var(--ds-button-text-border, transparent)',
    hoverBg: 'var(--ds-button-text-hover-bg, rgba(0, 0, 0, 0.05))',
  },
  dashed: {
    bg: 'var(--ds-button-dashed-bg, transparent)',
    color: 'var(--ds-button-dashed-color, #333333)',
    borderColor: 'var(--ds-button-dashed-border, #D9D9D9)',
    hoverBg: 'var(--ds-button-dashed-hover-bg, rgba(0, 0, 0, 0.02))',
  },
};

// ============================================================================
// SHAPE MAPPING
// Maps shape variants to border-radius CSS custom properties
// ============================================================================

/**
 * Shape configuration mapping to border-radius CSS custom properties.
 * Controls the corner rounding of buttons for different visual styles.
 *
 * @constant
 * @type {Record<string, string>}
 *
 * @property {string} default - Standard rounded corners (6px)
 * @property {string} round - Fully rounded ends (pill shape)
 * @property {string} circle - Perfect circle for icon-only buttons
 *
 * @example
 * ```css
 * :root {
 *   --ds-button-border-radius: 6px;
 *   --ds-button-border-radius-round: 9999px;
 *   --ds-button-border-radius-circle: 50%;
 * }
 * ```
 */
export const SHAPE_MAP = {
  default: 'var(--ds-button-radius, 6px)',
  round: 'var(--ds-button-radius-round, 9999px)',
  circle: 'var(--ds-button-radius-circle, 50%)',
};
