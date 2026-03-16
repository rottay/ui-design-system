'use client';

/**
 * @fileoverview OTPInput Classic Engine - Rottay Design System.
 * Renders a row of individual digit inputs styled to match Ant Design's
 * visual language. Handles auto-advance, backspace navigation, paste
 * distribution, and completion callbacks.
 *
 * @example
 * ```tsx
 * <OTPInput engine="classic" length={6} type="numeric" onComplete={handleVerify} />
 * ```
 *
 * @module OTPInput/Engines/Classic
 * @category Inputs
 * @package @rottay/design-system
 */

import React, { useState, useCallback, useRef, useId, useEffect } from 'react';
import type { OTPInputProps } from '../OTPInput.types';
import { OTPINPUT_DEFAULTS } from '../OTPInput.types';

/** Pixel dimensions and font size for each size tier, matching Ant Design spacing. */
const SIZE_STYLES: Record<string, { width: number; height: number; fontSize: number }> = {
  sm: { width: 36, height: 36, fontSize: 16 },
  md: { width: 44, height: 44, fontSize: 20 },
  lg: { width: 52, height: 52, fontSize: 24 },
};

/**
 * Classic engine OTPInput styled like Ant Design.
 * Each digit occupies its own `<input maxLength={1}>` box. Focus auto-advances
 * on character entry and retreats on backspace for fluid typing.
 *
 * @param props - Unified OTPInputProps from the design system contract.
 * @returns A flex row of single-character inputs with optional error display.
 */
export default function ClassicOTPInput(props: OTPInputProps): React.ReactElement {
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
    className,
    style,
    id: providedId,
  } = props;

  const generatedId = useId();
  const idPrefix = providedId || `otp-classic-${generatedId}`;
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
   * onComplete fires only when every slot is filled, enabling auto-submit flows.
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
      inputRefs.current[index + 1]?.focus();
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
      if (internalValues[index]) {
        newValues[index] = '';
        updateValue(newValues);
      } else if (index > 0) {
        newValues[index - 1] = '';
        updateValue(newValues);
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
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
    inputRefs.current[focusIndex]?.focus();
  }, [internalValues, isValidChar, length, updateValue]);

  const inputStyle: React.CSSProperties = {
    width: sizeConfig.width,
    height: sizeConfig.height,
    fontSize: sizeConfig.fontSize,
    textAlign: 'center',
    border: `1px solid ${error ? 'var(--ds-color-error-500, #ff4d4f)' : 'var(--ds-color-neutral-300, #d9d9d9)'}`,
    borderRadius: 8,
    outline: 'none',
    fontFamily: 'var(--ds-font-family-mono, monospace)',
    fontWeight: 600,
    transition: 'border-color 0.2s, box-shadow 0.2s',
    backgroundColor: disabled ? 'var(--ds-color-neutral-100, #f5f5f5)' : '#fff',
    cursor: disabled ? 'not-allowed' : 'text',
  };

  return (
    <div className={`rottay-otp-classic ${className || ''}`} style={style}>
      <div style={{ display: 'flex', gap: 8 }}>
        {Array.from({ length }, (_, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            id={`${idPrefix}-${index}`}
            type={mask ? 'password' : 'text'}
            inputMode={type === 'numeric' ? 'numeric' : 'text'}
            maxLength={1}
            value={internalValues[index] || ''}
            disabled={disabled}
            autoFocus={autoFocus && index === 0}
            style={inputStyle}
            onFocus={(e) => {
              e.target.select();
              e.target.style.borderColor = error ? 'var(--ds-color-error-500, #ff4d4f)' : 'var(--ds-color-primary-500, #1890ff)';
              e.target.style.boxShadow = '0 0 0 2px var(--ds-color-primary-100, rgba(24, 144, 255, 0.2))';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = error ? 'var(--ds-color-error-500, #ff4d4f)' : 'var(--ds-color-neutral-300, #d9d9d9)';
              e.target.style.boxShadow = 'none';
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
        <span style={{ fontSize: 12, color: 'var(--ds-color-error-500, #ff4d4f)', marginTop: 4, display: 'block' }}>
          {errorMessage}
        </span>
      )}
    </div>
  );
}

ClassicOTPInput.displayName = 'OTPInput.Classic';
