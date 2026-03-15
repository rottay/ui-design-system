/**
 * @fileoverview Textarea Modern Engine - Rottay Design System
 * @description DaisyUI/Tailwind CSS implementation of the Textarea component.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * The Modern engine implements textareas using DaisyUI's textarea classes
 * with Tailwind CSS utilities. It provides a lightweight alternative
 * with utility-first styling.
 *
 * **DaisyUI Classes Used:**
 * - `textarea` - Base textarea styling
 * - `textarea-{size}` - Size variants (sm, md, lg)
 * - `textarea-bordered` - Outlined variant
 * - `textarea-{status}` - Status colors (error, warning, success)
 *
 * **Tailwind Integration:**
 * - Native textarea element
 * - DaisyUI classes for consistent styling
 * - Supports all native textarea attributes
 *
 * **Limitations:**
 * - No built-in autoSize (use custom solution if needed)
 * - No built-in showCount (implement separately)
 * - No allowClear button
 *
 * @example Using Modern Engine
 * ```tsx
 * import { Textarea } from '@rottay/design-system';
 *
 * <Textarea
 *   engine="modern"
 *   placeholder="Enter description..."
 *   rows={4}
 *   variant="outlined"
 *   className="w-full"
 * />
 * ```
 *
 * @see {@link Textarea} for the main component
 * @see {@link ClassicTextarea} for Ant Design implementation
 * @see {@link RusticTextarea} for vanilla implementation
 * @module ModernTextarea
 * @category Inputs
 * @package @rottay/design-system
 */

import React from 'react';
import type { TextareaProps } from '../Textarea.types';
import { TEXTAREA_DEFAULTS } from '../Textarea.types';

const SIZE_MAP = {
  sm: 'textarea-sm',
  md: 'textarea-md',
  lg: 'textarea-lg',
};

const STATUS_MAP = {
  default: '',
  error: 'textarea-error',
  warning: 'textarea-warning',
  success: 'textarea-success',
};

const VARIANT_MAP = {
  outlined: 'textarea-bordered',
  filled: '',
  borderless: '',
};

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

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) {
      onChange(e.target.value, e);
    }
  };

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
