'use client';

/**
 * @fileoverview OTPInput Modern Engine - Rottay Design System.
 * Custom implementation rendering a row of individual digit inputs with
 * auto-advance, backspace navigation, and paste distribution -- no DaisyUI
 * classes. All static paint and geometry (row flex/gap, per-size slot boxes,
 * monospace slot typography, disabled posture, error gap/typography) are
 * owned by the modern skin (`skin/otp-input.css`) keyed on
 * `data-part`/`data-size`/`data-disabled`; no inline styles remain on any
 * part. The public `style` escape hatch stays on the outer wrapper.
 *
 * @example
 * ```tsx
 * <OTPInput engine="modern" length={6} type="numeric" onComplete={handleVerify} />
 * ```
 *
 * @module OTPInput/Engines/Modern
 * @category Inputs
 * @package @rottay/design-system
 */

import React, { useState, useCallback, useRef, useId, useEffect } from 'react';
import { arrayValueAt, setArrayValueAt } from '@/foundation/kernel/collections';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import type { OTPInputProps } from '../../contracts';
import { OTPINPUT_DEFAULTS } from '../../contracts';

function focusInputAt(inputs: readonly (HTMLInputElement | null)[], index: number): void {
  arrayValueAt(inputs, index)?.focus();
}

/**
 * Modern engine OTPInput: each digit occupies its own
 * `<input maxLength={1}>` box painted by the modern skin. Focus auto-advances
 * on entry and retreats on backspace.
 *
 * @param props - Unified OTPInputProps from the design system contract.
 * @returns A skin-painted flex row of single-character inputs.
 */
export default function ModernOTPInput(props: OTPInputProps): React.ReactElement {
  // Optional provider + English floor (the floor must stay byte-identical to
  // the historical label: the quality contract pins `Digit N of M`). The tOr
  // guard keeps a missing catalogue entry from echoing the raw key into the
  // accessible name (the AutoComplete engine's idiom).
  const i18n = useOptionalTranslation('components');
  const digitLabel = (index: number, total: number): string => {
    const resolved = i18n?.t('otp.digit_label', { index: index + 1, length: total });
    if (!resolved || resolved === 'otp.digit_label' || resolved === 'components.otp.digit_label') {
      return `Digit ${index + 1} of ${total}`;
    }
    return resolved;
  };
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
    name,
    className,
    style,
    id: providedId,
  } = props;

  const generatedId = useId();
  const idPrefix = providedId || `otp-modern-${generatedId}`;
  const errorMessageId = `${idPrefix}-error`;
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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
   * the previous one if already empty); Delete clears the current slot in
   * place; ArrowLeft/Right moves focus laterally; Home/End jump to the
   * first/last slot. The digit row is LTR by contract (an OTP never mirrors),
   * so ArrowLeft is always the previous index regardless of locale direction.
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
    } else if (e.key === 'Delete') {
      if (arrayValueAt(internalValues, index)) {
        e.preventDefault();
        const newValues = [...internalValues];
        newValues[index] = '';
        updateValue(newValues);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      focusInputAt(inputRefs.current, index - 1);
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      focusInputAt(inputRefs.current, index + 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      focusInputAt(inputRefs.current, 0);
    } else if (e.key === 'End') {
      e.preventDefault();
      focusInputAt(inputRefs.current, length - 1);
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

  return (
    <div className={className} style={style} data-part="field">
      <div className="ds-otp-input ds-otp-input--modern" data-part="root" data-size={size} data-disabled={disabled ? 'true' : 'false'}>
        {Array.from({ length }, (_, index) => (
          <input
            key={index}
            ref={(el) => { setArrayValueAt(inputRefs.current, index, el); }}
            id={`${idPrefix}-${index}`}
            name={name ? `${name}-${index}` : undefined}
            type={mask ? 'password' : 'text'}
            inputMode={type === 'numeric' ? 'numeric' : 'text'}
            maxLength={1}
            data-part="slot"
            data-error={error ? 'true' : 'false'}
            data-filled={arrayValueAt(internalValues, index) ? 'true' : 'false'}
            value={arrayValueAt(internalValues, index) || ''}
            disabled={disabled}
            autoFocus={autoFocus && index === 0}
            onFocus={(e) => { e.target.select(); }}
            onChange={(e) => {
              const char = e.target.value.slice(-1);
              if (char) handleChange(index, char);
            }}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            // The first slot invites the platform's one-time-code autofill;
            // the paste handler above distributes it across every slot.
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            aria-label={digitLabel(index, length)}
            aria-invalid={error || undefined}
            aria-describedby={error && errorMessage ? errorMessageId : undefined}
          />
        ))}
      </div>
      {error && errorMessage && (
        <div data-part="error-wrapper">
          <span id={errorMessageId} data-part="error-message" role="alert">{errorMessage}</span>
        </div>
      )}
    </div>
  );
}

ModernOTPInput.displayName = 'OTPInput.Modern';
