/**
 * @fileoverview Select Classic Engine - Rottay Design System
 * @description Ant Design implementation of the Select component.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * The Classic engine wraps Ant Design's Select component, providing enterprise-grade
 * features including rich filtering, async loading, and advanced dropdown behavior.
 * It maps Rottay's standardized props to Ant Design's API.
 *
 * **Ant Design Features Utilized:**
 * - Mode support (default, multiple, tags)
 * - Built-in search with showSearch
 * - allowClear for clearing selection
 * - Loading state with spinner
 * - maxTagCount for limiting visible tags
 * - Custom filterOption function
 * - Size variants (small, middle, large)
 * - Variant options (outlined, filled, borderless)
 * - Status indicators (error, warning)
 *
 * **Prop Mapping:**
 * - `multiple` → `mode="multiple"`
 * - `searchable` → `showSearch`
 * - `clearable` → `allowClear`
 * - `variant="filled"` → `variant="filled"`
 * - `variant="flushed"` → `variant="borderless"`
 * - `status="error"` → `status="error"`
 * - `size="sm"` → `size="small"`
 * - `size="lg"` → `size="large"`
 *
 * **Option Mapping:**
 * Options with icons are transformed to include the icon in the label render.
 *
 * @example Using Classic Engine
 * ```tsx
 * import { Select } from '@rottay/design-system';
 *
 * // Explicit Classic engine (default)
 * <Select
 *   engine="classic"
 *   options={options}
 *   showSearch
 *   allowClear
 *   placeholder="Search and select..."
 * />
 *
 * // Multiple selection with Ant Design features
 * <Select
 *   engine="classic"
 *   mode="multiple"
 *   maxTagCount={3}
 *   loading={isLoading}
 *   onSearch={handleAsyncSearch}
 * />
 * ```
 *
 * @see {@link Select} for the main component
 * @see {@link ModernSelect} for DaisyUI implementation
 * @see {@link RusticSelect} for vanilla implementation
 * @module ClassicSelect
 * @category Inputs
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef } from 'react';
import { Select as AntSelect } from 'antd';
import type { SelectProps, SelectOption } from '../Select.types';
import { SELECT_DEFAULTS, SIZE_MAP } from '../Select.types';
import { useTranslation } from '../../../../../i18n';

/**
 * Utility to get label text from option
 */
function getLabelText(label: React.ReactNode): string {
  if (typeof label === 'string') return label;
  if (typeof label === 'number') return String(label);
  return '';
}

// Antd only supports small/middle/large, so xs collapses to small and xl to large.
// For pixel-precise sizing at xs/xl, use the rustic engine instead.
const ANT_SIZE_MAP = {
  xs: 'small' as const,
  sm: 'small' as const,
  md: 'middle' as const,
  lg: 'large' as const,
  xl: 'large' as const,
};

// DS "flushed" variant maps to antd "borderless" -- same visual (no border,
// only a bottom line on focus) but different naming conventions.
const ANT_VARIANT_MAP: Record<string, 'outlined' | 'filled' | 'borderless'> = {
  outline: 'outlined',
  filled: 'filled',
  flushed: 'borderless',
  default: 'outlined',
};

// Antd Select only supports error/warning status. Success is handled by the
// DS layer (e.g., Form.Item) rather than the input itself, so we pass undefined.
const ANT_STATUS_MAP = {
  default: undefined,
  error: 'error' as const,
  warning: 'warning' as const,
  success: undefined,
};

/**
 * Classic (Ant Design) Select engine.
 *
 * Wraps `antd/Select` behind the Rottay DS prop interface, translating
 * standardized props (size, variant, status, clearable, searchable) into
 * their Ant Design equivalents. Supports single and multi-select modes
 * with built-in search, async loading, and icon-enriched options.
 *
 * @param props - Rottay SelectProps (engine-agnostic interface).
 * @param ref   - Forwarded to the underlying antd Select element.
 * @returns The rendered Ant Design Select with DS styling classes.
 *
 * @example
 * ```tsx
 * <ClassicSelect
 *   options={[{ value: 'a', label: 'Alpha' }]}
 *   searchable
 *   clearable
 *   size="md"
 *   onChange={(val, opt) => console.log(val, opt)}
 * />
 * ```
 */
const ClassicSelect = forwardRef<any, SelectProps>((props, ref) => {
  const { t } = useTranslation('components');

  const {
    value,
    defaultValue,
    options = [],
    placeholder,
    size = SELECT_DEFAULTS.size,
    variant = SELECT_DEFAULTS.variant,
    multiple = SELECT_DEFAULTS.multiple,
    searchable,
    clearable,
    disabled = SELECT_DEFAULTS.disabled,
    loading = SELECT_DEFAULTS.loading,
    error = SELECT_DEFAULTS.error,
    maxTagCount,
    status = SELECT_DEFAULTS.status,
    filterOption,
    onChange,
    onSearch,
    onFocus,
    onBlur,
    onClear,
    className,
    style,
    name,
    id,
    autoFocus,
    // Aliases
    allowClear,
    showSearch,
    ...rest
  } = props;

  // Use translation as default, allow prop override
  const displayPlaceholder = placeholder ?? t('select.placeholder');
  const noOptionsText = t('select.no_options');

  // Resolve aliases
  const isClearable = clearable || allowClear;
  const isSearchable = searchable || showSearch;

  // Determine effective status
  const effectiveStatus = error ? 'error' : status;

  // Antd's onChange gives back its own option shape (with extra internal props).
  // We normalize it to the DS SelectOption interface before calling the consumer.
  const handleChange = (val: any, option: any) => {
    if (onChange) {
      if (Array.isArray(option)) {
        const opts: SelectOption[] = option.map((o: any) => ({
          value: o.value,
          label: getLabelText(o.label),
          disabled: o.disabled,
        }));
        onChange(val, opts);
      } else if (option) {
        const opt: SelectOption = {
          value: option.value,
          label: getLabelText(option.label),
          disabled: option.disabled,
        };
        onChange(val, opt);
      } else {
        onChange(val, undefined);
      }
    }
  };

  // When an option has an icon, we wrap label + icon into a flex container so
  // they render inline within antd's dropdown. Antd only supports ReactNode
  // labels, so this composition happens at the boundary.
  const antOptions = options.map((opt) => ({
    value: opt.value,
    label: opt.icon ? (
      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {opt.icon}
        <span>{opt.label}</span>
      </span>
    ) : opt.label,
    disabled: opt.disabled,
  }));

  // Build size-specific styles for xs and xl
  const sizeConfig = SIZE_MAP[size];
  const customStyle: React.CSSProperties = {
    ...style,
    ...(size === 'xs' && {
      fontSize: `${sizeConfig.fontSize}px`,
    }),
    ...(size === 'xl' && {
      fontSize: `${sizeConfig.fontSize}px`,
    }),
  };

  // Build className with size modifiers
  const selectClassName = [
    'rottay-select',
    `rottay-select--${size}`,
    `rottay-select--${variant}`,
    effectiveStatus !== 'default' ? `rottay-select--${effectiveStatus}` : '',
    className,
  ].filter(Boolean).join(' ');

  // Strip out non-Ant props from rest
  const {
    engine: _engine,
    readOnly: _readOnly,
    required: _required,
    prefix: _prefix,
    suffix: _suffix,
    children: _children,
    ...antProps
  } = rest as any;

  return (
    <AntSelect
      ref={ref}
      value={value}
      defaultValue={defaultValue}
      options={antOptions}
      placeholder={displayPlaceholder}
      notFoundContent={noOptionsText}
      size={ANT_SIZE_MAP[size]}
      variant={ANT_VARIANT_MAP[variant]}
      status={ANT_STATUS_MAP[effectiveStatus]}
      mode={multiple ? 'multiple' : undefined}
      showSearch={isSearchable}
      allowClear={isClearable}
      disabled={disabled}
      loading={loading}
      maxTagCount={maxTagCount}
      filterOption={filterOption as any}
      onChange={handleChange}
      onSearch={onSearch}
      onFocus={onFocus as any}
      onBlur={onBlur as any}
      onClear={onClear}
      className={selectClassName}
      style={customStyle}
      id={id}
      autoFocus={autoFocus}
      {...antProps}
    />
  );
});

ClassicSelect.displayName = 'ClassicSelect';

export default ClassicSelect;
