/**
 * @fileoverview Button Classic Engine - Rottay Design System
 * @description Ant Design implementation of the Button component.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * The Classic engine wraps Ant Design's Button component, providing enterprise-grade
 * features and polished animations. It maps Rottay's standardized props to Ant
 * Design's API while maintaining consistent behavior across all engines.
 *
 * **Ant Design Features Utilized:**
 * - Native button types (primary, default, dashed, link, text)
 * - Built-in loading state with spinner animation
 * - Size variants (small, middle, large)
 * - Shape options (default, circle, round)
 * - Block mode for full-width buttons
 * - Icon support with automatic positioning
 *
 * **Prop Mapping:**
 * - `variant="primary"` → `type="primary"`
 * - `variant="outline"` → `type="default"` with border
 * - `variant="ghost"` → `type="text"`
 * - `variant="danger"` → `type="primary" danger={true}`
 * - `size="sm"` → `size="small"`
 * - `size="lg"` → `size="large"`
 *
 * @example Using Classic Engine
 * ```tsx
 * import { Button } from '@rottay/design-system';
 *
 * // Explicit Classic engine (default)
 * <Button engine="classic" variant="primary">
 *   Ant Design Button
 * </Button>
 *
 * // With Ant Design-specific features
 * <Button
 *   engine="classic"
 *   variant="primary"
 *   loading
 *   icon={<SaveIcon />}
 * >
 *   Saving...
 * </Button>
 * ```
 *
 * @see {@link Button} for the main component
 * @see {@link ModernButton} for DaisyUI implementation
 * @see {@link RusticButton} for vanilla implementation
 * @module ClassicButton
 * @category Inputs
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef } from 'react';
import { Button as AntButton } from 'antd';
import type { ButtonProps } from '../../types';
import { BUTTON_DEFAULTS } from '../../types';

// Map our variants to Ant Design button props
const VARIANT_MAP: Record<string, { type?: 'primary' | 'default' | 'dashed' | 'link' | 'text'; danger?: boolean }> = {
  primary: { type: 'primary' },
  secondary: { type: 'default' },
  default: { type: 'default' },
  outline: { type: 'default' },
  ghost: { type: 'text' },
  text: { type: 'text' },
  dashed: { type: 'dashed' },
  danger: { type: 'primary', danger: true },
  link: { type: 'link' },
};

// Map our sizes to Ant Design sizes
const SIZE_MAP: Record<string, 'small' | 'middle' | 'large'> = {
  xs: 'small',
  sm: 'small',
  md: 'middle',
  lg: 'large',
  xl: 'large',
};

// Map our shapes to Ant Design shapes
const SHAPE_MAP: Record<string, 'default' | 'circle' | 'round'> = {
  default: 'default',
  round: 'round',
  circle: 'circle',
};

const ClassicButton = forwardRef<any, ButtonProps>((props, ref) => {
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
    href,
    target,
    onClick,
    className = '',
    style,
    id,
    'aria-label': ariaLabel,
    'data-testid': dataTestId,
    tabIndex,
  } = props;

  // fullWidth is an alias for block
  const isFullWidth = fullWidth ?? block;

  // Get variant props (danger prop overrides variant)
  const effectiveVariant = danger ? 'danger' : (variant || 'primary');
  const variantProps = VARIANT_MAP[effectiveVariant] || VARIANT_MAP.primary;

  // Build class names
  const classNames = [
    'rottay-button',
    `rottay-button--classic`,
    className,
  ].filter(Boolean).join(' ');

  // Determine start and end content
  const startIcon = iconPosition === 'start' ? icon : undefined;
  const endIcon = iconPosition === 'end' ? icon : undefined;

  return (
    <AntButton
      ref={ref}
      {...variantProps}
      size={SIZE_MAP[size || 'md']}
      shape={SHAPE_MAP[shape || 'default']}
      disabled={disabled}
      loading={loading}
      icon={startIcon || prefix}
      block={isFullWidth}
      htmlType={htmlType}
      href={href}
      target={target}
      onClick={onClick}
      className={classNames}
      style={style}
      id={id}
      aria-label={ariaLabel}
      data-testid={dataTestId}
      tabIndex={tabIndex}
    >
      {children}
      {(endIcon || suffix) && (
        <span style={{ marginLeft: children ? 8 : 0 }}>
          {endIcon || suffix}
        </span>
      )}
    </AntButton>
  );
});

ClassicButton.displayName = 'ClassicButton';

export default ClassicButton;
