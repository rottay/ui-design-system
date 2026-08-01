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
 * the i18n catalog (`common.show_password` / `common.hide_password`), painted
 * with the governed `action.reveal`/`action.conceal` icon roles, and positioned
 * with logical properties so RTL needs no branch. The strength meter is a real
 * `progressbar` of four segments whose active count/tone the skin derives from
 * `data-strength`, paired with a localized level word (visible label +
 * `aria-valuetext`), so no runtime paint survives on any part and the level is
 * never carried by color alone. When `capsLockHint` (default true) is on, a
 * `data-part="caps-lock-hint"` `role="status"` announces an active Caps Lock
 * key -- detected via `getModifierState('CapsLock')` on keydown/keyup, reset
 * on every focus and blur -- and is suppressed whenever `error` is set, so
 * the error state always owns the message zone.
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
import { ActionRevealIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-reveal';
import { ActionConcealIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-conceal';

/** aria-valuenow for the strength progressbar, aligned with STRENGTH_WIDTHS. */
const STRENGTH_VALUES: Record<PasswordStrengthLevel, number> = {
  weak: 25,
  fair: 50,
  good: 75,
  strong: 100,
};

/** The meter renders one segment per level; the skin activates them by count. */
const STRENGTH_SEGMENT_COUNT = 4;

/** English floors for the localized level words (catalogue `passwordInput.*`). */
const STRENGTH_LABEL_FALLBACK: Record<PasswordStrengthLevel, string> = {
  weak: 'Weak',
  fair: 'Fair',
  good: 'Good',
  strong: 'Strong',
};

/**
 * Catalogued copy with an English floor: when the catalogue entry has not
 * landed yet the provider echoes the full key, which must never reach visible
 * copy or an aria-label (the AutoComplete/OTPInput engines' tOr idiom).
 */
function usePasswordInputTranslation() {
  const common = useOptionalTranslation('common');
  const components = useOptionalTranslation('components');
  const tCommon = (key: string, fallback: string): string => {
    const resolved = common?.t(key);
    if (!resolved || resolved === key || resolved === `common.${key}`) return fallback;
    return resolved;
  };
  const tComponents = (key: string, fallback: string): string => {
    const resolved = components?.t(key);
    if (!resolved || resolved === key || resolved === `components.${key}`) return fallback;
    return resolved;
  };
  return { tCommon, tComponents };
}

/** Governed reveal/conceal glyphs (action.reveal / action.conceal roles, the
    Input compound/Password precedent) -- decorative; the button carries the name. */
function VisibilityGlyph({ visible }: { visible: boolean }) {
  return visible ? <ActionConcealIcon decorative size="sm" /> : <ActionRevealIcon decorative size="sm" />;
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
    capsLockHint = PASSWORD_INPUT_DEFAULTS.capsLockHint,
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

  const { tCommon, tComponents } = usePasswordInputTranslation();
  const generatedId = useId();
  const inputId = providedId || `password-modern-${generatedId.replace(/:/g, '')}`;
  const errorMessageId = `${inputId}-error`;
  // Local toggle state for password visibility (not exposed to parent)
  const [visible, setVisible] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Caps Lock tracking (not exposed to parent). `getModifierState` only
  // exists on KeyboardEvent -- FocusEvent has no modifier introspection --
  // so keydown/keyup are the only real detection sites; focus/blur bound the
  // window during which a stale reading could survive and always reset it,
  // so a session starts clean and every session ends clean.
  const [capsLockOn, setCapsLockOn] = useState(false);

  // The level word travels three ways at once -- visible label, aria-valuetext
  // on the progressbar, and the segment count the skin paints -- so strength
  // is never carried by color alone.
  const strengthText = strengthLevel
    ? tComponents(`passwordInput.strength_${strengthLevel}`, STRENGTH_LABEL_FALLBACK[strengthLevel])
    : undefined;

  // The hover/focus triad is decided once, in the behavior core, and the skin
  // keys off `focused` -- a text field's border is not a keyboard-only
  // affordance, so the ring follows any real focus, pointer or keyboard.
  const { state: interaction, handlers: interactionHandlers } = useInteractionState({ disabled });

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value, e);
  }, [onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e);
    if (capsLockHint) setCapsLockOn(e.getModifierState('CapsLock'));
    if (e.key === 'Enter') {
      onPressEnter?.(e);
    }
  }, [onKeyDown, onPressEnter, capsLockHint]);

  // keyup catches the Caps Lock key's OWN press (its down state precedes the
  // modifier taking effect on some platforms) and any release that changes
  // the active modifier set while focus never left the field.
  const handleKeyUp = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (capsLockHint) setCapsLockOn(e.getModifierState('CapsLock'));
  }, [capsLockHint]);

  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    interactionHandlers.onFocus(e);
    // A new focus session cannot know the modifier state yet (FocusEvent
    // carries none); it starts clean and the next keydown/keyup corrects it.
    if (capsLockHint) setCapsLockOn(false);
    onFocus?.(e);
  }, [interactionHandlers, onFocus, capsLockHint]);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    interactionHandlers.onBlur(e);
    if (capsLockHint) setCapsLockOn(false);
    onBlur?.(e);
  }, [interactionHandlers, onBlur, capsLockHint]);

  const handleToggleVisibility = useCallback(() => {
    setVisible((previous) => !previous);
    inputRef.current?.focus();
  }, []);

  const isFilled = String(value ?? defaultValue ?? '').length > 0;
  const describedBy = error && errorMessage ? errorMessageId : undefined;
  // The error state always wins the message zone: a caps-lock hint next to
  // an error border would contradict "the error is what needs attention".
  const showCapsLockHint = capsLockHint && capsLockOn && !error;

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
          onKeyUp={handleKeyUp}
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
                ? tCommon('hide_password', 'Hide password')
                : tCommon('show_password', 'Show password')
            }
          >
            {visible ? (visibleIcon ?? <VisibilityGlyph visible />) : (hiddenIcon ?? <VisibilityGlyph visible={false} />)}
          </button>
        )}
      </div>
      {showCapsLockHint && (
        <span data-part="caps-lock-hint" role="status" aria-live="polite">
          {tComponents('passwordinput.caps_lock_on', 'Caps Lock is on')}
        </span>
      )}
      {strengthIndicator && strengthLevel && (
        <div data-part="strength-meter">
          <div
            data-part="strength-track"
            data-strength={strengthLevel}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={STRENGTH_VALUES[strengthLevel]}
            aria-valuetext={strengthText}
            aria-label={tCommon('password_strength', 'Password strength')}
          >
            {/* One segment per level; the skin activates them by count from
                data-strength, so the level reads as segment COUNT + localized
                word + tone -- never tone alone. Children of a progressbar are
                presentational by spec. */}
            {Array.from({ length: STRENGTH_SEGMENT_COUNT }, (_, segment) => (
              <span key={segment} data-part="strength-segment">
                <span data-part="strength-fill" />
              </span>
            ))}
          </div>
          <span data-part="strength-label">{strengthText}</span>
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
