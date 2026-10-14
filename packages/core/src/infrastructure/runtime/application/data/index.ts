'use client';

export { useSurfaceQuery } from './access/query';
export type {
  SurfaceQueryParams,
  SurfaceQueryResult,
  UseSurfaceQueryOptions,
  UseSurfaceQueryReturn,
} from './access/query';

export { useTableExport } from './access/table-export';
export type {
  TableExportColumn,
  UseTableExportOptions,
  UseTableExportReturn,
} from './access/table-export';

export { useOptimisticList, useOptimisticUpdate } from './access/optimistic';
export type {
  UseOptimisticListOptions,
  UseOptimisticListReturn,
  UseOptimisticUpdateOptions,
  UseOptimisticUpdateReturn,
} from './access/optimistic';

export { useDeferredPending } from './composition/react/deferred-pending';
export type {
  UseDeferredPendingOptions,
  UseDeferredPendingResult,
} from './composition/react/deferred-pending';

export { usePdfExport } from './access/pdf-export';
export type {
  PdfExportColumn,
  PdfExportOptions,
  PdfMargins,
  PdfTableData,
  UsePdfExportReturn,
} from './access/pdf-export';
