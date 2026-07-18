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
} from '../../../../../primitives';
import type { GridViewProps } from '../../contracts';
import { resolveGridRowKey } from '../../runtime/item-identity';
import { useCollectionStagger } from '../../../../foundation/motion';

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
  staggered,
}: {
  item: T;
  itemKey: string;
  index: number;
  selected: boolean;
  onToggle: (key: string) => void;
  renderCard: (item: T, index: number) => React.ReactNode;
  staggered: boolean;
}): React.ReactElement {
  return (
    <Box
      data-part="card-shell"
      data-selected={selected ? 'true' : 'false'}
      data-ds-stagger-item={staggered ? '' : undefined}
      style={
        staggered
          ? ({ position: 'relative', '--ds-stagger-index': index } as React.CSSProperties)
          : { position: 'relative' }
      }
    >
      {/* Checkbox overlay */}
      <Box
        data-part="checkbox-overlay"
        style={{
          position: 'absolute',
          top: 8,
          left: 8,
          zIndex: 2,
        }}
      >
        <Checkbox
          className="ds-grid-view__checkbox-control"
          checked={selected}
          onChange={() => onToggle(itemKey)}
          size="sm"
          style={{
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
    <Box
      className={['ds-pattern-grid-view', className].filter(Boolean).join(' ')}
      data-part="root"
      data-loading="true"
      data-empty="false"
      style={gridStyle}
    >
      {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
        <SkeletonCard className="ds-grid-view__skeleton" key={index} lines={3} />
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

  // Entrance choreography for the mounted batch, resolved through the active
  // motion policy (collection.insert recipe). Renders final-state under reduced/
  // calm/hidden/constrained policies, so the grid never blocks or flashes.
  const stagger = useCollectionStagger(data.length);

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
    () =>
      ({
        display: 'grid',
        gridTemplateColumns: buildGridTemplateColumns(columns, minColumnWidth),
        gap: normalizedGap,
        padding: '1px 1px var(--ds-listing-grid-bottom-bleed, 8px)',
        overflow: 'visible',
        boxSizing: 'border-box',
        ...style,
        // Publish the policy-resolved stagger bounds so the .ds-collection-stagger
        // preset's per-item clamp reflects the tenant durationScale. Absent when the
        // batch renders final-state.
        '--ds-stagger-step': stagger.animated ? stagger.stepCss : undefined,
        '--ds-stagger-max': stagger.animated ? stagger.maxCss : undefined,
      }) as React.CSSProperties,
    [columns, minColumnWidth, normalizedGap, style, stagger.animated, stagger.stepCss, stagger.maxCss],
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
        className={['ds-pattern-grid-view', className].filter(Boolean).join(' ')}
        data-part="root"
        data-loading="false"
        data-empty="true"
        style={{
          padding: 'var(--ds-spacing-8, 32px) var(--ds-spacing-5, 20px)',
          textAlign: 'center',
        }}
      >
        {emptyState ?? (
          <Text data-part="empty-state">No data</Text>
        )}
      </Box>
    );
  }

  // -------------------------------------------------------------------------
  // Card grid
  // -------------------------------------------------------------------------

  return (
    <Stack spacing="md">
      <Box
        className={['ds-pattern-grid-view', className, stagger.containerClassName].filter(Boolean).join(' ')}
        data-part="root"
        data-loading="false"
        data-empty="false"
        data-selectable={selectable ? 'true' : 'false'}
        style={gridStyle}
      >
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
                staggered={stagger.animated}
              />
            );
          }

          // Only when the policy actually animates does a stagger cell wrap the
          // card, so the resting DOM stays identical to the un-staggered grid.
          if (stagger.animated) {
            return (
              <Box
                key={key}
                data-part="cell"
                data-ds-stagger-item=""
                style={{ '--ds-stagger-index': index } as React.CSSProperties}
              >
                {renderCard(item, index)}
              </Box>
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
