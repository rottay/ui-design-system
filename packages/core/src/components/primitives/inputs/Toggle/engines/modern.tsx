/**
 * @fileoverview Toggle Modern Engine - Rottay Design System
 * @description DaisyUI/Tailwind CSS implementation of the Toggle component.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * The Modern engine implements toggles using DaisyUI's toggle classes
 * with Tailwind CSS utilities. It provides a lightweight alternative
 * with utility-first styling.
 *
 * **DaisyUI Classes Used:**
 * - `toggle` - Base toggle styling
 * - `toggle-{size}` - Size variants (xs, sm, lg)
 * - `toggle-{color}` - Color variants (primary, secondary, success, warning, error)
 * - `form-control` - Form wrapper styling
 * - `label`, `label-text`, `label-text-alt` - Label styling
 *
 * **Tailwind Utilities:**
 * - `flex`, `flex-col`, `gap-*` - Layout utilities
 * - `opacity-50`, `cursor-not-allowed` - Disabled state
 * - `flex-row-reverse`, `justify-end` - Label placement
 *
 * **Accessibility:**
 * - Native checkbox with role="switch"
 * - aria-checked and aria-invalid attributes
 * - Proper label association
 *
 * @example Using Modern Engine
 * ```tsx
 * import { Toggle } from '@rottay/design-system';
 *
 * <Toggle
 *   engine="modern"
 *   color="primary"
 *   size="lg"
 *   label="Enable feature"
 *   className="my-4"
 * />
 * ```
 *
 * @see {@link Toggle} for the main component
 * @see {@link ClassicToggle} for Ant Design implementation
 * @see {@link RusticToggle} for vanilla implementation
 * @module ModernToggle
 * @category Inputs
 * @package @rottay/design-system
 */

'use client';

import React, { useState, useCallback, useId } from 'react';
import type { ToggleProps } from '../Toggle.types';
import { TOGGLE_DEFAULTS } from '../Toggle.types';

// DaisyUI size classes
const DAISY_SIZE_MAP = {
  xs: 'toggle-xs',
  sm: 'toggle-sm',
  md: '',
  lg: 'toggle-lg',
  xl: 'toggle-lg',
};

// DaisyUI color classes
const DAISY_COLOR_MAP = {
  default: '',
  primary: 'toggle-primary',
  secondary: 'toggle-secondary',
  success: 'toggle-success',
  warning: 'toggle-warning',
  error: 'toggle-error',
};

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

  // Internal state for uncontrolled mode
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isControlled = controlledChecked !== undefined;
  const isChecked = isControlled ? controlledChecked : internalChecked;

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) {
      setInternalChecked(e.target.checked);
    }
    onChange?.(e.target.checked, e);
  }, [isControlled, onChange]);

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
