/**
 * @fileoverview Checkbox Classic Engine - Rottay Design System
 * @description Ant Design implementation of the Checkbox component.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * The Classic engine wraps Ant Design's Checkbox component, providing enterprise-grade
 * features including indeterminate state, group support, and consistent styling.
 *
 * **Ant Design Features Utilized:**
 * - Native checkbox with indeterminate support
 * - Built-in Checkbox.Group component
 * - Consistent styling with Ant Design ecosystem
 *
 * **Prop Mapping:**
 * - `color` → Custom CSS variable override for primary color
 * - `size` → Font size adjustment via inline styles
 * - `onChange` → Mapped to Ant Design's change handler format
 *
 * **Group Support:**
 * Includes ClassicCheckboxGroup for options-based checkbox groups
 * with horizontal/vertical layout support.
 *
 * @example Using Classic Engine
 * ```tsx
 * import { Checkbox } from '@rottay/design-system';
 *
 * // Explicit Classic engine (default)
 * <Checkbox
 *   engine="classic"
 *   label="Ant Design Checkbox"
 *   indeterminate={hasPartial}
 * />
 *
 * // Group with Classic
 * <Checkbox.Group
 *   engine="classic"
 *   options={options}
 *   direction="horizontal"
 * />
 * ```
 *
 * @see {@link Checkbox} for the main component
 * @see {@link ModernCheckbox} for DaisyUI implementation
 * @see {@link RusticCheckbox} for vanilla implementation
 * @module ClassicCheckbox
 * @category Inputs
 * @package @rottay/design-system
 */

'use client';

import React from 'react';
import { Checkbox as AntCheckbox } from 'antd';
import type { CheckboxProps } from '../../types';
import { CHECKBOX_DEFAULTS, SIZE_MAP_NUMERIC, COLOR_MAP } from '../../types';

export default function ClassicCheckbox(props: CheckboxProps): React.ReactElement {
  const {
    size = CHECKBOX_DEFAULTS.size,
    color = CHECKBOX_DEFAULTS.color,
    label,
    checked,
    defaultChecked = CHECKBOX_DEFAULTS.defaultChecked,
    indeterminate = CHECKBOX_DEFAULTS.indeterminate,
    disabled = CHECKBOX_DEFAULTS.disabled,
    onChange,
    children,
    name,
    value,
    className = '',
    style,
  } = props;

  const colors = COLOR_MAP[color] || COLOR_MAP.primary;
  const sizeNumeric = SIZE_MAP_NUMERIC[size] || SIZE_MAP_NUMERIC.md;

  const handleChange = (e: any) => {
    onChange?.(e.target.checked, e);
  };

  // Custom styles based on size and color
  const customStyle: React.CSSProperties = {
    '--ant-primary-color': colors.bg,
    fontSize: sizeNumeric * 0.9,
    ...style,
  } as React.CSSProperties;

  const displayLabel = label || children;

  return (
    <AntCheckbox
      checked={checked}
      defaultChecked={defaultChecked}
      indeterminate={indeterminate}
      disabled={disabled}
      onChange={handleChange}
      name={name}
      value={value}
      className={`rottay-checkbox-classic rottay-checkbox--${size} ${className}`}
      style={customStyle}
    >
      {displayLabel}
    </AntCheckbox>
  );
}

ClassicCheckbox.displayName = 'ClassicCheckbox';
