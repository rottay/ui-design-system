/**
 * @fileoverview Radio Modern Engine - Rottay Design System
 * @description DaisyUI/Tailwind CSS implementation of the Radio component.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * The Modern engine implements radios using DaisyUI's utility-first approach
 * with Tailwind CSS classes. It provides a lightweight alternative with
 * smaller bundle size.
 *
 * **DaisyUI Features Utilized:**
 * - Radio component classes
 * - Size modifiers (radio-xs, radio-sm, radio-lg)
 * - Color modifiers (radio-primary, radio-secondary, etc.)
 * - Form control wrapper for label alignment
 * - Label text and alt-text for descriptions
 *
 * **Prop Mapping:**
 * - `size="xs"` → `radio-xs`
 * - `size="sm"` → `radio-sm`
 * - `size="lg"` → `radio-lg`
 * - `color="primary"` → `radio-primary`
 * - `color="success"` → `radio-success`
 *
 * **Description Support:**
 * Uses DaisyUI's `label-text-alt` class for option descriptions.
 *
 * @example Using Modern Engine
 * ```tsx
 * import { Radio } from '@rottay/design-system';
 *
 * // Explicit Modern engine
 * <Radio
 *   engine="modern"
 *   name="option"
 *   value="a"
 *   label="DaisyUI Radio"
 *   description="Additional info"
 *   color="success"
 * />
 * ```
 *
 * @see {@link Radio} for the main component
 * @see {@link ClassicRadio} for Ant Design implementation
 * @see {@link RusticRadio} for vanilla implementation
 * @module ModernRadio
 * @category Inputs
 * @package @rottay/design-system
 */

'use client';

import React, { useState, useId } from 'react';
import type { RadioProps } from '../Radio.types';
import { RADIO_DEFAULTS } from '../Radio.types';

/**
 * Modern (DaisyUI/Tailwind) implementation of the DS Radio.
 *
 * Uses a native `<input type="radio">` with DaisyUI's `radio` class and modifier
 * classes for size and color. Supports both controlled (`checked` prop) and
 * uncontrolled (`defaultChecked`) modes. An optional `description` is rendered
 * below the label using DaisyUI's `label-text-alt` style.
 *
 * @param props - Standardized RadioProps from the DS type contract.
 * @returns A DaisyUI-styled radio button wrapped in a `form-control` label.
 */
export default function ModernRadio(props: RadioProps): React.ReactElement {
  const {
    size = RADIO_DEFAULTS.size,
    color = RADIO_DEFAULTS.color,
    label,
    value,
    checked: controlledChecked,
    defaultChecked = false,
    disabled = RADIO_DEFAULTS.disabled,
    onChange,
    children,
    name,
    description,
    className = '',
    style,
  } = props;

  // Stable unique ID for input-label association. The engine prefix
  // prevents collisions if multiple engines are rendered on the same page.
  const generatedId = useId();
  const inputId = `radio-modern-${generatedId}`;

  // Controlled vs. uncontrolled: when `checked` is undefined, local state
  // owns the radio value. This mirrors React's standard input pattern.
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isControlled = controlledChecked !== undefined;
  const isChecked = isControlled ? controlledChecked : internalChecked;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) {
      setInternalChecked(e.target.checked);
    }
    onChange?.(e);
  };

  // DaisyUI size classes. `xl` maps to `radio-lg` because DaisyUI
  // does not provide an xl modifier for radios.
  const sizeClass = {
    xs: 'radio-xs',
    sm: 'radio-sm',
    md: '',
    lg: 'radio-lg',
    xl: 'radio-lg',
  }[size] || '';

  // DaisyUI color classes map directly to DS color tokens.
  const colorClass = {
    default: '',
    primary: 'radio-primary',
    secondary: 'radio-secondary',
    success: 'radio-success',
    warning: 'radio-warning',
    error: 'radio-error',
  }[color] || 'radio-primary';

  const displayLabel = label || children;

  return (
    <div className={`form-control ${className}`} style={style}>
      {/* `justify-start` overrides DaisyUI's default space-between so the
          radio and label stay grouped on the left side. */}
      <label className="label cursor-pointer gap-2 justify-start">
        <input
          id={inputId}
          type="radio"
          name={name}
          value={value}
          checked={isChecked}
          disabled={disabled}
          onChange={handleChange}
          className={`radio ${sizeClass} ${colorClass}`}
          aria-checked={isChecked}
        />
        {/* Label and optional description are stacked vertically.
            `label-text-alt` provides smaller, muted secondary text. */}
        {(displayLabel || description) && (
          <div className="flex flex-col">
            {displayLabel && (
              <span className="label-text">{displayLabel}</span>
            )}
            {description && (
              <span className="label-text-alt text-gray-500">{description}</span>
            )}
          </div>
        )}
      </label>
    </div>
  );
}

ModernRadio.displayName = 'ModernRadio';
