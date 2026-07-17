'use client';

/**
 * @fileoverview Rustic (zero-dependency) engine for Textarea, using inline CSS and DS CSS variables.
 * Implements showCount natively (unlike Modern). Border color and box-shadow are painted
 * by the unlayered skin CSS on native `:focus`/`[data-status]`, not by inline styles.
 *
 * @example
 * ```tsx
 * <Textarea engine="rustic" showCount maxLength={200} status="error" />
 * ```
 *
 * @module RusticTextarea
 * @category Inputs
 * @package @rottay/design-system
 */

import React, { useEffect, useState } from 'react';
import type { TextareaProps } from '../../contracts';
import { TEXTAREA_DEFAULTS } from '../../contracts';

/** Size tokens referencing DS CSS variables for consistent sizing across tenants. */
const SIZE_CONFIG: Record<string, { padding: string; fontSize: string }> = {
  sm: {
    padding: 'var(--ds-textarea-sm-padding)',
    fontSize: 'var(--ds-textarea-sm-font-size)',
  },
  md: {
    padding: 'var(--ds-textarea-md-padding)',
    fontSize: 'var(--ds-textarea-md-font-size)',
  },
  lg: {
    padding: 'var(--ds-textarea-lg-padding)',
    fontSize: 'var(--ds-textarea-lg-font-size)',
  },
};

/**
 * Rustic (vanilla HTML/CSS) implementation of Textarea.
 *
 * Tracks character count via local state synced to the controlled/uncontrolled value,
 * and renders a `current / max` counter when `showCount` is enabled. All visual
 * properties are driven by DS CSS custom properties for tenant-level theming.
 *
 * @param props - Standard TextareaProps shared across all engines.
 * @returns A wrapper div containing a styled native textarea and optional character counter.
 */
export default function RusticTextarea(props: TextareaProps): React.ReactElement {
  const {
    size = TEXTAREA_DEFAULTS.size,
    variant = TEXTAREA_DEFAULTS.variant,
    status = TEXTAREA_DEFAULTS.status,
    placeholder,
    value,
    defaultValue,
    disabled,
    readOnly,
    required,
    maxLength,
    showCount,
    rows = TEXTAREA_DEFAULTS.rows,
    onChange,
    onFocus,
    onBlur,
    className = '',
    style,
    name,
    id,
    autoComplete,
    autoFocus,
    ...rest
  } = props;

  // Character count for the optional showCount feature -- kept in sync with value
  const [charCount, setCharCount] = useState(value?.length || defaultValue?.length || 0);
  // Retained for the `rottay-textarea--focused` class hook (external override
  // surface); the skin CSS paints border/box-shadow from native `:focus` directly.
  const [isFocused, setIsFocused] = useState(false);

  // Sync charCount whenever the controlled value or defaultValue changes externally
  useEffect(() => {
    if (value !== undefined) {
      setCharCount(value.length);
      return;
    }

    if (defaultValue !== undefined) {
      setCharCount(defaultValue.length);
      return;
    }

    setCharCount(0);
  }, [defaultValue, value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setCharCount(newValue.length);
    // Normalize onChange to DS convention: (value, event)
    if (onChange) {
      onChange(newValue, e);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const sizeConfig = SIZE_CONFIG[size!] || SIZE_CONFIG.md;

  // BEM-style class names for optional external CSS overrides
  const containerClasses = [
    'rottay-textarea',
    'rottay-textarea--rustic',
    'ds-textarea',
    'ds-textarea--rustic',
    `rottay-textarea--${size}`,
    `rottay-textarea--${variant}`,
    status !== 'default' && `rottay-textarea--${status}`,
    disabled && 'rottay-textarea--disabled',
    readOnly && 'rottay-textarea--readonly',
    isFocused && 'rottay-textarea--focused',
    className,
  ].filter(Boolean).join(' ');

  const wrapperStyle: React.CSSProperties = {
    display: 'inline-flex',
    flexDirection: 'column',
    gap: '4px',
    fontFamily: 'var(--ds-font-family-base)',
  };

  const textareaStyle: React.CSSProperties = {
    padding: sizeConfig.padding,
    fontSize: sizeConfig.fontSize,
    transition: 'var(--ds-textarea-transition)',
    cursor: disabled ? 'not-allowed' : 'text',
    opacity: disabled ? 0.6 : 1,
    resize: 'vertical',
    minHeight: '80px',
    width: '100%',
    ...style,
  };

  const countStyle: React.CSSProperties = {
    fontSize: 'var(--ds-textarea-count-font-size)',
    textAlign: 'right',
    userSelect: 'none',
  };

  return (
    <div className="rottay-textarea-wrapper" style={wrapperStyle}>
      <textarea
        className={containerClasses}
        data-part="root"
        data-status={status ?? 'default'}
        data-disabled={disabled ? 'true' : 'false'}
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        maxLength={maxLength}
        rows={rows}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={textareaStyle}
        name={name}
        id={id}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        aria-invalid={status === 'error'}
        {...rest}
      />
      {showCount && (
        <div className="rottay-textarea__count" data-part="count" style={countStyle}>
          {charCount}
          {maxLength && ` / ${maxLength}`}
        </div>
      )}
    </div>
  );
}

RusticTextarea.displayName = 'Textarea.Rustic';
