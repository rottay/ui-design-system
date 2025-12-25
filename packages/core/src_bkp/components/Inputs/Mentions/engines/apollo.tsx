'use client';

/**
 * Apollo Mentions Engine
 *
 * Native HTML + Tailwind implementation with unified props interface.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import type { MentionsProps, MentionOption } from '../types';
import {
  defaultMentionFilter,
  extractMentionText,
  insertMention,
} from '../../../../types/components/mentions';

/**
 * Apollo Mentions Component
 *
 * Pure Tailwind-styled mentions input.
 */
export default function ApolloMentions(props: MentionsProps) {
  const {
    value: controlledValue,
    defaultValue = '',
    options = [],
    placeholder,
    disabled = false,
    readOnly = false,
    prefix = '@',
    split = ' ',
    notFoundContent = 'No matches',
    size = 'middle',
    status,
    allowClear = false,
    variant = 'outlined',
    autoSize,
    rows = 3,
    open: controlledOpen,
    placement = 'bottom',
    filterOption = true,
    loading = false,
    onChange,
    onSelect,
    onSearch,
    onPopupVisibleChange,
    onFocus,
    onBlur,
    onKeyDown,
    onPressEnter,
    className = '',
    style,
    id,
    name,
    autoFocus,
  } = props;

  // Internal state
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [activePrefix, setActivePrefix] = useState<string | null>(null);
  const [mentionStart, setMentionStart] = useState<number>(0);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const value = controlledValue ?? internalValue;
  const dropdownOpen = controlledOpen ?? isOpen;

  // Filter options based on search
  const filteredOptions = options.filter((opt) => {
    if (filterOption === false) return true;
    if (typeof filterOption === 'function') {
      return filterOption(searchText, opt);
    }
    return defaultMentionFilter(searchText, opt);
  });

  // Size classes
  const sizeClasses = {
    small: 'px-2 py-1 text-sm',
    middle: 'px-3 py-2 text-base',
    large: 'px-4 py-3 text-lg',
  };

  // Status classes
  const statusClasses = {
    error: 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
    warning: 'border-yellow-500 focus:border-yellow-500 focus:ring-yellow-500/20',
  };

  // Variant classes
  const variantClasses = {
    outlined: 'border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
    borderless: 'border-0 focus:ring-0',
    filled: 'border-0 bg-gray-100 focus:bg-gray-50 focus:ring-2 focus:ring-blue-500/20',
  };

  // Handle value change
  const handleChange = useCallback(
    (newValue: string) => {
      if (controlledValue === undefined) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);

      // Check for mention trigger
      if (textareaRef.current) {
        const cursorPos = textareaRef.current.selectionStart;
        const result = extractMentionText(newValue, cursorPos, prefix);

        if (result) {
          setSearchText(result.text);
          setActivePrefix(result.prefix);
          setMentionStart(result.start);
          setIsOpen(true);
          setHighlightedIndex(0);
          onSearch?.(result.text, result.prefix);
          onPopupVisibleChange?.(true);
        } else {
          setIsOpen(false);
          setSearchText('');
          setActivePrefix(null);
          onPopupVisibleChange?.(false);
        }
      }
    },
    [controlledValue, onChange, prefix, onSearch, onPopupVisibleChange]
  );

  // Handle option select
  const handleSelect = useCallback(
    (option: MentionOption) => {
      if (activePrefix === null) return;

      const { value: newValue, cursorPosition } = insertMention(
        value,
        option.value,
        mentionStart,
        activePrefix,
        split
      );

      if (controlledValue === undefined) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
      onSelect?.(option, activePrefix);

      // Move cursor
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.setSelectionRange(cursorPosition, cursorPosition);
          textareaRef.current.focus();
        }
      }, 0);

      // Close dropdown
      setIsOpen(false);
      setSearchText('');
      setActivePrefix(null);
      onPopupVisibleChange?.(false);
    },
    [value, controlledValue, mentionStart, activePrefix, split, onChange, onSelect, onPopupVisibleChange]
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      onKeyDown?.(e);

      if (e.key === 'Enter' && !e.shiftKey) {
        if (dropdownOpen && filteredOptions.length > 0) {
          e.preventDefault();
          handleSelect(filteredOptions[highlightedIndex]);
        } else {
          onPressEnter?.(e);
        }
      } else if (e.key === 'ArrowDown' && dropdownOpen) {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp' && dropdownOpen) {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
      } else if (e.key === 'Escape' && dropdownOpen) {
        setIsOpen(false);
        onPopupVisibleChange?.(false);
      }
    },
    [onKeyDown, onPressEnter, dropdownOpen, filteredOptions, highlightedIndex, handleSelect, onPopupVisibleChange]
  );

  // Handle clear
  const handleClear = useCallback(() => {
    if (controlledValue === undefined) {
      setInternalValue('');
    }
    onChange?.('');
    textareaRef.current?.focus();
  }, [controlledValue, onChange]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        textareaRef.current &&
        !textareaRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        onPopupVisibleChange?.(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onPopupVisibleChange]);

  // Calculate textarea style for autoSize
  const textareaStyle: React.CSSProperties = {
    ...style,
    ...(autoSize === true
      ? { minHeight: 'auto', resize: 'none' }
      : typeof autoSize === 'object'
      ? {
          minHeight: autoSize.minRows ? `${autoSize.minRows * 1.5}em` : undefined,
          maxHeight: autoSize.maxRows ? `${autoSize.maxRows * 1.5}em` : undefined,
          resize: 'none',
        }
      : {}),
  };

  const inputClasses = [
    'w-full rounded-md transition-colors duration-200 outline-none',
    sizeClasses[size],
    variantClasses[variant],
    status ? statusClasses[status] : '',
    disabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="relative w-full">
      {/* Textarea */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          id={id}
          name={name}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          rows={rows}
          autoFocus={autoFocus}
          className={inputClasses}
          style={textareaStyle}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          onKeyDown={handleKeyDown}
        />
        {/* Clear button */}
        {allowClear && value && !disabled && !readOnly && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-2 p-1 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown */}
      {dropdownOpen && (
        <div
          ref={dropdownRef}
          className={[
            'absolute z-50 w-64 max-h-60 overflow-auto',
            'bg-white border border-gray-200 rounded-lg shadow-lg',
            placement === 'top' ? 'bottom-full mb-1' : 'top-full mt-1',
          ].join(' ')}
        >
          {loading ? (
            <div className="p-3 text-center text-gray-500">
              <svg className="animate-spin h-5 w-5 mx-auto" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          ) : filteredOptions.length === 0 ? (
            <div className="p-3 text-center text-gray-500 text-sm">
              {notFoundContent}
            </div>
          ) : (
            <ul className="py-1">
              {filteredOptions.map((option, index) => (
                <li key={option.value}>
                  <button
                    type="button"
                    disabled={option.disabled}
                    className={[
                      'w-full px-3 py-2 text-left text-sm transition-colors',
                      index === highlightedIndex ? 'bg-blue-50 text-blue-700' : 'text-gray-700',
                      option.disabled
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-gray-100 cursor-pointer',
                    ].join(' ')}
                    onClick={() => !option.disabled && handleSelect(option)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    {option.label ?? option.value}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
