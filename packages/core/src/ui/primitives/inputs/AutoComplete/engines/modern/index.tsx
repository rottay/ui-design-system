'use client';

/**
 * @fileoverview AutoComplete Modern engine -- custom dropdown built with DaisyUI/Tailwind classes.
 * Unlike the Classic engine, this manages its own controlled/uncontrolled state, keyboard
 * navigation, click-outside dismissal, and option filtering without relying on Ant Design.
 *
 * @example
 * ```tsx
 * <AutoComplete engine="modern" options={cities} onSearch={fetchCities} allowClear />
 * ```
 *
 * @module ModernAutoComplete
 * @category Inputs
 * @package @rottay/design-system
 */

import React, { useState, useRef, useEffect, useCallback, useMemo, useId } from 'react';
import { arrayValueAt } from '@/foundation/kernel/collections';
import type { AutoCompleteProps, AutoCompleteOption } from '../../contracts';
import { AUTOCOMPLETE_DEFAULTS } from '../../contracts';
import { toCanonicalSize } from '../../../../../../foundation/contracts/kernel/common';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { ActionCloseIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-close';

/**
 * Hook-local `tOr`: catalogue value with an English floor -- when the
 * catalogue entry has not landed yet the provider echoes the full key, which
 * must never reach visible copy or an aria-label.
 */
function useAutoCompleteTranslation() {
  const i18n = useOptionalTranslation('components');
  const tOr = (key: string, fallback: string): string => {
    const resolved = i18n?.t(key);
    if (!resolved || resolved === key || resolved === `components.${key}`) return fallback;
    return resolved;
  };
  return { tOr };
}

/**
 * Modern (DaisyUI) implementation of the AutoComplete input.
 *
 * Renders a plain `<input>` with a skin-painted dropdown list. Supports both
 * controlled (`value` + `onChange`) and uncontrolled (`defaultValue`) modes.
 * Keyboard navigation (Arrow/Home/End/PageUp/PageDown over enabled options,
 * Enter, Escape) and click-outside dismissal are handled internally, keeping
 * parity with the Classic engine's UX. All paint and per-size geometry live in
 * the modern skin (`skin/autocomplete.css`) keyed on `data-part`/`data-size`/
 * `data-status`; no inline styles remain on any part (the public `style`
 * escape hatch stays on the root, and a numeric `popupMatchSelectWidth` is
 * sanctioned instance geometry on the dropdown).
 *
 * @param props - Standardized AutoCompleteProps from the DS type contract.
 * @param ref   - Forwarded ref attached to the outer wrapper div.
 * @returns A DaisyUI-styled autocomplete input with dropdown suggestion list.
 */
export const AutoComplete = React.forwardRef<HTMLDivElement, AutoCompleteProps>(
  (props, ref) => {
    const { tOr } = useAutoCompleteTranslation();
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
      defaultOpen,
      open: controlledOpen,
      onDropdownVisibleChange,
      size: sizeProp = AUTOCOMPLETE_DEFAULTS.size,
      status,
      notFoundContent: notFoundContentProp,
      popupClassName,
      popupMatchSelectWidth = AUTOCOMPLETE_DEFAULTS.popupMatchSelectWidth,
      className,
      style,
    } = props;

    // Explicit prop wins; otherwise localized copy with the historical
    // English default as the floor.
    const notFoundContent = notFoundContentProp ?? tOr('autocomplete.not_found', 'No results');
    // Accessible name (axe `label` critical, Mentions K4-D idiom): the
    // contract exposes no `aria-label` axis, so the visible placeholder is
    // the floor and a localized default names the bare control. A consumer
    // composing a visible label should use FormField.
    const inputLabel = placeholder ?? tOr('autocomplete.input_label', 'Autocomplete');

    // The skin keys per-size geometry on `data-size` with the canonical
    // 'sm' | 'md' | 'lg' vocabulary; toCanonicalSize resolves either spelling.
    const size = toCanonicalSize(sizeProp);

    // Three pieces of internal state mirror what Ant Design manages automatically
    // in the Classic engine: the text value, dropdown visibility, and the
    // keyboard-focused option index (-1 means no option is focused).
    const [internalValue, setInternalValue] = useState(defaultValue);
    const [internalOpen, setInternalOpen] = useState(defaultOpen ?? false);
    const [focusedIndex, setFocusedIndex] = useState(-1);

    // Controlled vs uncontrolled detection -- when the consumer passes `value`
    // we defer to it; otherwise we own the value in local state.
    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : internalValue;
    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    // APG combobox wiring: the input owns focus permanently; the active
    // option is announced via aria-activedescendant against the listbox id.
    const listboxId = useId();

    // Only update internal open state when the dropdown is uncontrolled;
    // always notify the parent so controlled consumers stay in sync.
    const handleOpenChange = useCallback((newOpen: boolean) => {
      if (controlledOpen === undefined) {
        setInternalOpen(newOpen);
      }
      onDropdownVisibleChange?.(newOpen);
    }, [controlledOpen, onDropdownVisibleChange]);

    // Fires on every keystroke. Also opens the dropdown so suggestions
    // appear immediately while the user types (matching native browser behavior).
    // The keyboard focus index resets: the option it pointed at may be gone.
    const handleChange = useCallback((newValue: string) => {
      if (!isControlled) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
      onSearch?.(newValue);
      handleOpenChange(true);
      setFocusedIndex(-1);
    }, [isControlled, onChange, onSearch, handleOpenChange]);

    // Commits a selected option: updates the text value, notifies parent,
    // closes the dropdown, and resets the keyboard focus index.
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

    // Memoized filtering: `filterOption === true` enables the default
    // case-insensitive substring match; a function enables custom logic;
    // `false` disables client-side filtering (useful for server-side search).
    const filteredOptions = useMemo(() => {
      if (!filterOption) return options;
      if (filterOption === true) {
        return options.filter((opt) =>
          opt.value.toLowerCase().includes(value.toLowerCase())
        );
      }
      return options.filter((opt) => filterOption(value, opt));
    }, [options, value, filterOption]);

    // Dismiss the dropdown when the user clicks outside the component.
    // The listener is only attached while the dropdown is open to avoid
    // unnecessary event overhead on every mousedown.
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

    // A controlled value change from the parent can shrink the filtered list
    // under the keyboard focus index; clamp it back to "no option focused".
    useEffect(() => {
      if (focusedIndex >= filteredOptions.length) setFocusedIndex(-1);
    }, [filteredOptions.length, focusedIndex]);

    // Index of the next ENABLED option scanning in `direction` from `from`
    // (wraps at both ends); -1 when every option is disabled or the list is
    // empty. `from = -1` scans from the first option downward / from the last
    // upward, so ArrowUp on a fresh dropdown lands on the LAST enabled option
    // (the historical wrap contract the tests pin).
    const enabledIndexFrom = useCallback((from: number, direction: 1 | -1): number => {
      const count = filteredOptions.length;
      if (count === 0) return -1;
      const start = from < 0 ? (direction === 1 ? -1 : count) : from;
      for (let step = 1; step <= count; step++) {
        const candidate = (start + direction * step + count * step) % count;
        if (!arrayValueAt(filteredOptions, candidate)?.disabled) return candidate;
      }
      return -1;
    }, [filteredOptions]);

    // Keyboard-originated focus moves mark themselves so the scroll effect
    // below can tell them apart from hover (hover must never drag the
    // scrollport -- the Select batch's keyboardNavRef idiom).
    const keyboardNavRef = useRef(false);
    const moveFocus = useCallback((index: number) => {
      keyboardNavRef.current = true;
      setFocusedIndex(index);
    }, []);

    // Keep the keyboard-focused option inside the dropdown scrollport.
    // jsdom lacks scrollIntoView -- guard like the Select engine does.
    useEffect(() => {
      if (!isOpen || focusedIndex < 0 || !keyboardNavRef.current) return;
      keyboardNavRef.current = false;
      const node = document.getElementById(`${listboxId}-option-${focusedIndex}`);
      if (node && typeof node.scrollIntoView === 'function') {
        node.scrollIntoView({ block: 'nearest' });
      }
    }, [isOpen, focusedIndex, listboxId]);

    // Keyboard navigation with circular wrapping over ENABLED options
    // (ArrowDown at the end goes back to the first option, ArrowUp at the
    // start goes to the last), Home/End/PageUp/PageDown parity with Select.
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          handleOpenChange(true);
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          moveFocus(enabledIndexFrom(focusedIndex, 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          moveFocus(enabledIndexFrom(focusedIndex, -1));
          break;
        case 'Home':
          e.preventDefault();
          moveFocus(enabledIndexFrom(-1, 1));
          break;
        case 'End':
          e.preventDefault();
          moveFocus(enabledIndexFrom(filteredOptions.length, -1));
          break;
        case 'PageDown': {
          e.preventDefault();
          const target = Math.min((focusedIndex < 0 ? -1 : focusedIndex) + 10, filteredOptions.length - 1);
          moveFocus(arrayValueAt(filteredOptions, target)?.disabled ? enabledIndexFrom(target - 1, 1) : target);
          break;
        }
        case 'PageUp': {
          e.preventDefault();
          const target = Math.max((focusedIndex < 0 ? filteredOptions.length : focusedIndex) - 10, 0);
          moveFocus(arrayValueAt(filteredOptions, target)?.disabled ? enabledIndexFrom(target + 1, -1) : target);
          break;
        }
        case 'Enter': {
          // preventDefault only when Enter actually commits an option: with no
          // active descendant the keystroke belongs to the surrounding form.
          // Disabled options are unreachable (arrow nav skips them), but a
          // stale index could still point at one -- guard the commit.
          const focusedOption = focusedIndex >= 0 ? arrayValueAt(filteredOptions, focusedIndex) : undefined;
          if (focusedOption && !focusedOption.disabled) {
            e.preventDefault();
            handleSelect(focusedOption);
          }
          break;
        }
        case 'Escape':
          // Close and RETURN FOCUS to the input (Dropdown/DatePicker
          // precedent): if the pointer/user landed DOM focus on an option,
          // the dropdown unmount would drop focus to <body>.
          handleOpenChange(false);
          inputRef.current?.focus();
          break;
      }
    };

    return (
      <div
        // Merge the internal containerRef with the forwarded ref so both
        // the click-outside effect and the consumer can reference this node.
        ref={(node) => {
          (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        className={`ds-autocomplete ds-autocomplete--modern ${className || ''}`}
        style={style}
        data-part="root"
        data-size={size}
        data-status={status || undefined}
      >
        <div data-part="input-wrapper">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => handleOpenChange(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            autoFocus={autoFocus}
            data-part="input"
            data-open={isOpen || undefined}
            data-disabled={disabled || undefined}
            role="combobox"
            aria-label={inputLabel}
            aria-autocomplete="list"
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-invalid={status === 'error' || undefined}
            aria-controls={isOpen ? listboxId : undefined}
            aria-activedescendant={
              isOpen && focusedIndex >= 0 ? `${listboxId}-option-${focusedIndex}` : undefined
            }
          />
          {/* Clear button only visible when there is a non-empty value and the input is interactive.
              Positioning/paint are skin-owned (the old `right-2` utility was
              physical and broke RTL). Governed close icon, never a text glyph.
              Clearing returns focus to the input: the button unmounts on the
              same click, and the default would strand focus on <body>. */}
          {allowClear && value && !disabled && (
            <button
              type="button"
              onClick={() => {
                handleChange('');
                inputRef.current?.focus();
              }}
              data-part="clear-button"
              aria-label={tOr('autocomplete.clear', 'Clear')}
            >
              <ActionCloseIcon decorative size={12} />
            </button>
          )}
        </div>

        {/* Dropdown list positioned absolutely below the input (geometry is
            skin-owned; keyboard focus rides data-active). Options are NOT tab
            stops: per the combobox pattern DOM focus stays on the input and
            the active option is announced via aria-activedescendant.
            `popupMatchSelectWidth` is the contract's antd-heritage axis:
            `true` (default) lets the skin stretch the dropdown to the field
            (`inset-inline: 0`), `false` switches it to content width, and a
            number is sanctioned instance geometry -- a pixel width only the
            consumer knows, documented inline (no paint travels with it). */}
        {isOpen && (
          <ul
            data-part="dropdown"
            role="listbox"
            id={listboxId}
            className={popupClassName || undefined}
            data-match-width={popupMatchSelectWidth === false ? 'false' : undefined}
            style={
              typeof popupMatchSelectWidth === 'number'
                ? { inlineSize: popupMatchSelectWidth }
                : undefined
            }
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <li key={option.value}>
                  <button
                    type="button"
                    disabled={option.disabled}
                    tabIndex={-1}
                    onClick={() => handleSelect(option)}
                    // Sync keyboard focus index on hover so mouse and keyboard
                    // navigation stay coordinated -- without tripping the
                    // keyboard-only scroll-into-view.
                    onMouseEnter={() => {
                      keyboardNavRef.current = false;
                      setFocusedIndex(index);
                    }}
                    data-part="option"
                    data-active={focusedIndex === index || undefined}
                    data-disabled={option.disabled || undefined}
                    role="option"
                    id={`${listboxId}-option-${index}`}
                    aria-selected={focusedIndex === index}
                    // Truncated rows keep a full-value affordance (Select idiom).
                    title={typeof option.label === 'string' ? option.label : option.value}
                  >
                    {/* Governed label slot (Cascader/Mentions parity): the
                        stable addressable part for the option's primary
                        content; truncation lives on it in the skin. */}
                    <span data-part="option-label">{option.label ?? option.value}</span>
                  </button>
                </li>
              ))
            ) : (
              /* Empty posture sits inside the listbox: it must carry the
                 option role (aria-required-children) and read as disabled
                 (Mentions idiom) -- a role-less <li> breaks the listbox
                 contract for AT. */
              <li data-part="empty" role="option" aria-disabled="true">
                {notFoundContent}
              </li>
            )}
          </ul>
        )}
      </div>
    );
  }
);

AutoComplete.displayName = 'AutoComplete.Modern';

export default AutoComplete;
