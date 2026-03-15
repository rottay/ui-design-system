/**
 * @fileoverview Button Rustic Engine - Rottay Design System
 * @description Pure HTML/CSS implementation of the Button component.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * The Rustic engine provides a headless button implementation using only
 * native HTML elements and CSS custom properties. This offers maximum
 * flexibility for custom styling and ensures accessibility compliance.
 *
 * **Key Features:**
 * - Zero UI library dependencies
 * - Full CSS custom property theming
 * - Native HTML button and anchor element support
 * - Built-in hover, focus, and active states
 * - Loading spinner with CSS animation
 * - Link support via `href` prop (renders as anchor)
 *
 * **Additional Props (Rustic-specific):**
 * - `shadow` - Adds box-shadow for elevated appearance
 * - `gradient` - Applies gradient background
 * - `pulse` - Adds pulsing animation for attention
 * - `bordered` - Forces visible border
 *
 * **CSS Custom Properties:**
 * All styling is controlled via CSS variables, making it easy to theme:
 * - `--ds-button-{variant}-bg` - Background colors
 * - `--ds-button-{variant}-color` - Text colors
 * - `--ds-button-{size}-height` - Heights per size
 * - `--ds-button-transition` - Transition timing
 *
 * **Accessibility:**
 * - Proper ARIA attributes (aria-disabled, aria-busy)
 * - Keyboard navigation support
 * - Focus visible styles
 *
 * @example Using Rustic Engine
 * ```tsx
 * import { Button } from '@rottay/design-system';
 *
 * // Explicit Rustic engine
 * <Button engine="rustic" variant="primary">
 *   Vanilla Button
 * </Button>
 *
 * // With Rustic-specific features
 * <Button
 *   engine="rustic"
 *   variant="primary"
 *   shadow
 *   gradient
 *   pulse
 * >
 *   Attention!
 * </Button>
 *
 * // As a link
 * <Button
 *   engine="rustic"
 *   variant="link"
 *   href="/dashboard"
 *   target="_blank"
 * >
 *   Go to Dashboard
 * </Button>
 * ```
 *
 * @see {@link Button} for the main component
 * @see {@link ClassicButton} for Ant Design implementation
 * @see {@link ModernButton} for DaisyUI implementation
 * @module RusticButton
 * @category Inputs
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef, useState } from 'react';
import type { ButtonProps } from '../Button.types';
import { BUTTON_DEFAULTS, SIZE_MAP, VARIANT_MAP, SHAPE_MAP } from '../Button.types';

/**
 * Loading spinner component for Rustic engine
 */
const LoadingSpinner: React.FC<{ size?: string }> = ({ size = 'md' }) => {
  const spinnerSize = size === 'xs' || size === 'sm' ? 12 : size === 'lg' || size === 'xl' ? 18 : 14;

  return (
    <svg
      className="rottay-button__spinner"
      width={spinnerSize}
      height={spinnerSize}
      viewBox="0 0 24 24"
      fill="none"
      style={{
        animation: 'rottay-button-spin 1s linear infinite',
      }}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="31.416"
        strokeDashoffset="10"
        opacity="0.25"
      />
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="31.416"
        strokeDashoffset="25"
      />
    </svg>
  );
};

/**
 * Rustic Button - Pure HTML/CSS implementation
 * Uses CSS variables for theming without any UI library dependencies
 */
const RusticButton = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    const {
      children,
      variant = BUTTON_DEFAULTS.variant,
      size = BUTTON_DEFAULTS.size,
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
      gradient,
      pulse,
      bordered,
      href,
      target,
      onClick,
      className = '',
      style = {},
      ...rest
    } = props;

    // fullWidth is an alias for block
    const isFullWidth = fullWidth ?? block;

    const [isHovered, setIsHovered] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [isActive, setIsActive] = useState(false);

    // Get size configuration
    const sizeConfig = SIZE_MAP[size as keyof typeof SIZE_MAP] || SIZE_MAP.md;

    // Get variant colors (danger overrides)
    const effectiveVariant = danger ? 'danger' : (variant || 'primary');
    const variantConfig = VARIANT_MAP[effectiveVariant as keyof typeof VARIANT_MAP] || VARIANT_MAP.primary;

    // Get shape border radius
    const shapeRadius = SHAPE_MAP[shape as keyof typeof SHAPE_MAP] || SHAPE_MAP.default;

    // Build CSS variables for the button
    const buttonVars: React.CSSProperties = {
      '--ds-button-height': sizeConfig.height,
      '--ds-button-padding': sizeConfig.padding,
      '--ds-button-font-size': sizeConfig.fontSize,
      '--ds-button-bg': variantConfig.bg,
      '--ds-button-color': variantConfig.color,
      '--ds-button-border-color': variantConfig.borderColor,
      '--ds-button-hover-bg': variantConfig.hoverBg,
      '--ds-button-radius': shapeRadius,
      '--ds-button-transition': 'color 0.15s, background-color 0.15s, border-color 0.15s, box-shadow 0.2s, transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
    } as React.CSSProperties;

    // Compute effective background with hover state
    const effectiveBg = isHovered && !disabled && !loading
      ? variantConfig.hoverBg
      : variantConfig.bg;

    // Computed styles
    const buttonStyle: React.CSSProperties = {
      ...buttonVars,
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      height: sizeConfig.height,
      padding: shape === 'circle' ? '0' : sizeConfig.padding,
      width: isFullWidth ? '100%' : (shape === 'circle' ? sizeConfig.height : 'auto'),
      minWidth: shape === 'circle' ? sizeConfig.height : 'auto',
      fontSize: sizeConfig.fontSize,
      fontWeight: 500,
      fontFamily: 'inherit',
      lineHeight: 1.5,
      textAlign: 'center',
      textDecoration: effectiveVariant === 'link' ? (isHovered ? 'underline' : 'none') : 'none',
      whiteSpace: 'nowrap',
      verticalAlign: 'middle',
      background: gradient
        ? 'linear-gradient(135deg, var(--ds-button-bg) 0%, var(--ds-button-hover-bg) 100%)'
        : effectiveBg,
      color: variantConfig.color,
      border: effectiveVariant === 'dashed'
        ? `1px dashed ${variantConfig.borderColor}`
        : bordered || ['outline', 'secondary', 'default'].includes(effectiveVariant)
          ? `1px solid ${variantConfig.borderColor}`
          : '1px solid transparent',
      borderRadius: shapeRadius,
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      transition: 'var(--ds-button-transition, color 0.15s, background-color 0.15s, border-color 0.15s, box-shadow 0.2s, transform 0.15s cubic-bezier(0.16, 1, 0.3, 1))',
      outline: 'none',
      boxSizing: 'border-box',
      userSelect: 'none',
      touchAction: 'manipulation',
      boxShadow: isFocused
        ? 'var(--ds-button-focus-ring, 0 0 0 3px var(--ds-color-primary-200)), 0 0 12px rgba(0, 102, 204, 0.15)'
        : shadow || (isHovered && !disabled && !loading)
          ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          : 'none',
      transform:
        isActive && !disabled && !loading
          ? 'var(--ds-button-active-transform, scale(0.97))'
          : isHovered && !disabled && !loading
            ? 'var(--ds-button-hover-transform, translateY(-1px) scale(1.01))'
            : 'translateY(0) scale(1)',
      animation: pulse ? 'rottay-button-pulse 2s infinite' : 'none',
      ...style,
    };

    // Build class names
    const classNames = [
      'rottay-button',
      'rottay-button--rustic',
      `rottay-button--${size}`,
      `rottay-button--${effectiveVariant}`,
      `rottay-button--${shape}`,
      isFullWidth && 'rottay-button--block',
      loading && 'rottay-button--loading',
      disabled && 'rottay-button--disabled',
      shadow && 'rottay-button--shadow',
      gradient && 'rottay-button--gradient',
      className,
    ].filter(Boolean).join(' ');

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading) {
        e.preventDefault();
        return;
      }
      onClick?.(e);
    };

    // Handle icon positioning
    const renderIcon = icon && !loading ? icon : null;
    const renderPrefix = prefix && !loading ? prefix : null;
    const renderSuffix = suffix ? suffix : null;

    // If href is provided, render as anchor
    if (href && !disabled && !loading) {
      return (
        <a
          href={href}
          target={target}
          className={classNames}
          style={buttonStyle}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => { setIsHovered(false); setIsActive(false); }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onMouseDown={() => setIsActive(true)}
          onMouseUp={() => setIsActive(false)}
        >
          {loading && <LoadingSpinner size={size} />}
          {!loading && iconPosition === 'start' && renderIcon}
          {!loading && renderPrefix}
          {children && <span className="rottay-button__content">{children}</span>}
          {renderSuffix}
          {!loading && iconPosition === 'end' && renderIcon}
        </a>
      );
    }

    return (
      <button
        ref={ref}
        type={htmlType}
        className={classNames}
        style={buttonStyle}
        disabled={disabled || loading}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => { setIsHovered(false); setIsActive(false); }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onMouseDown={() => setIsActive(true)}
        onMouseUp={() => setIsActive(false)}
        aria-disabled={disabled || loading}
        aria-busy={loading}
        {...rest}
      >
        {loading && <LoadingSpinner size={size} />}
        {!loading && iconPosition === 'start' && renderIcon}
        {!loading && renderPrefix}
        {children && <span className="rottay-button__content">{children}</span>}
        {renderSuffix}
        {!loading && iconPosition === 'end' && renderIcon}
      </button>
    );
  }
);

RusticButton.displayName = 'RusticButton';

export default RusticButton;
