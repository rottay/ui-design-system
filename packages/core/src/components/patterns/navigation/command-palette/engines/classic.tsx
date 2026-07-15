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
import { arrayValueAt } from '@/_internal/utils/collections';
import type { CommandPaletteProps, CommandItem } from '../CommandPalette.types';

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

  // flatItems is an alias for filtered -- it flattens the conceptual
  // "grouped" structure back into a single array so keyboard navigation
  // can index items by a single integer regardless of group boundaries.
  const flatItems = useMemo(() => filtered, [filtered]);

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

  // Keyboard navigation handler. ArrowDown/ArrowUp move the active index
  // within bounds; Enter triggers the currently highlighted item.
  const handleKeyDown = (e: React.KeyboardEvent) => {
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
  const handleQueryChange = (val: string) => {
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
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--ds-command-palette-border, var(--ds-color-border))' }}>
        <Input
          ref={inputRef}
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          allowClear
          size="large"
          variant="borderless"
        />
      </div>
      <div style={{ maxHeight, overflowY: 'auto', padding: '8px 0' }}>
        {/* Show the "Recent" section only when there is no active query,
            giving users quick access to previously used commands. */}
        {!query && recentItems && recentItems.length > 0 && (
          <div style={{ padding: '4px 16px 8px' }}>
            <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Recent
            </Text>
            {recentItems.map((item) => {
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
        {flatItems.length === 0 && (
          <Empty description={emptyMessage} image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </div>
    </Modal>
  );
}
