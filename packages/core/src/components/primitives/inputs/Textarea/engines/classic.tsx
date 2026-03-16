/**
 * @fileoverview Classic engine for Textarea, wrapping Ant Design's `Input.TextArea`.
 * Provides enterprise features (autoSize, showCount, allowClear) out of the box
 * by mapping DS prop conventions to Ant Design's API surface.
 *
 * @example
 * ```tsx
 * <Textarea engine="classic" autoSize={{ minRows: 3, maxRows: 8 }} showCount maxLength={500} />
 * ```
 *
 * @module ClassicTextarea
 * @category Inputs
 * @package @rottay/design-system
 */

import React from 'react';
import { Input } from 'antd';
import type { TextareaProps } from '../Textarea.types';
import { TEXTAREA_DEFAULTS } from '../Textarea.types';

const { TextArea: AntTextArea } = Input;

/** Maps DS size tokens to Ant Design's expected size literals. */
const SIZE_MAP = {
  sm: 'small' as const,
  md: 'middle' as const,
  lg: 'large' as const,
};

/**
 * Maps DS status values to Ant Design status prop.
 * 'success' has no Ant counterpart, so it maps to undefined (default appearance).
 */
const STATUS_MAP = {
  default: undefined,
  error: 'error' as const,
  warning: 'warning' as const,
  success: undefined,
};

/**
 * Maps DS variant names to Ant Design variant prop.
 * 'outlined' is Ant's default, so it maps to undefined.
 */
const VARIANT_MAP = {
  outlined: undefined,
  filled: 'filled' as const,
  borderless: 'borderless' as const,
};

/**
 * Classic (Ant Design) implementation of Textarea.
 *
 * Thin wrapper around `Input.TextArea` that translates DS-standard prop names
 * (size, variant, status) into Ant Design equivalents and normalizes the
 * onChange signature to `(value, event)` instead of Ant's raw event.
 *
 * @param props - Standard TextareaProps shared across all engines.
 * @returns An Ant Design TextArea element with mapped props.
 */
export default function ClassicTextarea(props: TextareaProps): React.ReactElement {
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
    autoSize,
    allowClear,
    onChange,
    onFocus,
    onBlur,
    onPressEnter,
    onResize,
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

  // Strip the keyboard event from the public API -- consumers only need to know Enter was pressed
  const handlePressEnter = (_e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (onPressEnter) {
      onPressEnter();
    }
  };

  return (
    <AntTextArea
      size={SIZE_MAP[size!]}
      variant={VARIANT_MAP[variant!]}
      status={STATUS_MAP[status!]}
      placeholder={placeholder}
      value={value}
      defaultValue={defaultValue}
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      maxLength={maxLength}
      showCount={showCount}
      rows={rows}
      autoSize={autoSize}
      allowClear={allowClear}
      onChange={handleChange}
      onFocus={onFocus}
      onBlur={onBlur}
      onPressEnter={handlePressEnter}
      onResize={onResize}
      className={className}
      style={style}
      name={name}
      id={id}
      autoComplete={autoComplete}
      autoFocus={autoFocus}
      {...rest}
    />
  );
}
