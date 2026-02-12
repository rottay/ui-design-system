'use client';

/**
 * CommandPalette - Rustic Engine (Pure inline styles with --ds-* CSS vars)
 */

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import type { CommandPaletteProps, CommandItem } from '../../types';

export default function RusticCommandPalette(props: CommandPaletteProps) {
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
    className,
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

  const overlay: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingTop: '15vh',
  };

  const backdrop: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
  };

  const dialog: React.CSSProperties = {
    position: 'relative',
    background: 'var(--ds-color-bg, #fff)',
    borderRadius: 'var(--ds-radius-lg, 12px)',
    boxShadow: 'var(--ds-shadow-xl, 0 25px 50px -12px rgba(0,0,0,0.25))',
    width: '100%',
    maxWidth: 520,
    overflow: 'hidden',
    ...style,
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 16px',
    border: 'none',
    outline: 'none',
    fontSize: 16,
    background: 'transparent',
    color: 'var(--ds-color-text, #1a1a1a)',
  };

  const groupLabel: React.CSSProperties = {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: 'var(--ds-color-text-muted, #888)',
    padding: '8px 16px 4px',
  };

  const renderItem = (item: CommandItem, idx: number) => (
    <div
      key={item.id}
      onClick={() => handleSelect(item)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 16px',
        cursor: item.disabled ? 'not-allowed' : 'pointer',
        opacity: item.disabled ? 0.5 : 1,
        background: activeIndex === idx ? 'var(--ds-color-bg-hover, #f5f5f5)' : 'transparent',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {item.icon}
        <div>
          <div style={{ fontWeight: 500, fontSize: 14 }}>{item.label}</div>
          {item.description && (
            <div style={{ fontSize: 12, color: 'var(--ds-color-text-muted, #888)' }}>
              {item.description}
            </div>
          )}
        </div>
      </div>
      {item.shortcut && (
        <span
          style={{
            padding: '2px 6px',
            borderRadius: 'var(--ds-radius-sm, 4px)',
            border: '1px solid var(--ds-color-border, #d9d9d9)',
            fontSize: 11,
            color: 'var(--ds-color-text-muted, #888)',
          }}
        >
          {item.shortcut}
        </span>
      )}
    </div>
  );

  let itemIndex = -1;

  return (
    <div style={overlay}>
      <div style={backdrop} onClick={() => onOpenChange(false)} />
      <div className={className} style={dialog}>
        <div style={{ borderBottom: '1px solid var(--ds-color-border, #e5e5e5)' }}>
          <input
            ref={inputRef}
            type="text"
            style={inputStyle}
            placeholder={placeholder}
            value={query}
            onChange={(e) => { setQuery(e.target.value); onSearch?.(e.target.value); }}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div style={{ maxHeight, overflowY: 'auto', padding: '4px 0' }}>
          {!query && recentItems && recentItems.length > 0 && (
            <div>
              <div style={groupLabel}>Recent</div>
              {recentItems.map((item) => {
                itemIndex++;
                return renderItem(item, itemIndex);
              })}
            </div>
          )}
          {Object.entries(grouped).map(([group, groupItems]) => (
            <div key={group}>
              {group && <div style={groupLabel}>{group}</div>}
              {groupItems.map((item) => {
                itemIndex++;
                return renderItem(item, itemIndex);
              })}
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--ds-color-text-muted, #888)', fontSize: 14 }}>
              {emptyMessage}
            </div>
          )}
        </div>
        {footer && (
          <div style={{ borderTop: '1px solid var(--ds-color-border, #e5e5e5)', padding: '8px 16px', fontSize: 12, color: 'var(--ds-color-text-muted, #888)' }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
