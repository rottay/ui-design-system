/**
 * Button - Apollo Engine (Pure HTML/CSS)
 */

import React from 'react';
import type { ButtonProps } from '../types';
import { BUTTON_DEFAULTS } from '../types';

const VARIANT_STYLES: Record<string, React.CSSProperties> = {
  primary: {
    backgroundColor: 'var(--color-primary, #0066CC)',
    color: 'white',
    border: 'none',
  },
  secondary: {
    backgroundColor: 'transparent',
    color: 'var(--color-primary, #0066CC)',
    border: '1px solid var(--color-primary, #0066CC)',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: 'inherit',
    border: 'none',
  },
  danger: {
    backgroundColor: 'var(--color-error, #EF4444)',
    color: 'white',
    border: 'none',
  },
  link: {
    backgroundColor: 'transparent',
    color: 'var(--color-primary, #0066CC)',
    border: 'none',
    textDecoration: 'underline',
  },
};

const SIZE_STYLES: Record<string, React.CSSProperties> = {
  sm: { padding: '0.25rem 0.5rem', fontSize: '0.875rem' },
  md: { padding: '0.5rem 1rem', fontSize: '1rem' },
  lg: { padding: '0.75rem 1.5rem', fontSize: '1.125rem' },
};

const BASE_STYLES: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  borderRadius: 'var(--radius-md, 0.375rem)',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
};

export default function ApolloButton(props: ButtonProps): React.ReactElement {
  const {
    children,
    variant = BUTTON_DEFAULTS.variant,
    size = BUTTON_DEFAULTS.size,
    disabled,
    loading,
    icon,
    iconPosition = BUTTON_DEFAULTS.iconPosition,
    fullWidth,
    type = BUTTON_DEFAULTS.type,
    onClick,
    className,
    style,
  } = props;

  const combinedStyle: React.CSSProperties = {
    ...BASE_STYLES,
    ...VARIANT_STYLES[variant!],
    ...SIZE_STYLES[size!],
    ...(fullWidth ? { width: '100%' } : {}),
    ...(disabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}),
    ...style,
  };

  return (
    <button
      type={type}
      style={combinedStyle}
      className={className}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading && <span>⏳</span>}
      {!loading && iconPosition === 'start' && icon}
      {children}
      {!loading && iconPosition === 'end' && icon}
    </button>
  );
}
