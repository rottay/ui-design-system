/**
 * Hermes Switch Engine
 *
 * DaisyUI toggle implementation with unified SwitchProps.
 */

'use client';

import { useState } from 'react';
import type { SwitchProps } from '../../../../types/components/switch';

// Map unified size to DaisyUI size classes
const sizeClasses = {
  small: 'toggle-xs',
  default: 'toggle-sm',
  large: 'toggle-lg',
};

/**
 * Hermes Switch - DaisyUI implementation with unified SwitchProps
 */
function HermesSwitch({
  checked,
  defaultChecked = false,
  disabled,
  onChange,
  className = '',
  style,
  id,
  name,
  size = 'default',
  loading,
  onClick,
  autoFocus,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
}: SwitchProps) {
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isControlled = checked !== undefined;
  const isChecked = isControlled ? checked : internalChecked;
  const isDisabled = disabled || loading;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isDisabled) return;

    const newChecked = event.target.checked;

    if (!isControlled) {
      setInternalChecked(newChecked);
    }

    onChange?.(newChecked);
  };

  const handleClick = (event: React.MouseEvent<HTMLInputElement>) => {
    if (onClick) {
      const newChecked = !isChecked;
      onClick(newChecked, event);
    }
  };

  const classes = [
    'toggle',
    sizeClasses[size] || sizeClasses.default,
    loading && 'opacity-50',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="relative inline-flex items-center">
      <input
        type="checkbox"
        role="switch"
        checked={isChecked}
        onChange={handleChange}
        onClick={handleClick}
        disabled={isDisabled}
        id={id}
        name={name}
        autoFocus={autoFocus}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        className={classes}
        style={style}
      />
      {loading && (
        <span className="loading loading-spinner loading-xs absolute left-1/2 -translate-x-1/2" />
      )}
    </div>
  );
}

HermesSwitch.displayName = 'HermesSwitch';

export default HermesSwitch;
