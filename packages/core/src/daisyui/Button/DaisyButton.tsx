import React from 'react';
import type { DaisyButtonProps } from './types';

/**
 * DaisyUI Button Component
 *
 * A button component using DaisyUI classes for styling.
 *
 * @example
 * ```tsx
 * <DaisyButton variant="primary" size="lg">Click me</DaisyButton>
 * <DaisyButton variant="secondary" outline>Outline Button</DaisyButton>
 * <DaisyButton variant="success" loading>Loading...</DaisyButton>
 * ```
 */
export const DaisyButton: React.FC<DaisyButtonProps> = ({
  variant = 'primary',
  size = 'md',
  shape = 'default',
  outline = false,
  wide = false,
  glass = false,
  loading = false,
  disabled = false,
  type = 'button',
  onClick,
  children,
  className = '',
}) => {
  const classes = [
    'btn',
    variant ? `btn-${variant}` : '',
    size !== 'md' ? `btn-${size}` : '',
    shape !== 'default' ? `btn-${shape}` : '',
    outline ? 'btn-outline' : '',
    wide ? 'btn-wide' : '',
    glass ? 'glass' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading && <span className="loading loading-spinner"></span>}
      {children}
    </button>
  );
};

DaisyButton.displayName = 'DaisyButton';
