/**
 * Toggle - Apollo Engine (Vanilla HTML/CSS)
 */

import React from 'react';
import type { ToggleProps } from '../types';
import { TOGGLE_DEFAULTS } from '../types';

const SIZE_MAP = {
  sm: 'rottay-toggle--sm',
  md: 'rottay-toggle--md',
  lg: 'rottay-toggle--lg',
};

export default function ApolloToggle(props: ToggleProps): React.ReactElement {
  const {
    size = TOGGLE_DEFAULTS.size,
    checked,
    defaultChecked,
    disabled,
    loading,
    label,
    checkedLabel,
    uncheckedLabel,
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
    'rottay-toggle',
    SIZE_MAP[size!],
    error && 'rottay-toggle--error',
    disabled && 'rottay-toggle--disabled',
    loading && 'rottay-toggle--loading',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const toggle = (
    <label className="rottay-toggle-wrapper" style={style}>
      <input
        type="checkbox"
        className={classes}
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled || loading}
        onChange={handleChange}
        name={name}
        id={id}
        value={value}
        autoFocus={autoFocus}
        {...rest}
      />
      <span className="rottay-toggle-slider">
        {checkedLabel && <span className="rottay-toggle-label-on">{checkedLabel}</span>}
        {uncheckedLabel && <span className="rottay-toggle-label-off">{uncheckedLabel}</span>}
      </span>
      {label && <span className="rottay-toggle-label">{label}</span>}
    </label>
  );

  return toggle;
}
