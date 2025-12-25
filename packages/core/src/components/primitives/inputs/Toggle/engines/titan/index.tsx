/**
 * Toggle - Titan Engine (Ant Design)
 */

import React from 'react';
import { Switch as AntSwitch } from 'antd';
import type { ToggleProps } from '../types';
import { TOGGLE_DEFAULTS } from '../types';

const SIZE_MAP = {
  sm: 'small' as const,
  md: 'default' as const,
  lg: 'default' as const, // Ant Design doesn't have large size for Switch
};

export default function TitanToggle(props: ToggleProps): React.ReactElement {
  const {
    size = TOGGLE_DEFAULTS.size,
    checked,
    defaultChecked,
    disabled,
    loading,
    checkedLabel,
    uncheckedLabel,
    onChange,
    className,
    style,
    name,
    id,
    value,
    autoFocus,
    ...rest
  } = props;

  const handleChange = (checked: boolean, event: any) => {
    if (onChange) {
      onChange(checked, event);
    }
  };

  return (
    <AntSwitch
      size={SIZE_MAP[size!]}
      checked={checked}
      defaultChecked={defaultChecked}
      disabled={disabled}
      loading={loading}
      checkedChildren={checkedLabel}
      unCheckedChildren={uncheckedLabel}
      onChange={handleChange}
      className={className}
      style={style}
      id={id}
      autoFocus={autoFocus}
      {...rest}
    />
  );
}
