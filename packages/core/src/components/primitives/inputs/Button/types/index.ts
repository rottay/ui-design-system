/**
 * Button - Core Interface
 * Re-exports from centralized types
 */

export type {
  ButtonProps,
  ButtonSize,
  ButtonVariant,
  ButtonShape,
  ButtonHtmlType,
  ButtonGroupProps,
  IconButtonProps,
  ButtonLoadingConfig,
} from '../../../../../types/primitives/inputs/Button';

// Default values
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

// Size mapping to CSS variables
export const SIZE_MAP = {
  xs: { height: 'var(--button-xs-height)', padding: 'var(--button-xs-padding)', fontSize: 'var(--button-xs-font-size)' },
  sm: { height: 'var(--button-sm-height)', padding: 'var(--button-sm-padding)', fontSize: 'var(--button-sm-font-size)' },
  md: { height: 'var(--button-md-height)', padding: 'var(--button-md-padding)', fontSize: 'var(--button-md-font-size)' },
  lg: { height: 'var(--button-lg-height)', padding: 'var(--button-lg-padding)', fontSize: 'var(--button-lg-font-size)' },
  xl: { height: 'var(--button-xl-height)', padding: 'var(--button-xl-padding)', fontSize: 'var(--button-xl-font-size)' },
};

// Variant color mapping for CSS variables
export const VARIANT_MAP = {
  primary: {
    bg: 'var(--button-primary-bg, #0066CC)',
    color: 'var(--button-primary-color, #FFFFFF)',
    borderColor: 'var(--button-primary-border-color, transparent)',
    hoverBg: 'var(--button-primary-hover-bg, #0052A3)',
  },
  secondary: {
    bg: 'var(--button-secondary-bg, #F5F5F5)',
    color: 'var(--button-secondary-color, #333333)',
    borderColor: 'var(--button-secondary-border-color, #D9D9D9)',
    hoverBg: 'var(--button-secondary-hover-bg, #E8E8E8)',
  },
  outline: {
    bg: 'var(--button-outline-bg, transparent)',
    color: 'var(--button-outline-color, #0066CC)',
    borderColor: 'var(--button-outline-border-color, #0066CC)',
    hoverBg: 'var(--button-outline-hover-bg, rgba(0, 102, 204, 0.1))',
  },
  ghost: {
    bg: 'var(--button-ghost-bg, transparent)',
    color: 'var(--button-ghost-color, #333333)',
    borderColor: 'var(--button-ghost-border-color, transparent)',
    hoverBg: 'var(--button-ghost-hover-bg, rgba(0, 0, 0, 0.05))',
  },
  link: {
    bg: 'var(--button-link-bg, transparent)',
    color: 'var(--button-link-color, #0066CC)',
    borderColor: 'var(--button-link-border-color, transparent)',
    hoverBg: 'var(--button-link-hover-bg, transparent)',
  },
  danger: {
    bg: 'var(--button-danger-bg, #EF4444)',
    color: 'var(--button-danger-color, #FFFFFF)',
    borderColor: 'var(--button-danger-border-color, transparent)',
    hoverBg: 'var(--button-danger-hover-bg, #DC2626)',
  },
  default: {
    bg: 'var(--button-default-bg, #FFFFFF)',
    color: 'var(--button-default-color, #333333)',
    borderColor: 'var(--button-default-border-color, #D9D9D9)',
    hoverBg: 'var(--button-default-hover-bg, #F5F5F5)',
  },
  text: {
    bg: 'var(--button-text-bg, transparent)',
    color: 'var(--button-text-color, #333333)',
    borderColor: 'var(--button-text-border-color, transparent)',
    hoverBg: 'var(--button-text-hover-bg, rgba(0, 0, 0, 0.05))',
  },
  dashed: {
    bg: 'var(--button-dashed-bg, transparent)',
    color: 'var(--button-dashed-color, #333333)',
    borderColor: 'var(--button-dashed-border-color, #D9D9D9)',
    hoverBg: 'var(--button-dashed-hover-bg, rgba(0, 0, 0, 0.02))',
  },
};

// Shape border radius mapping
export const SHAPE_MAP = {
  default: 'var(--button-border-radius, 6px)',
  round: 'var(--button-border-radius-round, 9999px)',
  circle: 'var(--button-border-radius-circle, 50%)',
};
