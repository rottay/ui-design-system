/**
 * @fileoverview Radio Classic Engine - Rottay Design System
 * @description Ant Design implementation of the Radio component.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * The Classic engine wraps Ant Design's Radio component, providing enterprise-grade
 * features including button style groups and consistent styling with Ant ecosystem.
 *
 * **Ant Design Features Utilized:**
 * - Native Radio component
 * - Radio.Group for exclusive selection
 * - optionType="button" for button-style radios
 * - buttonStyle="solid" or "outline" for button appearance
 *
 * **Prop Mapping:**
 * - `color` → Custom CSS variable override for primary color
 * - `size` → Font size adjustment via inline styles
 * - `buttonStyle` → Ant Design optionType="button"
 *
 * **Group Support:**
 * ClassicRadioGroup supports both standard radio circles and button-style
 * segmented controls via the buttonStyle prop.
 *
 * @example Using Classic Engine
 * ```tsx
 * import { Radio } from '@rottay/design-system';
 *
 * // Explicit Classic engine (default)
 * <Radio
 *   engine="classic"
 *   name="option"
 *   value="a"
 *   label="Ant Design Radio"
 * />
 *
 * // Button style group
 * <Radio.Group
 *   engine="classic"
 *   options={options}
 *   buttonStyle="solid"
 * />
 * ```
 *
 * @see {@link Radio} for the main component
 * @see {@link ModernRadio} for DaisyUI implementation
 * @see {@link RusticRadio} for vanilla implementation
 * @module ClassicRadio
 * @category Inputs
 * @package @rottay/design-system
 */

'use client';

import React from 'react';
import { Radio as AntRadio } from 'antd';
import type { RadioChangeEvent } from 'antd';
import type { RadioProps, RadioGroupProps } from '../../types';
import { RADIO_DEFAULTS, RADIO_GROUP_DEFAULTS, SIZE_MAP_NUMERIC, COLOR_MAP } from '../../types';

export default function ClassicRadio(props: RadioProps): React.ReactElement {
  const {
    size = RADIO_DEFAULTS.size,
    color = RADIO_DEFAULTS.color,
    label,
    value,
    checked,
    defaultChecked,
    disabled = RADIO_DEFAULTS.disabled,
    onChange,
    children,
    className = '',
    style,
  } = props;

  const colors = COLOR_MAP[color] || COLOR_MAP.primary;
  const sizeNumeric = SIZE_MAP_NUMERIC[size] || SIZE_MAP_NUMERIC.md;

  // Custom styles based on size and color
  const customStyle: React.CSSProperties = {
    '--ant-primary-color': colors.bg,
    fontSize: sizeNumeric * 0.9,
    ...style,
  } as React.CSSProperties;

  const displayLabel = label || children;

  // Adapter for Ant Design's onChange
  const handleChange = (e: RadioChangeEvent) => {
    if (onChange) {
      // Create a synthetic ChangeEvent from RadioChangeEvent
      const syntheticEvent = e as unknown as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    }
  };

  return (
    <AntRadio
      value={value}
      checked={checked}
      defaultChecked={defaultChecked}
      disabled={disabled}
      onChange={handleChange}
      className={`rottay-radio-classic rottay-radio--${size} ${className}`}
      style={customStyle}
    >
      {displayLabel}
    </AntRadio>
  );
}

// Radio Group component
export function ClassicRadioGroup(props: RadioGroupProps): React.ReactElement {
  const {
    options = [],
    value,
    defaultValue,
    disabled = RADIO_GROUP_DEFAULTS.disabled,
    direction = RADIO_GROUP_DEFAULTS.direction,
    buttonStyle,
    onChange,
    className = '',
    style,
  } = props;

  const handleChange = (e: RadioChangeEvent) => {
    onChange?.(e.target.value);
  };

  const groupStyle: React.CSSProperties = {
    display: buttonStyle ? 'inline-flex' : 'flex',
    flexDirection: direction === 'horizontal' ? 'row' : 'column',
    gap: direction === 'horizontal' ? '16px' : '8px',
    ...style,
  };

  if (buttonStyle) {
    return (
      <AntRadio.Group
        options={options as any}
        value={value}
        defaultValue={defaultValue}
        disabled={disabled}
        onChange={handleChange}
        optionType="button"
        buttonStyle={buttonStyle}
        className={`rottay-radio-group-classic ${className}`}
        style={groupStyle}
      />
    );
  }

  return (
    <AntRadio.Group
      options={options as any}
      value={value}
      defaultValue={defaultValue}
      disabled={disabled}
      onChange={handleChange}
      className={`rottay-radio-group-classic ${className}`}
      style={groupStyle}
    />
  );
}

ClassicRadio.displayName = 'ClassicRadio';
ClassicRadio.Group = ClassicRadioGroup;
