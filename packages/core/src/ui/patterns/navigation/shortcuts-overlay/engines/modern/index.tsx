'use client';

/**
 * @fileoverview Modern engine for the ShortcutsOverlay pattern.
 *
 * A modal reference panel listing the registered keyboard shortcuts grouped
 * by category with a search filter. Custom fixed-position overlay (not a
 * framework modal) for control over backdrop click, auto-focus, focus
 * return and the focus trap: focus lands on the search input at open,
 * Tab/Shift+Tab cycle inside the dialog, and Escape or backdrop close
 * returns focus to the element that opened the overlay.
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

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { formatShortcutKey } from '../../../../../../infrastructure/runtime/application/interaction/shortcuts';
import type { ShortcutsOverlayProps, ShortcutDisplayItem } from '../../contracts';
import Button from '../../../../../primitives/inputs/Button/engines/modern';
import Input from '../../../../../primitives/inputs/Input/engines/modern';
import Empty from '../../../../../primitives/display/Empty/engines/modern';
import Kbd from '../../../../../primitives/display/Kbd/engines/modern';
import ScrollArea from '../../../../../primitives/layout/ScrollArea/engines/modern';
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
 * Renders a fixed-position dialog with search input, categorized shortcut
 * list, and certified Kbd elements for key combinations.
 *
 * @param props - See {@link ShortcutsOverlayProps} for the full prop contract.
 * @returns The rendered shortcuts overlay, or null when closed.
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
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<Element | null>(null);

  /* Reset search, remember the trigger and auto-focus the input when the
     overlay opens; on close, focus returns to the trigger. The short delay
     ensures the DOM has rendered before focusing. */
  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement;
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      if (triggerRef.current && triggerRef.current instanceof HTMLElement) {
        triggerRef.current.focus();
      }
      triggerRef.current = null;
    }
  }, [open]);

  /* Close overlay on Escape key */
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

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

  // Focus trap: cycle Tab/Shift+Tab within the dialog while open.
  const handleFocusTrap = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Tab' || !dialogRef.current) return;
    const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
      'input, button, [tabindex]:not([tabindex="-1"]), a[href]'
    );
    if (focusable.length === 0) return;
    const first = focusable.item(0);
    const last = focusable.item(focusable.length - 1);
    if (!first || !last) return;
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, []);

  /* Early-return prevents DOM rendering when the overlay is closed */
  if (!open) return null;

  return (
    /* Fixed overlay with a top offset so the dialog sits comfortably below
       the page header rather than dead-center, which feels more natural for
       reference panels (geometry is skin-owned). */
    <div
      ref={dialogRef}
      onKeyDown={handleFocusTrap}
      className="ds-pattern-shortcuts-overlay ds-engine-modern"
      data-part="root"
      style={style}
      role="dialog"
      aria-modal="true"
      aria-label={titleText}
    >
      {/* Semi-transparent backdrop closes the dialog on click */}
      <div data-part="backdrop" onClick={handleClose} />
      {/* Dialog card */}
      <div
        className={className}
        data-part="dialog"
      >
        {/* Header */}
        <div data-part="header">
          <h2 data-part="title">{titleText}</h2>
          <Button
            engine="modern"
            variant="ghost"
            size="sm"
            data-part="close"
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
    </div>
  );
}
