/**
 * @fileoverview Export utilities -- pure-function generators for CSV, JSON,
 * and clipboard export formats. Zero external dependencies.
 *
 * @description
 * Each generator accepts a flat array of row data (already resolved via
 * column accessors) plus header metadata. The output is either a string
 * ready for download or clipboard, or a Blob.
 *
 * Value resolution follows the priority chain:
 *   1. `accessorFn(row)` if provided
 *   2. `row[accessorKey]` if provided
 *   3. `row[key]` as final fallback
 *
 * Header resolution:
 *   1. `header` if it is a string
 *   2. `key` as fallback (React nodes are not serializable to CSV headers)
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ExportColumn {
  /** Column identifier */
  key: string;
  /** Display header -- string is used directly; ReactNode falls back to key */
  header: string | React.ReactNode;
  /** Data access key when different from `key` */
  accessorKey?: string;
  /** Custom value extractor */
  accessorFn?: (row: any) => unknown;
}

export type ExportFormat = 'csv' | 'json' | 'clipboard';

// ---------------------------------------------------------------------------
// Value resolution
// ---------------------------------------------------------------------------

/** Resolve the display value for a single cell. */
export function resolveValue(row: Record<string, unknown>, column: ExportColumn): unknown {
  if (column.accessorFn) return column.accessorFn(row);
  const field = column.accessorKey ?? column.key;
  return row[field];
}

/** Resolve the header label for a column. */
export function resolveHeader(column: ExportColumn): string {
  return typeof column.header === 'string' ? column.header : column.key;
}

// ---------------------------------------------------------------------------
// Serialization helpers
// ---------------------------------------------------------------------------

/** Escape a value for safe inclusion inside a CSV cell. */
function escapeCsvValue(value: unknown): string {
  if (value == null) return '';
  const str = String(value);
  // Wrap in quotes if the value contains commas, quotes, or newlines.
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// ---------------------------------------------------------------------------
// Generators
// ---------------------------------------------------------------------------

/**
 * Generate a CSV string from the provided data and columns.
 *
 * @param data    Array of row objects.
 * @param columns Columns to include in the export.
 * @returns       CSV content as a string.
 */
export function generateCsv<T = unknown>(data: T[], columns: ExportColumn[]): string {
  const headers = columns.map(resolveHeader);
  const headerRow = headers.map(escapeCsvValue).join(',');

  const rows = data.map((row) => {
    return columns
      .map((col) => escapeCsvValue(resolveValue(row as Record<string, unknown>, col)))
      .join(',');
  });

  return [headerRow, ...rows].join('\n');
}

/**
 * Generate a JSON string from the provided data and columns.
 *
 * Each row is serialized as an object keyed by the resolved header label,
 * keeping the output human-readable and aligned with what the user sees in
 * the table header row.
 *
 * @param data    Array of row objects.
 * @param columns Columns to include in the export.
 * @returns       Pretty-printed JSON string.
 */
export function generateJson<T = unknown>(data: T[], columns: ExportColumn[]): string {
  const mapped = data.map((row) => {
    const obj: Record<string, unknown> = {};
    for (const col of columns) {
      obj[resolveHeader(col)] = resolveValue(row as Record<string, unknown>, col);
    }
    return obj;
  });

  return JSON.stringify(mapped, null, 2);
}

/**
 * Generate a tab-separated string suitable for clipboard pasting into
 * spreadsheet applications.
 *
 * @param data    Array of row objects.
 * @param columns Columns to include in the export.
 * @returns       Tab-separated content (headers + data rows).
 */
export function generateClipboardText<T = unknown>(data: T[], columns: ExportColumn[]): string {
  const headers = columns.map(resolveHeader);
  const headerRow = headers.join('\t');

  const rows = data.map((row) => {
    return columns
      .map((col) => {
        const val = resolveValue(row as Record<string, unknown>, col);
        return val == null ? '' : String(val);
      })
      .join('\t');
  });

  return [headerRow, ...rows].join('\n');
}

// ---------------------------------------------------------------------------
// Download helper
// ---------------------------------------------------------------------------

/**
 * Trigger a browser download for the given content.
 *
 * Creates a temporary anchor element, clicks it, then revokes the object URL.
 * Works in all modern browsers with no external dependency.
 */
export function triggerDownload(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();

  // Clean up after a small delay to allow the browser to initiate the download.
  setTimeout(() => {
    URL.revokeObjectURL(url);
    document.body.removeChild(anchor);
  }, 100);
}

// ---------------------------------------------------------------------------
// Clipboard helper
// ---------------------------------------------------------------------------

/**
 * Copy text to the system clipboard.
 *
 * Falls back to `document.execCommand('copy')` when the Clipboard API is
 * unavailable (e.g. non-secure contexts).
 *
 * @returns `true` when the copy succeeded.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Clipboard API failed -- fall through to legacy method.
  }

  // Legacy fallback
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}
