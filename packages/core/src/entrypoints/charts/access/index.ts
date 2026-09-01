'use client';

/** Focused, bounded accessible-data companion for chart consumers. */
export {
  CHART_DATA_ACCESS_PAGE_SIZE_MAX,
  CHART_DATA_ACCESS_SUMMARY_LIMIT,
  ChartDataAccess,
} from '../../../components/patterns/visualization/charts/runtime/chart-engine/presentation/react/access';
export {
  CHART_DATA_ACCESS_CSV_MIME_TYPE,
  sanitizeChartDataAccessCsvFilename,
  serializeChartDataAccessCsv,
} from '../../../components/patterns/visualization/charts/runtime/chart-engine/foundation/access/csv';
export type {
  ChartDataAccessCellValue,
  ChartDataAccessColumn,
  ChartDataAccessCsvDownload,
  ChartDataAccessCsvFile,
  ChartDataAccessLabels,
  ChartDataAccessPageStatus,
  ChartDataAccessSummaryFact,
} from '../../../components/patterns/visualization/charts/runtime/chart-engine/foundation/access';
export type {
  ChartDataAccessProps,
} from '../../../components/patterns/visualization/charts/runtime/chart-engine/presentation/react/access';
