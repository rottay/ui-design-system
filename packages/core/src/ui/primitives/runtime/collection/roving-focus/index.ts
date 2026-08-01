'use client';

/**
 * @fileoverview Roving-focus kernel -- the single owner of the APG
 * roving-tabindex model for design-system collections.
 *
 * Before this owner existed the same model was hand-rolled per family, and the
 * copies had drifted into THREE incompatible reading-direction models: a key
 * -name flip (Menu, Tabs, DatePicker), a DOM probe (Tree, Segmented) and a
 * sign flip on the value step (Rate). A collection's arrow contract is not a
 * per-family opinion, so the three laws below now live here and nowhere else.
 *
 * KEY-MAPPING LAW. `resolveNavigationIntent` is the ONLY place in the design
 * system where a keyboard key becomes a direction. Arrows are mapped
 * LOGICALLY, never physically: on the horizontal axis ArrowRight is `next` in
 * LTR and `previous` in RTL. A family must never flip a key name, a step sign
 * or an index delta of its own.
 *
 * CROSS-AXIS LAW. A key off the declared orientation resolves to `null`, so
 * the family keeps it for its own semantics. Menu is the reference case: under
 * `vertical` the kernel owns Up/Down and leaves Left/Right to the submenu
 * disclosure, and under `horizontal` the axes swap.
 *
 * READING-DIRECTION LAW. Direction is captured ONCE per collection instance,
 * on first navigation, and cached -- the ContextMenu precedent, which captures
 * at open time rather than per keystroke. A family carrying its own direction
 * axis (Rate's `direction` prop) passes an explicit boolean and never reaches
 * the probe.
 *
 * SCOPE. This owner navigates a collection whose steps ARE its elements. A
 * family whose step is a VALUE rather than an element (Rate: `allowHalf`
 * moves 0.5 while five stars exist) consumes `resolveNavigationIntent` and
 * keeps its own arithmetic; wiring half-steps as ids would invent ids with no
 * element behind them. Typeahead is a separate kernel and is not modelled
 * here.
 *
 * @module Primitives/Runtime/Collection/RovingFocus
 * @package @rottay/design-system
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';

// ============================================================================
// Vocabulary
// ============================================================================

/** The axis whose arrows the collection owns. */
export type CollectionOrientation = 'horizontal' | 'vertical' | 'both';

/** A key resolved to a direction, with the reading direction already applied. */
export type NavigationIntent = 'next' | 'previous' | 'first' | 'last';

// ============================================================================
// Pure resolvers (the shared decision model)
// ============================================================================

/**
 * Resolves the reading direction of an element's context: the nearest explicit
 * `[dir]` answers first, the computed `direction` answers when no ancestor
 * declares one.
 */
export function resolveReadingDirectionIsRtl(element: HTMLElement): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return (
    element.closest<HTMLElement>('[dir]')?.dir === 'rtl' ||
    window.getComputedStyle(element).direction === 'rtl'
  );
}

/**
 * Maps a keyboard key to a logical direction for the given axis, or `null`
 * when the key belongs to the family rather than to the collection.
 */
export function resolveNavigationIntent(
  key: string,
  options: { orientation: CollectionOrientation; rtl: boolean }
): NavigationIntent | null {
  const { orientation, rtl } = options;

  switch (key) {
    case 'Home':
      return 'first';
    case 'End':
      return 'last';
    case 'ArrowDown':
      return orientation === 'horizontal' ? null : 'next';
    case 'ArrowUp':
      return orientation === 'horizontal' ? null : 'previous';
    case 'ArrowRight':
      if (orientation === 'vertical') return null;
      return rtl ? 'previous' : 'next';
    case 'ArrowLeft':
      if (orientation === 'vertical') return null;
      return rtl ? 'next' : 'previous';
    default:
      return null;
  }
}

/**
 * Resolves the destination position for an intent. Without `wrap` the edges
 * hold instead of cycling.
 */
export function resolveNavigationTarget(
  intent: NavigationIntent,
  options: { index: number; length: number; wrap: boolean }
): number {
  const { index, length, wrap } = options;

  if (length === 0) {
    return -1;
  }

  switch (intent) {
    case 'first':
      return 0;
    case 'last':
      return length - 1;
    case 'next': {
      const next = index + 1;
      if (next < length) return next;
      return wrap ? 0 : index;
    }
    case 'previous': {
      const previous = index - 1;
      if (previous >= 0) return previous;
      return wrap ? length - 1 : index;
    }
  }
}

/**
 * FOCUS-STABILITY LAW. When the active id becomes unreachable -- disabled, or
 * unmounted with the branch it lived in -- the tab stop lands beside where the
 * user actually was. The anchor is the previous ACTIVE ID inside the PREVIOUS
 * collection, never a position inside the new one: a position means a
 * different row once the list has changed (collapsing a submenu shifts every
 * index below it), which would jump the user past the branch they left.
 */
function findNearestReachableId(
  previousIds: readonly string[],
  anchorId: string | undefined,
  isReachable: (id: string) => boolean
): string | undefined {
  if (anchorId === undefined) {
    return undefined;
  }

  const anchor = previousIds.indexOf(anchorId);
  if (anchor === -1) {
    return undefined;
  }

  for (let distance = 0; distance < previousIds.length; distance += 1) {
    const forward = previousIds[anchor + distance];
    if (forward !== undefined && isReachable(forward)) {
      return forward;
    }

    const backward = previousIds[anchor - distance];
    if (backward !== undefined && isReachable(backward)) {
      return backward;
    }
  }

  return undefined;
}

// ============================================================================
// Hook
// ============================================================================

export interface RovingFocusOptions {
  /**
   * Item ids in SEMANTIC order -- the order the arrows walk, which the family
   * derives from its own model rather than from a DOM query.
   */
  ids: readonly string[];

  /** The axis whose arrows the collection owns. */
  orientation: CollectionOrientation;

  /** Cycle past the edges. */
  wrap?: boolean;

  /**
   * Reading direction. `'auto'` probes the DOM context once per instance; an
   * explicit boolean belongs to families that own a direction axis.
   */
  rtl?: boolean | 'auto';

  /** Ids that render but are never focusable and never a target. */
  disabledIds?: Iterable<string>;

  /** Uncontrolled seed for the tab stop. */
  initialActiveId?: string;

  /**
   * Controlled tab stop, for families whose active item is derived state (a
   * selection, a value). The kernel then stores nothing and only resolves.
   */
  activeId?: string;

  /** Fired when navigation moves the tab stop. Focus has already moved. */
  onActiveChange?: (id: string) => void;
}

export interface RovingFocusItemProps {
  ref: (node: HTMLElement | null) => void;
  tabIndex: 0 | -1;
  onKeyDown: (event: ReactKeyboardEvent<HTMLElement>) => void;
  onFocus: () => void;
}

export interface RovingFocus {
  /** The single tabbable id, or `undefined` when nothing is focusable. */
  active: string | undefined;
  setActive: (id: string, options?: { focus?: boolean }) => void;
  getItemProps: (id: string) => RovingFocusItemProps;

  /**
   * The collection's captured reading direction. A family composing CROSS-axis
   * semantics on top of the collection (Menu's submenu disclosure) must ask
   * here, so one capture answers for the whole instance instead of the family
   * opening a second direction model.
   */
  resolveIsRtl: (element: HTMLElement) => boolean;
}

/**
 * Gives a collection exactly one tab stop and the shared arrow contract.
 *
 * @example
 * ```tsx
 * const roving = useRovingFocus({ ids, orientation: 'vertical', disabledIds });
 *
 * <li {...roving.getItemProps(id)} role="menuitem" />
 * ```
 */
export function useRovingFocus(options: RovingFocusOptions): RovingFocus {
  const {
    ids,
    orientation,
    wrap = true,
    rtl = 'auto',
    disabledIds,
    initialActiveId,
    activeId,
    onActiveChange,
  } = options;

  const isControlled = activeId !== undefined;
  const [internalActiveId, setInternalActiveId] = useState<string | undefined>(initialActiveId);

  /** Registered elements, the only channel through which the kernel calls focus(). */
  const itemNodes = useRef(new Map<string, HTMLElement>());

  /** Reading direction, captured once per instance (READING-DIRECTION LAW). */
  const readingDirectionIsRtl = useRef<boolean | null>(null);

  /** Anchors for the focus-stability rule (identity, not position). */
  const lastActiveId = useRef<string | undefined>(undefined);
  const lastIds = useRef<readonly string[]>(ids);

  const disabled: ReadonlySet<string> = new Set(disabledIds ?? []);
  const enabledIds = ids.filter((id) => !disabled.has(id));

  const isReachable = (id: string): boolean => !disabled.has(id) && ids.includes(id);

  const requestedId = isControlled ? activeId : internalActiveId;
  const active =
    requestedId !== undefined && isReachable(requestedId)
      ? requestedId
      : // A collection with no history has no neighbourhood to preserve, so it
        // opens on its first enabled id.
        findNearestReachableId(lastIds.current, lastActiveId.current, isReachable) ?? enabledIds[0];

  useEffect(() => {
    lastActiveId.current = active;
    lastIds.current = ids;
  });

  const resolveIsRtl = useCallback(
    (element: HTMLElement): boolean => {
      if (rtl !== 'auto') return rtl;
      if (readingDirectionIsRtl.current === null) {
        readingDirectionIsRtl.current = resolveReadingDirectionIsRtl(element);
      }
      return readingDirectionIsRtl.current;
    },
    [rtl]
  );

  const setActive = useCallback(
    (id: string, setOptions?: { focus?: boolean }) => {
      if (setOptions?.focus) {
        itemNodes.current.get(id)?.focus();
      }
      if (!isControlled) {
        setInternalActiveId(id);
      }
      onActiveChange?.(id);
    },
    [isControlled, onActiveChange]
  );

  const getItemProps = (id: string): RovingFocusItemProps => ({
    ref: (node) => {
      if (node) {
        itemNodes.current.set(id, node);
      } else {
        itemNodes.current.delete(id);
      }
    },

    tabIndex: id === active ? 0 : -1,

    // Focus is a consequence, not an intent: it moves the tab stop but never
    // notifies, so a family cannot mistake "the user tabbed in" for "the user
    // navigated".
    onFocus: () => {
      if (!isControlled) {
        setInternalActiveId(id);
      }
    },

    onKeyDown: (event) => {
      // A family handler that already claimed the key wins.
      if (event.defaultPrevented) return;

      const position = enabledIds.indexOf(id);
      if (position === -1) return;

      const intent = resolveNavigationIntent(event.key, {
        orientation,
        rtl: resolveIsRtl(event.currentTarget),
      });
      if (intent === null) return;

      event.preventDefault();

      const targetId =
        enabledIds[
          resolveNavigationTarget(intent, {
            index: position,
            length: enabledIds.length,
            wrap,
          })
        ];
      if (targetId === undefined || targetId === id) return;

      setActive(targetId, { focus: true });
    },
  });

  return { active, setActive, getItemProps, resolveIsRtl };
}
