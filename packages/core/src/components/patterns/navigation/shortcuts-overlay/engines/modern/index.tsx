'use client';

/**
 * @fileoverview Modern engine for the ShortcutsOverlay pattern.
 *
 * A modal reference panel listing the registered keyboard shortcuts grouped
 * by category with a search filter, inside the certified Modal primitive. The
 * blocking chamber, backdrop click-to-close, Escape, the native top-layer
 * focus trap, sibling inerting and focus restore all belong to Modal — this
 * pattern hand-rolls none of them and adds no key listener of its own. It
 * only routes initial focus to the search input.
 *
 * COMPOSITION LAW: the close control is the certified Button, the search
 * box the certified Input, each key cap the certified Kbd (inside its
 * anatomy wrapper — the Kbd engine owns its paint and does not forward
 * data-part), the scroll frame the certified ScrollArea, and the
 * no-results state the certified Empty. Key notation comes from the
 * sanctioned `formatShortcutKey` runtime (platform-aware: ⌘/⌃/⌥/⇧ on mac,
 * Ctrl/Alt/Shift/Win elsewhere) — never re-derived here.
 *
 * Copy runs through the guarded i18n channel with documented English floors
 * (the defaults double as test pins: 'Keyboard Shortcuts', 'Search
 * shortcuts...', 'No matching shortcuts.', 'Close', 'General'); caller
 * props always win.
 *
 * @example
 * <ModernShortcutsOverlay
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   shortcuts={[{ key: 'ctrl+s', description: 'Save', category: 'File' }]}
 * />
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { formatShortcutKey } from '../../../../../../infrastructure/runtime/application/interaction/shortcuts';
import type { ShortcutsOverlayProps, ShortcutDisplayItem } from '../../contracts';
import Modal from '../../../../../primitives/feedback/modal/engines/modern';
import Button from '../../../../../primitives/inputs/button/engines/modern';
import Input from '../../../../../primitives/inputs/input/engines/modern';
import Empty from '../../../../../primitives/display/empty/engines/modern';
import Kbd from '../../../../../primitives/display/kbd/engines/modern';
import ScrollArea from '../../../../../primitives/layout/scroll-area/engines/modern';
import { XIcon } from '../../../../../../graphics/icons';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';

/** Design constant for the list scroll frame (was an inline literal). */
const LIST_MAX_HEIGHT = 400;

/** Hook-local `tOr`: catalogue value with an English floor, never a raw key. */
function useShortcutsOverlayTranslation() {
  const i18n = useOptionalTranslation('components');
  const tOr = (key: string, fallback: string): string => {
    const resolved = i18n?.t(key);
    if (!resolved || resolved === key || resolved === `components.${key}`) return fallback;
    return resolved;
  };
  return { tOr };
}

/**
 * Modern (token-driven) implementation of the ShortcutsOverlay pattern.
 * Renders the governed Modal chamber with search input, categorized shortcut
 * list, and certified Kbd elements for key combinations.
 *
 * @param props - See {@link ShortcutsOverlayProps} for the full prop contract.
 * @returns The governed Modal chamber carrying the shortcuts reference.
 */
export default function ModernShortcutsOverlay(props: ShortcutsOverlayProps) {
  const { tOr } = useShortcutsOverlayTranslation();
  const {
    open,
    onOpenChange,
    shortcuts,
    title,
    searchPlaceholder,
    emptyMessage,
    footer,
    className = '',
    style,
  } = props;

  /* Localized owned copy (callers can still override every string by prop). */
  const titleText = title ?? tOr('shortcutsOverlay.title', 'Keyboard Shortcuts');
  const placeholderText = searchPlaceholder ?? tOr('shortcutsOverlay.searchPlaceholder', 'Search shortcuts...');
  const emptyText = emptyMessage ?? tOr('shortcutsOverlay.empty', 'No matching shortcuts.');
  const closeLabel = tOr('shortcutsOverlay.close', 'Close');
  const generalLabel = tOr('shortcutsOverlay.general', 'General');

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  /* Reset search and route INITIAL focus to the search box on open. Focus
     RESTORE on close is deliberately absent: the composed Modal opens a native
     <dialog> with showModal(), and the dialog's close steps return focus to the
     previously-focused element. The short delay is needed because the Modal
     portals its content, so the input exists a commit later. */
  useEffect(() => {
    if (!open) return;
    setQuery('');
    const focusTimer = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(focusTimer);
  }, [open]);

  /* Filter shortcuts by query matching description, key combo, or category */
  const filtered = useMemo(() => {
    if (!query) return shortcuts;
    const q = query.toLowerCase();
    return shortcuts.filter(
      (s) =>
        s.description.toLowerCase().includes(q) ||
        s.key.toLowerCase().includes(q) ||
        s.category?.toLowerCase().includes(q)
    );
  }, [shortcuts, query]);

  /* Group filtered shortcuts by category -- uncategorized items go to "General" */
  const grouped = useMemo(() => {
    const groups: Record<string, ShortcutDisplayItem[]> = {};
    for (const item of filtered) {
      const cat = item.category ?? generalLabel;
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    }
    return groups;
  }, [filtered, generalLabel]);

  /** Closes the overlay, clears the search, and notifies the parent */
  const handleClose = () => {
    onOpenChange(false);
    setQuery('');
  };

  return (
    /* The blocking chamber IS the certified Modal. `placement='top'` keeps the
       reference panel below the page header rather than dead-center;
       `padding='none'` because the pattern owns its own section rhythm;
       `closable`/`hideFooter` off because the header row and the footer slot
       are this pattern's own anatomy inside Modal's body. The caller's
       className/style join the pattern scope on the surface. */
    <Modal
      open={open}
      onClose={handleClose}
      aria-label={titleText}
      placement="top"
      size="full"
      padding="none"
      radius="xl"
      hideFooter
      closable={false}
      blurBackdrop
      className={['ds-pattern-shortcuts-overlay', 'ds-engine-modern', className]
        .filter(Boolean)
        .join(' ')}
      style={style}
    >
      {/* Overlay content wrapper: the pattern's own anatomy root inside
          Modal's body. */}
      <div data-part="content">
        {/* Header */}
        <div data-part="header">
          <h2 data-part="title">{titleText}</h2>
          <Button
            engine="modern"
            variant="ghost"
            size="sm"
            data-part="close"
            className="ds-pattern-shortcuts-overlay__close"
            icon={<XIcon size={14} />}
            aria-label={closeLabel}
            onClick={handleClose}
          />
        </div>
        {/* Search: certified Input (it owns its focus ring; the raw input's
            `focus:outline-none` suppression is gone). */}
        <div data-part="search">
          <Input
            ref={inputRef}
            value={query}
            placeholder={placeholderText}
            /* A placeholder is not an accessible name: the search box needs
               its own label or it reaches AT as an unnamed textbox. */
            aria-label={placeholderText}
            onChange={(newValue) => setQuery(newValue)}
          />
        </div>
        {/* Content: certified ScrollArea owns the scroll frame and its
            scrollbar; the inner part keeps the rhythm. */}
        <ScrollArea maxHeight={LIST_MAX_HEIGHT}>
          <div data-part="list">
            {Object.entries(grouped).map(([category, items]) => (
              <div key={category} data-part="group">
                <div data-part="category-row">
                  <span data-part="category-label">
                    {category}
                  </span>
                </div>
                {/* Each shortcut row: description on the left, certified Kbd
                    caps on the right. The chord keeps dir="ltr": key names
                    are Latin notation that never translates nor reorders. */}
                {items.map((item) => (
                  <div
                    key={item.key}
                    data-part="item"
                  >
                    <span data-part="description">{item.description}</span>
                    <div data-part="chord" dir="ltr">
                      {/* formatShortcutKey splits "ctrl+shift+s" into ["Ctrl", "Shift", "S"] */}
                      {formatShortcutKey(item.key).map((segment, i) => (
                        <span data-part="kbd" key={i}>
                          <Kbd size="sm">{segment}</Kbd>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
            {filtered.length === 0 && (
              <div data-part="empty">
                <Empty image="simple" description={emptyText} />
              </div>
            )}
          </div>
        </ScrollArea>
        {/* Footer */}
        {footer && (
          <div data-part="footer">
            {footer}
          </div>
        )}
      </div>
    </Modal>
  );
}
