/**
 * @fileoverview Type definitions for the GridView pattern component.
 * Defines the generic `GridViewProps<T>` interface that drives a responsive
 * CSS grid for card-based layouts with optional selection, pagination,
 * loading skeletons, and empty state handling.
 */

import type { ReactNode, CSSProperties } from 'react';
import type { PaginationConfig } from '../../foundation/types';

/**
 * Props for the GridView pattern component.
 *
 * The GridView renders a responsive CSS grid of cards. Each item in `data`
 * is rendered by the `renderCard` function. The parent component owns all
 * state; the grid only renders UI and fires callbacks.
 *
 * @typeParam T - The shape of a single data item. Card renderers and row
 *   key extractors are typed against this.
 *
 * @example
 * ```tsx
 * <PatternGridView<Product>
 *   data={products}
 *   renderCard={(product) => <ProductCard product={product} />}
 *   rowKey="id"
 *   columns="auto"
 *   minColumnWidth={300}
 *   selectable
 *   onSelectionChange={(keys, items) => setSelected(items)}
 *   pagination={{ current: 1, pageSize: 12, total: 120, onChange: handlePage }}
 * />
 * ```
 */
export interface GridViewProps<T> {
  /**
   * The data array to render. Each item becomes one grid card.
   * When empty (and no `emptyState` slot is provided), the grid displays a
   * default "No data" message.
   */
  data: T[];

  /**
   * Render function for each card. Receives the data item and its index.
   * The returned ReactNode is placed inside a grid cell container.
   *
   * @param item  - The data object for this card.
   * @param index - Zero-based index within `data`.
   */
  renderCard: (item: T, index: number) => ReactNode;

  /**
   * Unique row key accessor used for selection tracking and React
   * reconciliation.
   *
   * Can be a property name of T (e.g. `"id"`) or a function that derives a
   * string key from the item. Falls back to the array index when omitted,
   * which is only safe for static, non-selectable grids.
   */
  rowKey?: keyof T | ((item: T) => string);

  /**
   * Number of columns (1-6) or `'auto'` for responsive auto-fill.
   * When set to `'auto'`, the grid uses CSS `auto-fill` with `minColumnWidth`
   * to determine column count responsively.
   * @default 'auto'
   */
  columns?: number | 'auto';

  /**
   * Minimum column width in pixels when `columns='auto'`.
   * Used in the CSS `minmax()` function for responsive column sizing.
   * @default 280
   */
  minColumnWidth?: number;

  /**
   * Gap between grid cards. Accepts a number (pixels) or a CSS string
   * (e.g. a DS spacing variable).
   * @default 'var(--ds-spacing-4, 16px)'
   */
  gap?: number | string;

  // ---------------------------------------------------------------------------
  // Selection
  // ---------------------------------------------------------------------------

  /**
   * Enables selection checkboxes on each card. When true, a checkbox overlay
   * appears on each card and clicking the checkbox toggles selection.
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
   * @param items - The full item objects that are currently selected.
   */
  onSelectionChange?: (keys: string[], items: T[]) => void;

  // ---------------------------------------------------------------------------
  // Pagination
  // ---------------------------------------------------------------------------

  /**
   * Pagination configuration. Pass `false` to disable pagination entirely
   * (renders all cards). When provided, a pagination bar appears below the grid.
   * The parent owns page state and must update `data` when the page changes.
   */
  pagination?: PaginationConfig | false;

  // ---------------------------------------------------------------------------
  // States
  // ---------------------------------------------------------------------------

  /**
   * Custom empty state element rendered when `data` is an empty array.
   * Overrides the default "No data" placeholder.
   */
  emptyState?: ReactNode;

  /**
   * When true, the grid displays skeleton cards instead of content.
   * Shows a grid of placeholder cards matching the column layout.
   * @default false
   */
  loading?: boolean;

  // ---------------------------------------------------------------------------
  // Styling
  // ---------------------------------------------------------------------------

  /** Additional CSS class name applied to the grid root element. */
  className?: string;

  /** Inline styles applied to the grid root element. */
  style?: CSSProperties;
}

/**
 * Resolves a unique string key for a grid item, used for React keys and
 * selection tracking. Falls back to the array index when `rowKey` is not
 * provided.
 *
 * @typeParam T - Data item shape.
 * @param item   - The data item.
 * @param rowKey - The `rowKey` prop from GridViewProps.
 * @param index  - The array index, used as fallback.
 * @returns A string uniquely identifying this item.
 */
export function resolveGridRowKey<T>(
  item: T,
  rowKey: GridViewProps<T>['rowKey'],
  index: number,
): string {
  if (!rowKey) return String(index);
  if (typeof rowKey === 'function') return rowKey(item);
  return String((item as Record<string, unknown>)[rowKey as string]);
}
