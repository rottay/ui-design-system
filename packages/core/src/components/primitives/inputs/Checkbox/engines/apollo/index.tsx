/**
 * Checkbox - Apollo Engine (Vanilla HTML/CSS)
 */

import React from 'react';
import type { CheckboxProps, CheckboxGroupProps } from '../types';
import { CHECKBOX_DEFAULTS, CHECKBOX_GROUP_DEFAULTS } from '../types';

const SIZE_MAP = {
  sm: 'rottay-checkbox--sm',
  md: 'rottay-checkbox--md',
  lg: 'rottay-checkbox--lg',
};

const VARIANT_MAP = {
  default: 'rottay-checkbox--default',
  outlined: 'rottay-checkbox--outlined',
  filled: 'rottay-checkbox--filled',
};

export default function ApolloCheckbox(props: CheckboxProps): React.ReactElement {
  const {
    size = CHECKBOX_DEFAULTS.size,
    variant = CHECKBOX_DEFAULTS.variant,
    checked,
    defaultChecked = CHECKBOX_DEFAULTS.defaultChecked,
    indeterminate = CHECKBOX_DEFAULTS.indeterminate,
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

  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate || false;
    }
  }, [indeterminate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.checked, e);
    }
  };

  const classes = [
    'rottay-checkbox',
    SIZE_MAP[size!],
    VARIANT_MAP[variant!],
    error && 'rottay-checkbox--error',
    disabled && 'rottay-checkbox--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const cssVars = {
    '--checkbox-size': `var(--checkbox-${size}-size)`,
  } as React.CSSProperties;

  if (label) {
    return (
      <label className="rottay-checkbox-wrapper" style={{ ...cssVars, ...style }}>
        <input
          ref={inputRef}
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
        <span className="rottay-checkbox-label">{label}</span>
      </label>
    );
  }

  return (
    <input
      ref={inputRef}
      type="checkbox"
      className={classes}
      checked={checked}
      defaultChecked={defaultChecked}
      disabled={disabled}
      onChange={handleChange}
      style={{ ...cssVars, ...style }}
      name={name}
      id={id}
      value={value}
      autoFocus={autoFocus}
      {...rest}
    />
  );
}

// Checkbox Group component
export function ApolloCheckboxGroup(props: CheckboxGroupProps): React.ReactElement {
  const {
    size = CHECKBOX_GROUP_DEFAULTS.size,
    variant,
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
    <div className={`rottay-checkbox-group ${className || ''}`} style={style} {...rest}>
      {options.map((option) => (
        <ApolloCheckbox
          key={String(option.value)}
          size={size}
          variant={variant}
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

ApolloCheckbox.Group = ApolloCheckboxGroup;
