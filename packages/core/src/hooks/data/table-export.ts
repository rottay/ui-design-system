'use client';

/**
 * @fileoverview Table Export Hook - Rottay Design System
 * @description React hook for exporting table/surface data to CSV, JSON,
 * or clipboard (tab-separated for pasting into Excel/Google Sheets).
 *
 * @remarks
 * The `useTableExport` hook provides three export formats:
 *
 * - **CSV**: Proper RFC 4180-compliant CSV with escaping for commas, quotes,
 *   and newlines. Triggers a browser download.
 * - **JSON**: Pretty-printed JSON array. Triggers a browser download.
 * - **Clipboard**: Tab-separated values that paste correctly into spreadsheet
 *   applications (Excel, Google Sheets).
 *
 * Custom column rendering is supported via the `render` function on each
 * column definition, enabling formatted output for dates, currencies, etc.
 *
 * The hook is SSR-safe: export functions detect the browser environment
 * and are no-ops during server-side rendering.
 *
 * @example Basic usage
 * ```tsx
 * import { useTableExport } from '@rottay/design-system';
 *
 * function UsersTable({ users }) {
 *   const { exportCsv, exportJson, exportClipboard, isExporting } = useTableExport({
 *     data: users,
 *     columns: [
 *       { key: 'name', header: 'Full Name' },
 *       { key: 'email', header: 'Email Address' },
 *       { key: 'createdAt', header: 'Joined', render: (v) => new Date(v).toLocaleDateString() },
 *     ],
 *     filename: 'users-export',
 *   });
 *
 *   return (
 *     <Flex gap="2">
 *       <Button onClick={exportCsv} disabled={isExporting}>Export CSV</Button>
 *       <Button onClick={exportJson} disabled={isExporting}>Export JSON</Button>
 *       <Button onClick={exportClipboard} disabled={isExporting}>Copy</Button>
 *     </Flex>
 *   );
 * }
 * ```
 *
 * @module System/Hooks/Data/TableExport
 * @category System
 * @package @rottay/design-system
 */

import { useState, useCallback, useRef } from 'react';

// ============================================================================
// Types
// ============================================================================

/**
 * Column definition for table export.
 */
export interface TableExportColumn {
  /** Property key to read from each data item. Supports dot notation is NOT
   *  built-in; consumers should use `render` for nested access. */
  key: string;

  /** Display header for this column in the exported file. */
  header: string;

  /**
   * Optional render function to transform the raw value before export.
   * Use this for date formatting, currency symbols, boolean labels, etc.
   *
   * @param value - The raw value from the data item
   * @returns The formatted string for export
   */
  render?: (value: any) => string;
}

/**
 * Configuration options for the `useTableExport` hook.
 */
export interface UseTableExportOptions<T> {
  /** Array of data items to export. */
  data: T[];

  /** Column definitions controlling which fields are exported and how. */
  columns: TableExportColumn[];

  /**
   * Base filename for downloaded files (without extension).
   * The hook appends `.csv` or `.json` automatically.
   * @default 'export'
   */
  filename?: string;
}

/**
 * Return type of the `useTableExport` hook.
 */
export interface UseTableExportReturn {
  /** Download a CSV file of the current data. */
  exportCsv: () => void;

  /** Download a JSON file of the current data. */
  exportJson: () => void;

  /** Copy tab-separated data to the clipboard (for pasting into Excel/Sheets). */
  exportClipboard: () => Promise<void>;

  /** Whether an export operation is currently in progress. */
  isExporting: boolean;
}

// ============================================================================
// Internal Utilities
// ============================================================================

/**
 * Check if we are running in a browser environment.
 */
function isBrowser(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}

/**
 * Read a value from a data item by key.
 */
function readValue(item: any, key: string): any {
  if (item === null || item === undefined) return '';
  return item[key];
}

/**
 * Resolve a cell value to a string for export.
 */
function resolveCell(item: any, column: TableExportColumn): string {
  const raw = readValue(item, column.key);

  if (column.render) {
    try {
      return column.render(raw);
    } catch {
      return String(raw ?? '');
    }
  }

  if (raw === null || raw === undefined) return '';
  if (typeof raw === 'object') return JSON.stringify(raw);
  return String(raw);
}

/**
 * Escape a value for CSV output per RFC 4180.
 * - If the value contains a comma, double-quote, or newline, wrap it in quotes.
 * - Any double-quotes within the value are escaped by doubling them.
 */
function escapeCsvValue(value: string): string {
  if (
    value.includes(',') ||
    value.includes('"') ||
    value.includes('\n') ||
    value.includes('\r')
  ) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Escape a value for tab-separated clipboard output.
 * Replaces tabs and newlines within values to prevent column/row breaks.
 */
function escapeTabValue(value: string): string {
  return value.replace(/\t/g, ' ').replace(/\n/g, ' ').replace(/\r/g, '');
}

/**
 * Trigger a file download in the browser.
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  if (!isBrowser()) return;

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();

  // Cleanup
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Hook for exporting table/surface data to CSV, JSON, or clipboard.
 *
 * Generates properly escaped output for each format and triggers browser
 * downloads for CSV/JSON. Clipboard export produces tab-separated values
 * that paste correctly into spreadsheet applications.
 *
 * @param options - Hook configuration
 * @returns Export functions and loading state
 *
 * @example
 * ```tsx
 * const { exportCsv, exportJson, exportClipboard, isExporting } = useTableExport({
 *   data: users,
 *   columns: [
 *     { key: 'name', header: 'Name' },
 *     { key: 'balance', header: 'Balance', render: (v) => `$${v.toFixed(2)}` },
 *   ],
 *   filename: 'users',
 * });
 * ```
 */
export function useTableExport<T>(
  options: UseTableExportOptions<T>
): UseTableExportReturn {
  const { data, columns, filename = 'export' } = options;

  const [isExporting, setIsExporting] = useState(false);

  // Use refs to always access the latest data/columns without re-creating callbacks
  const dataRef = useRef(data);
  dataRef.current = data;

  const columnsRef = useRef(columns);
  columnsRef.current = columns;

  const filenameRef = useRef(filename);
  filenameRef.current = filename;

  // ---- Build rows from data + columns ----
  const buildRows = useCallback((): string[][] => {
    const cols = columnsRef.current;
    const items = dataRef.current;

    return items.map((item) =>
      cols.map((col) => resolveCell(item, col))
    );
  }, []);

  // ---- CSV Export ----
  const exportCsv = useCallback(() => {
    if (!isBrowser()) return;

    setIsExporting(true);

    try {
      const cols = columnsRef.current;
      const rows = buildRows();

      // Header row
      const headerLine = cols.map((c) => escapeCsvValue(c.header)).join(',');

      // Data rows
      const dataLines = rows.map((row) =>
        row.map(escapeCsvValue).join(',')
      );

      // BOM for Excel UTF-8 compatibility + content
      const bom = '\uFEFF';
      const csvContent = bom + [headerLine, ...dataLines].join('\r\n');

      downloadFile(csvContent, `${filenameRef.current}.csv`, 'text/csv;charset=utf-8');
    } finally {
      setIsExporting(false);
    }
  }, [buildRows]);

  // ---- JSON Export ----
  const exportJson = useCallback(() => {
    if (!isBrowser()) return;

    setIsExporting(true);

    try {
      const cols = columnsRef.current;
      const items = dataRef.current;

      // Build array of objects using column headers as keys
      const exportData = items.map((item) => {
        const obj: Record<string, string> = {};
        for (const col of cols) {
          obj[col.header] = resolveCell(item, col);
        }
        return obj;
      });

      const jsonContent = JSON.stringify(exportData, null, 2);

      downloadFile(
        jsonContent,
        `${filenameRef.current}.json`,
        'application/json;charset=utf-8'
      );
    } finally {
      setIsExporting(false);
    }
  }, [buildRows]);

  // ---- Clipboard Export (tab-separated) ----
  const exportClipboard = useCallback(async (): Promise<void> => {
    if (!isBrowser()) return;

    setIsExporting(true);

    try {
      const cols = columnsRef.current;
      const rows = buildRows();

      // Header row
      const headerLine = cols.map((c) => escapeTabValue(c.header)).join('\t');

      // Data rows
      const dataLines = rows.map((row) =>
        row.map(escapeTabValue).join('\t')
      );

      const tsvContent = [headerLine, ...dataLines].join('\n');

      await navigator.clipboard.writeText(tsvContent);
    } finally {
      setIsExporting(false);
    }
  }, [buildRows]);

  return {
    exportCsv,
    exportJson,
    exportClipboard,
    isExporting,
  };
}
