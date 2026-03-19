/**
 * @fileoverview Button Types - Rottay Design System
 * @description Type definitions, interfaces, and constants for the Button component.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * This module provides comprehensive type definitions for the Button component,
 * including all props, variants, sizes, shapes, and configuration objects.
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

import type { ReactNode, MouseEvent, ButtonHTMLAttributes } from 'react';
import type { BaseComponentProps, Size, Variant, LoadableProps, DisableableProps } from '../../../../contracts/common';
import type { EngineAwareProps } from '../../../../contracts/engine';
import type { ResponsiveValue } from '../../layout/shared/types';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/** Button size type alias derived from the global Size scale. */
export type ButtonSize = Size;

/**
 * Button variants.
 */
export type ButtonVariant = Variant | 'text' | 'link' | 'ghost' | 'dashed' | 'danger';

/**
 * Button shapes.
 */
export type ButtonShape = 'default' | 'circle' | 'round';

/**
 * Button HTML types.
 */
export type ButtonHtmlType = 'button' | 'submit' | 'reset';

/**
 * Button component props.
 */
export interface ButtonProps extends BaseComponentProps, EngineAwareProps, LoadableProps, DisableableProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'onClick' | 'prefix'> {
  /**
   * Button size. Accepts a plain value or a responsive breakpoint object.
   * @default 'md'
   * @example
   * ```tsx
   * <Button size="lg" />
   * <Button size={{ base: 'sm', md: 'md', xl: 'lg' }} />
   * ```
   */
  size?: ResponsiveValue<ButtonSize>;

  /**
   * Button color variant.
   * @default 'default'
   */
  variant?: ButtonVariant;

  /**
   * Button shape.
   * @default 'default'
   */
  shape?: ButtonShape;

  /**
   * Button HTML type.
   * @default 'button'
   */
  htmlType?: ButtonHtmlType;

  /**
   * Icon to show in the button.
   */
  icon?: ReactNode;

  /**
   * Icon position.
   * @default 'start'
   */
  iconPosition?: 'start' | 'end';

  /**
   * Whether the button takes full available width.
   */
  block?: boolean;

  /**
   * Whether the button takes full width of its container.
   * Alias for `block` prop.
   */
  fullWidth?: boolean;

  /**
   * Whether the button has danger/destructive state.
   */
  danger?: boolean;

  /**
   * Click callback.
   */
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;

  /**
   * Button content (text, nodes, etc).
   */
  children?: ReactNode;

  /**
   * Whether the button should render as a different component.
   * Useful for composition (e.g., render as <Link>).
   */
  asChild?: boolean;

  /**
   * URL if the button acts as a link.
   */
  href?: string;

  /**
   * Target if the button acts as a link.
   */
  target?: '_blank' | '_self' | '_parent' | '_top';

  /**
   * Button border radius.
   * @default 'md'
   */
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'full';

  /**
   * Whether the button has a shadow.
   */
  shadow?: boolean;

  /**
   * Whether the button has a gradient effect.
   */
  gradient?: boolean;

  /**
   * Whether the button pulses (animation).
   */
  pulse?: boolean;

  /**
   * Whether the button has a border.
   * Only applies to certain variants.
   */
  bordered?: boolean;

  /**
   * Prefix before content (alternative to icon with position='start').
   */
  prefix?: ReactNode;

  /**
   * Suffix after content (alternative to icon with position='end').
   */
  suffix?: ReactNode;
}

/**
 * Button.Group component props.
 */
export interface ButtonGroupProps extends BaseComponentProps {
  /**
   * Button group size.
   */
  size?: ButtonSize;

  /**
   * Button group variant.
   */
  variant?: ButtonVariant;

  /**
   * Button group shape.
   */
  shape?: ButtonShape;

  /**
   * Button group children.
   */
  children: ReactNode;

  /**
   * Group orientation.
   * @default 'horizontal'
   */
  orientation?: 'horizontal' | 'vertical';

  /**
   * Whether buttons are connected (no space between them).
   * @default true
   */
  connected?: boolean;
}

/**
 * IconButton component props (icon-only button).
 */
export interface IconButtonProps extends Omit<ButtonProps, 'icon' | 'iconPosition' | 'children'> {
  /**
   * Button icon.
   */
  icon: ReactNode;

  /**
   * Accessibility label.
   */
  'aria-label': string;

  /**
   * Tooltip to show on hover.
   */
  tooltip?: string;
}

/**
 * Button loading configuration.
 */
export interface ButtonLoadingConfig {
  /** Whether loading */
  loading: boolean;
  /** Text during loading */
  loadingText?: string;
  /** Custom loading icon */
  loadingIcon?: ReactNode;
  /** Whether to disable during loading */
  disableWhileLoading?: boolean;
}

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
