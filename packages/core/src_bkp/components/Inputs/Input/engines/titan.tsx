/**
 * Titan Input Engine
 *
 * Adapter that converts unified InputProps to Ant Design Input.
 * Maps unified types to AntD types without using spread to avoid
 * incompatible props being passed through.
 */

'use client';

import { forwardRef } from 'react';
import { Input as AntInput } from 'antd';
import type { InputRef } from 'antd';
import type { InputProps } from '../../../../types/components/input';

/**
 * Titan Input - Ant Design implementation with unified InputProps
 */
const TitanInput = forwardRef<InputRef, InputProps>(
  (
    {
      value,
      defaultValue,
      placeholder,
      disabled,
      readOnly,
      type,
      onChange,
      onFocus,
      onBlur,
      className,
      style,
      id,
      name,
      autoFocus,
      size,
      status,
      maxLength,
      prefix,
      suffix,
      allowClear,
      onPressEnter,
      autoComplete,
      // variant is excluded - AntD has different variant values
    },
    ref
  ) => {
    return (
      <AntInput
        ref={ref}
        value={value}
        defaultValue={defaultValue}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        type={type}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        className={className}
        style={style}
        id={id}
        name={name}
        autoFocus={autoFocus}
        size={size}
        status={status}
        maxLength={maxLength}
        prefix={prefix}
        suffix={suffix}
        allowClear={allowClear}
        onPressEnter={onPressEnter}
        autoComplete={autoComplete}
      />
    );
  }
);

TitanInput.displayName = 'TitanInput';

export default TitanInput;
