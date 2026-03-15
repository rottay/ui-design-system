'use client';

/**
 * @fileoverview OTPInput Rustic Engine - Rottay Design System
 * @description Pure HTML/CSS implementation of the OTPInput component.
 * Row of individual input boxes with auto-advance and paste support.
 *
 * @module OTPInput/Engines/Rustic
 * @category Inputs
 * @package @rottay/design-system
 */

import React, { useState, useCallback, useRef, useId, useEffect } from 'react';
import type { OTPInputProps } from '../OTPInput.types';
import { OTPINPUT_DEFAULTS } from '../OTPInput.types';

const SIZE_STYLES: Record<string, { width: number; height: number; fontSize: number }> = {
  sm: { width: 36, height: 36, fontSize: 16 },
  md: { width: 44, height: 44, fontSize: 20 },
  lg: { width: 52, height: 52, fontSize: 24 },
};

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
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const sizeConfig = SIZE_STYLES[size] || SIZE_STYLES.md;

  const [internalValues, setInternalValues] = useState<string[]>(
    () => (controlledValue || '').split('').concat(Array(length).fill('')).slice(0, length)
  );

  useEffect(() => {
    if (controlledValue !== undefined) {
      setInternalValues(controlledValue.split('').concat(Array(length).fill('')).slice(0, length));
    }
  }, [controlledValue, length]);

  const isValidChar = useCallback((char: string) => {
    if (type === 'numeric') return /^[0-9]$/.test(char);
    return /^[a-zA-Z0-9]$/.test(char);
  }, [type]);

  const updateValue = useCallback((newValues: string[]) => {
    setInternalValues(newValues);
    const joined = newValues.join('');
    onChange?.(joined);
    if (joined.length === length && newValues.every((v) => v !== '')) {
      onComplete?.(joined);
    }
  }, [length, onChange, onComplete]);

  const handleChange = useCallback((index: number, char: string) => {
    if (!isValidChar(char)) return;
    const newValues = [...internalValues];
    newValues[index] = char;
    updateValue(newValues);
    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }, [internalValues, isValidChar, length, updateValue]);

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

  const getInputStyle = (index: number): React.CSSProperties => ({
    width: sizeConfig.width,
    height: sizeConfig.height,
    fontSize: sizeConfig.fontSize,
    textAlign: 'center',
    border: `2px solid ${
      error
        ? 'var(--ds-color-error-500, #ef4444)'
        : focusedIndex === index
          ? 'var(--ds-color-primary-500, #3b82f6)'
          : internalValues[index]
            ? 'var(--ds-color-neutral-400, #9ca3af)'
            : 'var(--ds-color-neutral-300, #d1d5db)'
    }`,
    borderRadius: 8,
    outline: 'none',
    fontFamily: 'var(--ds-font-family-mono, monospace)',
    fontWeight: 700,
    backgroundColor: disabled ? 'var(--ds-color-neutral-100, #f3f4f6)' : 'var(--ds-color-bg-input, #fff)',
    cursor: disabled ? 'not-allowed' : 'text',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxShadow: focusedIndex === index
      ? '0 0 0 3px var(--ds-color-primary-100, rgba(59, 130, 246, 0.2))'
      : 'none',
    caretColor: 'transparent',
  });

  return (
    <div className={`rottay-otp-rustic ${className}`} style={style}>
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
            style={getInputStyle(index)}
            onFocus={(e) => {
              setFocusedIndex(index);
              e.target.select();
            }}
            onBlur={() => setFocusedIndex(-1)}
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
        <span style={{
          fontSize: 12,
          color: 'var(--ds-color-error-500, #ef4444)',
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
