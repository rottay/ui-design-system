/**
 * @fileoverview Radio Rustic engine -- zero-dependency implementation using only native HTML
 * elements and CSS custom properties. Renders a custom circular radio with an animated
 * inner dot, all themed through `--ds-radio-*` CSS variables. Supports label placement,
 * descriptions, error states, and required validation not available in the Classic or
 * Modern engines.
 *
 * @example
 * ```tsx
 * <Radio engine="rustic" name="plan" value="pro" label="Pro" description="$29/mo" />
 * ```
 *
 * @module RusticRadio
 * @category Inputs
 * @package @rottay/design-system
 */

'use client';

import React, { useState, useId, useCallback } from 'react';
import type { RadioProps } from '../Radio.types';
import { RADIO_DEFAULTS } from '../Radio.types';

// CSS variable references for the radio circle dimensions. xs and sm share
// the same token because a radio smaller than 14px is too hard to target
// on touch devices.
const SIZE_VAR_MAP: Record<string, string> = {
  xs: 'var(--ds-radio-size-sm)',
  sm: 'var(--ds-radio-size-sm)',
  md: 'var(--ds-radio-size-md)',
  lg: 'var(--ds-radio-size-lg)',
  xl: 'var(--ds-radio-size-xl)',
};

// Numeric counterparts used to scale the inner dot and label font size.
// These must stay in sync with the CSS variable values defined in the theme.
const SIZE_NUMERIC_MAP: Record<string, number> = {
  xs: 14,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
};

/**
 * Rustic (vanilla HTML/CSS) implementation of the DS Radio.
 *
 * Renders a visually hidden native `<input type="radio">` overlaid on a custom-styled
 * circular `<span>` that displays an animated inner dot. All visual tokens are resolved
 * from CSS custom properties, enabling tenant theming without class-name changes.
 * Additional rustic-specific props (`labelPlacement`, `description`, `error`, `required`)
 * extend beyond what Classic and Modern offer.
 *
 * @param props - Standardized RadioProps from the DS type contract, plus rustic-specific
 *                extras: `labelPlacement`, `description`, `error`, `required`.
 * @returns A fully themed radio button rendered without any UI library dependency.
 */
export default function RusticRadio(props: RadioProps): React.ReactElement {
  const {
    size = RADIO_DEFAULTS.size,
    color = RADIO_DEFAULTS.color,
    labelPlacement = RADIO_DEFAULTS.labelPlacement,
    label,
    value,
    checked: controlledChecked,
    defaultChecked = false,
    disabled = RADIO_DEFAULTS.disabled,
    required = RADIO_DEFAULTS.required,
    error = RADIO_DEFAULTS.error,
    onChange,
    children,
    name,
    description,
    className = '',
    style,
  } = props;

  const generatedId = useId();
  const inputId = `radio-rustic-${generatedId}`;

  // Controlled vs. uncontrolled pattern. `isFocused` drives the focus ring
  // via inline styles since the native input is visually hidden.
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const [isFocused, setIsFocused] = useState(false);
  const isControlled = controlledChecked !== undefined;
  const isChecked = isControlled ? controlledChecked : internalChecked;

  // Stable change handler: updates local state only in uncontrolled mode,
  // then forwards the event to the consumer.
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) {
      setInternalChecked(e.target.checked);
    }
    onChange?.(e);
  }, [isControlled, onChange]);

  // Keyboard toggle: synthesizes a ChangeEvent because the hidden input's
  // native click may not fire reliably in all browsers when triggered
  // via keyboard on a label wrapper.
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (!disabled) {
        const event = {
          target: { checked: true, value },
          currentTarget: { checked: true, value },
        } as React.ChangeEvent<HTMLInputElement>;
        handleChange(event);
      }
    }
  }, [disabled, value, handleChange]);

  const sizeVar = SIZE_VAR_MAP[size] || SIZE_VAR_MAP.md;
  const sizeNumeric = SIZE_NUMERIC_MAP[size] || SIZE_NUMERIC_MAP.md;

  // Resolve the inner dot color from the DS palette. "primary" uses the
  // radio-specific token so it can be overridden independently from the
  // global primary color at the tenant level.
  const getCheckedDot = () => {
    if (color === 'primary') return 'var(--ds-radio-checked-dot)';
    if (color === 'success') return 'var(--ds-color-success-500)';
    if (color === 'warning') return 'var(--ds-color-warning-500)';
    if (color === 'error') return 'var(--ds-color-error-500)';
    if (color === 'secondary') return 'var(--ds-color-secondary-500)';
    return 'var(--ds-radio-checked-dot)';
  };

  const containerStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'flex-start',
    gap: 'var(--ds-radio-label-gap)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    flexDirection: labelPlacement === 'start' ? 'row-reverse' : 'row',
    fontFamily: 'var(--ds-font-family-base)',
    ...style,
  };

  // The visible radio circle. Border color changes on selection to match
  // the inner dot, creating a cohesive filled-indicator look.
  // `flexShrink: 0` prevents the circle from collapsing when the label
  // text is long. `marginTop` adds a small offset when a description is
  // present so the circle aligns with the first line of text.
  const radioCircleStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: sizeVar,
    height: sizeVar,
    borderRadius: '50%',
    border: `2px solid ${error
      ? 'var(--ds-radio-error-border)'
      : isChecked
        ? getCheckedDot()
        : 'var(--ds-radio-border)'}`,
    backgroundColor: disabled
      ? 'var(--ds-radio-bg-disabled)'
      : 'var(--ds-radio-bg)',
    transition: 'border-color 0.15s, box-shadow 0.2s',
    flexShrink: 0,
    marginTop: description ? '2px' : 0,
    outline: 'none',
    boxShadow: isFocused
      ? '0 0 0 3px var(--ds-color-primary-100, rgba(59, 130, 246, 0.2)), 0 0 8px rgba(59, 130, 246, 0.1)'
      : 'none',
  };

  // The native input is visually hidden but stretched to fill the circle
  // so it captures clicks and focus events. This preserves full
  // accessibility without needing ARIA role overrides.
  const inputStyle: React.CSSProperties = {
    position: 'absolute',
    opacity: 0,
    width: '100%',
    height: '100%',
    margin: 0,
    padding: 0,
    cursor: disabled ? 'not-allowed' : 'pointer',
  };

  // Inner dot with a scale(0)->scale(1) transition. The cubic-bezier
  // overshoot easing (0.34, 1.56, 0.64, 1) creates a satisfying
  // "pop" animation when the radio is selected.
  const dotStyle: React.CSSProperties = {
    display: 'block',
    width: sizeNumeric * 0.5,
    height: sizeNumeric * 0.5,
    borderRadius: '50%',
    backgroundColor: getCheckedDot(),
    transform: isChecked ? 'scale(1)' : 'scale(0)',
    transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
  };

  const labelContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: `${sizeNumeric * 0.9}px`,
    color: error
      ? 'var(--ds-radio-error-color)'
      : disabled
        ? 'var(--ds-radio-label-color-disabled)'
        : 'var(--ds-radio-label-color)',
    userSelect: 'none',
    lineHeight: 1.4,
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize: `${sizeNumeric * 0.75}px`,
    color: 'var(--ds-radio-description-color)',
    userSelect: 'none',
    lineHeight: 1.4,
  };

  const displayLabel = label || children;

  // BEM class names for external CSS hooks. State modifiers enable
  // selectors like `.rottay-radio--checked.rottay-radio--error`.
  const containerClasses = [
    'rottay-radio',
    'rottay-radio--rustic',
    `rottay-radio--${size}`,
    `rottay-radio--${color}`,
    isChecked && 'rottay-radio--checked',
    disabled && 'rottay-radio--disabled',
    error && 'rottay-radio--error',
    className,
  ].filter(Boolean).join(' ');

  return (
    <label
      className={containerClasses}
      style={containerStyle}
      onKeyDown={handleKeyDown}
    >
      <span
        className="rottay-radio__circle"
        style={radioCircleStyle}
        role="presentation"
      >
        <input
          id={inputId}
          type="radio"
          name={name}
          value={value}
          checked={isChecked}
          disabled={disabled}
          required={required}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={inputStyle}
          aria-checked={isChecked}
          aria-invalid={error}
          aria-describedby={displayLabel ? `${inputId}-label` : undefined}
        />
        <span className="rottay-radio__dot" style={dotStyle} />
      </span>
      {(displayLabel || description) && (
        <span
          id={`${inputId}-label`}
          className="rottay-radio__content"
          style={labelContainerStyle}
        >
          {displayLabel && (
            <span className="rottay-radio__label" style={labelStyle}>
              {displayLabel}
            </span>
          )}
          {description && (
            <span className="rottay-radio__description" style={descriptionStyle}>
              {description}
            </span>
          )}
        </span>
      )}
    </label>
  );
}

RusticRadio.displayName = 'RusticRadio';
