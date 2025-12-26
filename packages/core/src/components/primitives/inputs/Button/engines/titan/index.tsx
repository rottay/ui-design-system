/**
 * Button - Titan Engine (Ant Design)
 */

'use client';

import React from 'react';
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

export default function TitanButton(props: ButtonProps): React.ReactElement {
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
    `rottay-button--titan`,
    className,
  ].filter(Boolean).join(' ');

  // Determine start and end content
  const startIcon = iconPosition === 'start' ? icon : undefined;
  const endIcon = iconPosition === 'end' ? icon : undefined;

  return (
    <AntButton
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
}

TitanButton.displayName = 'TitanButton';
