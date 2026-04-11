'use client';

/**
 * @fileoverview Mentions Modern Engine - Rottay Design System.
 * Custom DaisyUI/Tailwind CSS implementation with full mention detection,
 * dropdown suggestions, keyboard navigation, and auto-size support --
 * no Ant Design dependency at runtime.
 *
 * @example
 * ```tsx
 * <Mentions engine="modern" options={users} prefix="@" placement="bottom" />
 * ```
 *
 * @module ModernMentions
 * @category Inputs
 * @package @rottay/design-system
 */

import React, { useState, useRef, useEffect, useCallback, useMemo, useLayoutEffect } from 'react';
import type { MentionsProps, MentionsOption } from '../Mentions.types';
import { MENTIONS_DEFAULTS } from '../Mentions.types';

/**
 * SSR-safe layout effect: uses useLayoutEffect on the client for flicker-free
 * DOM measurements, falls back to useEffect on the server to avoid warnings.
 */
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Modern engine Mentions built with DaisyUI / Tailwind CSS.
 * Implements cursor-aware prefix detection, filtered suggestion dropdown,
 * keyboard list navigation, auto-size textarea, and click-outside dismissal.
 *
 * @param props - Unified MentionsProps from the design system contract.
 * @param ref - Forwarded ref attached to the underlying `<textarea>` element.
 * @returns A DaisyUI-styled textarea with a suggestion dropdown overlay.
 */
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

    // Controlled vs uncontrolled: parent-supplied `value` takes precedence
    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : internalValue;

    const containerRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Normalize prefix to array so multi-prefix detection logic stays uniform
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

    /** Filter suggestions: true = built-in case-insensitive match; function = custom predicate. */
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

      // Detect whether the cursor sits inside an active mention by scanning for
      // the most recent prefix character that has not yet been terminated by the
      // configured `split` delimiter (typically a space).
      const textBeforeCursor = newValue.slice(0, cursorPos);
      let foundPrefix = '';
      let mentionStartPos = -1;

      for (const p of prefixes) {
        const lastPrefixIndex = textBeforeCursor.lastIndexOf(p);
        if (lastPrefixIndex >= 0) {
          const textAfterPrefix = textBeforeCursor.slice(lastPrefixIndex + p.length);
          // No split delimiter after prefix means user is still typing a mention
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

    /**
     * Insert the selected mention into the textarea value, replacing the
     * in-progress search text, then reposition the cursor after the mention.
     */
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

        // Defer cursor repositioning until React has flushed the new value
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

    // Dismiss dropdown when clicking outside the component boundary
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

    const getStatusBorderColor = () => {
      if (status === 'error') return 'var(--ds-color-error)';
      if (status === 'warning') return 'var(--ds-color-warning)';
      return 'var(--ds-color-border)';
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
          style={{ width: '100%', border: `1px solid ${getStatusBorderColor()}`, borderRadius: 'var(--ds-radius-md)', padding: 'var(--ds-input-md-padding-y, 8px) var(--ds-input-md-padding-x, 12px)', fontSize: 'var(--ds-input-md-font-size, 14px)', background: 'var(--ds-color-bg-input)', color: 'var(--ds-color-text-primary)', outline: 'none', fontFamily: 'inherit', ...(autoSize ? { resize: 'none' as const } : undefined) }}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          rows={typeof autoSize === 'object' ? autoSize.minRows || 1 : autoSize === true ? 1 : rows}
          role="textbox"
          aria-multiline="true"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        />

        {isOpen && (
          <ul
            className={popupClassName || undefined}
            style={{ position: 'absolute', zIndex: 50, width: '100%', listStyle: 'none', margin: 0, padding: 'var(--ds-dropdown-padding, 4px)', maxHeight: 'var(--ds-dropdown-max-height, 192px)', overflowY: 'auto', borderRadius: 'var(--ds-radius-lg)', border: '1px solid var(--ds-color-border-subtle)', background: 'var(--ds-surface-card)', boxShadow: 'var(--ds-elevation-2)', ...(placement === 'top' ? { bottom: '100%', marginBottom: 'var(--ds-spacing-1, 4px)' } : { top: '100%', marginTop: 'var(--ds-spacing-1, 4px)' }) }}
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
              <li className="p-3 text-center" role="option" aria-disabled="true" style={{ color: 'var(--ds-color-text-secondary)' }}>
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
