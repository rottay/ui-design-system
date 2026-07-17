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
import type { ToggleProps } from '../../contracts';
import { TOGGLE_DEFAULTS } from '../../contracts';

/** Toggle track dimensions per size, driven by DS tokens with px fallbacks. */
const SIZE_DIMS: Record<string, { trackW: string; trackH: string; thumbSize: string }> = {
  xs: { trackW: 'var(--ds-toggle-xs-width, 28px)', trackH: 'var(--ds-toggle-xs-height, 16px)', thumbSize: 'var(--ds-toggle-xs-dot, 12px)' },
  sm: { trackW: 'var(--ds-toggle-sm-width, 32px)', trackH: 'var(--ds-toggle-sm-height, 18px)', thumbSize: 'var(--ds-toggle-sm-dot, 14px)' },
  md: { trackW: 'var(--ds-toggle-md-width, 44px)', trackH: 'var(--ds-toggle-md-height, 24px)', thumbSize: 'var(--ds-toggle-md-dot, 20px)' },
  lg: { trackW: 'var(--ds-toggle-lg-width, 56px)', trackH: 'var(--ds-toggle-lg-height, 30px)', thumbSize: 'var(--ds-toggle-lg-dot, 26px)' },
  xl: { trackW: 'var(--ds-toggle-xl-width, 44px)', trackH: 'var(--ds-toggle-xl-height, 24px)', thumbSize: 'var(--ds-toggle-xl-dot, 20px)' },
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
  const trackColor = error ? 'var(--ds-color-error)' : (isChecked ? (COLOR_TOKENS[color] || COLOR_TOKENS.default) : 'var(--ds-color-border-secondary)');

  // Use CSS calc() for thumb positioning so dimensions stay token-driven.
  // thumbInset = (trackH - thumbSize) / 2
  // thumbTravel = trackW - thumbSize - thumbInset * 2 = trackW - thumbSize - (trackH - thumbSize)
  //             = trackW - trackH
  const trackStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-block',
    width: dims.trackW,
    height: dims.trackH,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'background var(--ds-motion-normal) var(--ds-motion-ease-out)',
    flexShrink: 0,
    ...({ '--ds-toggle-track-r': dims.trackH, '--ds-toggle-track-fill': trackColor } as React.CSSProperties),
  };

  const thumbStyle: React.CSSProperties = {
    position: 'absolute',
    top: `calc((${dims.trackH} - ${dims.thumbSize}) / 2)`,
    left: `calc((${dims.trackH} - ${dims.thumbSize}) / 2)`,
    width: dims.thumbSize,
    height: dims.thumbSize,
    transition: 'transform var(--ds-motion-normal) var(--ds-motion-ease-out)',
    ...({ '--ds-toggle-thumb-x': isChecked ? `calc(${dims.trackW} - ${dims.trackH})` : '0' } as React.CSSProperties),
  };

  const displayLabel = label || children;

  return (
    <div className={className || ''} style={{ display: 'flex', flexDirection: 'column', width: '100%', ...(disabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}), ...style }}>
      <label
        htmlFor={inputId}
        className="ds-toggle ds-toggle--modern"
        data-part="root"
        data-checked={isChecked ? 'true' : 'false'}
        data-disabled={disabled ? 'true' : 'false'}
        data-error={error ? 'true' : 'false'}
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
        <span data-part="track" style={trackStyle} aria-hidden="true">
          <span data-part="thumb" style={thumbStyle} />
        </span>
        {(displayLabel || description) && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {displayLabel && (
              <span data-part="label" style={{ fontSize: 'var(--ds-font-size-sm, 14px)', fontWeight: 500 }}>
                {displayLabel}
              </span>
            )}
            {description && (
              <span data-part="description" style={{ fontSize: 'var(--ds-font-size-xs, 12px)' }}>
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
