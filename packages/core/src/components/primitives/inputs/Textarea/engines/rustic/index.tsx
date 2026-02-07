'use client';

/**
 * @fileoverview Textarea Rustic Engine - Rottay Design System
 * @description Pure HTML/CSS implementation of the Textarea component using CSS variables.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @module RusticTextarea
 * @category Inputs
 * @package @rottay/design-system
 */

import React, { useState } from 'react';
import type { TextareaProps } from '../../types';
import { TEXTAREA_DEFAULTS } from '../../types';

// Size configuration using CSS variables
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

  const [charCount, setCharCount] = useState(value?.length || defaultValue?.length || 0);
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setCharCount(newValue.length);
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

  // Build class names
  const containerClasses = [
    'rottay-textarea',
    'rottay-textarea--rustic',
    `rottay-textarea--${size}`,
    `rottay-textarea--${variant}`,
    status !== 'default' && `rottay-textarea--${status}`,
    disabled && 'rottay-textarea--disabled',
    readOnly && 'rottay-textarea--readonly',
    isFocused && 'rottay-textarea--focused',
    className,
  ].filter(Boolean).join(' ');

  const getBorderColor = () => {
    if (status === 'error') return 'var(--ds-textarea-error-border)';
    if (status === 'warning') return 'var(--ds-textarea-warning-border)';
    if (status === 'success') return 'var(--ds-textarea-success-border)';
    if (isFocused) return 'var(--ds-textarea-border-focus)';
    return 'var(--ds-textarea-border)';
  };

  const getBackground = () => {
    if (disabled) return 'var(--ds-textarea-bg-disabled)';
    if (variant === 'filled') return 'var(--ds-textarea-filled-bg)';
    return 'var(--ds-textarea-bg)';
  };

  const wrapperStyle: React.CSSProperties = {
    display: 'inline-flex',
    flexDirection: 'column',
    gap: '4px',
    fontFamily: 'var(--ds-font-family-base)',
  };

  const textareaStyle: React.CSSProperties = {
    padding: sizeConfig.padding,
    fontSize: sizeConfig.fontSize,
    border: variant === 'borderless' ? 'none' : `1px solid ${getBorderColor()}`,
    borderRadius: 'var(--ds-textarea-radius)',
    outline: 'none',
    transition: 'var(--ds-textarea-transition)',
    backgroundColor: getBackground(),
    color: 'var(--ds-textarea-color)',
    cursor: disabled ? 'not-allowed' : 'text',
    opacity: disabled ? 0.6 : 1,
    boxShadow: isFocused && variant !== 'borderless' ? 'var(--ds-textarea-shadow-focus)' : 'none',
    resize: 'vertical',
    minHeight: '80px',
    width: '100%',
    ...style,
  };

  const countStyle: React.CSSProperties = {
    fontSize: 'var(--ds-textarea-count-font-size)',
    color: 'var(--ds-textarea-count-color)',
    textAlign: 'right',
    userSelect: 'none',
  };

  return (
    <div className="rottay-textarea-wrapper" style={wrapperStyle}>
      <textarea
        className={containerClasses}
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
        <div className="rottay-textarea__count" style={countStyle}>
          {charCount}
          {maxLength && ` / ${maxLength}`}
        </div>
      )}
    </div>
  );
}

RusticTextarea.displayName = 'Textarea.Rustic';
