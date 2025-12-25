/**
 * Hermes Checkbox Engine
 *
 * DaisyUI Checkbox implementation with adapter for unified props.
 * Adapts unified CheckboxProps to DaisyUI-specific implementation.
 */

'use client';

import { forwardRef } from 'react';
import type { CheckboxProps } from '../../../../types/components/checkbox';

// Utility function for classNames
function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Map unified size to DaisyUI size class
 */
function getSizeClass(size?: 'xs' | 'sm' | 'md' | 'lg'): string {
  if (!size || size === 'md') return '';
  return `checkbox-${size}`;
}

/**
 * Map unified color to DaisyUI variant class
 */
function getVariantClass(
  color?: 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error'
): string {
  if (!color) return '';
  return `checkbox-${color}`;
}

/**
 * Hermes Checkbox - DaisyUI implementation with unified CheckboxProps
 */
const HermesCheckbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      checked,
      defaultChecked,
      disabled,
      onChange,
      children,
      className,
      style,
      name,
      id,
      value,
      size,
      color,
    },
    ref
  ) => {
    const classes = cn(
      'checkbox',
      getVariantClass(color),
      getSizeClass(size),
      className
    );

    // Convert value to string for HTML input compatibility
    const stringValue = value !== undefined ? String(value) : undefined;

    return (
      <label className="flex items-center gap-2 cursor-pointer" style={style}>
        <input
          ref={ref}
          id={id}
          name={name}
          type="checkbox"
          value={stringValue}
          checked={checked}
          defaultChecked={defaultChecked}
          disabled={disabled}
          onChange={onChange}
          className={classes}
        />
        {children}
      </label>
    );
  }
);

HermesCheckbox.displayName = 'HermesCheckbox';

export default HermesCheckbox;
