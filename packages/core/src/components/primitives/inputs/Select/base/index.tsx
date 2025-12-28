/**
 * @fileoverview Select Base Component - Rottay Design System
 * @description Core select implementation using CSS custom properties for styling.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * The BaseSelect component provides a foundational select implementation that
 * relies entirely on CSS custom properties for theming. It includes full
 * keyboard navigation, search functionality, and multiple selection support.
 *
 * **Key Features:**
 * - Pure CSS variable-based theming
 * - Controlled and uncontrolled modes
 * - Single and multiple selection
 * - Search/filter functionality
 * - Keyboard navigation (Arrow keys, Enter, Escape, Home, End)
 * - Clear button support
 * - Loading state indicator
 * - Option icons and descriptions
 * - Max tag count for multiple mode
 * - Form integration with hidden input
 *
 * **CSS Custom Properties Used:**
 * - `--ds-select-height` - Trigger height
 * - `--ds-select-font-size` - Text size
 * - `--ds-select-padding` - Internal padding
 * - `--ds-select-bg` - Background color
 * - `--ds-select-border-color` - Border color (status-aware)
 * - `--ds-select-border-radius` - Corner radius
 * - `--ds-select-dropdown-bg` - Dropdown background
 * - `--ds-select-dropdown-shadow` - Dropdown shadow
 * - `--ds-select-option-hover-bg` - Option hover background
 * - `--ds-select-option-selected-bg` - Selected option background
 * - `--ds-select-transition` - Animation timing
 *
 * **Accessibility:**
 * - ARIA combobox pattern
 * - Role="listbox" for dropdown
 * - Role="option" for each option
 * - aria-selected for selection state
 * - Keyboard navigation support
 *
 * @example Basic Usage
 * ```tsx
 * import { BaseSelect } from './base';
 *
 * const options = [
 *   { value: 'a', label: 'Option A' },
 *   { value: 'b', label: 'Option B' },
 * ];
 *
 * <BaseSelect
 *   options={options}
 *   placeholder="Choose..."
 *   onChange={(value) => console.log(value)}
 * />
 * ```
 *
 * @example With All Features
 * ```tsx
 * import { BaseSelect } from './base';
 *
 * <BaseSelect
 *   options={options}
 *   multiple
 *   searchable
 *   clearable
 *   maxTagCount={3}
 *   placeholder="Select items..."
 *   status="error"
 *   loading={isLoading}
 *   filterOption={(input, opt) => opt?.label.includes(input)}
 *   onChange={(values, opts) => handleChange(values, opts)}
 *   onSearch={(query) => fetchOptions(query)}
 *   onClear={() => reset()}
 * />
 * ```
 *
 * @see {@link Select} for the engine-aware wrapper
 * @see {@link TitanSelect} for Ant Design implementation
 * @see {@link HermesSelect} for DaisyUI implementation
 * @see {@link ApolloSelect} for vanilla implementation
 * @module BaseSelect
 * @category Inputs
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef, useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type { SelectProps, SelectOption } from '../types';
import { SELECT_DEFAULTS, SIZE_MAP } from '../types';

/**
 * Utility to get label text from option
 */
function getLabelText(label: React.ReactNode): string {
  if (typeof label === 'string') return label;
  if (typeof label === 'number') return String(label);
  return '';
}

/**
 * Utility to filter options based on search input
 */
function defaultFilterOption(input: string, option?: SelectOption): boolean {
  if (!option) return false;
  const labelText = getLabelText(option.label);
  return labelText.toLowerCase().includes(input.toLowerCase());
}

/**
 * Base Select component using CSS variables.
 * This is extended by engine-specific implementations.
 */
export const BaseSelect = forwardRef<HTMLDivElement, SelectProps>(
  (props, ref) => {
    const {
      value,
      defaultValue,
      options = [],
      placeholder = 'Select...',
      size = SELECT_DEFAULTS.size,
      variant = SELECT_DEFAULTS.variant,
      multiple = SELECT_DEFAULTS.multiple,
      searchable = SELECT_DEFAULTS.searchable,
      clearable = SELECT_DEFAULTS.clearable,
      disabled = SELECT_DEFAULTS.disabled,
      loading = SELECT_DEFAULTS.loading,
      error = SELECT_DEFAULTS.error,
      maxTagCount,
      status = SELECT_DEFAULTS.status,
      filterOption = defaultFilterOption,
      onChange,
      onSearch,
      onFocus,
      onBlur,
      onClear,
      children: _children,
      className = '',
      style = {},
      name,
      id,
      autoFocus,
      // Aliases
      allowClear,
      showSearch,
    } = props;

    // Resolve aliases
    const isClearable = clearable || allowClear;
    const isSearchable = searchable || showSearch;

    // Internal state
    const [isOpen, setIsOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [internalValue, setInternalValue] = useState<(string | number)[]>(() => {
      const initial = value ?? defaultValue;
      if (initial === undefined) return [];
      return Array.isArray(initial) ? initial : [initial];
    });
    const [focusedIndex, setFocusedIndex] = useState(-1);

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Sync with controlled value
    useEffect(() => {
      if (value !== undefined) {
        setInternalValue(Array.isArray(value) ? value : [value]);
      }
    }, [value]);

    // Filtered options based on search
    const filteredOptions = useMemo(() => {
      if (!isSearchable || !searchValue) return options;
      return options.filter((opt) => filterOption(searchValue, opt));
    }, [options, searchValue, isSearchable, filterOption]);

    // Get selected options
    const selectedOptions = useMemo(() => {
      return options.filter((opt) => internalValue.includes(opt.value));
    }, [options, internalValue]);

    // Determine effective status
    const effectiveStatus = error ? 'error' : status;

    // Build CSS variables
    const sizeConfig = SIZE_MAP[size];
    const selectVars: React.CSSProperties = {
      '--ds-select-height': sizeConfig.height,
      '--ds-select-font-size': sizeConfig.fontSize,
      '--ds-select-padding': sizeConfig.padding,
      '--ds-select-bg': variant === 'filled' ? 'var(--ds-color-gray-100, #f5f5f5)' : 'var(--ds-color-white, #fff)',
      '--ds-select-border-color': effectiveStatus === 'error' ? 'var(--ds-color-error-500, #ff4d4f)' :
                               effectiveStatus === 'warning' ? 'var(--ds-color-warning-500, #faad14)' :
                               effectiveStatus === 'success' ? 'var(--ds-color-success-500, #52c41a)' :
                               'var(--ds-color-border, #d9d9d9)',
      '--ds-select-border-radius': variant === 'flushed' ? '0' : 'var(--ds-radius-md, 6px)',
      '--ds-select-dropdown-bg': 'var(--ds-color-white, #fff)',
      '--ds-select-dropdown-shadow': '0 6px 16px rgba(0, 0, 0, 0.08)',
      '--ds-select-option-hover-bg': 'var(--ds-color-gray-50, #f9fafb)',
      '--ds-select-option-selected-bg': 'var(--ds-color-primary-50, #e6f7ff)',
      '--ds-select-transition': 'all 0.2s ease',
    } as React.CSSProperties;

    // Handlers
    const handleToggle = useCallback(() => {
      if (disabled || loading) return;
      setIsOpen((prev) => !prev);
      if (!isOpen && isSearchable) {
        setTimeout(() => inputRef.current?.focus(), 0);
      }
    }, [disabled, loading, isOpen, isSearchable]);

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

    const handleClear = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      setInternalValue([]);
      setSearchValue('');
      onChange?.(multiple ? [] : '', undefined);
      onClear?.();
    }, [multiple, onChange, onClear]);

    const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setSearchValue(val);
      onSearch?.(val);
    }, [onSearch]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
      if (disabled) return;

      switch (e.key) {
        case 'Enter':
          e.preventDefault();
          if (isOpen && focusedIndex >= 0 && filteredOptions[focusedIndex]) {
            handleSelect(filteredOptions[focusedIndex].value, filteredOptions[focusedIndex]);
          } else {
            setIsOpen(true);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setFocusedIndex(-1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
          } else {
            setFocusedIndex((prev) =>
              prev < filteredOptions.length - 1 ? prev + 1 : 0
            );
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (isOpen) {
            setFocusedIndex((prev) =>
              prev > 0 ? prev - 1 : filteredOptions.length - 1
            );
          }
          break;
        case 'Backspace':
          if (multiple && !searchValue && internalValue.length > 0) {
            const newValue = internalValue.slice(0, -1);
            setInternalValue(newValue);
            const selectedOpts = options.filter((opt) => newValue.includes(opt.value));
            onChange?.(newValue, selectedOpts);
          }
          break;
      }
    }, [disabled, isOpen, focusedIndex, filteredOptions, handleSelect, multiple, searchValue, internalValue, options, onChange]);

    // Click outside handler
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setIsOpen(false);
          setFocusedIndex(-1);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Display value
    const displayValue = useMemo(() => {
      if (selectedOptions.length === 0) return null;

      if (multiple) {
        const visibleTags = maxTagCount !== undefined
          ? selectedOptions.slice(0, maxTagCount)
          : selectedOptions;
        const hiddenCount = selectedOptions.length - visibleTags.length;

        return (
          <div className="rottay-select__tags">
            {visibleTags.map((opt) => (
              <span key={opt.value} className="rottay-select__tag">
                {opt.icon && <span className="rottay-select__tag-icon">{opt.icon}</span>}
                {opt.label}
                <button
                  type="button"
                  className="rottay-select__tag-remove"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(opt.value, opt);
                  }}
                  aria-label={`Remove ${opt.label}`}
                >
                  x
                </button>
              </span>
            ))}
            {hiddenCount > 0 && (
              <span className="rottay-select__tag rottay-select__tag--more">
                +{hiddenCount}
              </span>
            )}
          </div>
        );
      }

      return (
        <span className="rottay-select__value">
          {selectedOptions[0].icon && (
            <span className="rottay-select__value-icon">{selectedOptions[0].icon}</span>
          )}
          {selectedOptions[0].label}
        </span>
      );
    }, [selectedOptions, multiple, maxTagCount, handleSelect]);

    // Container styles
    const containerStyle: React.CSSProperties = {
      ...selectVars,
      position: 'relative',
      display: 'inline-block',
      width: '100%',
      ...style,
    };

    const triggerStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      minHeight: 'var(--ds-select-height)',
      padding: 'var(--ds-select-padding)',
      backgroundColor: 'var(--ds-select-bg)',
      border: variant === 'flushed'
        ? 'none'
        : '1px solid var(--ds-select-border-color)',
      borderBottom: variant === 'flushed'
        ? '2px solid var(--ds-select-border-color)'
        : undefined,
      borderRadius: 'var(--ds-select-border-radius)',
      fontSize: 'var(--ds-select-font-size)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      transition: 'var(--ds-select-transition)',
      outline: 'none',
    };

    const dropdownStyle: React.CSSProperties = {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      marginTop: '4px',
      padding: '4px 0',
      backgroundColor: 'var(--ds-select-dropdown-bg)',
      border: '1px solid var(--ds-select-border-color)',
      borderRadius: 'var(--ds-select-border-radius)',
      boxShadow: 'var(--ds-select-dropdown-shadow)',
      maxHeight: '256px',
      overflowY: 'auto',
      zIndex: 1050,
    };

    const optionStyle = (index: number, isSelected: boolean, isDisabled: boolean): React.CSSProperties => ({
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 12px',
      fontSize: 'var(--ds-select-font-size)',
      backgroundColor: isSelected
        ? 'var(--ds-select-option-selected-bg)'
        : focusedIndex === index
          ? 'var(--ds-select-option-hover-bg)'
          : 'transparent',
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      opacity: isDisabled ? 0.5 : 1,
      transition: 'var(--ds-select-transition)',
    });

    const statusClass = effectiveStatus !== 'default' ? `rottay-select--${effectiveStatus}` : '';
    const variantClass = `rottay-select--${variant}`;
    const sizeClass = `rottay-select--${size}`;

    // Merge refs properly
    const setRefs = (node: HTMLDivElement | null) => {
      (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }
    };

    return (
      <div
        ref={setRefs}
        className={`rottay-select ${sizeClass} ${variantClass} ${statusClass} ${isOpen ? 'rottay-select--open' : ''} ${disabled ? 'rottay-select--disabled' : ''} ${className}`}
        style={containerStyle}
        onKeyDown={handleKeyDown}
        onFocus={onFocus as any}
        onBlur={onBlur as any}
      >
        {/* Hidden input for form submission */}
        {name && (
          <input
            type="hidden"
            name={name}
            value={multiple ? internalValue.join(',') : internalValue[0] || ''}
          />
        )}

        {/* Trigger */}
        <div
          id={id}
          className="rottay-select__trigger"
          style={triggerStyle}
          onClick={handleToggle}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-disabled={disabled}
          tabIndex={disabled ? -1 : 0}
          autoFocus={autoFocus}
        >
          {/* Search input or display value */}
          {isSearchable && isOpen ? (
            <input
              ref={inputRef}
              type="text"
              className="rottay-select__search"
              value={searchValue}
              onChange={handleSearch}
              placeholder={selectedOptions.length === 0 ? placeholder : ''}
              style={{
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                flex: 1,
                fontSize: 'inherit',
                minWidth: '50px',
              }}
              onClick={(e) => e.stopPropagation()}
            />
          ) : displayValue || (
            <span className="rottay-select__placeholder" style={{ color: 'var(--ds-color-text-secondary, #999)' }}>
              {placeholder}
            </span>
          )}

          {/* Spacer */}
          <span style={{ flex: 1 }} />

          {/* Clear button */}
          {isClearable && internalValue.length > 0 && !disabled && (
            <button
              type="button"
              className="rottay-select__clear"
              onClick={handleClear}
              aria-label="Clear selection"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '16px',
                height: '16px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                opacity: 0.5,
                fontSize: '12px',
              }}
            >
              x
            </button>
          )}

          {/* Loading indicator */}
          {loading && (
            <span className="rottay-select__loading" style={{ marginLeft: '8px' }}>
              <svg
                className="rottay-select__spinner"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                style={{ animation: 'spin 1s linear infinite' }}
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray="31.4 31.4"
                />
              </svg>
            </span>
          )}

          {/* Arrow */}
          <span
            className="rottay-select__arrow"
            style={{
              marginLeft: '8px',
              transition: 'transform 0.2s',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div
            className="rottay-select__dropdown"
            style={dropdownStyle}
            role="listbox"
            aria-multiselectable={multiple}
          >
            {filteredOptions.length === 0 ? (
              <div
                className="rottay-select__empty"
                style={{ padding: '8px 12px', color: 'var(--ds-color-text-secondary, #999)', textAlign: 'center' }}
              >
                No options
              </div>
            ) : (
              filteredOptions.map((option, index) => {
                const isSelected = internalValue.includes(option.value);
                return (
                  <div
                    key={option.value}
                    className={`rottay-select__option ${isSelected ? 'rottay-select__option--selected' : ''} ${option.disabled ? 'rottay-select__option--disabled' : ''}`}
                    style={optionStyle(index, isSelected, !!option.disabled)}
                    onClick={() => handleSelect(option.value, option)}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={option.disabled}
                    onMouseEnter={() => setFocusedIndex(index)}
                  >
                    {multiple && (
                      <span
                        className="rottay-select__checkbox"
                        style={{
                          width: '16px',
                          height: '16px',
                          border: '1px solid var(--ds-select-border-color)',
                          borderRadius: '3px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: isSelected ? 'var(--ds-color-primary-500, #1890ff)' : 'transparent',
                          color: 'white',
                          fontSize: '10px',
                        }}
                      >
                        {isSelected && ''}
                      </span>
                    )}
                    {option.icon && <span className="rottay-select__option-icon">{option.icon}</span>}
                    <span className="rottay-select__option-label">{option.label}</span>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Global keyframe styles */}
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }
);

BaseSelect.displayName = 'BaseSelect';
