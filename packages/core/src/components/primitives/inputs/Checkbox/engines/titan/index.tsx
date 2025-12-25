/**
 * Checkbox - Titan Engine (Ant Design)
 */

import React from 'react';
import { Checkbox as AntCheckbox } from 'antd';
import type { CheckboxProps, CheckboxGroupProps } from '../types';
import { CHECKBOX_DEFAULTS, CHECKBOX_GROUP_DEFAULTS } from '../types';

export default function TitanCheckbox(props: CheckboxProps): React.ReactElement {
  const {
    checked,
    defaultChecked = CHECKBOX_DEFAULTS.defaultChecked,
    indeterminate = CHECKBOX_DEFAULTS.indeterminate,
    disabled = CHECKBOX_DEFAULTS.disabled,
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
      onChange(e.target.checked, e);
    }
  };

  return (
    <AntCheckbox
      checked={checked}
      defaultChecked={defaultChecked}
      indeterminate={indeterminate}
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
    </AntCheckbox>
  );
}

// Checkbox Group component
export function TitanCheckboxGroup(props: CheckboxGroupProps): React.ReactElement {
  const {
    options = [],
    value,
    defaultValue,
    disabled = CHECKBOX_GROUP_DEFAULTS.disabled,
    onChange,
    className,
    style,
    name,
    ...rest
  } = props;

  const handleChange = (checkedValues: any[]) => {
    if (onChange) {
      onChange(checkedValues);
    }
  };

  return (
    <AntCheckbox.Group
      options={options as any}
      value={value}
      defaultValue={defaultValue}
      disabled={disabled}
      onChange={handleChange}
      className={className}
      style={style}
      {...rest}
    />
  );
}

TitanCheckbox.Group = TitanCheckboxGroup;
