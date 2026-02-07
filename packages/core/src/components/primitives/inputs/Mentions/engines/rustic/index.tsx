'use client';

/**
 * @fileoverview Mentions Rustic Engine - Rottay Design System
 * @description Pure vanilla HTML/CSS implementation of the Mentions component
 * using CSS variables for multi-tenant theming.
 *
 * @module RusticMentions
 * @category Inputs
 * @package @rottay/design-system
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type { MentionsProps, MentionsOption } from '../../types';
import { MENTIONS_DEFAULTS } from '../../types';

export const Mentions = React.forwardRef<HTMLTextAreaElement, MentionsProps>(
  (props, ref) => {
    const {
      options = [],
      value: controlledValue,
      defaultValue = '',
      onChange,
      onSelect,
      onSearch,
      prefix = MENTIONS_DEFAULTS.prefix,
      split = MENTIONS_DEFAULTS.split,
      placeholder,
      disabled,
      readOnly,
      rows = MENTIONS_DEFAULTS.rows,
      status,
      placement = MENTIONS_DEFAULTS.placement,
      notFoundContent = 'No results',
      filterOption = MENTIONS_DEFAULTS.filterOption,
      className = '',
      style,
    } = props;

    const [internalValue, setInternalValue] = useState(defaultValue);
    const [isOpen, setIsOpen] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [currentPrefix, setCurrentPrefix] = useState('');
    const [mentionStart, setMentionStart] = useState(-1);
    const [focusedIndex, setFocusedIndex] = useState(0);

    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : internalValue;

    const containerRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const prefixes = (Array.isArray(prefix) ? prefix : [prefix]).filter((p): p is string => !!p);

    const filteredOptions = useMemo(() => {
      if (!filterOption) return options;
      if (filterOption === true) {
        return options.filter((opt) =>
          opt.value.toLowerCase().includes(searchText.toLowerCase())
        );
      }
      return options.filter((opt) => filterOption(searchText, opt));
    }, [options, searchText, filterOption]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      const cursorPos = e.target.selectionStart;

      if (!isControlled) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);

      const textBeforeCursor = newValue.slice(0, cursorPos);
      let foundPrefix = '';
      let mentionStartPos = -1;

      for (const p of prefixes) {
        const lastPrefixIndex = textBeforeCursor.lastIndexOf(p);
        if (lastPrefixIndex >= 0) {
          const textAfterPrefix = textBeforeCursor.slice(lastPrefixIndex + p.length);
          if (!textAfterPrefix.includes(split || '')) {
            if (mentionStartPos < lastPrefixIndex) {
              mentionStartPos = lastPrefixIndex;
              foundPrefix = p;
            }
          }
        }
      }

      if (mentionStartPos >= 0) {
        const search = textBeforeCursor.slice(mentionStartPos + foundPrefix.length);
        setSearchText(search);
        setCurrentPrefix(foundPrefix);
        setMentionStart(mentionStartPos);
        setIsOpen(true);
        setFocusedIndex(0);
        onSearch?.(search, foundPrefix);
      } else {
        setIsOpen(false);
      }
    };

    const handleSelect = useCallback((option: MentionsOption) => {
      if (textareaRef.current) {
        const cursorPos = textareaRef.current.selectionStart;
        const beforeMention = value.slice(0, mentionStart);
        const afterCursor = value.slice(cursorPos);
        const newValue = `${beforeMention}${currentPrefix}${option.value}${split}${afterCursor}`;

        if (!isControlled) {
          setInternalValue(newValue);
        }
        onChange?.(newValue);
        onSelect?.(option, currentPrefix);
        setIsOpen(false);

        setTimeout(() => {
          const newPos = beforeMention.length + currentPrefix.length + option.value.length + (split || '').length;
          textareaRef.current?.setSelectionRange(newPos, newPos);
          textareaRef.current?.focus();
        }, 0);
      }
    }, [value, mentionStart, currentPrefix, split, isControlled, onChange, onSelect]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (!isOpen) return;

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
        case 'Tab':
          if (filteredOptions[focusedIndex]) {
            e.preventDefault();
            handleSelect(filteredOptions[focusedIndex]);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          break;
      }
    };

    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setIsOpen(false);
        }
      };
      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const getBorderColor = () => {
      if (status === 'error') return 'var(--ds-mentions-border-error)';
      if (status === 'warning') return 'var(--ds-mentions-border-warning)';
      if (isFocused) return 'var(--ds-mentions-border-focus)';
      return 'var(--ds-mentions-border)';
    };

    // Build class names
    const containerClasses = [
      'rottay-mentions',
      'rottay-mentions--rustic',
      status && `rottay-mentions--${status}`,
      disabled && 'rottay-mentions--disabled',
      isOpen && 'rottay-mentions--open',
      className,
    ].filter(Boolean).join(' ');

    const wrapperStyle: React.CSSProperties = {
      position: 'relative',
      fontFamily: 'var(--ds-font-family-base)',
      ...style,
    };

    const textareaStyle: React.CSSProperties = {
      width: '100%',
      padding: 'var(--ds-mentions-padding)',
      border: `1px solid ${getBorderColor()}`,
      borderRadius: 'var(--ds-mentions-radius)',
      fontSize: 'var(--ds-mentions-font-size)',
      backgroundColor: 'var(--ds-mentions-bg)',
      resize: 'vertical',
      outline: 'none',
      opacity: disabled ? 0.5 : 1,
      cursor: disabled ? 'not-allowed' : 'text',
      transition: 'var(--ds-transition-fast)',
    };

    const dropdownStyle: React.CSSProperties = {
      position: 'absolute',
      [placement === 'top' ? 'bottom' : 'top']: '100%',
      left: 0,
      right: 0,
      marginTop: placement === 'top' ? 0 : '4px',
      marginBottom: placement === 'top' ? '4px' : 0,
      backgroundColor: 'var(--ds-mentions-dropdown-bg)',
      borderRadius: 'var(--ds-mentions-dropdown-radius)',
      boxShadow: 'var(--ds-mentions-dropdown-shadow)',
      maxHeight: 'var(--ds-mentions-dropdown-max-height)',
      overflowY: 'auto',
      zIndex: 1050,
      listStyle: 'none',
      padding: '4px 0',
      margin: 0,
    };

    const getOptionStyle = (index: number, isDisabled?: boolean): React.CSSProperties => ({
      padding: 'var(--ds-mentions-option-padding)',
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      backgroundColor: focusedIndex === index ? 'var(--ds-mentions-option-bg-hover)' : 'transparent',
      opacity: isDisabled ? 0.5 : 1,
      fontSize: 'var(--ds-font-size-sm)',
      transition: 'background-color 0.15s',
    });

    const emptyStyle: React.CSSProperties = {
      padding: '12px',
      textAlign: 'center',
      color: 'var(--ds-mentions-empty-color)',
      fontSize: 'var(--ds-font-size-sm)',
    };

    return (
      <div
        ref={containerRef}
        className={containerClasses}
        style={wrapperStyle}
      >
        <textarea
          ref={(node) => {
            (textareaRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
            if (typeof ref === 'function') ref(node);
            else if (ref) ref.current = node;
          }}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          rows={rows}
          style={textareaStyle}
          className="rottay-mentions__input"
        />

        {isOpen && (
          <ul
            className="rottay-mentions__dropdown"
            style={dropdownStyle}
            role="listbox"
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={focusedIndex === index}
                  onClick={() => !option.disabled && handleSelect(option)}
                  onMouseEnter={() => setFocusedIndex(index)}
                  style={getOptionStyle(index, option.disabled)}
                  className="rottay-mentions__option"
                >
                  {option.label ?? option.value}
                </li>
              ))
            ) : (
              <li style={emptyStyle} className="rottay-mentions__empty">
                {notFoundContent}
              </li>
            )}
          </ul>
        )}
      </div>
    );
  }
);

Mentions.displayName = 'Mentions.Rustic';

export default Mentions;
