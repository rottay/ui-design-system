'use client';

export { useSurfaceQuery } from './runtime/query';
export type {
  SurfaceQueryParams,
  SurfaceQueryResult,
  UseSurfaceQueryOptions,
  UseSurfaceQueryReturn,
} from './runtime/query';

export { useTableExport } from './runtime/table-export';
export type {
  TableExportColumn,
  UseTableExportOptions,
  UseTableExportReturn,
} from './runtime/table-export';

export { useOptimisticList, useOptimisticUpdate } from './runtime/optimistic';
export type {
  UseOptimisticListOptions,
  UseOptimisticListReturn,
  UseOptimisticUpdateOptions,
  UseOptimisticUpdateReturn,
} from './runtime/optimistic';

export { useDeferredPending } from './composition/react/deferred-pending';
export type {
  UseDeferredPendingOptions,
  UseDeferredPendingResult,
} from './composition/react/deferred-pending';

export { usePdfExport } from './runtime/pdf-export';
export type {
  PdfExportColumn,
  PdfExportOptions,
  PdfMargins,
  PdfTableData,
  UsePdfExportReturn,
} from './runtime/pdf-export';
