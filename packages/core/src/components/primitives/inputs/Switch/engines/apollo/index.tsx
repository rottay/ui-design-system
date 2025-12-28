'use client';

/**
 * @fileoverview Switch Apollo Engine - Rottay Design System
 * @description Pure HTML/CSS implementation of the Switch component.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * The Apollo engine provides a zero-dependency switch implementation
 * using pure HTML and inline CSS. It offers maximum customization
 * and works without any CSS framework dependencies.
 *
 * **Pure CSS Features:**
 * - Custom sliding knob animation
 * - Size variants via inline styles
 * - Checked state color transition
 * - Disabled/loading opacity states
 *
 * **Component Structure:**
 * - Label wrapper with flex layout
 * - Hidden checkbox input with role="switch"
 * - Slider track with animated knob
 * - Conditional children labels
 * - Loading indicator emoji fallback
 *
 * **Style Objects:**
 * - `wrapper` - Flex container layout
 * - `switch`, `switchSmall`, `switchLarge` - Size variants
 * - `slider`, `sliderChecked`, `sliderDisabled` - Track states
 * - `knob`, `knobChecked*` - Handle states and transitions
 *
 * **Accessibility:**
 * - Hidden input with role="switch"
 * - aria-checked attribute
 * - Proper label association
 * - Keyboard activation
 *
 * @example Using Apollo Engine
 * ```tsx
 * import { Switch } from '@rottay/design-system';
 *
 * <Switch
 *   engine="apollo"
 *   size="large"
 *   checkedChildren="Enabled"
 *   unCheckedChildren="Disabled"
 * />
 * ```
 *
 * @see {@link Switch} for the main component
 * @see {@link TitanSwitch} for Ant Design implementation
 * @see {@link HermesSwitch} for DaisyUI implementation
 * @module ApolloSwitch
 * @category Inputs
 * @package @rottay/design-system
 */

import React, { useState } from 'react';
import type { SwitchProps } from '../../types';

const styles = {
  wrapper: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
  },
  switch: {
    position: 'relative' as const,
    display: 'inline-block',
    width: '44px',
    height: '22px',
  },
  switchSmall: {
    width: '28px',
    height: '16px',
  },
  switchLarge: {
    width: '56px',
    height: '28px',
  },
  input: {
    opacity: 0,
    width: 0,
    height: 0,
    position: 'absolute' as const,
  },
  slider: {
    position: 'absolute' as const,
    cursor: 'pointer',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ccc',
    transition: '0.3s',
    borderRadius: '22px',
  },
  sliderChecked: {
    backgroundColor: 'var(--primary-color, #1890ff)',
  },
  sliderDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  knob: {
    position: 'absolute' as const,
    height: '18px',
    width: '18px',
    left: '2px',
    bottom: '2px',
    backgroundColor: 'white',
    transition: '0.3s',
    borderRadius: '50%',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  },
  knobSmall: {
    height: '12px',
    width: '12px',
  },
  knobLarge: {
    height: '24px',
    width: '24px',
  },
  knobChecked: {
    transform: 'translateX(22px)',
  },
  knobCheckedSmall: {
    transform: 'translateX(12px)',
  },
  knobCheckedLarge: {
    transform: 'translateX(28px)',
  },
  label: {
    fontSize: '14px',
    userSelect: 'none' as const,
  },
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
      if (disabled || loading) return;
      const newChecked = e.target.checked;
      if (!isControlled) {
        setInternalChecked(newChecked);
      }
      onChange?.(newChecked);
    };

    const handleClick = (e: React.MouseEvent<HTMLLabelElement>) => {
      if (disabled || loading) return;
      onClick?.(isChecked, e as unknown as React.MouseEvent);
    };

    const getSwitchStyle = () => {
      const base = { ...styles.switch };
      if (size === 'small') Object.assign(base, styles.switchSmall);
      if (size === 'large') Object.assign(base, styles.switchLarge);
      return base;
    };

    const getSliderStyle = () => {
      const base = { ...styles.slider };
      if (isChecked) Object.assign(base, styles.sliderChecked);
      if (disabled || loading) Object.assign(base, styles.sliderDisabled);
      return base;
    };

    const getKnobStyle = () => {
      const base = { ...styles.knob };
      if (size === 'small') {
        Object.assign(base, styles.knobSmall);
        if (isChecked) Object.assign(base, styles.knobCheckedSmall);
      } else if (size === 'large') {
        Object.assign(base, styles.knobLarge);
        if (isChecked) Object.assign(base, styles.knobCheckedLarge);
      } else {
        if (isChecked) Object.assign(base, styles.knobChecked);
      }
      return base;
    };

    return (
      <label
        className={className}
        style={{ ...styles.wrapper, ...style }}
        onClick={handleClick}
      >
        {!isChecked && unCheckedChildren && (
          <span style={styles.label}>{unCheckedChildren}</span>
        )}
        <span style={getSwitchStyle()}>
          <input
            ref={ref}
            type="checkbox"
            style={styles.input}
            checked={isChecked}
            disabled={disabled || loading}
            onChange={handleChange}
            autoFocus={autoFocus}
            tabIndex={tabIndex}
            id={id}
            name={name}
            aria-checked={isChecked}
            role="switch"
          />
          <span style={getSliderStyle()}>
            <span style={getKnobStyle()} />
          </span>
        </span>
        {isChecked && checkedChildren && (
          <span style={styles.label}>{checkedChildren}</span>
        )}
        {loading && (
          <span style={{ marginLeft: '4px' }}>⏳</span>
        )}
      </label>
    );
  }
);

Switch.displayName = 'Switch.Apollo';

export default Switch;
