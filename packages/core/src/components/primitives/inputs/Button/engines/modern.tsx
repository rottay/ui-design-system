/**
 * @fileoverview Button Modern Engine - Rottay Design System
 * @description Premium-quality button implementation using CSS custom properties
 * from the modern theme token system. Inspired by Linear, Vercel, and Stripe.
 *
 * @remarks
 * The Modern engine implements buttons using pure inline styles driven by
 * --ds-* CSS custom properties. No DaisyUI btn-* classes are used. This
 * provides precise control over every interaction state while maintaining
 * the token-driven theming contract.
 *
 * **Design principles:**
 * - Precise, calm, expensive, editorial
 * - Every transition uses --ds-motion-* tokens
 * - Focus rings use --ds-focus-ring-* tokens
 * - Elevation uses --ds-elevation-* tokens
 * - Border radius uses --ds-radius-* tokens
 *
 * **Hierarchy:**
 * - Primary: Solid brand bg, high contrast, elevation on hover
 * - Secondary: Bordered with transparent bg, subtle fill on hover
 * - Ghost: No border, minimal hover bg
 * - Danger: Red-tinted, same interaction model as primary
 * - Link: Underline on hover, no background
 *
 * @see {@link Button} for the main component
 * @see {@link ClassicButton} for Ant Design implementation
 * @see {@link RusticButton} for vanilla implementation
 * @module ModernButton
 * @category Inputs
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef, useState, useId } from 'react';
import type { ButtonProps, ButtonSize } from '../Button.types';
import { BUTTON_DEFAULTS, SIZE_MAP as BUTTON_SIZE_MAP } from '../Button.types';
import { isResponsiveValue, generateResponsiveCSS, type ResponsivePropEntry } from '../../../layout/shared/responsive-props';
import type { ResponsiveValue } from '../../../layout/shared/types';
import { scalarOrUndefined } from '../../../layout/shared/responsive-helpers.js';

// ---------------------------------------------------------------------------
// Variant style mapping (pure inline styles, no DaisyUI)
// ---------------------------------------------------------------------------
const VARIANT_STYLES: Record<string, React.CSSProperties> = {
  primary: {
    background: 'var(--ds-button-primary-bg, var(--ds-color-primary))',
    color: 'var(--ds-button-primary-color, var(--ds-button-primary-text, var(--ds-color-text-on-primary)))',
    border: '1px solid var(--ds-button-primary-border, var(--ds-color-primary))',
    boxShadow: 'var(--ds-button-primary-shadow, none)',
  },
  secondary: {
    background: 'var(--ds-button-secondary-bg, transparent)',
    color: 'var(--ds-button-secondary-color, var(--ds-button-secondary-text, var(--ds-color-text-primary)))',
    border: '1px solid var(--ds-button-secondary-border, var(--ds-color-border))',
  },
  default: {
    background: 'var(--ds-button-default-bg, transparent)',
    color: 'var(--ds-button-default-color, var(--ds-button-default-text, var(--ds-color-text-primary)))',
    border: '1px solid var(--ds-button-default-border, var(--ds-color-border))',
  },
  outline: {
    background: 'var(--ds-button-default-bg, transparent)',
    color: 'var(--ds-button-default-color, var(--ds-color-text-primary))',
    border: '1px solid var(--ds-button-default-border, var(--ds-color-border))',
  },
  ghost: {
    background: 'var(--ds-button-ghost-bg, transparent)',
    color: 'var(--ds-button-ghost-color, var(--ds-button-ghost-text, var(--ds-color-text-primary)))',
    border: '1px solid transparent',
  },
  text: {
    background: 'var(--ds-button-text-bg, transparent)',
    color: 'var(--ds-button-text-color, var(--ds-button-text-text, var(--ds-color-text-primary)))',
    border: '1px solid transparent',
  },
  dashed: {
    background: 'var(--ds-button-default-bg, transparent)',
    color: 'var(--ds-button-default-color, var(--ds-color-text-primary))',
    border: '1px dashed var(--ds-button-default-border, var(--ds-color-border))',
  },
  danger: {
    background: 'var(--ds-button-error-bg, var(--ds-color-error))',
    color: 'var(--ds-button-error-color, var(--ds-button-error-text, var(--ds-color-text-on-primary)))',
    border: '1px solid var(--ds-button-error-border, var(--ds-color-error))',
  },
  success: {
    background: 'var(--ds-button-success-bg, var(--ds-color-success))',
    color: 'var(--ds-button-success-color, var(--ds-button-success-text, var(--ds-color-text-on-primary)))',
    border: '1px solid var(--ds-button-success-border, var(--ds-color-success))',
  },
  warning: {
    background: 'var(--ds-button-warning-bg, var(--ds-color-warning))',
    color: 'var(--ds-button-warning-color, var(--ds-button-warning-text, var(--ds-color-text-on-primary)))',
    border: '1px solid var(--ds-button-warning-border, var(--ds-color-warning))',
  },
  info: {
    background: 'var(--ds-button-info-bg, var(--ds-color-info))',
    color: 'var(--ds-button-info-color, var(--ds-button-info-text, var(--ds-color-text-on-primary)))',
    border: '1px solid var(--ds-button-info-border, var(--ds-color-info))',
  },
  link: {
    background: 'transparent',
    color: 'var(--ds-button-link-color, var(--ds-color-primary))',
    border: '1px solid transparent',
  },
};

// Hover style overrides per variant - uses brand compiler vars with fallbacks
const VARIANT_HOVER_STYLES: Record<string, React.CSSProperties> = {
  primary: {
    background: 'var(--ds-button-primary-bg-hover, var(--ds-color-primary))',
    boxShadow: 'var(--ds-button-primary-shadow-hover, var(--ds-elevation-2))',
  },
  secondary: {
    background: 'var(--ds-button-secondary-bg-hover, var(--ds-color-bg-subtle, rgba(0,0,0,0.04)))',
    borderColor: 'var(--ds-button-secondary-border-hover, var(--ds-color-border))',
  },
  default: {
    background: 'var(--ds-button-default-bg-hover, var(--ds-color-bg-subtle, rgba(0,0,0,0.04)))',
    borderColor: 'var(--ds-button-default-border-hover, var(--ds-color-border))',
  },
  outline: {
    background: 'var(--ds-button-default-bg-hover, var(--ds-color-bg-subtle, rgba(0,0,0,0.04)))',
  },
  ghost: {
    background: 'var(--ds-button-ghost-bg-hover, var(--ds-color-bg-subtle, rgba(0,0,0,0.05)))',
  },
  text: {
    background: 'var(--ds-button-text-bg-hover, var(--ds-color-bg-subtle, rgba(0,0,0,0.05)))',
  },
  dashed: {
    background: 'var(--ds-button-default-bg-hover, var(--ds-color-bg-subtle, rgba(0,0,0,0.02)))',
  },
  danger: {
    background: 'var(--ds-button-error-bg-hover, var(--ds-color-error))',
  },
  success: {
    background: 'var(--ds-button-success-bg-hover, var(--ds-color-success))',
  },
  warning: {
    background: 'var(--ds-button-warning-bg-hover, var(--ds-color-warning))',
  },
  info: {
    background: 'var(--ds-button-info-bg-hover, var(--ds-color-info))',
  },
  link: {
    color: 'var(--ds-button-link-color-hover, var(--ds-color-primary))',
    textDecoration: 'underline',
  },
};

// ---------------------------------------------------------------------------
// Size style mapping (pure inline styles, no DaisyUI)
// ---------------------------------------------------------------------------
const SIZE_STYLES: Record<string, React.CSSProperties> = {
  xs: { height: 'var(--ds-button-xs-height, 1.5rem)', padding: '0 var(--ds-button-xs-padding-x, 0.5rem)', fontSize: 'var(--ds-button-xs-font-size, 0.75rem)' },
  sm: { height: 'var(--ds-button-sm-height, 2rem)', padding: '0 var(--ds-button-sm-padding-x, 0.75rem)', fontSize: 'var(--ds-button-sm-font-size, 0.8125rem)' },
  md: { height: 'var(--ds-button-md-height, 2.5rem)', padding: '0 var(--ds-button-md-padding-x, 1rem)', fontSize: 'var(--ds-button-md-font-size, 0.875rem)' },
  lg: { height: 'var(--ds-button-lg-height, 2.75rem)', padding: '0 var(--ds-button-lg-padding-x, 1.25rem)', fontSize: 'var(--ds-button-lg-font-size, 0.9375rem)' },
  xl: { height: 'var(--ds-button-xl-height, 3rem)', padding: '0 var(--ds-button-xl-padding-x, 1.5rem)', fontSize: 'var(--ds-button-xl-font-size, 1rem)' },
};

// ---------------------------------------------------------------------------
// Loading spinner
// ---------------------------------------------------------------------------
/**
 * Custom SVG loading spinner. Uses currentColor so it inherits the button's
 * text color. Size-aware: smaller buttons get a smaller spinner.
 */
const LoadingSpinner: React.FC<{ size?: string }> = ({ size = 'md' }) => {
  const spinnerSize =
    size === 'xs' ? 12
    : size === 'sm' ? 14
    : size === 'lg' || size === 'xl' ? 18
    : 16;

  return (
    <svg
      width={spinnerSize}
      height={spinnerSize}
      viewBox="0 0 24 24"
      fill="none"
      style={{
        animation: 'rottay-button-spin var(--ds-motion-glacial) linear infinite',
        flexShrink: 0,
      }}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="31.416"
        strokeDashoffset="10"
        opacity="0.2"
      />
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="31.416"
        strokeDashoffset="25"
      />
    </svg>
  );
};

// ---------------------------------------------------------------------------
// ModernButton
// ---------------------------------------------------------------------------
/**
 * Premium modern button implementation.
 *
 * Uses pure inline styles driven by CSS custom properties. Every transition,
 * shadow, and focus ring references --ds-* tokens for consistent theming
 * across tenants.
 *
 * @param props - Standardized ButtonProps from the DS type contract.
 * @param ref   - Forwarded ref attached to the native `<button>` element.
 * @returns A premium-styled button with token-driven interaction animations.
 */
const ModernButton = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const {
    children,
    variant = BUTTON_DEFAULTS.variant,
    size: sizeProp = BUTTON_DEFAULTS.size,
    shape = BUTTON_DEFAULTS.shape,
    htmlType = BUTTON_DEFAULTS.htmlType,
    disabled = BUTTON_DEFAULTS.disabled,
    loading = BUTTON_DEFAULTS.loading,
    block = BUTTON_DEFAULTS.block,
    fullWidth,
    danger,
    icon,
    iconPosition = BUTTON_DEFAULTS.iconPosition,
    prefix,
    suffix,
    shadow,
    onClick,
    className = '',
    style,
    ...nativeButtonProps
  } = props;

  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isFullWidth = fullWidth ?? block;
  const isIconOnly = !children && (icon || prefix || suffix);

  // -------------------------------------------------------------------------
  // Responsive size handling
  // -------------------------------------------------------------------------
  const reactId = useId();
  const responsiveEntries: ResponsivePropEntry<any>[] = [];
  const sizeIsResponsive = isResponsiveValue(sizeProp);

  if (sizeIsResponsive) {
    responsiveEntries.push({
      cssProperty: 'height',
      value: sizeProp,
      resolve: (v: ButtonSize) => (BUTTON_SIZE_MAP[v as keyof typeof BUTTON_SIZE_MAP] || BUTTON_SIZE_MAP.md).height,
    } as ResponsivePropEntry<any>);
    responsiveEntries.push({
      cssProperty: 'padding',
      value: sizeProp,
      resolve: (v: ButtonSize) => (BUTTON_SIZE_MAP[v as keyof typeof BUTTON_SIZE_MAP] || BUTTON_SIZE_MAP.md).padding,
    } as ResponsivePropEntry<any>);
    responsiveEntries.push({
      cssProperty: 'font-size',
      value: sizeProp,
      resolve: (v: ButtonSize) => (BUTTON_SIZE_MAP[v as keyof typeof BUTTON_SIZE_MAP] || BUTTON_SIZE_MAP.md).fontSize,
    } as ResponsivePropEntry<any>);
  }

  const needsResponsiveCSS = responsiveEntries.length > 0;
  const elementId = needsResponsiveCSS ? `btn-${reactId.replace(/:/g, '')}` : '';
  const responsive = needsResponsiveCSS
    ? generateResponsiveCSS(elementId, responsiveEntries)
    : null;

  const size = scalarOrUndefined(sizeProp) ?? BUTTON_DEFAULTS.size;

  // Explicit `danger` prop takes priority over `variant`.
  // Unknown variants fall back to the public primary contract for className,
  // data attributes, and inline styles consistently.
  const requestedVariant = variant || 'primary';
  const effectiveVariant = danger
    ? 'danger'
    : VARIANT_STYLES[requestedVariant]
      ? requestedVariant
      : 'primary';

  // -------------------------------------------------------------------------
  // Class names (no DaisyUI btn-* classes)
  // -------------------------------------------------------------------------
  const classes = [
    'rottay-button',
    'rottay-button--modern',
    `rottay-button--${effectiveVariant}`,
    `rottay-button--${size}`,
    `rottay-button--${shape}`,
    isFullWidth && 'rottay-button--block',
    loading && 'rottay-button--loading',
    disabled && 'rottay-button--disabled',
    shadow && 'rottay-button--shadow',
    className,
  ].filter(Boolean).join(' ');

  // -------------------------------------------------------------------------
  // Variant + size + shape inline styles
  // -------------------------------------------------------------------------
  const variantStyle = VARIANT_STYLES[effectiveVariant] || VARIANT_STYLES.primary;
  const sizeStyle = !sizeIsResponsive ? (SIZE_STYLES[size || 'md'] || SIZE_STYLES.md) : {};
  const hoverOverrides = (isHovered && !disabled && !loading)
    ? (VARIANT_HOVER_STYLES[effectiveVariant] || {})
    : {};

  // Shape styles
  const shapeStyle: React.CSSProperties = {};
  if (shape === 'circle') {
    const dim = sizeStyle.height ?? 'var(--ds-button-md-height, 40px)';
    shapeStyle.borderRadius = '50%';
    shapeStyle.width = dim;
    shapeStyle.height = dim;
    shapeStyle.padding = '0';
  } else if (shape === 'round') {
    shapeStyle.borderRadius = 'var(--ds-radius-full, 9999px)';
  } else {
    shapeStyle.borderRadius = 'var(--ds-radius-button, var(--ds-radius-md, 8px))';
  }

  // -------------------------------------------------------------------------
  // Inline styles - interaction cascade
  // -------------------------------------------------------------------------
  const isInert = disabled || loading;

  // Determine if this variant gets an elevation shadow on hover
  const isElevatedVariant = effectiveVariant === 'primary' || effectiveVariant === 'danger';

  const interactiveStyle: React.CSSProperties = {
    // Base layout
    display: isFullWidth ? 'flex' : 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--ds-spacing-2, 8px)',
    width: isFullWidth ? '100%' : undefined,
    cursor: isInert ? (loading ? 'wait' : 'not-allowed') : 'pointer',
    fontWeight: 'var(--ds-font-weight-medium)',
    lineHeight: 1,
    textDecoration: 'none',
    whiteSpace: isFullWidth ? 'normal' : 'nowrap',
    userSelect: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    letterSpacing: 'var(--ds-letter-spacing-subtle-wide)',

    // Variant base styles
    ...variantStyle,

    // Size styles (unless responsive)
    ...sizeStyle,

    // Shape styles
    ...shapeStyle,

    // Transitions
    transition: [
      `transform var(--ds-motion-fast) var(--ds-motion-ease-out)`,
      `box-shadow var(--ds-motion-fast) var(--ds-motion-ease-out)`,
      `opacity var(--ds-motion-fast) var(--ds-motion-ease-out)`,
      `background-color var(--ds-motion-fast) var(--ds-motion-ease-out)`,
      `border-color var(--ds-motion-fast) var(--ds-motion-ease-out)`,
      `filter var(--ds-motion-fast) var(--ds-motion-ease-out)`,
      `text-decoration var(--ds-motion-fast) var(--ds-motion-ease-out)`,
    ].join(', '),

    // Transform: press = -1 step scale (tokenized) when active, else idle
    transform:
      isActive && !isInert
        ? 'scale(var(--ds-state-press-scale))'
        : undefined,

    // Resting elevation on raised buttons; hover lifts +1 step via hoverOverrides
    ...(shadow && !isHovered ? {
      boxShadow: 'var(--ds-elevation-1)',
    } : {}),

    // Focus ring: outline-based (not box-shadow, so it stacks with elevation)
    outline:
      isFocused && !isInert
        ? 'var(--ds-focus-ring-width, 2px) solid var(--ds-focus-ring-color)'
        : 'none',
    outlineOffset:
      isFocused && !isInert
        ? 'var(--ds-focus-ring-offset, 2px)'
        : undefined,

    // Hover overrides
    ...hoverOverrides,

    // Disabled state - uses brand compiler vars with fallback
    ...(isInert && !loading ? {
      background: 'var(--ds-button-disabled-bg)',
      color: 'var(--ds-button-disabled-color)',
      borderColor: 'var(--ds-button-disabled-border-color, var(--ds-button-disabled-border))',
      opacity: 'var(--ds-button-disabled-opacity, 0.6)' as unknown as number,
      pointerEvents: 'none' as const,
    } : {}),

    // Icon-only: force square aspect ratio
    ...(isIconOnly && shape !== 'circle' ? {
      aspectRatio: '1',
      padding: '0',
      justifyContent: 'center',
    } : {}),

    ...style,
  };

  // -------------------------------------------------------------------------
  // Content
  // -------------------------------------------------------------------------
  const startContent = iconPosition === 'start' ? icon : undefined;
  const endContent = iconPosition === 'end' ? icon : undefined;
  const renderedChildren = React.Children.toArray(children);

  // Content opacity when loading (smooth fade)
  const contentOpacity: React.CSSProperties = loading ? {
    opacity: 0,
    position: 'absolute' as const,
    pointerEvents: 'none' as const,
  } : {};

  return (
    <>
      {responsive && responsive.css && (
        <style dangerouslySetInnerHTML={{ __html: responsive.css }} />
      )}
      <button
        {...nativeButtonProps}
        ref={ref}
        type={htmlType}
        className={classes}
        disabled={disabled || loading}
        onClick={onClick}
        style={interactiveStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => { setIsHovered(false); setIsActive(false); }}
        onMouseDown={() => setIsActive(true)}
        onMouseUp={() => setIsActive(false)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        aria-disabled={disabled || loading}
        aria-busy={loading}
        data-variant={effectiveVariant}
        data-size={size}
        data-shape={shape}
        data-loading={loading ? 'true' : undefined}
        data-full-width={isFullWidth ? 'true' : undefined}
        data-focus-visible={isFocused && !isInert ? 'true' : undefined}
        {...(responsive ? responsive.attrs : {})}
      >
        {/* Loading spinner - centered, replaces content */}
        {loading && <LoadingSpinner size={size} />}

        {/* Content wrapper - hidden (but in DOM) during loading for layout stability */}
        <span
          style={{
            display: isFullWidth ? 'flex' : 'inline-flex',
            alignItems: 'center',
            justifyContent: isFullWidth ? 'inherit' : undefined,
            gap: 'var(--ds-spacing-2, 8px)',
            width: isFullWidth ? '100%' : undefined,
            minWidth: 0,
            whiteSpace: isFullWidth ? 'normal' : 'nowrap',
            transition: `opacity var(--ds-motion-fast) var(--ds-motion-ease-out)`,
            ...contentOpacity,
          }}
        >
          {startContent || prefix}
          {renderedChildren.length > 0 && (
            <span
              style={{
                display: isFullWidth ? 'block' : 'inline',
                flex: isFullWidth ? '1 1 auto' : undefined,
                width: isFullWidth ? '100%' : undefined,
                minWidth: 0,
                whiteSpace: isFullWidth ? 'normal' : 'inherit',
              }}
            >
              {renderedChildren}
            </span>
          )}
          {endContent || suffix}
        </span>
      </button>
    </>
  );
});

ModernButton.displayName = 'ModernButton';

export default ModernButton;
