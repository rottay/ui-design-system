'use client';

import {
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';

import {
  CHART_DATA_ACCESS_CSV_MIME_TYPE,
  sanitizeChartDataAccessCsvFilename,
  serializeChartDataAccessCsv,
} from './ChartDataAccess.csv';
import type {
  ChartDataAccessCellValue,
  ChartDataAccessCsvDownload,
  ChartDataAccessCsvFile,
  ChartDataAccessLabels,
  ChartDataAccessProps,
  ChartDataAccessSummaryFact,
} from './ChartDataAccess.types';

export const CHART_DATA_ACCESS_SUMMARY_LIMIT = 5;
export const CHART_DATA_ACCESS_PAGE_SIZE_MAX = 50;
const CHART_DATA_ACCESS_PAGE_SIZE_DEFAULT = 25;

function requireLocalizedLabels(labels: ChartDataAccessLabels): void {
  const required = [
    ['summaryHeading', labels.summaryHeading],
    ['openTable', labels.openTable],
    ['closeTable', labels.closeTable],
    ['exportCsv', labels.exportCsv],
    ['tableCaption', labels.tableCaption],
    ['previousPage', labels.previousPage],
    ['nextPage', labels.nextPage],
    ['emptyTable', labels.emptyTable],
  ] as const;
  for (const [key, value] of required) {
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new TypeError(`[ChartDataAccess] labels.${key} must be localized non-empty copy.`);
    }
  }
}

function requireLabeledColumns<TRow>(
  columns: readonly ChartDataAccessProps<TRow>['columns'][number][],
): void {
  if (columns.length === 0) {
    throw new TypeError('[ChartDataAccess] At least one labeled column is required.');
  }
  const identifiers = new Set<string>();
  columns.forEach((column, index) => {
    if (column.id.trim().length === 0 || identifiers.has(column.id)) {
      throw new TypeError(`[ChartDataAccess] Column ${index + 1} requires a unique non-empty id.`);
    }
    if (column.label.trim().length === 0) {
      throw new TypeError(`[ChartDataAccess] Column ${index + 1} requires a localized label.`);
    }
    identifiers.add(column.id);
  });
}

function requireVisibleSummaryFacts(summary: readonly ChartDataAccessSummaryFact[]): void {
  const identifiers = new Set<string>();
  summary.slice(0, CHART_DATA_ACCESS_SUMMARY_LIMIT).forEach((fact, index) => {
    if (fact.id.trim().length === 0 || identifiers.has(fact.id)) {
      throw new TypeError(`[ChartDataAccess] Summary fact ${index + 1} requires a unique non-empty id.`);
    }
    if (fact.label.trim().length === 0) {
      throw new TypeError(`[ChartDataAccess] Summary fact ${index + 1} requires a localized label.`);
    }
    identifiers.add(fact.id);
  });
}

function normalizePageSize(pageSize: number | undefined): number {
  if (pageSize === undefined || !Number.isFinite(pageSize)) {
    return CHART_DATA_ACCESS_PAGE_SIZE_DEFAULT;
  }
  return Math.min(
    CHART_DATA_ACCESS_PAGE_SIZE_MAX,
    Math.max(1, Math.trunc(pageSize)),
  );
}

function renderCellValue(value: ChartDataAccessCellValue): string {
  return value === null || value === undefined ? '' : String(value);
}

function browserDownloadCsv(file: ChartDataAccessCsvFile): void {
  const blob = new Blob([file.content], { type: file.mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = file.filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

export function ChartDataAccess<TRow>({
  summary,
  columns,
  rows,
  getRowKey,
  labels,
  csvFilename,
  pageSize,
  downloadCsv = browserDownloadCsv,
  onOpenChange,
  className,
  style,
}: ChartDataAccessProps<TRow>): React.ReactElement {
  requireLocalizedLabels(labels);
  requireLabeledColumns(columns);
  requireVisibleSummaryFacts(summary);

  const disclosureId = useId();
  const summaryHeadingId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const boundedPageSize = normalizePageSize(pageSize);

  const updateOpen = (nextOpen: boolean, restoreFocus = false): void => {
    setOpen(nextOpen);
    if (!nextOpen) setPageIndex(0);
    if (restoreFocus) triggerRef.current?.focus();
    onOpenChange?.(nextOpen);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLElement>): void => {
    if (!open || event.key !== 'Escape') return;
    event.preventDefault();
    event.stopPropagation();
    updateOpen(false, true);
  };

  const handleExport = (): void => {
    const file: ChartDataAccessCsvFile = {
      content: serializeChartDataAccessCsv(rows, columns),
      filename: sanitizeChartDataAccessCsvFilename(csvFilename),
      mimeType: CHART_DATA_ACCESS_CSV_MIME_TYPE,
      rowCount: rows.length,
    };
    (downloadCsv as ChartDataAccessCsvDownload)(file);
  };

  let disclosure: ReactNode = null;
  if (open) {
    const pageCount = rows.length === 0
      ? 0
      : Math.ceil(rows.length / boundedPageSize);
    const currentPageIndex = pageCount === 0
      ? 0
      : Math.min(pageIndex, pageCount - 1);
    const firstIndex = currentPageIndex * boundedPageSize;
    const pageRows = rows.slice(firstIndex, firstIndex + boundedPageSize);
    const firstRow = pageRows.length === 0 ? 0 : firstIndex + 1;
    const lastRow = firstIndex + pageRows.length;
    const status = labels.pageStatus({
      page: pageCount === 0 ? 0 : currentPageIndex + 1,
      pageCount,
      firstRow,
      lastRow,
      totalRows: rows.length,
    });
    if (status.trim().length === 0) {
      throw new TypeError('[ChartDataAccess] labels.pageStatus must return localized copy.');
    }

    disclosure = (
      <div
        id={disclosureId}
        className="ds-chart-data-access__disclosure"
        data-part="data-disclosure"
        role="region"
        aria-labelledby={`${disclosureId}-trigger`}
      >
        <div className="ds-chart-data-access__actions" data-part="data-actions">
          <button type="button" data-part="data-action" onClick={handleExport}>
            {labels.exportCsv}
          </button>
          <button
            type="button"
            data-part="data-action"
            onClick={() => updateOpen(false, true)}
          >
            {labels.closeTable}
          </button>
        </div>

        <div
          className="ds-chart-data-access__table-scroll"
          data-part="data-table-scroll"
          role="region"
          aria-label={labels.tableCaption}
          tabIndex={0}
        >
          <table
            className="ds-chart-data-access__table"
            data-part="data-table"
            aria-rowcount={rows.length + 1}
          >
            <caption>{labels.tableCaption}</caption>
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column.id} scope="col">{column.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row, index) => (
                <tr key={getRowKey(row)} aria-rowindex={firstIndex + index + 2}>
                  {columns.map((column) => (
                    <td key={column.id}>{renderCellValue(column.getValue(row))}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pageRows.length === 0 ? (
          <p className="ds-chart-data-access__empty" data-part="data-empty">
            {labels.emptyTable}
          </p>
        ) : null}

        <div className="ds-chart-data-access__pagination" data-part="data-pagination">
          <button
            type="button"
            disabled={currentPageIndex <= 0}
            onClick={() => setPageIndex(Math.max(0, currentPageIndex - 1))}
          >
            {labels.previousPage}
          </button>
          <span role="status" aria-live="polite" aria-atomic="true">
            {status}
          </span>
          <button
            type="button"
            disabled={pageCount === 0 || currentPageIndex >= pageCount - 1}
            onClick={() => setPageIndex(Math.min(pageCount - 1, currentPageIndex + 1))}
          >
            {labels.nextPage}
          </button>
        </div>
      </div>
    );
  }

  return (
    <section
      className={['ds-chart-data-access', className].filter(Boolean).join(' ')}
      data-part="chart-data-access"
      style={style}
      onKeyDown={handleKeyDown}
      data-state={open ? 'open' : 'closed'}
      aria-labelledby={summaryHeadingId}
    >
      <div data-part="data-summary" aria-labelledby={summaryHeadingId}>
        <div id={summaryHeadingId} data-part="data-summary-heading">
          {labels.summaryHeading}
        </div>
        <dl className="ds-chart-data-access__summary" data-part="data-facts">
          {summary.slice(0, CHART_DATA_ACCESS_SUMMARY_LIMIT).map((fact) => (
            <div key={fact.id} className="ds-chart-data-access__fact" data-part="data-fact">
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <button
        id={`${disclosureId}-trigger`}
        ref={triggerRef}
        type="button"
        data-part="data-trigger"
        aria-expanded={open}
        aria-controls={disclosureId}
      onClick={() => updateOpen(!open, open)}
    >
        {open ? labels.closeTable : labels.openTable}
      </button>

      {disclosure}
    </section>
  );
}
