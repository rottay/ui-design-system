'use client';

/**
 * @fileoverview Mentions Modern Engine - Rottay Design System.
 * Custom implementation with full mention detection, dropdown suggestions,
 * keyboard navigation, and auto-size support -- no Ant Design dependency at
 * runtime and no DaisyUI classes. All static paint and geometry are owned by
 * the modern skin (`skin/mentions.css`) keyed on `data-part`/`data-*` hooks;
 * the engine keeps only truly dynamic writes (the auto-size height
 * measurements) and the public `style` escape hatch.
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

import React, { useState, useRef, useEffect, useCallback, useMemo, useLayoutEffect, useId } from 'react';
import { arrayValueAt } from '@/foundation/kernel/collections';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import type { MentionsProps, MentionsOption } from '../../contracts';
import { MENTIONS_DEFAULTS } from '../../contracts';

/**
 * SSR-safe layout effect: uses useLayoutEffect on the client for flicker-free
 * DOM measurements, falls back to useEffect on the server to avoid warnings.
 */
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Modern engine Mentions: cursor-aware prefix detection, filtered suggestion
 * dropdown, keyboard list navigation, auto-size textarea, and click-outside
 * dismissal. Paint belongs to the modern skin; visible strings resolve through
 * the optional i18n channel with documented English fallbacks.
 *
 * ARIA (K4-D remediation): the textarea keeps `role="textbox"` +
 * `aria-multiline` + `aria-haspopup="listbox"` (all supported by the textbox
 * role). `aria-expanded` is NOT emitted: the textbox role does not support it
 * (axe `aria-allowed-attr`/critical), and the combobox role that would carry
 * it forbids `aria-multiline`, which a textarea requires. The expanded state
 * remains perceivable through the in-tree labelled listbox.
 *
 * @param props - Unified MentionsProps from the design system contract.
 * @param ref - Forwarded ref attached to the underlying `<textarea>` element.
 * @returns A skin-painted textarea with a suggestion dropdown overlay.
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
      notFoundContent,
      loading = false,
      filterOption = MENTIONS_DEFAULTS.filterOption,
      className,
      style,
      'aria-label': ariaLabel,
      popupClassName,
    } = props;

    // Visible strings: translated when an I18nProvider is mounted, with the
    // documented English fallbacks otherwise (a missing catalog key echoes
    // back, which the endsWith guard detects).
    const i18n = useOptionalTranslation('components');
    const mentionsLabel = (key: string, fallback: string): string => {
      const translated = i18n?.t(key);
      return translated && !translated.endsWith(key) ? translated : fallback;
    };
    const emptyContent = notFoundContent ?? mentionsLabel('mentions.not_found', 'No results');
    const suggestionsLabel = mentionsLabel('mentions.suggestions_label', 'Mention suggestions');
    const loadingContent = mentionsLabel('mentions.loading', 'Loading…');
    // Accessible name: explicit aria-label wins, then the visible placeholder,
    // then the localized default (axe `label` critical, K4-D remediation).
    const inputLabel = ariaLabel ?? placeholder ?? mentionsLabel('mentions.input_label', 'Mentions');

    const [internalValue, setInternalValue] = useState(defaultValue);
    const [isOpen, setIsOpen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [currentPrefix, setCurrentPrefix] = useState('');
    const [mentionStart, setMentionStart] = useState(-1);
    const [focusedIndex, setFocusedIndex] = useState(0);
    // Listbox wiring: aria-controls points at the popup while open and
    // aria-activedescendant at the arrow-navigated option, so AT announces
    // the active suggestion (focus itself never leaves the textarea).
    const mentionsId = useId().replace(/:/g, '');
    const listboxId = `mentions-${mentionsId}-listbox`;

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

    const activeOptionId =
      isOpen && !loading && filteredOptions.length > 0
        ? `mentions-${mentionsId}-option-${focusedIndex}`
        : undefined;

    // Keyboard navigation keeps the active option in view: aria-activedescendant
    // never moves DOM focus, so the row must be scrolled into the popup's
    // viewport explicitly (nearest edge, no page scroll). Guarded for jsdom.
    useEffect(() => {
      if (!activeOptionId) return;
      const el = document.getElementById(activeOptionId);
      if (el && typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({ block: 'nearest' });
      }
    }, [activeOptionId]);

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
        case 'Tab': {
          const focusedOption = focusedIndex >= 0 ? arrayValueAt(filteredOptions, focusedIndex) : undefined;
          // Keyboard selection must honor the same disabled gate as pointer
          // click (K4-D Pass 2 review: only the pointer path was guarded).
          if (focusedOption && !focusedOption.disabled) {
            e.preventDefault();
            handleSelect(focusedOption);
          }
          break;
        }
        case 'Escape':
          setIsOpen(false);
          break;
        case 'Home':
          e.preventDefault();
          setFocusedIndex(0);
          break;
        case 'End':
          e.preventDefault();
          setFocusedIndex(filteredOptions.length - 1);
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

    return (
      <div
        ref={containerRef}
        className={`ds-mentions ds-mentions--modern ${className || ''}`}
        style={style}
        data-part="root"
        data-mention-active={isOpen ? 'true' : undefined}
        data-mention-prefix={isOpen && currentPrefix ? currentPrefix : undefined}
      >
        <textarea
          ref={(node) => {
            (textareaRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
            if (typeof ref === 'function') ref(node);
            else if (ref) ref.current = node;
          }}
          className={['rottay-mentions__input', status ? `rottay-mentions__input--${status}` : undefined].filter(Boolean).join(' ')}
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
          aria-controls={isOpen ? listboxId : undefined}
          aria-activedescendant={activeOptionId}
          aria-label={inputLabel}
          data-part="textarea"
          data-disabled={disabled || undefined}
          data-readonly={readOnly || undefined}
          data-status={status || undefined}
          data-autosize={autoSize ? 'true' : undefined}
        />

        {isOpen && (
          <ul
            id={listboxId}
            className={['rottay-mentions__popup', `rottay-mentions__popup--${placement}`, popupClassName].filter(Boolean).join(' ')}
            data-placement={placement}
            data-part="dropdown"
            role="listbox"
            aria-label={suggestionsLabel}
          >
            {loading ? (
              <li role="option" aria-disabled="true" data-part="loading">
                {loadingContent}
              </li>
            ) : filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <li key={option.value} role="option" aria-selected={focusedIndex === index} id={`mentions-${mentionsId}-option-${index}`}>
                  <button
                    type="button"
                    className={`${option.disabled ? 'disabled' : ''} ${focusedIndex === index ? 'active' : ''}`}
                    disabled={option.disabled}
                    onClick={() => handleSelect(option)}
                    onMouseEnter={() => setFocusedIndex(index)}
                    data-part="option"
                    data-active={focusedIndex === index || undefined}
                    data-disabled={option.disabled || undefined}
                  >
                    {/* Governed label slot: the stable addressable part for
                        the option's primary content (truncation/typography
                        live in the skin). Rich ReactNode labels compose
                        inside it. */}
                    <span data-part="option-label">{option.label ?? option.value}</span>
                  </button>
                </li>
              ))
            ) : (
              <li role="option" aria-disabled="true" data-part="empty">
                {emptyContent}
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
