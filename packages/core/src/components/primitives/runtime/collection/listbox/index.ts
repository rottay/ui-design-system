'use client';

/**
 * @fileoverview The listbox kernel: which option a navigation or type-ahead key
 * lands on, decided once for every selection family. Arrows resolve through
 * roving-focus, the buffer through typeahead and the active descendant through
 * the combobox kernel.
 */

import { useCallback, useEffect, useRef } from 'react';

import {
  useComboboxFoundation,
  type ComboboxFoundation,
  type ComboboxFoundationOptions,
  type ComboboxItemProps,
} from '../combobox';
import { resolveNavigationIntent, type CollectionOrientation } from '../roving-focus';
import { advanceTypeahead, type TypeaheadState } from '../typeahead';

/** Rows a PageUp or PageDown press travels. */
export const LISTBOX_PAGE_SIZE = 10;

export interface ListboxNavigationOptions {
  /** Current active row, or -1 when none is active. */
  readonly activeIndex: number;
  readonly itemCount: number;
  readonly isItemSelectable?: (index: number) => boolean;
  /** @default 'vertical' */
  readonly orientation?: CollectionOrientation;
  readonly rtl?: boolean;
  /** Arrows cycle past the edges. @default true */
  readonly wrap?: boolean;
  /** @default LISTBOX_PAGE_SIZE */
  readonly pageSize?: number;
}

function scanSelectable(
  from: number,
  direction: 1 | -1,
  itemCount: number,
  isItemSelectable: ((index: number) => boolean) | undefined,
  wrap: boolean,
): number {
  for (let step = 1; step <= itemCount; step += 1) {
    const raw = from + direction * step;
    if (!wrap && (raw < 0 || raw >= itemCount)) return -1;
    const candidate = ((raw % itemCount) + itemCount) % itemCount;
    if (!isItemSelectable || isItemSelectable(candidate)) return candidate;
  }
  return -1;
}

/**
 * The row a key moves the active option to: `null` when the key does not
 * navigate, `-1` when no row can hold the active option.
 */
export function resolveListboxTarget(key: string, options: ListboxNavigationOptions): number | null {
  const {
    activeIndex,
    itemCount,
    isItemSelectable,
    orientation = 'vertical',
    rtl = false,
    wrap = true,
    pageSize = LISTBOX_PAGE_SIZE,
  } = options;

  if (key === 'PageDown' || key === 'PageUp') {
    if (itemCount === 0) return -1;
    const direction = key === 'PageDown' ? 1 : -1;
    const origin = activeIndex < 0 ? (direction === 1 ? -1 : itemCount) : activeIndex;
    const landing = Math.min(itemCount - 1, Math.max(0, origin + direction * pageSize));
    if (!isItemSelectable || isItemSelectable(landing)) return landing;
    const onward = scanSelectable(landing, direction, itemCount, isItemSelectable, false);
    return onward >= 0 ? onward : scanSelectable(landing, direction === 1 ? -1 : 1, itemCount, isItemSelectable, false);
  }

  const intent = resolveNavigationIntent(key, { orientation, rtl });
  if (intent === null) return null;
  if (itemCount === 0) return -1;
  switch (intent) {
    case 'first':
      return scanSelectable(-1, 1, itemCount, isItemSelectable, false);
    case 'last':
      return scanSelectable(itemCount, -1, itemCount, isItemSelectable, false);
    case 'next':
      return activeIndex < 0
        ? scanSelectable(-1, 1, itemCount, isItemSelectable, false)
        : scanSelectable(activeIndex, 1, itemCount, isItemSelectable, wrap);
    case 'previous':
      return activeIndex < 0
        ? scanSelectable(itemCount, -1, itemCount, isItemSelectable, false)
        : scanSelectable(activeIndex, -1, itemCount, isItemSelectable, wrap);
  }
}

/** The modifier-free printable keys a type-ahead buffer accepts. */
export function isTypeaheadKey(
  event: { readonly key: string; readonly ctrlKey?: boolean; readonly metaKey?: boolean; readonly altKey?: boolean },
  options: { readonly allowSpace?: boolean } = {},
): boolean {
  if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) return false;
  return options.allowSpace === true || event.key !== ' ';
}

export interface ListboxTypeaheadOptions {
  readonly activeIndex: number;
  readonly itemCount: number;
  readonly isItemSelectable?: (index: number) => boolean;
  readonly getItemText: (index: number) => string | undefined;
  readonly now: number;
}

export interface ListboxTypeaheadResult {
  readonly state: TypeaheadState;
  /** The matched row, or -1 when nothing matches and the active row stays. */
  readonly index: number;
}

/**
 * APG type-ahead: a fresh character searches from the next row, a growing
 * prefix from the current one, a repeated character cycles same-initial rows,
 * and a prefix that stops matching retries its last character.
 */
export function resolveTypeaheadTarget(
  state: TypeaheadState,
  key: string,
  options: ListboxTypeaheadOptions,
): ListboxTypeaheadResult {
  const { activeIndex, itemCount, isItemSelectable, getItemText, now } = options;
  const advanced = advanceTypeahead(state, key, now);
  const prefix = advanced.prefix;
  const character = key.toLowerCase();
  const repeated = prefix.length > 1 && [...prefix].every((letter) => letter === prefix[0]);

  const find = (query: string, start: number): number => {
    for (let step = 0; step < itemCount; step += 1) {
      const index = (((start + step) % itemCount) + itemCount) % itemCount;
      if (isItemSelectable && !isItemSelectable(index)) continue;
      if ((getItemText(index) ?? '').trim().toLowerCase().startsWith(query)) return index;
    }
    return -1;
  };

  if (itemCount === 0) return { state: advanced.state, index: -1 };
  const growing = prefix.length > 1 && !repeated;
  const index = find(repeated ? character : prefix, growing ? Math.max(activeIndex, 0) : activeIndex + 1);
  if (index >= 0 || !growing) return { state: advanced.state, index };
  const retry = find(character, activeIndex + 1);
  return { state: { buffer: key, lastKeyTime: now }, index: retry };
}

export interface ListboxOptions extends ComboboxFoundationOptions {
  /** Row text for type-ahead; omit to leave printable keys to the family. */
  readonly getItemText?: (index: number) => string | undefined;
  readonly pageSize?: number;
  /**
   * Brings a keyboard-moved active row into view. Defaults to scrolling the
   * option element; a virtual list supplies its own window arithmetic.
   */
  readonly reveal?: (index: number) => void;
}

export interface ListboxKeyEvent {
  readonly key: string;
  readonly ctrlKey?: boolean;
  readonly metaKey?: boolean;
  readonly altKey?: boolean;
  preventDefault(): void;
}

export interface ListboxOptionProps extends ComboboxItemProps {
  onMouseEnter: () => void;
}

export interface Listbox extends ComboboxFoundation {
  /** Moves the active option for an arrow, edge, page or type-ahead key; true when consumed. */
  navigate: (event: ListboxKeyEvent) => boolean;
  /** Option ARIA plus pointer tracking that never scrolls the list. */
  getOptionProps: (index: number, options?: { selected?: boolean; disabled?: boolean }) => ListboxOptionProps;
}

export function useListbox(options: ListboxOptions): Listbox {
  const { getItemText, pageSize, reveal, ...comboboxOptions } = options;
  const combobox = useComboboxFoundation(comboboxOptions);
  const typeaheadRef = useRef<TypeaheadState>({ buffer: '', lastKeyTime: 0 });
  const { activeIndex, setActiveIndex, consumeKeyboardMove, getOptionId, getItemProps } = combobox;
  const { open, itemCount, isItemSelectable } = comboboxOptions;

  const navigate = useCallback(
    (event: ListboxKeyEvent): boolean => {
      const target = resolveListboxTarget(event.key, { activeIndex, itemCount, isItemSelectable, pageSize });
      if (target !== null) {
        event.preventDefault();
        if (target >= 0) setActiveIndex(target, 'keyboard');
        return true;
      }
      if (!getItemText || !isTypeaheadKey(event)) return false;
      const result = resolveTypeaheadTarget(typeaheadRef.current, event.key, {
        activeIndex,
        itemCount,
        isItemSelectable,
        getItemText,
        now: Date.now(),
      });
      typeaheadRef.current = result.state;
      event.preventDefault();
      if (result.index >= 0) setActiveIndex(result.index, 'keyboard');
      return true;
    },
    [activeIndex, itemCount, isItemSelectable, pageSize, getItemText, setActiveIndex],
  );

  useEffect(() => {
    if (!open || activeIndex < 0 || !consumeKeyboardMove()) return;
    if (reveal) {
      reveal(activeIndex);
      return;
    }
    const node = typeof document === 'undefined' ? null : document.getElementById(getOptionId(activeIndex));
    if (node && typeof node.scrollIntoView === 'function') node.scrollIntoView({ block: 'nearest' });
  }, [open, activeIndex, consumeKeyboardMove, getOptionId, reveal]);

  const getOptionProps = useCallback(
    (index: number, itemOptions: { selected?: boolean; disabled?: boolean } = {}): ListboxOptionProps => ({
      ...getItemProps(index, itemOptions),
      onMouseEnter: () => {
        if (!itemOptions.disabled) setActiveIndex(index, 'pointer');
      },
    }),
    [getItemProps, setActiveIndex],
  );

  return { ...combobox, navigate, getOptionProps };
}
