/**
 * @fileoverview Input Classic Engine - Rottay Design System
 * @description Ant Design implementation of the Input component.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * The Classic engine wraps Ant Design's Input component, providing enterprise-grade
 * features including rich validation states, character counting, and various
 * input types. It maps Rottay's standardized props to Ant Design's API.
 *
 * **Ant Design Features Utilized:**
 * - Native validation states (error, warning)
 * - Built-in clear button with allowClear
 * - Character count display with showCount
 * - Password input with visibility toggle
 * - Search input with search callback
 * - Size variants (small, middle, large)
 * - Variant options (outlined, filled, borderless)
 *
 * **Prop Mapping:**
 * - `variant="filled"` → `variant="filled"`
 * - `variant="flushed"` → `variant="borderless"` + custom border-bottom
 * - `status="error"` → `status="error"`
 * - `status="warning"` → `status="warning"`
 * - `size="sm"` → `size="small"`
 * - `size="lg"` → `size="large"`
 * - `clearable` → `allowClear`
 *
 * **Special Type Handling:**
 * - `type="number"` → Uses Ant Design's InputNumber component
 * - `type="password"` → Uses Ant Design's Input.Password component
 * - `type="search"` → Uses Ant Design's Input.Search component
 *
 * @example Using Classic Engine
 * ```tsx
 * import { Input } from '@rottay/design-system';
 *
 * // Explicit Classic engine (default)
 * <Input
 *   engine="classic"
 *   placeholder="Enterprise input"
 *   status="warning"
 *   showCount
 *   maxLength={100}
 * />
 *
 * // Password with Ant Design features
 * <Input
 *   engine="classic"
 *   type="password"
 *   placeholder="Enter password"
 * />
 * ```
 *
 * @see {@link Input} for the main component
 * @see {@link ModernInput} for DaisyUI implementation
 * @see {@link RusticInput} for vanilla implementation
 * @module ClassicInput
 * @category Inputs
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef, useState, useCallback, useId } from 'react';
import { Input as AntInput, InputNumber } from 'antd';
import type { InputProps, InputSize } from '../Input.types';
import { INPUT_DEFAULTS, ANT_SIZE_MAP, SIZE_MAP as INPUT_SIZE_MAP } from '../Input.types';
import { isResponsiveValue, generateResponsiveCSS, type ResponsivePropEntry } from '../../../layout/shared/responsive-props';
import type { ResponsiveValue } from '../../../layout/shared/types';

function scalarOrUndefined<T>(value: ResponsiveValue<T> | undefined): T | undefined {
  if (value === undefined || value === null) return undefined;
  if (isResponsiveValue(value)) return undefined;
  return value as T;
}

// Antd Input only supports error/warning status natively. Success is rendered
// through the DS Form.Item layer instead, so we pass undefined.
const STATUS_MAP = {
  default: undefined,
  error: 'error' as const,
  warning: 'warning' as const,
  success: undefined,
};

// DS "flushed" (bottom-border-only) maps to antd "borderless" with a custom
// bottom border applied via style override. "outline" is antd's default so
// we pass undefined to avoid setting an explicit variant.
const VARIANT_MAP = {
  outline: undefined,
  filled: 'filled' as const,
  flushed: 'borderless' as const,
  unstyled: 'borderless' as const,
};

/**
 * Classic (Ant Design) engine for the Input component.
 *
 * Delegates rendering to the appropriate Ant Design sub-component based on the
 * `type` prop (InputNumber, Input.Password, Input.Search, or plain Input).
 * Supports controlled and uncontrolled modes with full prop-mapping from the
 * DS-neutral InputProps to Ant Design's API.
 *
 * @param props - Standardized InputProps from the design system contract.
 * @param ref   - Forwarded ref attached to the underlying Ant Design element.
 * @returns The rendered Ant Design input wrapped in a full-width container.
 */
const ClassicInput = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const {
    size: sizeProp = INPUT_DEFAULTS.size,
    variant = INPUT_DEFAULTS.variant,
    status = INPUT_DEFAULTS.status,
    type = INPUT_DEFAULTS.type,
    placeholder,
    value: controlledValue,
    defaultValue,
    disabled = INPUT_DEFAULTS.disabled,
    readOnly = INPUT_DEFAULTS.readOnly,
    required = INPUT_DEFAULTS.required,
    error = INPUT_DEFAULTS.error,
    errorMessage,
    maxLength,
    prefix,
    suffix,
    clearable = INPUT_DEFAULTS.clearable,
    showCount = INPUT_DEFAULTS.showCount,
    onChange,
    onFocus,
    onBlur,
    onKeyDown,
    onPressEnter,
    // onClear is handled internally by Ant Design's allowClear
    onClear: _onClear,
    className = '',
    style = {},
    name,
    id,
    autoComplete,
    autoFocus,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
  } = props;

  // Responsive size handling
  const reactId = useId();
  const responsiveEntries: ResponsivePropEntry<any>[] = [];
  const sizeIsResponsive = isResponsiveValue(sizeProp);

  if (sizeIsResponsive) {
    responsiveEntries.push({
      cssProperty: 'height',
      value: sizeProp,
      resolve: (v: InputSize) => `${(INPUT_SIZE_MAP[v as keyof typeof INPUT_SIZE_MAP] || INPUT_SIZE_MAP.md).height} !important`,
    } as ResponsivePropEntry<any>);
    responsiveEntries.push({
      cssProperty: 'font-size',
      value: sizeProp,
      resolve: (v: InputSize) => `${(INPUT_SIZE_MAP[v as keyof typeof INPUT_SIZE_MAP] || INPUT_SIZE_MAP.md).fontSize} !important`,
    } as ResponsivePropEntry<any>);
  }

  const needsResponsiveCSS = responsiveEntries.length > 0;
  const elementId = needsResponsiveCSS ? `input-${reactId.replace(/:/g, '')}` : '';
  const responsive = needsResponsiveCSS
    ? generateResponsiveCSS(elementId, responsiveEntries)
    : null;

  const size = scalarOrUndefined(sizeProp) ?? INPUT_DEFAULTS.size;

  // Handle controlled/uncontrolled for number type
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      if (!isControlled) {
        setInternalValue(newValue);
      }
      onChange?.(newValue, e);
    },
    [isControlled, onChange]
  );

  const handleNumberChange = useCallback(
    (newValue: number | string | null) => {
      const stringValue = newValue?.toString() ?? '';
      if (!isControlled) {
        setInternalValue(stringValue);
      }
      // Create synthetic event for number input
      const syntheticEvent = {
        target: { value: stringValue },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange?.(stringValue, syntheticEvent);
    },
    [isControlled, onChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        onPressEnter?.(e);
      }
      onKeyDown?.(e);
    },
    [onKeyDown, onPressEnter]
  );

  // Determine status
  const computedStatus = error ? 'error' : status;
  const hasError = error || status === 'error';

  // Flushed variant custom styles using CSS variables
  const flushedStyles: React.CSSProperties = variant === 'flushed' ? {
    borderRadius: 0,
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: 'none',
    borderBottom: '1px solid var(--ds-input-border)',
  } : {};

  // Props shared by Ant Input variants. InputNumber receives a narrower set to
  // avoid leaking unsupported props like `allowClear` and `showCount` to the DOM.
  const commonProps = {
    id,
    name,
    placeholder,
    disabled,
    readOnly,
    autoComplete,
    autoFocus,
    size: ANT_SIZE_MAP[size],
    status: STATUS_MAP[computedStatus],
    allowClear: clearable ? { clearIcon: undefined } : false,
    prefix,
    suffix,
    maxLength,
    showCount,
    variant: VARIANT_MAP[variant],
    onFocus,
    onBlur,
    onKeyDown: handleKeyDown,
    onPressEnter: onPressEnter as () => void,
    className: `rottay-input rottay-input--classic ${className}`,
    style: {
      ...flushedStyles,
      ...style,
    },
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
    'aria-required': required,
  };

  const numberProps = {
    id,
    name,
    placeholder,
    disabled,
    readOnly,
    autoComplete,
    autoFocus,
    size: ANT_SIZE_MAP[size],
    status: STATUS_MAP[computedStatus],
    prefix,
    maxLength,
    variant: VARIANT_MAP[variant],
    onFocus,
    onBlur,
    onKeyDown: handleKeyDown,
    className: `rottay-input rottay-input--classic ${className}`,
    style: {
      ...flushedStyles,
      ...style,
    },
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
    'aria-required': required,
  };

  const responsiveStyleTag = responsive && responsive.css ? (
    <style dangerouslySetInnerHTML={{ __html: responsive.css }} />
  ) : null;
  const responsiveAttrs = responsive ? responsive.attrs : {};

  // Ant Design's InputNumber is a separate component with a different API,
  // so numeric inputs branch here to avoid prop mismatches (e.g., allowClear
  // is not supported on InputNumber).
  if (type === 'number') {
    return (
      <div style={{ width: '100%' }}>
        {responsiveStyleTag}
        <InputNumber
          {...numberProps}
          ref={ref as any}
          value={currentValue ? parseFloat(currentValue) : undefined}
          defaultValue={defaultValue ? parseFloat(defaultValue) : undefined}
          onChange={handleNumberChange}
          style={{ width: '100%', ...numberProps.style }}
          controls={false}
        />
        {hasError && errorMessage && (
          <span
            style={{
              display: 'block',
              marginTop: '0.25rem',
              fontSize: 'var(--ds-input-helper-font-size)',
              color: 'var(--ds-input-error-color)',
            }}
          >
            {errorMessage}
          </span>
        )}
      </div>
    );
  }

  // Password uses Ant Design's built-in visibility toggle (eye icon).
  if (type === 'password') {
    return (
      <div style={{ width: '100%' }}>
        {responsiveStyleTag}
        <AntInput.Password
          {...commonProps}
          ref={ref as any}
          value={currentValue}
          defaultValue={defaultValue}
          onChange={handleChange}
        />
        {hasError && errorMessage && (
          <span
            style={{
              display: 'block',
              marginTop: '0.25rem',
              fontSize: 'var(--ds-input-helper-font-size)',
              color: 'var(--ds-input-error-color)',
            }}
          >
            {errorMessage}
          </span>
        )}
      </div>
    );
  }

  // Search wraps Ant Design's Input.Search which adds a search icon button.
  // The onSearch callback is bridged to the DS onChange signature.
  if (type === 'search') {
    return (
      <div style={{ width: '100%' }}>
        {responsiveStyleTag}
        <AntInput.Search
          {...commonProps}
          ref={ref as any}
          value={currentValue}
          defaultValue={defaultValue}
          onChange={handleChange}
          onSearch={(value) => {
            const syntheticEvent = {
              target: { value },
            } as React.ChangeEvent<HTMLInputElement>;
            onChange?.(value, syntheticEvent);
          }}
        />
        {hasError && errorMessage && (
          <span
            style={{
              display: 'block',
              marginTop: '0.25rem',
              fontSize: 'var(--ds-input-helper-font-size)',
              color: 'var(--ds-input-error-color)',
            }}
          >
            {errorMessage}
          </span>
        )}
      </div>
    );
  }

  // Default text input (also handles email, tel, url)
  return (
    <div style={{ width: '100%' }}>
      {responsiveStyleTag}
      <AntInput
        {...commonProps}
        ref={ref as any}
        type={type}
        value={currentValue}
        defaultValue={defaultValue}
        onChange={handleChange}
        {...responsiveAttrs}
      />
      {hasError && errorMessage && (
        <span
          style={{
            display: 'block',
            marginTop: '0.25rem',
            fontSize: 'var(--ds-input-helper-font-size)',
            color: 'var(--ds-input-error-color)',
          }}
        >
          {errorMessage}
        </span>
      )}
    </div>
  );
});

ClassicInput.displayName = 'ClassicInput';

export default ClassicInput;
