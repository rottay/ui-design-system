'use client';

/**
 * @fileoverview Combobox kernel -- the shared state machine and ARIA wiring
 * behind the primitive tier's listbox-backed inputs.
 *
 * @remarks
 * The kernel owns the three things that were being re-derived (and drifting)
 * per family: the panel's list state, which item is the active descendant, and
 * the ARIA that must agree with both. It does NOT own the value, the query, or
 * the markup: those are the component's public contract.
 *
 * Navigation is expressed as a single wrapping scan over selectable items
 * ({@link ComboboxFoundation.nextSelectableFrom}), which subsumes arrow,
 * Home and End movement for a flat listbox and for one built over mixed rows
 * (group headers interleaved with options). Paged movement stays with the
 * component: "ten rows down" legitimately counts rendered rows in one family
 * and selectable rows in another, and collapsing that would change behavior.
 *
 * @module Runtime/Collection/Combobox
 * @package @rottay/design-system
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/**
 * Posture of the popup list.
 *
 * `idle` is the closed panel -- a closed list has no state to announce. The
 * async posture WINS over the empty posture: a list that is still loading must
 * never claim it found nothing.
 */
export type ComboboxListState = 'idle' | 'loading' | 'empty' | 'results';

/** Inputs the panel posture is derived from. */
export interface ComboboxListStateInput {
  open: boolean;
  loading?: boolean;
  itemCount: number;
}

/**
 * Resolves the panel posture. The precedence is the whole point:
 *
 * 1. A closed panel has no state to announce.
 * 2. Rows that exist are shown, loading or not -- an in-flight refresh must
 *    not blank out results the user is already reading.
 * 3. With no rows, `loading` outranks `empty`, so a panel awaiting results
 *    never renders a not-found copy it would have to take back a moment later.
 *
 * Exported on its own for owners that need the posture without the rest of
 * the kernel -- a listbox that already owns its navigation still has to answer
 * "loading or empty?" the same way this hook does.
 */
export function resolveComboboxListState({
  open,
  loading = false,
  itemCount,
}: ComboboxListStateInput): ComboboxListState {
  if (!open) return 'idle';
  if (itemCount > 0) return 'results';
  return loading ? 'loading' : 'empty';
}

/** What moved the active descendant. Only keyboard moves may scroll the list. */
export type ComboboxMoveSource = 'keyboard' | 'pointer';

export interface ComboboxFoundationOptions {
  /** Whether the popup list is open. Owned by the component. */
  open: boolean;
  /** Number of rendered rows the list addresses by index. */
  itemCount: number;
  /**
   * Whether the row at `index` can hold the active descendant. Defaults to
   * every row. Group headers and disabled options answer `false`.
   */
  isItemSelectable?: (index: number) => boolean;
  /** Async posture. Wins over the empty posture. */
  loading?: boolean;
  /** Current query text, re-exposed on the returned state for consumers. */
  query?: string;
  /** Id of the listbox element; the value `aria-controls` points at. */
  listboxId: string;
  /**
   * Id root for per-option ids, when options are not children of the element
   * that carries `listboxId`. Defaults to `listboxId`.
   */
  optionIdPrefix?: string;
  /** Stamps `aria-multiselectable` on the listbox. */
  multiselectable?: boolean;
}

/** ARIA emitted on an element that owns combobox semantics. */
export interface ComboboxAriaProps {
  role: 'combobox';
  'aria-haspopup': 'listbox';
  'aria-expanded': boolean;
  'aria-controls': string | undefined;
  'aria-activedescendant': string | undefined;
  'aria-autocomplete'?: 'list';
}

export interface ComboboxListboxProps {
  role: 'listbox';
  id: string;
  'aria-busy': true | undefined;
  'aria-multiselectable': true | undefined;
}

export interface ComboboxItemProps {
  role: 'option';
  id: string;
  'aria-selected': boolean;
  'aria-disabled'?: true;
  'data-active': true | undefined;
}

export interface ComboboxFoundation {
  open: boolean;
  query: string | undefined;
  listState: ComboboxListState;
  /** Index of the active descendant, or -1 when none is active. */
  activeIndex: number;
  /** Element id of the active descendant, or undefined when none is. */
  activeId: string | undefined;
  /** Rendered indices that can hold the active descendant, in order. */
  selectableIndices: number[];
  /** Moves the active descendant. `source` gates scroll-into-view. */
  setActiveIndex: (index: number, source?: ComboboxMoveSource) => void;
  /**
   * Reports whether the pending active-descendant move came from the keyboard,
   * and clears the marker. Guard it LAST so a move that is not acted upon
   * (a closed panel, no active row) survives to the next render.
   */
  consumeKeyboardMove: () => boolean;
  /**
   * First selectable index scanning in `direction` from `from`, wrapping at
   * both ends; -1 when nothing is selectable. `from < 0` scans from the first
   * row downward and from the last row upward, so opening a fresh list with
   * ArrowUp lands on the LAST selectable row.
   */
  nextSelectableFrom: (from: number, direction: 1 | -1) => number;
  /** Id of the option at `index`, whether or not it is active. */
  getOptionId: (index: number) => string;
  getTriggerProps: () => ComboboxAriaProps;
  getInputProps: () => ComboboxAriaProps;
  getListboxProps: () => ComboboxListboxProps;
  /**
   * Active descendant and selected value are independent APG concepts.
   * Omitting `selected` therefore means false, never "currently active".
   */
  getItemProps: (
    index: number,
    options?: { selected?: boolean; disabled?: boolean }
  ) => ComboboxItemProps;
}

/**
 * Shared combobox state machine and ARIA wiring.
 *
 * @example
 * ```tsx
 * const combobox = useComboboxFoundation({
 *   open: isOpen,
 *   itemCount: filteredOptions.length,
 *   isItemSelectable: (i) => !filteredOptions[i]?.disabled,
 *   loading,
 *   listboxId,
 * });
 *
 * <input {...combobox.getInputProps()} />
 * <ul {...combobox.getListboxProps()}>
 *   {filteredOptions.map((option, index) => (
 *     <li key={option.value} {...combobox.getItemProps(index)}>{option.label}</li>
 *   ))}
 * </ul>
 * ```
 */
export function useComboboxFoundation(options: ComboboxFoundationOptions): ComboboxFoundation {
  const {
    open,
    itemCount,
    isItemSelectable,
    loading = false,
    query,
    listboxId,
    optionIdPrefix = listboxId,
    multiselectable = false,
  } = options;

  const [activeIndex, setActiveIndexState] = useState(-1);
  const keyboardMoveRef = useRef(false);

  const selectableIndices = useMemo(() => {
    const indices: number[] = [];
    for (let index = 0; index < itemCount; index += 1) {
      if (!isItemSelectable || isItemSelectable(index)) indices.push(index);
    }
    return indices;
  }, [itemCount, isItemSelectable]);

  const setActiveIndex = useCallback(
    (index: number, source: ComboboxMoveSource = 'pointer') => {
      const reachable =
        index === -1 ||
        (index >= 0 && index < itemCount && (!isItemSelectable || isItemSelectable(index)));
      keyboardMoveRef.current = reachable && index >= 0 && source === 'keyboard';
      setActiveIndexState(reachable ? index : -1);
    },
    [itemCount, isItemSelectable]
  );

  // A shrinking list OR a row becoming disabled can strand the active
  // descendant on an unreachable option. Reconcile both changes.
  useEffect(() => {
    if (
      activeIndex >= itemCount ||
      (activeIndex >= 0 && isItemSelectable && !isItemSelectable(activeIndex))
    ) {
      setActiveIndex(-1);
    }
  }, [itemCount, activeIndex, isItemSelectable, setActiveIndex]);

  const consumeKeyboardMove = useCallback((): boolean => {
    if (!keyboardMoveRef.current) return false;
    keyboardMoveRef.current = false;
    return true;
  }, []);

  const nextSelectableFrom = useCallback(
    (from: number, direction: 1 | -1): number => {
      if (itemCount === 0) return -1;
      const start = from < 0 ? (direction === 1 ? -1 : itemCount) : from;
      for (let step = 1; step <= itemCount; step += 1) {
        const candidate = (start + direction * step + itemCount * step) % itemCount;
        if (!isItemSelectable || isItemSelectable(candidate)) return candidate;
      }
      return -1;
    },
    [itemCount, isItemSelectable]
  );

  const getOptionId = useCallback(
    (index: number): string => `${optionIdPrefix}-option-${index}`,
    [optionIdPrefix]
  );

  const listState = resolveComboboxListState({ open, loading, itemCount });

  const activeId = open && activeIndex >= 0 ? getOptionId(activeIndex) : undefined;

  const ariaProps = useCallback(
    (): ComboboxAriaProps => ({
      role: 'combobox',
      'aria-haspopup': 'listbox',
      'aria-expanded': open,
      'aria-controls': open ? listboxId : undefined,
      'aria-activedescendant': activeId,
    }),
    [open, listboxId, activeId]
  );

  const getTriggerProps = ariaProps;

  const getInputProps = useCallback(
    (): ComboboxAriaProps => ({ ...ariaProps(), 'aria-autocomplete': 'list' }),
    [ariaProps]
  );

  const getListboxProps = useCallback(
    (): ComboboxListboxProps => ({
      role: 'listbox',
      id: listboxId,
      'aria-busy': loading || undefined,
      'aria-multiselectable': multiselectable || undefined,
    }),
    [listboxId, loading, multiselectable]
  );

  const getItemProps = useCallback(
    (
      index: number,
      itemOptions: { selected?: boolean; disabled?: boolean } = {}
    ): ComboboxItemProps => ({
      role: 'option',
      id: getOptionId(index),
      'aria-selected': itemOptions.selected ?? false,
      'aria-disabled': itemOptions.disabled || undefined,
      'data-active': activeIndex === index || undefined,
    }),
    [getOptionId, activeIndex]
  );

  return {
    open,
    query,
    listState,
    activeIndex,
    activeId,
    selectableIndices,
    setActiveIndex,
    consumeKeyboardMove,
    nextSelectableFrom,
    getOptionId,
    getTriggerProps,
    getInputProps,
    getListboxProps,
    getItemProps,
  };
}
