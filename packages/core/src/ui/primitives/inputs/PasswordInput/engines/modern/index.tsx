/**
 * @fileoverview PasswordInput Modern Engine - Rottay Design System.
 * Premium password control painted entirely by the modern skin
 * (`foundation/tokens/css/runtime/engines/modern/skin/password-input.css`), keyed
 * on the `data-*` contract this component stamps: `data-variant`, `data-size`,
 * `data-error`, `data-disabled`, `data-readonly`, `data-filled`,
 * `data-strength`, and the `data-part` / `data-state` anatomy attributes from
 * `behavior/anatomy.ts`.
 *
 * @remarks
 * The shell mirrors the Modern Input addon branch: a neutral `<div>` owns the
 * chrome, the inner `<input>` stays a transparent passthrough, and the
 * visibility toggle is a real inline button -- keyboard reachable, labeled from
 * the i18n catalog (`common.show_password` / `common.hide_password`), and
 * positioned with logical properties so RTL needs no branch. The strength
 * meter is a real `progressbar` whose fill width/color the skin derives from
 * `data-strength`, so no runtime paint survives on any part.
 *
 * @example
 * ```tsx
 * <PasswordInput engine="modern" showToggle strengthIndicator strengthLevel="medium" />
 * ```
 *
 * @module ModernPasswordInput
 * @category Inputs
 * @package @rottay/design-system
 */

'use client';

import React, { useState, useCallback, useId } from 'react';
import { partAttributes, useInteractionState } from '../../../../../../foundation/behavior';
import type { PasswordInputProps, PasswordStrengthLevel } from '../../contracts';
import { PASSWORD_INPUT_DEFAULTS } from '../../contracts';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';

/** aria-valuenow for the strength progressbar, aligned with STRENGTH_WIDTHS. */
const STRENGTH_VALUES: Record<PasswordStrengthLevel, number> = {
  weak: 25,
  fair: 50,
  good: 75,
  strong: 100,
};

/** Eye (reveal) / eye-off (conceal) glyphs, decorative -- the button carries the name. */
function VisibilityGlyph({ visible }: { visible: boolean }) {
  return visible ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

/**
 * Modern engine PasswordInput painted by the modern skin.
 * Manages its own visibility toggle state; every visual decision -- geometry,
 * density, states, RTL, autofill, strength meter -- lives in the skin.
 *
 * @param props - Unified PasswordInputProps from the design system contract.
 * @returns A token-painted password input with toggle, strength meter, and error anatomy.
 */
export default function ModernPasswordInput(props: PasswordInputProps): React.ReactElement {
  const {
    size = PASSWORD_INPUT_DEFAULTS.size,
    variant = PASSWORD_INPUT_DEFAULTS.variant,
    placeholder,
    value,
    defaultValue,
    disabled = PASSWORD_INPUT_DEFAULTS.disabled,
    readOnly = PASSWORD_INPUT_DEFAULTS.readOnly,
    required = PASSWORD_INPUT_DEFAULTS.required,
    error = PASSWORD_INPUT_DEFAULTS.error,
    errorMessage,
    maxLength,
    showToggle = PASSWORD_INPUT_DEFAULTS.showToggle,
    strengthIndicator = PASSWORD_INPUT_DEFAULTS.strengthIndicator,
    strengthLevel,
    visibleIcon,
    hiddenIcon,
    onChange,
    onFocus,
    onBlur,
    onKeyDown,
    onPressEnter,
    className = '',
    style,
    name,
    id: providedId,
    autoComplete = PASSWORD_INPUT_DEFAULTS.autoComplete,
    autoFocus,
    'aria-label': ariaLabel,
    'data-testid': dataTestId,
  } = props;

  const translation = useOptionalTranslation('common');
  const generatedId = useId();
  const inputId = providedId || `password-modern-${generatedId.replace(/:/g, '')}`;
  const errorMessageId = `${inputId}-error`;
  // Local toggle state for password visibility (not exposed to parent)
  const [visible, setVisible] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // The hover/focus triad is decided once, in the behavior core, and the skin
  // keys off `focused` -- a text field's border is not a keyboard-only
  // affordance, so the ring follows any real focus, pointer or keyboard.
  const { state: interaction, handlers: interactionHandlers } = useInteractionState({ disabled });

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value, e);
  }, [onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e);
    if (e.key === 'Enter') {
      onPressEnter?.(e);
    }
  }, [onKeyDown, onPressEnter]);

  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    interactionHandlers.onFocus(e);
    onFocus?.(e);
  }, [interactionHandlers, onFocus]);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    interactionHandlers.onBlur(e);
    onBlur?.(e);
  }, [interactionHandlers, onBlur]);

  const handleToggleVisibility = useCallback(() => {
    setVisible((previous) => !previous);
    inputRef.current?.focus();
  }, []);

  const isFilled = String(value ?? defaultValue ?? '').length > 0;
  const describedBy = error && errorMessage ? errorMessageId : undefined;

  return (
    <div
      className={`ds-password-input-field ${className}`.trim()}
      data-part="field"
      style={style}
      data-testid={dataTestId}
    >
      <div
        className="ds-password-input ds-password-input--modern"
        onClick={(event) => {
          const target = event.target as HTMLElement;
          if (!target.closest('input, button')) inputRef.current?.focus();
        }}
        onPointerEnter={interactionHandlers.onPointerEnter}
        onPointerLeave={interactionHandlers.onPointerLeave}
        {...partAttributes('root', interaction)}
        data-variant={variant}
        data-size={size}
        data-error={error ? 'true' : 'false'}
        data-disabled={disabled ? 'true' : 'false'}
        data-readonly={readOnly ? 'true' : 'false'}
        data-filled={isFilled ? 'true' : 'false'}
      >
        <input
          ref={inputRef}
          id={inputId}
          className="ds-password-input__control"
          data-part="control"
          type={visible ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          maxLength={maxLength}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          name={name}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          aria-label={ariaLabel}
          aria-invalid={error || undefined}
          aria-required={required || undefined}
          aria-describedby={describedBy}
        />
        {showToggle && (
          <button
            type="button"
            data-part="visibility-toggle"
            data-visible={visible ? 'true' : 'false'}
            disabled={disabled}
            onClick={handleToggleVisibility}
            aria-label={
              visible
                ? translation?.t('hide_password') ?? 'Hide password'
                : translation?.t('show_password') ?? 'Show password'
            }
          >
            {visible ? (visibleIcon ?? <VisibilityGlyph visible />) : (hiddenIcon ?? <VisibilityGlyph visible={false} />)}
          </button>
        )}
      </div>
      {strengthIndicator && strengthLevel && (
        <div
          data-part="strength-track"
          data-strength={strengthLevel}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={STRENGTH_VALUES[strengthLevel]}
          aria-label={translation?.t('password_strength') ?? 'Password strength'}
        >
          <div data-part="strength-fill" />
        </div>
      )}
      {error && errorMessage && (
        <span id={errorMessageId} data-part="error-message" role="alert">
          {errorMessage}
        </span>
      )}
    </div>
  );
}

ModernPasswordInput.displayName = 'ModernPasswordInput';
