'use client';

/**
 * ShortcutsOverlay - Modern Engine (DaisyUI / Tailwind)
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { formatShortcutKey } from '../../../../../core/hooks/shortcuts';
import type { ShortcutsOverlayProps, ShortcutDisplayItem } from '../../types';

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

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]" style={style}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      {/* Dialog */}
      <div
        className={`relative bg-base-100 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden ${className}`}
        role="dialog"
        aria-label={title}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-base-300 px-5 py-3">
          <h2 className="text-base font-semibold">{title}</h2>
          <button
            className="btn btn-ghost btn-sm btn-circle"
            onClick={handleClose}
            aria-label="Close"
          >
            x
          </button>
        </div>
        {/* Search */}
        <div className="border-b border-base-300 px-5 py-2">
          <input
            ref={inputRef}
            type="text"
            className="input input-ghost input-sm w-full focus:outline-none"
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
                <span className="text-xs uppercase tracking-wider text-base-content/50 font-semibold">
                  {category}
                </span>
              </div>
              {items.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between px-5 py-1.5"
                >
                  <span className="text-sm">{item.description}</span>
                  <div className="flex items-center gap-1">
                    {formatShortcutKey(item.key).map((segment, i) => (
                      <kbd key={i} className="kbd kbd-sm">
                        {segment}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-8 text-base-content/50 text-sm">
              {emptyMessage}
            </div>
          )}
        </div>
        {/* Footer */}
        {footer && (
          <div className="border-t border-base-300 px-5 py-2 text-xs text-base-content/50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
