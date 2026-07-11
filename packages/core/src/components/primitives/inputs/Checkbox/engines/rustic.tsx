/**
 * @fileoverview Checkbox Rustic engine -- zero-dependency implementation using only native
 * HTML elements and CSS custom properties. Renders a custom-styled checkbox box with an
 * SVG checkmark animation and an indeterminate horizontal line, all themed through
 * `--ds-checkbox-*` CSS variables. Supports label placement, error states, and radius
 * customization not available in the Classic or Modern engines.
 *
 * @example
 * ```tsx
 * <Checkbox engine="rustic" label="Accept terms" color="success" radius="sm" />
 * ```
 *
 * @module RusticCheckbox
 * @category Inputs
 * @package @rottay/design-system
 */

'use client';

import React, { useState, useRef, useEffect, useId, useCallback } from 'react';

import { useInteractionState } from '../../../../../behavior';
import type { CheckboxProps } from '../Checkbox.types';
import { CHECKBOX_DEFAULTS } from '../Checkbox.types';

// CSS variable references for the checkbox box dimensions. xs and sm share
// the same token because a checkbox smaller than 14px is too hard to target
// on touch devices.
const SIZE_VAR_MAP: Record<string, string> = {
  xs: 'var(--ds-checkbox-size-sm)',
  sm: 'var(--ds-checkbox-size-sm)',
  md: 'var(--ds-checkbox-size-md)',
  lg: 'var(--ds-checkbox-size-lg)',
  xl: 'var(--ds-checkbox-size-xl)',
};

// Numeric counterparts used to scale the SVG checkmark and indeterminate line.
// These must stay in sync with the CSS variable values defined in the theme.
const SIZE_NUMERIC_MAP: Record<string, number> = {
  xs: 14,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
};

/**
 * Rustic (vanilla HTML/CSS) implementation of the DS Checkbox.
 *
 * Renders a visually hidden native `<input type="checkbox">` overlaid on a
 * custom-styled `<span>` that displays the checkmark/indeterminate indicator.
 * All visual tokens are resolved from CSS custom properties, enabling tenant
 * theming without class-name changes. Additional rustic-specific props
 * (`radius`, `labelPlacement`, `error`, `required`) extend beyond what
 * Classic and Modern offer.
 *
 * @param props - Standardized CheckboxProps from the DS type contract, plus
 *                rustic-specific extras: `radius`, `labelPlacement`, `error`, `required`.
 * @returns A fully themed checkbox rendered without any UI library dependency.
 */
export default function RusticCheckbox(props: CheckboxProps): React.ReactElement {
  const {
    size = CHECKBOX_DEFAULTS.size,
    color = CHECKBOX_DEFAULTS.color,
    radius = CHECKBOX_DEFAULTS.radius,
    labelPlacement = CHECKBOX_DEFAULTS.labelPlacement,
    label,
    checked: controlledChecked,
    defaultChecked = CHECKBOX_DEFAULTS.defaultChecked,
    indeterminate = CHECKBOX_DEFAULTS.indeterminate,
    disabled = CHECKBOX_DEFAULTS.disabled,
    required = CHECKBOX_DEFAULTS.required,
    error = CHECKBOX_DEFAULTS.error,
    onChange,
    children,
    name,
    value,
    className = '',
    style,
  } = props;

  const generatedId = useId();
  const inputId = `checkbox-rustic-${generatedId}`;
  const inputRef = useRef<HTMLInputElement>(null);

  // Controlled vs. uncontrolled pattern. `isFocused` drives the focus
  // ring via inline styles since the native input is visually hidden and
  // its :focus pseudo-class would not be visible.
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  // The triad is decided once, in the behavior core. `focused` is any focus --
  // a field's focus border must appear when a pointer lands in it. A ring is
  // `focusVisible`, and this part does not draw one.
  const { state: interaction, handlers: interactionHandlers } = useInteractionState();
  const isFocused = interaction.focused;
  const isControlled = controlledChecked !== undefined;
  const isChecked = isControlled ? controlledChecked : internalChecked;

  // `indeterminate` is a DOM property, not an HTML attribute, so it must
  // be set imperatively. This keeps visual state in sync when the prop changes.
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  // Stable change handler: updates local state only in uncontrolled mode,
  // then forwards the checked boolean to the consumer's callback.
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newChecked = e.target.checked;

    if (!isControlled) {
      setInternalChecked(newChecked);
    }

    onChange?.(newChecked, e);
  }, [isControlled, onChange]);

  // Keyboard toggle: delegates to the hidden input's native click so the
  // change event fires through the normal DOM path.
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (!disabled && inputRef.current) {
        inputRef.current.click();
      }
    }
  }, [disabled]);

  // Get size values
  const sizeVar = SIZE_VAR_MAP[size] || SIZE_VAR_MAP.md;
  const sizeNumeric = SIZE_NUMERIC_MAP[size] || SIZE_NUMERIC_MAP.md;

  // Radius options allow the checkbox to range from square (none) to
  // fully circular (full). The default falls back to a theme-defined value.
  const getRadius = () => {
    if (radius === 'full') return '50%';
    if (radius === 'none') return '0';
    if (radius === 'sm') return 'var(--ds-radius-sm)';
    if (radius === 'md') return 'var(--ds-radius-md)';
    if (radius === 'lg') return 'var(--ds-radius-lg)';
    return 'var(--ds-checkbox-radius)';
  };

  // Resolve the checked background color from the DS palette. "primary"
  // uses the checkbox-specific token so it can be overridden independently
  // from the global primary color.
  const getCheckedBg = () => {
    if (color === 'primary') return 'var(--ds-checkbox-checked-bg)';
    if (color === 'success') return 'var(--ds-color-success-500)';
    if (color === 'warning') return 'var(--ds-color-warning-500)';
    if (color === 'error') return 'var(--ds-color-error-500)';
    if (color === 'secondary') return 'var(--ds-color-secondary-500)';
    return 'var(--ds-checkbox-checked-bg)';
  };

  const containerStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--ds-checkbox-label-gap)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    flexDirection: labelPlacement === 'start' ? 'row-reverse' : 'row',
    fontFamily: 'var(--ds-font-family-base)',
    ...style,
  };

  // The visible checkbox box. Border and background both change color on
  // check to give a filled-indicator look. The cubic-bezier easing on
  // background-color creates a subtle overshoot "pop" animation.
  const checkboxBoxStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: sizeVar,
    height: sizeVar,
    borderRadius: getRadius(),
    border: `2px solid ${error
      ? 'var(--ds-checkbox-error-border)'
      : (isChecked || indeterminate
          ? getCheckedBg()
          : 'var(--ds-checkbox-border)')}`,
    backgroundColor: isChecked || indeterminate
      ? getCheckedBg()
      : disabled
        ? 'var(--ds-checkbox-bg-disabled)'
        : 'var(--ds-checkbox-bg)',
    transition: 'border-color 0.15s, background-color 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s',
    outline: 'none',
    boxShadow: isFocused
      ? '0 0 0 3px var(--ds-color-primary-100, rgba(59, 130, 246, 0.2)), 0 0 8px rgba(59, 130, 246, 0.1)'
      : 'none',
  };

  // The native input is visually hidden (opacity: 0) but stretched to fill
  // the checkbox box so it captures clicks and focus events. This preserves
  // full accessibility without needing ARIA role overrides.
  const inputStyle: React.CSSProperties = {
    position: 'absolute',
    opacity: 0,
    width: '100%',
    height: '100%',
    margin: 0,
    padding: 0,
    cursor: disabled ? 'not-allowed' : 'pointer',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: `${sizeNumeric * 0.9}px`,
    color: error
      ? 'var(--ds-checkbox-error-color)'
      : disabled
        ? 'var(--ds-checkbox-label-color-disabled)'
        : 'var(--ds-checkbox-label-color)',
    userSelect: 'none',
  };

  const displayLabel = label || children;

  // SVG checkmark with a scale(0)->scale(1) entrance animation. The
  // cubic-bezier overshoot easing creates a satisfying "bounce" effect.
  const CheckmarkIcon = () => (
    <svg
      data-part="checkmark"
      width={sizeNumeric * 0.6}
      height={sizeNumeric * 0.6}
      viewBox="0 0 12 12"
      fill="none"
      style={{
        display: isChecked && !indeterminate ? 'block' : 'none',
        transform: isChecked ? 'scale(1)' : 'scale(0)',
        transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      <path
        d="M2 6L5 9L10 3"
        stroke="var(--ds-checkbox-checked-color)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  // Horizontal dash displayed when `indeterminate` is true, indicating
  // a partial/mixed selection (e.g., "select all" with some items checked).
  const IndeterminateLine = () => (
    <div
      data-part="checkmark"
      style={{
        display: indeterminate ? 'block' : 'none',
        width: sizeNumeric * 0.6,
        height: 2,
        backgroundColor: 'var(--ds-checkbox-checked-color)',
        borderRadius: 1,
      }}
    />
  );

  // BEM class names for external CSS hooks. State modifiers enable
  // selectors like `.rottay-checkbox--checked.rottay-checkbox--error`.
  const containerClasses = [
    'rottay-checkbox',
    'rottay-checkbox--rustic',
    'ds-checkbox',
    'ds-checkbox--rustic',
    `rottay-checkbox--${size}`,
    `rottay-checkbox--${color}`,
    isChecked && 'rottay-checkbox--checked',
    indeterminate && 'rottay-checkbox--indeterminate',
    disabled && 'rottay-checkbox--disabled',
    error && 'rottay-checkbox--error',
    className,
  ].filter(Boolean).join(' ');

  return (
    <label
      className={containerClasses}
      data-part="root"
      data-checked={isChecked ? 'true' : 'false'}
      data-indeterminate={indeterminate ? 'true' : 'false'}
      data-disabled={disabled ? 'true' : 'false'}
      data-error={error ? 'true' : 'false'}
      style={containerStyle}
      onKeyDown={handleKeyDown}
    >
      <span
        className="rottay-checkbox__box"
        data-part="box"
        style={checkboxBoxStyle}
        role="presentation"
      >
        <input
          ref={inputRef}
          id={inputId}
          type="checkbox"
          name={name}
          value={value}
          checked={isChecked}
          disabled={disabled}
          required={required}
          onChange={handleChange}
          {...interactionHandlers}
          style={inputStyle}
          aria-checked={indeterminate ? 'mixed' : isChecked}
          aria-invalid={error}
          aria-describedby={displayLabel ? `${inputId}-label` : undefined}
        />
        <CheckmarkIcon />
        <IndeterminateLine />
      </span>
      {displayLabel && (
        <span
          id={`${inputId}-label`}
          className="rottay-checkbox__label"
          data-part="label"
          style={labelStyle}
        >
          {displayLabel}
        </span>
      )}
    </label>
  );
}

RusticCheckbox.displayName = 'RusticCheckbox';
