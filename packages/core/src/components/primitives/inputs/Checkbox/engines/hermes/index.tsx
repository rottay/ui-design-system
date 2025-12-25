/**
 * Checkbox - Hermes Engine (DaisyUI/Tailwind)
 */

import React from 'react';
import type { CheckboxProps, CheckboxGroupProps } from '../types';
import { CHECKBOX_DEFAULTS, CHECKBOX_GROUP_DEFAULTS } from '../types';

const SIZE_MAP = {
  sm: 'checkbox-sm',
  md: 'checkbox-md',
  lg: 'checkbox-lg',
};

export default function HermesCheckbox(props: CheckboxProps): React.ReactElement {
  const {
    size = CHECKBOX_DEFAULTS.size,
    checked,
    defaultChecked = CHECKBOX_DEFAULTS.defaultChecked,
    disabled = CHECKBOX_DEFAULTS.disabled,
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.checked, e);
    }
  };

  const classes = [
    'checkbox',
    SIZE_MAP[size!],
    error && 'checkbox-error',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (label) {
    return (
      <label className="label cursor-pointer justify-start gap-2" style={style}>
        <input
          type="checkbox"
          className={classes}
          checked={checked}
          defaultChecked={defaultChecked}
          disabled={disabled}
          onChange={handleChange}
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
      type="checkbox"
      className={classes}
      checked={checked}
      defaultChecked={defaultChecked}
      disabled={disabled}
      onChange={handleChange}
      style={style}
      name={name}
      id={id}
      value={value}
      autoFocus={autoFocus}
      {...rest}
    />
  );
}

// Checkbox Group component
export function HermesCheckboxGroup(props: CheckboxGroupProps): React.ReactElement {
  const {
    size = CHECKBOX_GROUP_DEFAULTS.size,
    options = [],
    value = [],
    defaultValue,
    disabled = CHECKBOX_GROUP_DEFAULTS.disabled,
    onChange,
    className,
    style,
    name,
    ...rest
  } = props;

  const [internalValue, setInternalValue] = React.useState<(string | number)[]>(
    value || defaultValue || []
  );

  const currentValue = value !== undefined ? value : internalValue;

  const handleChange = (optionValue: string | number, checked: boolean) => {
    let newValue: (string | number)[];
    if (checked) {
      newValue = [...currentValue, optionValue];
    } else {
      newValue = currentValue.filter((v) => v !== optionValue);
    }

    if (value === undefined) {
      setInternalValue(newValue);
    }

    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${className || ''}`} style={style} {...rest}>
      {options.map((option) => (
        <HermesCheckbox
          key={String(option.value)}
          size={size}
          label={option.label}
          checked={currentValue.includes(option.value)}
          disabled={disabled || option.disabled}
          onChange={(checked) => handleChange(option.value, checked)}
          name={name}
          value={option.value}
        />
      ))}
    </div>
  );
}

HermesCheckbox.Group = HermesCheckboxGroup;
