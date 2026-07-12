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
 * - Configurable resize behavior
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
  useRef,
  useState,
  type CSSProperties,
} from 'react';

import type { InputTextAreaProps } from '../../Input.types';
import { SIZE_MAP } from '../../Input.types';

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
      maxLength,
      minLength,
      rows = 4,
      resize = true,
      showCount = false,
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
    } = props;

    // Dual-mode value management: when controlledValue is defined the parent
    // owns state; otherwise internal state tracks the value for uncontrolled usage.
    const [internalValue, setInternalValue] = useState(defaultValue ?? '');
    const [isFocused, setIsFocused] = useState(false);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const isControlled = controlledValue !== undefined;
    const currentValue = isControlled ? controlledValue : internalValue;
    // Consolidate error detection from both the explicit `error` prop
    // and the status-based API so downstream styling checks are simpler.
    const hasError = error || status === 'error';
    const sizeValues = SIZE_MAP[size as keyof typeof SIZE_MAP] || SIZE_MAP.md;

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

    // Container is relative-positioned so the character counter can be
    // absolutely positioned at the bottom-right corner.
    const containerStyle: CSSProperties = {
      position: 'relative',
      display: 'block',
      width: '100%',
      ...style,
    };

    const textareaStyle: CSSProperties = {
      width: '100%',
      padding: sizeValues.paddingX,
      fontSize: sizeValues.fontSize,
      fontFamily: 'inherit',
      resize: resize ? 'vertical' : 'none',
      transition: 'all 0.2s ease',
      opacity: disabled ? 0.6 : 1,
      cursor: disabled ? 'not-allowed' : 'text',
    };

    // Build BEM-style class list. Boolean entries (e.g. `isFocused && '...'`)
    // produce `false` when inactive, which filter(Boolean) strips out.
    const containerClasses = [
      'rottay-textarea',
      'ds-input-textarea',
      `rottay-textarea--${size}`,
      `rottay-textarea--${variant}`,
      isFocused && 'rottay-textarea--focused',
      hasError && 'rottay-textarea--error',
      disabled && 'rottay-textarea--disabled',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={containerClasses} data-part="root" style={containerStyle}>
        <textarea
          ref={textareaRef}
          id={id}
          name={name}
          value={currentValue}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          maxLength={maxLength}
          minLength={minLength}
          rows={rows}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
          aria-invalid={hasError}
          data-testid={dataTestId}
          data-part="control"
          style={textareaStyle}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />

        {showCount && maxLength && (
          <span
            data-part="count"
            style={{
              position: 'absolute',
              right: 8,
              bottom: -20,
              fontSize: 12,
            }}
          >
            {currentValue.length}/{maxLength}
          </span>
        )}

        {hasError && errorMessage && (
          <span
            data-part="error-message"
            style={{
              display: 'block',
              marginTop: 4,
              fontSize: 12,
            }}
          >
            {errorMessage}
          </span>
        )}
      </div>
    );
  }
);

InputTextArea.displayName = 'Input.TextArea';
