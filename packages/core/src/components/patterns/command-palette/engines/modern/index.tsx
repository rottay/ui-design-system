'use client';

/**
 * CommandPalette - Modern Engine (DaisyUI / Tailwind)
 */

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import type { CommandPaletteProps, CommandItem } from '../../types';

export default function ModernCommandPalette(props: CommandPaletteProps) {
  const {
    open,
    onOpenChange,
    items,
    placeholder = 'Type a command...',
    emptyMessage = 'No results found.',
    onSearch,
    footer,
    recentItems,
    maxHeight = 400,
    className = '',
    style,
    loading = false,
  } = props;

  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    if (!query) return items;
    const q = query.toLowerCase();
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q)
    );
  }, [items, query]);

  const grouped = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    for (const item of filtered) {
      const g = item.group ?? '';
      if (!groups[g]) groups[g] = [];
      groups[g].push(item);
    }
    return groups;
  }, [filtered]);

  useEffect(() => { setActiveIndex(0); }, [query]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const handleSelect = useCallback(
    (item: CommandItem) => {
      if (item.disabled) return;
      item.onSelect();
      onOpenChange(false);
    },
    [onOpenChange]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = filtered[activeIndex];
      if (item) handleSelect(item);
    } else if (e.key === 'Escape') {
      onOpenChange(false);
    }
  };

  if (!open) return null;

  let itemIndex = -1;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" style={style}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      {/* Dialog */}
      <div className={`relative bg-base-100 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden ${className}`}>
        {/* Search */}
        <div className="border-b border-base-300 p-3">
          <input
            ref={inputRef}
            type="text"
            className="input input-ghost w-full text-lg focus:outline-none"
            placeholder={placeholder}
            value={query}
            onChange={(e) => { setQuery(e.target.value); onSearch?.(e.target.value); }}
            onKeyDown={handleKeyDown}
          />
        </div>
        {/* Results */}
        <div className="overflow-y-auto py-2" style={{ maxHeight }}>
          {!query && recentItems && recentItems.length > 0 && (
            <div className="px-3 pb-2">
              <div className="text-xs uppercase tracking-wider text-base-content/50 mb-1 px-2">Recent</div>
              {recentItems.map((item) => {
                itemIndex++;
                const idx = itemIndex;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer ${
                      activeIndex === idx ? 'bg-base-200' : 'hover:bg-base-200'
                    } ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      {item.icon}
                      <div>
                        <div className="font-medium text-sm">{item.label}</div>
                        {item.description && (
                          <div className="text-xs text-base-content/60">{item.description}</div>
                        )}
                      </div>
                    </div>
                    {item.shortcut && <kbd className="kbd kbd-sm">{item.shortcut}</kbd>}
                  </div>
                );
              })}
            </div>
          )}
          {Object.entries(grouped).map(([group, groupItems]) => (
            <div key={group}>
              {group && (
                <div className="text-xs uppercase tracking-wider text-base-content/50 px-5 pt-3 pb-1">
                  {group}
                </div>
              )}
              {groupItems.map((item) => {
                itemIndex++;
                const idx = itemIndex;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className={`flex items-center justify-between px-4 py-2 cursor-pointer ${
                      activeIndex === idx ? 'bg-base-200' : 'hover:bg-base-200'
                    } ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      {item.icon}
                      <div>
                        <div className="font-medium text-sm">{item.label}</div>
                        {item.description && (
                          <div className="text-xs text-base-content/60">{item.description}</div>
                        )}
                      </div>
                    </div>
                    {item.shortcut && <kbd className="kbd kbd-sm">{item.shortcut}</kbd>}
                  </div>
                );
              })}
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
          <div className="border-t border-base-300 px-4 py-2 text-xs text-base-content/50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
