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
// Inline <style> for hover effects
// ---------------------------------------------------------------------------

const GALLERY_HOVER_STYLES = `
.ds-gallery-card:hover {
  box-shadow: 0 4px 12px color-mix(in srgb, var(--ds-color-text-primary, #000) 10%, transparent);
  transform: translateY(-2px);
}
.ds-gallery-card:hover img {
  transform: scale(1.04);
}
.ds-gallery-card .ds-gallery-checkbox {
  opacity: 0;
}
.ds-gallery-card:hover .ds-gallery-checkbox,
.ds-gallery-card .ds-gallery-checkbox:has(input:checked) {
  opacity: 1;
}
.ds-gallery-card:focus-visible {
  outline: 2px solid var(--ds-color-primary, #1677ff);
  outline-offset: 2px;
}
`;

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
      align="center"
      justify="center"
      style={{
        width: '100%',
        aspectRatio,
        background: 'var(--ds-color-bg-tertiary, #e8e8e8)',
        color: 'var(--ds-color-text-disabled, #bbb)',
      }}
    >
      <ImageIcon style={{ width: 32, height: 32, opacity: 0.5 }} />
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
  const imageUrl = (item as Record<string, unknown>)[imageField];
  const caption = captionField
    ? (item as Record<string, unknown>)[captionField]
    : undefined;
  const hasImage = typeof imageUrl === 'string' && imageUrl.length > 0;

  return (
    <>
      {hasImage ? (
        <Box
          style={{
            width: '100%',
            aspectRatio,
            overflow: 'hidden',
          }}
        >
          <img
            src={imageUrl as string}
            alt={typeof caption === 'string' ? caption : ''}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              transition: 'transform 0.25s ease',
            }}
            loading="lazy"
          />
        </Box>
      ) : (
        <ImagePlaceholder aspectRatio={aspectRatio} />
      )}
      {caption != null && String(caption).length > 0 && (
        <Box
          style={{
            padding: '8px 10px',
            background: 'var(--ds-color-bg-primary, #fff)',
          }}
        >
          <Text
            size="sm"
            style={{
              color: 'var(--ds-color-text-primary)',
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
      role={onItemClick ? 'button' : undefined}
      ref={focusable ? itemRef : undefined}
      tabIndex={focusable ? tabIndex : undefined}
      onFocus={focusable ? onFocusItem : undefined}
      onClick={handleClick}
      style={{
        position: 'relative',
        borderRadius: 'var(--ds-radius-md, 8px)',
        overflow: 'hidden',
        border: selected
          ? '2px solid var(--ds-color-primary, #1677ff)'
          : '1px solid var(--ds-color-border, #e0e0e0)',
        background: 'var(--ds-color-bg-primary, #fff)',
        cursor: onItemClick ? 'pointer' : 'default',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease',
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
          style={{
            position: 'absolute',
            top: 8,
            left: 8,
            zIndex: 2,
            background: 'color-mix(in srgb, var(--ds-color-bg-primary, #fff) 85%, transparent)',
            borderRadius: 'var(--ds-radius-sm, 6px)',
            boxShadow: 'var(--ds-elevation-1, 0 1px 3px rgba(0,0,0,0.12))',
            padding: 2,
            lineHeight: 0,
            transition: 'background 0.15s ease, opacity 0.15s ease',
            backdropFilter: 'blur(4px)',
          }}
          className="ds-gallery-checkbox"
        >
          <Checkbox
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
    <Box className={className} style={gridStyle}>
      {Array.from({ length: SKELETON_COUNT }, (_, i) => (
        <Box
          key={i}
          style={{
            borderRadius: 'var(--ds-radius-md, 8px)',
            overflow: 'hidden',
            border: '1px solid var(--ds-color-border, #e0e0e0)',
            background: 'var(--ds-color-bg-primary, #fff)',
          }}
        >
          <Skeleton
            variant="rectangular"
            style={{
              width: '100%',
              aspectRatio,
              display: 'block',
            }}
          />
          <Box style={{ padding: '8px 10px' }}>
            <Skeleton variant="text" style={{ width: '70%', height: 14 }} />
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
        <style>{GALLERY_HOVER_STYLES}</style>
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
        className={className}
        style={{
          padding: 'var(--ds-spacing-8, 32px) var(--ds-spacing-5, 20px)',
          borderRadius: 'var(--ds-radius-lg, 12px)',
          border: '1px dashed var(--ds-color-border, #d9d9d9)',
          background: 'var(--ds-color-bg-secondary, #fafafa)',
          textAlign: 'center',
          ...style,
        }}
      >
        {emptyState ?? (
          <Text style={{ color: 'var(--ds-color-text-muted)' }}>No items</Text>
        )}
      </Box>
    );
  }

  // -------------------------------------------------------------------------
  // Card grid
  // -------------------------------------------------------------------------

  const grid = (
    <Box className={className} style={gridStyle} onKeyDown={focusable ? roving.handleKeyDown : undefined}>
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
      <style>{GALLERY_HOVER_STYLES}</style>

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
