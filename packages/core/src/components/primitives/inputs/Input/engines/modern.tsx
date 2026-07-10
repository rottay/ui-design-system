/**
 * @fileoverview Input Modern Engine - Rottay Design System
 * @description Premium input implementation using CSS custom properties from the
 * design-system token layer. Styled to feel precise, calm, and editorial --
 * inspired by Linear, Vercel, and Stripe Dashboard form controls.
 *
 * @remarks
 * The Modern engine paints this input entirely from
 * `tokens/css/engines/modern/skin/input.css`, keyed on the `data-*` contract
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
import { partAttributes, useInteractionState } from '../../../../../behavior';
import type { InputProps, InputSize } from '../Input.types';
import { INPUT_DEFAULTS, SIZE_MAP as INPUT_SIZE_MAP } from '../Input.types';
import { isResponsiveValue, generateResponsiveCSS, type ResponsivePropEntry } from '../../../layout/shared/responsive-props';
import type { ResponsiveValue } from '../../../layout/shared/types';

function scalarOrUndefined<T>(value: ResponsiveValue<T> | undefined): T | undefined {
  if (value === undefined || value === null) return undefined;
  if (isResponsiveValue(value)) return undefined;
  return value as T;
}

/* ------------------------------------------------------------------ */
/*  Clear button (ghost, appears on hover / when content present)      */
/* ------------------------------------------------------------------ */

function ClearButton({ onClick, visible }: { onClick: () => void; visible: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Clear input"
      tabIndex={-1}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 'var(--ds-icon-size-sm, 20px)',
        height: 'var(--ds-icon-size-sm, 20px)',
        padding: 0,
        border: 'none',
        borderRadius: 'var(--ds-radius-sm, 6px)',
        backgroundColor: 'transparent',
        color: 'var(--ds-color-text-muted)',
        cursor: 'pointer',
        opacity: visible ? 1 : 0,
        transition: 'opacity var(--ds-motion-fast) var(--ds-motion-ease-out), background-color var(--ds-motion-fast)',
        flexShrink: 0,
      }}
      onMouseEnter={(e) => { (e.currentTarget.style.backgroundColor as any) = 'var(--ds-surface-canvas)'; }}
      onMouseLeave={(e) => { (e.currentTarget.style.backgroundColor as any) = 'transparent'; }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6L6 18M6 6l12 12" />
      </svg>
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
 * prefix, suffix, or clearable content is present, wraps the input in a
 * `<label>` for correct flex alignment -- the LABEL is the shell in that
 * case (it carries the skin's classes, `data-part`, `data-state`, and every
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
    responsiveEntries.push({
      cssProperty: 'height',
      value: sizeProp,
      resolve: (v: InputSize) => (INPUT_SIZE_MAP[v as keyof typeof INPUT_SIZE_MAP] || INPUT_SIZE_MAP.md).height,
    } as ResponsivePropEntry<any>);
    responsiveEntries.push({
      cssProperty: 'font-size',
      value: sizeProp,
      resolve: (v: InputSize) => (INPUT_SIZE_MAP[v as keyof typeof INPUT_SIZE_MAP] || INPUT_SIZE_MAP.md).fontSize,
    } as ResponsivePropEntry<any>);
  }

  const needsResponsiveCSS = responsiveEntries.length > 0;
  const elementId = needsResponsiveCSS ? `input-${reactId.replace(/:/g, '')}` : '';
  const responsive = needsResponsiveCSS
    ? generateResponsiveCSS(elementId, responsiveEntries)
    : null;

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
  const hasError = error || status === 'error';
  const hasWarning = !hasError && status === 'warning';
  // Not painted by the modern skin -- this engine has never rendered a
  // distinct success posture (unlike rustic). Stamped anyway so the DOM
  // contract is consistent across engines; see the skin's header comment.
  const hasSuccess = !hasError && !hasWarning && status === 'success';

  const showClearButton = clearable && currentValue && !disabled && !readOnly;

  // Hidden inputs carry no visible chrome: render a bare, form-participating
  // `<input type="hidden">` so server-action forms receive the value via
  // FormData without any wrapper, focus ring, or placeholder styling.
  if (type === 'hidden') {
    return (
      <input
        type="hidden"
        name={name}
        id={id}
        value={(currentValue ?? '') as string}
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
        className={className}
        style={style}
        data-testid={dataTestId}
        onChange={handleChange}
      />
    );
  }

  const responsiveStyleTag = responsive && responsive.css ? (
    <style dangerouslySetInnerHTML={{ __html: responsive.css }} />
  ) : null;
  const responsiveAttrs = responsive ? responsive.attrs : {};

  /** The DOM contract the modern Input skin selects on. Spread onto the
   *  shell element -- the `<label>` in the addon branch, the `<input>`
   *  itself otherwise. */
  const skinAttributes = {
    'data-variant': variant,
    'data-size': size,
    'data-invalid': hasError ? 'true' : undefined,
    'data-warning': hasWarning ? 'true' : undefined,
    'data-success': hasSuccess ? 'true' : undefined,
    'data-disabled': disabled ? 'true' : undefined,
    'data-size-responsive': sizeIsResponsive ? 'true' : undefined,
  } as const;

  const shellClassName = 'rottay-input rottay-input--modern';

  // Addon (prefix/suffix) style
  const addonStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    flexShrink: 0,
    color: 'var(--ds-input-addon-color, var(--ds-color-text-muted))',
    lineHeight: 1,
  };

  // Inner input style (strips decoration when inside a shell label)
  const innerInputStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
    width: '100%',
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    color: 'inherit',
    fontSize: 'inherit',
    lineHeight: 'inherit',
    fontFamily: 'inherit',
    padding: 0,
  };

  // Placeholder color (injected via a tiny style rule since ::placeholder
  // cannot be set via inline styles).
  const placeholderStyleId = `ds-input-ph-${reactId.replace(/:/g, '')}`;
  const placeholderStyleTag = (
    <style dangerouslySetInnerHTML={{ __html: `
      .${placeholderStyleId}::placeholder {
        color: var(--ds-input-color-placeholder, var(--ds-color-text-muted));
        opacity: 1;
      }
    `}} />
  );

  // Count / error message styles
  const countStyle: React.CSSProperties = {
    fontSize: 'var(--ds-font-size-xs, 12px)',
    lineHeight: 'var(--ds-line-height-xs, 16px)',
    marginTop: 'var(--ds-spacing-1, 4px)',
    textAlign: 'right' as const,
    color: hasError ? 'var(--ds-color-error)' : 'var(--ds-color-text-muted)',
  };

  const errorMessageStyle: React.CSSProperties = {
    fontSize: 'var(--ds-font-size-xs, 12px)',
    lineHeight: 'var(--ds-line-height-xs, 16px)',
    marginTop: 'var(--ds-spacing-1, 4px)',
    color: 'var(--ds-color-error)',
    display: 'block',
  };

  // Shared input props
  const inputProps = {
    ref: inputRef,
    id,
    name,
    type,
    value: currentValue,
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
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid ?? (hasError || undefined),
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

  // When addons are present, the input is wrapped in a <label> shell
  if (prefix || suffix || showClearButton) {
    return (
      <div className={className} style={style}>
        {responsiveStyleTag}
        {placeholderStyleTag}
        <label
          className={shellClassName}
          onClick={() => inputRef.current?.focus()}
          onPointerEnter={interactionHandlers.onPointerEnter}
          onPointerLeave={interactionHandlers.onPointerLeave}
          {...partAttributes('root', interaction)}
          {...skinAttributes}
        >
          {prefix && (
            <span style={addonStyle}>{prefix}</span>
          )}

          <input
            {...inputProps}
            // `rottay-input rottay-input--modern` is carried here too, WITHOUT
            // `data-part`/`data-state`/the skin attributes: no rule in the skin
            // matches without `[data-part='root']`, so this is inert for paint,
            // but it keeps the bare class present on the actual <input> for any
            // external selector (e.g. a tenant extension sheet) that targets it
            // there rather than on the shell.
            className={`${shellClassName} ${placeholderStyleId}`}
            style={innerInputStyle}
          />

          {showClearButton && (
            <ClearButton onClick={handleClear} visible={interaction.hovered || interaction.focused} />
          )}

          {suffix && (
            <span style={addonStyle}>{suffix}</span>
          )}
        </label>

        {showCount && maxLength && (
          <div style={countStyle}>
            {currentValue.length}/{maxLength}
          </div>
        )}

        {hasError && errorMessage && (
          <span style={errorMessageStyle}>{errorMessage}</span>
        )}
      </div>
    );
  }

  // Simple input without prefix/suffix -- the shell IS the input element
  return (
    <div className={className} style={style}>
      {responsiveStyleTag}
      {placeholderStyleTag}
      <input
        {...inputProps}
        {...responsiveAttrs}
        className={`${shellClassName} ${placeholderStyleId}`}
        onPointerEnter={interactionHandlers.onPointerEnter}
        onPointerLeave={interactionHandlers.onPointerLeave}
        {...partAttributes('root', interaction)}
        {...skinAttributes}
      />

      {showCount && maxLength && (
        <div style={countStyle}>
          {currentValue.length}/{maxLength}
        </div>
      )}

      {hasError && errorMessage && (
        <span style={errorMessageStyle}>{errorMessage}</span>
      )}
    </div>
  );
});

ModernInput.displayName = 'ModernInput';

export default ModernInput;
