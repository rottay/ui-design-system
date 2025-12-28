/**
 * @fileoverview Select Apollo Engine - Rottay Design System
 * @description Pure HTML/CSS implementation of the Select component.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * The Apollo engine provides a headless select implementation using only
 * native HTML elements and inline styles. This offers maximum flexibility
 * for custom styling and ensures full keyboard navigation compliance.
 *
 * **Key Features:**
 * - Zero UI library dependencies
 * - Full keyboard navigation (Arrow keys, Enter, Escape, Home, End, Tab)
 * - Search/filter functionality
 * - Single and multiple selection modes
 * - Option scrolling into view
 * - Focus management
 * - Click outside handling
 * - Hidden input for form submission
 *
 * **Inline Style Approach:**
 * Uses computed inline styles for complete control over appearance,
 * ensuring styles work without requiring any external CSS files.
 *
 * **Accessibility:**
 * - ARIA combobox pattern with proper roles
 * - aria-expanded, aria-haspopup, aria-controls
 * - aria-selected on options
 * - aria-disabled for disabled states
 * - aria-activedescendant for focused option
 * - Keyboard-accessible selection and navigation
 *
 * **CSS Custom Properties:**
 * - `--select-height` - Trigger height based on size
 * - `--select-font-size` - Font size based on size
 * - `--select-border-color` - Status-aware border color
 * - `--select-option-hover-bg` - Option hover background
 * - `--select-option-selected-bg` - Selected option background
 *
 * @example Using Apollo Engine
 * ```tsx
 * import { Select } from '@rottay/design-system';
 *
 * // Explicit Apollo engine
 * <Select
 *   engine="apollo"
 *   options={options}
 *   placeholder="Select..."
 *   searchable
 * />
 *
 * // With full customization
 * <Select
 *   engine="apollo"
 *   options={options}
 *   multiple
 *   searchable
 *   clearable
 *   maxTagCount={2}
 *   status="success"
 *   style={{ maxWidth: '300px' }}
 * />
 * ```
 *
 * @see {@link Select} for the main component
 * @see {@link TitanSelect} for Ant Design implementation
 * @see {@link HermesSelect} for DaisyUI implementation
 * @module ApolloSelect
 * @category Inputs
 * @package @rottay/design-system
 */

'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type { SelectProps, SelectOption } from '../../types';
import { SELECT_DEFAULTS, SIZE_MAP } from '../../types';

/**
 * Utility to get label text from option
 */
function getLabelText(label: React.ReactNode): string {
  if (typeof label === 'string') return label;
  if (typeof label === 'number') return String(label);
  return '';
}

// CSS class mappings
const SIZE_CLASS_MAP = {
  xs: 'rottay-select--xs',
  sm: 'rottay-select--sm',
  md: 'rottay-select--md',
  lg: 'rottay-select--lg',
  xl: 'rottay-select--xl',
};

const VARIANT_CLASS_MAP: Record<string, string> = {
  outline: 'rottay-select--outline',
  filled: 'rottay-select--filled',
  flushed: 'rottay-select--flushed',
  default: 'rottay-select--outline',
};

const STATUS_CLASS_MAP = {
  default: '',
  error: 'rottay-select--error',
  warning: 'rottay-select--warning',
  success: 'rottay-select--success',
};

export default function ApolloSelect(props: SelectProps): React.ReactElement {
  const {
    value,
    defaultValue,
    options = [],
    placeholder = 'Select...',
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
  } = props;

  // Resolve aliases
  const isClearable = clearable || allowClear;
  const isSearchable = searchable || showSearch;

  // Determine effective status
  const effectiveStatus = error ? 'error' : status;

  // State
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
  const listRef = useRef<HTMLDivElement>(null);

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

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        if (isOpen && focusedIndex >= 0 && filteredOptions[focusedIndex]) {
          handleSelect(filteredOptions[focusedIndex].value, filteredOptions[focusedIndex]);
        } else if (!isOpen) {
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
          setFocusedIndex(0);
        } else {
          setFocusedIndex((prev) => {
            const next = prev < filteredOptions.length - 1 ? prev + 1 : 0;
            // Scroll option into view
            scrollOptionIntoView(next);
            return next;
          });
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setFocusedIndex((prev) => {
            const next = prev > 0 ? prev - 1 : filteredOptions.length - 1;
            scrollOptionIntoView(next);
            return next;
          });
        }
        break;
      case 'Home':
        if (isOpen) {
          e.preventDefault();
          setFocusedIndex(0);
          scrollOptionIntoView(0);
        }
        break;
      case 'End':
        if (isOpen) {
          e.preventDefault();
          const lastIndex = filteredOptions.length - 1;
          setFocusedIndex(lastIndex);
          scrollOptionIntoView(lastIndex);
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
      case 'Tab':
        setIsOpen(false);
        break;
    }
  }, [disabled, isOpen, focusedIndex, filteredOptions, handleSelect, multiple, searchValue, internalValue, options, onChange]);

  // Scroll focused option into view
  const scrollOptionIntoView = useCallback((index: number) => {
    if (listRef.current) {
      const options = listRef.current.querySelectorAll('[role="option"]');
      if (options[index]) {
        options[index].scrollIntoView({ block: 'nearest' });
      }
    }
  }, []);

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

  // Auto-focus on open
  useEffect(() => {
    if (isOpen && isSearchable && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isSearchable]);

  // Reset focused index when options change
  useEffect(() => {
    setFocusedIndex(-1);
  }, [filteredOptions.length]);

  // CSS Variables
  const sizeConfig = SIZE_MAP[size];
  const cssVars: React.CSSProperties = {
    '--select-height': `${sizeConfig.height}px`,
    '--select-font-size': `${sizeConfig.fontSize}px`,
    '--select-padding': sizeConfig.padding,
    '--select-bg': variant === 'filled' ? '#f5f5f5' : '#ffffff',
    '--select-border-color': effectiveStatus === 'error' ? '#ff4d4f' :
                             effectiveStatus === 'warning' ? '#faad14' :
                             effectiveStatus === 'success' ? '#52c41a' :
                             '#d9d9d9',
    '--select-border-radius': variant === 'flushed' ? '0' : '6px',
    '--select-dropdown-bg': '#ffffff',
    '--select-dropdown-shadow': '0 6px 16px rgba(0, 0, 0, 0.08)',
    '--select-option-hover-bg': '#f5f5f5',
    '--select-option-selected-bg': '#e6f7ff',
    '--select-transition': 'all 0.2s ease',
  } as React.CSSProperties;

  // Build classes
  const containerClasses = [
    'rottay-select',
    SIZE_CLASS_MAP[size],
    VARIANT_CLASS_MAP[variant],
    STATUS_CLASS_MAP[effectiveStatus],
    isOpen ? 'rottay-select--open' : '',
    disabled ? 'rottay-select--disabled' : '',
    loading ? 'rottay-select--loading' : '',
    className,
  ].filter(Boolean).join(' ');

  // Styles
  const containerStyle: React.CSSProperties = {
    ...cssVars,
    position: 'relative',
    display: 'inline-block',
    width: '100%',
    ...style,
  };

  const triggerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    minHeight: 'var(--select-height)',
    padding: 'var(--select-padding)',
    backgroundColor: 'var(--select-bg)',
    border: variant === 'flushed' ? 'none' : '1px solid var(--select-border-color)',
    borderBottom: variant === 'flushed' ? '2px solid var(--select-border-color)' : undefined,
    borderRadius: 'var(--select-border-radius)',
    fontSize: 'var(--select-font-size)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'var(--select-transition)',
    outline: 'none',
  };

  const dropdownStyle: React.CSSProperties = {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: '4px',
    padding: '4px 0',
    backgroundColor: 'var(--select-dropdown-bg)',
    border: '1px solid var(--select-border-color)',
    borderRadius: 'var(--select-border-radius)',
    boxShadow: 'var(--select-dropdown-shadow)',
    maxHeight: '256px',
    overflowY: 'auto',
    zIndex: 1050,
  };

  // Display value
  const displayValue = useMemo(() => {
    if (selectedOptions.length === 0) return null;

    if (multiple) {
      const visibleTags = maxTagCount !== undefined
        ? selectedOptions.slice(0, maxTagCount)
        : selectedOptions;
      const hiddenCount = selectedOptions.length - visibleTags.length;

      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {visibleTags.map((opt) => (
            <span
              key={opt.value}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                backgroundColor: '#f0f0f0',
                borderRadius: '4px',
                fontSize: '0.875em',
              }}
            >
              {opt.icon && <span>{opt.icon}</span>}
              {opt.label}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(opt.value, opt);
                }}
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  padding: '0 2px',
                  fontSize: '12px',
                  lineHeight: 1,
                }}
                aria-label={`Remove ${opt.label}`}
              >
                x
              </button>
            </span>
          ))}
          {hiddenCount > 0 && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '2px 8px',
                backgroundColor: '#e6e6e6',
                borderRadius: '4px',
                fontSize: '0.875em',
              }}
            >
              +{hiddenCount}
            </span>
          )}
        </div>
      );
    }

    return (
      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {selectedOptions[0].icon && <span>{selectedOptions[0].icon}</span>}
        {selectedOptions[0].label}
      </span>
    );
  }, [selectedOptions, multiple, maxTagCount, handleSelect]);

  return (
    <div
      ref={containerRef}
      className={containerClasses}
      style={containerStyle}
      onKeyDown={handleKeyDown}
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
        onClick={() => {
          if (!disabled && !loading) {
            setIsOpen(!isOpen);
          }
        }}
        onFocus={onFocus as any}
        onBlur={onBlur as any}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-disabled={disabled}
        aria-controls={`${id || 'select'}-listbox`}
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
            onChange={(e) => {
              setSearchValue(e.target.value);
              onSearch?.(e.target.value);
              setFocusedIndex(0);
            }}
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
            aria-autocomplete="list"
            aria-controls={`${id || 'select'}-listbox`}
          />
        ) : displayValue || (
          <span style={{ color: '#999' }}>{placeholder}</span>
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
          <svg
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
        )}

        {/* Arrow */}
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{
            marginLeft: '8px',
            transition: 'transform 0.2s',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={listRef}
          id={`${id || 'select'}-listbox`}
          className="rottay-select__dropdown"
          style={dropdownStyle}
          role="listbox"
          aria-multiselectable={multiple}
          aria-activedescendant={focusedIndex >= 0 ? `${id || 'select'}-option-${focusedIndex}` : undefined}
        >
          {filteredOptions.length === 0 ? (
            <div
              style={{
                padding: '8px 12px',
                color: '#999',
                textAlign: 'center',
              }}
            >
              No options
            </div>
          ) : (
            filteredOptions.map((option, index) => {
              const isSelected = internalValue.includes(option.value);
              const isFocused = focusedIndex === index;

              return (
                <div
                  key={option.value}
                  id={`${id || 'select'}-option-${index}`}
                  className={[
                    'rottay-select__option',
                    isSelected ? 'rottay-select__option--selected' : '',
                    option.disabled ? 'rottay-select__option--disabled' : '',
                    isFocused ? 'rottay-select__option--focused' : '',
                  ].filter(Boolean).join(' ')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    fontSize: 'var(--select-font-size)',
                    backgroundColor: isSelected
                      ? 'var(--select-option-selected-bg)'
                      : isFocused
                        ? 'var(--select-option-hover-bg)'
                        : 'transparent',
                    cursor: option.disabled ? 'not-allowed' : 'pointer',
                    opacity: option.disabled ? 0.5 : 1,
                    transition: 'var(--select-transition)',
                  }}
                  onClick={() => handleSelect(option.value, option)}
                  onMouseEnter={() => setFocusedIndex(index)}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={option.disabled}
                >
                  {multiple && (
                    <span
                      style={{
                        width: '16px',
                        height: '16px',
                        border: '1px solid #d9d9d9',
                        borderRadius: '3px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isSelected ? '#1890ff' : 'transparent',
                        color: 'white',
                        fontSize: '10px',
                        flexShrink: 0,
                      }}
                    >
                      {isSelected && '\u2713'}
                    </span>
                  )}
                  {option.icon && <span style={{ flexShrink: 0 }}>{option.icon}</span>}
                  <span>{option.label}</span>
                  {!multiple && isSelected && (
                    <span style={{ marginLeft: 'auto', color: '#1890ff' }}>
                      \u2713
                    </span>
                  )}
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

ApolloSelect.displayName = 'ApolloSelect';
