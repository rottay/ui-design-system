'use client';

/**
 * @fileoverview ShortcutsOverlay -- Rustic engine (Vanilla / CSS variables).
 * Full-screen modal dialog for keyboard shortcuts using only inline
 * styles with --ds-* design tokens. No CSS framework dependency.
 * Features search filtering, category grouping, and styled kbd elements.
 * Supports custom tokens like --ds-shortcuts-overlay-backdrop and
 * --ds-shortcuts-overlay-kbd-bg for fine-grained theming.
 *
 * @example
 * <RusticShortcutsOverlay
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   shortcuts={[{ key: 'ctrl+s', description: 'Save', category: 'File' }]}
 * />
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { formatShortcutKey } from '../../../../../hooks/shortcuts';
import type { ShortcutsOverlayProps, ShortcutDisplayItem } from '../ShortcutsOverlay.types';

/**
 * Rustic (Vanilla CSS) implementation of the ShortcutsOverlay pattern.
 * All styling uses inline CSSProperties with --ds-* token fallbacks.
 * Builds its own dialog, backdrop, search input, and kbd key tags.
 *
 * @param props - See {@link ShortcutsOverlayProps} for the full prop contract.
 * @returns The rendered shortcuts overlay, or null when closed.
 */
export default function RusticShortcutsOverlay(props: ShortcutsOverlayProps) {
  const {
    open,
    onOpenChange,
    shortcuts,
    title = 'Keyboard Shortcuts',
    searchPlaceholder = 'Search shortcuts...',
    emptyMessage = 'No matching shortcuts.',
    footer,
    className,
    style,
  } = props;

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  /* Reset search and auto-focus input on open; 50ms delay for DOM readiness */
  useEffect(() => {
    if (open) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  /* Case-insensitive filter across description, key combo, and category */
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

  /* Group by category for sectioned display; "General" is the fallback */
  const grouped = useMemo(() => {
    const groups: Record<string, ShortcutDisplayItem[]> = {};
    for (const item of filtered) {
      const cat = item.category ?? 'General';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    }
    return groups;
  }, [filtered]);

  /** Closes the overlay and resets the search query */
  const handleClose = () => {
    onOpenChange(false);
    setQuery('');
  };

  if (!open) return null;

  /* --- Style definitions using --ds-* tokens for full theme portability --- */

  /** Fixed full-screen overlay container, offset from top for visual comfort */
  const overlay: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingTop: '10vh',
  };

  const backdrop: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    background: 'var(--ds-shortcuts-overlay-backdrop, var(--ds-color-bg-overlay))',
  };

  /** Dialog container -- spread caller style last so it can override defaults.
   *  Max-width prevents the panel from growing too wide on large screens. */
  const dialog: React.CSSProperties = {
    position: 'relative',
    background: 'var(--ds-shortcuts-overlay-bg, var(--ds-color-bg-elevated))',
    borderRadius: 'var(--ds-radius-lg, 12px)',
    boxShadow: 'var(--ds-shortcuts-overlay-shadow, var(--ds-shadow-dialog))',
    width: '100%',
    maxWidth: 520,
    overflow: 'hidden',
    ...style,
  };

  /** Header bar separates the title from the scrollable content area */
  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 20px',
    borderBottom: '1px solid var(--ds-color-border)',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: 15,
    fontWeight: 600,
    color: 'var(--ds-color-text-primary)',
    margin: 0,
  };

  /** Close button is transparent with muted text to stay visually recessive */
  const closeButtonStyle: React.CSSProperties = {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: 18,
    color: 'var(--ds-color-text-muted)',
    padding: '4px 8px',
    borderRadius: 'var(--ds-radius-sm, 6px)',
    lineHeight: 1,
  };

  /** Search wrapper provides a border-bottom separator between search and content */
  const searchWrapperStyle: React.CSSProperties = {
    padding: '8px 20px',
    borderBottom: '1px solid var(--ds-color-border)',
  };

  /** Input is visually borderless and transparent to blend into the dialog chrome */
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 0',
    border: 'none',
    outline: 'none',
    fontSize: 13,
    background: 'transparent',
    color: 'var(--ds-color-text)',
  };

  /** Category labels use uppercase + letter-spacing for a subtle section divider feel */
  const categoryLabelStyle: React.CSSProperties = {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: 600,
    color: 'var(--ds-color-text-muted)',
    padding: '8px 20px 4px',
  };

  /** Each shortcut row: description left-aligned, keys right-aligned */
  const itemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '6px 20px',
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize: 13,
    color: 'var(--ds-color-text-primary)',
  };

  /** Keyboard key badge -- uses monospace font and bg token for kbd appearance */
  const kbdStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 22,
    padding: '2px 6px',
    borderRadius: 'var(--ds-radius-sm, 6px)',
    border: '1px solid var(--ds-color-border)',
    background: 'var(--ds-shortcuts-overlay-kbd-bg, var(--ds-color-bg-secondary))',
    fontSize: 11,
    fontFamily: 'var(--ds-font-mono, monospace)',
    color: 'var(--ds-color-text-muted)',
    lineHeight: '18px',
  };

  /** Horizontal layout for key segments with a small gap between each kbd badge */
  const keysContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  };

  return (
    <div className="ds-pattern-shortcuts-overlay ds-engine-rustic" data-part="root" style={overlay}>
      <div style={backdrop} data-part="backdrop" onClick={handleClose} />
      <div
        className={className}
        data-part="dialog"
        style={dialog}
        role="dialog"
        aria-label={title}
      >
        {/* Header */}
        <div style={headerStyle} data-part="header">
          <h2 style={titleStyle} data-part="title">{title}</h2>
          <button
            data-part="close"
            style={closeButtonStyle}
            onClick={handleClose}
            aria-label="Close"
          >
            x
          </button>
        </div>
        {/* Search */}
        <div style={searchWrapperStyle} data-part="search">
          <input
            ref={inputRef}
            type="text"
            data-part="input"
            style={inputStyle}
            placeholder={searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {/* Content */}
        <div style={{ maxHeight: 400, overflowY: 'auto', padding: '4px 0' }}>
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category} style={{ padding: '4px 0' }}>
              <div style={categoryLabelStyle} data-part="category-label">{category}</div>
              {items.map((item) => (
                <div key={item.key} style={itemStyle} data-part="item">
                  <span style={descriptionStyle} data-part="description">{item.description}</span>
                  <div style={keysContainerStyle}>
                    {formatShortcutKey(item.key).map((segment, i) => (
                      <span key={i} style={kbdStyle} data-part="kbd">
                        {segment}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
          {filtered.length === 0 && (
            <div
              data-part="empty"
              style={{
                textAlign: 'center',
                padding: '32px 0',
                color: 'var(--ds-color-text-muted)',
                fontSize: 13,
              }}
            >
              {emptyMessage}
            </div>
          )}
        </div>
        {/* Footer */}
        {footer && (
          <div
            data-part="footer"
            style={{
              borderTop: '1px solid var(--ds-color-border)',
              padding: '8px 20px',
              fontSize: 12,
              color: 'var(--ds-color-text-muted)',
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
