'use client';

/**
 * @fileoverview OTPInput Rustic Engine - Rottay Design System.
 * Pure HTML/CSS implementation using CSS custom properties (--ds-color-*)
 * so theming is driven entirely by tenant-level token overrides. Renders a
 * row of individual digit inputs with auto-advance and paste distribution.
 *
 * @example
 * ```tsx
 * <OTPInput engine="rustic" length={6} type="numeric" mask onComplete={handleVerify} />
 * ```
 *
 * @module OTPInput/Engines/Rustic
 * @category Inputs
 * @package @rottay/design-system
 */

import React, { useState, useCallback, useRef, useId, useEffect } from 'react';
import { arrayValueAt, setArrayValueAt } from '@/_internal/utils/collections';
import type { OTPInputProps } from '../OTPInput.types';
import { OTPINPUT_DEFAULTS } from '../OTPInput.types';

/** Pixel dimensions and font size for each size tier. */
const SIZE_STYLES: Record<string, { width: number; height: number; fontSize: number }> = {
  sm: { width: 36, height: 36, fontSize: 16 },
  md: { width: 44, height: 44, fontSize: 20 },
  lg: { width: 52, height: 52, fontSize: 24 },
};

function focusInputAt(inputs: readonly (HTMLInputElement | null)[], index: number): void {
  arrayValueAt(inputs, index)?.focus();
}

/**
 * Rustic engine OTPInput built with pure HTML/CSS and design-system CSS variables.
 * Each digit occupies its own `<input maxLength={1}>` box. Tracks focused slot
 * to render a ring shadow without relying on CSS :focus-visible (cross-browser safety).
 *
 * @param props - Unified OTPInputProps from the design system contract.
 * @returns A theme-aware flex row of single-character inputs with optional error display.
 */
export default function RusticOTPInput(props: OTPInputProps): React.ReactElement {
  const {
    length = OTPINPUT_DEFAULTS.length,
    value: controlledValue,
    onChange,
    onComplete,
    autoFocus = OTPINPUT_DEFAULTS.autoFocus,
    type = OTPINPUT_DEFAULTS.type,
    size = OTPINPUT_DEFAULTS.size,
    disabled = OTPINPUT_DEFAULTS.disabled,
    error = OTPINPUT_DEFAULTS.error,
    errorMessage,
    mask = OTPINPUT_DEFAULTS.mask,
    className = '',
    style,
    id: providedId,
  } = props;

  const generatedId = useId();
  const idPrefix = providedId || `otp-rustic-${generatedId}`;
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const sizeConfig = SIZE_STYLES[size] || SIZE_STYLES.md;

  // Initialize per-slot values by splitting the controlled value and padding with empty strings
  const [internalValues, setInternalValues] = useState<string[]>(
    () => (controlledValue || '').split('').concat(Array(length).fill('')).slice(0, length)
  );

  // Sync internal state when parent changes the controlled value
  useEffect(() => {
    if (controlledValue !== undefined) {
      setInternalValues(controlledValue.split('').concat(Array(length).fill('')).slice(0, length));
    }
  }, [controlledValue, length]);

  /** Validate a single character against the configured input type (numeric or alphanumeric). */
  const isValidChar = useCallback((char: string) => {
    if (type === 'numeric') return /^[0-9]$/.test(char);
    return /^[a-zA-Z0-9]$/.test(char);
  }, [type]);

  /**
   * Persist slot values and fire onChange/onComplete callbacks.
   * onComplete only fires when every slot is filled, enabling auto-submit flows.
   */
  const updateValue = useCallback((newValues: string[]) => {
    setInternalValues(newValues);
    const joined = newValues.join('');
    onChange?.(joined);
    if (joined.length === length && newValues.every((v) => v !== '')) {
      onComplete?.(joined);
    }
  }, [length, onChange, onComplete]);

  /** Write a valid character to the current slot and auto-advance focus to the next. */
  const handleChange = useCallback((index: number, char: string) => {
    if (!isValidChar(char)) return;
    const newValues = [...internalValues];
    newValues[index] = char;
    updateValue(newValues);
    if (index < length - 1) {
      focusInputAt(inputRefs.current, index + 1);
    }
  }, [internalValues, isValidChar, length, updateValue]);

  /**
   * Keyboard navigation: Backspace clears the current slot (or retreats to
   * the previous one if already empty); ArrowLeft/Right moves focus laterally.
   */
  const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newValues = [...internalValues];
      if (arrayValueAt(internalValues, index)) {
        newValues[index] = '';
        updateValue(newValues);
      } else if (index > 0) {
        newValues[index - 1] = '';
        updateValue(newValues);
        focusInputAt(inputRefs.current, index - 1);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      focusInputAt(inputRefs.current, index - 1);
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      focusInputAt(inputRefs.current, index + 1);
    }
  }, [internalValues, length, updateValue]);

  /**
   * Paste handler: distributes clipboard text across slots (filtered by type),
   * then focuses the slot after the last pasted character.
   */
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    const chars = pasted.split('').filter(isValidChar).slice(0, length);
    if (chars.length === 0) return;
    const newValues = [...internalValues];
    chars.forEach((char, i) => {
      if (i < length) newValues[i] = char;
    });
    updateValue(newValues);
    const focusIndex = Math.min(chars.length, length - 1);
    focusInputAt(inputRefs.current, focusIndex);
  }, [internalValues, isValidChar, length, updateValue]);

  /**
   * Compute per-slot inline styles: border color varies by error/focus/filled state,
   * and a focus ring shadow is applied via JS since :focus-visible is not fully portable.
   */
  const getInputStyle = (): React.CSSProperties => ({
    width: sizeConfig.width,
    height: sizeConfig.height,
    fontSize: sizeConfig.fontSize,
    textAlign: 'center',
    fontFamily: 'var(--ds-font-family-mono, monospace)',
    fontWeight: 700,
    cursor: disabled ? 'not-allowed' : 'text',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    caretColor: 'transparent',
  });

  return (
    <div className={`rottay-otp-rustic ds-otp-input ds-otp-input--rustic ${className}`} style={style}>
      <div className="ds-otp-input__row" data-part="root" data-disabled={disabled ? 'true' : 'false'} style={{ display: 'flex', gap: 8 }}>
        {Array.from({ length }, (_, index) => (
          <input
            key={index}
            ref={(el) => { setArrayValueAt(inputRefs.current, index, el); }}
            id={`${idPrefix}-${index}`}
            type={mask ? 'password' : 'text'}
            inputMode={type === 'numeric' ? 'numeric' : 'text'}
            maxLength={1}
            data-part="slot"
            data-error={error ? 'true' : 'false'}
            data-filled={arrayValueAt(internalValues, index) ? 'true' : 'false'}
            value={arrayValueAt(internalValues, index) || ''}
            disabled={disabled}
            autoFocus={autoFocus && index === 0}
            style={getInputStyle()}
            onFocus={(e) => {
              e.target.select();
            }}
            onChange={(e) => {
              const char = e.target.value.slice(-1);
              if (char) handleChange(index, char);
            }}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            aria-label={`Digit ${index + 1} of ${length}`}
          />
        ))}
      </div>
      {error && errorMessage && (
        <span data-part="error-message" style={{
          fontSize: 12,
          marginTop: 6,
          display: 'block',
        }}>
          {errorMessage}
        </span>
      )}
    </div>
  );
}

RusticOTPInput.displayName = 'OTPInput.Rustic';
