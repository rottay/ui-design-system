'use client';

/**
 * @fileoverview GridView pattern - Rottay Design System
 * @description Responsive CSS grid pattern for card-based layouts with
 * optional selection, pagination, loading skeletons, and empty state.
 *
 * @remarks
 * This pattern sits above primitives: it packages product-facing mechanics
 * such as card selection and responsive grid layout while keeping the card
 * rendering API reusable across domains. Engine-free -- uses CSS Grid
 * directly with DS CSS variables for theming.
 */

import React, { useCallback, useMemo, useState } from 'react';

import {
  Box,
  Checkbox,
  Flex,
  Pagination,
  SkeletonCard,
  Stack,
  Text,
} from '../../../primitives';
import type { GridViewProps } from './GridView.types';
import { resolveGridRowKey } from './GridView.types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_COLUMNS = 'auto' as const;
const DEFAULT_MIN_COLUMN_WIDTH = 280;
const DEFAULT_GAP = 'var(--ds-listing-grid-gap, var(--ds-spacing-4, 16px))';
const SKELETON_COUNT = 6;
const MAX_FIXED_COLUMNS = 6;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Builds the CSS `grid-template-columns` value based on the columns prop.
 */
function buildGridTemplateColumns(
  columns: number | 'auto',
  minColumnWidth: number,
): string {
  if (columns === 'auto') {
    return `repeat(auto-fill, minmax(${minColumnWidth}px, 1fr))`;
  }
  const clamped = Math.max(1, Math.min(columns, MAX_FIXED_COLUMNS));
  return `repeat(${clamped}, 1fr)`;
}

/**
 * Normalizes the gap prop to a CSS string value.
 */
function normalizeGap(gap: number | string): string {
  if (typeof gap === 'number') return `${gap}px`;
  return gap;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/**
 * Selectable card wrapper that overlays a checkbox on the card.
 * @internal
 */
function SelectableCard<T>({
  item,
  itemKey,
  index,
  selected,
  onToggle,
  renderCard,
}: {
  item: T;
  itemKey: string;
  index: number;
  selected: boolean;
  onToggle: (key: string) => void;
  renderCard: (item: T, index: number) => React.ReactNode;
}): React.ReactElement {
  return (
    <Box
      style={{
        position: 'relative',
        borderRadius: 'var(--ds-collection-card-radius, var(--ds-premium-card-radius, var(--ds-radius-lg, 8px)))',
        boxShadow: selected
          ? 'var(--ds-collection-card-selected-ring, var(--ds-premium-card-selected-ring, 0 0 0 2px var(--ds-color-primary)))'
          : 'none',
        transition: 'box-shadow var(--ds-motion-fast, 150ms) var(--ds-motion-ease-out, ease-out)',
      }}
    >
      {/* Checkbox overlay */}
      <Box
        style={{
          position: 'absolute',
          top: 8,
          left: 8,
          zIndex: 2,
        }}
      >
        <Checkbox
          checked={selected}
          onChange={() => onToggle(itemKey)}
          size="sm"
          style={{
            background: 'var(--ds-color-bg-primary, #fff)',
            borderRadius: 'var(--ds-radius-sm, 4px)',
            boxShadow: 'var(--ds-elevation-1, 0 1px 3px rgba(0,0,0,0.12))',
            padding: 2,
          }}
        />
      </Box>
      {renderCard(item, index)}
    </Box>
  );
}

/**
 * Loading skeleton grid that mimics the card layout.
 * @internal
 */
function GridSkeleton({
  columns,
  minColumnWidth,
  gap,
  className,
  style,
}: {
  columns: number | 'auto';
  minColumnWidth: number;
  gap: string;
  className?: string;
  style?: React.CSSProperties;
}): React.ReactElement {
  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: buildGridTemplateColumns(columns, minColumnWidth),
    gap,
    ...style,
  };

  return (
    <Box className={className} style={gridStyle}>
      {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
        <SkeletonCard key={index} lines={3} />
      ))}
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function PatternGridView<T>(
  props: GridViewProps<T>,
): React.ReactElement {
  const {
    data,
    renderCard,
    rowKey,
    columns = DEFAULT_COLUMNS,
    minColumnWidth = DEFAULT_MIN_COLUMN_WIDTH,
    gap = DEFAULT_GAP,
    selectable = false,
    selectedKeys: controlledSelectedKeys,
    onSelectionChange,
    pagination,
    emptyState,
    loading = false,
    className,
    style,
  } = props;

  // -------------------------------------------------------------------------
  // Selection state (supports controlled + uncontrolled)
  // -------------------------------------------------------------------------

  const [internalSelectedKeys, setInternalSelectedKeys] = useState<string[]>([]);
  const selectedKeys = controlledSelectedKeys ?? internalSelectedKeys;

  const handleSelectionChange = useCallback(
    (keys: string[], items: T[]) => {
      if (controlledSelectedKeys === undefined) {
        setInternalSelectedKeys(keys);
      }
      onSelectionChange?.(keys, items);
    },
    [controlledSelectedKeys, onSelectionChange],
  );

  const getItemKey = useCallback(
    (item: T, index: number) => resolveGridRowKey(item, rowKey, index),
    [rowKey],
  );

  const toggleSelection = useCallback(
    (key: string) => {
      const nextKeys = selectedKeys.includes(key)
        ? selectedKeys.filter((k) => k !== key)
        : [...selectedKeys, key];

      const selectedItems = data.filter((item, index) =>
        nextKeys.includes(getItemKey(item, index)),
      );

      handleSelectionChange(nextKeys, selectedItems);
    },
    [data, getItemKey, handleSelectionChange, selectedKeys],
  );

  // -------------------------------------------------------------------------
  // Grid styles
  // -------------------------------------------------------------------------

  const normalizedGap = useMemo(() => normalizeGap(gap), [gap]);

  const gridStyle: React.CSSProperties = useMemo(
    () => ({
      display: 'grid',
      gridTemplateColumns: buildGridTemplateColumns(columns, minColumnWidth),
      gap: normalizedGap,
      ...style,
    }),
    [columns, minColumnWidth, normalizedGap, style],
  );

  // -------------------------------------------------------------------------
  // Loading state
  // -------------------------------------------------------------------------

  if (loading) {
    return (
      <GridSkeleton
        columns={columns}
        minColumnWidth={minColumnWidth}
        gap={normalizedGap}
        className={className}
        style={style}
      />
    );
  }

  // -------------------------------------------------------------------------
  // Empty state
  // -------------------------------------------------------------------------

  if (data.length === 0) {
    return (
      <Box
        className={className}
        style={{
          padding: 'var(--ds-spacing-8, 32px) var(--ds-spacing-5, 20px)',
          borderRadius: 'var(--ds-radius-lg, 8px)',
          border: '1px solid var(--ds-listing-grid-empty-border, var(--ds-collection-card-border, color-mix(in srgb, var(--ds-color-text-primary) 8%, transparent)))',
          background: 'var(--ds-listing-grid-empty-bg, var(--ds-collection-card-bg, var(--ds-color-bg-primary, #fff)))',
          textAlign: 'center',
        }}
      >
        {emptyState ?? (
          <Text style={{ color: 'var(--ds-color-text-muted)' }}>No data</Text>
        )}
      </Box>
    );
  }

  // -------------------------------------------------------------------------
  // Card grid
  // -------------------------------------------------------------------------

  return (
    <Stack spacing="md">
      <Box className={className} style={gridStyle}>
        {data.map((item, index) => {
          const key = getItemKey(item, index);

          if (selectable) {
            return (
              <SelectableCard
                key={key}
                item={item}
                itemKey={key}
                index={index}
                selected={selectedKeys.includes(key)}
                onToggle={toggleSelection}
                renderCard={renderCard}
              />
            );
          }

          return (
            <React.Fragment key={key}>
              {renderCard(item, index)}
            </React.Fragment>
          );
        })}
      </Box>

      {/* Pagination */}
      {pagination && (
        <Flex justify="end">
          <Pagination
            current={pagination.current}
            total={pagination.total}
            pageSize={pagination.pageSize}
            showSizeChanger={
              pagination.pageSizeOptions !== undefined &&
              pagination.pageSizeOptions.length > 0
            }
            onChange={pagination.onChange}
          />
        </Flex>
      )}
    </Stack>
  );
}
