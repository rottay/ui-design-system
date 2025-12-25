/**
 * Apollo AutoComplete Engine
 *
 * Native HTML + Tailwind CSS autocomplete implementation.
 * Zero external dependencies, minimal bundle size.
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
import { cn } from '../../../../utils/cn';

/**
 * Size styles for input
 */
const sizeStyles = {
  small: 'px-2 py-1 text-sm',
  middle: 'px-3 py-2 text-base',
  large: 'px-4 py-3 text-lg',
};

/**
 * Status border colors
 */
const statusStyles = {
  error: 'border-red-500 focus:ring-red-500 focus:border-red-500',
  warning: 'border-yellow-500 focus:ring-yellow-500 focus:border-yellow-500',
};

/**
 * Apollo AutoComplete - Native HTML + Tailwind implementation
 */
function ApolloAutoComplete({
  value,
  defaultValue = '',
  options,
  placeholder,
  disabled,
  size = 'middle',
  status,
  allowClear,
  bordered = true,
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
  className,
  style,
  id,
}: AutoCompleteProps) {
  // State
  const [inputValue, setInputValue] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
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

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeDropdown();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeDropdown]);

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
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
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

  // Scroll active option into view
  useEffect(() => {
    if (activeIndex >= 0 && dropdownRef.current) {
      const activeElement = dropdownRef.current.children[activeIndex] as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [activeIndex]);

  const showClearButton = allowClear && currentValue && !disabled;

  return (
    <div ref={containerRef} className="relative w-full" style={style}>
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
          onBlur={onBlur}
          className={cn(
            'w-full rounded-md transition-colors duration-200',
            'focus:outline-none focus:ring-2',
            bordered
              ? 'border border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'
              : 'border-transparent',
            sizeStyles[size],
            status && statusStyles[status],
            disabled && 'bg-gray-100 cursor-not-allowed opacity-60',
            showClearButton && 'pr-8',
            className
          )}
          role="combobox"
          aria-expanded={isDropdownOpen}
          aria-autocomplete="list"
          aria-activedescendant={
            activeIndex >= 0 ? `apollo-option-${activeIndex}` : undefined
          }
          autoComplete="off"
        />

        {showClearButton && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 transition-colors"
            tabIndex={-1}
            aria-label="Clear"
          >
            <svg
              className="w-4 h-4 text-gray-400"
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
          className={cn(
            'absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg',
            'border border-gray-200 max-h-60 overflow-auto py-1'
          )}
          role="listbox"
        >
          {filteredOptions.length === 0 ? (
            <li className="px-3 py-2 text-gray-500 text-center text-sm">
              {notFoundContent}
            </li>
          ) : (
            filteredOptions.map((option, index) => (
              <li
                key={String(option.value)}
                id={`apollo-option-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                onClick={() => !option.disabled && handleSelect(option)}
                onMouseEnter={() => !option.disabled && setActiveIndex(index)}
                className={cn(
                  'px-3 py-2 cursor-pointer transition-colors text-sm',
                  index === activeIndex && 'bg-blue-50 text-blue-700',
                  option.disabled && 'opacity-50 cursor-not-allowed bg-gray-50',
                  !option.disabled && 'hover:bg-gray-100'
                )}
              >
                {option.label ?? option.value}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

ApolloAutoComplete.displayName = 'ApolloAutoComplete';

export default ApolloAutoComplete;
