/**
 * Textarea - Apollo Engine (Vanilla HTML/CSS)
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
