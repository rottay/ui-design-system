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

/** Toggle track dimensions per size. */
const SIZE_DIMS: Record<string, { trackW: number; trackH: number; thumbSize: number }> = {
  xs: { trackW: 28, trackH: 16, thumbSize: 12 },
  sm: { trackW: 32, trackH: 18, thumbSize: 14 },
  md: { trackW: 36, trackH: 20, thumbSize: 16 },
  lg: { trackW: 44, trackH: 24, thumbSize: 20 },
  xl: { trackW: 44, trackH: 24, thumbSize: 20 },
};

/** DS token color for checked track per color prop. */
const COLOR_TOKENS: Record<string, string> = {
  default: 'var(--ds-color-primary)',
  primary: 'var(--ds-color-primary)',
  secondary: 'var(--ds-color-secondary)',
  success: 'var(--ds-color-success)',
  warning: 'var(--ds-color-warning)',
  error: 'var(--ds-color-error)',
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
  const dims = SIZE_DIMS[size] || SIZE_DIMS.md;
  const thumbInset = (dims.trackH - dims.thumbSize) / 2;
  const thumbTravel = dims.trackW - dims.thumbSize - thumbInset * 2;
  const trackColor = error ? 'var(--ds-color-error)' : (isChecked ? (COLOR_TOKENS[color] || COLOR_TOKENS.default) : 'var(--ds-color-border-secondary)');

  const trackStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-block',
    width: dims.trackW,
    height: dims.trackH,
    borderRadius: dims.trackH,
    background: trackColor,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'background 200ms ease-out',
    flexShrink: 0,
  };

  const thumbStyle: React.CSSProperties = {
    position: 'absolute',
    top: thumbInset,
    left: thumbInset,
    width: dims.thumbSize,
    height: dims.thumbSize,
    borderRadius: '50%',
    background: 'var(--ds-surface-control, var(--ds-color-text-on-primary))',
    transform: isChecked ? `translateX(${thumbTravel}px)` : 'translateX(0)',
    transition: 'transform 200ms ease-out',
    boxShadow: 'var(--ds-elevation-1)',
  };

  const displayLabel = label || children;

  return (
    <div className={className || ''} style={{ display: 'flex', flexDirection: 'column', width: '100%', ...(disabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}), ...style }}>
      <label
        htmlFor={inputId}
        style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 8, ...(labelPlacement === 'start' ? { flexDirection: 'row-reverse', justifyContent: 'flex-end' } : { justifyContent: 'flex-start' }) }}
      >
        <input
          id={inputId}
          type="checkbox"
          role="switch"
          name={name}
          value={value}
          checked={isChecked}
          style={{ position: 'absolute', width: 1, height: 1, opacity: 0, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}
          disabled={disabled}
          onChange={handleChange}
          autoFocus={autoFocus}
          aria-checked={isChecked}
          aria-invalid={error}
          {...rest}
        />
        <span style={trackStyle} aria-hidden="true">
          <span style={thumbStyle} />
        </span>
        {(displayLabel || description) && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {displayLabel && (
              <span style={{ fontSize: 14, fontWeight: 500, color: error ? 'var(--ds-color-error)' : 'var(--ds-color-text-primary)' }}>
                {displayLabel}
              </span>
            )}
            {description && (
              <span style={{ fontSize: 12, color: 'var(--ds-color-text-muted)' }}>
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
