/**
 * Radio - Titan Engine (Ant Design)
 */

'use client';

import React from 'react';
import { Radio as AntRadio } from 'antd';
import type { RadioChangeEvent } from 'antd';
import type { RadioProps, RadioGroupProps } from '../../types';
import { RADIO_DEFAULTS, RADIO_GROUP_DEFAULTS, SIZE_MAP_NUMERIC, COLOR_MAP } from '../../types';

export default function TitanRadio(props: RadioProps): React.ReactElement {
  const {
    size = RADIO_DEFAULTS.size,
    color = RADIO_DEFAULTS.color,
    label,
    value,
    checked,
    defaultChecked,
    disabled = RADIO_DEFAULTS.disabled,
    onChange,
    children,
    className = '',
    style,
  } = props;

  const colors = COLOR_MAP[color] || COLOR_MAP.primary;
  const sizeNumeric = SIZE_MAP_NUMERIC[size] || SIZE_MAP_NUMERIC.md;

  // Custom styles based on size and color
  const customStyle: React.CSSProperties = {
    '--ant-primary-color': colors.bg,
    fontSize: sizeNumeric * 0.9,
    ...style,
  } as React.CSSProperties;

  const displayLabel = label || children;

  // Adapter for Ant Design's onChange
  const handleChange = (e: RadioChangeEvent) => {
    if (onChange) {
      // Create a synthetic ChangeEvent from RadioChangeEvent
      const syntheticEvent = e as unknown as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    }
  };

  return (
    <AntRadio
      value={value}
      checked={checked}
      defaultChecked={defaultChecked}
      disabled={disabled}
      onChange={handleChange}
      className={`rottay-radio-titan rottay-radio--${size} ${className}`}
      style={customStyle}
    >
      {displayLabel}
    </AntRadio>
  );
}

// Radio Group component
export function TitanRadioGroup(props: RadioGroupProps): React.ReactElement {
  const {
    options = [],
    value,
    defaultValue,
    disabled = RADIO_GROUP_DEFAULTS.disabled,
    direction = RADIO_GROUP_DEFAULTS.direction,
    buttonStyle,
    onChange,
    className = '',
    style,
  } = props;

  const handleChange = (e: RadioChangeEvent) => {
    onChange?.(e.target.value);
  };

  const groupStyle: React.CSSProperties = {
    display: buttonStyle ? 'inline-flex' : 'flex',
    flexDirection: direction === 'horizontal' ? 'row' : 'column',
    gap: direction === 'horizontal' ? '16px' : '8px',
    ...style,
  };

  if (buttonStyle) {
    return (
      <AntRadio.Group
        options={options as any}
        value={value}
        defaultValue={defaultValue}
        disabled={disabled}
        onChange={handleChange}
        optionType="button"
        buttonStyle={buttonStyle}
        className={`rottay-radio-group-titan ${className}`}
        style={groupStyle}
      />
    );
  }

  return (
    <AntRadio.Group
      options={options as any}
      value={value}
      defaultValue={defaultValue}
      disabled={disabled}
      onChange={handleChange}
      className={`rottay-radio-group-titan ${className}`}
      style={groupStyle}
    />
  );
}

TitanRadio.displayName = 'TitanRadio';
TitanRadio.Group = TitanRadioGroup;
