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
import { ImageIcon } from '../../../../../../graphics/icons';

import { partAttributes, useInteractionState } from '@/foundation/behavior';
import { Box } from '../../../../../primitives/layout/box';
import { Flex } from '../../../../../primitives/layout/flex';
import { AnatomySkeleton } from '../../../../../primitives/feedback/skeleton';
import { Stack } from '../../../../../primitives/layout/stack';
import { Text } from '../../../../../primitives/display/typography/compound/text';
import { Checkbox } from '../../../../../primitives/inputs/checkbox';
import { Pagination } from '../../../../../primitives/navigation/pagination';
import { ShortcutScope } from '../../../../../../infrastructure/runtime/application/interaction/shortcuts';
import { useOptionalTranslation } from '../../../../../../infrastructure/runtime/i18n';
import type { GalleryViewProps } from '../../contracts';
import { resolveGalleryKey } from '../../runtime/item-identity';
import { useGalleryKeyboardNav, GalleryCollectionShortcuts } from '../../runtime/keyboard-navigation';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_COLUMNS = 'auto' as const;
const DEFAULT_MIN_COLUMN_WIDTH = 200;
const LOADING_CARD_COUNT = 8;

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
    // Responsive law: the track floor must never exceed its own container, or
    // a single track overflows the page below `minColumnWidth`.
    return `repeat(auto-fill, minmax(min(${minColumnWidth}px, 100%), 1fr))`;
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
function ImagePlaceholder() {
  return (
    <Flex data-part="image-placeholder" align="center" justify="center">
      <ImageIcon data-part="image-placeholder-icon" />
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
}: {
  item: T;
  imageField: keyof T & string;
  captionField?: keyof T & string;
}) {
  const imageUrl = readRecordValue(item, imageField);
  const caption = captionField
    ? readRecordValue(item, captionField)
    : undefined;
  const hasImage = typeof imageUrl === 'string' && imageUrl.length > 0;

  return (
    <>
      {hasImage ? (
        <Box data-part="image-frame">
          <img
            data-part="image"
            src={imageUrl as string}
            alt={typeof caption === 'string' ? caption : ''}
            loading="lazy"
          />
        </Box>
      ) : (
        <ImagePlaceholder />
      )}
      {caption != null && String(caption).length > 0 && (
        <Box data-part="caption">
          <Text
            data-part="caption-text"
            className="ds-gallery-view__caption-text"
            size="sm"
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

  /* Localized chrome (components catalog, English floor). */
  const translation = useOptionalTranslation('components');
  const selectItemLabel =
    translation?.tOr('galleryView.selectItem', 'Select item {item}', { item: itemKey })
    ?? `Select item ${itemKey}`;

  /* The card is the part the skin's hover, focus and checkbox-reveal arms
     paint, so its state is decided here, once, and the skin reads the kernel's
     answer rather than asking the platform the same question a second time. */
  const interaction = useInteractionState();
  const handleFocus = useCallback(
    (event: React.FocusEvent) => {
      interaction.handlers.onFocus(event);
      if (focusable) onFocusItem();
    },
    [focusable, interaction.handlers, onFocusItem],
  );

  return (
    <Box
      {...partAttributes('card', interaction.state)}
      data-selected={selected ? 'true' : 'false'}
      data-selectable={selectable ? 'true' : 'false'}
      data-clickable={onItemClick ? 'true' : 'false'}
      role={onItemClick ? 'button' : undefined}
      ref={focusable ? itemRef : undefined}
      tabIndex={focusable ? tabIndex : undefined}
      {...interaction.handlers}
      onFocus={handleFocus}
      onClick={handleClick}
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
        />
      )}

      {/* Selection checkbox overlay (hidden until hover or checked; always
          visible on coarse pointers — no hover exists there). Geometry and
          paint live in the skin, anchored to this part. */}
      {selectable && (
        <Box
          data-gallery-checkbox=""
          data-part="checkbox"
          data-selected={selected ? 'true' : 'false'}
          className="ds-gallery-checkbox"
        >
          <Checkbox
            className="ds-gallery-view__checkbox-control"
            checked={selected}
            onChange={handleCheckboxChange}
            size="sm"
            aria-label={selectItemLabel}
          />
        </Box>
      )}
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
    columns,
    minColumnWidth,
    aspectRatio,
    gap,
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

  /* Localized chrome (components catalog, English floor). */
  const translation = useOptionalTranslation('components');
  const emptyLabel = translation?.tOr('galleryView.empty', 'No items') ?? 'No items';

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

  /* The caller's column model and media ratio ride the family's own channels;
     the skin applies them. Stamped ONLY when the caller states the number: an
     unconditional stamp of the old prop defaults would shadow the skin's
     resting declarations on every render and take the gallery's rhythm and its
     media ratio away from the theme. */
  const gridStyle: React.CSSProperties = useMemo(
    () =>
      ({
        ...(columns === undefined && minColumnWidth === undefined
          ? {}
          : {
              '--ds-gallery-view-columns': buildGridTemplateColumns(
                columns ?? DEFAULT_COLUMNS,
                minColumnWidth ?? DEFAULT_MIN_COLUMN_WIDTH,
              ),
            }),
        ...(gap === undefined ? {} : { '--ds-gallery-view-gap': normalizeGap(gap) }),
        ...(aspectRatio === undefined ? {} : { '--ds-gallery-view-aspect-ratio': aspectRatio }),
        ...style,
      }) as React.CSSProperties,
    [columns, minColumnWidth, gap, aspectRatio, style],
  );

  // -------------------------------------------------------------------------
  // Loading state
  // -------------------------------------------------------------------------

  if (loading) {
    /* The loading state is this gallery's OWN anatomy, read by the shared
       renderer: eight cards, each with the media frame and the caption line the
       loaded card stamps. The renderer wraps the family root rather than
       sitting inside it, so the gallery the bones are measured against is the
       real gallery -- same track model, same gap, same media ratio. */
    return (
      <AnatomySkeleton>
        <Box
          className={['ds-pattern-gallery-view', className].filter(Boolean).join(' ')}
          data-part="root"
          data-loading="true"
          data-empty="false"
          style={gridStyle}
        >
          {Array.from({ length: LOADING_CARD_COUNT }, (_, index) => (
            <Box key={index} data-part="card" className="ds-gallery-card">
              <Box data-part="image-frame" />
              <Box data-part="caption">
                <Box data-part="caption-text">{'\u00a0'}</Box>
              </Box>
            </Box>
          ))}
        </Box>
      </AnatomySkeleton>
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
