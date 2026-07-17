'use client';

/**
 * @fileoverview ShortcutsOverlay -- Classic engine (Ant Design).
 * Modal dialog that displays keyboard shortcuts grouped by category
 * with a search filter. Each key combination is rendered as Ant Design
 * Tags styled with a monospace font. Uses Ant's Modal for the dialog
 * chrome and Input.Search for the filter bar.
 *
 * @example
 * <ClassicShortcutsOverlay
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   shortcuts={[{ key: 'ctrl+s', description: 'Save', category: 'File' }]}
 * />
 */

import React, { useState, useMemo } from 'react';
import { Modal, Input, Empty, Typography, Tag, Space } from 'antd';
import { formatShortcutKey } from '../../../../../../infrastructure/runtime/application/interaction/shortcuts';
import type { ShortcutsOverlayProps, ShortcutDisplayItem } from '../../contracts';

const { Text, Title } = Typography;
const { Search } = Input;

/**
 * Classic (Ant Design) implementation of the ShortcutsOverlay pattern.
 * Renders shortcuts in a searchable, categorized list inside an Ant Modal.
 * Key segments are displayed as individual Tag elements with monospace font.
 *
 * @param props - See {@link ShortcutsOverlayProps} for the full prop contract.
 * @returns The rendered shortcuts overlay modal.
 */
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

  /* Filter shortcuts by query against description, key combo, and category name */
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

  /* Group filtered shortcuts by category for sectioned display */
  const grouped = useMemo(() => {
    const groups: Record<string, ShortcutDisplayItem[]> = {};
    for (const item of filtered) {
      const cat = item.category ?? 'General';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    }
    return groups;
  }, [filtered]);

  /** Closes the modal and resets the search query for a clean re-open */
  const handleClose = () => {
    onOpenChange(false);
    setQuery('');
  };

  return (
    /* Modal width set to 520px to match typical keyboard-shortcut panel sizing.
         Body padding is zeroed so we can control spacing per section. */
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
      {/* Search bar pinned at top with a bottom border separator.
           Borderless variant keeps the search input visually integrated with the modal chrome. */}
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
            {/* Each shortcut row: description on left, key tags on right */}
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
                {/* formatShortcutKey splits combos like "ctrl+shift+s" into individual segments */}
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
        {/* Empty state shown when search yields no results; uses Ant's simple image variant */}
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
