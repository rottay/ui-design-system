/**
 * @fileoverview Type definitions for the GalleryView pattern component.
 * Defines the generic `GalleryViewProps<T>` interface for an image/media-focused
 * grid layout with selection, pagination, hover effects, and custom card rendering.
 *
 * @module GalleryViewTypes
 * @category Data Patterns
 */

import type { ReactNode, CSSProperties } from 'react';
import type { PaginationConfig } from '../../../../../foundation/contracts/runtime/components/patterns/core';

/**
 * Props for the GalleryView pattern component.
 *
 * GalleryView renders a CSS Grid of image-focused cards with optional captions,
 * selection overlays, and hover effects. It supports both auto-fit responsive
 * columns and explicit column counts.
 *
 * @typeParam T - The shape of a single data item. The `imageField` and
 *   `captionField` accessors are typed against this.
 *
 * @example
 * ```tsx
 * <PatternGalleryView<Photo>
 *   data={photos}
 *   imageField="url"
 *   captionField="title"
 *   rowKey="id"
 *   columns="auto"
 *   minColumnWidth={240}
 *   aspectRatio="4/3"
 *   selectable
 *   onSelectionChange={(keys, items) => setSelected(items)}
 *   onItemClick={(item) => openLightbox(item)}
 *   pagination={{ current: 1, pageSize: 20, total: 100, onChange: handlePage }}
 * />
 * ```
 */
export interface GalleryViewProps<T> {
  /** The data array to render. Each item becomes one gallery card. */
  data: T[];

  /**
   * Property name on T containing the image URL string.
   * When the value is null, undefined, or empty, a placeholder is shown.
   */
  imageField: keyof T & string;

  /**
   * Optional property name on T containing caption text displayed below the image.
   * When omitted, no caption is rendered (unless `renderCard` is provided).
   */
  captionField?: keyof T & string;

  /**
   * Custom card renderer that overrides the default image+caption layout.
   * When provided, `imageField` and `captionField` are still available but
   * the default card is fully replaced by this render function.
   *
   * @param item  - The data object for this card.
   * @param index - Zero-based index within `data`.
   */
  renderCard?: (item: T, index: number) => ReactNode;

  /**
   * Unique row key accessor used for selection tracking and React reconciliation.
   * Can be a property name of T (e.g. `"id"`) or a function that derives a
   * string key from the item. Falls back to the array index when omitted.
   */
  rowKey?: keyof T | ((item: T) => string);

  /**
   * Number of grid columns or `'auto'` for responsive auto-fit.
   * When set to a number, the grid uses exactly that many columns.
   * When `'auto'`, columns are determined by `minColumnWidth`.
   * @default 'auto'
   */
  columns?: number | 'auto';

  /**
   * Minimum column width in pixels when `columns` is `'auto'`.
   * The grid uses CSS `auto-fill` with `minmax(minColumnWidth, 1fr)`.
   * @default 200
   */
  minColumnWidth?: number;

  /**
   * CSS aspect-ratio value for card images.
   * Controls the height of the image container relative to its width.
   * Common values: `'1'` (square), `'4/3'`, `'16/9'`, `'3/2'`.
   * @default '1'
   */
  aspectRatio?: string;

  /**
   * Gap between grid items. Accepts a number (pixels) or CSS string value.
   * @default 16
   */
  gap?: number | string;

  /**
   * Enables selection checkboxes on each card.
   * When true, a checkbox overlay appears in the top-left corner of each card.
   * @default false
   */
  selectable?: boolean;

  /**
   * Controlled list of selected item keys. Must correspond to values produced
   * by the `rowKey` accessor. Pass this to make selection fully controlled.
   */
  selectedKeys?: string[];

  /**
   * Called when the selection changes (card checkbox toggled).
   *
   * @param keys  - Updated array of selected key strings.
   * @param items - The full data objects that are currently selected.
   */
  onSelectionChange?: (keys: string[], items: T[]) => void;

  /**
   * Click handler fired when a card is clicked (outside the checkbox area).
   *
   * @param item  - The data object for the clicked card.
   * @param index - Zero-based index within `data`.
   */
  onItemClick?: (item: T, index: number) => void;

  /**
   * Opt-in `j`/`k`/`x`/`enter` keyboard shortcuts for this gallery (`j` next,
   * `k` previous, `x` toggle selection, `enter` open). OFF by default. The
   * shortcuts are gated to a scope covering this gallery's own DOM region,
   * so they fire only while focus is within (or, with no other gallery/scope
   * focused, while this is the most recently mounted one) -- never globally.
   * `x` requires `selectable`; `enter` requires `onItemClick`. Requires a
   * `<ShortcutProvider>` ancestor (see `hooks/shortcuts`) -- when absent,
   * this prop is silently inert rather than crashing, since it is opt-in.
   * @default false
   */
  collectionShortcuts?: boolean;

  /**
   * Custom empty state rendered when `data` is an empty array.
   * Overrides the default "No items" placeholder.
   */
  emptyState?: ReactNode;

  /**
   * When true, displays a loading skeleton grid instead of content.
   * @default false
   */
  loading?: boolean;

  /**
   * Pagination configuration. Pass `false` to disable pagination entirely.
   * When provided, a pagination bar appears below the grid.
   */
  pagination?: PaginationConfig | false;

  /** Additional CSS class name applied to the gallery root element. */
  className?: string;

  /** Inline styles applied to the gallery root element. */
  style?: CSSProperties;
}
