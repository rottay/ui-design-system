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
import type { CheckboxProps } from '../Checkbox.types';
import { CHECKBOX_DEFAULTS, SIZE_MAP_NUMERIC, COLOR_MAP } from '../Checkbox.types';

/**
 * Classic (Ant Design) implementation of the DS Checkbox.
 *
 * Wraps `antd/Checkbox`, mapping the DS-standard `onChange(checked, event)` callback
 * to Ant's `onChange(event)` format. Color and size overrides are applied via inline
 * CSS custom properties so tenant themes propagate into the Ant component.
 *
 * @param props - Standardized CheckboxProps from the DS type contract.
 * @returns An Ant Design Checkbox with DS class-name hooks for external styling.
 */
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

  // Ant Design's onChange provides the full event object; the DS contract
  // expects `(checked: boolean, event)` so we extract `target.checked` first.
  const handleChange = (e: any) => {
    onChange?.(e.target.checked, e);
  };

  // Override Ant's internal primary color via CSS custom property so the
  // checkbox indicator respects the DS color prop. Font size scales
  // proportionally with the numeric size to keep the label readable.
  const customStyle: React.CSSProperties = {
    '--ant-primary-color': colors.bg,
    fontSize: sizeNumeric * 0.9,
    ...style,
  } as React.CSSProperties;

  // `label` takes precedence over `children` for backward compatibility
  // with both prop-based and JSX-children patterns.
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
