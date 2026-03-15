/**
 * @fileoverview Textarea Classic Engine - Rottay Design System
 * @description Ant Design implementation of the Textarea component.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * The Classic engine wraps Ant Design's TextArea component, providing
 * enterprise-grade multi-line input with advanced features like
 * auto-sizing and character counting.
 *
 * **Ant Design Features Utilized:**
 * - Input.TextArea component
 * - Auto-resize with minRows/maxRows
 * - Built-in character count (showCount)
 * - Clear button (allowClear)
 * - Resize callback (onResize)
 *
 * **Prop Mapping:**
 * - `size`: 'sm' → 'small', 'md' → 'middle', 'lg' → 'large'
 * - `variant`: 'outlined' → undefined, 'filled' → 'filled', 'borderless' → 'borderless'
 * - `status`: 'default' → undefined, 'error' → 'error', 'warning' → 'warning'
 *
 * **Event Handlers:**
 * - `onChange`: Wraps native event to provide value directly
 * - `onPressEnter`: Triggered on Enter key press
 * - `onResize`: Reports new dimensions
 *
 * @example Using Classic Engine
 * ```tsx
 * import { Textarea } from '@rottay/design-system';
 *
 * <Textarea
 *   engine="classic"
 *   placeholder="Type here..."
 *   autoSize={{ minRows: 3, maxRows: 8 }}
 *   showCount
 *   maxLength={500}
 *   allowClear
 * />
 * ```
 *
 * @see {@link Textarea} for the main component
 * @see {@link ModernTextarea} for DaisyUI implementation
 * @see {@link RusticTextarea} for vanilla implementation
 * @module ClassicTextarea
 * @category Inputs
 * @package @rottay/design-system
 */

import React from 'react';
import { Input } from 'antd';
import type { TextareaProps } from '../Textarea.types';
import { TEXTAREA_DEFAULTS } from '../Textarea.types';

const { TextArea: AntTextArea } = Input;

const SIZE_MAP = {
  sm: 'small' as const,
  md: 'middle' as const,
  lg: 'large' as const,
};

const STATUS_MAP = {
  default: undefined,
  error: 'error' as const,
  warning: 'warning' as const,
  success: undefined,
};

const VARIANT_MAP = {
  outlined: undefined,
  filled: 'filled' as const,
  borderless: 'borderless' as const,
};

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

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) {
      onChange(e.target.value, e);
    }
  };

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
