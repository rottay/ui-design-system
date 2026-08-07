'use client';

/**
 * @fileoverview Modern engine for the CommandPalette pattern.
 *
 * A searchable command list inside the certified Modal primitive, with FULL
 * APG combobox wiring (role=combobox + aria-expanded/controls/
 * activedescendant on the input, listbox/options, arrows to move, Enter to
 * select, Escape to close) and argument mode for parameterized commands. The
 * blocking chamber, backdrop, native top-layer focus trap, sibling inerting
 * and focus restore all belong to Modal — this pattern hand-rolls none of
 * them. Every APG id is instance-scoped through `useId`, so two palettes on
 * one page never cross-wire their virtual focus.
 *
 * COMPOSITION LAW: the search box is the certified Input primitive (its
 * contract exposes the combobox aria props and forwards ref — it was built
 * for exactly this), shortcut hints compose Kbd, the argument
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

import React, { useState, useMemo, useRef, useEffect, useCallback, useId } from 'react';
import { arrayValueAt } from '@/foundation/kernel/collections';
import type { CommandPaletteProps, CommandItem } from '../../contracts';
import { useCommandArgumentMode } from '../../runtime/argument-mode';
import Modal from '../../../../../primitives/feedback/Modal/engines/modern';
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
 * @returns The governed Modal chamber carrying the palette content.
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
  // Instance-scoped APG ids: two palettes on one page must not collide, or the
  // input's aria-activedescendant resolves into the OTHER palette's listbox.
  const instanceId = useId();
  const listboxId = `${instanceId}-listbox`;
  const optionId = (idx: number) => `${instanceId}-option-${idx}`;
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

  // Reset search and route INITIAL focus to the search box on open. Focus
  // RESTORE on close is deliberately absent: the composed Modal opens a native
  // <dialog> with showModal(), and the dialog's close steps return focus to the
  // previously-focused element for us. The short delay is needed because the
  // Modal portals its content, so the input exists a commit later.
  useEffect(() => {
    if (!open) return;
    setQuery('');
    resetArgumentMode();
    const focusTimer = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(focusTimer);
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
  //
  // Bound to the palette CONTENT wrapper, not the input: the whole chamber is
  // operable, so a user who tabbed to a row or to a caller footer control can
  // still drive the list. Tab is NOT handled here on purpose -- the native
  // <dialog> top layer owns focus cycling, and intercepting it would fight the
  // browser's own trap.
  //
  // Escape preventDefault matters in BOTH modes: it suppresses the native
  // dialog close request so this handler stays the single authority -- popping
  // back to search in argument mode, closing explicitly in search mode. Modal's
  // own closeOnEscape remains the backstop for focus parked outside this
  // wrapper.
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
      e.preventDefault();
      onOpenChange(false);
    }
  };

  // Mutable counter spans all sections (recent + grouped) so the
  // keyboard activeIndex always maps to the correct visual row.
  let itemIndex = -1;

  /** One option row (recent section and grouped sections share the anatomy). */
  const renderItem = (item: CommandItem, idx: number) => (
    <div
      key={item.id}
      id={optionId(idx)}
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
    /* The blocking chamber IS the certified Modal: native <dialog> top layer,
       backdrop + click-to-close, sibling inerting, focus trap and focus
       restore all arrive certified. This pattern supplies content only.
       `padding='none'` because the palette owns its own section rhythm;
       `closable`/`hideFooter` off because the palette has no chrome row of its
       own; `radius='xl'` rides Modal's governed radius channel so the phone
       fullscreen posture can still flatten it to 0 (a hard-coded skin radius
       could not). The caller's className/style join the palette scope on the
       surface — the card they used to describe. */
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      aria-label={dialogLabel}
      placement="top"
      padding="none"
      radius="xl"
      hideFooter
      closable={false}
      blurBackdrop
      className={['ds-pattern-command-palette', 'ds-engine-modern', className]
        .filter(Boolean)
        .join(' ')}
      style={style}
    >
      {/* Palette content wrapper: carries the pattern's own state stamps
          (data-mode / data-loading) and the chamber-wide key handler. */}
      <div
        data-part="content"
        data-mode={mode}
        data-loading={loading}
        onKeyDown={handleKeyDown}
      >
        {/* Search: argument mode adds the breadcrumb chip beside the input
            (the flex layout switch is skin-owned off the surface scope). */}
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
              first-class and forwards ref — the APG wiring lands on the real
              textbox. The key handler now sits on the content wrapper above,
              so the whole chamber is operable, not just this field. */}
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
            role="combobox"
            aria-expanded={mode === 'search'}
            aria-controls={mode === 'search' ? listboxId : undefined}
            aria-activedescendant={
              mode === 'search' && activeIndex >= 0 && activeIndex < navigableItems.length
                ? optionId(activeIndex)
                : undefined
            }
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
        <div data-part="list" style={{ maxHeight }} role="listbox" id={listboxId}>
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
            <div data-part="empty" role="status">
              <Empty image="simple" description={emptyText} />
            </div>
          )}
        </div>
        )}
        {/* Footer (caller slot: hints/links arrive already composed). This is
            the PALETTE's footer, inside Modal's body — Modal's own footer is
            suppressed via hideFooter, so the two never collide. */}
        {footer && (
          <div data-part="footer">
            {footer}
          </div>
        )}
      </div>
    </Modal>
  );
}
