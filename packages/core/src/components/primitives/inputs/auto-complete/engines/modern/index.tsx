'use client';

/**
 * @fileoverview AutoComplete Modern engine -- custom listbox-backed input painted by the Rottay skin.
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

import React, { useState, useRef, useCallback, useMemo, useId } from 'react';
import { arrayValueAt } from '@/foundation/kernel/collections';
import { partAttributes, resolveSubmitIntent, useFieldAction, useInteractionState } from '@/foundation/behavior';
import type { AutoCompleteProps, AutoCompleteOption } from '../../contracts';
import {
  FieldOverlayPanel,
  useFieldOverlay,
} from '../../../../runtime/overlay/field-overlay';
import { AUTOCOMPLETE_DEFAULTS } from '../../contracts';
import { toCanonicalSize } from '../../../../../../foundation/contracts/kernel/common';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { ActionCloseIcon } from '@/graphics/icons/semantic/generated/roles/action-close';
import { LoadingIndicator } from '../../../../foundation/loading-indicator';
import { useListbox } from '../../../../runtime/collection/listbox';

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

function ClearAction({ label, onClear }: { label: string; onClear: () => void }) {
  const action = useFieldAction();
  return (
    <button
      type="button"
      onClick={onClear}
      aria-label={label}
      {...partAttributes('clear-button', action.state)}
      onPointerEnter={action.handlers.onPointerEnter}
      onPointerLeave={action.handlers.onPointerLeave}
      onPointerDown={action.handlers.onPointerDown}
      onPointerUp={action.handlers.onPointerUp}
      onPointerCancel={action.handlers.onPointerCancel}
      onFocus={action.handlers.onFocus}
      onBlur={action.handlers.onBlur}
      onKeyDown={action.handlers.onKeyDown}
      onKeyUp={action.handlers.onKeyUp}
    >
      <ActionCloseIcon decorative size={12} />
    </button>
  );
}

/**
 * Scope class the portaled panel carries so the skin can address it and its
 * subtree at the SAME specificity they had as descendants of the field root.
 */
const PANEL_SCOPE = 'ds-auto-complete ds-auto-complete--modern ds-auto-complete-panel';

/**
 * Modern Rottay implementation of the AutoComplete input.
 *
 * Renders a plain `<input>` with a skin-painted dropdown list. Supports both
 * controlled (`value` + `onChange`) and uncontrolled (`defaultValue`) modes.
 * Keyboard navigation (Arrow/Home/End/PageUp/PageDown over enabled options,
 * Enter, Escape) and click-outside dismissal are handled internally, keeping
 * parity with the Classic engine's UX. All paint and per-size geometry live in
 * the modern skin (`skin/auto-complete`) keyed on `data-part`/`data-size`/
 * `data-status`; no inline styles remain on any part (the public `style`
 * escape hatch stays on the root, and a numeric `popupMatchSelectWidth` is
 * sanctioned instance geometry on the dropdown).
 *
 * @param props - Standardized AutoCompleteProps from the DS type contract.
 * @param ref   - Forwarded ref attached to the outer wrapper div.
 * @returns A Rottay-skinned autocomplete input with dropdown suggestion list.
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
      id,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      'aria-describedby': ariaDescribedBy,
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
      loading,
      loadingText: loadingTextProp,
      popupClassName,
      popupMatchSelectWidth = AUTOCOMPLETE_DEFAULTS.popupMatchSelectWidth,
      className,
      style,
    } = props;

    // Explicit prop wins; otherwise localized copy with the historical
    // English default as the floor.
    const notFoundContent = notFoundContentProp ?? tOr('autocomplete.not_found', 'No results');
    const loadingText = loadingTextProp ?? tOr('autocomplete.loading', 'Loading suggestions...');
    // Accessible name (axe `label` critical, Mentions K4-D idiom). The
    // generated floor is exactly that -- a floor for a BARE control. It used
    // to be unconditional, which inverted the precedence every labelling
    // mechanism relies on: a hard-coded `aria-label` outranks a visible
    // `<label htmlFor>`, so the pointed-to control announced "Autocomplete"
    // (or its placeholder) instead of the label the user could read, and the
    // documented FormField escape hatch could not work at all -- the contract
    // had no `id` to aim `htmlFor` at either.
    // An `id` counts as consumer-owned naming: it is the hook an external
    // `<label htmlFor>` (FormField's included) resolves against, and the
    // engine cannot see that label from here. Supplying one is the opt-out.
    const consumerOwnsName = Boolean(ariaLabelledBy || ariaLabel || id);
    const inputLabel = consumerOwnsName
      ? ariaLabel
      : (placeholder ?? tOr('autocomplete.input_label', 'Autocomplete'));

    // The skin keys per-size geometry on `data-size` with the canonical
    // 'sm' | 'md' | 'lg' vocabulary; toCanonicalSize resolves either spelling.
    const size = toCanonicalSize(sizeProp);

    // Two pieces of internal state mirror what Ant Design manages automatically
    // in the Classic engine: the text value and dropdown visibility. The
    // active option and its ARIA belong to the combobox kernel below.
    const [internalValue, setInternalValue] = useState(defaultValue);
    const [internalOpen, setInternalOpen] = useState(defaultOpen ?? false);

    // Controlled vs uncontrolled detection -- when the consumer passes `value`
    // we defer to it; otherwise we own the value in local state.
    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : internalValue;
    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

    const containerRef = useRef<HTMLDivElement>(null);
    // The kernel needs the field root as state (a ref never re-renders when
    // it lands), so the container publishes to both.
    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    // APG combobox wiring: the input owns focus permanently; the active
    // option is announced via aria-activedescendant against the listbox id.
    const listboxId = useId();

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

    // Disabled suggestions render but never hold the active descendant.
    const isItemSelectable = useCallback(
      (index: number) => !arrayValueAt(filteredOptions, index)?.disabled,
      [filteredOptions]
    );

    // The listbox kernel owns the active descendant, keyboard travel, the panel posture and their ARIA.
    const listbox = useListbox({
      open: isOpen,
      itemCount: filteredOptions.length,
      isItemSelectable,
      loading,
      query: value,
      listboxId,
    });
    const { activeIndex, listState, setActiveIndex } = listbox;
    const field = useInteractionState({ disabled });

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
      setActiveIndex(-1);
    }, [isControlled, onChange, onSearch, handleOpenChange, setActiveIndex]);

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
      setActiveIndex(-1);
    }, [isControlled, onChange, onSelect, handleOpenChange, setActiveIndex]);

    /**
     * Commits an option and puts DOM focus back on the input. The pointer path
     * needs both halves and they fight each other: the option button took
     * focus on mousedown, so returning it fires a real `focus` event -- and
     * the input opens the panel on focus. Selecting therefore re-opened the
     * list it had just closed. The flag is set only around the programmatic
     * restore (focus() dispatches synchronously), so a genuine user focus is
     * never swallowed; the guard also skips the call entirely when the input
     * already holds focus, which is the keyboard-Enter path.
     */
    const restoringFocusRef = useRef(false);
    const selectAndRestoreFocus = useCallback((option: AutoCompleteOption) => {
      handleSelect(option);
      const input = inputRef.current;
      if (!input || document.activeElement === input) return;
      restoringFocusRef.current = true;
      input.focus();
      restoringFocusRef.current = false;
    }, [handleSelect]);

    const handleInputFocus = useCallback(() => {
      if (restoringFocusRef.current) return;
      handleOpenChange(true);
    }, [handleOpenChange]);

    const dismissPanel = useCallback(() => {
      handleOpenChange(false);
    }, [handleOpenChange]);

    // One overlay contract, on the canonical portal path: the panel leaves the
    // field subtree through `FieldOverlayPanel`, so it cannot be clipped by an
    // ancestor's overflow. That buys the canonical dropdown band, the single
    // Escape router (top-most layer only) and the shared capture-phase
    // outside-pointer watcher, which replaces this engine's private
    // `mousedown` listener. The skin selects the panel from its own root-level
    // class instead of by descendancy.
    const overlay = useFieldOverlay({
      kind: 'dropdown',
      open: isOpen,
      anchor: anchorEl,
      // The panel matches the field width by default, which `inset-inline: 0`
      // used to give it for free in-tree; `popupMatchSelectWidth={false}`
      // switches to content width bounded by the family dial, so the anchor
      // is then only a floor.
      anchorWidth: popupMatchSelectWidth === false ? 'min' : 'match',
      placement: 'bottom-start',
      offset: 4,
      flip: true,
      modal: true,
      lockScroll: false,
      restoreFocus: false,
      onDismiss: dismissPanel,
      // Escape stays with this engine's own key handler: it closes AND returns
      // focus to the trigger, a component-scoped contract the shared router
      // cannot express. The layer still declares `modal: true`, so the router
      // keeps a lower dialog from claiming the same press.
      dismissOnEscape: false,
      dismissOnOutsidePointer: true,
    });

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          handleOpenChange(true);
        }
        return;
      }

      if (e.key === 'Enter') {
        // An IME confirming a candidate never commits; with no active option Enter belongs to the form.
        if (resolveSubmitIntent(e) !== 'submit') return;
        const focusedOption = activeIndex >= 0 ? arrayValueAt(filteredOptions, activeIndex) : undefined;
        if (focusedOption && !focusedOption.disabled) {
          e.preventDefault();
          handleSelect(focusedOption);
        }
        return;
      }
      if (e.key === 'Escape') {
        // An open popup consumes its own dismissal and returns focus to the input.
        e.preventDefault();
        e.stopPropagation();
        handleOpenChange(false);
        inputRef.current?.focus();
        return;
      }
      listbox.navigate(e);
    };

    // The kernel bags are read into explicit attributes: the inline-paint
    // ratchet fails closed on a spread of an unresolvable call result, and
    // these getters are aria/id wiring the kernel's own zero-pinned counter
    // already polices.
    const inputProps = listbox.getInputProps();
    const listboxProps = listbox.getListboxProps();

    return (
      <div
        // Merge the internal containerRef with the forwarded ref so both
        // the click-outside effect and the consumer can reference this node.
        ref={(node) => {
          (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          setAnchorEl(node);
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        className={`ds-auto-complete ds-auto-complete--modern ${className || ''}`}
        style={style}
        data-part="root"
        data-size={size}
        data-status={status || undefined}
      >
        <div data-part="input-wrapper">
          <input
            ref={inputRef}
            id={id}
            type="text"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={(event) => {
              field.handlers.onFocus(event);
              handleInputFocus();
            }}
            onBlur={field.handlers.onBlur}
            onPointerEnter={field.handlers.onPointerEnter}
            onPointerLeave={field.handlers.onPointerLeave}
            onPointerDown={field.handlers.onPointerDown}
            onPointerUp={field.handlers.onPointerUp}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            autoFocus={autoFocus}
            {...partAttributes('input', field.state)}
            data-open={isOpen || undefined}
            data-disabled={disabled || undefined}
            aria-label={inputLabel}
            aria-labelledby={ariaLabelledBy}
            aria-describedby={ariaDescribedBy}
            aria-invalid={status === 'error' || undefined}
            role={inputProps.role}
            aria-haspopup={inputProps['aria-haspopup']}
            aria-expanded={inputProps['aria-expanded']}
            aria-controls={inputProps['aria-controls']}
            aria-activedescendant={inputProps['aria-activedescendant']}
            aria-autocomplete={inputProps['aria-autocomplete']}
          />
          {/* Clear button only visible when there is a non-empty value and the input is interactive.
              Positioning/paint are skin-owned (the old `right-2` utility was
              physical and broke RTL). Governed close icon, never a text glyph.
              Clearing returns focus to the input: the button unmounts on the
              same click, and the default would strand focus on <body>. */}
          {allowClear && value && !disabled && (
            <ClearAction
              label={tOr('autocomplete.clear', 'Clear')}
              onClear={() => {
                handleChange('');
                inputRef.current?.focus();
              }}
            />
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
          <FieldOverlayPanel overlay={overlay}>
          <ul
            {...overlay.panelProps}
            data-part="dropdown"
            role={listboxProps.role}
            id={listboxProps.id}
            aria-busy={listboxProps['aria-busy']}
            aria-multiselectable={listboxProps['aria-multiselectable']}
            className={`${PANEL_SCOPE} ${popupClassName || ''}`.trim()}
            data-match-width={popupMatchSelectWidth === false ? 'false' : typeof popupMatchSelectWidth === 'number' ? 'fixed' : undefined}
            style={{
              ...overlay.panelProps.style,
              ...(typeof popupMatchSelectWidth === 'number'
                ? ({ '--ds-auto-complete-dropdown-inline-size': `${popupMatchSelectWidth}px` } as React.CSSProperties)
                : null),
            }}
          >
            {listState === 'loading' ? (
              /* Async posture, same listbox-child contract as the empty one.
                 It replaces the not-found copy rather than stacking above it:
                 a list still awaiting results must not claim it found nothing.
                 Suggestions already loaded keep rendering (the kernel ranks
                 results above loading), so a refresh never blanks the list. */
              <li data-part="loading-state" role="option" aria-disabled="true">
                <LoadingIndicator size="sm" />
                <span data-part="loading-state-label">{loadingText}</span>
              </li>
            ) : listState === 'empty' ? (
              /* Empty posture sits inside the listbox: it must carry the
                 option role (aria-required-children) and read as disabled
                 (Mentions idiom) -- a role-less <li> breaks the listbox
                 contract for AT. */
              <li data-part="empty" role="option" aria-disabled="true">
                {notFoundContent}
              </li>
            ) : (
              filteredOptions.map((option, index) => {
                const itemProps = listbox.getOptionProps(index, {
                  selected: option.value === value,
                  disabled: option.disabled || disabled,
                });
                return (
                <li key={option.value} role="none">
                  <button
                    type="button"
                    // A disabled combobox has inert options even under a controlled `open`.
                    disabled={option.disabled || disabled}
                    tabIndex={-1}
                    // Selection unmounts the button the pointer focused, so focus returns to the input.
                    onClick={() => selectAndRestoreFocus(option)}
                    onMouseEnter={itemProps.onMouseEnter}
                    data-part="option"
                    data-disabled={option.disabled || disabled || undefined}
                    title={typeof option.label === 'string' ? option.label : option.value}
                    role={itemProps.role}
                    id={itemProps.id}
                    aria-selected={itemProps['aria-selected']}
                    aria-disabled={itemProps['aria-disabled']}
                    data-active={itemProps['data-active']}
                  >
                    {/* Governed label slot (Cascader/Mentions parity): the
                        stable addressable part for the option's primary
                        content; truncation lives on it in the skin. */}
                    <span data-part="option-label">{option.label ?? option.value}</span>
                  </button>
                </li>
                );
              })
            )}
          </ul>
          </FieldOverlayPanel>
        )}
      </div>
    );
  }
);

AutoComplete.displayName = 'AutoComplete.Modern';

export default AutoComplete;
