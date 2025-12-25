/**
 * Button - Hermes Engine (DaisyUI/Tailwind)
 */

import React from 'react';
import type { ButtonProps } from '../types';
import { BUTTON_DEFAULTS } from '../types';

const VARIANT_CLASSES = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'btn-error',
  link: 'btn-link',
};

const SIZE_CLASSES = {
  sm: 'btn-sm',
  md: 'btn-md',
  lg: 'btn-lg',
};

export default function HermesButton(props: ButtonProps): React.ReactElement {
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
    className = '',
    style,
  } = props;

  const classes = [
    'btn',
    VARIANT_CLASSES[variant!],
    SIZE_CLASSES[size!],
    fullWidth ? 'btn-block' : '',
    loading ? 'loading' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      style={style}
    >
      {loading && (
        <span className="loading loading-spinner loading-sm" />
      )}
      {!loading && iconPosition === 'start' && icon}
      {children}
      {!loading && iconPosition === 'end' && icon}
    </button>
  );
}
