/**
 * @fileoverview Button Modern Engine - Rottay Design System
 * @description DaisyUI/Tailwind CSS implementation of the Button component.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * The Modern engine implements buttons using DaisyUI's utility-first approach
 * with Tailwind CSS classes. This provides a lightweight alternative to Classic
 * with smaller bundle size and easier customization via CSS utilities.
 *
 * **DaisyUI Features Utilized:**
 * - Semantic color classes (btn-primary, btn-secondary, btn-error, etc.)
 * - Size modifiers (btn-xs, btn-sm, btn-lg)
 * - Shape modifiers (rounded-full, btn-circle)
 * - State classes (btn-disabled, loading)
 * - Block mode (btn-block, w-full)
 *
 * **Prop Mapping:**
 * - `variant="primary"` -> `btn-primary`
 * - `variant="secondary"` -> `btn-secondary`
 * - `variant="danger"` -> `btn-error`
 * - `variant="ghost"` -> `btn-ghost`
 * - `variant="link"` -> `btn-link`
 * - `size="xs"` -> `btn-xs`
 * - `shape="round"` -> `rounded-full`
 *
 * **Enhancements:**
 * - Hover/active/focus state tracking with interactive transforms
 * - Custom SVG spinner (matching Rustic engine quality)
 * - Explicit focus ring style using CSS variables
 * - Smooth transitions with cubic-bezier easing
 *
 * @example Using Modern Engine
 * ```tsx
 * import { Button } from '@rottay/design-system';
 *
 * // Explicit Modern engine
 * <Button engine="modern" variant="primary">
 *   DaisyUI Button
 * </Button>
 *
 * // With shadow and loading
 * <Button
 *   engine="modern"
 *   variant="secondary"
 *   shadow
 *   loading
 * >
 *   Processing...
 * </Button>
 * ```
 *
 * @see {@link Button} for the main component
 * @see {@link ClassicButton} for Ant Design implementation
 * @see {@link RusticButton} for vanilla implementation
 * @module ModernButton
 * @category Inputs
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef, useState } from 'react';
import type { ButtonProps } from '../Button.types';
import { BUTTON_DEFAULTS } from '../Button.types';

// Map our variants to DaisyUI classes
const VARIANT_CLASSES: Record<string, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  default: 'btn-neutral',
  outline: 'btn-outline btn-primary',
  ghost: 'btn-ghost',
  text: 'btn-ghost',
  dashed: 'btn-outline',
  danger: 'btn-error',
  link: 'btn-link',
};

// Map our sizes to DaisyUI classes
const SIZE_CLASSES: Record<string, string> = {
  xs: 'btn-xs',
  sm: 'btn-sm',
  md: '', // Default size, no class needed
  lg: 'btn-lg',
  xl: 'btn-lg', // DaisyUI doesn't have xl, use lg
};

// Map our shapes to DaisyUI classes
const SHAPE_CLASSES: Record<string, string> = {
  default: '',
  round: 'rounded-full',
  circle: 'btn-circle',
};

/**
 * Custom SVG loading spinner for Modern engine.
 * Matches Rustic engine quality with size-aware rendering.
 */
const LoadingSpinner: React.FC<{ size?: string }> = ({ size = 'md' }) => {
  const spinnerSize = size === 'xs' || size === 'sm' ? 12 : size === 'lg' || size === 'xl' ? 18 : 14;

  return (
    <svg
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

const ModernButton = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
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
    onClick,
    className = '',
    style,
  } = props;

  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // fullWidth is an alias for block
  const isFullWidth = fullWidth ?? block;

  // Get effective variant (danger overrides)
  const effectiveVariant = danger ? 'danger' : (variant || 'primary');

  // Build class names
  const classes = [
    'btn',
    'rottay-button',
    'rottay-button--modern',
    VARIANT_CLASSES[effectiveVariant] || VARIANT_CLASSES.primary,
    SIZE_CLASSES[size || 'md'],
    SHAPE_CLASSES[shape || 'default'],
    isFullWidth && 'btn-block w-full',
    loading && 'btn-disabled',
    disabled && 'btn-disabled',
    shadow && 'shadow-lg',
    className,
  ].filter(Boolean).join(' ');

  // Compute interactive styles
  const interactiveStyle: React.CSSProperties = {
    transition: 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease, filter 0.15s ease',
    transform:
      isActive && !disabled && !loading
        ? 'scale(0.98)'
        : isHovered && !disabled && !loading
          ? 'var(--ds-button-hover-transform, translateY(-1px))'
          : 'translateY(0)',
    boxShadow:
      isFocused && !disabled && !loading
        ? '0 0 0 3px var(--ds-color-primary-200, rgba(59, 130, 246, 0.3))'
        : undefined,
    outline: isFocused ? 'none' : undefined,
    ...style,
  };

  // Determine start and end content
  const startContent = iconPosition === 'start' ? icon : undefined;
  const endContent = iconPosition === 'end' ? icon : undefined;

  return (
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
    >
      {loading && <LoadingSpinner size={size} />}
      {!loading && (startContent || prefix)}
      {children && <span>{children}</span>}
      {!loading && (endContent || suffix)}
    </button>
  );
});

ModernButton.displayName = 'ModernButton';

export default ModernButton;
