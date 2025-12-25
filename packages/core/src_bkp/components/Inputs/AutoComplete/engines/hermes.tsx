/**
 * Hermes AutoComplete Engine
 *
 * DaisyUI-based autocomplete implementation with unified AutoCompleteProps.
 */

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type {
  AutoCompleteProps,
  AutoCompleteOption,
} from '../../../../types/components/autocomplete';
import {
  normalizeOptions,
  flattenOptions,
  defaultFilterOption,
} from '../../../../types/components/autocomplete';

/**
 * Map size to DaisyUI input classes
 */
const sizeClasses = {
  small: 'input-sm',
  middle: '',
  large: 'input-lg',
};

/**
 * Map status to DaisyUI classes
 */
const statusClasses = {
  error: 'input-error',
  warning: 'input-warning',
};

/**
 * Hermes AutoComplete - DaisyUI implementation
 */
function HermesAutoComplete({
  value,
  defaultValue = '',
  options,
  placeholder,
  disabled,
  size = 'middle',
  status,
  allowClear,
  open: controlledOpen,
  defaultOpen = false,
  notFoundContent = 'No matches found',
  autoFocus,
  defaultActiveFirstOption = true,
  filterOption = true,
  onChange,
  onSelect,
  onDropdownVisibleChange,
  onFocus,
  onBlur,
  onSearch,
  onClear,
  onKeyDown,
  className = '',
  style,
  id,
}: AutoCompleteProps) {
  // State
  const [inputValue, setInputValue] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);

  // Controlled vs uncontrolled
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : inputValue;
  const isDropdownOpen = controlledOpen !== undefined ? controlledOpen : isOpen;

  // Normalize and filter options
  const normalizedOptions = normalizeOptions(options);
  const flatOptions = flattenOptions(normalizedOptions);

  const filteredOptions =
    filterOption === false
      ? flatOptions
      : flatOptions.filter((opt) => {
          if (!opt.disabled) {
            if (typeof filterOption === 'function') {
              return filterOption(currentValue, opt);
            }
            return defaultFilterOption(currentValue, opt);
          }
          return false;
        });

  // Open/close handlers
  const openDropdown = useCallback(() => {
    if (!disabled) {
      setIsOpen(true);
      onDropdownVisibleChange?.(true);
    }
  }, [disabled, onDropdownVisibleChange]);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setActiveIndex(-1);
    onDropdownVisibleChange?.(false);
  }, [onDropdownVisibleChange]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    if (!isControlled) {
      setInputValue(newValue);
    }

    onChange?.(newValue);
    onSearch?.(newValue);
    openDropdown();

    if (defaultActiveFirstOption && filteredOptions.length > 0) {
      setActiveIndex(0);
    }
  };

  // Handle option selection
  const handleSelect = (option: AutoCompleteOption) => {
    const newValue = String(option.value);

    if (!isControlled) {
      setInputValue(newValue);
    }

    onChange?.(newValue);
    onSelect?.(option.value, option);
    closeDropdown();
    inputRef.current?.focus();
  };

  // Handle clear
  const handleClear = () => {
    if (!isControlled) {
      setInputValue('');
    }
    onChange?.('');
    onClear?.();
    inputRef.current?.focus();
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e);

    if (e.defaultPrevented) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!isDropdownOpen) {
          openDropdown();
        } else {
          setActiveIndex((prev) =>
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          );
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (isDropdownOpen) {
          setActiveIndex((prev) =>
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          );
        }
        break;

      case 'Enter':
        if (isDropdownOpen && activeIndex >= 0 && filteredOptions[activeIndex]) {
          e.preventDefault();
          handleSelect(filteredOptions[activeIndex]);
        }
        break;

      case 'Escape':
        closeDropdown();
        break;

      case 'Tab':
        closeDropdown();
        break;
    }
  };

  // Handle focus
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    openDropdown();
    onFocus?.(e);
  };

  // Handle blur with delay for click handling
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setTimeout(() => {
      closeDropdown();
    }, 150);
    onBlur?.(e);
  };

  // Scroll active option into view
  useEffect(() => {
    if (activeIndex >= 0 && dropdownRef.current) {
      const activeElement = dropdownRef.current.children[activeIndex] as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [activeIndex]);

  // Build classes
  const inputClasses = [
    'input',
    'input-bordered',
    'w-full',
    sizeClasses[size],
    status && statusClasses[status],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const showClearButton = allowClear && currentValue && !disabled;

  return (
    <div className="dropdown w-full" style={style}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          id={id}
          value={currentValue}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={inputClasses}
          role="combobox"
          aria-expanded={isDropdownOpen}
          aria-autocomplete="list"
          aria-activedescendant={
            activeIndex >= 0 ? `option-${activeIndex}` : undefined
          }
          autoComplete="off"
        />

        {showClearButton && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-ghost btn-xs btn-circle"
            tabIndex={-1}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {isDropdownOpen && (
        <ul
          ref={dropdownRef}
          className="dropdown-content menu bg-base-100 rounded-box shadow-lg w-full max-h-60 overflow-auto z-50 p-2"
          role="listbox"
        >
          {filteredOptions.length === 0 ? (
            <li className="text-base-content/50 p-2 text-center">
              {notFoundContent}
            </li>
          ) : (
            filteredOptions.map((option, index) => (
              <li
                key={String(option.value)}
                id={`option-${index}`}
                role="option"
                aria-selected={index === activeIndex}
              >
                <button
                  type="button"
                  onClick={() => handleSelect(option)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={index === activeIndex ? 'active' : ''}
                  disabled={option.disabled}
                >
                  {option.label ?? option.value}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

HermesAutoComplete.displayName = 'HermesAutoComplete';

export default HermesAutoComplete;
