'use client';

/**
 * @fileoverview Switch Modern Engine - Rottay Design System
 * @description DaisyUI/Tailwind CSS implementation of the Switch component.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * The Modern engine implements switches using DaisyUI's toggle classes
 * with Tailwind CSS utilities. It provides a lightweight alternative
 * with utility-first styling.
 *
 * **DaisyUI Classes Used:**
 * - `toggle` - Base toggle styling
 * - `toggle-primary` - Primary color variant
 * - `toggle-{size}` - Size variants (sm, md, lg)
 * - `loading loading-spinner` - Loading indicator
 *
 * **Component Structure:**
 * - Label wrapper with flex layout
 * - Native checkbox input with toggle classes
 * - Conditional children labels based on state
 * - Separate loading spinner (not inside toggle)
 *
 * **Size Mapping:**
 * - `small` → `toggle-sm`
 * - `default` → `toggle-md`
 * - `large` → `toggle-lg`
 *
 * @example Using Modern Engine
 * ```tsx
 * import { Switch } from '@rottay/design-system';
 *
 * <Switch
 *   engine="modern"
 *   size="default"
 *   checkedChildren="Yes"
 *   unCheckedChildren="No"
 * />
 * ```
 *
 * @see {@link Switch} for the main component
 * @see {@link ClassicSwitch} for Ant Design implementation
 * @see {@link RusticSwitch} for vanilla implementation
 * @module ModernSwitch
 * @category Inputs
 * @package @rottay/design-system
 */

import React, { useState } from 'react';
import type { SwitchProps } from '../Switch.types';

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

Switch.displayName = 'Switch.Modern';

export default Switch;
