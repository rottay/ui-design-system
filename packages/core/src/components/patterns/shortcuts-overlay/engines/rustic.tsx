'use client';

/**
 * ShortcutsOverlay - Rustic Engine (Pure inline styles with --ds-* CSS vars)
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { formatShortcutKey } from '../../../../hooks/shortcuts';
import type { ShortcutsOverlayProps, ShortcutDisplayItem } from '../ShortcutsOverlay.types';

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

  useEffect(() => {
    if (open) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

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

  const grouped = useMemo(() => {
    const groups: Record<string, ShortcutDisplayItem[]> = {};
    for (const item of filtered) {
      const cat = item.category ?? 'General';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    }
    return groups;
  }, [filtered]);

  const handleClose = () => {
    onOpenChange(false);
    setQuery('');
  };

  if (!open) return null;

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

  const closeButtonStyle: React.CSSProperties = {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: 18,
    color: 'var(--ds-color-text-muted)',
    padding: '4px 8px',
    borderRadius: 'var(--ds-radius-sm, 4px)',
    lineHeight: 1,
  };

  const searchWrapperStyle: React.CSSProperties = {
    padding: '8px 20px',
    borderBottom: '1px solid var(--ds-color-border)',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 0',
    border: 'none',
    outline: 'none',
    fontSize: 13,
    background: 'transparent',
    color: 'var(--ds-color-text)',
  };

  const categoryLabelStyle: React.CSSProperties = {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: 600,
    color: 'var(--ds-color-text-muted)',
    padding: '8px 20px 4px',
  };

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

  const kbdStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 22,
    padding: '2px 6px',
    borderRadius: 'var(--ds-radius-sm, 4px)',
    border: '1px solid var(--ds-color-border)',
    background: 'var(--ds-shortcuts-overlay-kbd-bg, var(--ds-color-bg-secondary))',
    fontSize: 11,
    fontFamily: 'var(--ds-font-mono, monospace)',
    color: 'var(--ds-color-text-muted)',
    lineHeight: '18px',
  };

  const keysContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  };

  return (
    <div style={overlay}>
      <div style={backdrop} onClick={handleClose} />
      <div
        className={className}
        style={dialog}
        role="dialog"
        aria-label={title}
      >
        {/* Header */}
        <div style={headerStyle}>
          <h2 style={titleStyle}>{title}</h2>
          <button
            style={closeButtonStyle}
            onClick={handleClose}
            aria-label="Close"
          >
            x
          </button>
        </div>
        {/* Search */}
        <div style={searchWrapperStyle}>
          <input
            ref={inputRef}
            type="text"
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
              <div style={categoryLabelStyle}>{category}</div>
              {items.map((item) => (
                <div key={item.key} style={itemStyle}>
                  <span style={descriptionStyle}>{item.description}</span>
                  <div style={keysContainerStyle}>
                    {formatShortcutKey(item.key).map((segment, i) => (
                      <span key={i} style={kbdStyle}>
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
