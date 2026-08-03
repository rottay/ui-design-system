'use client';

/**
 * @fileoverview Modern engine for the CommandPalette pattern.
 *
 * A searchable command list in a custom fixed-position overlay (not a
 * framework modal) with backdrop click-to-close, FULL APG combobox wiring
 * (role=combobox + aria-expanded/controls/activedescendant on the input,
 * listbox/options, arrows to move, Enter to select, Escape to close and
 * return focus), a focus trap, and argument mode for parameterized commands.
 * The overlay is conditionally unmounted rather than hidden to avoid
 * stacking invisible listeners.
 *
 * COMPOSITION LAW: the search box is the certified Input primitive (its
 * contract exposes the combobox aria props and forwards onKeyDown/ref — it
 * was built for exactly this), shortcut hints compose Kbd, the argument
 * breadcrumb composes Tag inside its pinned data-part wrapper, and the
 * no-results state composes Empty. ScrollArea is deliberately NOT composed:
 * the listbox element must keep its own role/id for `aria-controls`, and
 * ScrollArea's viewport does not forward them — documented, contract
 * minimal intact. Match highlighting is likewise NOT implemented on
 * purpose: the family tests pin exact label text (`findByText('Open
 * report')` under an active query), which any segmented match markup would
 * break — pin documented, tests untouched. The contracted `loading` prop
 * (previously destructured but dead) now stamps data-loading and swaps the
 * result list for a skeleton footprint that mirrors the row anatomy.
 *
 * Copy runs through the guarded i18n channel with documented English floors
 * (the defaults double as test pins: 'Type a command...', 'No results
 * found.', 'Recent', 'Command palette'); caller props always win.
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
import Input from '../../../../../primitives/inputs/Input/engines/modern';
import Empty from '../../../../../primitives/display/Empty/engines/modern';
import Tag from '../../../../../primitives/display/Tag/engines/modern';
import Kbd from '../../../../../primitives/display/Kbd/engines/modern';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';

/** Hook-local `tOr`: catalogue value with an English floor, never a raw key. */
function useCommandPaletteTranslation() {
  const i18n = useOptionalTranslation('components');
  const tOr = (key: string, fallback: string): string => {
    const resolved = i18n?.t(key);
    if (!resolved || resolved === key || resolved === `components.${key}`) return fallback;
    return resolved;
  };
  return { tOr };
}

/**
 * Modern (token-driven) command palette with full keyboard navigation.
 * @param props - CommandPaletteProps controlling open state, items, search, and footer.
 * @returns A fixed overlay with backdrop and a rounded dialog card, or null when closed.
 */
export default function ModernCommandPalette(props: CommandPaletteProps) {
  const { tOr } = useCommandPaletteTranslation();
  const {
    open,
    onOpenChange,
    items,
    placeholder,
    emptyMessage,
    onSearch,
    footer,
    recentItems,
    maxHeight = 400,
    className = '',
    style,
    loading = false,
  } = props;

  /* Localized owned copy (callers can still override every string by prop). */
  const dialogLabel = tOr('commandPalette.dialogLabel', 'Command palette');
  const placeholderText = placeholder ?? tOr('commandPalette.placeholder', 'Type a command...');
  const emptyText = emptyMessage ?? tOr('commandPalette.empty', 'No results found.');
  const recentLabel = tOr('commandPalette.recent', 'Recent');

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
  // input. The short delay is needed because the DOM element must be
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

  /** One option row (recent section and grouped sections share the anatomy). */
  const renderItem = (item: CommandItem, idx: number) => (
    <div
      key={item.id}
      id={`command-palette-option-${idx}`}
      role="option"
      aria-selected={activeIndex === idx}
      aria-disabled={item.disabled || undefined}
      data-part="item"
      data-active={activeIndex === idx}
      onClick={() => handleSelect(item)}
    >
      <div data-part="item-main">
        {item.icon}
        <div data-part="item-text">
          <div data-part="label">{item.label}</div>
          {item.description && (
            <div data-part="description">{item.description}</div>
          )}
        </div>
      </div>
      {/* Shortcut hint: certified Kbd inside its anatomy wrapper (the Kbd
          engine owns its key-cap paint and does not forward data-part). */}
      {item.shortcut && (
        <span data-part="shortcut">
          <Kbd size="sm">{item.shortcut}</Kbd>
        </span>
      )}
    </div>
  );

  return (
    <div
      ref={dialogRef}
      onKeyDown={handleFocusTrap}
      className="ds-pattern-command-palette ds-engine-modern"
      data-part="root"
      data-mode={mode}
      data-loading={loading}
      style={style}
      role="dialog"
      aria-modal="true"
      aria-label={dialogLabel}
    >
      {/* Backdrop: scrim + sanctioned glass layer; painted by the engine skin. */}
      <div
        data-part="backdrop"
        onClick={() => onOpenChange(false)}
      />
      {/* Dialog */}
      <div className={className} data-part="dialog">
        {/* Search: argument mode adds the breadcrumb chip beside the input
            (the flex layout switch is skin-owned off root[data-mode]). */}
        <div data-part="search">
          {mode === 'argument' && pendingItem && (
            /* The pinned chip wrapper keeps data-part + exact textContent;
               the certified Tag inside owns the pill paint. */
            <span data-part="argument-chip">
              <Tag tone="neutral" size="sm">
                {pendingItem.label}
              </Tag>
            </span>
          )}
          {/* Certified Input: its contract carries the combobox aria props
              first-class and forwards ref + onKeyDown — the APG wiring lands
              on the real textbox. */}
          <Input
            ref={inputRef}
            value={mode === 'argument' ? argumentValue : query}
            placeholder={mode === 'argument' ? pendingItem?.parameter?.placeholder ?? '' : placeholderText}
            onChange={(newValue) => {
              if (mode === 'argument') {
                setArgumentValue(newValue);
                return;
              }
              setQuery(newValue);
              onSearch?.(newValue);
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
          <div data-part="argument-panel">
            <div data-part="argument-prompt">
              {pendingItem.parameter?.prompt}
            </div>
            {argumentError && (
              <div
                data-part="argument-error"
                role="alert"
              >
                {argumentError}
              </div>
            )}
          </div>
        ) : (
        /* ScrollArea is NOT composed here: the listbox must keep role+id for
           aria-controls and its viewport does not forward them. maxHeight
           stays inline (runtime prop, the ScrollArea precedent). */
        <div data-part="list" style={{ maxHeight }} role="listbox" id="command-palette-listbox">
          {/* Loading footprint: skeleton rows mirror the real row anatomy
              (icon well + two text bars) so the panel never reflows when
              async results land. */}
          {loading && (
            <div data-part="loading-list" aria-hidden="true">
              {[0, 1, 2].map((row) => (
                <div data-part="skeleton-row" key={row}>
                  <span data-part="skeleton-icon" />
                  <span data-part="skeleton-text">
                    <span data-part="skeleton-line" />
                    <span data-part="skeleton-line" data-width="short" />
                  </span>
                </div>
              ))}
            </div>
          )}
          {/* Show the "Recent" section only when there is no active query,
              giving users quick access to previously used commands. */}
          {!loading && showRecent && (
            <div data-part="recent">
              <div data-part="section-label">{recentLabel}</div>
              {visibleRecent.map((item) => {
                itemIndex++;
                return renderItem(item, itemIndex);
              })}
            </div>
          )}
          {/* Render grouped results. Groups with an empty-string key (items
              that had no `group` field) render without a section header. */}
          {!loading && Object.entries(grouped).map(([group, groupItems]) => (
            <div key={group}>
              {group && (
                <div data-part="group-label">
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
                    >
                      <div data-part="label">{item.label}</div>
                      {item.description && (
                        <div data-part="description">{item.description}</div>
                      )}
                    </div>
                  );
                }
                itemIndex++;
                return renderItem(item, itemIndex);
              })}
            </div>
          ))}
          {filtered.length === 0 && !loading && (
            <div data-part="empty">
              <Empty image="simple" description={emptyText} />
            </div>
          )}
        </div>
        )}
        {/* Footer (caller slot: hints/links arrive already composed). */}
        {footer && (
          <div data-part="footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
