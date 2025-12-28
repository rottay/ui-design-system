/**
 * @fileoverview Button Hermes Engine - Rottay Design System
 * @description DaisyUI/Tailwind CSS implementation of the Button component.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * The Hermes engine implements buttons using DaisyUI's utility-first approach
 * with Tailwind CSS classes. This provides a lightweight alternative to Titan
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
 * - `variant="primary"` → `btn-primary`
 * - `variant="secondary"` → `btn-secondary`
 * - `variant="danger"` → `btn-error`
 * - `variant="ghost"` → `btn-ghost`
 * - `variant="link"` → `btn-link`
 * - `size="xs"` → `btn-xs`
 * - `shape="round"` → `rounded-full`
 *
 * **Loading State:**
 * Uses DaisyUI's loading spinner with size-appropriate classes.
 *
 * @example Using Hermes Engine
 * ```tsx
 * import { Button } from '@rottay/design-system';
 *
 * // Explicit Hermes engine
 * <Button engine="hermes" variant="primary">
 *   DaisyUI Button
 * </Button>
 *
 * // With shadow and loading
 * <Button
 *   engine="hermes"
 *   variant="secondary"
 *   shadow
 *   loading
 * >
 *   Processing...
 * </Button>
 * ```
 *
 * @see {@link Button} for the main component
 * @see {@link TitanButton} for Ant Design implementation
 * @see {@link ApolloButton} for vanilla implementation
 * @module HermesButton
 * @category Inputs
 * @package @rottay/design-system
 */

'use client';

import React from 'react';
import type { ButtonProps } from '../../types';
import { BUTTON_DEFAULTS } from '../../types';

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

export default function HermesButton(props: ButtonProps): React.ReactElement {
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

  // fullWidth is an alias for block
  const isFullWidth = fullWidth ?? block;

  // Get effective variant (danger overrides)
  const effectiveVariant = danger ? 'danger' : (variant || 'primary');

  // Build class names
  const classes = [
    'btn',
    'rottay-button',
    'rottay-button--hermes',
    VARIANT_CLASSES[effectiveVariant] || VARIANT_CLASSES.primary,
    SIZE_CLASSES[size || 'md'],
    SHAPE_CLASSES[shape || 'default'],
    isFullWidth && 'btn-block w-full',
    loading && 'btn-disabled',
    disabled && 'btn-disabled',
    shadow && 'shadow-lg',
    className,
  ].filter(Boolean).join(' ');

  // Spinner sizes
  const spinnerSize: Record<string, string> = {
    xs: 'loading-xs',
    sm: 'loading-sm',
    md: 'loading-sm',
    lg: 'loading-md',
    xl: 'loading-lg',
  };

  // Determine start and end content
  const startContent = iconPosition === 'start' ? icon : undefined;
  const endContent = iconPosition === 'end' ? icon : undefined;

  return (
    <button
      type={htmlType}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      style={style}
      aria-disabled={disabled || loading}
      aria-busy={loading}
    >
      {loading && (
        <span className={`loading loading-spinner ${spinnerSize[size || 'md']}`} />
      )}
      {!loading && (startContent || prefix)}
      {children && <span>{children}</span>}
      {!loading && (endContent || suffix)}
    </button>
  );
}

HermesButton.displayName = 'HermesButton';
