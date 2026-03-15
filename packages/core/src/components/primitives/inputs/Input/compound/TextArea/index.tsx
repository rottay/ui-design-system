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

    const [internalValue, setInternalValue] = useState(defaultValue ?? '');
    const [isFocused, setIsFocused] = useState(false);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const isControlled = controlledValue !== undefined;
    const currentValue = isControlled ? controlledValue : internalValue;
    const hasError = error || status === 'error';
    const sizeValues = SIZE_MAP[size as keyof typeof SIZE_MAP] || SIZE_MAP.md;

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

    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
          onPressEnter?.(event as never);
        }

        onKeyDown?.(event as never);
      },
      [onKeyDown, onPressEnter]
    );

    const containerStyle: CSSProperties = {
      position: 'relative',
      display: 'block',
      width: '100%',
      ...style,
    };

    const neutralBorder = 'var(--ds-color-border-secondary)';
    const focusBorder = 'var(--ds-color-primary)';
    const errorBorder = 'var(--ds-color-error)';
    const focusRing = '0 0 0 2px var(--ds-color-alpha-primary-20)';
    const errorRing = '0 0 0 2px var(--ds-color-alpha-error-20)';
    const isBorderless = variant === 'unstyled' || variant === 'flushed';
    const outlineBorder = `1px solid ${hasError ? errorBorder : isFocused ? focusBorder : neutralBorder}`;
    const sideBorder = isBorderless ? 'none' : outlineBorder;

    const textareaStyle: CSSProperties = {
      width: '100%',
      padding: sizeValues.paddingX,
      fontSize: sizeValues.fontSize,
      fontFamily: 'inherit',
      backgroundColor:
        variant === 'filled' ? 'var(--ds-color-bg-secondary)' : 'transparent',
      borderRadius: variant === 'flushed' ? 0 : 6,
      borderTop: sideBorder,
      borderRight: sideBorder,
      borderLeft: sideBorder,
      borderBottom:
        variant === 'flushed'
          ? `${isFocused ? 2 : 1}px solid ${
              hasError ? errorBorder : isFocused ? focusBorder : neutralBorder
            }`
          : sideBorder,
      outline: 'none',
      resize: resize ? 'vertical' : 'none',
      transition: 'all 0.2s ease',
      opacity: disabled ? 0.6 : 1,
      cursor: disabled ? 'not-allowed' : 'text',
      boxShadow:
        isFocused && !hasError && variant !== 'unstyled'
          ? focusRing
          : hasError && variant !== 'unstyled'
            ? errorRing
            : 'none',
    };

    const containerClasses = [
      'rottay-textarea',
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
      <div className={containerClasses} style={containerStyle}>
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
          style={textareaStyle}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />

        {showCount && maxLength && (
          <span
            style={{
              position: 'absolute',
              right: 8,
              bottom: -20,
              fontSize: 12,
              color: hasError
                ? 'var(--ds-color-error)'
                : 'var(--ds-color-text-muted)',
            }}
          >
            {currentValue.length}/{maxLength}
          </span>
        )}

        {hasError && errorMessage && (
          <span
            style={{
              display: 'block',
              marginTop: 4,
              fontSize: 12,
              color: 'var(--ds-color-error)',
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
