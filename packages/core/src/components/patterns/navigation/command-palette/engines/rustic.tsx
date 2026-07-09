'use client';

/**
 * @fileoverview Rustic (Vanilla CSS) engine for the CommandPalette pattern.
 * Renders a searchable command list in a hand-crafted fixed overlay using only
 * inline styles backed by --ds-* design tokens. Includes custom CSS keyframe
 * animations (backdrop fade-in, panel scale-in) injected via an inline <style>
 * tag, and a left-border accent indicator for the active item.
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

  // Backdrop uses both background color and backdrop-filter blur for depth.
  // WebkitBackdropFilter is included for Safari compatibility.
  const backdrop: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    background: 'var(--ds-command-palette-backdrop, var(--ds-overlay-bg))',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    animation: `ds-cmd-backdrop-in ${RUSTIC_DURATION} ${RUSTIC_EASING}`,
  };

  const dialog: React.CSSProperties = {
    position: 'relative',
    background: 'var(--ds-command-palette-bg, var(--ds-color-bg-elevated))',
    borderRadius: 'var(--ds-radius-lg, 12px)',
    boxShadow: 'var(--ds-command-palette-shadow, var(--ds-shadow-dialog, var(--ds-shadow-xl)))',
    width: '100%',
    maxWidth: 560,
    overflow: 'hidden',
    animation: `ds-cmd-panel-in ${RUSTIC_DURATION} ${RUSTIC_EASING}`,
    ...style,
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '16px 20px',
    border: 'none',
    outline: 'none',
    fontSize: 18,
    fontWeight: 400,
    background: 'transparent',
    color: 'var(--ds-color-text, var(--ds-color-text-primary))',
    letterSpacing: '-0.01em',
  };

  const groupLabel: React.CSSProperties = {
    fontSize: 10,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: 'var(--ds-typography-heading-letter-spacing, 0.08em)',
    color: 'var(--ds-command-palette-group-color, var(--ds-color-text-muted))',
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
        onClick={() => handleSelect(item)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 20px',
          cursor: item.disabled ? 'not-allowed' : 'pointer',
          opacity: item.disabled ? 0.5 : 1,
          background: isSelected
            ? 'var(--ds-command-palette-item-active-bg, var(--ds-color-primary-50))'
            : 'transparent',
          // The left border accent marks the keyboard-active item. A transparent
          // border on inactive items reserves the 3px space so content doesn't
          // shift horizontally when the selection moves.
          borderLeft: isSelected
            ? '3px solid var(--ds-command-palette-item-active-border, var(--ds-color-primary-500))'
            : '3px solid transparent',
          transition: `all ${RUSTIC_DURATION} ${RUSTIC_EASING}`,
          marginLeft: -1,
        }}
        // Imperative hover styling because inline styles cannot express :hover
        // pseudo-selectors. Only applied to non-selected items to avoid
        // overriding the active highlight.
        onMouseEnter={(e) => {
          if (!isSelected) {
            const el = e.currentTarget as HTMLElement;
            el.style.borderLeftColor = 'var(--ds-command-palette-item-hover-border, var(--ds-color-primary-300))';
            el.style.background = 'var(--ds-command-palette-item-hover-bg, var(--ds-color-bg-hover))';
          }
        }}
        onMouseLeave={(e) => {
          if (!isSelected) {
            const el = e.currentTarget as HTMLElement;
            el.style.borderLeftColor = 'transparent';
            el.style.background = 'transparent';
          }
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {item.icon}
          <div>
            <div style={{ fontWeight: 500, fontSize: 14 }}>{item.label}</div>
            {item.description && (
              <div style={{ fontSize: 12, color: 'var(--ds-command-palette-group-color, var(--ds-color-text-muted))' }}>
                {item.description}
              </div>
            )}
          </div>
        </div>
        {item.shortcut && (
          <span
            style={{
              padding: '3px 8px',
              borderRadius: 'var(--ds-radius-sm, 6px)',
              border: '1px solid var(--ds-command-palette-shortcut-border, var(--ds-color-border))',
              background: 'var(--ds-command-palette-shortcut-bg, var(--ds-color-surface-muted, var(--ds-color-neutral-50)))',
              fontSize: 11,
              fontWeight: 500,
              fontFamily: 'var(--ds-font-family-mono, ui-monospace, monospace)',
              color: 'var(--ds-command-palette-group-color, var(--ds-color-text-muted))',
              boxShadow: 'var(--ds-command-palette-shortcut-shadow, var(--ds-shadow-sm))',
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
    <div style={overlay}>
      {/* Inject CSS keyframes for entrance animations. Using an inline <style>
          tag keeps the rustic engine fully self-contained with no external CSS. */}
      <style>{`@keyframes ds-cmd-backdrop-in { from { opacity: 0; } to { opacity: 1; } } @keyframes ds-cmd-panel-in { from { opacity: 0; transform: scale(0.96) translateY(-10px); } to { opacity: 1; transform: scale(1) translateY(0); } }`}</style>
      <div style={backdrop} onClick={() => onOpenChange(false)} />
      <div className={className} style={dialog}>
        <div style={{ borderBottom: '1px solid var(--ds-command-palette-border, var(--ds-color-border))' }}>
          <input
            ref={inputRef}
            type="text"
            style={inputStyle}
            placeholder={placeholder}
            value={query}
            onChange={(e) => { setQuery(e.target.value); onSearch?.(e.target.value); }}
            onKeyDown={handleKeyDown}
            // Add a subtle inset shadow line on focus to indicate the active
            // input area, matching the Rustic personality's refined micro-feedback.
            onFocus={(e) => {
              (e.currentTarget.parentElement as HTMLElement).style.boxShadow =
                'inset 0 -1px 0 0 var(--ds-command-palette-focus-line, var(--ds-color-primary-200))';
            }}
            onBlur={(e) => {
              (e.currentTarget.parentElement as HTMLElement).style.boxShadow = 'none';
            }}
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
            <div
              style={{
                textAlign: 'center',
                padding: '24px 0',
                color: 'var(--ds-command-palette-empty-color, var(--ds-color-text-muted))',
                fontSize: 14,
              }}
            >
              {emptyMessage}
            </div>
          )}
        </div>
        {footer && (
          <div
            style={{
              borderTop: '1px solid var(--ds-command-palette-border, var(--ds-color-border))',
              padding: '8px 16px',
              fontSize: 12,
              color: 'var(--ds-command-palette-group-color, var(--ds-color-text-muted))',
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
