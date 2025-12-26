/**
 * Button - Base Component
 * Uses CSS variables from design tokens for consistent styling
 */

'use client';

import React, { forwardRef } from 'react';
import type { ButtonProps } from '../types';
import { BUTTON_DEFAULTS, SIZE_MAP, VARIANT_MAP, SHAPE_MAP } from '../types';

/**
 * Loading spinner component
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
 * Base Button component using CSS variables.
 * This is extended by engine-specific implementations.
 */
export const BaseButton = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    const {
      children,
      size = BUTTON_DEFAULTS.size,
      variant = BUTTON_DEFAULTS.variant,
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
      onClick,
      className = '',
      style = {},
      ...rest
    } = props;

    // fullWidth is an alias for block
    const isFullWidth = fullWidth ?? block;

    // Get size configuration
    const sizeConfig = SIZE_MAP[size as keyof typeof SIZE_MAP] || SIZE_MAP.md;

    // Get variant colors (danger overrides)
    const effectiveVariant = danger ? 'danger' : (variant || 'primary');
    const variantConfig = VARIANT_MAP[effectiveVariant as keyof typeof VARIANT_MAP] || VARIANT_MAP.primary;

    // Get shape border radius
    const shapeRadius = SHAPE_MAP[shape as keyof typeof SHAPE_MAP] || SHAPE_MAP.default;

    // Build CSS variables for the button
    const buttonVars: React.CSSProperties = {
      '--button-height': `${sizeConfig.height}px`,
      '--button-padding': sizeConfig.padding,
      '--button-font-size': `${sizeConfig.fontSize}px`,
      '--button-bg': variantConfig.bg,
      '--button-color': variantConfig.color,
      '--button-border-color': variantConfig.borderColor,
      '--button-hover-bg': variantConfig.hoverBg,
      '--button-radius': shapeRadius,
      '--button-transition': 'var(--button-transition, all 0.2s ease)',
    } as React.CSSProperties;

    // Computed styles
    const buttonStyle: React.CSSProperties = {
      ...buttonVars,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 'var(--button-gap, 8px)',
      height: 'var(--button-height)',
      padding: shape === 'circle' ? '0' : 'var(--button-padding)',
      width: isFullWidth ? '100%' : (shape === 'circle' ? 'var(--button-height)' : 'auto'),
      minWidth: shape === 'circle' ? 'var(--button-height)' : 'auto',
      fontSize: 'var(--button-font-size)',
      fontWeight: 'var(--button-font-weight, 500)',
      fontFamily: 'inherit',
      lineHeight: 1.5,
      textAlign: 'center',
      textDecoration: variant === 'link' ? 'none' : 'none',
      whiteSpace: 'nowrap',
      verticalAlign: 'middle',
      backgroundColor: 'var(--button-bg)',
      color: 'var(--button-color)',
      border: variant === 'dashed'
        ? '1px dashed var(--button-border-color)'
        : '1px solid var(--button-border-color)',
      borderRadius: 'var(--button-radius)',
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      transition: 'var(--button-transition)',
      outline: 'none',
      boxSizing: 'border-box',
      userSelect: 'none',
      touchAction: 'manipulation',
      ...style,
    };

    // Handle icon positioning
    const renderIcon = icon && !loading ? icon : null;
    const renderPrefix = prefix && !loading ? prefix : null;
    const renderSuffix = suffix ? suffix : null;

    // Build class names
    const classNames = [
      'rottay-button',
      `rottay-button--${size}`,
      `rottay-button--${effectiveVariant}`,
      `rottay-button--${shape}`,
      isFullWidth && 'rottay-button--block',
      loading && 'rottay-button--loading',
      disabled && 'rottay-button--disabled',
      className,
    ].filter(Boolean).join(' ');

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading) {
        e.preventDefault();
        return;
      }
      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        type={htmlType}
        className={classNames}
        style={buttonStyle}
        disabled={disabled || loading}
        onClick={handleClick}
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

BaseButton.displayName = 'BaseButton';
