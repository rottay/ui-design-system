'use client';

/**
 * @fileoverview ChartScaffold -- shared wrapper for all D3-backed charts.
 * Standardises loading state, title/subtitle rendering, ARIA metadata
 * (role, roledescription, keyboard navigation), and an accessible textual
 * summary table that is visually hidden but screen-reader readable.
 */

import React, { useId, useMemo, useState, type CSSProperties, type ReactNode, type RefObject } from 'react';

/**
 * Visually hidden but screen-reader-readable styles used by charts to expose
 * textual summaries without polluting the visual layout.
 */
const VISUALLY_HIDDEN_STYLE: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

export interface ChartSummaryTable {
  caption?: string;
  headers: string[];
  rows: Array<Array<string | number>>;
}

interface ChartScaffoldProps {
  containerRef: RefObject<HTMLDivElement | null>;
  svgRef: RefObject<SVGSVGElement | null>;
  width?: number | string;
  height: number;
  className?: string;
  style?: CSSProperties;
  loading?: boolean;
  loadingLabel: string;
  title?: string;
  subtitle?: string;
  ariaLabel: string;
  ariaDescription: string;
  summary?: ChartSummaryTable;
  legend?: ReactNode;
}

/**
 * Renders the summary as an HTML `<table>` for screen readers. This table
 * lives inside a visually-hidden container so sighted users see the chart
 * while assistive technology gets structured tabular data.
 */
function renderSummary(summary?: ChartSummaryTable): ReactNode {
  if (!summary || summary.rows.length === 0) {
    return null;
  }

  return (
    <table>
      {summary.caption ? <caption>{summary.caption}</caption> : null}
      <thead>
        <tr>
          {summary.headers.map((header) => (
            <th key={header}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {summary.rows.map((row, index) => (
          <tr key={`${summary.caption ?? 'summary'}-${index}`}>
            {row.map((cell, cellIndex) => (
              <td key={`${summary.caption ?? 'summary'}-${index}-${cellIndex}`}>{String(cell)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/**
 * Shared chart shell that standardizes loading, title/subtitle, ARIA metadata,
 * keyboard navigation, and an accessible textual summary for every D3-backed chart.
 *
 * Accessibility strategy:
 * - The `<svg>` is focusable (`tabIndex=0`) and has `role="img"` +
 *   `aria-roledescription="interactive chart"` for assistive technology.
 * - Arrow/Home/End keys cycle through summary data points, announced via
 *   `aria-live="polite"` so screen reader users can explore chart data.
 * - A visually hidden `<table>` provides a full textual summary of the data.
 *
 * @param props - Chart layout, ARIA labels, optional summary table, and legend.
 * @returns A container with loading state, title bar, accessible SVG, and legend slot.
 *
 * @example
 * ```tsx
 * <ChartScaffold
 *   containerRef={containerRef}
 *   svgRef={svgRef}
 *   height={400}
 *   loading={isLoading}
 *   loadingLabel="Loading chart..."
 *   ariaLabel="Monthly revenue"
 *   ariaDescription="Bar chart showing revenue by month"
 *   summary={{ headers: ['Month', 'Revenue'], rows: data }}
 * />
 * ```
 */
export function ChartScaffold({
  containerRef,
  svgRef,
  width,
  height,
  className,
  style,
  loading = false,
  loadingLabel,
  title,
  subtitle,
  ariaLabel,
  ariaDescription,
  summary,
  legend,
}: ChartScaffoldProps) {
  const descriptionId = useId();
  const titleId = useId();
  const svgTitleId = useId();
  const svgDescId = useId();
  const summaryListId = useId();
  // Tracks which data point the user navigated to via keyboard so we can
  // announce it via aria-live for screen readers.
  const [activeSummaryIndex, setActiveSummaryIndex] = useState(0);
  // Flatten the summary table into human-readable strings for keyboard nav.
  const summaryItems = useMemo(() => {
    if (!summary) {
      return [];
    }

    return summary.rows.map((row) =>
      row
        .map((cell, index) => {
          const header = summary.headers[index];
          return header ? `${header}: ${String(cell)}` : String(cell);
        })
        .join(', ')
    );
  }, [summary]);

  const activeSummaryItem =
    summaryItems.length > 0
      ? summaryItems[Math.min(activeSummaryIndex, Math.max(summaryItems.length - 1, 0))]
      : null;

  // Arrow/Home/End keys cycle through summary items and trigger an aria-live
  // announcement, giving screen reader users a way to explore chart data.
  const handleKeyboardNavigation = (event: React.KeyboardEvent<SVGSVGElement>) => {
    if (summaryItems.length === 0) {
      return;
    }

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveSummaryIndex((current) => (current + 1) % summaryItems.length);
      return;
    }

    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveSummaryIndex((current) => (current - 1 + summaryItems.length) % summaryItems.length);
      return;
    }

    if (event.key === 'Home') {
      event.preventDefault();
      setActiveSummaryIndex(0);
      return;
    }

    if (event.key === 'End') {
      event.preventDefault();
      setActiveSummaryIndex(summaryItems.length - 1);
    }
  };

  if (loading) {
    return (
      <div ref={containerRef} className={className} style={{ width: width ?? '100%', height, ...style }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: 'var(--ds-color-text-secondary)',
          }}
        >
          {loadingLabel}
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={className} style={{ position: 'relative', width: width ?? '100%', ...style }}>
      {title ? (
        <div style={{ marginBottom: 4 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--ds-color-text-primary)' }}>{title}</div>
          {subtitle ? (
            <div style={{ fontSize: 13, color: 'var(--ds-color-text-secondary)' }}>{subtitle}</div>
          ) : null}
        </div>
      ) : null}

      <div id={descriptionId} style={VISUALLY_HIDDEN_STYLE}>
        <p>{ariaDescription}</p>
        {summaryItems.length > 0 ? (
          <p>
            Use arrow keys to move through summary items, Home to jump to the
            first item, and End to jump to the last item.
          </p>
        ) : null}
        {activeSummaryItem ? (
          <p aria-live="polite" aria-atomic="true">
            Active data point: {activeSummaryItem}
          </p>
        ) : null}
        {summaryItems.length > 0 ? (
          <ul id={summaryListId}>
            {summaryItems.map((item, index) => (
              <li key={`${summaryListId}-${index}`} aria-current={index === activeSummaryIndex ? 'true' : undefined}>
                {item}
              </li>
            ))}
          </ul>
        ) : null}
        {renderSummary(summary)}
      </div>

      {/* The SVG is focusable (tabIndex=0) so keyboard users can reach it,
          and aria-roledescription overrides the generic "img" semantics with
          "interactive chart" for assistive technology. */}
      <svg
        ref={svgRef}
        role="img"
        aria-roledescription="interactive chart"
        tabIndex={0}
        aria-label={ariaLabel}
        aria-labelledby={title ? `${titleId} ${svgTitleId}` : svgTitleId}
        aria-describedby={`${descriptionId}${summaryItems.length > 0 ? ` ${summaryListId}` : ''}`}
        aria-keyshortcuts={summaryItems.length > 0 ? 'ArrowLeft ArrowRight ArrowUp ArrowDown Home End' : undefined}
        onKeyDown={handleKeyboardNavigation}
      >
        <title id={svgTitleId}>{ariaLabel}</title>
        <desc id={svgDescId}>{ariaDescription}</desc>
      </svg>

      {legend ?? null}
    </div>
  );
}

/**
 * Builds a human-readable ARIA description string for a chart.
 *
 * Combines the chart kind, item count, optional subtitle, and any extra
 * context into a single sentence suitable for `ariaDescription`.
 *
 * @param chartKind - e.g. "bar chart", "line chart", "pie chart".
 * @param itemCount - Number of data items displayed.
 * @param subtitle - Optional subtitle text to prepend.
 * @param extra - Optional extra context to append.
 * @returns A description string like "Monthly revenue. Bar chart containing 12 data items."
 *
 * @example
 * ```tsx
 * describeChart('line chart', 30, 'Daily signups', 'Last 30 days')
 * // => "Daily signups. line chart containing 30 data items. Last 30 days"
 * ```
 */
export function describeChart(
  chartKind: string,
  itemCount: number,
  subtitle?: string,
  extra?: string
): string {
  const parts = [
    subtitle,
    `${chartKind} containing ${itemCount} data ${itemCount === 1 ? 'item' : 'items'}.`,
    extra,
  ].filter(Boolean);

  return parts.join(' ');
}
