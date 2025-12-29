/**
 * @fileoverview Select Apollo Engine - Rottay Design System
 * @description Pure HTML/CSS implementation of the Select component using CSS variables.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * The Apollo engine provides a headless select implementation using only
 * native HTML elements and CSS variables for theming. This ensures
 * multi-tenant support through the CSS cascade.
 *
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
      const optionElements = listRef.current.querySelectorAll('[role="option"]');
      if (optionElements[index]) {
        optionElements[index].scrollIntoView({ block: 'nearest' });
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

  // Get size values
  const sizeConfig = SIZE_MAP[size];

  // Determine border color based on status
  const getBorderColor = () => {
    if (effectiveStatus === 'error') return 'var(--ds-select-error-border)';
    if (effectiveStatus === 'warning') return 'var(--ds-select-warning-border)';
    if (effectiveStatus === 'success') return 'var(--ds-select-success-border)';
    if (isOpen) return 'var(--ds-select-border-focus)';
    return 'var(--ds-select-border)';
  };

  // Container styles using CSS variables
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-block',
    width: '100%',
    ...style,
  };

  const triggerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    minHeight: `${sizeConfig.height}px`,
    padding: sizeConfig.padding,
    backgroundColor: disabled
      ? 'var(--ds-select-bg-disabled)'
      : variant === 'filled'
        ? 'var(--ds-select-filled-bg)'
        : 'var(--ds-select-bg)',
    border: variant === 'flushed' ? 'none' : `1px solid ${getBorderColor()}`,
    borderBottom: variant === 'flushed' ? `2px solid ${getBorderColor()}` : undefined,
    borderRadius: variant === 'flushed' ? 0 : 'var(--ds-select-radius)',
    fontSize: `${sizeConfig.fontSize}px`,
    color: 'var(--ds-select-color)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'var(--ds-select-transition)',
    outline: 'none',
    boxShadow: isOpen ? 'var(--ds-select-shadow-focus)' : 'none',
  };

  const dropdownStyle: React.CSSProperties = {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: '0.25rem',
    padding: '0.25rem 0',
    backgroundColor: 'var(--ds-select-dropdown-bg)',
    border: `1px solid var(--ds-select-dropdown-border)`,
    borderRadius: 'var(--ds-select-dropdown-radius)',
    boxShadow: 'var(--ds-select-dropdown-shadow)',
    maxHeight: '16rem',
    overflowY: 'auto',
    zIndex: 1050,
  };

  // Build class names
  const containerClasses = [
    'rottay-select',
    'rottay-select--apollo',
    `rottay-select--${size}`,
    `rottay-select--${variant}`,
    isOpen && 'rottay-select--open',
    disabled && 'rottay-select--disabled',
    loading && 'rottay-select--loading',
    effectiveStatus !== 'default' && `rottay-select--${effectiveStatus}`,
    className,
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
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
          {visibleTags.map((opt) => (
            <span
              key={opt.value}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.125rem 0.5rem',
                backgroundColor: 'var(--ds-select-tag-bg)',
                color: 'var(--ds-select-tag-color)',
                borderRadius: 'var(--ds-select-tag-radius)',
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
                  padding: '0 0.125rem',
                  fontSize: '0.75rem',
                  lineHeight: 1,
                  color: 'var(--ds-select-clear-color)',
                }}
                aria-label={`Remove ${opt.label}`}
              >
                ×
              </button>
            </span>
          ))}
          {hiddenCount > 0 && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.125rem 0.5rem',
                backgroundColor: 'var(--ds-select-tag-bg)',
                color: 'var(--ds-select-tag-color)',
                borderRadius: 'var(--ds-select-tag-radius)',
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
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
        onFocus={onFocus as React.FocusEventHandler<HTMLDivElement>}
        onBlur={onBlur as React.FocusEventHandler<HTMLDivElement>}
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
              minWidth: '3rem',
              color: 'var(--ds-select-color)',
            }}
            onClick={(e) => e.stopPropagation()}
            aria-autocomplete="list"
            aria-controls={`${id || 'select'}-listbox`}
          />
        ) : displayValue || (
          <span style={{ color: 'var(--ds-select-color-placeholder)' }}>{placeholder}</span>
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
              width: '1rem',
              height: '1rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: 'var(--ds-select-clear-color)',
              fontSize: '0.75rem',
            }}
          >
            ×
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
          stroke="var(--ds-select-arrow-color)"
          strokeWidth="2"
          style={{
            marginLeft: '0.5rem',
            transition: 'var(--ds-select-transition)',
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
                padding: '0.5rem 0.75rem',
                color: 'var(--ds-select-color-placeholder)',
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
                    isSelected && 'rottay-select__option--selected',
                    option.disabled && 'rottay-select__option--disabled',
                    isFocused && 'rottay-select__option--focused',
                  ].filter(Boolean).join(' ')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 0.75rem',
                    fontSize: `${sizeConfig.fontSize}px`,
                    backgroundColor: isSelected
                      ? 'var(--ds-select-option-bg-selected)'
                      : isFocused
                        ? 'var(--ds-select-option-bg-hover)'
                        : 'transparent',
                    color: isSelected
                      ? 'var(--ds-select-option-color-selected)'
                      : option.disabled
                        ? 'var(--ds-select-option-color-disabled)'
                        : 'var(--ds-select-color)',
                    cursor: option.disabled ? 'not-allowed' : 'pointer',
                    opacity: option.disabled ? 0.5 : 1,
                    transition: 'var(--ds-select-transition)',
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
                        width: '1rem',
                        height: '1rem',
                        border: `1px solid var(--ds-select-border)`,
                        borderRadius: '0.1875rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isSelected ? 'var(--ds-select-check-color)' : 'transparent',
                        color: 'white',
                        fontSize: '0.625rem',
                        flexShrink: 0,
                      }}
                    >
                      {isSelected && '✓'}
                    </span>
                  )}
                  {option.icon && <span style={{ flexShrink: 0 }}>{option.icon}</span>}
                  <span>{option.label}</span>
                  {!multiple && isSelected && (
                    <span style={{ marginLeft: 'auto', color: 'var(--ds-select-check-color)' }}>
                      ✓
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
