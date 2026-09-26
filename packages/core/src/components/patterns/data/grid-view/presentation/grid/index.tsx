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
 *
 * LAYOUT (WO-FAM-12): the root is the Grid primitive in its auto-fit mode, so
 * the column count is the card footprint recipe's (density, type scale and the
 * `minItem` preset), the row always fills, and the container's compact posture
 * takes one column. The legacy `columns`/`minColumnWidth` props are ignored.
 *
 * LOADING (WO-FAM-14): the loading state is DERIVED from this grid's own
 * `data-part` anatomy by the shared `AnatomySkeleton` renderer, which wraps
 * the family root itself -- the grid it stands in for is the grid it measures,
 * so the two cannot drift. It used to be a hand-built grid of six foreign
 * `Card` primitives, whose anatomy is the Card's and not the grid's.
 *
 * STATE (F-37): a selectable card shell's interaction state is decided ONCE by
 * the kernel and stamped through `partAttributes`, so the skin's hover arm
 * pairs `[data-state~='hovered']` with the platform pseudo-class instead of
 * being a second authority on the same question.
 */

import React, { useCallback, useMemo, useRef, useState } from 'react';

import { partAttributes, useInteractionState } from '@/foundation/behavior';
import { Box } from '../../../../../primitives/layout/box';
import { Grid } from '../../../../../primitives/layout/grid';
import { GAP_MAP, type GridGap } from '../../../../../primitives/layout/grid/contracts';
import { Checkbox } from '../../../../../primitives/inputs/checkbox';
import { Flex } from '../../../../../primitives/layout/flex';
import { Pagination } from '../../../../../primitives/navigation/pagination';
import { AnatomySkeleton } from '../../../../../primitives/feedback/skeleton';
import { Stack } from '../../../../../primitives/layout/stack';
import { Text } from '../../../../../primitives/display/typography/compound/text';
import type { GridViewAdaptation, GridViewProps } from '../../contracts';
import { resolveGridRowKey } from '../../runtime/item-identity';
import { useCollectionStagger } from '../../../../foundation/motion';
import { useOptionalTranslation } from '../../../../../../infrastructure/runtime/i18n';
import { useAdaptation } from '@/infrastructure/runtime/adaptation';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const LOADING_CARD_COUNT = 6;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const isGridGap = (gap: string): gap is GridGap => Object.prototype.hasOwnProperty.call(GAP_MAP, gap);

/**
 * The caller's gap on the Grid's own terms: a number or a rung is the Grid's
 * `gap`; any other CSS length rides the Grid's `--ds-grid-gap` channel.
 */
function gridGap(gap: number | string | undefined): {
  gap?: number | GridGap;
  channel?: React.CSSProperties;
} {
  if (gap === undefined) return {};
  if (typeof gap === 'number' || isGridGap(gap)) return { gap };
  return { channel: { '--ds-grid-gap': gap } as React.CSSProperties };
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
  /* Localized chrome (components catalog, English floor): the checkbox
     accessible name. The control previously rendered with NO aria-label —
     the count of unnamed checkboxes in a selectable grid was an a11y bug. */
  const translation = useOptionalTranslation('components');
  const selectItemLabel =
    translation?.tOr('gridView.selectItem', 'Select item {item}', { item: itemKey })
    ?? `Select item ${itemKey}`;

  /* The shell is the part the skin's hover arm paints, so its state is decided
     here, once, and the skin reads the kernel's answer. */
  const interaction = useInteractionState();

  return (
    <Box
      {...partAttributes('card-shell', interaction.state)}
      {...interaction.handlers}
      data-selected={selected ? 'true' : 'false'}
      data-ds-stagger-item={staggered ? '' : undefined}
      style={
        staggered
          ? ({ '--ds-stagger-index': index } as React.CSSProperties)
          : undefined
      }
    >
      {/* Checkbox overlay: geometry and paint live in the skin, anchored to
          this part (logical insets — mirrors under RTL for free). */}
      <Box
        data-part="checkbox-overlay"
      >
        <Checkbox
          className="ds-grid-view__checkbox-control"
          checked={selected}
          onChange={() => onToggle(itemKey)}
          size="sm"
          aria-label={selectItemLabel}
        />
      </Box>
      {renderCard(item, index)}
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
    minItem,
    templateColumns,
    adapt,
    gap,
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

  /* Localized chrome (components catalog, English floor). */
  const translation = useOptionalTranslation('components');
  const emptyLabel = translation?.tOr('gridView.empty', 'No data') ?? 'No data';

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

  // The posture this grid is actually in, resolved through the shared runtime.
  const rootRef = useRef<HTMLElement | null>(null);
  const adaptationBase = useMemo<GridViewAdaptation>(() => ({ minItem }), [minItem]);
  const { adaptation, postureAttribute } = useAdaptation<GridViewAdaptation>(adapt, {
    base: adaptationBase,
    containerRef: rootRef,
  });
  const resolvedGap = gridGap(gap);

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

  const gridChannels: React.CSSProperties = useMemo(
    () => ({ ...resolvedGap.channel, ...style }) as React.CSSProperties,
    [resolvedGap.channel, style],
  );

  const gridStyle: React.CSSProperties = useMemo(
    () =>
      ({
        ...gridChannels,
        // Publish the policy-resolved stagger bounds so the .ds-collection-stagger
        // preset's per-item clamp reflects the tenant durationScale. Absent when the
        // batch renders final-state.
        '--ds-stagger-step': stagger.animated ? stagger.stepCss : undefined,
        '--ds-stagger-max': stagger.animated ? stagger.maxCss : undefined,
      }) as React.CSSProperties,
    [gridChannels, stagger.animated, stagger.stepCss, stagger.maxCss],
  );

  // -------------------------------------------------------------------------
  // Loading state
  // -------------------------------------------------------------------------

  if (loading) {
    /* The loading state is this grid's OWN anatomy, read by the shared
       renderer: six card shells, each standing behind the caller's card slot,
       stamped with the parts the loaded grid stamps. The renderer wraps the
       family root rather than sitting inside it, so the grid the bones are
       measured against is the real grid -- same track model, same gap, same
       channels. */
    return (
      <AnatomySkeleton>
        <Grid
          ref={rootRef}
          autoFit
          minItem={adaptation.minItem}
          templateColumns={templateColumns}
          gap={resolvedGap.gap}
          className={['ds-pattern-grid-view', className].filter(Boolean).join(' ')}
          data-part="root"
          data-loading="true"
          data-empty="false"
          data-posture={postureAttribute}
          style={gridChannels}
        >
          {Array.from({ length: LOADING_CARD_COUNT }).map((_, index) => (
            <Box data-part="card-shell" key={index}>
              <Box data-part="card-content" />
            </Box>
          ))}
        </Grid>
      </AnatomySkeleton>
    );
  }

  // -------------------------------------------------------------------------
  // Empty state
  // -------------------------------------------------------------------------

  if (data.length === 0) {
    return (
      <Box
        ref={rootRef}
        className={['ds-pattern-grid-view', className].filter(Boolean).join(' ')}
        data-part="root"
        data-loading="false"
        data-empty="true"
        data-posture={postureAttribute}
        style={style}
      >
        {emptyState ?? (
          <Text data-part="empty-state">{emptyLabel}</Text>
        )}
      </Box>
    );
  }

  // -------------------------------------------------------------------------
  // Card grid
  // -------------------------------------------------------------------------

  return (
    <Stack spacing="md">
      <Grid
        ref={rootRef}
        autoFit
        minItem={adaptation.minItem}
        templateColumns={templateColumns}
        gap={resolvedGap.gap}
        className={['ds-pattern-grid-view', className, stagger.containerClassName].filter(Boolean).join(' ')}
        data-part="root"
        data-loading="false"
        data-empty="false"
        data-selectable={selectable ? 'true' : 'false'}
        data-posture={postureAttribute}
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
      </Grid>

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
