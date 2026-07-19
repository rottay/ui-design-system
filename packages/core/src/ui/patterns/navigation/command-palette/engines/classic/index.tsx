'use client';

/**
 * @fileoverview Classic (Ant Design) engine for the CommandPalette pattern.
 * Renders a searchable command list inside an Ant Design Modal with keyboard
 * navigation (Arrow Up/Down, Enter). Items are grouped by optional `group`
 * field, with a "Recent" section shown when the search query is empty.
 *
 * @example
 * <ClassicCommandPalette
 *   open={true}
 *   onOpenChange={setOpen}
 *   items={[{ id: '1', label: 'Save', onSelect: save, shortcut: 'Cmd+S' }]}
 * />
 */

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Modal, Input, Empty, Typography, Space, Tag } from 'antd';
import { arrayValueAt } from '@/foundation/kernel/collections';
import type { CommandPaletteProps, CommandItem } from '../../contracts';
import { useCommandArgumentMode } from '../../runtime/argument-mode';

const { Text } = Typography;

/**
 * Classic (Ant Design) command palette rendered inside a centered Modal overlay.
 * @param props - CommandPaletteProps controlling open state, items, search, and footer.
 * @returns An Ant Design Modal containing a search input and grouped result list.
 */
export default function ClassicCommandPalette(props: CommandPaletteProps) {
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
  const inputRef = useRef<any>(null);
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

  // flatItems lists the keyboard rows in RENDER order (recent section first,
  // then grouped sections), excluding non-selectable error rows -- so
  // activeIndex N is always the Nth highlighted row on screen.
  const flatItems = useMemo(() => {
    const rows: CommandItem[] = [];
    if (showRecent) rows.push(...visibleRecent);
    for (const groupItems of Object.values(grouped)) {
      for (const item of groupItems) {
        if (item.kind !== 'error') rows.push(item);
      }
    }
    return rows;
  }, [showRecent, visibleRecent, grouped]);

  // Reset the keyboard cursor to the first item whenever the search query
  // changes, so the user always starts from the top of the new result set.
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Reset search and auto-focus the input when the palette opens.
  // The 50ms delay is needed because the Ant Modal transition must finish
  // before the DOM input is focusable.
  useEffect(() => {
    if (open) {
      setQuery('');
      resetArgumentMode();
      setTimeout(() => inputRef.current?.focus(), 50);
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

  // Keyboard navigation handler. ArrowDown/ArrowUp move the active index
  // within bounds; Enter triggers the currently highlighted item. In argument
  // mode, Enter confirms and Escape pops back to search -- stopPropagation
  // keeps the Ant Modal's own Escape-to-close listener out of the pop.
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
      setActiveIndex((i) => Math.min(i + 1, flatItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = activeIndex >= 0 ? arrayValueAt(flatItems, activeIndex) : undefined;
      if (item) handleSelect(item);
    }
  };

  // Propagate query changes to both local state and the optional external
  // onSearch callback, allowing the consumer to perform server-side filtering.
  // In argument mode the same input collects the argument value instead.
  const handleQueryChange = (val: string) => {
    if (mode === 'argument') {
      setArgumentValue(val);
      return;
    }
    setQuery(val);
    onSearch?.(val);
  };

  // Mutable counter tracks the flattened index across all groups and sections
  // so keyboard activeIndex maps to the correct visual item.
  let itemIndex = -1;

  return (
    <Modal
      open={open}
      onCancel={() => onOpenChange(false)}
      footer={footer ?? null}
      closable={false}
      className={className}
      style={style}
      width={560}
      styles={{ body: { padding: 0 } }}
    >
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--ds-command-palette-border, var(--ds-color-border))', display: 'flex', alignItems: 'center', gap: 8 }}>
        {mode === 'argument' && pendingItem && (
          <Tag style={{ marginInlineEnd: 0 }}>{pendingItem.label}</Tag>
        )}
        <Input
          ref={inputRef}
          placeholder={mode === 'argument' ? pendingItem?.parameter?.placeholder ?? '' : placeholder}
          value={mode === 'argument' ? argumentValue : query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          allowClear
          size="large"
          variant="borderless"
        />
      </div>
      {mode === 'argument' && pendingItem ? (
        <div style={{ padding: '12px 16px' }}>
          <Text type="secondary" style={{ fontSize: 13 }}>
            {pendingItem.parameter?.prompt}
          </Text>
          {argumentError && (
            <div role="alert" style={{ marginTop: 4 }}>
              <Text type="danger" style={{ fontSize: 12 }}>
                {argumentError}
              </Text>
            </div>
          )}
        </div>
      ) : (
      <div style={{ maxHeight, overflowY: 'auto', padding: '8px 0' }}>
        {/* Show the "Recent" section only when there is no active query,
            giving users quick access to previously used commands. */}
        {showRecent && (
          <div style={{ padding: '4px 16px 8px' }}>
            <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Recent
            </Text>
            {visibleRecent.map((item) => {
              itemIndex++;
              const idx = itemIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  style={{
                    padding: '8px 12px',
                    cursor: item.disabled ? 'not-allowed' : 'pointer',
                    opacity: item.disabled ? 0.5 : 1,
                    background: activeIndex === idx ? 'var(--ds-color-bg-secondary)' : 'transparent',
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Space>
                    {item.icon}
                    <div>
                      <div style={{ fontWeight: 500 }}>{item.label}</div>
                      {item.description && (
                        <Text type="secondary" style={{ fontSize: 12 }}>{item.description}</Text>
                      )}
                    </div>
                  </Space>
                  {item.shortcut && <Tag>{item.shortcut}</Tag>}
                </div>
              );
            })}
          </div>
        )}
        {/* Render grouped results. Groups with an empty-string key (items
            that had no `group` field) are rendered without a section header. */}
        {Object.entries(grouped).map(([group, groupItems]) => (
          <div key={group}>
            {group && (
              <div style={{ padding: '8px 16px 4px' }}>
                <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {group}
                </Text>
              </div>
            )}
            {groupItems.map((item) => {
              if (item.kind === 'error') {
                return (
                  <div key={item.id} role="status" style={{ padding: '8px 16px' }}>
                    <div style={{ fontWeight: 500 }}>
                      <Text type="danger">{item.label}</Text>
                    </div>
                    {item.description && (
                      <Text type="secondary" style={{ fontSize: 12 }}>{item.description}</Text>
                    )}
                  </div>
                );
              }
              itemIndex++;
              const idx = itemIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  style={{
                    padding: '8px 16px',
                    cursor: item.disabled ? 'not-allowed' : 'pointer',
                    opacity: item.disabled ? 0.5 : 1,
                    background: activeIndex === idx ? 'var(--ds-color-bg-secondary)' : 'transparent',
                    borderRadius: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Space>
                    {item.icon}
                    <div>
                      <div style={{ fontWeight: 500 }}>{item.label}</div>
                      {item.description && (
                        <Text type="secondary" style={{ fontSize: 12 }}>{item.description}</Text>
                      )}
                    </div>
                  </Space>
                  {item.shortcut && <Tag>{item.shortcut}</Tag>}
                </div>
              );
            })}
          </div>
        ))}
        {filtered.length === 0 && (
          <Empty description={emptyMessage} image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </div>
      )}
    </Modal>
  );
}
