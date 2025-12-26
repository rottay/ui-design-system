'use client';

/**
 * AutoComplete - Apollo Engine (Vanilla HTML/CSS)
 */
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type { AutoCompleteProps, AutoCompleteOption } from '../../types';
import { AUTOCOMPLETE_DEFAULTS } from '../../types';

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
      className,
      style,
    } = props;

    const [internalValue, setInternalValue] = useState(defaultValue);
    const [internalOpen, setInternalOpen] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(-1);

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

    const getInputHeight = () => {
      switch (size) {
        case 'small': return '32px';
        case 'large': return '48px';
        default: return '40px';
      }
    };

    const getBorderColor = () => {
      if (status === 'error') return '#ef4444';
      if (status === 'warning') return '#f59e0b';
      return '#d1d5db';
    };

    return (
      <div
        ref={(node) => {
          (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        className={className}
        style={{ position: 'relative', ...style }}
      >
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => handleOpenChange(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            autoFocus={autoFocus}
            style={{
              width: '100%',
              height: getInputHeight(),
              padding: '0 12px',
              paddingRight: allowClear && value ? '32px' : '12px',
              border: `1px solid ${getBorderColor()}`,
              borderRadius: '6px',
              fontSize: '14px',
              outline: 'none',
              opacity: disabled ? 0.5 : 1,
              cursor: disabled ? 'not-allowed' : 'text',
            }}
          />
          {allowClear && value && (
            <button
              type="button"
              onClick={() => handleChange('')}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#9ca3af',
                fontSize: '14px',
              }}
            >
              ✕
            </button>
          )}
        </div>

        {isOpen && (
          <ul
            role="listbox"
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '4px',
              backgroundColor: '#fff',
              borderRadius: '6px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              maxHeight: '240px',
              overflowY: 'auto',
              zIndex: 1050,
              listStyle: 'none',
              padding: '4px 0',
              margin: 0,
            }}
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={focusedIndex === index}
                  onClick={() => !option.disabled && handleSelect(option)}
                  onMouseEnter={() => setFocusedIndex(index)}
                  style={{
                    padding: '8px 12px',
                    cursor: option.disabled ? 'not-allowed' : 'pointer',
                    backgroundColor: focusedIndex === index ? '#f3f4f6' : 'transparent',
                    opacity: option.disabled ? 0.5 : 1,
                  }}
                >
                  {option.label ?? option.value}
                </li>
              ))
            ) : (
              <li
                style={{
                  padding: '8px 12px',
                  color: '#9ca3af',
                  textAlign: 'center',
                }}
              >
                {notFoundContent}
              </li>
            )}
          </ul>
        )}
      </div>
    );
  }
);

AutoComplete.displayName = 'AutoComplete.Apollo';

export default AutoComplete;
