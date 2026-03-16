/**
 * @fileoverview Classic engine for Toggle, wrapping Ant Design's `Switch` component.
 * Supports loading states, inner checked/unchecked labels, and color variants through
 * inline style overrides on top of AntSwitch's built-in behaviour.
 *
 * @example
 * ```tsx
 * <Toggle engine="classic" loading={isSaving} label="Auto-save" color="success" />
 * ```
 *
 * @module ClassicToggle
 * @category Inputs
 * @package @rottay/design-system
 */

'use client';

import React, { useState, useCallback, useId } from 'react';
import { Switch as AntSwitch } from 'antd';
import type { ToggleProps } from '../Toggle.types';
import { TOGGLE_DEFAULTS, SIZE_VALUES as TOGGLE_SIZE_VALUES, COLOR_MAP } from '../Toggle.types';

/**
 * Ant Design only supports 'small' and 'default' switch sizes,
 * so xs/sm both map to 'small' and md/lg/xl all map to 'default'.
 */
const ANT_SIZE_MAP = {
  xs: 'small' as const,
  sm: 'small' as const,
  md: 'default' as const,
  lg: 'default' as const,
  xl: 'default' as const,
};

/**
 * Classic (Ant Design) implementation of Toggle.
 *
 * Manages controlled/uncontrolled state internally and wraps `AntSwitch` with
 * an optional label+description layout. A synthetic `ChangeEvent` is fabricated
 * on toggle so consumers get a consistent `(checked, event)` signature across engines.
 *
 * @param props - Standard ToggleProps shared across all engines.
 * @returns An AntSwitch element, optionally wrapped in a label with description text.
 */
export default function ClassicToggle(props: ToggleProps): React.ReactElement {
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
  const inputId = providedId || `toggle-classic-${generatedId}`;

  // Dual-mode state: when controlledChecked is provided the component is controlled,
  // otherwise internalChecked serves as the source of truth.
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isControlled = controlledChecked !== undefined;
  const isChecked = isControlled ? controlledChecked : internalChecked;

  const handleChange = useCallback((checked: boolean) => {
    if (!isControlled) {
      setInternalChecked(checked);
    }
    // AntSwitch only provides a boolean; fabricate a synthetic event so the
    // DS onChange signature (checked, event) stays consistent across engines.
    const syntheticEvent = {
      target: { checked, value },
      currentTarget: { checked, value },
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    onChange?.(checked, syntheticEvent);
  }, [isControlled, onChange, value]);

  const sizeValues = TOGGLE_SIZE_VALUES[size] || TOGGLE_SIZE_VALUES.md;
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

  // Override AntSwitch's default blue with the selected color variant
  const switchStyle: React.CSSProperties = {
    backgroundColor: isChecked ? colors.bgChecked : undefined,
    borderColor: error ? 'var(--ds-color-error, #ff4d4f)' : undefined,
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
      className={`rottay-toggle-classic rottay-toggle--${size} rottay-toggle--${color} ${error ? 'rottay-toggle--error' : ''}`}
      style={switchStyle}
      id={inputId}
      autoFocus={autoFocus}
    />
  );

  // When label or description is present, wrap switch + text in a <label> for click-to-toggle
  if (displayLabel || description) {
    return (
      <label
        className={`rottay-toggle-classic-wrapper ${className}`}
        style={containerStyle}
        htmlFor={inputId}
      >
        {switchElement}
        <span style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {displayLabel && (
            <span
              style={{
                fontSize: sizeValues.height * 0.6,
                color: error ? 'var(--ds-color-error, #ff4d4f)' : 'inherit',
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
                color: 'var(--ds-color-text-secondary, #666)',
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

ClassicToggle.displayName = 'ClassicToggle';
