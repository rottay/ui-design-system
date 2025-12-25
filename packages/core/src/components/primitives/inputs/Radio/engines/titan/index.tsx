/**
 * Radio - Titan Engine (Ant Design)
 */

import React from 'react';
import { Radio as AntRadio } from 'antd';
import type { RadioProps, RadioGroupProps } from '../types';
import { RADIO_DEFAULTS, RADIO_GROUP_DEFAULTS } from '../types';

export default function TitanRadio(props: RadioProps): React.ReactElement {
  const {
    checked,
    defaultChecked = RADIO_DEFAULTS.defaultChecked,
    disabled = RADIO_DEFAULTS.disabled,
    label,
    onChange,
    className,
    style,
    name,
    id,
    value,
    autoFocus,
    ...rest
  } = props;

  const handleChange = (e: any) => {
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <AntRadio
      checked={checked}
      defaultChecked={defaultChecked}
      disabled={disabled}
      onChange={handleChange}
      className={className}
      style={style}
      name={name}
      id={id}
      value={value}
      autoFocus={autoFocus}
      {...rest}
    >
      {label}
    </AntRadio>
  );
}

// Radio Group component
export function TitanRadioGroup(props: RadioGroupProps): React.ReactElement {
  const {
    size,
    options = [],
    value,
    defaultValue,
    disabled = RADIO_GROUP_DEFAULTS.disabled,
    direction = RADIO_GROUP_DEFAULTS.direction,
    onChange,
    className,
    style,
    name,
    ...rest
  } = props;

  const handleChange = (e: any) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <AntRadio.Group
      options={options as any}
      value={value}
      defaultValue={defaultValue}
      disabled={disabled}
      onChange={handleChange}
      className={className}
      style={style}
      size={size as any}
      optionType={direction === 'horizontal' ? 'button' : undefined}
      {...rest}
    />
  );
}

TitanRadio.Group = TitanRadioGroup;
