'use client';

/**
 * @fileoverview GalleryView pattern -- Rottay Design System
 * @description Image/media-focused CSS Grid pattern with selection overlays,
 * hover effects, and optional pagination. Engine-free: composes DS primitives
 * directly and styles via --ds-* CSS variables.
 *
 * @remarks
 * This pattern complements PatternGridView as a render-mode alternative
 * optimized for visual/media content. Where GridView requires a `renderCard`
 * function, GalleryView provides a built-in image+caption card driven by
 * `imageField` and `captionField` accessors, with optional `renderCard`
 * override. Selection, click handling, and pagination follow the same
 * controlled-state conventions as the sibling data patterns.
 */

import React, { useCallback, useMemo, useState } from 'react';
import { ImageIcon } from 'lucide-react';

import { Box, Flex, Skeleton, Stack, Text } from '../../../primitives';
import { Checkbox } from '../../../primitives/inputs/Checkbox';
import { Pagination } from '../../../primitives/navigation/Pagination';
import { ShortcutScope } from '../../../../hooks/shortcuts';
import type { GalleryViewProps } from './GalleryView.types';
import { resolveGalleryKey } from './GalleryView.types';
import { useGalleryKeyboardNav, GalleryCollectionShortcuts } from './useGalleryKeyboardNav';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_COLUMNS = 'auto' as const;
const DEFAULT_MIN_COLUMN_WIDTH = 200;
const DEFAULT_GAP = 16;
const DEFAULT_ASPECT_RATIO = '1';
const SKELETON_COUNT = 8;

function readRecordValue(value: unknown, key: PropertyKey): unknown {
  if (typeof value !== 'object' || value === null) return undefined;
  return Reflect.get(value, key);
}

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
  return `repeat(${Math.max(1, columns)}, 1fr)`;
}

/**
 * Normalizes the gap prop to a CSS string value.
 */
function normalizeGap(gap: number | string): string {
  if (typeof gap === 'number') return `${gap}px`;
  return gap;
}

// ---------------------------------------------------------------------------
// Image placeholder for null/empty URLs
// ---------------------------------------------------------------------------

/**
 * Rendered in place of the image when the URL is null, undefined, or empty.
 * @internal
 */
function ImagePlaceholder({ aspectRatio }: { aspectRatio: string }) {
  return (
    <Flex
      data-part="image-placeholder"
      align="center"
      justify="center"
      style={{
        width: '100%',
        aspectRatio,
      }}
    >
      <ImageIcon data-part="image-placeholder-icon" style={{ width: 32, height: 32, opacity: 0.5 }} />
    </Flex>
  );
}

// ---------------------------------------------------------------------------
// Default card: image + optional caption
// ---------------------------------------------------------------------------

/**
 * Built-in gallery card that renders an image with `object-fit: cover` and
 * an optional single-line caption below. Used when `renderCard` is not provided.
 * @internal
 */
function DefaultGalleryCard<T>({
  item,
  imageField,
  captionField,
  aspectRatio,
}: {
  item: T;
  imageField: keyof T & string;
  captionField?: keyof T & string;
  aspectRatio: string;
}) {
  const imageUrl = readRecordValue(item, imageField);
  const caption = captionField
    ? readRecordValue(item, captionField)
    : undefined;
  const hasImage = typeof imageUrl === 'string' && imageUrl.length > 0;

  return (
    <>
      {hasImage ? (
        <Box
          data-part="image-frame"
          style={{
            width: '100%',
            aspectRatio,
            overflow: 'hidden',
          }}
        >
          <img
            data-part="image"
            src={imageUrl as string}
            alt={typeof caption === 'string' ? caption : ''}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
            loading="lazy"
          />
        </Box>
      ) : (
        <ImagePlaceholder aspectRatio={aspectRatio} />
      )}
      {caption != null && String(caption).length > 0 && (
        <Box
          data-part="caption"
          style={{
            padding: '8px 10px',
          }}
        >
          <Text
            data-part="caption-text"
            size="sm"
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {String(caption)}
          </Text>
        </Box>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Single gallery card wrapper (hover, selection, click)
// ---------------------------------------------------------------------------

/**
 * Card wrapper that handles click, hover effects via the `ds-gallery-card`
 * CSS class, and selection checkbox overlay. Arrow-key/Enter navigation is
 * NOT handled here -- it is owned by the roving-tabindex group at the grid
 * level (see PatternGalleryView) so exactly one code path activates a card,
 * avoiding a double-fire of `onItemClick` on Enter/Space.
 * @internal
 */
function GalleryCardWrapper<T>({
  item,
  index,
  itemKey,
  selected,
  selectable,
  focusable,
  tabIndex,
  itemRef,
  onFocusItem,
  onToggleSelection,
  onItemClick,
  renderCard,
  imageField,
  captionField,
  aspectRatio,
}: {
  item: T;
  index: number;
  itemKey: string;
  selected: boolean;
  selectable: boolean;
  /** Whether this card participates in the roving-tabindex group at all (mirrors `onItemClick || selectable` at the gallery level). */
  focusable: boolean;
  /** 0 or -1, from useRovingTabindex.getTabIndex(index). Ignored when `focusable` is false. */
  tabIndex: 0 | -1;
  /** From useRovingTabindex.getItemRef(index) -- required so arrow-key movement can call .focus() on this card. */
  itemRef: (node: HTMLElement | null) => void;
  /** Call on focus (click, native Tab, or roving-tabindex arrow movement) to keep the active index in sync. */
  onFocusItem: () => void;
  onToggleSelection: (key: string) => void;
  onItemClick?: (item: T, index: number) => void;
  renderCard?: (item: T, index: number) => React.ReactNode;
  imageField: keyof T & string;
  captionField?: keyof T & string;
  aspectRatio: string;
}) {
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      // Avoid firing item click when clicking the checkbox
      const target = e.target as HTMLElement;
      if (target.closest('[data-gallery-checkbox]')) return;
      onItemClick?.(item, index);
    },
    [item, index, onItemClick],
  );

  const handleCheckboxChange = useCallback(() => {
    onToggleSelection(itemKey);
  }, [itemKey, onToggleSelection]);

  return (
    <Box
      data-part="card"
      data-selected={selected ? 'true' : 'false'}
      data-selectable={selectable ? 'true' : 'false'}
      role={onItemClick ? 'button' : undefined}
      ref={focusable ? itemRef : undefined}
      tabIndex={focusable ? tabIndex : undefined}
      onFocus={focusable ? onFocusItem : undefined}
      onClick={handleClick}
      style={{
        position: 'relative',
        overflow: 'hidden',
        cursor: onItemClick ? 'pointer' : 'default',
      }}
      className="ds-gallery-card"
    >
      {/* Content: custom renderCard or default image+caption */}
      {renderCard ? (
        renderCard(item, index)
      ) : (
        <DefaultGalleryCard
          item={item}
          imageField={imageField}
          captionField={captionField}
          aspectRatio={aspectRatio}
        />
      )}

      {/* Selection checkbox overlay (hidden until hover or checked) */}
      {selectable && (
        <Box
          data-gallery-checkbox=""
          data-part="checkbox"
          data-selected={selected ? 'true' : 'false'}
          style={{
            position: 'absolute',
            top: 8,
            left: 8,
            zIndex: 2,
            padding: 2,
            lineHeight: 0,
          }}
          className="ds-gallery-checkbox"
        >
          <Checkbox
            className="ds-gallery-view__checkbox-control"
            checked={selected}
            onChange={handleCheckboxChange}
            size="sm"
            aria-label={`Select item ${itemKey}`}
          />
        </Box>
      )}
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Loading skeleton grid
// ---------------------------------------------------------------------------

/**
 * Skeleton grid that mimics the gallery layout during loading.
 * Each skeleton card shows a rectangular placeholder with a text line below.
 * @internal
 */
function GallerySkeletonGrid({
  columns,
  minColumnWidth,
  gap,
  aspectRatio,
  className,
  style,
}: {
  columns: number | 'auto';
  minColumnWidth: number;
  gap: string;
  aspectRatio: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: buildGridTemplateColumns(columns, minColumnWidth),
    gap,
    ...style,
  };

  return (
    <Box
      className={['ds-pattern-gallery-view', className].filter(Boolean).join(' ')}
      data-part="root"
      data-loading="true"
      data-empty="false"
      style={gridStyle}
    >
      {Array.from({ length: SKELETON_COUNT }, (_, i) => (
        <Box
          key={i}
          data-part="skeleton-card"
          style={{
            overflow: 'hidden',
          }}
        >
          <Skeleton
            className="ds-gallery-view__skeleton-image"
            variant="rectangular"
            style={{
              width: '100%',
              aspectRatio,
              display: 'block',
            }}
          />
          <Box data-part="skeleton-caption" style={{ padding: '8px 10px' }}>
            <Skeleton className="ds-gallery-view__skeleton-caption" variant="text" style={{ width: '70%', height: 14 }} />
          </Box>
        </Box>
      ))}
    </Box>
  );
}

// ---------------------------------------------------------------------------
// PatternGalleryView
// ---------------------------------------------------------------------------

/**
 * Image/media-focused grid pattern for rendering collections of visual content.
 *
 * Uses CSS Grid with responsive auto-fill columns by default. Each card shows
 * an image with `object-fit: cover`, an optional caption, and supports
 * selection checkboxes that reveal on hover. Fully customizable via
 * `renderCard` for non-standard card layouts.
 *
 * @typeParam T - The shape of a single data item.
 *
 * @example Basic usage
 * ```tsx
 * <PatternGalleryView<Photo>
 *   data={photos}
 *   imageField="thumbnailUrl"
 *   captionField="title"
 *   rowKey="id"
 *   onItemClick={(photo) => openLightbox(photo)}
 * />
 * ```
 *
 * @example With selection and pagination
 * ```tsx
 * <PatternGalleryView<Asset>
 *   data={assets}
 *   imageField="previewUrl"
 *   rowKey="assetId"
 *   selectable
 *   selectedKeys={selectedAssetIds}
 *   onSelectionChange={(keys, items) => setSelectedAssets(items)}
 *   columns={4}
 *   aspectRatio="16/9"
 *   pagination={{ current: page, pageSize: 24, total: totalCount, onChange: setPage }}
 * />
 * ```
 */
export function PatternGalleryView<T extends object>(
  props: GalleryViewProps<T>,
): React.ReactElement {
  const {
    data,
    imageField,
    captionField,
    renderCard,
    rowKey,
    columns = DEFAULT_COLUMNS,
    minColumnWidth = DEFAULT_MIN_COLUMN_WIDTH,
    aspectRatio = DEFAULT_ASPECT_RATIO,
    gap = DEFAULT_GAP,
    selectable = false,
    selectedKeys: controlledSelectedKeys,
    onSelectionChange,
    onItemClick,
    collectionShortcuts = false,
    emptyState,
    loading = false,
    pagination,
    className,
    style,
  } = props;

  // -------------------------------------------------------------------------
  // Selection state (supports controlled + uncontrolled)
  // -------------------------------------------------------------------------

  const [internalSelectedKeys, setInternalSelectedKeys] = useState<string[]>([]);
  const selectedKeys = controlledSelectedKeys ?? internalSelectedKeys;

  const getItemKey = useCallback(
    (item: T, index: number) => resolveGalleryKey(item, rowKey, index),
    [rowKey],
  );

  const handleSelectionChange = useCallback(
    (keys: string[], items: T[]) => {
      if (controlledSelectedKeys === undefined) {
        setInternalSelectedKeys(keys);
      }
      onSelectionChange?.(keys, items);
    },
    [controlledSelectedKeys, onSelectionChange],
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
  // Keyboard navigation: roving tabindex (always on whenever cards are
  // focusable) + opt-in j/k/x/enter shortcuts (WO-CRA-03)
  // -------------------------------------------------------------------------

  // Cards are focusable whenever there is something to DO with the active
  // one -- open it (onItemClick) or select it (selectable). This is a
  // deliberate widening of the previous `onItemClick`-only gate: a
  // selection-only gallery (selectable, no onItemClick) now also gets
  // roving-tabindex focus, since j/k/x need SOME notion of "the active
  // item" to toggle even without an open action.
  const focusable = Boolean(onItemClick) || selectable;

  const handleOpenActive = useCallback(
    (index: number) => {
      const item = data[index];
      if (item !== undefined) onItemClick?.(item, index);
    },
    [data, onItemClick],
  );

  const { roving, shortcutsActive, scopeId } = useGalleryKeyboardNav({
    itemCount: data.length,
    focusable,
    collectionShortcuts,
    onOpen: onItemClick ? handleOpenActive : undefined,
  });

  const handleToggleActiveSelection = useCallback(() => {
    if (!selectable) return;
    const item = data[roving.activeIndex];
    if (item === undefined) return;
    toggleSelection(getItemKey(item, roving.activeIndex));
  }, [data, getItemKey, roving.activeIndex, selectable, toggleSelection]);

  // Shortcut-mode "open" (the `enter` key in GalleryCollectionShortcuts) is
  // deliberately NOT wired to roving.selectActive(). selectActive() mirrors
  // native Enter/Space semantics -- a no-op until an item has EXPLICITLY
  // received focus -- which is correct for a real keydown (you cannot press
  // Enter on a card without first focusing it) but wrong here: the `enter`
  // shortcut can fire via the scope's topmost-mounted fallback BEFORE any
  // card has been explicitly focused, and should act on the
  // visually-indicated default item (roving.activeIndex, item 0 before any
  // interaction) immediately, matching `x` (toggle selection) below rather
  // than requiring a prior j/k/Tab press first.
  const handleOpenActiveViaShortcut = useCallback(() => {
    handleOpenActive(roving.activeIndex);
  }, [handleOpenActive, roving.activeIndex]);

  // -------------------------------------------------------------------------
  // Grid styles
  // -------------------------------------------------------------------------

  const normalizedGap = useMemo(() => normalizeGap(gap), [gap]);

  const gridStyle: React.CSSProperties = useMemo(
    () => ({
      display: 'grid',
      gridTemplateColumns: buildGridTemplateColumns(columns, minColumnWidth),
      gap: normalizedGap,
    }),
    [columns, minColumnWidth, normalizedGap],
  );

  // -------------------------------------------------------------------------
  // Loading state
  // -------------------------------------------------------------------------

  if (loading) {
    return (
      <>
        <GallerySkeletonGrid
          columns={columns}
          minColumnWidth={minColumnWidth}
          gap={normalizedGap}
          aspectRatio={aspectRatio}
          className={className}
          style={style}
        />
      </>
    );
  }

  // -------------------------------------------------------------------------
  // Empty state
  // -------------------------------------------------------------------------

  if (data.length === 0) {
    return (
      <Box
        className={['ds-pattern-gallery-view', className].filter(Boolean).join(' ')}
        data-part="root"
        data-loading="false"
        data-empty="true"
        style={{
          padding: 'var(--ds-spacing-8, 32px) var(--ds-spacing-5, 20px)',
          textAlign: 'center',
          ...style,
        }}
      >
        {emptyState ?? (
          <Text data-part="empty-state">No items</Text>
        )}
      </Box>
    );
  }

  // -------------------------------------------------------------------------
  // Card grid
  // -------------------------------------------------------------------------

  const grid = (
    <Box
      className={['ds-pattern-gallery-view', className].filter(Boolean).join(' ')}
      data-part="root"
      data-loading="false"
      data-empty="false"
      data-selectable={selectable ? 'true' : 'false'}
      style={gridStyle}
      onKeyDown={focusable ? roving.handleKeyDown : undefined}
    >
      {data.map((item, index) => {
        const key = getItemKey(item, index);
        return (
          <GalleryCardWrapper
            key={key}
            item={item}
            index={index}
            itemKey={key}
            selected={selectedKeys.includes(key)}
            selectable={selectable}
            focusable={focusable}
            tabIndex={roving.getTabIndex(index)}
            itemRef={roving.getItemRef(index)}
            onFocusItem={() => roving.syncActiveIndex(index)}
            onToggleSelection={toggleSelection}
            onItemClick={onItemClick}
            renderCard={renderCard}
            imageField={imageField}
            captionField={captionField}
            aspectRatio={aspectRatio}
          />
        );
      })}
    </Box>
  );

  return (
    <Stack spacing="md">
      {shortcutsActive ? (
        <ShortcutScope id={scopeId}>
          {grid}
          <GalleryCollectionShortcuts
            scopeId={scopeId}
            onNext={roving.moveNext}
            onPrevious={roving.movePrevious}
            onOpen={onItemClick ? handleOpenActiveViaShortcut : undefined}
            onToggleSelect={selectable ? handleToggleActiveSelection : undefined}
          />
        </ShortcutScope>
      ) : (
        grid
      )}

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
