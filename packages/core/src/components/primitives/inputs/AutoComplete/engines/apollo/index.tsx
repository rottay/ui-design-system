'use client';

/**
 * @fileoverview AutoComplete Apollo Engine - Rottay Design System
 * @description Pure HTML/CSS implementation of the AutoComplete component using CSS variables.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @module ApolloAutoComplete
 * @category Inputs
 * @package @rottay/design-system
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type { AutoCompleteProps, AutoCompleteOption } from '../../types';
import { AUTOCOMPLETE_DEFAULTS } from '../../types';

// Size configuration using CSS variables
const SIZE_CONFIG: Record<string, { height: string }> = {
  small: { height: 'var(--ds-autocomplete-sm-height)' },
  default: { height: 'var(--ds-autocomplete-md-height)' },
  large: { height: 'var(--ds-autocomplete-lg-height)' },
};

export const AutoComplete = React.forwardRef<HTMLDivElement, AutoCompleteProps>(
  (props, ref) => {
    const {
      options = [],
      value: controlledValue,
      defaultValue = '',
      onChange,
      onSearch,
      onSelect,
      filterOption = AUTOCOMPLETE_DEFAULTS.filterOption,
      placeholder,
      disabled,
      allowClear,
      autoFocus,
      open: controlledOpen,
      onDropdownVisibleChange,
      size = AUTOCOMPLETE_DEFAULTS.size,
      status,
      notFoundContent = 'No results found',
      className = '',
      style,
    } = props;

    const [internalValue, setInternalValue] = useState(defaultValue);
    const [internalOpen, setInternalOpen] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const [isFocused, setIsFocused] = useState(false);

    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : internalValue;
    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

    const containerRef = useRef<HTMLDivElement>(null);

    const handleOpenChange = useCallback((newOpen: boolean) => {
      if (controlledOpen === undefined) {
        setInternalOpen(newOpen);
      }
      onDropdownVisibleChange?.(newOpen);
    }, [controlledOpen, onDropdownVisibleChange]);

    const handleChange = useCallback((newValue: string) => {
      if (!isControlled) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
      onSearch?.(newValue);
      handleOpenChange(true);
    }, [isControlled, onChange, onSearch, handleOpenChange]);

    const handleSelect = useCallback((option: AutoCompleteOption) => {
      const newValue = option.value;
      if (!isControlled) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
      onSelect?.(newValue, option);
      handleOpenChange(false);
      setFocusedIndex(-1);
    }, [isControlled, onChange, onSelect, handleOpenChange]);

    const filteredOptions = useMemo(() => {
      if (!filterOption) return options;
      if (filterOption === true) {
        return options.filter((opt) =>
          opt.value.toLowerCase().includes(value.toLowerCase())
        );
      }
      return options.filter((opt) => filterOption(value, opt));
    }, [options, value, filterOption]);

    // Click outside
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          handleOpenChange(false);
        }
      };
      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, handleOpenChange]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          handleOpenChange(true);
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex((prev) =>
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (focusedIndex >= 0 && filteredOptions[focusedIndex]) {
            handleSelect(filteredOptions[focusedIndex]);
          }
          break;
        case 'Escape':
          handleOpenChange(false);
          break;
      }
    };

    const sizeConfig = SIZE_CONFIG[size ?? 'default'] || SIZE_CONFIG.default;

    // Build class names
    const containerClasses = [
      'rottay-autocomplete',
      'rottay-autocomplete--apollo',
      `rottay-autocomplete--${size}`,
      status && `rottay-autocomplete--${status}`,
      disabled && 'rottay-autocomplete--disabled',
      isOpen && 'rottay-autocomplete--open',
      className,
    ].filter(Boolean).join(' ');

    const getBorderColor = () => {
      if (status === 'error') return 'var(--ds-autocomplete-error-border)';
      if (status === 'warning') return 'var(--ds-autocomplete-warning-border)';
      if (isFocused) return 'var(--ds-autocomplete-border-focus)';
      return 'var(--ds-autocomplete-border)';
    };

    const wrapperStyle: React.CSSProperties = {
      position: 'relative',
      fontFamily: 'var(--ds-font-family-base)',
      ...style,
    };

    const inputStyle: React.CSSProperties = {
      width: '100%',
      height: sizeConfig.height,
      padding: '0 12px',
      paddingRight: allowClear && value ? '32px' : '12px',
      border: `1px solid ${getBorderColor()}`,
      borderRadius: 'var(--ds-autocomplete-radius)',
      fontSize: 'var(--ds-font-size-sm)',
      outline: 'none',
      opacity: disabled ? 0.5 : 1,
      cursor: disabled ? 'not-allowed' : 'text',
      backgroundColor: 'var(--ds-autocomplete-bg)',
      color: 'var(--ds-color-neutral-900)',
      transition: 'var(--ds-transition-fast)',
    };

    const clearButtonStyle: React.CSSProperties = {
      position: 'absolute',
      right: '8px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: 'var(--ds-autocomplete-clear-color)',
      fontSize: '14px',
      padding: '0 4px',
    };

    const dropdownStyle: React.CSSProperties = {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      marginTop: '4px',
      backgroundColor: 'var(--ds-autocomplete-dropdown-bg)',
      borderRadius: 'var(--ds-autocomplete-dropdown-radius)',
      boxShadow: 'var(--ds-autocomplete-dropdown-shadow)',
      maxHeight: '240px',
      overflowY: 'auto',
      zIndex: 1050,
      listStyle: 'none',
      padding: '4px 0',
      margin: 0,
    };

    const optionStyle = (index: number, isDisabled?: boolean): React.CSSProperties => ({
      padding: '8px 12px',
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      backgroundColor: focusedIndex === index ? 'var(--ds-autocomplete-option-bg-hover)' : 'transparent',
      opacity: isDisabled ? 0.5 : 1,
      fontSize: 'var(--ds-font-size-sm)',
      transition: 'background-color 0.15s',
    });

    const emptyStyle: React.CSSProperties = {
      padding: '8px 12px',
      color: 'var(--ds-autocomplete-empty-color)',
      textAlign: 'center',
      fontSize: 'var(--ds-font-size-sm)',
    };

    return (
      <div
        ref={(node) => {
          (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        className={containerClasses}
        style={wrapperStyle}
      >
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => { setIsFocused(true); handleOpenChange(true); }}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            autoFocus={autoFocus}
            style={inputStyle}
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            role="combobox"
          />
          {allowClear && value && !disabled && (
            <button
              type="button"
              onClick={() => handleChange('')}
              style={clearButtonStyle}
              aria-label="Clear"
            >
              ✕
            </button>
          )}
        </div>

        {isOpen && (
          <ul role="listbox" style={dropdownStyle}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={focusedIndex === index}
                  onClick={() => !option.disabled && handleSelect(option)}
                  onMouseEnter={() => setFocusedIndex(index)}
                  style={optionStyle(index, option.disabled)}
                >
                  {option.label ?? option.value}
                </li>
              ))
            ) : (
              <li style={emptyStyle}>{notFoundContent}</li>
            )}
          </ul>
        )}
      </div>
    );
  }
);

AutoComplete.displayName = 'AutoComplete.Apollo';

export default AutoComplete;
