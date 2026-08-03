'use client';

/**
 * @fileoverview ColumnSettingsDropdown -- Modern engine.
 *
 * A panel for managing table column visibility, ordering, and pinning. The
 * implementation COMPOSES the certified primitives (Checkbox, Input, Button,
 * Tooltip, Empty) -- it never rebuilds a control -- and stamps only anatomy
 * (`data-part`/`data-visible`/`data-locked`/`data-pinned`); every visual
 * decision lives in the modern skin (`skin/column-settings.css`).
 *
 * Keyboard contract: the drag grip is a real button -- focus it and use
 * ArrowUp/ArrowDown to move the column one position (Home/End for the edges).
 * Reordering is paused while the search filter is active (moving an invisible
 * row has no honest target). Visibility toggles are native checkboxes, pin
 * cycling is a native button, and the list scrolls internally.
 *
 * Copy: catalogued via the guarded i18n channel (English floor until the
 * locale JSONs land), never page copy.
 *
 * @module Patterns/ColumnSettings/Engines/Modern
 * @category Patterns
 * @package @rottay/design-system
 */

import { useState, useMemo, useCallback } from 'react';

import {
  Button,
  Checkbox,
  Empty,
  Input,
  Tooltip,
} from '../../../../../primitives';
import {
  GripVerticalIcon as GripVertical,
  PinIcon as Pin,
  PinOffIcon as PinOff,
  RotateCcwIcon as RotateCcw,
  SearchIcon as Search,
} from '../../../../../../graphics/icons';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';

import type { ColumnSettingsProps, ColumnSettingItem } from '../../contracts';

/**
 * One column row: visibility checkbox (primitive), keyboard-sortable grip,
 * label, pin cycle (primitive) and pin-side indicator. All paint is
 * skin-owned on the stamped data-parts.
 */
function ColumnRow({
  column,
  index,
  count,
  isVisible,
  isLocked,
  isPinnedLeft,
  isPinnedRight,
  reorderEnabled,
  onToggleVisibility,
  onTogglePin,
  onMove,
  labels,
}: {
  column: ColumnSettingItem;
  index: number;
  count: number;
  isVisible: boolean;
  isLocked: boolean;
  isPinnedLeft: boolean;
  isPinnedRight: boolean;
  reorderEnabled: boolean;
  onToggleVisibility: (key: string) => void;
  onTogglePin: (key: string, side: 'left' | 'right' | null) => void;
  onMove: (fromIndex: number, toIndex: number) => void;
  labels: Record<string, string>;
}) {
  const pinSide = isPinnedLeft ? 'left' : isPinnedRight ? 'right' : null;
  const reorderDisabled = isLocked || !reorderEnabled;

  const handlePinCycle = useCallback(() => {
    if (pinSide === null) {
      onTogglePin(column.key, 'left');
    } else if (pinSide === 'left') {
      onTogglePin(column.key, 'right');
    } else {
      onTogglePin(column.key, null);
    }
  }, [column.key, pinSide, onTogglePin]);

  const handleGripKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (reorderDisabled) return;
      let target: number | undefined;
      if (event.key === 'ArrowUp') target = Math.max(0, index - 1);
      else if (event.key === 'ArrowDown') target = Math.min(count - 1, index + 1);
      else if (event.key === 'Home') target = 0;
      else if (event.key === 'End') target = count - 1;
      if (target !== undefined && target !== index) {
        event.preventDefault();
        onMove(index, target);
      }
    },
    [count, index, onMove, reorderDisabled],
  );

  const pinTooltipLabel =
    pinSide === null ? labels.pinLeft : pinSide === 'left' ? labels.pinRight : labels.unpin;
  const columnName =
    typeof column.header === 'string' ? column.header : column.key;

  return (
    <div
      data-part="row"
      data-visible={isVisible ? 'true' : 'false'}
      data-pinned={pinSide ?? undefined}
      role="listitem"
    >
      {/* Visibility toggle (certified Checkbox primitive) — named after the
          column it governs so the row reads as one control to AT. */}
      <Checkbox
        checked={isVisible}
        disabled={isLocked}
        onChange={() => onToggleVisibility(column.key)}
        size="sm"
        aria-label={`${labels.toggleVisibility}: ${columnName}`}
      />

      {/* Keyboard-sortable grip: composed from the public Button primitive,
          never a decorative or locally reconstructed control. */}
      <Button
        variant="ghost"
        size="sm"
        data-part="grip"
        disabled={reorderDisabled}
        aria-label={`${labels.reorder} ${columnName}`}
        onKeyDown={handleGripKeyDown}
      >
        <GripVertical size={14} />
      </Button>

      {/* Column name (ellipsis truncation keeps the native tooltip reveal) */}
      <span
        data-part="label"
        title={typeof column.header === 'string' ? column.header : undefined}
      >
        {column.header}
      </span>

      {/* Pin toggle: a three-state cycle (none → left → right → none) on a
          native Button; aria-pressed exposes "pinned vs not" to AT, the same
          contract the DataTable header pin-toggle stamps. */}
      <Tooltip content={pinTooltipLabel}>
        <Button
          variant="ghost"
          size="sm"
          data-part="pin-toggle"
          aria-pressed={pinSide !== null}
          onClick={handlePinCycle}
          aria-label={`${pinTooltipLabel}: ${columnName}`}
        >
          {pinSide ? <Pin size={13} /> : <PinOff size={13} />}
        </Button>
      </Tooltip>

      {/* Pin side indicator (shape + ink, never hue alone; letters ride the
          i18n channel so RTL/Arabic catalogs can localize the glyph) */}
      {pinSide && (
        <span data-part="pin-side" aria-hidden="true">
          {pinSide === 'left' ? labels.pinSideLeft : labels.pinSideRight}
        </span>
      )}
    </div>
  );
}

/**
 * Modern engine implementation of the ColumnSettingsDropdown pattern.
 *
 * Renders a panel with search, visibility toggles, keyboard-sortable rows and
 * pin controls, plus the bulk reset action. Composes Checkbox, Input, Button,
 * Tooltip and Empty; owns no paint.
 */
export default function ModernColumnSettingsDropdown({
  allColumns,
  visibleColumns,
  lockedColumns,
  columnOrder,
  pinnedColumns,
  onToggleVisibility,
  onReorder,
  onTogglePin,
  onReset,
  className,
  style,
}: ColumnSettingsProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Guarded i18n channel: a missing catalog key echoes the full key back,
  // which the endsWith guard swaps for the documented English floor.
  const i18n = useOptionalTranslation('components');
  const tOr = (key: string, fallback: string): string => {
    const translated = i18n?.t(key);
    return translated && !translated.endsWith(key) ? translated : fallback;
  };
  const labels: Record<string, string> = {
    title: tOr('columnSettings.title', 'Columns'),
    searchPlaceholder: tOr('columnSettings.searchPlaceholder', 'Find column...'),
    emptySearch: tOr('columnSettings.emptySearch', 'No columns match your search'),
    reset: tOr('columnSettings.reset', 'Reset Layout'),
    reorder: tOr('columnSettings.reorder', 'Reorder column'),
    toggleVisibility: tOr('columnSettings.toggleVisibility', 'Toggle visibility'),
    pinLeft: tOr('columnSettings.pinLeft', 'Pin left'),
    pinRight: tOr('columnSettings.pinRight', 'Pin right'),
    unpin: tOr('columnSettings.unpin', 'Unpin'),
    pinSideLeft: tOr('columnSettings.pinSideLeft', 'L'),
    pinSideRight: tOr('columnSettings.pinSideRight', 'R'),
  };

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
        typeof col.header === 'string' ? col.header : String(col.header ?? col.key);
      return headerText.toLowerCase().includes(query);
    });
  }, [allColumns, columnOrder, searchQuery]);

  const visibleSet = useMemo(() => new Set(visibleColumns), [visibleColumns]);
  const lockedSet = useMemo(() => new Set(lockedColumns), [lockedColumns]);
  const pinnedLeftSet = useMemo(() => new Set(pinnedColumns.left), [pinnedColumns.left]);
  const pinnedRightSet = useMemo(() => new Set(pinnedColumns.right), [pinnedColumns.right]);

  const visibleCount = visibleColumns.length;
  const totalCount = allColumns.length;
  const reorderEnabled = !searchQuery.trim();

  /** Apply a keyboard move to the current ordered keys and emit the new order. */
  const handleMove = useCallback(
    (fromIndex: number, toIndex: number) => {
      const keys = sortedColumns.map((col) => col.key);
      const [moved] = keys.splice(fromIndex, 1);
      keys.splice(toIndex, 0, moved);
      onReorder(keys);
    },
    [sortedColumns, onReorder],
  );

  return (
    <div
      className={`ds-column-settings ds-column-settings--modern ${className ?? ''}`}
      data-part="root"
      style={style}
    >
      {/* Header: title + visible counter (tabular-nums owned by the skin) */}
      <div data-part="header">
        <span data-part="title">
          {labels.title}
        </span>
        <span data-part="counter">
          {visibleCount} / {totalCount} {tOr('columnSettings.visibleSuffix', 'visible')}
        </span>
      </div>

      {/* Search (certified Input primitive) */}
      <div data-part="search">
        <Input
          size="sm"
          placeholder={labels.searchPlaceholder}
          value={searchQuery}
          onChange={setSearchQuery}
          prefix={<Search size={13} />}
        />
      </div>

      {/* Column list */}
      <div data-part="list" role="list">
        {sortedColumns.length === 0 ? (
          <div data-part="empty">
            <Empty image="simple" description={labels.emptySearch} />
          </div>
        ) : (
          sortedColumns.map((col, index) => (
            <ColumnRow
              key={col.key}
              column={col}
              index={index}
              count={sortedColumns.length}
              isVisible={visibleSet.has(col.key)}
              isLocked={lockedSet.has(col.key)}
              isPinnedLeft={pinnedLeftSet.has(col.key)}
              isPinnedRight={pinnedRightSet.has(col.key)}
              reorderEnabled={reorderEnabled}
              onToggleVisibility={onToggleVisibility}
              onTogglePin={onTogglePin}
              onMove={handleMove}
              labels={labels}
            />
          ))
        )}
      </div>

      {/* Footer: bulk reset (redoable layout action, no confirmation gate) */}
      <div data-part="footer">
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          icon={<RotateCcw size={13} />}
        >
          {labels.reset}
        </Button>
      </div>
    </div>
  );
}
