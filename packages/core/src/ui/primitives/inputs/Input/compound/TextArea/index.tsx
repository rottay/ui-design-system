/**
 * @fileoverview InputTextArea - Rottay Design System
 * @description Compound component providing a multi-line text input with
 * character counting, error display, and multiple visual variants.
 *
 * @remarks
 * InputTextArea is a fully-featured textarea component with controlled and
 * uncontrolled modes. It supports multiple visual variants (outline, filled,
 * flushed, unstyled) and provides built-in character counting and error display.
 *
 * **Key Features:**
 * - Controlled and uncontrolled value management
 * - Multiple visual variants: outline, filled, flushed, unstyled
 * - Character count display when `showCount` and `maxLength` are set
 * - Inline error message rendering
 * - Focus ring and error ring via CSS box-shadow
 * - Theme-driven or explicit logical/physical resize behavior
 * - Enter key handling with `onPressEnter` (Shift+Enter for newline)
 *
 * **Accessibility:**
 * - Supports `aria-label`, `aria-describedby`, `aria-invalid`
 * - Error state communicated via `aria-invalid`
 *
 * @example Basic Usage
 * ```tsx
 * import { Input } from '@rottay/design-system';
 *
 * <Input.TextArea
 *   placeholder="Enter your message..."
 *   rows={4}
 * />
 * ```
 *
 * @example With Character Count
 * ```tsx
 * <Input.TextArea
 *   placeholder="Bio"
 *   maxLength={200}
 *   showCount
 *   rows={3}
 * />
 * ```
 *
 * @example Error State
 * ```tsx
 * <Input.TextArea
 *   value={description}
 *   error={!isValid}
 *   errorMessage="Description is required"
 *   onChange={setDescription}
 * />
 * ```
 *
 * @see {@link Input} for the main input component
 * @see {@link InputTextAreaProps} for prop definitions
 * @module InputTextArea
 * @category Inputs
 * @package @rottay/design-system
 */

'use client';

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

import type { InputTextAreaProps } from '../../contracts';
import {
  generateResponsiveCSS,
  isResponsiveValue,
  type ResponsivePropEntry,
} from '@/infrastructure/runtime/responsive/runtime/style-properties';
import type { InputSize } from '../../contracts';
import { StatusLoadingIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-loading';

/**
 * Multi-line text input component with character counting and error display.
 *
 * @description
 * Renders a `<textarea>` element with configurable visual variants, focus
 * and error states, optional character count overlay, and inline error
 * message rendering. Supports both controlled and uncontrolled modes.
 *
 * @param props - {@link InputTextAreaProps}
 * @param ref - Forwarded ref to the underlying `<textarea>` element
 * @returns A textarea element wrapped in a styled container
 *
 * @example
 * ```tsx
 * <InputTextArea
 *   variant="filled"
 *   rows={6}
 *   maxLength={500}
 *   showCount
 *   placeholder="Write your story..."
 * />
 * ```
 */
export const InputTextArea = forwardRef<HTMLTextAreaElement, InputTextAreaProps>(
  (props, ref) => {
    const {
      value: controlledValue,
      defaultValue,
      placeholder,
      size = 'md',
      variant = 'outline',
      status = 'default',
      disabled = false,
      readOnly = false,
      required = false,
      error = false,
      errorMessage,
      loading = false,
      maxLength,
      minLength,
      rows = 4,
      resize = true,
      showCount = false,
      inputMode,
      title,
      tabIndex,
      spellCheck,
      role,
      onChange,
      onFocus,
      onBlur,
      onKeyDown,
      onPressEnter,
      className = '',
      style = {},
      id,
      name,
      autoComplete,
      autoFocus,
      'data-testid': dataTestId,
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedBy,
      'aria-invalid': ariaInvalid,
      'aria-autocomplete': ariaAutocomplete,
      'aria-controls': ariaControls,
      'aria-expanded': ariaExpanded,
      'aria-activedescendant': ariaActiveDescendant,
      'aria-haspopup': ariaHasPopup,
    } = props;

    // Dual-mode value management: when controlledValue is defined the parent
    // owns state; otherwise internal state tracks the value for uncontrolled usage.
    const [internalValue, setInternalValue] = useState(defaultValue ?? '');
    const [isFocused, setIsFocused] = useState(false);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const reactId = useId();
    const isControlled = controlledValue !== undefined;
    const currentValue = isControlled ? controlledValue : internalValue;
    // Consolidate error detection from both the explicit `error` prop
    // and the status-based API so downstream styling checks are simpler.
    const hasError = Boolean(error || status === 'error' || ariaInvalid === true || ariaInvalid === 'true');
    const hasWarning = !hasError && status === 'warning';
    const hasSuccess = !hasError && !hasWarning && status === 'success';
    const sizeIsResponsive = isResponsiveValue<InputSize>(size);
    const resolvedSize = sizeIsResponsive ? (size.base ?? size.xs ?? size.phone ?? 'md') : size;
    const currentValueString = String(currentValue ?? '');
    const controlId = id || `textarea-${reactId.replace(/:/g, '')}`;
    const errorId = `${controlId}-error`;
    const describedBy = [ariaDescribedBy, hasError && errorMessage ? errorId : undefined]
      .filter(Boolean)
      .join(' ') || undefined;

    const responsiveEntries: ResponsivePropEntry<InputSize>[] = sizeIsResponsive
      ? [
          { cssProperty: 'padding', value: size, resolve: (value) => `var(--ds-input-${value}-padding-y) var(--ds-input-${value}-padding-x) !important` },
          { cssProperty: 'font-size', value: size, resolve: (value) => `var(--ds-input-${value}-font-size) !important` },
          { cssProperty: 'line-height', value: size, resolve: (value) => `var(--ds-input-${value}-line-height) !important` },
          { cssProperty: 'border-radius', value: size, resolve: (value) => `var(--ds-input-${value}-radius, var(--ds-input-${value}-border-radius)) !important` },
          ...(loading
            ? [{
                cssProperty: 'padding-inline-end',
                value: size,
                resolve: (value: InputSize) => `calc(var(--ds-input-${value}-padding-x) + var(--ds-input-loading-size) + var(--ds-input-gap)) !important`,
              } as ResponsivePropEntry<InputSize>]
            : []),
        ]
      : [];
    const responsive = sizeIsResponsive
      ? generateResponsiveCSS(`textarea-${reactId.replace(/:/g, '')}`, responsiveEntries)
      : null;

    // Synchronize the forwarded ref with our internal textareaRef so the
    // parent can access the DOM node regardless of ref type (callback or object).
    useEffect(() => {
      if (!ref) {
        return;
      }

      if (typeof ref === 'function') {
        ref(textareaRef.current);
        return;
      }

      (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current =
        textareaRef.current;
    }, [ref]);

    const handleChange = useCallback(
      (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = event.target.value;

        if (!isControlled) {
          setInternalValue(newValue);
        }

        onChange?.(newValue, event as never);
      },
      [isControlled, onChange]
    );

    const handleFocus = useCallback(
      (event: React.FocusEvent<HTMLTextAreaElement>) => {
        setIsFocused(true);
        onFocus?.(event as never);
      },
      [onFocus]
    );

    const handleBlur = useCallback(
      (event: React.FocusEvent<HTMLTextAreaElement>) => {
        setIsFocused(false);
        onBlur?.(event as never);
      },
      [onBlur]
    );

    // Intercept bare Enter (no Shift) for form submission or chat-send patterns.
    // Shift+Enter still inserts a newline as expected in multi-line inputs.
    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
          onPressEnter?.(event as never);
        }

        onKeyDown?.(event as never);
      },
      [onKeyDown, onPressEnter]
    );

    // Build BEM-style class list. Boolean entries (e.g. `isFocused && '...'`)
    // produce `false` when inactive, which filter(Boolean) strips out.
    const containerClasses = [
      'rottay-textarea',
      'ds-input-textarea',
      `rottay-textarea--${resolvedSize}`,
      `rottay-textarea--${variant}`,
      isFocused && 'rottay-textarea--focused',
      hasError && 'rottay-textarea--error',
      disabled && 'rottay-textarea--disabled',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div
        className={containerClasses}
        data-part="root"
        data-size={resolvedSize}
        data-size-responsive={sizeIsResponsive ? 'true' : undefined}
        data-variant={variant}
        data-invalid={hasError ? 'true' : undefined}
        data-warning={hasWarning ? 'true' : undefined}
        data-success={hasSuccess ? 'true' : undefined}
        data-disabled={disabled ? 'true' : undefined}
        data-readonly={readOnly ? 'true' : undefined}
        data-loading={loading ? 'true' : undefined}
        data-filled={currentValueString.length > 0 ? 'true' : undefined}
        data-resize={resize === false ? 'none' : typeof resize === 'string' ? resize : 'theme'}
        style={style}
      >
        {responsive?.css && <style dangerouslySetInnerHTML={{ __html: responsive.css }} />}
        <textarea
          {...(responsive?.attrs ?? {})}
          ref={textareaRef}
          id={controlId}
          name={name}
          value={currentValueString}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          maxLength={maxLength}
          minLength={minLength}
          rows={rows}
          inputMode={inputMode}
          title={title}
          tabIndex={tabIndex}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          spellCheck={spellCheck}
          role={role}
          aria-label={ariaLabel}
          aria-describedby={describedBy}
          aria-invalid={ariaInvalid ?? (hasError || undefined)}
          aria-busy={loading || undefined}
          aria-autocomplete={ariaAutocomplete}
          aria-controls={ariaControls}
          aria-expanded={ariaExpanded}
          aria-activedescendant={ariaActiveDescendant}
          aria-haspopup={ariaHasPopup}
          data-testid={dataTestId}
          data-part="control"
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />

        {loading && (
          <span data-part="loading-indicator" aria-hidden="true">
            <StatusLoadingIcon decorative size="sm" />
          </span>
        )}

        {showCount && maxLength && (
          <span
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
            aria-live="polite"
          >
            {currentValueString.length}/{maxLength}
          </span>
        )}

        {hasError && errorMessage && (
          <span id={errorId} data-part="error-message" role="alert">
            {errorMessage}
          </span>
        )}
      </div>
    );
  }
);

InputTextArea.displayName = 'Input.TextArea';
