/**
 * @fileoverview Modern engine for Textarea - Rottay Design System
 * @description Premium textarea implementation with pure DS token inline styles.
 * No DaisyUI dependency -- all styling via CSS custom properties for full theme control.
 *
 * @remarks
 * **Visual Spec:**
 * - Border: 1px solid `--ds-color-border`, radius `--ds-radius-md`
 * - Background: `--ds-color-bg-input` (falls back to `--ds-surface-control`)
 * - Text: `--ds-color-text-primary`, placeholder `--ds-color-text-muted`
 * - Focus: 2px outline `--ds-color-primary` with offset, `:focus-visible` only
 * - Error: red border + error message support via status prop
 * - Warning: amber border, Success: green border
 * - Disabled: muted background, reduced opacity 0.5
 * - Resize handle: vertical only, subtle styling
 * - Touch target: min 44px height ensured
 * - Transitions: var(--ds-motion-fast) ease-out on border/outline
 *
 * @example
 * ```tsx
 * <Textarea engine="modern" placeholder="Enter description..." rows={4} variant="outlined" />
 * ```
 *
 * @module ModernTextarea
 * @category Inputs
 * @package @rottay/design-system
 */

'use client';

import React, { useState, useCallback, useRef } from 'react';
import type { TextareaProps } from '../Textarea.types';
import { TEXTAREA_DEFAULTS } from '../Textarea.types';

/* ------------------------------------------------------------------ */
/*  Size config                                                        */
/* ------------------------------------------------------------------ */

interface SizeConfig {
  fontSize: number;
  lineHeight: string;
  paddingV: number;
  paddingH: number;
}

const SIZE_CONFIG: Record<string, SizeConfig> = {
  sm: { fontSize: 13, lineHeight: '18px', paddingV: 6, paddingH: 10 },
  md: { fontSize: 14, lineHeight: '20px', paddingV: 8, paddingH: 12 },
  lg: { fontSize: 16, lineHeight: '24px', paddingV: 10, paddingH: 14 },
};

/* ------------------------------------------------------------------ */
/*  Status colors                                                      */
/* ------------------------------------------------------------------ */

const STATUS_BORDER: Record<string, string> = {
  default: 'var(--ds-color-border)',
  error: 'var(--ds-color-error)',
  warning: 'var(--ds-color-warning)',
  success: 'var(--ds-color-success)',
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

/**
 * Modern (pure DS tokens) implementation of Textarea.
 *
 * All styling uses inline styles with DS CSS custom properties.
 * Supports size, variant, status, disabled, and readOnly props.
 * The onChange signature is normalized to `(value, event)` for DS consistency.
 *
 * @param props - Standard TextareaProps shared across all engines.
 * @returns A styled native textarea element.
 */
export default function ModernTextarea(props: TextareaProps): React.ReactElement {
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
    rows = TEXTAREA_DEFAULTS.rows,
    autoSize,
    onChange,
    onFocus,
    onBlur,
    className,
    style,
    name,
    id,
    autoComplete,
    autoFocus,
    ...rest
  } = props;

  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) {
      onChange(e.target.value, e);
    }
  }, [onChange]);

  const handleFocus = useCallback((e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  }, [onFocus]);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  }, [onBlur]);

  /* -- Computed styles --------------------------------------------- */
  const sizeKey = size || 'md';
  const cfg = SIZE_CONFIG[sizeKey] || SIZE_CONFIG.md;
  const statusKey = status || 'default';
  const borderColor = STATUS_BORDER[statusKey] || STATUS_BORDER.default;

  const isError = statusKey === 'error';
  const isWarning = statusKey === 'warning';
  const isSuccess = statusKey === 'success';

  const isBorderless = variant === 'borderless';
  const isFilled = variant === 'filled';

  const transitionTiming = 'var(--ds-motion-fast) ease-out';

  const backgroundColor = (() => {
    if (disabled) return 'var(--ds-color-bg-disabled, var(--ds-color-bg-secondary))';
    if (isFilled) return 'var(--ds-color-bg-input, var(--ds-surface-control, var(--ds-color-bg-secondary)))';
    return 'var(--ds-color-bg-input, var(--ds-surface-control, transparent))';
  })();

  const computedBorderColor = (() => {
    if (isBorderless) return 'transparent';
    if (isFocused && !disabled) {
      if (isError) return 'var(--ds-color-error)';
      if (isWarning) return 'var(--ds-color-warning)';
      if (isSuccess) return 'var(--ds-color-success)';
      return 'var(--ds-color-primary)';
    }
    return borderColor;
  })();

  const textareaStyle: React.CSSProperties = {
    display: 'block',
    width: '100%',
    minHeight: 44,
    fontSize: cfg.fontSize,
    lineHeight: cfg.lineHeight,
    fontFamily: 'inherit',
    color: disabled ? 'var(--ds-color-text-disabled)' : 'var(--ds-color-text-primary)',
    backgroundColor,
    border: `1px solid ${computedBorderColor}`,
    borderRadius: 'var(--ds-radius-md)',
    padding: `${cfg.paddingV}px ${cfg.paddingH}px`,
    resize: autoSize ? 'none' : 'vertical',
    transition: `border-color ${transitionTiming}, outline-color ${transitionTiming}, background-color ${transitionTiming}`,
    outline: 'none',
    boxSizing: 'border-box',
    ...(isFocused && !disabled && {
      outline: `2px solid ${isError ? 'var(--ds-color-error)' : isWarning ? 'var(--ds-color-warning)' : isSuccess ? 'var(--ds-color-success)' : 'var(--ds-color-primary)'}`,
      outlineOffset: '-1px',
    }),
    ...(disabled && {
      opacity: 0.5,
      cursor: 'not-allowed',
    }),
    ...style,
  };

  return (
    <textarea
      ref={textareaRef}
      className={`ds-textarea ds-textarea--modern ${className || ''}`}
      data-part="root"
      data-status={statusKey}
      data-disabled={disabled ? 'true' : 'false'}
      placeholder={placeholder}
      value={value}
      defaultValue={defaultValue}
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      maxLength={maxLength}
      rows={typeof autoSize === 'object' ? (autoSize.minRows ?? rows) : autoSize ? 1 : rows}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      style={textareaStyle}
      name={name}
      id={id}
      autoComplete={autoComplete}
      autoFocus={autoFocus}
      aria-invalid={isError || undefined}
      {...rest}
    />
  );
}
