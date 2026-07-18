'use client';

/**
 * @fileoverview Generic ranked-rows renderer for the `ranked-rows` phone
 * projection. Every scaffold-backed family already builds an accessible
 * summary table (headers + rows) for screen readers; this renderer projects
 * those same rows into a visible ordered list, so the a11y summary doubles as
 * the mobile semantic projection. Row order is preserved exactly as the
 * family emitted it -- the design system is domain-blind and cannot know
 * which field a ranking would sort by.
 */

import type { CSSProperties } from 'react';

import type { ChartRankedRowsProjectionView } from '../../../../foundation/projection';

/** Registered identifier apps use in `ChartProjectionSpec.rendererId`. */
export const CHART_RANKED_ROWS_RENDERER_ID = 'ds.ranked-rows';

/**
 * Structural mirror of the scaffold's accessible summary table. Declared
 * structurally so the chart engine never imports upward from the scaffold
 * presentation tier.
 */
export interface ChartRankedRowsSource {
  readonly headers: readonly string[];
  readonly rows: ReadonlyArray<ReadonlyArray<string | number>>;
}

/** One projected column: the app-declared field bound to a source column. */
export interface ChartRankedRowsColumn {
  readonly fieldId: string;
  readonly index: number;
}

export interface ChartRankedRowsProjection {
  readonly columns: readonly ChartRankedRowsColumn[];
  readonly rows: ReadonlyArray<ReadonlyArray<string | number>>;
}

/**
 * Binds app-declared `fieldIds` to summary-table columns by exact header
 * match. Fails closed on an unknown field so a typo can never silently render
 * an empty projection.
 */
export function projectChartSummaryRows(
  source: ChartRankedRowsSource,
  fieldIds: readonly [string, ...string[]],
): ChartRankedRowsProjection {
  const columns = fieldIds.map((fieldId) => {
    const index = source.headers.indexOf(fieldId);
    if (index === -1) {
      throw new TypeError(
        `[ChartRankedRows] Unknown field "${fieldId}". Available fields: ${source.headers.join(', ')}.`,
      );
    }
    return { fieldId, index };
  });

  return {
    columns,
    rows: source.rows.map((row) => columns.map(({ index }) => row[index] ?? '')),
  };
}

export interface ChartRankedRowsViewProps {
  /** Resolved projection view carrying the ordered field identifiers. */
  readonly view: ChartRankedRowsProjectionView;
  /** The family's accessible summary table, reused as the projection source. */
  readonly source: ChartRankedRowsSource;
  /** Accessible name for the list; app-supplied, never DS copy. */
  readonly ariaLabel: string;
  /** Caps rendered rows; the full set stays in the accessible summary. */
  readonly maxRows?: number;
  readonly className?: string;
  readonly style?: CSSProperties;
}

/**
 * Ordered-list projection of the family summary. The first declared field
 * renders as the row label; remaining fields render as values.
 */
export function ChartRankedRowsView({
  view,
  source,
  ariaLabel,
  maxRows,
  className,
  style,
}: ChartRankedRowsViewProps): React.ReactElement {
  const projection = projectChartSummaryRows(source, view.fieldIds);
  const rows = maxRows !== undefined ? projection.rows.slice(0, maxRows) : projection.rows;
  const rootClassName = ['ds-chart-ranked-rows', className].filter(Boolean).join(' ');

  return (
    <ol
      className={rootClassName}
      data-part="root"
      data-renderer-id={view.rendererId}
      aria-label={ariaLabel}
      style={{
        listStyle: 'none',
        margin: 0,
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        ...style,
      }}
    >
      {rows.map((cells, rowIndex) => (
        <li
          key={rowIndex}
          data-part="row"
          style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}
        >
          {/* The ordered list already conveys position; the visible rank is a
              duplicate for sighted users only. */}
          <span data-part="rank" aria-hidden="true" style={{ fontSize: 13 }}>
            {rowIndex + 1}
          </span>
          {cells.map((cell, cellIndex) => (
            <span
              key={projection.columns[cellIndex].fieldId}
              data-part={cellIndex === 0 ? 'row-label' : 'row-value'}
              data-field={projection.columns[cellIndex].fieldId}
              style={cellIndex === 0 ? { flex: 1, minWidth: 0 } : undefined}
            >
              {String(cell)}
            </span>
          ))}
        </li>
      ))}
    </ol>
  );
}
