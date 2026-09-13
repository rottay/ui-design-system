'use client';

/**
 * @fileoverview OTPInput Modern Engine - Rottay Design System.
 * A row of single-character inputs with auto-advance, backspace navigation and
 * paste distribution. Every visual decision lives in the modern skin
 * (`skin/otp-input`) keyed on `data-part`, `data-size`, `data-disabled`,
 * `data-error`, `data-filled` and the kernel's `data-state`; the public `style`
 * escape hatch stays on the outer field.
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

import React, { useState, useCallback, useRef, useId, useMemo } from 'react';
import { arrayValueAt, setArrayValueAt } from '@/foundation/kernel/collections';
import { isComposingKey, partAttributes, useInteractionState } from '@/foundation/behavior';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import type { OTPInputProps } from '../../contracts';
import { OTPINPUT_DEFAULTS } from '../../contracts';

function focusInputAt(inputs: readonly (HTMLInputElement | null)[], index: number): void {
  arrayValueAt(inputs, index)?.focus();
}

type SlotProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  inputRef: (element: HTMLInputElement | null) => void;
  error: boolean;
  filled: boolean;
};

function OtpSlot({ inputRef, error, filled, disabled, onFocus, onBlur, ...input }: SlotProps): React.ReactElement {
  const { state, handlers } = useInteractionState({ disabled });
  return (
    <input
      {...input}
      ref={inputRef}
      {...partAttributes('slot', state)}
      data-error={error ? 'true' : 'false'}
      data-filled={filled ? 'true' : 'false'}
      disabled={disabled}
      onPointerEnter={handlers.onPointerEnter}
      onPointerLeave={handlers.onPointerLeave}
      onPointerDown={handlers.onPointerDown}
      onPointerUp={handlers.onPointerUp}
      onPointerCancel={handlers.onPointerUp}
      onFocus={(event) => {
        handlers.onFocus(event);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        handlers.onBlur(event);
        onBlur?.(event);
      }}
    />
  );
}

/**
 * Modern engine OTPInput: each character occupies its own
 * `<input maxLength={1}>` painted by the modern skin.
 *
 * @param props - Unified OTPInputProps from the design system contract.
 * @returns A skin-painted row of single-character inputs.
 */
export default function ModernOTPInput(props: OTPInputProps): React.ReactElement {
  const i18n = useOptionalTranslation();
  const digitLabel = (index: number, total: number): string =>
    i18n?.tOr('components.otp.digit_label', 'Digit {index} of {length}', { index: index + 1, length: total })
      ?? `Digit ${index + 1} of ${total}`;
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
  const composingRef = useRef(false);
  const composedDraftRef = useRef('');

  const [internalValues, setInternalValues] = useState<string[]>(
    () => (controlledValue || '').split('').concat(Array(length).fill('')).slice(0, length)
  );

  // Controlled parent owns the truth: a change it refuses never survives locally.
  const values = useMemo(
    () =>
      controlledValue === undefined
        ? internalValues
        : controlledValue.split('').concat(Array(length).fill('')).slice(0, length),
    [controlledValue, internalValues, length]
  );

  // Full-width digits and letters from an IME fold to their ASCII form.
  const acceptedChars = useCallback((text: string): string[] => {
    const pattern = type === 'numeric' ? /^[0-9]$/ : /^[a-zA-Z0-9]$/;
    return text.normalize('NFKC').split('').filter((char) => pattern.test(char));
  }, [type]);

  const wasCompleteRef = useRef(false);
  const updateValue = useCallback((newValues: string[]) => {
    setInternalValues(newValues);
    const joined = newValues.join('');
    onChange?.(joined);
    const complete = joined.length === length && newValues.every((v) => v !== '');
    // onComplete is an auto-submit edge, not a level: correcting a slot of an
    // already-full code must not submit it again.
    if (complete && !wasCompleteRef.current) {
      onComplete?.(joined);
    }
    wasCompleteRef.current = complete;
  }, [length, onChange, onComplete]);

  /** Write `chars` from `startIndex` onward and land focus after the last one. */
  const distribute = useCallback((chars: string[], startIndex: number) => {
    if (chars.length === 0) return;
    const newValues = [...values];
    chars.forEach((char, i) => {
      const slot = startIndex + i;
      if (slot < length) newValues[slot] = char;
    });
    updateValue(newValues);
    focusInputAt(inputRefs.current, Math.min(startIndex + chars.length, length - 1));
  }, [values, length, updateValue]);

  const commitInput = useCallback((index: number, incoming: string) => {
    const chars = acceptedChars(incoming).slice(0, length - index);
    if (chars.length > 1) {
      // One-time-code autofill delivers the whole code into one slot as an input event.
      distribute(chars, index);
      return;
    }
    const [char] = chars;
    if (!char) return;
    const newValues = [...values];
    newValues[index] = char;
    updateValue(newValues);
    if (index < length - 1) focusInputAt(inputRefs.current, index + 1);
  }, [acceptedChars, distribute, length, values, updateValue]);

  /**
   * Backspace clears the slot (or retreats when already empty), Delete clears
   * in place, Home/End jump to the ends. The row is a positional code rendered
   * left to right in every locale, so ArrowLeft is always the previous slot.
   */
  const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isComposingKey(e)) return;
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newValues = [...values];
      if (arrayValueAt(values, index)) {
        newValues[index] = '';
        updateValue(newValues);
      } else if (index > 0) {
        newValues[index - 1] = '';
        updateValue(newValues);
        focusInputAt(inputRefs.current, index - 1);
      }
    } else if (e.key === 'Delete') {
      if (arrayValueAt(values, index)) {
        e.preventDefault();
        const newValues = [...values];
        newValues[index] = '';
        updateValue(newValues);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      focusInputAt(inputRefs.current, index - 1);
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      focusInputAt(inputRefs.current, index + 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      focusInputAt(inputRefs.current, 0);
    } else if (e.key === 'End') {
      e.preventDefault();
      focusInputAt(inputRefs.current, length - 1);
    }
  }, [values, length, updateValue]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    distribute(acceptedChars(e.clipboardData.getData('text').trim()).slice(0, length), 0);
  }, [acceptedChars, distribute, length]);

  return (
    <div className={`ds-otp-input-field ${className || ''}`.trim()} style={style} data-part="field">
      <div
        className="ds-otp-input ds-otp-input--modern"
        data-part="root"
        data-size={size}
        data-disabled={disabled ? 'true' : 'false'}
        dir="ltr"
      >
        {Array.from({ length }, (_, index) => (
          <OtpSlot
            key={index}
            inputRef={(el) => { setArrayValueAt(inputRefs.current, index, el); }}
            id={`${idPrefix}-${index}`}
            name={name ? `${name}-${index}` : undefined}
            type={mask ? 'password' : 'text'}
            inputMode={type === 'numeric' ? 'numeric' : 'text'}
            maxLength={1}
            error={error}
            filled={Boolean(arrayValueAt(values, index))}
            value={arrayValueAt(values, index) || ''}
            disabled={disabled}
            autoFocus={autoFocus && index === 0}
            onFocus={(e) => { e.target.select(); }}
            onCompositionStart={() => { composingRef.current = true; composedDraftRef.current = ''; }}
            onCompositionEnd={(e) => {
              composingRef.current = false;
              commitInput(index, e.data || composedDraftRef.current || e.currentTarget.value);
            }}
            onChange={(e) => {
              // A half-composed candidate is not a character yet; composition end commits it.
              if (composingRef.current || (e.nativeEvent as InputEvent).isComposing) {
                composedDraftRef.current = e.target.value;
                return;
              }
              commitInput(index, e.target.value);
            }}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            aria-label={digitLabel(index, length)}
            aria-invalid={error || undefined}
            aria-describedby={error && errorMessage ? errorMessageId : undefined}
          />
        ))}
      </div>
      {error && errorMessage && (
        <span id={errorMessageId} data-part="error-message" role="alert">{errorMessage}</span>
      )}
    </div>
  );
}

ModernOTPInput.displayName = 'OTPInput.Modern';
