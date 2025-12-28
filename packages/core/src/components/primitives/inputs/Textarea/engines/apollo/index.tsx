/**
 * @fileoverview Textarea Apollo Engine - Rottay Design System
 * @description Pure HTML/CSS implementation of the Textarea component.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * The Apollo engine provides a zero-dependency textarea implementation
 * using pure HTML and CSS classes. It includes custom character count
 * display with full accessibility.
 *
 * **Pure CSS Features:**
 * - Native textarea with custom class styling
 * - Character count display (showCount)
 * - Size variants via CSS classes
 * - Status colors via CSS classes
 * - Variant styles (outlined, filled, borderless)
 *
 * **CSS Classes Generated:**
 * - `rottay-textarea` - Base class
 * - `rottay-textarea--{size}` - Size modifier
 * - `rottay-textarea--{variant}` - Variant modifier
 * - `rottay-textarea--{status}` - Status modifier
 * - `rottay-textarea--disabled` - Disabled state
 * - `rottay-textarea--readonly` - Read-only state
 *
 * **Character Count:**
 * When `showCount` is enabled, displays:
 * - Current character count
 * - Max length if specified (e.g., "150 / 500")
 *
 * @example Using Apollo Engine
 * ```tsx
 * import { Textarea } from '@rottay/design-system';
 *
 * <Textarea
 *   engine="apollo"
 *   placeholder="Add notes..."
 *   rows={5}
 *   showCount
 *   maxLength={1000}
 *   status="default"
 * />
 * ```
 *
 * @see {@link Textarea} for the main component
 * @see {@link TitanTextarea} for Ant Design implementation
 * @see {@link HermesTextarea} for DaisyUI implementation
 * @module ApolloTextarea
 * @category Inputs
 * @package @rottay/design-system
 */

import React from 'react';
import type { TextareaProps } from '../../types';
import { TEXTAREA_DEFAULTS } from '../../types';

const SIZE_MAP = {
  sm: 'rottay-textarea--sm',
  md: 'rottay-textarea--md',
  lg: 'rottay-textarea--lg',
};

const STATUS_MAP = {
  default: 'rottay-textarea--default',
  error: 'rottay-textarea--error',
  warning: 'rottay-textarea--warning',
  success: 'rottay-textarea--success',
};

const VARIANT_MAP = {
  outlined: 'rottay-textarea--outlined',
  filled: 'rottay-textarea--filled',
  borderless: 'rottay-textarea--borderless',
};

export default function ApolloTextarea(props: TextareaProps): React.ReactElement {
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
    className,
    style,
    name,
    id,
    autoComplete,
    autoFocus,
    ...rest
  } = props;

  const [charCount, setCharCount] = React.useState(value?.length || defaultValue?.length || 0);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setCharCount(newValue.length);
    if (onChange) {
      onChange(newValue, e);
    }
  };

  const classes = [
    'rottay-textarea',
    SIZE_MAP[size!],
    VARIANT_MAP[variant!],
    STATUS_MAP[status!],
    disabled && 'rottay-textarea--disabled',
    readOnly && 'rottay-textarea--readonly',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="rottay-textarea-wrapper">
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
      {showCount && (
        <div className="rottay-textarea-count">
          {charCount}
          {maxLength && ` / ${maxLength}`}
        </div>
      )}
    </div>
  );
}
