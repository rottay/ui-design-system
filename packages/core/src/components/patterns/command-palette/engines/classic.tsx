'use client';

/**
 * CommandPalette - Classic Engine (Ant Design)
 */

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Modal, Input, Empty, Typography, Space, Tag } from 'antd';
import type { CommandPaletteProps, CommandItem } from '../CommandPalette.types';

const { Text } = Typography;

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

  const flatItems = useMemo(() => filtered, [filtered]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

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
      setActiveIndex((i) => Math.min(i + 1, flatItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = flatItems[activeIndex];
      if (item) handleSelect(item);
    }
  };

  const handleQueryChange = (val: string) => {
    setQuery(val);
    onSearch?.(val);
  };

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
