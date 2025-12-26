/**
 * Checkbox - Titan Engine (Ant Design)
 */

'use client';

import React from 'react';
import { Checkbox as AntCheckbox } from 'antd';
import type { CheckboxProps, CheckboxGroupProps } from '../../types';
import { CHECKBOX_DEFAULTS, CHECKBOX_GROUP_DEFAULTS, SIZE_MAP, COLOR_MAP } from '../../types';

export default function TitanCheckbox(props: CheckboxProps): React.ReactElement {
  const {
    size = CHECKBOX_DEFAULTS.size,
    color = CHECKBOX_DEFAULTS.color,
    label,
    checked,
    defaultChecked = CHECKBOX_DEFAULTS.defaultChecked,
    indeterminate = CHECKBOX_DEFAULTS.indeterminate,
    disabled = CHECKBOX_DEFAULTS.disabled,
    onChange,
    children,
    name,
    value,
    className = '',
    style,
  } = props;

  const colors = COLOR_MAP[color] || COLOR_MAP.primary;
  const sizeValue = SIZE_MAP[size] || SIZE_MAP.md;

  const handleChange = (e: any) => {
    onChange?.(e.target.checked, e);
  };

  // Custom styles based on size and color
  const customStyle: React.CSSProperties = {
    '--ant-primary-color': colors.bg,
    fontSize: sizeValue * 0.9,
    ...style,
  } as React.CSSProperties;

  const displayLabel = label || children;

  return (
    <AntCheckbox
      checked={checked}
      defaultChecked={defaultChecked}
      indeterminate={indeterminate}
      disabled={disabled}
      onChange={handleChange}
      name={name}
      value={value}
      className={`rottay-checkbox-titan rottay-checkbox--${size} ${className}`}
      style={customStyle}
    >
      {displayLabel}
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
    direction = CHECKBOX_GROUP_DEFAULTS.direction,
    onChange,
    className = '',
    style,
  } = props;

  const handleChange = (checkedValues: any[]) => {
    onChange?.(checkedValues);
  };

  const groupStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: direction === 'horizontal' ? 'row' : 'column',
    gap: direction === 'horizontal' ? '16px' : '8px',
    ...style,
  };

  return (
    <AntCheckbox.Group
      options={options as any}
      value={value}
      defaultValue={defaultValue}
      disabled={disabled}
      onChange={handleChange}
      className={`rottay-checkbox-group-titan ${className}`}
      style={groupStyle}
    />
  );
}

TitanCheckbox.displayName = 'TitanCheckbox';
TitanCheckbox.Group = TitanCheckboxGroup;
