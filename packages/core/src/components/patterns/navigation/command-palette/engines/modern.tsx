'use client';

/**
 * @fileoverview Modern (token-driven) engine for the CommandPalette pattern.
 * Renders a searchable command list in a custom fixed-position overlay (not a
 * framework modal) with backdrop click-to-close, keyboard navigation, and
 * styled kbd elements for shortcut display. The overlay is conditionally
 * unmounted rather than hidden to avoid stacking invisible listeners.
 *
 * @example
 * <ModernCommandPalette
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   items={[{ id: '1', label: 'Deploy', group: 'Actions', onSelect: deploy }]}
 *   recentItems={recentCommands}
 * />
 */

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import type { CommandPaletteProps, CommandItem } from '../CommandPalette.types';
import { menuSectionTitleStyle } from '../../../_internal/engines/modern/styles';

/**
 * Modern (token-driven) command palette with full keyboard navigation.
 * @param props - CommandPaletteProps controlling open state, items, search, and footer.
 * @returns A fixed overlay with backdrop and a rounded dialog card, or null when closed.
 */
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
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<Element | null>(null);

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

  // Store the element that had focus before the palette opened so we
  // can return focus when it closes. Reset search and auto-focus the
  // input. The var(--ds-motion-instant) delay is needed because the DOM element must be
  // mounted before focus() can succeed.
  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement;
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      // Return focus to the element that opened the palette
      if (triggerRef.current && triggerRef.current instanceof HTMLElement) {
        triggerRef.current.focus();
      }
      triggerRef.current = null;
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

  // Focus trap: cycle Tab/Shift+Tab within the dialog when open.
  const handleFocusTrap = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Tab' || !dialogRef.current) return;
    const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
      'input, button, [tabindex]:not([tabindex="-1"]), a[href]'
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
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

  // Early return avoids rendering the backdrop/portal when closed, which
  // is cheaper than CSS visibility toggling for a rarely-open overlay.
  if (!open) return null;

  // Mutable counter spans all sections (recent + grouped) so the
  // keyboard activeIndex always maps to the correct visual row.
  let itemIndex = -1;

  return (
    <div ref={dialogRef} onKeyDown={handleFocusTrap} className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" style={style} role="dialog" aria-modal="true" aria-label="Command palette">
      {/* Backdrop: scrim (kept) + glass layer (spec section 5). Frost tint + backdrop
          blur scale with --ds-effect-intensity, collapsing to a plain scrim at 0.
          Glass is sanctioned on overlay backdrops only. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: 'var(--ds-overlay-backdrop, rgba(0, 0, 0, 0.5))',
          backgroundImage: 'linear-gradient(var(--ds-glass-scrim-tint), var(--ds-glass-scrim-tint))',
          backdropFilter: 'var(--ds-glass-backdrop-filter)',
          WebkitBackdropFilter: 'var(--ds-glass-backdrop-filter)',
        }}
        onClick={() => onOpenChange(false)}
      />
      {/* Dialog */}
      <div className={`relative rounded-xl w-full max-w-lg overflow-hidden ${className}`} style={{ background: 'var(--ds-surface-card)', boxShadow: 'var(--ds-elevation-2)' }}>
        {/* Search */}
        <div className="p-3" style={{ borderBottom: '1px solid var(--ds-color-border)' }}>
          <input
            ref={inputRef}
            type="text"
            className="w-full text-lg focus:outline-none"
            style={{ padding: 'var(--ds-spacing-2, 8px) 0', fontSize: 'var(--ds-font-size-lg, 16px)', border: 'none', background: 'transparent', color: 'inherit' }}
            placeholder={placeholder}
            value={query}
            onChange={(e) => { setQuery(e.target.value); onSearch?.(e.target.value); }}
            onKeyDown={handleKeyDown}
            role="combobox"
            aria-expanded="true"
            aria-controls="command-palette-listbox"
            aria-activedescendant={activeIndex >= 0 ? `command-palette-option-${activeIndex}` : undefined}
          />
        </div>
        {/* Results */}
        <div className="overflow-y-auto py-2" style={{ maxHeight }} role="listbox" id="command-palette-listbox">
          {/* Show the "Recent" section only when there is no active query,
              giving users quick access to previously used commands. */}
          {!query && recentItems && recentItems.length > 0 && (
            <div className="px-3 pb-2">
              <div style={{ ...menuSectionTitleStyle, marginBottom: 4 }}>Recent</div>
              {recentItems.map((item) => {
                itemIndex++;
                const idx = itemIndex;
                return (
                  <div
                    key={item.id}
                    id={`command-palette-option-${idx}`}
                    role="option"
                    aria-selected={activeIndex === idx}
                    aria-disabled={item.disabled || undefined}
                    onClick={() => handleSelect(item)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    style={activeIndex === idx ? { background: 'var(--ds-surface-inset)' } : undefined}
                    onMouseEnter={(e) => { if (activeIndex !== idx) (e.currentTarget as HTMLElement).style.background = 'var(--ds-surface-inset)'; }}
                    onMouseLeave={(e) => { if (activeIndex !== idx) (e.currentTarget as HTMLElement).style.background = ''; }}
                  >
                    <div className="flex items-center gap-2">
                      {item.icon}
                      <div>
                        <div className="font-medium text-sm">{item.label}</div>
                        {item.description && (
                          <div className="text-xs" style={{ color: 'var(--ds-color-text-secondary)' }}>{item.description}</div>
                        )}
                      </div>
                    </div>
                    {item.shortcut && <kbd style={{ padding: '2px 6px', borderRadius: 'var(--ds-radius-sm)', border: '1px solid var(--ds-color-border)', background: 'var(--ds-surface-inset)', fontSize: 'var(--ds-font-size-xs, 12px)', fontFamily: 'var(--ds-font-family-mono, monospace)' }}>{item.shortcut}</kbd>}
                  </div>
                );
              })}
            </div>
          )}
          {/* Render grouped results. Groups with an empty-string key (items
              that had no `group` field) render without a section header. */}
          {Object.entries(grouped).map(([group, groupItems]) => (
            <div key={group}>
              {group && (
              <div
                style={{
                  ...menuSectionTitleStyle,
                  color: 'var(--ds-search-category-color, var(--ds-color-text-muted))',
                  paddingLeft: 20,
                  paddingRight: 20,
                  paddingTop: 12,
                  paddingBottom: 4,
                }}
              >
                {group}
              </div>
            )}
              {groupItems.map((item) => {
                itemIndex++;
                const idx = itemIndex;
                return (
                  <div
                    key={item.id}
                    id={`command-palette-option-${idx}`}
                    role="option"
                    aria-selected={activeIndex === idx}
                    aria-disabled={item.disabled || undefined}
                    onClick={() => handleSelect(item)}
                    className={`flex items-center justify-between px-4 py-2 cursor-pointer ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    style={activeIndex === idx ? { background: 'var(--ds-surface-inset)' } : undefined}
                    onMouseEnter={(e) => { if (activeIndex !== idx) (e.currentTarget as HTMLElement).style.background = 'var(--ds-surface-inset)'; }}
                    onMouseLeave={(e) => { if (activeIndex !== idx) (e.currentTarget as HTMLElement).style.background = ''; }}
                  >
                    <div className="flex items-center gap-2">
                      {item.icon}
                      <div>
                        <div className="font-medium text-sm">{item.label}</div>
                        {item.description && (
                          <div className="text-xs" style={{ color: 'var(--ds-color-text-secondary)' }}>{item.description}</div>
                        )}
                      </div>
                    </div>
                    {item.shortcut && <kbd style={{ padding: '2px 6px', borderRadius: 'var(--ds-radius-sm)', border: '1px solid var(--ds-color-border)', background: 'var(--ds-surface-inset)', fontSize: 'var(--ds-font-size-xs, 12px)', fontFamily: 'var(--ds-font-family-mono, monospace)' }}>{item.shortcut}</kbd>}
                  </div>
                );
              })}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-8 text-sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
              {emptyMessage}
            </div>
          )}
        </div>
        {/* Footer */}
        {footer && (
          <div className="px-4 py-2 text-xs" style={{ borderTop: '1px solid var(--ds-color-border)', color: 'var(--ds-color-text-secondary)' }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
