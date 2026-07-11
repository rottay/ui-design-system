/**
 * @fileoverview Input Rustic Engine - Rottay Design System
 * @description Pure HTML/CSS implementation of the Input component using CSS variables.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * The Rustic engine paints this input entirely from
 * `tokens/css/engines/rustic/skin/input.css`, keyed on the `data-*` contract
 * this component stamps: `data-variant`, `data-size`, `data-invalid`,
 * `data-warning`, `data-success`, `data-disabled`, `data-size-responsive`,
 * and the `data-part` / `data-state` anatomy attributes from
 * `behavior/anatomy.ts`. The outer `<div>` is always the shell -- unlike the
 * modern engine, there is no branch where the shell is the `<input>` itself.
 *
 * The pre-anatomy BEM state classes (`rottay-input--focused`, `--error`,
 * `--warning`, `--success`, `--disabled`) are still stamped: they are
 * documented in `runtime/engines/skin-pack.ts` and the example skin pack as
 * a stable class hook a white-label skin pack may select on. The skin itself
 * does not key on them.
 *
 * **Key Features:**
 * - Zero UI library dependencies
 * - Full CSS variable theming (var(--ds-input-*))
 * - Controlled and uncontrolled modes
 * - Focus and disabled state handling (no hover paint -- see the skin's
 *   header comment: this engine has never repainted on hover)
 * - Clear button with custom SVG icon
 * - Character count display
 * - Error message display
 * - Multiple variants and validation states
 *
 * @module RusticInput
 * @category Inputs
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef, useState, useCallback, useRef, useEffect, useId } from 'react';
import { partAttributes, useInteractionState } from '../../../../../behavior';
import type { InputProps, InputSize } from '../Input.types';
import { INPUT_DEFAULTS, SIZE_MAP } from '../Input.types';
import { isResponsiveValue, generateResponsiveCSS, type ResponsivePropEntry } from '../../../layout/shared/responsive-props';
import type { ResponsiveValue } from '../../../layout/shared/types';

function scalarOrUndefined<T>(value: ResponsiveValue<T> | undefined): T | undefined {
  if (value === undefined || value === null) return undefined;
  if (isResponsiveValue(value)) return undefined;
  return value as T;
}

/**
 * Rustic (vanilla HTML/CSS) engine for the Input component.
 *
 * Uses only native HTML elements. The outer `<div>` is always the shell that
 * the skin paints (border, background, radius, focus ring); the inner
 * `<input>` stays a transparent, chrome-free passthrough.
 *
 * @param props - Standardized InputProps from the design system contract.
 * @param ref   - Forwarded ref merged with an internal ref for imperative focus.
 * @returns The rendered vanilla input with optional prefix, suffix, and clear button.
 */
const RusticInput = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
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
  } = props;

  // Responsive size handling
  const reactId = useId();
  const responsiveEntries: ResponsivePropEntry<any>[] = [];
  const sizeIsResponsive = isResponsiveValue(sizeProp);

  if (sizeIsResponsive) {
    responsiveEntries.push({
      cssProperty: 'height',
      value: sizeProp,
      resolve: (v: InputSize) => (SIZE_MAP[v as keyof typeof SIZE_MAP] || SIZE_MAP.md).height,
    } as ResponsivePropEntry<any>);
    responsiveEntries.push({
      cssProperty: 'font-size',
      value: sizeProp,
      resolve: (v: InputSize) => (SIZE_MAP[v as keyof typeof SIZE_MAP] || SIZE_MAP.md).fontSize,
    } as ResponsivePropEntry<any>);
  }

  const needsResponsiveCSS = responsiveEntries.length > 0;
  const elementId = needsResponsiveCSS ? `input-${reactId.replace(/:/g, '')}` : '';
  const responsive = needsResponsiveCSS
    ? generateResponsiveCSS(elementId, responsiveEntries)
    : null;

  const size = scalarOrUndefined(sizeProp) ?? INPUT_DEFAULTS.size;

  // Get size values from CSS variables
  const sizeValues = SIZE_MAP[size] || SIZE_MAP.md;

  // Handle controlled/uncontrolled
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;

  // The hover/focus triad is decided once, in the behavior core. This engine
  // never painted on hover (no rule in the skin reads it), but the state is
  // still tracked so the DOM contract matches modern's. A text field's
  // border is not a keyboard-only affordance, so the skin keys off
  // `focused`, never `focusVisible`.
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

  // Native autoFocus only fires on initial mount and can be unreliable in
  // client-rendered React trees, so we trigger focus imperatively.
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

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
  // two separate concerns wired to the same real DOM focus target.
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

  // Clear creates a synthetic ChangeEvent so consumers can treat it the same
  // as a normal onChange. We re-focus the input after clearing so the user
  // can immediately start typing without an extra click.
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

  // Determine if error state
  const hasError = error || status === 'error';
  const hasWarning = !hasError && status === 'warning';
  const hasSuccess = !hasError && !hasWarning && status === 'success';

  const showClearButton = clearable && currentValue && !disabled && !readOnly;

  // Hidden inputs carry no visible chrome: render a bare, form-participating
  // `<input type="hidden">` so server-action forms receive the value via
  // FormData without the container/affix markup.
  if (type === 'hidden') {
    return (
      <input
        type="hidden"
        name={props.name}
        id={props.id}
        value={(currentValue ?? '') as string}
        readOnly
        data-testid={dataTestId}
      />
    );
  }

  // File inputs are uncontrolled native pickers: render a bare `<input
  // type="file">` that forwards its ref and native change event. No `value` is
  // applied — assigning to a file input's value is illegal.
  if (type === 'file') {
    return (
      <input
        ref={inputRef}
        type="file"
        name={props.name}
        id={props.id}
        accept={props.accept}
        multiple={props.multiple}
        disabled={props.disabled}
        className={props.className}
        style={props.style}
        data-testid={dataTestId}
        onChange={handleChange}
      />
    );
  }

  // The inner <input> is borderless and transparent so the shell div
  // controls all visual chrome (border, radius, shadow). Padding is removed
  // on the side where a prefix or suffix is present to avoid double-spacing.
  const inputStyle: React.CSSProperties = {
    flex: 1,
    width: '100%',
    height: '100%',
    padding: `0 ${sizeValues.paddingX}`,
    paddingLeft: prefix ? 0 : undefined,
    paddingRight: suffix || (clearable && currentValue) ? 0 : undefined,
    fontSize: sizeValues.fontSize,
    fontFamily: 'var(--ds-font-family-base)',
    backgroundColor: 'transparent',
    border: 'none',
    outline: 'none',
    color: disabled ? 'var(--ds-input-color-disabled)' : 'var(--ds-input-color)',
    cursor: disabled ? 'not-allowed' : 'text',
  };

  // Affix styles using CSS variables
  const affixStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 0.5rem',
    color: 'var(--ds-input-addon-color)',
    userSelect: 'none',
  };

  // Clear button styles using CSS variables
  const clearButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 0.5rem',
    color: 'var(--ds-input-clear-color)',
    cursor: 'pointer',
    transition: 'color 0.15s, transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
    background: 'none',
    border: 'none',
  };

  // Character count styles using CSS variables
  const countStyle: React.CSSProperties = {
    position: 'absolute',
    right: 0,
    bottom: '-1.25rem',
    fontSize: 'var(--ds-input-helper-font-size)',
    color: hasError ? 'var(--ds-input-error-color)' : 'var(--ds-input-addon-color)',
  };

  /** The DOM contract the rustic Input skin selects on. Spread onto the
   *  shell -- always the outer <div>. */
  const skinAttributes = {
    'data-variant': variant,
    'data-size': size,
    'data-invalid': hasError ? 'true' : undefined,
    'data-warning': hasWarning ? 'true' : undefined,
    'data-success': hasSuccess ? 'true' : undefined,
    'data-disabled': disabled ? 'true' : undefined,
    'data-size-responsive': sizeIsResponsive ? 'true' : undefined,
  } as const;

  // Pre-anatomy BEM class hooks, preserved: documented in
  // `runtime/engines/skin-pack.ts` and the example skin pack as a stable
  // selector surface for white-label packs. The skin itself keys on the
  // data-* contract above, not these.
  const containerClasses = [
    'rottay-input',
    'rottay-input--rustic',
    `rottay-input--${size}`,
    `rottay-input--${variant}`,
    interaction.focused && 'rottay-input--focused',
    hasError && 'rottay-input--error',
    hasWarning && 'rottay-input--warning',
    hasSuccess && 'rottay-input--success',
    disabled && 'rottay-input--disabled',
    readOnly && 'rottay-input--readonly',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {responsive && responsive.css && (
        <style dangerouslySetInnerHTML={{ __html: responsive.css }} />
      )}
      <div
        className={containerClasses}
        style={style}
        {...skinAttributes}
        {...partAttributes('root', interaction)}
        {...(responsive ? responsive.attrs : {})}
        onClick={() => inputRef.current?.focus()}
        onPointerEnter={interactionHandlers.onPointerEnter}
        onPointerLeave={interactionHandlers.onPointerLeave}
      >
        {prefix && (
          <span data-part="affix-prefix" style={affixStyle}>
            {prefix}
          </span>
        )}

        <input
          ref={inputRef}
          id={id}
          name={name}
          type={type}
          value={currentValue}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          maxLength={maxLength}
          minLength={minLength}
          min={min}
          max={max}
          step={step}
          pattern={pattern}
          inputMode={inputMode}
          title={title}
          tabIndex={tabIndex}
          autoComplete={autoComplete}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
          aria-invalid={ariaInvalid ?? hasError}
          data-testid={dataTestId}
          style={inputStyle}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />

        {showClearButton && (
          <button
            type="button"
            data-part="clear-button"
            style={clearButtonStyle}
            onClick={handleClear}
            aria-label="Clear input"
            tabIndex={-1}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.color = 'var(--ds-input-color, currentColor)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.color = 'var(--ds-input-clear-color)';
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </button>
        )}

        {suffix && (
          <span data-part="affix-suffix" style={affixStyle}>
            {suffix}
          </span>
        )}
      </div>

      {showCount && maxLength && (
        <span data-part="count" style={countStyle}>
          {currentValue.length}/{maxLength}
        </span>
      )}

      {hasError && errorMessage && (
        <span
          data-part="error-message"
          style={{
            display: 'block',
            marginTop: '0.25rem',
            fontSize: 'var(--ds-input-helper-font-size)',
            color: 'var(--ds-input-error-color)',
          }}
        >
          {errorMessage}
        </span>
      )}
    </div>
  );
});

RusticInput.displayName = 'RusticInput';

export default RusticInput;
