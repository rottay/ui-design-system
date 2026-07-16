import type { CSSProperties } from 'react';

/** Values accepted by both the accessible table and the lossless CSV path. */
export type ChartDataAccessCellValue = string | number | boolean | null | undefined;

/** App-owned column semantics. Labels and resolved values must already be localized. */
export interface ChartDataAccessColumn<TRow> {
  readonly id: string;
  readonly label: string;
  readonly getValue: (row: TRow) => ChartDataAccessCellValue;
}

/** A compact fact shown without mounting the complete data table. */
export interface ChartDataAccessSummaryFact {
  readonly id: string;
  readonly label: string;
  readonly value: string;
}

export interface ChartDataAccessPageStatus {
  readonly page: number;
  readonly pageCount: number;
  readonly firstRow: number;
  readonly lastRow: number;
  readonly totalRows: number;
}

/**
 * Every user-facing string is supplied by the application. The design system
 * intentionally has no built-in English or tenant-specific copy.
 */
export interface ChartDataAccessLabels {
  readonly summaryHeading: string;
  readonly openTable: string;
  readonly closeTable: string;
  readonly exportCsv: string;
  readonly tableCaption: string;
  readonly previousPage: string;
  readonly nextPage: string;
  readonly emptyTable: string;
  readonly pageStatus: (status: ChartDataAccessPageStatus) => string;
}

export interface ChartDataAccessCsvFile {
  readonly content: string;
  readonly filename: string;
  readonly mimeType: 'text/csv;charset=utf-8';
  readonly rowCount: number;
}

/** Replaces the browser downloader in tests or app-owned export transports. */
export type ChartDataAccessCsvDownload = (file: ChartDataAccessCsvFile) => void;

export interface ChartDataAccessProps<TRow> {
  readonly summary: readonly ChartDataAccessSummaryFact[];
  readonly columns: readonly [
    ChartDataAccessColumn<TRow>,
    ...ChartDataAccessColumn<TRow>[],
  ];
  readonly rows: readonly TRow[];
  readonly getRowKey: (row: TRow) => string;
  readonly labels: ChartDataAccessLabels;
  readonly csvFilename: string;
  /** Clamped to 1..50. Defaults to 25. */
  readonly pageSize?: number;
  readonly downloadCsv?: ChartDataAccessCsvDownload;
  readonly onOpenChange?: (open: boolean) => void;
  readonly className?: string;
  readonly style?: CSSProperties;
}

