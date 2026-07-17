'use client';

/**
 * @fileoverview ShortcutsOverlay -- Modern engine (DaisyUI / Tailwind).
 * Full-screen modal dialog displaying keyboard shortcuts grouped by
 * category with a search filter. Key combinations use DaisyUI's `kbd`
 * component. The dialog is custom-built (not DaisyUI modal) for more
 * control over backdrop click and auto-focus behavior.
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

/**
 * Modern (DaisyUI/Tailwind) implementation of the ShortcutsOverlay pattern.
 * Renders a fixed-position dialog with search input, categorized shortcut
 * list, and DaisyUI kbd elements for key combinations.
 *
 * @param props - See {@link ShortcutsOverlayProps} for the full prop contract.
 * @returns The rendered shortcuts overlay, or null when closed.
 */
export default function ModernShortcutsOverlay(props: ShortcutsOverlayProps) {
  const {
    open,
    onOpenChange,
    shortcuts,
    title = 'Keyboard Shortcuts',
    searchPlaceholder = 'Search shortcuts...',
    emptyMessage = 'No matching shortcuts.',
    footer,
    className = '',
    style,
  } = props;

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  /* Reset search and auto-focus the input when the overlay opens.
     The var(--ds-motion-instant) delay ensures the DOM has rendered before focusing. */
  useEffect(() => {
    if (open) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
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
      const cat = item.category ?? 'General';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    }
    return groups;
  }, [filtered]);

  /** Closes the overlay, clears the search, and notifies the parent */
  const handleClose = () => {
    onOpenChange(false);
    setQuery('');
  };

  /* Early-return prevents DOM rendering when the overlay is closed */
  if (!open) return null;

  return (
    /* Fixed overlay with 10vh top offset so the dialog sits comfortably below
         the page header rather than dead-center, which feels more natural for reference panels */
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] ds-pattern-shortcuts-overlay ds-engine-modern" data-part="root" style={style} role="dialog" aria-modal="true" aria-label={title}>
      {/* Semi-transparent backdrop closes the dialog on click */}
      <div className="absolute inset-0" data-part="backdrop" onClick={handleClose} />
      {/* Dialog card -- max-w-lg prevents overly wide layouts on ultrawide screens */}
      <div
        className={`relative rounded-xl w-full max-w-lg overflow-hidden ${className}`}
        data-part="dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-3" data-part="header">
          <h2 className="text-base font-semibold">{title}</h2>
          <button
            data-part="close"
            style={{ height: 'var(--ds-control-sm-size, 32px)', width: 'var(--ds-control-sm-size, 32px)', padding: 0, fontSize: 'var(--ds-font-size-xs, 12px)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={handleClose}
            aria-label="Close"
          >
            x
          </button>
        </div>
        {/* Search */}
        <div className="border-b px-5 py-2" data-part="search">
          <input
            ref={inputRef}
            type="text"
            data-part="input"
            className="w-full focus:outline-none"
            style={{ padding: 'var(--ds-spacing-1-5, 6px) 0', fontSize: 'var(--ds-font-size-sm, 14px)' }}
            placeholder={searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {/* Content */}
        <div className="overflow-y-auto py-2" style={{ maxHeight: 400 }}>
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category} className="py-1">
              <div className="px-5 py-1">
                <span className="text-xs uppercase tracking-wider font-semibold" data-part="category-label">
                  {category}
                </span>
              </div>
              {/* Each shortcut row: description on left, DaisyUI kbd badges on right */}
              {items.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between px-5 py-1.5"
                  data-part="item"
                >
                  <span className="text-sm">{item.description}</span>
                  {/* formatShortcutKey splits "ctrl+shift+s" into ["Ctrl", "Shift", "S"] */}
                  <div className="flex items-center gap-1">
                    {formatShortcutKey(item.key).map((segment, i) => (
                      <kbd key={i} data-part="kbd" style={{ padding: '2px 6px', fontSize: 'var(--ds-font-size-xs, 12px)', fontFamily: 'var(--ds-font-family-mono, monospace)' }}>
                        {segment}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-8 text-sm" data-part="empty">
              {emptyMessage}
            </div>
          )}
        </div>
        {/* Footer */}
        {footer && (
          <div className="border-t px-5 py-2 text-xs" data-part="footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
