/**
 * Radio - Hermes Engine (DaisyUI/Tailwind)
 */

import React from 'react';
import type { RadioProps, RadioGroupProps } from '../types';
import { RADIO_DEFAULTS, RADIO_GROUP_DEFAULTS } from '../types';

const SIZE_MAP = {
  sm: 'radio-sm',
  md: 'radio-md',
  lg: 'radio-lg',
};

export default function HermesRadio(props: RadioProps): React.ReactElement {
  const {
    size = RADIO_DEFAULTS.size,
    checked,
    defaultChecked = RADIO_DEFAULTS.defaultChecked,
    disabled = RADIO_DEFAULTS.disabled,
    label,
    error,
    onChange,
    className,
    style,
    name,
    id,
    value,
    autoFocus,
    ...rest
  } = props;

  const classes = [
    'radio',
    SIZE_MAP[size!],
    error && 'radio-error',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (label) {
    return (
      <label className="label cursor-pointer justify-start gap-2" style={style}>
        <input
          type="radio"
          className={classes}
          checked={checked}
          defaultChecked={defaultChecked}
          disabled={disabled}
          onChange={onChange}
          name={name}
          id={id}
          value={value}
          autoFocus={autoFocus}
          {...rest}
        />
        <span className="label-text">{label}</span>
      </label>
    );
  }

  return (
    <input
      type="radio"
      className={classes}
      checked={checked}
      defaultChecked={defaultChecked}
      disabled={disabled}
      onChange={onChange}
      style={style}
      name={name}
      id={id}
      value={value}
      autoFocus={autoFocus}
      {...rest}
    />
  );
}

// Radio Group component
export function HermesRadioGroup(props: RadioGroupProps): React.ReactElement {
  const {
    size = RADIO_GROUP_DEFAULTS.size,
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

  const [internalValue, setInternalValue] = React.useState<string | number | undefined>(
    value || defaultValue
  );

  const currentValue = value !== undefined ? value : internalValue;

  const handleChange = (optionValue: string | number) => {
    if (value === undefined) {
      setInternalValue(optionValue);
    }

    if (onChange) {
      onChange(optionValue);
    }
  };

  const containerClasses = [
    'flex',
    direction === 'horizontal' ? 'flex-row gap-4' : 'flex-col gap-2',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClasses} style={style} {...rest}>
      {options.map((option) => (
        <HermesRadio
          key={String(option.value)}
          size={size}
          label={option.label}
          checked={currentValue === option.value}
          disabled={disabled || option.disabled}
          onChange={() => handleChange(option.value)}
          name={name}
          value={option.value}
        />
      ))}
    </div>
  );
}

HermesRadio.Group = HermesRadioGroup;
