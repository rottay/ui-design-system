/**
 * Radio - Apollo Engine (Vanilla HTML/CSS)
 */

import React from 'react';
import type { RadioProps, RadioGroupProps } from '../types';
import { RADIO_DEFAULTS, RADIO_GROUP_DEFAULTS } from '../types';

const SIZE_MAP = {
  sm: 'rottay-radio--sm',
  md: 'rottay-radio--md',
  lg: 'rottay-radio--lg',
};

const VARIANT_MAP = {
  default: 'rottay-radio--default',
  outlined: 'rottay-radio--outlined',
  filled: 'rottay-radio--filled',
};

export default function ApolloRadio(props: RadioProps): React.ReactElement {
  const {
    size = RADIO_DEFAULTS.size,
    variant = RADIO_DEFAULTS.variant,
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
    'rottay-radio',
    SIZE_MAP[size!],
    VARIANT_MAP[variant!],
    error && 'rottay-radio--error',
    disabled && 'rottay-radio--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const cssVars = {
    '--radio-size': `var(--radio-${size}-size)`,
  } as React.CSSProperties;

  if (label) {
    return (
      <label className="rottay-radio-wrapper" style={{ ...cssVars, ...style }}>
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
        <span className="rottay-radio-label">{label}</span>
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
      style={{ ...cssVars, ...style }}
      name={name}
      id={id}
      value={value}
      autoFocus={autoFocus}
      {...rest}
    />
  );
}

// Radio Group component
export function ApolloRadioGroup(props: RadioGroupProps): React.ReactElement {
  const {
    size = RADIO_GROUP_DEFAULTS.size,
    variant,
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
    'rottay-radio-group',
    `rottay-radio-group--${direction}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClasses} style={style} {...rest}>
      {options.map((option) => (
        <ApolloRadio
          key={String(option.value)}
          size={size}
          variant={variant}
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

ApolloRadio.Group = ApolloRadioGroup;
