'use client';

/**
 * Switch - Hermes Engine (DaisyUI/Tailwind)
 */
import React, { useState } from 'react';
import type { SwitchProps } from '../../types';

const sizeClasses = {
  small: 'toggle-sm',
  default: 'toggle-md',
  large: 'toggle-lg',
};

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  (props, ref) => {
    const {
      checked,
      defaultChecked = false,
      disabled = false,
      loading = false,
      size = 'default',
      checkedChildren,
      unCheckedChildren,
      onChange,
      onClick,
      className = '',
      style,
      autoFocus,
      tabIndex,
      id,
      name,
    } = props;

    const isControlled = checked !== undefined;
    const [internalChecked, setInternalChecked] = useState(defaultChecked);
    const isChecked = isControlled ? checked : internalChecked;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newChecked = e.target.checked;
      if (!isControlled) {
        setInternalChecked(newChecked);
      }
      onChange?.(newChecked);
    };

    const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
      onClick?.(isChecked, e as unknown as React.MouseEvent);
    };

    const sizeClass = sizeClasses[size === 'large' ? 'large' : size === 'small' ? 'small' : 'default'];

    return (
      <label className="inline-flex items-center gap-2 cursor-pointer" style={style}>
        {!isChecked && unCheckedChildren && (
          <span className="text-sm">{unCheckedChildren}</span>
        )}
        <input
          ref={ref}
          type="checkbox"
          className={`toggle toggle-primary ${sizeClass} ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
          checked={isChecked}
          disabled={disabled || loading}
          onChange={handleChange}
          onClick={handleClick}
          autoFocus={autoFocus}
          tabIndex={tabIndex}
          id={id}
          name={name}
        />
        {isChecked && checkedChildren && (
          <span className="text-sm">{checkedChildren}</span>
        )}
        {loading && (
          <span className="loading loading-spinner loading-xs ml-1" />
        )}
      </label>
    );
  }
);

Switch.displayName = 'Switch.Hermes';

export default Switch;
