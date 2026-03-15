'use client';

/**
 * Mentions - Modern Engine (DaisyUI/Tailwind)
 */
import React, { useState, useRef, useEffect, useCallback, useMemo, useLayoutEffect } from 'react';
import type { MentionsProps, MentionsOption } from '../Mentions.types';
import { MENTIONS_DEFAULTS } from '../Mentions.types';

// Safe useLayoutEffect that falls back to useEffect on SSR
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

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
      autoSize,
      rows = MENTIONS_DEFAULTS.rows,
      status,
      placement = MENTIONS_DEFAULTS.placement,
      notFoundContent = 'No results',
      filterOption = MENTIONS_DEFAULTS.filterOption,
      className,
      style,
      popupClassName,
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

    // Auto-size: dynamically adjust textarea height based on content
    const adjustTextareaHeight = useCallback(() => {
      const textarea = textareaRef.current;
      if (!textarea || !autoSize) return;

      // Reset height to auto first to get the correct scrollHeight
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;

      if (typeof autoSize === 'object') {
        const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 20;
        const minH = autoSize.minRows ? autoSize.minRows * lineHeight : 0;
        const maxH = autoSize.maxRows ? autoSize.maxRows * lineHeight : Infinity;
        textarea.style.height = `${Math.min(Math.max(scrollHeight, minH), maxH)}px`;
        textarea.style.overflowY = scrollHeight > maxH ? 'auto' : 'hidden';
      } else {
        textarea.style.height = `${scrollHeight}px`;
        textarea.style.overflowY = 'hidden';
      }
    }, [autoSize]);

    useIsomorphicLayoutEffect(() => {
      adjustTextareaHeight();
    }, [value, adjustTextareaHeight]);

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

      // Check for mention trigger
      const textBeforeCursor = newValue.slice(0, cursorPos);
      let foundPrefix = '';
      let mentionStartPos = -1;

      for (const p of prefixes) {
        const lastPrefixIndex = textBeforeCursor.lastIndexOf(p);
        if (lastPrefixIndex >= 0) {
          const textAfterPrefix = textBeforeCursor.slice(lastPrefixIndex + p.length);
          // Check if there's no space after prefix (still typing mention)
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

        // Set cursor position after mention
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

    // Click outside
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

    const getStatusClass = () => {
      if (status === 'error') return 'textarea-error';
      if (status === 'warning') return 'textarea-warning';
      return '';
    };

    return (
      <div
        ref={containerRef}
        className={`relative ${className || ''}`}
        style={style}
      >
        <textarea
          ref={(node) => {
            (textareaRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
            if (typeof ref === 'function') ref(node);
            else if (ref) ref.current = node;
          }}
          className={`textarea textarea-bordered w-full ${getStatusClass()}`}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          rows={typeof autoSize === 'object' ? autoSize.minRows || 1 : autoSize === true ? 1 : rows}
          style={autoSize ? { resize: 'none' } : undefined}
          role="textbox"
          aria-multiline="true"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        />

        {isOpen && (
          <ul
            className={`absolute z-50 w-full menu bg-base-100 rounded-box shadow-lg max-h-48 overflow-auto ${placement === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'} ${popupClassName || ''}`}
            role="listbox"
            aria-label="Mention suggestions"
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <li key={option.value} role="option" aria-selected={focusedIndex === index}>
                  <button
                    type="button"
                    className={`${option.disabled ? 'disabled' : ''} ${focusedIndex === index ? 'active' : ''}`}
                    disabled={option.disabled}
                    onClick={() => handleSelect(option)}
                    onMouseEnter={() => setFocusedIndex(index)}
                  >
                    {option.label ?? option.value}
                  </button>
                </li>
              ))
            ) : (
              <li className="p-3 text-center text-base-content/50" role="option" aria-disabled="true">
                {notFoundContent}
              </li>
            )}
          </ul>
        )}
      </div>
    );
  }
);

Mentions.displayName = 'Mentions.Modern';

export default Mentions;
