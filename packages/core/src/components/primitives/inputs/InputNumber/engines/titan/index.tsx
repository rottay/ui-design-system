'use client';

/**
 * InputNumber - Titan Engine (Ant Design)
 */
import React from 'react';
import { InputNumber as AntInputNumber } from 'antd';
import type { InputNumberProps } from '../../types';

export const InputNumber = React.forwardRef<HTMLInputElement, InputNumberProps>(
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
