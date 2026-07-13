'use client';

/**
 * @fileoverview AutoComplete Rustic engine -- zero-dependency implementation using only
 * native HTML elements and CSS custom properties. Unlike Classic (Ant Design) and Modern
 * (DaisyUI), this engine carries no UI-library weight, making it ideal for lightweight
 * deployments or environments where Tailwind/Ant are unavailable.
 *
 * All visual tokens (colors, radii, shadows) are read from `--ds-autocomplete-*` CSS
 * variables, so tenant theming works without any class-name changes.
 *
 * @example
 * ```tsx
 * <AutoComplete engine="rustic" options={fruits} onSearch={filter} status="error" />
 * ```
 *
 * @module RusticAutoComplete
 * @category Inputs
 * @package @rottay/design-system
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type { AutoCompleteProps, AutoCompleteOption } from '../AutoComplete.types';
import { AUTOCOMPLETE_DEFAULTS } from '../AutoComplete.types';
import { toLegacySize } from '../../../../../contracts/common';

// Height tokens per size variant. Values are CSS custom properties so the
// actual pixel values can be overridden at the tenant/theme level without
// touching component code.
const SIZE_CONFIG: Record<string, { height: string }> = {
  small: { height: 'var(--ds-autocomplete-sm-height)' },
  default: { height: 'var(--ds-autocomplete-md-height)' },
  large: { height: 'var(--ds-autocomplete-lg-height)' },
};

/**
 * Rustic (vanilla HTML/CSS) implementation of the AutoComplete input.
 *
 * Manages its own controlled/uncontrolled value, dropdown visibility, keyboard
 * navigation, and click-outside dismissal -- the same feature surface as the
 * Modern engine but styled entirely through inline styles referencing CSS variables.
 * ARIA attributes (`role="combobox"`, `aria-expanded`, `role="listbox"`) are applied
 * for screen-reader compatibility.
 *
 * @param props - Standardized AutoCompleteProps from the DS type contract.
 * @param ref   - Forwarded ref attached to the outer wrapper div.
 * @returns A fully themed autocomplete input rendered without any UI library.
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
      status,
      notFoundContent = 'No results found',
      className = '',
      style,
    } = props;

    // SIZE_CONFIG and the BEM class suffix below are keyed by the legacy
    // 'small' | 'middle' | 'large' spelling; toLegacySize resolves either spelling to it.
    const size = toLegacySize(sizeProp);

    // Internal state: text value, dropdown open, keyboard-focused index,
    // and visual focus ring. The extra `isFocused` state (not present in
    // the Modern engine) drives the border-color highlight via inline styles
    // because the rustic engine cannot rely on Tailwind's `focus:` utilities.
    const [internalValue, setInternalValue] = useState(defaultValue);
    const [internalOpen, setInternalOpen] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(-1);

    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : internalValue;
    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

    const containerRef = useRef<HTMLDivElement>(null);

    // Centralized open/close handler. Only mutates internal state when the
    // dropdown is uncontrolled; always notifies the parent callback.
    const handleOpenChange = useCallback((newOpen: boolean) => {
      if (controlledOpen === undefined) {
        setInternalOpen(newOpen);
      }
      onDropdownVisibleChange?.(newOpen);
    }, [controlledOpen, onDropdownVisibleChange]);

    // Text change handler: propagates to parent + triggers onSearch for
    // server-side filtering use cases.
    const handleChange = useCallback((newValue: string) => {
      if (!isControlled) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
      onSearch?.(newValue);
      handleOpenChange(true);
    }, [isControlled, onChange, onSearch, handleOpenChange]);

    // Option selection: commits the value, closes the dropdown, and resets
    // the keyboard focus index to prevent stale highlights on next open.
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

    // Client-side filtering. `filterOption === true` activates the default
    // case-insensitive substring match; a custom function allows full control.
    const filteredOptions = useMemo(() => {
      if (!filterOption) return options;
      if (filterOption === true) {
        return options.filter((opt) =>
          opt.value.toLowerCase().includes(value.toLowerCase())
        );
      }
      return options.filter((opt) => filterOption(value, opt));
    }, [options, value, filterOption]);

    // Click-outside listener -- only mounted while the dropdown is visible
    // to avoid unnecessary global event subscriptions.
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

    // Keyboard navigation with circular wrapping and Escape-to-close.
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
        case 'Enter':
          e.preventDefault();
          if (focusedIndex >= 0 && filteredOptions[focusedIndex]) {
            handleSelect(filteredOptions[focusedIndex]);
          }
          break;
        case 'Escape':
          handleOpenChange(false);
          break;
      }
    };

    const sizeConfig = SIZE_CONFIG[size ?? 'default'] || SIZE_CONFIG.default;

    // BEM-style class names for external CSS overrides. Status and state
    // modifiers are appended conditionally so selectors like
    // `.rottay-autocomplete--error` can target specific visual states.
    const containerClasses = [
      'rottay-autocomplete',
      'rottay-autocomplete--rustic',
      `rottay-autocomplete--${size}`,
      status && `rottay-autocomplete--${status}`,
      disabled && 'rottay-autocomplete--disabled',
      isOpen && 'rottay-autocomplete--open',
      className,
    ].filter(Boolean).join(' ');

    const wrapperStyle: React.CSSProperties = {
      position: 'relative',
      fontFamily: 'var(--ds-font-family-base)',
      ...style,
    };

    const inputStyle: React.CSSProperties = {
      width: '100%',
      height: sizeConfig.height,
      padding: '0 12px',
      paddingRight: allowClear && value ? '32px' : '12px',
      fontSize: 'var(--ds-font-size-sm)',
      opacity: disabled ? 0.5 : 1,
      cursor: disabled ? 'not-allowed' : 'text',
      transition: 'var(--ds-transition-fast)',
    };

    const clearButtonStyle: React.CSSProperties = {
      position: 'absolute',
      right: '8px',
      top: '50%',
      cursor: 'pointer',
      fontSize: '14px',
      padding: '0 4px',
    };

    // Dropdown positioned directly below the input. z-index 1050 ensures it
    // floats above modals (typically z-index 1000) in the DS stacking context.
    const dropdownStyle: React.CSSProperties = {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      marginTop: '4px',
      maxHeight: '240px',
      overflowY: 'auto',
      zIndex: 1050,
      listStyle: 'none',
      padding: '4px 0',
      margin: 0,
    };

    // Per-option style factory. The highlight follows `focusedIndex` (updated by
    // both keyboard and the retained `onMouseEnter`) via the `data-active`
    // attribute the skin reads; only non-paint sizing stays inline here.
    const optionStyle = (isDisabled?: boolean): React.CSSProperties => ({
      padding: '8px 12px',
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      opacity: isDisabled ? 0.5 : 1,
      fontSize: 'var(--ds-font-size-sm)',
      transition: 'background-color 0.15s',
    });

    const emptyStyle: React.CSSProperties = {
      padding: '8px 12px',
      textAlign: 'center',
      fontSize: 'var(--ds-font-size-sm)',
    };

    return (
      <div
        // Merge internal containerRef with forwarded ref so click-outside
        // detection and the consumer's ref both work.
        ref={(node) => {
          (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        className={containerClasses}
        style={wrapperStyle}
        data-part="root"
        data-open={isOpen || undefined}
        data-disabled={disabled || undefined}
        data-status={status || undefined}
      >
        <div style={{ position: 'relative' }} data-part="input-wrapper">
          <input
            type="text"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => handleOpenChange(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            autoFocus={autoFocus}
            style={inputStyle}
            // ARIA combobox pattern: screen readers announce this as a
            // search field with an associated popup listbox.
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            role="combobox"
            data-part="input"
          />
          {allowClear && value && !disabled && (
            <button
              type="button"
              onClick={() => handleChange('')}
              style={clearButtonStyle}
              aria-label="Clear"
              data-part="clear-button"
            >
              ✕
            </button>
          )}
        </div>

        {isOpen && (
          <ul role="listbox" style={dropdownStyle} data-part="dropdown">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={focusedIndex === index}
                  onClick={() => !option.disabled && handleSelect(option)}
                  onMouseEnter={() => setFocusedIndex(index)}
                  style={optionStyle(option.disabled)}
                  data-part="option"
                  data-active={focusedIndex === index || undefined}
                  data-disabled={option.disabled || undefined}
                >
                  {option.label ?? option.value}
                </li>
              ))
            ) : (
              <li style={emptyStyle} data-part="empty">{notFoundContent}</li>
            )}
          </ul>
        )}
      </div>
    );
  }
);

AutoComplete.displayName = 'AutoComplete.Rustic';

export default AutoComplete;
