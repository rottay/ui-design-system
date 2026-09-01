import type {
  ChartDataAccessCellValue,
  ChartDataAccessColumn,
} from '..';

export const CHART_DATA_ACCESS_CSV_MIME_TYPE = 'text/csv;charset=utf-8' as const;

function assertColumn(column: ChartDataAccessColumn<unknown>, index: number): void {
  if (column.id.trim().length === 0) {
    throw new TypeError(`[ChartDataAccess] Column ${index + 1} requires a non-empty id.`);
  }
  if (column.label.trim().length === 0) {
    throw new TypeError(`[ChartDataAccess] Column ${index + 1} requires a localized label.`);
  }
}

function toCsvString(value: ChartDataAccessCellValue): string {
  if (value === null || value === undefined) return '';
  if (
    typeof value !== 'string'
    && typeof value !== 'number'
    && typeof value !== 'boolean'
  ) {
    throw new TypeError('[ChartDataAccess] CSV cells must be scalar values.');
  }
  if (typeof value === 'number' && !Number.isFinite(value)) {
    throw new TypeError('[ChartDataAccess] CSV numbers must be finite.');
  }
  return String(value);
}

/** Prefixes string cells whose first non-whitespace character starts a formula. */
function neutralizeSpreadsheetFormula(value: string): string {
  return /^\s*[=+\-@]/u.test(value) ? `'${value}` : value;
}

/** RFC 4180 field escaping after spreadsheet-formula neutralization. */
function serializeCell(value: ChartDataAccessCellValue): string {
  const serialized = toCsvString(value);
  const safe = typeof value === 'string'
    ? neutralizeSpreadsheetFormula(serialized)
    : serialized;
  return /[",\r\n]/u.test(safe)
    ? `"${safe.replace(/"/gu, '""')}"`
    : safe;
}

/** Serializes every row with CRLF records and an optional final RFC record break. */
export function serializeChartDataAccessCsv<TRow>(
  rows: readonly TRow[],
  columns: readonly ChartDataAccessColumn<TRow>[],
): string {
  if (columns.length === 0) {
    throw new TypeError('[ChartDataAccess] CSV export requires at least one column.');
  }
  columns.forEach((column, index) => assertColumn(
    column as ChartDataAccessColumn<unknown>,
    index,
  ));

  const records = [
    columns.map((column) => serializeCell(column.label)).join(','),
    ...rows.map((row) => columns
      .map((column) => serializeCell(column.getValue(row)))
      .join(',')),
  ];
  return `${records.join('\r\n')}\r\n`;
}

const WINDOWS_RESERVED_FILENAME = /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/iu;

/** Produces one safe, bounded `.csv` filename without erasing Unicode letters. */
export function sanitizeChartDataAccessCsvFilename(filename: string): string {
  const normalized = filename
    .normalize('NFKC')
    .trim()
    .replace(/(?:\.csv)+$/giu, '')
    .replace(/[\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/gu, '')
    .replace(/[\\/:*?"<>|]+/gu, '-')
    .replace(/\s+/gu, '-')
    .replace(/[^\p{L}\p{M}\p{N}._-]+/gu, '-')
    .replace(/^[.\s-]+|[.\s-]+$/gu, '')
    .replace(/-{2,}/gu, '-');
  const bounded = Array.from(normalized).slice(0, 100).join('');
  const base = bounded.length === 0 ? 'chart-data' : bounded;
  const safeBase = WINDOWS_RESERVED_FILENAME.test(base) ? `_${base}` : base;
  return `${safeBase}.csv`;
}
