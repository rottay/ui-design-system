/**
 * @fileoverview Modern engine for Toggle, built with DaisyUI's `toggle` checkbox classes.
 * Uses a native `<input type="checkbox" role="switch">` for full accessibility, with
 * DaisyUI handling the visual track/dot via CSS-only transforms.
 *
 * @example
 * ```tsx
 * <Toggle engine="modern" color="primary" size="lg" label="Enable feature" />
 * ```
 *
 * @module ModernToggle
 * @category Inputs
 * @package @rottay/design-system
 */

'use client';

import React, { useState, useCallback, useId } from 'react';
import type { ToggleProps } from '../Toggle.types';
import { TOGGLE_DEFAULTS } from '../Toggle.types';

/** DaisyUI size modifiers. 'md' is the default size so no class is needed; 'xl' reuses 'lg'. */
const DAISY_SIZE_MAP = {
  xs: 'toggle-xs',
  sm: 'toggle-sm',
  md: '',
  lg: 'toggle-lg',
  xl: 'toggle-lg',
};

/** DaisyUI color modifiers. 'default' uses DaisyUI's base toggle color (neutral). */
const DAISY_COLOR_MAP = {
  default: '',
  primary: 'toggle-primary',
  secondary: 'toggle-secondary',
  success: 'toggle-success',
  warning: 'toggle-warning',
  error: 'toggle-error',
};

/**
 * Modern (DaisyUI) implementation of Toggle.
 *
 * Renders a native checkbox with `role="switch"` styled via DaisyUI utility classes.
 * Supports controlled and uncontrolled modes, label placement (start/end), and an
 * optional description line beneath the label. Error state forces `toggle-error`
 * regardless of the color prop to ensure visual consistency.
 *
 * @param props - Standard ToggleProps shared across all engines.
 * @returns A form-control wrapper containing a labeled checkbox toggle.
 */
export default function ModernToggle(props: ToggleProps): React.ReactElement {
  const {
    size = TOGGLE_DEFAULTS.size,
    color = TOGGLE_DEFAULTS.color,
    labelPlacement = TOGGLE_DEFAULTS.labelPlacement,
    label,
    description,
    checked: controlledChecked,
    defaultChecked = false,
    disabled = TOGGLE_DEFAULTS.disabled,
    error = TOGGLE_DEFAULTS.error,
    onChange,
    children,
    className = '',
    style,
    name,
    id: providedId,
    value,
    autoFocus,
    ...rest
  } = props;

  const generatedId = useId();
  const inputId = providedId || `toggle-modern-${generatedId}`;

  // Dual-mode state: controlled when `checked` prop is provided, uncontrolled otherwise
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isControlled = controlledChecked !== undefined;
  const isChecked = isControlled ? controlledChecked : internalChecked;

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) {
      setInternalChecked(e.target.checked);
    }
    onChange?.(e.target.checked, e);
  }, [isControlled, onChange]);

  // Error state overrides the color class to ensure the toggle is visually marked
  const toggleClasses = [
    'toggle',
    DAISY_SIZE_MAP[size],
    error ? 'toggle-error' : DAISY_COLOR_MAP[color],
  ]
    .filter(Boolean)
    .join(' ');

  const displayLabel = label || children;

  const containerClasses = [
    'form-control',
    disabled && 'opacity-50 cursor-not-allowed',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClasses} style={style}>
      <label
        className={`label cursor-pointer gap-2 ${labelPlacement === 'start' ? 'flex-row-reverse justify-end' : 'justify-start'}`}
        htmlFor={inputId}
      >
        <input
          id={inputId}
          type="checkbox"
          role="switch"
          name={name}
          value={value}
          checked={isChecked}
          disabled={disabled}
          onChange={handleChange}
          autoFocus={autoFocus}
          className={toggleClasses}
          aria-checked={isChecked}
          aria-invalid={error}
          {...rest}
        />
        {(displayLabel || description) && (
          <div className="flex flex-col">
            {displayLabel && (
              <span className={`label-text ${error ? 'text-error' : ''}`}>
                {displayLabel}
              </span>
            )}
            {description && (
              <span className="label-text-alt text-gray-500">
                {description}
              </span>
            )}
          </div>
        )}
      </label>
    </div>
  );
}

ModernToggle.displayName = 'ModernToggle';
