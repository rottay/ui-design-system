'use client';

/**
 * Mentions - Apollo Engine (Vanilla HTML/CSS)
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
      className,
      style,
    } = props;

    const [internalValue, setInternalValue] = useState(defaultValue);
    const [isOpen, setIsOpen] = useState(false);
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
      if (status === 'error') return '#ef4444';
      if (status === 'warning') return '#f59e0b';
      return '#d1d5db';
    };

    return (
      <div
        ref={containerRef}
        className={className}
        style={{ position: 'relative', ...style }}
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
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          rows={rows}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: `1px solid ${getBorderColor()}`,
            borderRadius: '6px',
            fontSize: '14px',
            resize: 'vertical',
            outline: 'none',
            opacity: disabled ? 0.5 : 1,
          }}
        />

        {isOpen && (
          <ul
            style={{
              position: 'absolute',
              [placement === 'top' ? 'bottom' : 'top']: '100%',
              left: 0,
              right: 0,
              marginTop: placement === 'top' ? 0 : '4px',
              marginBottom: placement === 'top' ? '4px' : 0,
              backgroundColor: '#fff',
              borderRadius: '6px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              maxHeight: '192px',
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
              <li style={{ padding: '12px', textAlign: 'center', color: '#9ca3af' }}>
                {notFoundContent}
              </li>
            )}
          </ul>
        )}
      </div>
    );
  }
);

Mentions.displayName = 'Mentions.Apollo';

export default Mentions;
