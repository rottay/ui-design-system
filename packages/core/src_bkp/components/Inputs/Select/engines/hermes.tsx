/**
 * Hermes Select Engine
 *
 * DaisyUI Select implementation with adapter for unified props.
 * Note: DaisyUI native select doesn't support multi-select mode.
 * For multi-select, use the Titan engine.
 */

'use client';

import { forwardRef } from 'react';
import type { SelectProps, SelectOption } from '../../../../types/components/select';

// Map unified size to DaisyUI size
function mapSize(size?: 'small' | 'middle' | 'large'): 'xs' | 'sm' | 'md' | 'lg' {
  switch (size) {
    case 'small':
      return 'sm';
    case 'large':
      return 'lg';
    default:
      return 'md';
  }
}

// Map unified status to DaisyUI variant
function mapStatus(status?: 'error' | 'warning'): string {
  if (status === 'error') return 'select-error';
  if (status === 'warning') return 'select-warning';
  return 'select-bordered';
}

/**
 * Hermes Select - DaisyUI implementation with unified SelectProps
 */
const HermesSelect = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      value,
      defaultValue,
      options = [],
      placeholder,
      disabled,
      loading,
      size,
      status,
      onChange,
      className = '',
      id,
      name,
    },
    ref
  ) => {
    // DaisyUI native select only supports single selection
    // Extract single value if array is passed (use first value)
    const singleValue = Array.isArray(value) ? value[0] : value;
    const singleDefaultValue = Array.isArray(defaultValue) ? defaultValue[0] : defaultValue;

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedValue = e.target.value;
      // Try to find matching option to get the typed value
      const selectedOption = options?.find((opt) => String(opt.value) === selectedValue);

      if (onChange && selectedOption) {
        onChange(selectedOption.value, selectedOption);
      }
    };

    const sizeClass = {
      xs: 'select-xs',
      sm: 'select-sm',
      md: '',
      lg: 'select-lg',
    }[mapSize(size)];

    const classes = [
      'select',
      mapStatus(status),
      sizeClass,
      'w-full',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <select
        ref={ref}
        id={id}
        name={name}
        value={singleValue !== undefined ? String(singleValue) : undefined}
        defaultValue={singleDefaultValue !== undefined ? String(singleDefaultValue) : undefined}
        disabled={disabled || loading}
        onChange={handleChange}
        className={classes}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option: SelectOption) => (
          <option
            key={String(option.value)}
            value={String(option.value)}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
    );
  }
);

HermesSelect.displayName = 'HermesSelect';

export default HermesSelect;
