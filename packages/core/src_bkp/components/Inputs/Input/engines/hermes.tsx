/**
 * Hermes Input Engine
 *
 * DaisyUI Input implementation with unified InputProps.
 */

'use client';

import { forwardRef } from 'react';
import type { InputProps } from '../../../../types/components/input';

/**
 * Maps unified size to DaisyUI size
 */
function mapSize(size?: 'small' | 'middle' | 'large'): string {
  switch (size) {
    case 'small':
      return 'input-sm';
    case 'large':
      return 'input-lg';
    default:
      return '';
  }
}

/**
 * Maps unified status to DaisyUI variant class
 */
function mapStatus(status?: 'error' | 'warning'): string {
  if (status === 'error') return 'input-error';
  if (status === 'warning') return 'input-warning';
  return 'input-bordered';
}

/**
 * Hermes Input - DaisyUI implementation with unified InputProps
 */
const HermesInput = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      value,
      defaultValue,
      placeholder,
      disabled,
      readOnly,
      type = 'text',
      onChange,
      onFocus,
      onBlur,
      className = '',
      id,
      name,
      autoFocus,
      size,
      status,
      maxLength,
      autoComplete,
    },
    ref
  ) => {
    const classes = [
      'input',
      mapStatus(status),
      mapSize(size),
      'w-full',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <input
        ref={ref}
        id={id}
        name={name}
        type={type}
        value={value}
        defaultValue={defaultValue}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        maxLength={maxLength}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        className={classes}
      />
    );
  }
);

HermesInput.displayName = 'HermesInput';

export default HermesInput;
