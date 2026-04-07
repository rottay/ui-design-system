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
    background: 'var(--ds-color-primary)',
    color: 'var(--ds-color-text-on-primary)',
    border: '1px solid var(--ds-color-primary)',
  },
  secondary: {
    background: 'transparent',
    color: 'var(--ds-color-text-primary)',
    border: '1px solid var(--ds-color-border)',
  },
  default: {
    background: 'transparent',
    color: 'var(--ds-color-text-primary)',
    border: '1px solid var(--ds-color-border)',
  },
  outline: {
    background: 'transparent',
    color: 'var(--ds-color-text-primary)',
    border: '1px solid var(--ds-color-border)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--ds-color-text-primary)',
    border: '1px solid transparent',
  },
  text: {
    background: 'transparent',
    color: 'var(--ds-color-text-primary)',
    border: '1px solid transparent',
  },
  dashed: {
    background: 'transparent',
    color: 'var(--ds-color-text-primary)',
    border: '1px dashed var(--ds-color-border)',
  },
  danger: {
    background: 'var(--ds-color-error)',
    color: 'var(--ds-color-text-on-primary)',
    border: '1px solid var(--ds-color-error)',
  },
  link: {
    background: 'transparent',
    color: 'var(--ds-color-primary)',
    border: '1px solid transparent',
  },
};

// Hover style overrides per variant
const VARIANT_HOVER_STYLES: Record<string, React.CSSProperties> = {
  primary: {
    filter: 'brightness(1.1)',
  },
  secondary: {
    background: 'var(--ds-color-bg-subtle, rgba(0,0,0,0.04))',
  },
  default: {
    background: 'var(--ds-color-bg-subtle, rgba(0,0,0,0.04))',
  },
  outline: {
    background: 'var(--ds-color-bg-subtle, rgba(0,0,0,0.04))',
  },
  ghost: {
    background: 'var(--ds-color-bg-subtle, rgba(0,0,0,0.05))',
  },
  text: {
    background: 'var(--ds-color-bg-subtle, rgba(0,0,0,0.05))',
  },
  dashed: {
    background: 'var(--ds-color-bg-subtle, rgba(0,0,0,0.02))',
  },
  danger: {
    filter: 'brightness(1.1)',
  },
  link: {
    textDecoration: 'underline',
  },
};

// ---------------------------------------------------------------------------
// Size style mapping (pure inline styles, no DaisyUI)
// ---------------------------------------------------------------------------
const SIZE_STYLES: Record<string, React.CSSProperties> = {
  xs: { height: 24, padding: '0 8px', fontSize: 12 },
  sm: { height: 32, padding: '0 12px', fontSize: 13 },
  md: { height: 36, padding: '0 16px', fontSize: 14 },
  lg: { height: 44, padding: '0 20px', fontSize: 16 },
  xl: { height: 52, padding: '0 24px', fontSize: 18 },
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
        animation: 'rottay-button-spin 0.8s linear infinite',
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

  // Explicit `danger` prop takes priority over `variant`
  const effectiveVariant = danger ? 'danger' : (variant || 'primary');

  // -------------------------------------------------------------------------
  // Class names (no DaisyUI btn-* classes)
  // -------------------------------------------------------------------------
  const classes = [
    'rottay-button',
    'rottay-button--modern',
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
    const dim = sizeStyle.height ?? 36;
    shapeStyle.borderRadius = '50%';
    shapeStyle.width = dim;
    shapeStyle.height = dim;
    shapeStyle.padding = '0';
  } else if (shape === 'round') {
    shapeStyle.borderRadius = 'var(--ds-radius-full, 9999px)';
  } else {
    shapeStyle.borderRadius = 'var(--ds-radius-md, 8px)';
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
    gap: '6px',
    width: isFullWidth ? '100%' : undefined,
    cursor: isInert ? (loading ? 'wait' : 'not-allowed') : 'pointer',
    fontWeight: 500,
    lineHeight: 1,
    textDecoration: 'none',
    whiteSpace: isFullWidth ? 'normal' : 'nowrap',
    userSelect: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    letterSpacing: '0.01em',

    // Variant base styles
    ...variantStyle,

    // Size styles (unless responsive)
    ...sizeStyle,

    // Shape styles
    ...shapeStyle,

    // Transitions
    transition: [
      `transform var(--ds-motion-fast, 150ms) var(--ds-motion-ease-out, cubic-bezier(0.16, 1, 0.3, 1))`,
      `box-shadow var(--ds-motion-fast, 150ms) var(--ds-motion-ease-out, cubic-bezier(0.16, 1, 0.3, 1))`,
      `opacity var(--ds-motion-fast, 150ms) var(--ds-motion-ease-out, cubic-bezier(0.16, 1, 0.3, 1))`,
      `background-color var(--ds-motion-fast, 150ms) var(--ds-motion-ease-out, cubic-bezier(0.16, 1, 0.3, 1))`,
      `border-color var(--ds-motion-fast, 150ms) var(--ds-motion-ease-out, cubic-bezier(0.16, 1, 0.3, 1))`,
      `filter var(--ds-motion-fast, 150ms) var(--ds-motion-ease-out, cubic-bezier(0.16, 1, 0.3, 1))`,
      `text-decoration var(--ds-motion-fast, 150ms) var(--ds-motion-ease-out, cubic-bezier(0.16, 1, 0.3, 1))`,
    ].join(', '),

    // Transform: active press > hover (none) > idle
    transform:
      isActive && !isInert
        ? 'scale(0.98)'
        : undefined,

    // Hover shadow for elevated variants
    boxShadow:
      isHovered && !isInert && isElevatedVariant
        ? 'var(--ds-elevation-1, 0 1px 2px 0 rgba(0, 0, 0, 0.05))'
        : shadow
          ? 'var(--ds-elevation-1, 0 1px 3px 0 rgba(0, 0, 0, 0.1))'
          : undefined,

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

    // Disabled state
    ...(isInert && !loading ? {
      opacity: 0.5,
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
            gap: '6px',
            width: isFullWidth ? '100%' : undefined,
            minWidth: 0,
            whiteSpace: isFullWidth ? 'normal' : 'nowrap',
            transition: `opacity var(--ds-motion-fast, 150ms) var(--ds-motion-ease-out, cubic-bezier(0.16, 1, 0.3, 1))`,
            ...contentOpacity,
          }}
        >
          {startContent || prefix}
          {children && (
            <span
              style={{
                display: isFullWidth ? 'block' : 'inline',
                flex: isFullWidth ? '1 1 auto' : undefined,
                width: isFullWidth ? '100%' : undefined,
                minWidth: 0,
                whiteSpace: isFullWidth ? 'normal' : 'inherit',
              }}
            >
              {children}
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
