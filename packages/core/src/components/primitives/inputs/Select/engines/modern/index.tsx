/**
 * @fileoverview Select Modern Engine - Rottay Design System
 * @description DaisyUI/Tailwind CSS implementation of the Select component.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * The Modern engine implements select using DaisyUI's utility-first approach
 * with Tailwind CSS classes. It provides both native select for simple cases
 * and custom dropdown for advanced features (search, multiple selection).
 *
 * **DaisyUI Features Utilized:**
 * - Native select classes (select, select-bordered)
 * - Size modifiers (select-xs, select-sm, select-md, select-lg)
 * - Status classes (select-error, select-warning, select-success)
 * - Menu component for dropdown
 * - Badge component for selected tags
 * - Loading spinner component
 * - Checkbox component for multiple selection
 *
 * **Prop Mapping:**
 * - `variant="outline"` → `select-bordered`
 * - `variant="filled"` → `bg-base-200`
 * - `variant="flushed"` → Custom border-bottom only styling
 * - `status="error"` → `select-error`
 * - `status="warning"` → `select-warning`
 * - `status="success"` → `select-success`
 * - `size="xs"` → `select-xs`
 *
 * **Behavior:**
 * - Simple select (non-searchable, non-multiple): Uses native `<select>`
 * - Advanced select (searchable or multiple): Uses custom dropdown with menu
 *
 * @example Using Modern Engine
 * ```tsx
 * import { Select } from '@rottay/design-system';
 *
 * // Explicit Modern engine with native select
 * <Select
 *   engine="modern"
 *   options={options}
 *   placeholder="Select option..."
 * />
 *
 * // With DaisyUI custom dropdown
 * <Select
 *   engine="modern"
 *   options={options}
 *   searchable
 *   multiple
 *   className="w-full"
 * />
 * ```
 *
 * @see {@link Select} for the main component
 * @see {@link ClassicSelect} for Ant Design implementation
 * @see {@link RusticSelect} for vanilla implementation
 * @module ModernSelect
 * @category Inputs
 * @package @rottay/design-system
 */

'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type { SelectProps, SelectOption } from '../../types';
import { SELECT_DEFAULTS } from '../../types';
import { useTranslation } from '../../../../../../theme/i18n';

/**
 * Utility to get label text from option
 */
function getLabelText(label: React.ReactNode): string {
  if (typeof label === 'string') return label;
  if (typeof label === 'number') return String(label);
  return '';
}

// DaisyUI size classes
const DAISY_SIZE_MAP = {
  xs: 'select-xs',
  sm: 'select-sm',
  md: 'select-md',
  lg: 'select-lg',
  xl: 'select-lg', // DaisyUI doesn't have xl, use lg
};

// Status to DaisyUI color classes
const DAISY_STATUS_MAP = {
  default: '',
  error: 'select-error',
  warning: 'select-warning',
  success: 'select-success',
};

export default function ModernSelect(props: SelectProps): React.ReactElement {
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

  // State for searchable/multiple select with custom dropdown
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [internalValue, setInternalValue] = useState<(string | number)[]>(() => {
    const initial = value ?? defaultValue;
    if (initial === undefined) return [];
    return Array.isArray(initial) ? initial : [initial];
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync with controlled value
  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(Array.isArray(value) ? value : [value]);
    }
  }, [value]);

  // Default filter function
  const defaultFilter = useCallback((input: string, option?: SelectOption): boolean => {
    if (!option) return false;
    const labelText = getLabelText(option.label);
    return labelText.toLowerCase().includes(input.toLowerCase());
  }, []);

  // Filtered options based on search
  const filteredOptions = useMemo(() => {
    if (!isSearchable || !searchValue) return options;
    const filterFn = filterOption || defaultFilter;
    return options.filter((opt) => filterFn(searchValue, opt));
  }, [options, searchValue, isSearchable, filterOption, defaultFilter]);

  // Get selected options
  const selectedOptions = useMemo(() => {
    return options.filter((opt) => internalValue.includes(opt.value));
  }, [options, internalValue]);

  // Handle selection
  const handleSelect = useCallback((optionValue: string | number, option: SelectOption) => {
    if (option.disabled) return;

    let newValue: (string | number)[];
    if (multiple) {
      if (internalValue.includes(optionValue)) {
        newValue = internalValue.filter((v) => v !== optionValue);
      } else {
        newValue = [...internalValue, optionValue];
      }
    } else {
      newValue = [optionValue];
      setIsOpen(false);
    }

    setInternalValue(newValue);
    setSearchValue('');

    if (onChange) {
      const selectedOpts = options.filter((opt) => newValue.includes(opt.value));
      onChange(
        multiple ? newValue : newValue[0],
        multiple ? selectedOpts : selectedOpts[0]
      );
    }
  }, [multiple, internalValue, onChange, options]);

  // Handle clear
  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setInternalValue([]);
    setSearchValue('');
    onChange?.(multiple ? [] : '', undefined);
    onClear?.();
  }, [multiple, onChange, onClear]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // For simple native select (non-searchable, non-multiple)
  if (!isSearchable && !multiple) {
    const handleNativeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedValue = e.target.value;
      const selectedOption = options.find((o) => String(o.value) === selectedValue);
      setInternalValue([selectedValue]);
      onChange?.(selectedValue, selectedOption);
    };

    // Strip invalid HTML props
    const {
      engine: _engine,
      readOnly: _readOnly,
      filterOption: _filterOption,
      onSearch: _onSearch,
      onClear: _onClear,
      prefix: _prefix,
      suffix: _suffix,
      children: _children,
      maxTagCount: _maxTagCount,
      searchable: _searchable,
      clearable: _clearable,
      allowClear: _allowClear,
      showSearch: _showSearch,
      error: _error,
      loading: _loading,
      ...htmlProps
    } = rest as any;

    const selectClasses = [
      'select',
      variant !== 'flushed' ? 'select-bordered' : '',
      variant === 'filled' ? 'bg-base-200' : '',
      DAISY_SIZE_MAP[size],
      DAISY_STATUS_MAP[effectiveStatus],
      disabled ? 'opacity-50 cursor-not-allowed' : '',
      className,
    ].filter(Boolean).join(' ');

    return (
      <div className="relative w-full" style={style}>
        <select
          className={selectClasses}
          value={internalValue[0] ?? ''}
          disabled={disabled}
          required={rest.required}
          onChange={handleNativeChange}
          onFocus={onFocus as any}
          onBlur={onBlur as any}
          name={name}
          id={id}
          autoFocus={autoFocus}
          style={variant === 'flushed' ? {
            borderRadius: 0,
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
          } : undefined}
          {...htmlProps}
        >
          {displayPlaceholder && (
            <option value="" disabled>
              {displayPlaceholder}
            </option>
          )}
          {options.map((option) => (
            <option key={String(option.value)} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        {loading && (
          <span className="absolute right-8 top-1/2 -translate-y-1/2">
            <span className="loading loading-spinner loading-xs"></span>
          </span>
        )}
      </div>
    );
  }

  // Custom dropdown for searchable/multiple
  const triggerClasses = [
    'select',
    variant !== 'flushed' ? 'select-bordered' : '',
    variant === 'filled' ? 'bg-base-200' : '',
    DAISY_SIZE_MAP[size],
    DAISY_STATUS_MAP[effectiveStatus],
    disabled ? 'opacity-50 cursor-not-allowed' : '',
    'w-full flex items-center justify-between',
  ].filter(Boolean).join(' ');

  // Display value
  const displayValue = useMemo(() => {
    if (selectedOptions.length === 0) return null;

    if (multiple) {
      const visibleTags = maxTagCount !== undefined
        ? selectedOptions.slice(0, maxTagCount)
        : selectedOptions;
      const hiddenCount = selectedOptions.length - visibleTags.length;

      return (
        <div className="flex flex-wrap gap-1">
          {visibleTags.map((opt) => (
            <span key={opt.value} className="badge badge-sm gap-1">
              {opt.label}
              <button
                type="button"
                className="hover:bg-base-300 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(opt.value, opt);
                }}
              >
                x
              </button>
            </span>
          ))}
          {hiddenCount > 0 && (
            <span className="badge badge-sm badge-ghost">+{hiddenCount}</span>
          )}
        </div>
      );
    }

    return <span>{selectedOptions[0].label}</span>;
  }, [selectedOptions, multiple, maxTagCount, handleSelect]);

  return (
    <div ref={containerRef} className="relative w-full" style={style}>
      {/* Trigger */}
      <div
        className={triggerClasses}
        onClick={() => {
          if (!disabled && !loading) {
            setIsOpen(!isOpen);
            if (!isOpen && isSearchable) {
              setTimeout(() => inputRef.current?.focus(), 0);
            }
          }
        }}
        style={variant === 'flushed' ? {
          borderRadius: 0,
          borderTop: 'none',
          borderLeft: 'none',
          borderRight: 'none',
        } : undefined}
      >
        <div className="flex-1 flex items-center gap-2 overflow-hidden">
          {isSearchable && isOpen ? (
            <input
              ref={inputRef}
              type="text"
              className="bg-transparent outline-none flex-1 min-w-0"
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value);
                onSearch?.(e.target.value);
              }}
              placeholder={selectedOptions.length === 0 ? displayPlaceholder : ''}
              onClick={(e) => e.stopPropagation()}
            />
          ) : displayValue || (
            <span className="text-base-content/50">{displayPlaceholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {isClearable && internalValue.length > 0 && !disabled && (
            <button
              type="button"
              className="btn btn-ghost btn-xs btn-circle"
              onClick={handleClear}
            >
              x
            </button>
          )}
          {loading && <span className="loading loading-spinner loading-xs"></span>}
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Hidden input for form submission */}
      {name && (
        <input
          type="hidden"
          name={name}
          value={multiple ? internalValue.join(',') : internalValue[0] || ''}
        />
      )}

      {/* Dropdown */}
      {isOpen && (
        <ul className="menu bg-base-100 rounded-box shadow-lg border border-base-300 absolute top-full left-0 right-0 mt-1 z-50 max-h-60 overflow-y-auto p-2">
          {filteredOptions.length === 0 ? (
            <li className="disabled">
              <span className="text-base-content/50">{noOptionsText}</span>
            </li>
          ) : (
            filteredOptions.map((option) => {
              const isSelected = internalValue.includes(option.value);
              return (
                <li key={option.value}>
                  <a
                    className={`
                      ${isSelected ? 'active' : ''}
                      ${option.disabled ? 'disabled opacity-50' : ''}
                      flex items-center gap-2
                    `}
                    onClick={(e) => {
                      e.preventDefault();
                      if (!option.disabled) {
                        handleSelect(option.value, option);
                      }
                    }}
                  >
                    {multiple && (
                      <input
                        type="checkbox"
                        className="checkbox checkbox-xs"
                        checked={isSelected}
                        readOnly
                      />
                    )}
                    {option.icon && <span>{option.icon}</span>}
                    <span>{option.label}</span>
                  </a>
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}

ModernSelect.displayName = 'ModernSelect';
