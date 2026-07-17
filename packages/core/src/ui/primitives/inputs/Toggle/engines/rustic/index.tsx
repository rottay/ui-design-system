/**
 * @fileoverview Rustic (zero-dependency) engine for Toggle, using pure HTML, inline CSS,
 * and DS CSS variables. Implements a custom sliding-dot animation, SVG loading spinner,
 * inner ON/OFF labels, and full keyboard accessibility without any CSS framework.
 *
 * @example
 * ```tsx
 * <Toggle engine="rustic" size="lg" color="success" checkedLabel="ON" uncheckedLabel="OFF" />
 * ```
 *
 * @module RusticToggle
 * @category Inputs
 * @package @rottay/design-system
 */

'use client';

import React, { useState, useCallback, useId } from 'react';

import type { ToggleProps } from '../../contracts';
import { TOGGLE_DEFAULTS, SIZE_MAP, SIZE_VALUES, COLOR_MAP } from '../../contracts';

/**
 * Rustic (vanilla HTML/CSS) implementation of Toggle.
 *
 * Builds the entire toggle track, sliding dot, loading spinner, and label layout
 * from inline CSSProperties driven by DS CSS custom properties. The hidden native
 * checkbox provides keyboard and form support, while the visual track is rendered
 * as a sibling `<span>`. Includes Space/Enter key handling on the outer label for
 * screen-reader compatibility beyond the native checkbox behaviour.
 *
 * @param props - Standard ToggleProps shared across all engines.
 * @returns A label element containing a visually-hidden checkbox, CSS track/dot, and optional text.
 */
export default function RusticToggle(props: ToggleProps): React.ReactElement {
  const {
    size = TOGGLE_DEFAULTS.size,
    color = TOGGLE_DEFAULTS.color,
    labelPlacement = TOGGLE_DEFAULTS.labelPlacement,
    label,
    checkedLabel,
    uncheckedLabel,
    description,
    checked: controlledChecked,
    defaultChecked = false,
    disabled = TOGGLE_DEFAULTS.disabled,
    required = TOGGLE_DEFAULTS.required,
    loading = TOGGLE_DEFAULTS.loading,
    error = TOGGLE_DEFAULTS.error,
    errorMessage,
    helperText,
    onChange,
    children,
    name,
    id: providedId,
    value,
    autoFocus,
    className = '',
    style,
    ...rest
  } = props;

  const generatedId = useId();
  const inputId = providedId || `toggle-rustic-${generatedId}`;

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

  // Explicit keyboard handler on the <label> ensures Space/Enter toggle even when
  // assistive technology focuses the label rather than the hidden checkbox.
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (!disabled && !loading) {
        const newChecked = !isChecked;
        if (!isControlled) {
          setInternalChecked(newChecked);
        }
        // Fabricate synthetic event for consistent (checked, event) onChange signature
        const syntheticEvent = {
          target: { checked: newChecked, value },
          currentTarget: { checked: newChecked, value },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange?.(newChecked, syntheticEvent);
      }
    }
  }, [disabled, loading, isChecked, isControlled, value, onChange]);

  const sizeTokens = SIZE_MAP[size] || SIZE_MAP.md;
  const sizeValues = SIZE_VALUES[size] || SIZE_VALUES.md;

  // CSS variable mapping per size -- these reference theme tokens set at the tenant level
  const SIZE_VAR_MAP: Record<string, { width: string; height: string; dot: string }> = {
    sm: {
      width: 'var(--ds-toggle-sm-width)',
      height: 'var(--ds-toggle-sm-height)',
      dot: 'var(--ds-toggle-sm-dot)',
    },
    md: {
      width: 'var(--ds-toggle-md-width)',
      height: 'var(--ds-toggle-md-height)',
      dot: 'var(--ds-toggle-md-dot)',
    },
    lg: {
      width: 'var(--ds-toggle-lg-width)',
      height: 'var(--ds-toggle-lg-height)',
      dot: 'var(--ds-toggle-lg-dot)',
    },
  };

  const sizeVars = SIZE_VAR_MAP[size] || SIZE_VAR_MAP.md;

  /** Resolves track background: unchecked uses neutral, checked picks the color variant. */
  const getTrackBg = () => {
    if (!isChecked) return 'var(--ds-toggle-track-bg)';
    if (color === 'success') return 'var(--ds-toggle-success-bg)';
    if (color === 'warning') return 'var(--ds-toggle-warning-bg)';
    if (color === 'error') return 'var(--ds-toggle-error-bg)';
    return 'var(--ds-toggle-track-bg-checked)';
  };

  const containerStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'flex-start',
    gap: '8px',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    flexDirection: labelPlacement === 'start' ? 'row-reverse' : 'row',
    fontFamily: 'var(--ds-font-family-base)',
    ...style,
  };

  const trackStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    width: sizeVars.width,
    height: sizeVars.height,
    transition: 'var(--ds-toggle-transition)',
    flexShrink: 0,
    ...({ '--ds-toggle-track-fill': getTrackBg() } as React.CSSProperties),
  };

  // Dot slides left/right via `left` transition with a spring-like cubic-bezier
  // that gives the toggle a satisfying "snap" feel.
  const dotStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: isChecked ? `calc(100% - ${sizeTokens.dot} - 2px)` : '2px',
    width: sizeVars.dot,
    height: sizeVars.dot,
    transition: 'left 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s, background-color 0.15s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  // The checkbox is visually hidden but covers the track so clicks register natively
  const inputStyle: React.CSSProperties = {
    position: 'absolute',
    opacity: 0,
    width: '100%',
    height: '100%',
    margin: 0,
    padding: 0,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
  };

  const labelContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 'var(--ds-toggle-label-font-size)',
    userSelect: 'none',
    lineHeight: 1.4,
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize: 'var(--ds-toggle-description-font-size)',
    userSelect: 'none',
    lineHeight: 1.4,
  };

  const displayLabel = label || children;

  return (
    <label
      className={`rottay-toggle-rustic ds-toggle ds-toggle--rustic rottay-toggle--${size} rottay-toggle--${color} ${isChecked ? 'rottay-toggle--checked' : ''} ${disabled ? 'rottay-toggle--disabled' : ''} ${loading ? 'rottay-toggle--loading' : ''} ${error ? 'rottay-toggle--error' : ''} ${className}`}
      data-part="root"
      data-checked={isChecked ? 'true' : 'false'}
      data-disabled={disabled ? 'true' : 'false'}
      data-error={error ? 'true' : 'false'}
      data-loading={loading ? 'true' : 'false'}
      style={containerStyle}
      onKeyDown={handleKeyDown}
      {...rest}
    >
      <span
        className="rottay-toggle__track"
        data-part="track"
        style={trackStyle}
        role="presentation"
      >
        <input
          id={inputId}
          type="checkbox"
          role="switch"
          name={name}
          value={value}
          checked={isChecked}
          disabled={disabled || loading}
          required={required}
          onChange={handleChange}
          autoFocus={autoFocus}
          style={inputStyle}
          aria-checked={isChecked}
          aria-invalid={error}
          aria-busy={loading}
          aria-describedby={displayLabel ? `${inputId}-label` : undefined}
        />
        <span className="rottay-toggle__dot" data-part="thumb" style={dotStyle}>
          {loading && (
            <svg
              className="rottay-toggle__spinner"
              data-part="spinner"
              width={sizeValues.dot * 0.6}
              height={sizeValues.dot * 0.6}
              viewBox="0 0 16 16"
              fill="none"
              style={{ animation: 'spin 1s linear infinite' }}
            >
              <circle
                cx="8"
                cy="8"
                r="6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="30 10"
                fill="none"
              />
            </svg>
          )}
        </span>
        {(checkedLabel || uncheckedLabel) && (
          <span
            className="rottay-toggle__inner-label"
            data-part="inner-label"
            style={{
              position: 'absolute',
              left: isChecked ? '6px' : 'auto',
              right: isChecked ? 'auto' : '6px',
              fontSize: 'var(--ds-toggle-inner-label-font-size)',
              fontWeight: 500,
              userSelect: 'none',
            }}
          >
            {isChecked ? checkedLabel : uncheckedLabel}
          </span>
        )}
      </span>
      {(displayLabel || description) && (
        <span
          id={`${inputId}-label`}
          className="rottay-toggle__content"
          style={labelContainerStyle}
        >
          {displayLabel && (
            <span className="rottay-toggle__label" data-part="label" style={labelStyle}>
              {displayLabel}
            </span>
          )}
          {description && (
            <span className="rottay-toggle__description" data-part="description" style={descriptionStyle}>
              {description}
            </span>
          )}
        </span>
      )}
    </label>
  );
}

RusticToggle.displayName = 'RusticToggle';
