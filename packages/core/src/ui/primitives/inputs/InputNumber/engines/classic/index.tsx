'use client';

/**
 * @fileoverview InputNumber Classic Engine - Rottay Design System
 * @description Ant Design implementation of the InputNumber component.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * The Classic engine wraps Ant Design's InputNumber, providing enterprise-grade
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
 * @example Using Classic Engine
 * ```tsx
 * <InputNumber
 *   engine="classic"
 *   min={0}
 *   max={1000}
 *   formatter={(v) => `$ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
 *   parser={(v) => v.replace(/\$\s?|(,*)/g, '')}
 * />
 * ```
 *
 * @see {@link InputNumber} for the main component
 * @see {@link ModernInputNumber} for DaisyUI implementation
 * @see {@link RusticInputNumber} for vanilla implementation
 * @module ClassicInputNumber
 * @category Inputs
 * @package @rottay/design-system
 */

import React from 'react';
import { InputNumber as AntInputNumber, Space } from 'antd';
import type { InputNumberProps } from '../../contracts';

/**
 * Classic engine InputNumber backed by Ant Design's InputNumber.
 * Delegates all numeric formatting, precision, and step logic to Ant Design,
 * wrapping addons in Space.Compact when present.
 *
 * @param props - Unified InputNumberProps from the design system contract.
 * @param ref - Forwarded ref attached to the underlying Ant InputNumber.
 * @returns The rendered Ant Design InputNumber, optionally wrapped in Space.Compact for addons.
 */
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

    // Map DS "default" size to Ant Design's equivalent "middle" token
    const input = (
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

    // When no addons are needed, render the bare input to avoid extra DOM nesting
    if (!addonBefore && !addonAfter) {
      return input;
    }

    // Wrap in Space.Compact so addons share contiguous border radii with the input
    return (
      <Space.Compact className={className} style={style}>
        {addonBefore ? <span>{addonBefore}</span> : null}
        {input}
        {addonAfter ? <span>{addonAfter}</span> : null}
      </Space.Compact>
    );
  }
);

InputNumber.displayName = 'InputNumber.Classic';

export default InputNumber;
