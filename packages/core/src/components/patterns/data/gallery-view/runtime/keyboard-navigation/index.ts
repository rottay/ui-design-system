'use client';

/**
 * @fileoverview Keyboard interaction for PatternGalleryView: roving tabindex
 * across cards (active whenever cards are focusable, i.e. `onItemClick` or
 * `selectable`), plus an opt-in `j`/`k`/`x`/`enter` scoped shortcut set
 * (WO-CRA-03 step 3).
 */

import { useId } from 'react';
import { useRovingTabindex } from '../../../../../../infrastructure/runtime/application/accessibility';
import type { UseRovingTabindexResult } from '../../../../../../infrastructure/runtime/application/accessibility';
import { useGlobalShortcut, useHasShortcutProvider } from '../../../../../../infrastructure/runtime/application/interaction/shortcuts';

export interface UseGalleryKeyboardNavOptions {
  /** Number of cards currently rendered. */
  itemCount: number;
  /** Whether cards are focusable at all (mirrors the existing `onItemClick || selectable` gate). */
  focusable: boolean;
  /** Opt-in j/k/x/enter shortcuts (WO-CRA-03 step 3). Default false -- never registered unless explicitly turned on. */
  collectionShortcuts: boolean;
  /** Called for the active card on Enter (native), `enter` (shortcut mode), or roving tabindex's own onSelect. Omit to disable "open". */
  onOpen?: (index: number) => void;
}

export interface UseGalleryKeyboardNavResult {
  roving: UseRovingTabindexResult;
  /**
   * True only when `collectionShortcuts` was requested AND a
   * `<ShortcutProvider>` ancestor is actually mounted. Gates whether the
   * caller should render `<ShortcutScope>`/`<GalleryCollectionShortcuts>` at
   * all -- `useGlobalShortcut`/`useShortcutScope` throw without a provider,
   * so this opt-in feature must degrade to inert rather than crash an app
   * that has not adopted ShortcutProvider.
   */
  shortcutsActive: boolean;
  /** Stable per-gallery-instance id: pass to `<ShortcutScope id={scopeId}>` and `<GalleryCollectionShortcuts scopeId={scopeId}>`. */
  scopeId: string;
}

/**
 * Roving tabindex is unconditional (a straight correctness fix over the
 * previous "every card is tabIndex 0" state -- see PatternGalleryView).
 * `collectionShortcuts` is opt-in and additionally gated on provider
 * presence; see `shortcutsActive`.
 */
export function useGalleryKeyboardNav(options: UseGalleryKeyboardNavOptions): UseGalleryKeyboardNavResult {
  const { itemCount, focusable, collectionShortcuts, onOpen } = options;

  const roving = useRovingTabindex({
    itemCount: focusable ? itemCount : 0,
    onSelect: onOpen,
  });

  // Safe to call unconditionally -- never throws (see useHasShortcutProvider).
  const hasProvider = useHasShortcutProvider();
  // Safe to call unconditionally -- useId never depends on a provider.
  const scopeId = useId();

  return {
    roving,
    shortcutsActive: collectionShortcuts && hasProvider,
    scopeId,
  };
}

// ---------------------------------------------------------------------------
// GalleryCollectionShortcuts -- the actual registration, isolated
// ---------------------------------------------------------------------------

export interface GalleryCollectionShortcutsProps {
  /** Must match the `id` passed to the wrapping `<ShortcutScope>`. */
  scopeId: string;
  onNext: () => void;
  onPrevious: () => void;
  onOpen?: () => void;
  onToggleSelect?: () => void;
}

/**
 * Registers the scoped j/k/x/enter shortcuts. The PARENT (PatternGalleryView)
 * only ever mounts this inside `<ShortcutScope id={scopeId}>`, and only when
 * `shortcutsActive` (from `useGalleryKeyboardNav`) is true -- so it is always
 * safe to call `useGlobalShortcut` unconditionally in here; a provider is
 * guaranteed present by the time this mounts.
 *
 * Runtime constraint: j/k/x/enter are single, UNMODIFIED keys, gated to fire
 * only while focus is within this gallery's own `<ShortcutScope>` container
 * (or, with no other scope focused, while this is the most-recently-mounted
 * one) -- never globally (see `ShortcutDefinition.scope`). Editable-element
 * suppression is inherited for free from the shared ShortcutProvider
 * registry: none of these fire while typing in an input/textarea/
 * contentEditable region anywhere on the page (e.g. an inline-rename field
 * inside a custom `renderCard`).
 *
 * Known, mode-dependent a11y tension (documented rather than silently
 * assumed away): NVDA/JAWS browse-mode quicknav uses bare `k` for "next
 * link" and bare `x` for "next checkbox". These do not reach the page as DOM
 * keydown events while the screen reader is in browse mode (browse mode
 * intercepts them before dispatch), and this scope is only active while
 * focus is already inside an interactive, roving-tabindex region -- a state
 * in which most screen readers are already in forms/application mode, where
 * keys pass through to the page and browse-mode quicknav is not
 * concurrently active. This is not a guarantee for every screen reader/
 * settings combination; it is flagged here for a11y review, not assumed safe.
 */
export function GalleryCollectionShortcuts({
  scopeId,
  onNext,
  onPrevious,
  onOpen,
  onToggleSelect,
}: GalleryCollectionShortcutsProps): null {
  // Four unconditional hook calls -- availability is expressed through
  // `when`, never by skipping a registration, so the Rules of Hooks hold
  // even if onToggleSelect/onOpen become defined or undefined across renders.
  useGlobalShortcut({ key: 'j', handler: onNext, description: 'Next item', category: 'Collection', scope: scopeId });
  useGlobalShortcut({ key: 'k', handler: onPrevious, description: 'Previous item', category: 'Collection', scope: scopeId });
  useGlobalShortcut({
    key: 'x',
    handler: () => onToggleSelect?.(),
    description: 'Toggle selection',
    category: 'Collection',
    scope: scopeId,
    when: () => Boolean(onToggleSelect),
  });
  useGlobalShortcut({
    key: 'enter',
    handler: () => onOpen?.(),
    description: 'Open item',
    category: 'Collection',
    scope: scopeId,
    when: () => Boolean(onOpen),
  });

  return null;
}
