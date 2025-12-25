'use client';

import { Radio as AntRadio } from 'antd';
import type { RadioChangeEvent } from 'antd';
import type { RadioProps, RadioOption } from '../../../../types/components/radio';

/**
 * Titan Radio Engine
 *
 * Adapter that converts unified RadioProps to Ant Design Radio.
 * Handles the conversion of onChange signature:
 * - Unified: onChange(value: string | number)
 * - AntD: onChange(e: RadioChangeEvent)
 */
function TitanRadio({
  value,
  onChange,
  disabled,
  className,
  name,
  direction,
  size,
  options,
}: RadioProps) {
  // Convert unified onChange to AntD onChange
  const handleChange = (e: RadioChangeEvent) => {
    onChange?.(e.target.value);
  };

  // Map unified size to AntD size
  const antSize = size === 'medium' ? 'middle' : size;

  // If options are provided, use Radio.Group
  if (options && options.length > 0) {
    return (
      <AntRadio.Group
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className={className}
        name={name}
        size={antSize}
        optionType="default"
      >
        {options.map((option: RadioOption) => (
          <AntRadio
            key={String(option.value)}
            value={option.value}
            disabled={option.disabled}
            className={option.className}
            style={direction === 'vertical' ? { display: 'block', marginBottom: 8 } : undefined}
          >
            {option.label}
          </AntRadio>
        ))}
      </AntRadio.Group>
    );
  }

  // Default: just return the base Radio.Group
  return (
    <AntRadio.Group
      value={value}
      onChange={handleChange}
      disabled={disabled}
      className={className}
      name={name}
      size={antSize}
    />
  );
}

TitanRadio.displayName = 'TitanRadio';

export default TitanRadio;
