'use client';

/**
 * ShortcutsOverlay - Classic Engine (Ant Design)
 */

import React, { useState, useMemo } from 'react';
import { Modal, Input, Empty, Typography, Tag, Space } from 'antd';
import { formatShortcutKey } from '../../../../hooks/shortcuts';
import type { ShortcutsOverlayProps, ShortcutDisplayItem } from '../ShortcutsOverlay.types';

const { Text, Title } = Typography;
const { Search } = Input;

export default function ClassicShortcutsOverlay(props: ShortcutsOverlayProps) {
  const {
    open,
    onOpenChange,
    shortcuts,
    title = 'Keyboard Shortcuts',
    searchPlaceholder = 'Search shortcuts...',
    emptyMessage = 'No matching shortcuts.',
    footer,
    className,
    style,
  } = props;

  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query) return shortcuts;
    const q = query.toLowerCase();
    return shortcuts.filter(
      (s) =>
        s.description.toLowerCase().includes(q) ||
        s.key.toLowerCase().includes(q) ||
        s.category?.toLowerCase().includes(q)
    );
  }, [shortcuts, query]);

  const grouped = useMemo(() => {
    const groups: Record<string, ShortcutDisplayItem[]> = {};
    for (const item of filtered) {
      const cat = item.category ?? 'General';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    }
    return groups;
  }, [filtered]);

  const handleClose = () => {
    onOpenChange(false);
    setQuery('');
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={footer ?? null}
      closable
      title={title}
      className={className}
      style={style}
      width={520}
      styles={{
        body: { padding: 0, maxHeight: 480, overflowY: 'auto' },
      }}
    >
      <div style={{ padding: '12px 24px', borderBottom: '1px solid var(--ds-color-border)' }}>
        <Search
          placeholder={searchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          allowClear
          variant="borderless"
        />
      </div>
      <div style={{ padding: '8px 0' }}>
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category} style={{ padding: '8px 0' }}>
            <div style={{ padding: '4px 24px 8px' }}>
              <Text
                type="secondary"
                style={{
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: 0.8,
                  fontWeight: 600,
                }}
              >
                {category}
              </Text>
            </div>
            {items.map((item) => (
              <div
                key={item.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 24px',
                }}
              >
                <Text style={{ fontSize: 13 }}>{item.description}</Text>
                <Space size={4}>
                  {formatShortcutKey(item.key).map((segment, i) => (
                    <Tag
                      key={i}
                      style={{
                        margin: 0,
                        fontFamily: 'var(--ds-font-mono, monospace)',
                        fontSize: 11,
                        minWidth: 24,
                        textAlign: 'center',
                        lineHeight: '20px',
                      }}
                    >
                      {segment}
                    </Tag>
                  ))}
                </Space>
              </div>
            ))}
          </div>
        ))}
        {filtered.length === 0 && (
          <Empty
            description={emptyMessage}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ padding: '24px 0' }}
          />
        )}
      </div>
    </Modal>
  );
}
