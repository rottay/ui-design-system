/**
 * Titan InputNumber Engine
 *
 * Adapter that converts unified InputNumberProps to Ant Design InputNumber.
 * Maps unified types to AntD types without using spread to avoid
 * incompatible props being passed through.
 */

'use client';

import { forwardRef } from 'react';
import { InputNumber as AntInputNumber } from 'antd';
import type { InputNumberProps as AntInputNumberProps } from 'antd';
import type { InputNumberProps } from '../../../../types/components/input-number';

/**
 * Titan InputNumber - Ant Design implementation with unified InputNumberProps
 */
const TitanInputNumber = forwardRef<HTMLInputElement, InputNumberProps>(
  (
    {
      value,
      defaultValue,
      min,
      max,
      step,
      onChange,
      onFocus,
      onBlur,
      disabled,
      readOnly,
      placeholder,
      className,
      style,
      id,
      name,
      autoFocus,
      size,
      status,
      precision,
      decimalSeparator,
      formatter,
      parser,
      controls,
      keyboard,
      prefix,
      suffix,
      addonBefore,
      addonAfter,
      onPressEnter,
      onStep,
      stringMode,
      // controls_position is not used in AntD (always right)
    },
    ref
  ) => {
    // Map unified onChange to AntD onChange
    const handleChange = (val: number | null) => {
      onChange?.(val);
    };

    // Build AntD-compatible props
    const antdProps: AntInputNumberProps = {
      value,
      defaultValue,
      min,
      max,
      step,
      onChange: handleChange,
      onFocus,
      onBlur,
      disabled,
      readOnly,
      placeholder,
      className,
      style,
      id,
      autoFocus,
      size,
      status,
      precision,
      decimalSeparator,
      formatter,
      parser,
      controls,
      keyboard,
      prefix,
      suffix,
      addonBefore,
      addonAfter,
      onPressEnter,
      onStep,
      stringMode,
    };

    return <AntInputNumber ref={ref} {...antdProps} />;
  }
);

TitanInputNumber.displayName = 'TitanInputNumber';

export default TitanInputNumber;
