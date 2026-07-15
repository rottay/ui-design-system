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

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { arrayValueAt } from '@/_internal/utils/collections';
import type { AutoCompleteProps, AutoCompleteOption } from '../AutoComplete.types';
import { AUTOCOMPLETE_DEFAULTS } from '../AutoComplete.types';
import { toLegacySize } from '../../../../../contracts/common';

/**
 * Modern (DaisyUI) implementation of the AutoComplete input.
 *
 * Renders a plain `<input>` with a DaisyUI-styled dropdown list. Supports both
 * controlled (`value` + `onChange`) and uncontrolled (`defaultValue`) modes.
 * Keyboard navigation (Arrow keys, Enter, Escape) and click-outside dismissal
 * are handled internally, keeping parity with the Classic engine's UX.
 *
 * @param props - Standardized AutoCompleteProps from the DS type contract.
 * @param ref   - Forwarded ref attached to the outer wrapper div.
 * @returns A DaisyUI-styled autocomplete input with dropdown suggestion list.
 */
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
      size: sizeProp = AUTOCOMPLETE_DEFAULTS.size,
      notFoundContent = 'No results',
      className,
      style,
    } = props;

    // getSizeStyle's switch below is keyed by the legacy 'small' | 'middle' | 'large'
    // spelling; toLegacySize resolves either spelling to it.
    const size = toLegacySize(sizeProp);

    // Three pieces of internal state mirror what Ant Design manages automatically
    // in the Classic engine: the text value, dropdown visibility, and the
    // keyboard-focused option index (-1 means no option is focused).
    const [internalValue, setInternalValue] = useState(defaultValue);
    const [internalOpen, setInternalOpen] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(-1);

    // Controlled vs uncontrolled detection -- when the consumer passes `value`
    // we defer to it; otherwise we own the value in local state.
    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : internalValue;
    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

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
    const handleChange = useCallback((newValue: string) => {
      if (!isControlled) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
      onSearch?.(newValue);
      handleOpenChange(true);
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

    // Keyboard navigation with circular wrapping (ArrowDown at the end goes
    // back to the first option, ArrowUp at the start goes to the last).
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
        case 'Enter': {
          e.preventDefault();
          const focusedOption = focusedIndex >= 0 ? arrayValueAt(filteredOptions, focusedIndex) : undefined;
          if (focusedOption) {
            handleSelect(focusedOption);
          }
          break;
        }
        case 'Escape':
          handleOpenChange(false);
          break;
      }
    };

    // Map DS size tokens to inline sizing styles.
    const getSizeStyle = (): React.CSSProperties => {
      switch (size) {
        case 'small': return { height: 'var(--ds-input-sm-height, 2rem)', fontSize: 'var(--ds-input-sm-font-size, 13px)', padding: '4px var(--ds-input-sm-padding-x, 10px)' };
        case 'large': return { height: 'var(--ds-input-lg-height, 2.75rem)', fontSize: 'var(--ds-input-lg-font-size, 15px)', padding: '8px var(--ds-input-lg-padding-x, 14px)' };
        default: return { height: 'var(--ds-input-md-height, 2.5rem)', fontSize: 'var(--ds-input-md-font-size, 14px)', padding: '6px var(--ds-input-md-padding-x, 12px)' };
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
        className={`ds-autocomplete ds-autocomplete--modern relative ${className || ''}`}
        style={style}
        data-part="root"
      >
        <div className="relative" data-part="input-wrapper">
          <input
            ref={inputRef}
            type="text"
            style={{ width: '100%', boxSizing: 'border-box', ...getSizeStyle() }}
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
          />
          {/* Clear button only visible when there is a non-empty value and the input is interactive. */}
          {allowClear && value && !disabled && (
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              style={{ width: 24, height: 24, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 0, fontSize: 12 }}
              onClick={() => handleChange('')}
              data-part="clear-button"
            >
              ✕
            </button>
          )}
        </div>

        {/* Dropdown list positioned absolutely below the input. Uses DaisyUI's
            `menu` + `rounded-box` for consistent theming and `max-h-60` to
            keep the list scrollable when there are many options. */}
        {isOpen && (
          <ul data-part="dropdown" style={{ position: 'absolute', zIndex: 50, width: '100%', marginTop: 4, listStyle: 'none', margin: 0, marginBlockStart: 4, padding: 4, maxHeight: 240, overflowY: 'auto' }}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <li key={option.value}>
                  <button
                    type="button"
                    className={`${option.disabled ? 'disabled' : ''} ${focusedIndex === index ? 'active' : ''}`}
                    disabled={option.disabled}
                    onClick={() => handleSelect(option)}
                    // Sync keyboard focus index on hover so mouse and keyboard
                    // navigation stay coordinated.
                    onMouseEnter={() => setFocusedIndex(index)}
                    data-part="option"
                    data-active={focusedIndex === index || undefined}
                    data-disabled={option.disabled || undefined}
                  >
                    {option.label ?? option.value}
                  </button>
                </li>
              ))
            ) : (
              <li className="p-2 text-center" data-part="empty">
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
