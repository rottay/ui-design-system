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
import { arrayValueAt } from '@/foundation/kernel/collections';
import type { CommandPaletteProps, CommandItem } from '../../contracts';
import { useCommandArgumentMode } from '../../runtime/argument-mode';
import { menuSectionTitleStyle } from '../../../../foundation/engine-styles/modern';

// The grouped section label's color is owned by the skin so a tenant's
// `--ds-search-category-color` override reaches it; an inline color would beat the
// unlayered skin, so the label spreads this color-free copy of the shared title style.
// (The Recent heading keeps the full `menuSectionTitleStyle`, muted, unchanged.)
const { color: _menuSectionTitleColor, ...menuSectionTitleBase } = menuSectionTitleStyle;

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
  const {
    mode,
    pendingItem,
    argumentValue,
    argumentError,
    enterArgumentMode,
    setArgumentValue,
    confirmArgument,
    cancelArgument,
    resetArgumentMode,
  } = useCommandArgumentMode();

  // Case-insensitive substring match on both label and description so
  // users can search by intent ("delete") not just the exact command name.
  // With an onSearch handler the parent owns filtering (async sources return
  // rows whose labels need not contain the query), so items pass through.
  const filtered = useMemo(() => {
    if (!query || onSearch) return items;
    const q = query.toLowerCase();
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q)
    );
  }, [items, query, onSearch]);

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

  const visibleRecent = useMemo(
    () => (recentItems ?? []).filter((item) => item.kind !== 'error'),
    [recentItems]
  );
  const showRecent = !query && visibleRecent.length > 0;

  // Keyboard rows in RENDER order (recent section first, then grouped
  // sections), excluding non-selectable error rows -- so activeIndex N is
  // always the Nth highlighted row on screen.
  const navigableItems = useMemo(() => {
    const rows: CommandItem[] = [];
    if (showRecent) rows.push(...visibleRecent);
    for (const groupItems of Object.values(grouped)) {
      for (const item of groupItems) {
        if (item.kind !== 'error') rows.push(item);
      }
    }
    return rows;
  }, [showRecent, visibleRecent, grouped]);

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
      resetArgumentMode();
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      // Return focus to the element that opened the palette
      if (triggerRef.current && triggerRef.current instanceof HTMLElement) {
        triggerRef.current.focus();
      }
      triggerRef.current = null;
    }
  }, [open, resetArgumentMode]);

  // Execute the item's onSelect callback and close the palette. Disabled
  // items and error rows are silently ignored; parameterized items enter
  // argument mode instead of executing (the query is kept for Escape).
  const handleSelect = useCallback(
    (item: CommandItem) => {
      if (item.disabled || item.kind === 'error') return;
      if (item.parameter) {
        enterArgumentMode(item, query);
        return;
      }
      item.onSelect();
      onOpenChange(false);
    },
    [onOpenChange, enterArgumentMode, query]
  );

  // Keyboard navigation: ArrowDown/ArrowUp move the cursor, Enter selects,
  // Escape closes. preventDefault on arrows stops the input caret from jumping.
  // In argument mode, Enter confirms the value and Escape pops back to
  // search (never closes) -- stopPropagation keeps outer dismiss handlers out.
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (mode === 'argument') {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (confirmArgument()) onOpenChange(false);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        cancelArgument();
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, navigableItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = activeIndex >= 0 ? arrayValueAt(navigableItems, activeIndex) : undefined;
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

  // Early return avoids rendering the backdrop/portal when closed, which
  // is cheaper than CSS visibility toggling for a rarely-open overlay.
  if (!open) return null;

  // Mutable counter spans all sections (recent + grouped) so the
  // keyboard activeIndex always maps to the correct visual row.
  let itemIndex = -1;

  return (
    <div ref={dialogRef} onKeyDown={handleFocusTrap} className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] ds-pattern-command-palette ds-engine-modern" data-part="root" data-mode={mode} style={style} role="dialog" aria-modal="true" aria-label="Command palette">
      {/* Backdrop: scrim + sanctioned glass layer; painted by the engine skin. */}
      <div
        className="absolute inset-0"
        data-part="backdrop"
        onClick={() => onOpenChange(false)}
      />
      {/* Dialog */}
      <div className={`relative rounded-xl w-full max-w-lg overflow-hidden ${className}`} data-part="dialog">
        {/* Search */}
        <div className="p-3" data-part="search" style={mode === 'argument' ? { display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2, 8px)' } : undefined}>
          {mode === 'argument' && pendingItem && (
            <span
              data-part="argument-chip"
              style={{
                flexShrink: 0,
                padding: '2px 8px',
                fontSize: 'var(--ds-font-size-xs, 12px)',
                fontWeight: 500,
                whiteSpace: 'nowrap',
              }}
            >
              {pendingItem.label}
            </span>
          )}
          <input
            ref={inputRef}
            type="text"
            data-part="input"
            className="w-full text-lg focus:outline-none"
            style={{ padding: 'var(--ds-spacing-2, 8px) 0', fontSize: 'var(--ds-font-size-lg, 16px)' }}
            placeholder={mode === 'argument' ? pendingItem?.parameter?.placeholder ?? '' : placeholder}
            value={mode === 'argument' ? argumentValue : query}
            onChange={(e) => {
              if (mode === 'argument') {
                setArgumentValue(e.target.value);
                return;
              }
              setQuery(e.target.value);
              onSearch?.(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            role="combobox"
            aria-expanded={mode === 'search'}
            aria-controls={mode === 'search' ? 'command-palette-listbox' : undefined}
            aria-activedescendant={mode === 'search' && activeIndex >= 0 ? `command-palette-option-${activeIndex}` : undefined}
          />
        </div>
        {/* Argument mode replaces the result list with the parameter prompt. */}
        {mode === 'argument' && pendingItem ? (
          <div className="px-4 py-3">
            <div data-part="argument-prompt" className="text-sm">
              {pendingItem.parameter?.prompt}
            </div>
            {argumentError && (
              <div
                data-part="argument-error"
                role="alert"
                className="text-xs"
                style={{ marginTop: 'var(--ds-spacing-1, 4px)' }}
              >
                {argumentError}
              </div>
            )}
          </div>
        ) : (
        <div className="overflow-y-auto py-2" style={{ maxHeight }} role="listbox" id="command-palette-listbox">
          {/* Show the "Recent" section only when there is no active query,
              giving users quick access to previously used commands. */}
          {showRecent && (
            <div className="px-3 pb-2">
              <div style={{ ...menuSectionTitleStyle, marginBottom: 4 }}>Recent</div>
              {visibleRecent.map((item) => {
                itemIndex++;
                const idx = itemIndex;
                return (
                  <div
                    key={item.id}
                    id={`command-palette-option-${idx}`}
                    role="option"
                    aria-selected={activeIndex === idx}
                    aria-disabled={item.disabled || undefined}
                    data-part="item"
                    data-active={activeIndex === idx}
                    onClick={() => handleSelect(item)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      {item.icon}
                      <div>
                        <div className="font-medium text-sm">{item.label}</div>
                        {item.description && (
                          <div className="text-xs" data-part="description">{item.description}</div>
                        )}
                      </div>
                    </div>
                    {item.shortcut && <kbd data-part="shortcut" style={{ padding: '2px 6px', fontSize: 'var(--ds-font-size-xs, 12px)', fontFamily: 'var(--ds-font-family-mono, monospace)' }}>{item.shortcut}</kbd>}
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
                data-part="group-label"
                style={{
                  ...menuSectionTitleBase,
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
                if (item.kind === 'error') {
                  return (
                    <div
                      key={item.id}
                      data-part="error"
                      role="status"
                      className="px-4 py-2"
                    >
                      <div className="font-medium text-sm">{item.label}</div>
                      {item.description && (
                        <div className="text-xs" data-part="description">{item.description}</div>
                      )}
                    </div>
                  );
                }
                itemIndex++;
                const idx = itemIndex;
                return (
                  <div
                    key={item.id}
                    id={`command-palette-option-${idx}`}
                    role="option"
                    aria-selected={activeIndex === idx}
                    aria-disabled={item.disabled || undefined}
                    data-part="item"
                    data-active={activeIndex === idx}
                    onClick={() => handleSelect(item)}
                    className={`flex items-center justify-between px-4 py-2 cursor-pointer ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      {item.icon}
                      <div>
                        <div className="font-medium text-sm">{item.label}</div>
                        {item.description && (
                          <div className="text-xs" data-part="description">{item.description}</div>
                        )}
                      </div>
                    </div>
                    {item.shortcut && <kbd data-part="shortcut" style={{ padding: '2px 6px', fontSize: 'var(--ds-font-size-xs, 12px)', fontFamily: 'var(--ds-font-family-mono, monospace)' }}>{item.shortcut}</kbd>}
                  </div>
                );
              })}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-8 text-sm" data-part="empty">
              {emptyMessage}
            </div>
          )}
        </div>
        )}
        {/* Footer */}
        {footer && (
          <div className="px-4 py-2 text-xs" data-part="footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
