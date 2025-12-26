/**
 * Toggle - Titan Engine (Ant Design)
 */

'use client';

import React, { useState, useCallback, useId } from 'react';
import { Switch as AntSwitch } from 'antd';
import type { ToggleProps } from '../../types';
import { TOGGLE_DEFAULTS, SIZE_MAP as TOGGLE_SIZE_MAP, COLOR_MAP } from '../../types';

// Ant Design size mapping
const ANT_SIZE_MAP = {
  xs: 'small' as const,
  sm: 'small' as const,
  md: 'default' as const,
  lg: 'default' as const,
  xl: 'default' as const,
};

export default function TitanToggle(props: ToggleProps): React.ReactElement {
  const {
    size = TOGGLE_DEFAULTS.size,
    color = TOGGLE_DEFAULTS.color,
    labelPlacement = TOGGLE_DEFAULTS.labelPlacement,
    label,
    checkedLabel,
    uncheckedLabel,
    description,
    checked: controlledChecked,
    defaultChecked = false,
    disabled = TOGGLE_DEFAULTS.disabled,
    loading = TOGGLE_DEFAULTS.loading,
    error = TOGGLE_DEFAULTS.error,
    onChange,
    children,
    className = '',
    style,
    id: providedId,
    value,
    autoFocus,
  } = props;

  const generatedId = useId();
  const inputId = providedId || `toggle-titan-${generatedId}`;

  // Internal state for uncontrolled mode
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isControlled = controlledChecked !== undefined;
  const isChecked = isControlled ? controlledChecked : internalChecked;

  const handleChange = useCallback((checked: boolean) => {
    if (!isControlled) {
      setInternalChecked(checked);
    }
    // Create synthetic change event
    const syntheticEvent = {
      target: { checked, value },
      currentTarget: { checked, value },
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    onChange?.(checked, syntheticEvent);
  }, [isControlled, onChange, value]);

  const sizeValues = TOGGLE_SIZE_MAP[size] || TOGGLE_SIZE_MAP.md;
  const colors = COLOR_MAP[color] || COLOR_MAP.primary;

  const displayLabel = label || children;

  const containerStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'flex-start',
    gap: '8px',
    flexDirection: labelPlacement === 'start' ? 'row-reverse' : 'row',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    ...style,
  };

  // Custom styles based on color
  const switchStyle: React.CSSProperties = {
    backgroundColor: isChecked ? colors.bgChecked : undefined,
    borderColor: error ? 'var(--color-error, #ff4d4f)' : undefined,
  };

  const switchElement = (
    <AntSwitch
      size={ANT_SIZE_MAP[size]}
      checked={isChecked}
      defaultChecked={undefined} // We manage state internally
      disabled={disabled}
      loading={loading}
      checkedChildren={checkedLabel}
      unCheckedChildren={uncheckedLabel}
      onChange={handleChange}
      className={`rottay-toggle-titan rottay-toggle--${size} rottay-toggle--${color} ${error ? 'rottay-toggle--error' : ''}`}
      style={switchStyle}
      id={inputId}
      autoFocus={autoFocus}
    />
  );

  if (displayLabel || description) {
    return (
      <label
        className={`rottay-toggle-titan-wrapper ${className}`}
        style={containerStyle}
        htmlFor={inputId}
      >
        {switchElement}
        <span style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {displayLabel && (
            <span
              style={{
                fontSize: sizeValues.height * 0.6,
                color: error ? 'var(--color-error, #ff4d4f)' : 'inherit',
                userSelect: 'none',
                lineHeight: 1.4,
              }}
            >
              {displayLabel}
            </span>
          )}
          {description && (
            <span
              style={{
                fontSize: sizeValues.height * 0.5,
                color: 'var(--color-text-secondary, #666)',
                userSelect: 'none',
                lineHeight: 1.4,
              }}
            >
              {description}
            </span>
          )}
        </span>
      </label>
    );
  }

  return switchElement;
}

TitanToggle.displayName = 'TitanToggle';
