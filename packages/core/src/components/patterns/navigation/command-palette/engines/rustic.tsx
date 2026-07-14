'use client';

/**
 * @fileoverview Rustic (Vanilla CSS) engine for the CommandPalette pattern.
 * Renders a searchable command list in a hand-crafted fixed overlay. Paint and the
 * entrance keyframe animations (backdrop fade-in, panel scale-in) live in the engine
 * skin (`tokens/css/engines/rustic/skin/command-palette.css`); a left-border accent
 * indicates the active item.
 *
 * @example
 * <RusticCommandPalette
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   items={[{ id: '1', label: 'Search', shortcut: 'Cmd+K', onSelect: openSearch }]}
 *   footer={<span>Tip: use arrow keys to navigate</span>}
 * />
 */

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import type { CommandPaletteProps, CommandItem } from '../CommandPalette.types';

/**
 * Rustic (Vanilla CSS) command palette with entrance animations and design-token styling.
 * @param props - CommandPaletteProps controlling open state, items, search, and footer.
 * @returns A fixed overlay with blurred backdrop and a styled dialog card, or null when closed.
 */
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

  // Case-insensitive substring match on both label and description so
  // users can search by intent ("delete") not just the exact command name.
  const filtered = useMemo(() => {
    if (!query) return items;
    const q = query.toLowerCase();
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q)
    );
  }, [items, query]);

  // Group by the optional `group` field. Items without a group land under
  // the empty-string key and render without a section header.
  const grouped = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    for (const item of filtered) {
      const g = item.group ?? '';
      if (!groups[g]) groups[g] = [];
      groups[g].push(item);
    }
    return groups;
  }, [filtered]);

  // Reset the keyboard cursor to the first item whenever the query changes.
  useEffect(() => { setActiveIndex(0); }, [query]);

  // Reset search and auto-focus the input when the palette opens.
  // The 50ms delay ensures the DOM node is mounted before focus().
  useEffect(() => {
    if (open) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Execute the item's onSelect callback and close the palette.
  // Disabled items are silently ignored to prevent accidental invocation.
  const handleSelect = useCallback(
    (item: CommandItem) => {
      if (item.disabled) return;
      item.onSelect();
      onOpenChange(false);
    },
    [onOpenChange]
  );

  // Keyboard navigation: ArrowDown/ArrowUp move the cursor, Enter selects,
  // Escape closes. preventDefault on arrows stops the input caret from jumping.
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

  // Unmount entirely when closed to avoid layering invisible event listeners.
  if (!open) return null;

  // Rustic personality animation curve -- a deceleration ease-out that gives
  // a smooth "landing" feel when the panel appears. Duration is token-driven
  // to respect reduced-motion preferences at the theme level.
  const RUSTIC_EASING = 'cubic-bezier(0.16, 1, 0.3, 1)';
  const RUSTIC_DURATION = 'var(--ds-personality-animation-entrance-duration, 300ms)';

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
    animation: `ds-cmd-backdrop-in ${RUSTIC_DURATION} ${RUSTIC_EASING}`,
  };

  const dialog: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    maxWidth: 560,
    overflow: 'hidden',
    animation: `ds-cmd-panel-in ${RUSTIC_DURATION} ${RUSTIC_EASING}`,
    ...style,
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '16px 20px',
    fontSize: 18,
    fontWeight: 400,
    letterSpacing: '-0.01em',
  };

  const groupLabel: React.CSSProperties = {
    fontSize: 10,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: 'var(--ds-typography-heading-letter-spacing, 0.08em)',
    padding: '12px 20px 6px',
  };

  /**
   * Render a single command item row with active highlight, hover effects,
   * and an optional keyboard shortcut badge. The active item gets a
   * left-border accent to visually distinguish it from hover state.
   */
  const renderItem = (item: CommandItem, idx: number) => {
    const isSelected = activeIndex === idx;
    return (
      <div
        key={item.id}
        data-part="item"
        data-active={isSelected}
        onClick={() => handleSelect(item)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 20px',
          cursor: item.disabled ? 'not-allowed' : 'pointer',
          opacity: item.disabled ? 0.5 : 1,
          transition: `all ${RUSTIC_DURATION} ${RUSTIC_EASING}`,
          marginLeft: -1,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {item.icon}
          <div>
            <div style={{ fontWeight: 500, fontSize: 14 }}>{item.label}</div>
            {item.description && (
              <div data-part="description" style={{ fontSize: 12 }}>
                {item.description}
              </div>
            )}
          </div>
        </div>
        {item.shortcut && (
          <span
            data-part="shortcut"
            style={{
              padding: '3px 8px',
              fontSize: 11,
              fontWeight: 500,
              fontFamily: 'var(--ds-font-family-mono, ui-monospace, monospace)',
              letterSpacing: '0.02em',
            }}
          >
            {item.shortcut}
          </span>
        )}
      </div>
    );
  };

  // Mutable counter spans all sections (recent + grouped) so the
  // keyboard activeIndex always maps to the correct visual row.
  let itemIndex = -1;

  return (
    <div className="ds-pattern-command-palette ds-engine-rustic" data-part="root" style={overlay}>
      <div style={backdrop} data-part="backdrop" onClick={() => onOpenChange(false)} />
      <div className={className} data-part="dialog" style={dialog}>
        <div data-part="search">
          <input
            ref={inputRef}
            type="text"
            data-part="input"
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
              <div data-part="group-label" style={groupLabel}>Recent</div>
              {recentItems.map((item) => {
                itemIndex++;
                return renderItem(item, itemIndex);
              })}
            </div>
          )}
          {Object.entries(grouped).map(([group, groupItems]) => (
            <div key={group}>
              {group && <div data-part="group-label" style={groupLabel}>{group}</div>}
              {groupItems.map((item) => {
                itemIndex++;
                return renderItem(item, itemIndex);
              })}
            </div>
          ))}
          {filtered.length === 0 && (
            <div
              data-part="empty"
              style={{
                textAlign: 'center',
                padding: '24px 0',
                fontSize: 14,
              }}
            >
              {emptyMessage}
            </div>
          )}
        </div>
        {footer && (
          <div
            data-part="footer"
            style={{
              padding: '8px 16px',
              fontSize: 12,
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
