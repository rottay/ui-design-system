/**
 * @fileoverview Input Modern Engine - Rottay Design System
 * @description Premium input implementation using CSS custom properties from the
 * design-system token layer. Styled to feel precise, calm, and editorial --
 * inspired by Linear, Vercel, and Stripe Dashboard form controls.
 *
 * @remarks
 * The Modern engine paints this input entirely from
 * `foundation/tokens/css/runtime/engines/modern/skin/input.css`, keyed on the `data-*` contract
 * this component stamps: `data-variant`, `data-size`, `data-invalid`,
 * `data-warning`, `data-success`, `data-disabled`, `data-size-responsive`,
 * and the `data-part` / `data-state` anatomy attributes from
 * `behavior/anatomy.ts`. A caller's own `style` prop is the only inline
 * declaration on the shell.
 *
 * **Token Usage:**
 * - Surface: `--ds-surface-control` (field background)
 * - Border: `--ds-color-border` (resting), `--ds-color-primary` (focus)
 * - Radius: `--ds-radius-md` (8px default)
 * - Focus ring: the `box-shadow` halo in `runtime/personality.css`, keyed on
 *   `:focus-visible` -- text inputs match it on a pointer click too, per spec.
 * - Motion: `--ds-motion-fast` (var(--ds-motion-fast)), `--ds-motion-ease-out`
 * - Text: `--ds-color-text-primary`, `--ds-color-text-muted` (placeholder)
 *
 * @see {@link Input} for the main component
 * @see {@link ClassicInput} for Ant Design implementation
 * @see {@link RusticInput} for vanilla implementation
 * @module ModernInput
 * @category Inputs
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef, useState, useCallback, useRef, useEffect, useId } from 'react';
import { partAttributes, useInteractionState } from '../../../../../../foundation/behavior';
import type { InputProps, InputSize } from '../../contracts';
import { INPUT_DEFAULTS, SIZE_MAP as INPUT_SIZE_MAP } from '../../contracts';
import {
  isResponsiveValue,
  generateResponsiveCSS,
  type ResponsivePropEntry,
} from '@/infrastructure/runtime/responsive/runtime/style-properties';
import type { ResponsiveValue } from '@/foundation/contracts/kernel/responsive/values';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { ActionCloseIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-close';
import { StatusLoadingIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-loading';

function scalarOrUndefined<T>(value: ResponsiveValue<T> | undefined): T | undefined {
  if (value === undefined || value === null) return undefined;
  if (isResponsiveValue(value)) return undefined;
  return value as T;
}

/* ------------------------------------------------------------------ */
/*  Clear button (ghost, appears on hover / when content present)      */
/* ------------------------------------------------------------------ */

function ClearButton({ onClick }: { onClick: () => void }) {
  const translation = useOptionalTranslation('common');

  return (
    <button
      type="button"
      data-part="clear-button"
      onClick={onClick}
      onPointerDown={(event) => event.preventDefault()}
      aria-label={translation?.t('clear') ?? 'Clear'}
    >
      <ActionCloseIcon decorative size="sm" />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

/**
 * Modern (premium) engine for the Input component.
 *
 * Renders a native `<input>` painted by the modern skin stylesheet. When
 * prefix, suffix, loading, or clearable content is present, wraps the input in
 * a neutral flex shell so interactive suffix actions never nest inside a
 * `<label>`. The wrapper carries `data-part`, `data-state`, and every
 * `data-*` paint attribute), while the inner `<input>` stays a transparent,
 * chrome-free passthrough. In the plain branch the `<input>` itself is both
 * the shell and the focusable control. Both branches carry the same class
 * set and the same `data-*` contract, so one stylesheet paints either shape.
 */
const ModernInput = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const {
    size: sizeProp = INPUT_DEFAULTS.size,
    variant = INPUT_DEFAULTS.variant,
    status = INPUT_DEFAULTS.status,
    type = INPUT_DEFAULTS.type,
    placeholder,
    value: controlledValue,
    defaultValue,
    disabled = INPUT_DEFAULTS.disabled,
    readOnly = INPUT_DEFAULTS.readOnly,
    required = INPUT_DEFAULTS.required,
    error = INPUT_DEFAULTS.error,
    errorMessage,
    loading = INPUT_DEFAULTS.loading,
    maxLength,
    minLength,
    min,
    max,
    step,
    pattern,
    inputMode,
    title,
    tabIndex,
    prefix,
    suffix,
    clearable = INPUT_DEFAULTS.clearable,
    showCount = INPUT_DEFAULTS.showCount,
    onChange,
    onFocus,
    onBlur,
    onKeyDown,
    onPressEnter,
    onClear,
    className = '',
    style = {},
    name,
    id,
    autoComplete,
    autoFocus,
    'data-testid': dataTestId,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    'aria-required': ariaRequired,
    role,
    spellCheck,
    'aria-autocomplete': ariaAutocomplete,
    'aria-controls': ariaControls,
    'aria-expanded': ariaExpanded,
    'aria-activedescendant': ariaActiveDescendant,
    'aria-haspopup': ariaHasPopup,
  } = props;

  // Responsive size handling
  const reactId = useId();
  const responsiveEntries: ResponsivePropEntry<any>[] = [];
  const sizeIsResponsive = isResponsiveValue(sizeProp);

  if (sizeIsResponsive) {
    const resolvedSize = (value: InputSize) => INPUT_SIZE_MAP[value as keyof typeof INPUT_SIZE_MAP] || INPUT_SIZE_MAP.md;
    responsiveEntries.push({
      cssProperty: 'height',
      value: sizeProp,
      resolve: (v: InputSize) => `${resolvedSize(v).height} !important`,
    } as ResponsivePropEntry<any>);
    responsiveEntries.push({
      cssProperty: 'font-size',
      value: sizeProp,
      resolve: (v: InputSize) => `${resolvedSize(v).fontSize} !important`,
    } as ResponsivePropEntry<any>);
    responsiveEntries.push({
      cssProperty: 'padding-inline',
      value: sizeProp,
      resolve: (v: InputSize) => `${resolvedSize(v).paddingX} !important`,
    } as ResponsivePropEntry<any>);
    responsiveEntries.push({
      cssProperty: 'line-height',
      value: sizeProp,
      resolve: (v: InputSize) => `var(--ds-input-${v}-line-height) !important`,
    } as ResponsivePropEntry<any>);
    responsiveEntries.push({
      cssProperty: '--ds-input-responsive-radius',
      value: sizeProp,
      resolve: (v: InputSize) => `var(--ds-input-${v}-radius, var(--ds-input-${v}-border-radius))`,
    } as ResponsivePropEntry<any>);
    responsiveEntries.push({
      cssProperty: 'gap',
      value: sizeProp,
      resolve: (v: InputSize) => `var(--ds-input-${v}-gap, var(--ds-input-affix-gap)) !important`,
    } as ResponsivePropEntry<any>);
  }

  const needsResponsiveCSS = responsiveEntries.length > 0;
  const elementId = needsResponsiveCSS ? `input-${reactId.replace(/:/g, '')}` : '';
  const responsive = needsResponsiveCSS ? generateResponsiveCSS(elementId, responsiveEntries) : null;

  const size = scalarOrUndefined(sizeProp) ?? INPUT_DEFAULTS.size;

  // Handle controlled/uncontrolled
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;

  // The hover/focus triad is decided once, in the behavior core. The rustic
  // skin reads the same state, so the two cannot drift apart on what a focus
  // is. A text field's border is not a keyboard-only affordance (unlike a
  // button's ring), so the skin keys off `focused`, never `focusVisible`.
  const { state: interaction, handlers: interactionHandlers } = useInteractionState({ disabled });

  const inputRef = useRef<HTMLInputElement>(null);

  // Merge refs
  useEffect(() => {
    if (ref) {
      if (typeof ref === 'function') {
        ref(inputRef.current);
      } else {
        (ref as React.MutableRefObject<HTMLInputElement | null>).current = inputRef.current;
      }
    }
  }, [ref]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      if (!isControlled) {
        setInternalValue(newValue);
      }
      onChange?.(newValue, e);
    },
    [isControlled, onChange]
  );

  // Interaction-state tracking and the caller's own onFocus/onBlur prop are
  // two separate concerns wired to the same real DOM focus target (the
  // `<input>`, not the wrapping label in the addon branch -- a label is not
  // itself a focusable element).
  const handleFocus = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      interactionHandlers.onFocus(e);
      onFocus?.(e);
    },
    [interactionHandlers, onFocus]
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      interactionHandlers.onBlur(e);
      onBlur?.(e);
    },
    [interactionHandlers, onBlur]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        onPressEnter?.(e);
      }
      onKeyDown?.(e);
    },
    [onKeyDown, onPressEnter]
  );

  const handleClear = useCallback(() => {
    if (!isControlled) {
      setInternalValue('');
    }
    onClear?.();
    const syntheticEvent = {
      target: { value: '' },
    } as React.ChangeEvent<HTMLInputElement>;
    onChange?.('', syntheticEvent);
    inputRef.current?.focus();
  }, [isControlled, onChange, onClear]);

  // Determine status
  const hasError = Boolean(error || status === 'error' || ariaInvalid === true || ariaInvalid === 'true');
  const hasWarning = !hasError && status === 'warning';
  const hasSuccess = !hasError && !hasWarning && status === 'success';
  const currentValueString = String(currentValue ?? '');
  const isFilled = currentValueString.length > 0;
  const showClearButton = Boolean(clearable && isFilled && !disabled && !readOnly && !loading);
  const generatedControlId = id || `input-${reactId.replace(/:/g, '')}`;
  const errorMessageId = `${generatedControlId}-error`;
  const describedBy = [ariaDescribedBy, hasError && errorMessage ? errorMessageId : undefined]
    .filter(Boolean)
    .join(' ') || undefined;

  // Hidden inputs carry no visible chrome: render a bare, form-participating
  // `<input type="hidden">` so server-action forms receive the value via
  // FormData without any wrapper, focus ring, or placeholder styling.
  if (type === 'hidden') {
    return (
      <input
        type="hidden"
        name={name}
        id={id}
        value={currentValueString}
        readOnly
        data-testid={dataTestId}
      />
    );
  }

  // File inputs are uncontrolled native pickers: render a bare `<input
  // type="file">` that forwards its ref (so callers can call `.click()`) and its
  // native change event (so callers can read `event.target.files`). No `value`
  // is applied — assigning to a file input's value is illegal.
  if (type === 'file') {
    return (
      <input
        ref={inputRef}
        type="file"
        name={name}
        id={id}
        accept={props.accept}
        multiple={props.multiple}
        disabled={disabled}
        required={required}
        aria-required={ariaRequired ?? (required || undefined)}
        className={className}
        style={style}
        data-testid={dataTestId}
        onChange={handleChange}
      />
    );
  }

  const responsiveStyleTag =
    responsive && responsive.css ? <style dangerouslySetInnerHTML={{ __html: responsive.css }} /> : null;
  const responsiveAttrs = responsive ? responsive.attrs : {};

  /** The DOM contract the modern Input skin selects on. Spread onto the
   *  shell element -- the neutral `<div>` in the addon branch, the `<input>`
   *  itself otherwise. */
  const skinAttributes = {
    'data-variant': variant,
    'data-size': size,
    'data-invalid': hasError ? 'true' : undefined,
    'data-warning': hasWarning ? 'true' : undefined,
    'data-success': hasSuccess ? 'true' : undefined,
    'data-disabled': disabled ? 'true' : undefined,
    'data-readonly': readOnly ? 'true' : undefined,
    'data-loading': loading ? 'true' : undefined,
    'data-filled': isFilled ? 'true' : undefined,
    'data-size-responsive': sizeIsResponsive ? 'true' : undefined,
  } as const;

  const shellClassName = 'rottay-input rottay-input--modern';

  // Shared input props
  const inputProps = {
    ref: inputRef,
    id: generatedControlId,
    name,
    type,
    value: currentValueString,
    placeholder,
    disabled,
    readOnly,
    required,
    maxLength,
    minLength,
    min,
    max,
    step,
    pattern,
    inputMode,
    title,
    tabIndex,
    autoComplete,
    autoFocus,
    spellCheck,
    role,
    'aria-label': ariaLabel,
    'aria-describedby': describedBy,
    'aria-invalid': ariaInvalid ?? (hasError || undefined),
    'aria-required': ariaRequired ?? (required || undefined),
    'aria-busy': loading || undefined,
    'aria-autocomplete': ariaAutocomplete,
    'aria-controls': ariaControls,
    'aria-expanded': ariaExpanded,
    'aria-activedescendant': ariaActiveDescendant,
    'aria-haspopup': ariaHasPopup,
    'data-testid': dataTestId,
    onChange: handleChange,
    onFocus: handleFocus,
    onBlur: handleBlur,
    onKeyDown: handleKeyDown,
  };

  const messages = (
    <>
      {showCount && maxLength && (
        <div
          data-part="count"
          data-count-state={
            hasError
              ? 'error'
              : currentValueString.length >= maxLength
                ? 'limit'
                : currentValueString.length / maxLength >= 0.9
                  ? 'warning'
                  : undefined
          }
          data-invalid={hasError ? 'true' : undefined}
          aria-live="polite"
        >
          {currentValueString.length}/{maxLength}
        </div>
      )}
      {hasError && errorMessage && (
        <span id={errorMessageId} data-part="error-message" role="alert">
          {errorMessage}
        </span>
      )}
    </>
  );

  const loadingIndicator = loading ? (
    <span data-part="loading-indicator" aria-hidden="true">
      <StatusLoadingIcon decorative size="sm" />
    </span>
  ) : null;

  // When addons are present, a non-label shell keeps interactive suffix
  // buttons valid while the actual input remains associated by FormField.
  if (prefix || suffix || showClearButton || loading) {
    return (
      <div className={`rottay-input-field ${className}`.trim()} data-part="field" style={style}>
        {responsiveStyleTag}
        <div
          className={shellClassName}
          onClick={(event) => {
            const target = event.target as HTMLElement;
            if (!target.closest('input, button')) inputRef.current?.focus();
          }}
          onPointerEnter={interactionHandlers.onPointerEnter}
          onPointerLeave={interactionHandlers.onPointerLeave}
          {...partAttributes('root', interaction)}
          {...skinAttributes}
          {...responsiveAttrs}
        >
          {prefix && (
            <span data-part="affix-prefix">
              {prefix}
            </span>
          )}

          <input
            {...inputProps}
            className="rottay-input__control"
            data-part="control"
          />

          {showClearButton && <ClearButton onClick={handleClear} />}

          {loadingIndicator}

          {suffix && (
            <span data-part="affix-suffix">
              {suffix}
            </span>
          )}
        </div>
        {messages}
      </div>
    );
  }

  // Simple input without prefix/suffix -- the shell IS the input element
  return (
    <div className={`rottay-input-field ${className}`.trim()} data-part="field" style={style}>
      {responsiveStyleTag}
      <input
        {...inputProps}
        {...responsiveAttrs}
        className={shellClassName}
        onPointerEnter={interactionHandlers.onPointerEnter}
        onPointerLeave={interactionHandlers.onPointerLeave}
        {...partAttributes('root', interaction)}
        {...skinAttributes}
      />
      {messages}
    </div>
  );
});

ModernInput.displayName = 'ModernInput';

export default ModernInput;
