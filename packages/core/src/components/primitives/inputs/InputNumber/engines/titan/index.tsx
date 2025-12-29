'use client';

/**
 * @fileoverview InputNumber Titan Engine - Rottay Design System
 * @description Ant Design implementation of the InputNumber component.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * The Titan engine wraps Ant Design's InputNumber, providing enterprise-grade
 * numeric input with advanced formatting, precision control, and step handling.
 *
 * **Ant Design Features Utilized:**
 * - Full InputNumber component with all props
 * - Custom formatter/parser functions
 * - stringMode for high precision
 * - decimalSeparator customization
 * - Variant styles (outlined, borderless, filled)
 *
 * **Prop Mapping:**
 * - `size`: 'default' → 'middle'
 * - All other props passed directly
 *
 * @example Using Titan Engine
 * ```tsx
 * <InputNumber
 *   engine="titan"
 *   min={0}
 *   max={1000}
 *   formatter={(v) => `$ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
 *   parser={(v) => v.replace(/\$\s?|(,*)/g, '')}
 * />
 * ```
 *
 * @see {@link InputNumber} for the main component
 * @see {@link HermesInputNumber} for DaisyUI implementation
 * @see {@link ApolloInputNumber} for vanilla implementation
 * @module TitanInputNumber
 * @category Inputs
 * @package @rottay/design-system
 */

import React from 'react';
import { InputNumber as AntInputNumber } from 'antd';
import type { InputNumberProps } from '../../types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const InputNumber = React.forwardRef<any, InputNumberProps>(
  (props, ref) => {
    const {
      value,
      defaultValue,
      min,
      max,
      step,
      precision,
      disabled,
      readOnly,
      size,
      status,
      prefix,
      suffix,
      addonBefore,
      addonAfter,
      placeholder,
      controls,
      keyboard,
      stringMode,
      formatter,
      parser,
      decimalSeparator,
      onChange,
      onPressEnter,
      onStep,
      className,
      style,
      autoFocus,
      id,
      name,
      bordered: _bordered,
      variant,
    } = props;

    return (
      <AntInputNumber
        ref={ref}
        value={value}
        defaultValue={defaultValue}
        min={min}
        max={max}
        step={step}
        precision={precision}
        disabled={disabled}
        readOnly={readOnly}
        size={size === 'default' ? 'middle' : size}
        status={status}
        prefix={prefix}
        suffix={suffix}
        addonBefore={addonBefore}
        addonAfter={addonAfter}
        placeholder={placeholder}
        controls={controls}
        keyboard={keyboard}
        stringMode={stringMode}
        formatter={formatter}
        parser={parser}
        decimalSeparator={decimalSeparator}
        onChange={onChange}
        onPressEnter={onPressEnter}
        onStep={onStep as any}
        className={className}
        style={style}
        autoFocus={autoFocus}
        id={id}
        name={name}
        variant={variant}
      />
    );
  }
);

InputNumber.displayName = 'InputNumber.Titan';

export default InputNumber;
