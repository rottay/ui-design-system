/**
 * @fileoverview Input Modern Engine - Rottay Design System
 * @description Premium input implementation using CSS custom properties from the
 * design-system token layer. Styled to feel precise, calm, and editorial --
 * inspired by Linear, Vercel, and Stripe Dashboard form controls.
 *
 * @remarks
 * All visual properties are driven by CSS variables so tenant themes can
 * override every detail without touching this file.
 *
 * **Token Usage:**
 * - Surface: `--ds-surface-control` (field background)
 * - Border: `--ds-color-border` (resting), `--ds-color-primary` (focus)
 * - Radius: `--ds-radius-md` (8px default)
 * - Focus ring: `--ds-focus-ring-width`, `--ds-focus-ring-offset`, `--ds-focus-ring-color`
 * - Motion: `--ds-motion-fast` (150ms), `--ds-motion-ease-out`
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
/*  Sizing tokens                                                      */
/* ------------------------------------------------------------------ */

const SIZES = {
  xs: { height: '28px', paddingX: '8px',  fontSize: '12px', lineHeight: '16px' },
  sm: { height: '32px', paddingX: '10px', fontSize: '14px', lineHeight: '20px' },
  md: { height: '36px', paddingX: '12px', fontSize: '14px', lineHeight: '20px' },
  lg: { height: '40px', paddingX: '14px', fontSize: '16px', lineHeight: '24px' },
  xl: { height: '44px', paddingX: '16px', fontSize: '16px', lineHeight: '24px' },
} as const;

/* ------------------------------------------------------------------ */
/*  Shared inline styles                                               */
/* ------------------------------------------------------------------ */

const TRANSITION = 'border-color var(--ds-motion-fast, 150ms) var(--ds-motion-ease-out, cubic-bezier(0.16, 1, 0.3, 1)), outline-color var(--ds-motion-fast, 150ms) var(--ds-motion-ease-out, cubic-bezier(0.16, 1, 0.3, 1)), outline-offset var(--ds-motion-fast, 150ms) var(--ds-motion-ease-out, cubic-bezier(0.16, 1, 0.3, 1)), background-color var(--ds-motion-fast, 150ms) var(--ds-motion-ease-out, cubic-bezier(0.16, 1, 0.3, 1))';

/**
 * Build the shell style object for the input field (or the wrapping label
 * when prefix/suffix are present). Every visual detail is expressed via CSS
 * custom properties so theme overrides work without touching JS.
 */
function buildShellStyle(
  size: keyof typeof SIZES,
  variant: string,
  isFocused: boolean,
  isHovered: boolean,
  hasError: boolean,
  hasWarning: boolean,
  isDisabled: boolean,
): React.CSSProperties {
  const s = SIZES[size];

  const base: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    height: s.height,
    paddingLeft: s.paddingX,
    paddingRight: s.paddingX,
    fontSize: s.fontSize,
    lineHeight: s.lineHeight,
    fontFamily: 'inherit',
    color: 'var(--ds-input-color, var(--ds-color-text-primary))',
    backgroundColor: 'var(--ds-input-bg, var(--ds-surface-control))',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'var(--ds-input-border, var(--ds-color-border))',
    borderRadius: 'var(--ds-radius-md, 8px)',
    outline: '2px solid transparent',
    outlineOffset: 'var(--ds-focus-ring-offset, 2px)',
    transition: TRANSITION,
    boxSizing: 'border-box',
  };

  // Variant overrides
  if (variant === 'filled') {
    base.backgroundColor = 'var(--ds-input-filled-bg, var(--ds-surface-canvas))';
    base.borderColor = 'transparent';
  } else if (variant === 'flushed') {
    base.borderRadius = '0';
    base.borderWidth = '0';
    base.borderColor = 'transparent';
    base.borderBottomWidth = '1px';
    base.borderBottomStyle = 'solid';
    base.borderBottomColor = 'var(--ds-input-border, var(--ds-color-border))';
    base.paddingLeft = '0';
    base.paddingRight = '0';
    base.backgroundColor = 'transparent';
  } else if (variant === 'unstyled') {
    base.borderWidth = '0';
    base.borderColor = 'transparent';
    base.borderBottomWidth = '0';
    base.borderBottomColor = 'transparent';
    base.backgroundColor = 'transparent';
    base.outline = 'none';
    base.borderRadius = '0';
  }

  // Hover
  if (isHovered && !isFocused && !hasError && !hasWarning && !isDisabled && variant !== 'unstyled') {
    base.borderColor = 'var(--ds-input-border-hover, var(--ds-color-border-hover))';
  }

  // Focus
  if (isFocused && variant !== 'unstyled') {
    base.borderColor = 'var(--ds-input-border-focus, var(--ds-color-primary))';
    base.outline = 'var(--ds-focus-ring-width, 2px) solid var(--ds-input-shadow-focus, var(--ds-focus-ring-color))';
    if (variant === 'flushed') {
      base.outline = 'none';
      base.borderBottomWidth = '2px';
      base.borderBottomColor = 'var(--ds-input-border-focus, var(--ds-color-primary))';
    }
  }

  // Error
  if (hasError) {
    base.borderColor = 'var(--ds-input-error-border, var(--ds-color-error))';
    base.backgroundColor = variant === 'unstyled'
      ? 'transparent'
      : 'color-mix(in srgb, var(--ds-input-error-border, var(--ds-color-error)) 4%, transparent)';
    if (isFocused) {
      base.outline = 'var(--ds-focus-ring-width, 2px) solid color-mix(in srgb, var(--ds-input-error-border, var(--ds-color-error)) 15%, transparent)';
    }
  }

  // Warning
  if (hasWarning && !hasError) {
    base.borderColor = 'var(--ds-input-warning-border, var(--ds-color-warning))';
    base.backgroundColor = variant === 'unstyled'
      ? 'transparent'
      : 'color-mix(in srgb, var(--ds-input-warning-border, var(--ds-color-warning)) 4%, transparent)';
    if (isFocused) {
      base.outline = 'var(--ds-focus-ring-width, 2px) solid color-mix(in srgb, var(--ds-input-warning-border, var(--ds-color-warning)) 15%, transparent)';
    }
  }

  // Disabled
  if (isDisabled) {
    base.opacity = 'var(--ds-input-disabled-opacity, 0.5)' as any;
    base.cursor = 'not-allowed';
    base.backgroundColor = 'var(--ds-input-bg-disabled, var(--ds-surface-canvas))';
  }

  return base;
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
        transition: 'opacity var(--ds-motion-fast, 150ms) var(--ds-motion-ease-out, cubic-bezier(0.16, 1, 0.3, 1)), background-color var(--ds-motion-fast, 150ms)',
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
 * Renders a native `<input>` styled with CSS custom properties from the
 * design system token layer. When prefix, suffix, or clearable content
 * is present, wraps the input in a `<label>` for correct flex alignment.
 * Otherwise renders a standalone input for minimal DOM.
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

  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
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

  const handleFocus = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    },
    [onFocus]
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    },
    [onBlur]
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
  const computedStatus = error ? 'error' : status;
  const hasError = error || status === 'error';
  const hasWarning = !hasError && status === 'warning';

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

  const shellStyle = buildShellStyle(
    size as keyof typeof SIZES,
    variant,
    isFocused,
    isHovered,
    hasError,
    hasWarning,
    disabled,
  );

  const responsiveStyleTag = responsive && responsive.css ? (
    <style dangerouslySetInnerHTML={{ __html: responsive.css }} />
  ) : null;
  const responsiveAttrs = responsive ? responsive.attrs : {};

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
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid ?? (hasError || undefined),
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
          style={shellStyle}
          onClick={() => inputRef.current?.focus()}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {prefix && (
            <span style={addonStyle}>{prefix}</span>
          )}

          <input
            {...inputProps}
            className={placeholderStyleId}
            style={innerInputStyle}
          />

          {showClearButton && (
            <ClearButton onClick={handleClear} visible={isHovered || isFocused} />
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
  const standaloneStyle: React.CSSProperties = {
    ...shellStyle,
    // For standalone, padding is applied directly
  };

  return (
    <div className={className} style={style}>
      {responsiveStyleTag}
      {placeholderStyleTag}
      <input
        {...inputProps}
        {...responsiveAttrs}
        className={placeholderStyleId}
        style={standaloneStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
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
