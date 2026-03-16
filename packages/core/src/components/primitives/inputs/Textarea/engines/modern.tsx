/**
 * @fileoverview Modern engine for Textarea, built with DaisyUI's `textarea` utility classes.
 * Produces a native `<textarea>` element styled through class composition, keeping the
 * bundle lightweight compared to Classic (no Ant Design runtime).
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

import React from 'react';
import type { TextareaProps } from '../Textarea.types';
import { TEXTAREA_DEFAULTS } from '../Textarea.types';

/** DaisyUI size modifier classes for textarea. */
const SIZE_MAP = {
  sm: 'textarea-sm',
  md: 'textarea-md',
  lg: 'textarea-lg',
};

/** DaisyUI status color classes. Maps DS status names to DaisyUI equivalents. */
const STATUS_MAP = {
  default: '',
  error: 'textarea-error',
  warning: 'textarea-warning',
  success: 'textarea-success',
};

/**
 * DaisyUI variant classes. Only 'outlined' has a specific class (`textarea-bordered`);
 * 'filled' and 'borderless' rely on default / custom styling.
 */
const VARIANT_MAP = {
  outlined: 'textarea-bordered',
  filled: '',
  borderless: '',
};

/**
 * Modern (DaisyUI) implementation of Textarea.
 *
 * Composes DaisyUI classes for size, variant, and status onto a native `<textarea>`.
 * Does not support autoSize, showCount, or allowClear -- use Classic engine for those.
 * The onChange signature is normalized to `(value, event)` for DS consistency.
 *
 * @param props - Standard TextareaProps shared across all engines.
 * @returns A native textarea element with DaisyUI class composition.
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

  // Normalize onChange to DS convention: (value, event) instead of just (event)
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) {
      onChange(e.target.value, e);
    }
  };

  // Assemble DaisyUI classes -- filter(Boolean) drops empty strings from maps
  const classes = [
    'textarea',
    SIZE_MAP[size!],
    VARIANT_MAP[variant!],
    STATUS_MAP[status!],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <textarea
      className={classes}
      placeholder={placeholder}
      value={value}
      defaultValue={defaultValue}
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      maxLength={maxLength}
      rows={rows}
      onChange={handleChange}
      onFocus={onFocus}
      onBlur={onBlur}
      style={style}
      name={name}
      id={id}
      autoComplete={autoComplete}
      autoFocus={autoFocus}
      {...rest}
    />
  );
}
