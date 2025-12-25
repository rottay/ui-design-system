/**
 * Toggle - Hermes Engine (DaisyUI/Tailwind)
 */

import React from 'react';
import type { ToggleProps } from '../types';
import { TOGGLE_DEFAULTS } from '../types';

const SIZE_MAP = {
  sm: 'toggle-sm',
  md: 'toggle-md',
  lg: 'toggle-lg',
};

export default function HermesToggle(props: ToggleProps): React.ReactElement {
  const {
    size = TOGGLE_DEFAULTS.size,
    checked,
    defaultChecked,
    disabled,
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
    'toggle',
    SIZE_MAP[size!],
    error && 'toggle-error',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (label) {
    return (
      <label className="label cursor-pointer" style={style}>
        <span className="label-text">{label}</span>
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
