/**
 * Button.Icon - Compound Component
 * Icon-only button variant
 */

'use client';

import React from 'react';
import type { ReactNode, CSSProperties } from 'react';

export interface ButtonIconProps {
  icon: ReactNode;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'primary' | 'ghost' | 'danger';
  className?: string;
  style?: CSSProperties;
  'aria-label': string; // Required for accessibility
}

const SIZE_MAP = {
  sm: 24,
  md: 32,
  lg: 40,
};

const VARIANT_COLORS = {
  default: '#f0f0f0',
  primary: '#1890ff',
  ghost: 'transparent',
  danger: '#ff4d4f',
};

/**
 * Icon-only button component
 */
export function ButtonIcon({
  icon,
  onClick,
  size = 'md',
  variant = 'default',
  className = '',
  style,
  'aria-label': ariaLabel,
}: ButtonIconProps): React.ReactElement {
  const buttonSize = SIZE_MAP[size];

  const buttonStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: buttonSize,
    height: buttonSize,
    borderRadius: 'var(--button-radius, 8px)',
    border: variant === 'ghost' ? 'none' : '1px solid var(--button-border, #d9d9d9)',
    backgroundColor: VARIANT_COLORS[variant],
    color: variant === 'primary' ? '#fff' : 'inherit',
    cursor: 'pointer',
    transition: 'all 0.2s',
    ...style,
  };

  return (
    <button
      className={`rottay-button-icon ${className}`}
      style={buttonStyle}
      onClick={onClick}
      aria-label={ariaLabel}
      type="button"
    >
      {icon}
    </button>
  );
}

ButtonIcon.displayName = 'Button.Icon';
