'use client';

/**
 * @fileoverview ColumnSettingsDropdown -- Classic engine implementation.
 * A panel for managing table column visibility, ordering, and pinning.
 * Includes a search field to filter the column list, checkboxes for toggling
 * visibility, drag handles for reordering (visual placeholder), and pin
 * toggles (left/right/none).
 *
 * Uses only DS primitives (Box, Flex, Text, Button, Input, Checkbox, Tooltip)
 * so the implementation is identical across all engines.
 */

import { useState, useMemo, useCallback } from 'react';

import {
  Box,
  Flex,
  Text,
  Button,
  Input,
  Checkbox,
  Tooltip,
} from '../../../primitives';
import {
  GripVertical,
  Pin,
  PinOff,
  RotateCcw,
  Search,
} from 'lucide-react';

import type { ColumnSettingsProps, ColumnSettingItem } from '../ColumnSettings.types';

// ============================================================================
// CONSTANTS
// ============================================================================

const TRANSITION_FAST = '150ms ease';
const MAX_LIST_HEIGHT = 320;

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Single column row in the settings list.
 */
function ColumnRow({
  column,
  isVisible,
  isLocked,
  isPinnedLeft,
  isPinnedRight,
  onToggleVisibility,
  onTogglePin,
}: {
  column: ColumnSettingItem;
  isVisible: boolean;
  isLocked: boolean;
  isPinnedLeft: boolean;
  isPinnedRight: boolean;
  onToggleVisibility: (key: string) => void;
  onTogglePin: (key: string, side: 'left' | 'right' | null) => void;
}) {
  const pinSide = isPinnedLeft ? 'left' : isPinnedRight ? 'right' : null;

  const handlePinCycle = useCallback(() => {
    if (pinSide === null) {
      onTogglePin(column.key, 'left');
    } else if (pinSide === 'left') {
      onTogglePin(column.key, 'right');
    } else {
      onTogglePin(column.key, null);
    }
  }, [column.key, pinSide, onTogglePin]);

  const pinTooltipLabel = pinSide === null
    ? 'Pin left'
    : pinSide === 'left'
      ? 'Pin right'
      : 'Unpin';

  return (
    <Flex
      align="center"
      gap={8}
      style={{
        padding: '6px 12px',
        borderRadius: 4,
        transition: `background ${TRANSITION_FAST}`,
        cursor: 'default',
      }}
    >
      {/* Checkbox */}
      <Checkbox
        checked={isVisible}
        disabled={isLocked}
        onChange={() => onToggleVisibility(column.key)}
        size="sm"
      />

      {/* Drag handle (visual indicator, reordering is handled via onReorder) */}
      <Box
        style={{
          color: 'var(--ds-color-text-muted)',
          cursor: 'grab',
          display: 'flex',
          alignItems: 'center',
          opacity: isLocked ? 0.3 : 0.5,
        }}
      >
        <GripVertical size={14} />
      </Box>

      {/* Column name */}
      <Text
        style={{
          flex: 1,
          fontSize: 13,
          color: isVisible
            ? 'var(--ds-color-text-primary)'
            : 'var(--ds-color-text-muted)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          transition: `color ${TRANSITION_FAST}`,
        }}
      >
        {column.header}
      </Text>

      {/* Pin toggle */}
      <Tooltip content={pinTooltipLabel}>
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePinCycle}
          style={{
            minWidth: 24,
            height: 24,
            padding: 0,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: pinSide
              ? 'var(--ds-color-primary)'
              : 'var(--ds-color-text-muted)',
            transition: `color ${TRANSITION_FAST}`,
          }}
        >
          {pinSide ? <Pin size={13} /> : <PinOff size={13} />}
        </Button>
      </Tooltip>

      {/* Pin side indicator */}
      {pinSide && (
        <Text
          style={{
            fontSize: 10,
            color: 'var(--ds-color-primary)',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            fontWeight: 600,
          }}
        >
          {pinSide === 'left' ? 'L' : 'R'}
        </Text>
      )}
    </Flex>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Classic engine implementation of the ColumnSettingsDropdown pattern.
 *
 * Renders a panel with search, visibility toggles, drag handles, and pin
 * controls for each column.
 */
export default function ClassicColumnSettingsDropdown({
  allColumns,
  visibleColumns,
  lockedColumns,
  columnOrder,
  pinnedColumns,
  onToggleVisibility,
  onReorder: _onReorder,
  onTogglePin,
  onReset,
  className,
  style,
}: ColumnSettingsProps) {
  const [searchQuery, setSearchQuery] = useState('');

  /** Columns sorted by the provided order and filtered by search. */
  const sortedColumns = useMemo(() => {
    const orderMap = new Map(columnOrder.map((key, i) => [key, i]));
    const sorted = [...allColumns].sort((a, b) => {
      const aIdx = orderMap.get(a.key) ?? Number.MAX_SAFE_INTEGER;
      const bIdx = orderMap.get(b.key) ?? Number.MAX_SAFE_INTEGER;
      return aIdx - bIdx;
    });

    if (!searchQuery.trim()) return sorted;

    const query = searchQuery.toLowerCase();
    return sorted.filter((col) => {
      const headerText =
        typeof col.header === 'string'
          ? col.header
          : String(col.header ?? col.key);
      return headerText.toLowerCase().includes(query);
    });
  }, [allColumns, columnOrder, searchQuery]);

  const visibleSet = useMemo(() => new Set(visibleColumns), [visibleColumns]);
  const lockedSet = useMemo(() => new Set(lockedColumns), [lockedColumns]);
  const pinnedLeftSet = useMemo(
    () => new Set(pinnedColumns.left),
    [pinnedColumns.left],
  );
  const pinnedRightSet = useMemo(
    () => new Set(pinnedColumns.right),
    [pinnedColumns.right],
  );

  const visibleCount = visibleColumns.length;
  const totalCount = allColumns.length;

  return (
    <Box className={className} style={{ width: '100%', ...style }}>
      {/* Header */}
      <Flex
        align="center"
        justify="between"
        style={{
          padding: '10px 12px 8px',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <Text
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--ds-color-text-primary)',
          }}
        >
          Columns
        </Text>
        <Text
          style={{
            fontSize: 11,
            color: 'var(--ds-color-text-muted)',
          }}
        >
          {visibleCount} / {totalCount} visible
        </Text>
      </Flex>

      {/* Search */}
      <Box style={{ padding: '8px 12px' }}>
        <Input
          size="sm"
          placeholder="Find column..."
          value={searchQuery}
          onChange={setSearchQuery}
          prefix={
            <Search
              size={13}
              style={{ color: 'var(--ds-color-text-muted)' }}
            />
          }
          style={{ height: 30 }}
        />
      </Box>

      {/* Column list */}
      <Box
        style={{
          maxHeight: MAX_LIST_HEIGHT,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '4px 0',
        }}
      >
        {sortedColumns.length === 0 ? (
          <Text
            style={{
              padding: '16px 12px',
              fontSize: 12,
              color: 'var(--ds-color-text-muted)',
              textAlign: 'center',
            }}
          >
            No columns match your search
          </Text>
        ) : (
          sortedColumns.map((col) => (
            <ColumnRow
              key={col.key}
              column={col}
              isVisible={visibleSet.has(col.key)}
              isLocked={lockedSet.has(col.key)}
              isPinnedLeft={pinnedLeftSet.has(col.key)}
              isPinnedRight={pinnedRightSet.has(col.key)}
              onToggleVisibility={onToggleVisibility}
              onTogglePin={onTogglePin}
            />
          ))
        )}
      </Box>

      {/* Footer */}
      <Box
        style={{
          padding: '8px 12px',
          borderTop: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          icon={<RotateCcw size={13} />}
          style={{
            width: '100%',
            justifyContent: 'center',
            fontSize: 12,
            color: 'var(--ds-color-text-muted)',
          }}
        >
          Reset Layout
        </Button>
      </Box>
    </Box>
  );
}
