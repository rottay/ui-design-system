/**
 * @fileoverview Surface helpers for presentation access, adapters, and data normalization.
 * @description Centralizes final app-resolved visibility (field/action/tab visibility),
 * column filtering, action variant mapping, and value display helpers used by every
 * surface component. Adding new presentation-access or filter logic should happen here, not
 * inside individual surfaces.
 *
 * The generic half of that access model -- the nine functions that resolve a
 * capability decision from `SurfaceAccessInput` alone -- now lives one tier down,
 * in `ui/structures/foundation/chrome/runtime/access`, because `HeaderSurface`
 * is page chrome and the structures tier may not import from surfaces. What
 * stayed here is everything that resolves access against surface-only
 * vocabulary: `SurfaceColumn`, `SurfaceFieldDef`, `DetailSurfaceTab`, per-row
 * field visibility, and the data normalizers.
 *
 * The `error?: unknown` contract -- `hasSurfaceError` and
 * `normalizeSurfaceError` -- left on the same argument and for the same
 * reason: it reads an `unknown` value and knows no surface vocabulary, and
 * `SurfaceErrorState` is page chrome that now lives in
 * `ui/structures/feedback/surface-lifecycle`. Both are re-exported below from
 * `ui/structures/foundation/chrome/runtime/errors`.
 *
 * The nine are imported for local use and re-exported by name. This barrel is
 * their only public path (`ui/surfaces/index.ts` re-exports it), so the package
 * keeps exporting the same API it exported before the move; and every function
 * below builds on them, which makes this the surfaces tier consuming the tier
 * beneath it rather than a compatibility shim for a retired path.
 */

import type { ColumnDef, FieldDef } from '../../../../foundation/contracts/runtime/components/patterns/core';
import type { DetailAction } from '../../../patterns/data/detail-panel';
import {
  filterSurfaceActions,
  isAllSurfaceAccess,
  isResolvedSurfaceAccess,
  resolveSurfaceCapability,
  resolveSurfacePermission,
} from '../../../structures/foundation/chrome/runtime/access';
import type {
  EntityAdapter,
  SurfaceAccessInput,
  SurfaceAction,
  SurfaceColumn,
  DetailSurfaceTab,
  SurfaceFieldDef,
} from '../../foundation/contracts';

export {
  filterSurfaceActions,
  filterSurfaceTabbedViews,
  isAllSurfaceAccess,
  isResolvedSurfaceAccess,
  resolveSurfaceAction,
  resolveSurfaceButtonVariant,
  resolveSurfaceCapability,
  resolveSurfaceCapabilityRegistry,
  resolveSurfacePermission,
} from '../../../structures/foundation/chrome/runtime/access';

export {
  hasSurfaceError,
  normalizeSurfaceError,
} from '../../../structures/foundation/chrome/runtime/errors';

export function mapSurfaceData<TRaw, TView>(
  rawData: TRaw[],
  adapter: EntityAdapter<TRaw, TView>
): TView[] {
  return rawData.map((rawItem) => adapter.map(rawItem));
}

/**
 * Filter row-level actions using only the app's final presentation decisions.
 * Row authorization remains app/server-owned and must happen before this call.
 */
export function filterSurfaceRowActions<TView>(
  actions: SurfaceAction<TView>[] | undefined,
  access: SurfaceAccessInput | undefined,
  row: TView,
  rowIndex: number
): SurfaceAction<TView>[] {
  void rowIndex;
  return filterSurfaceActions(actions, access, row);
}

/**
 * Check a field's app-resolved visibility. Row policy is evaluated upstream.
 */
export function isFieldVisibleForRow<TView>(
  fieldId: string,
  access: SurfaceAccessInput | undefined,
  row: TView,
  rowIndex: number
): boolean {
  void row;
  void rowIndex;
  return resolveSurfacePermission(access, {
    kind: 'field',
    id: fieldId,
  });
}

/**
 * Resolve field access level for a specific row.
 *
 * Returns 'visible' | 'readonly' | 'hidden'.
 */
export function resolveFieldAccessForRow<TView>(
  fieldId: string,
  access: SurfaceAccessInput | undefined,
  row: TView,
  rowIndex: number
): 'visible' | 'readonly' | 'hidden' {
  if (!access || isAllSurfaceAccess(access)) {
    return 'visible';
  }

  void row;
  void rowIndex;
  const capability = resolveSurfaceCapability(access, { kind: 'field', id: fieldId });

  if (!capability?.visible) {
    return 'hidden';
  }

  return capability.disabled ? 'readonly' : 'visible';
}

/** Filter visible columns before they reach table-like patterns. */
export function filterSurfaceColumns<TView>(
  columns: SurfaceColumn<TView>[],
  access: SurfaceAccessInput | undefined
): SurfaceColumn<TView>[] {
  if (isAllSurfaceAccess(access)) {
    return columns;
  }

  return columns.filter((column) => {
    return resolveSurfacePermission(access, {
      kind: 'column',
      id: column.fieldId,
    });
  });
}

export function filterSurfaceFields(
  fields: SurfaceFieldDef[],
  access: SurfaceAccessInput | undefined
): SurfaceFieldDef[] {
  if (isAllSurfaceAccess(access)) {
    return fields;
  }

  return fields.filter((field) => {
    if (!field.fieldId) {
      return true;
    }

    return resolveSurfacePermission(access, {
      kind: 'field',
      id: field.fieldId,
    });
  });
}

/** Apply tab visibility and final access decisions to detail surfaces. */
export function filterDetailSurfaceTabs<TView>(
  tabs: DetailSurfaceTab<TView>[] | undefined,
  access: SurfaceAccessInput | undefined,
  item: TView
): DetailSurfaceTab<TView>[] {
  if (isAllSurfaceAccess(access)) {
    return tabs ?? [];
  }

  const visibleTabs = (tabs ?? []).filter((tab) => {
    const isVisible =
      typeof tab.visible === 'function'
        ? tab.visible(item)
        : tab.visible ?? true;

    if (!isVisible) {
      return false;
    }

    return resolveSurfacePermission(access, {
      kind: 'tab',
      id: tab.capabilityId ?? tab.permissionId ?? tab.key,
    });
  });

  if (!isResolvedSurfaceAccess(access)) {
    return visibleTabs;
  }

  return visibleTabs.map((tab) => {
    const capability = resolveSurfaceCapability(access, {
      kind: 'tab',
      id: tab.capabilityId ?? tab.permissionId ?? tab.key,
    });

    return capability?.disabled && !tab.disabled
      ? { ...tab, disabled: true }
      : tab;
  });
}

export function resolveSurfaceDetailActionVariant(
  variant: SurfaceAction['variant']
): DetailAction['variant'] {
  switch (variant) {
    case 'primary':
    case 'danger':
    case 'ghost':
    case 'default':
      return variant;
    case 'secondary':
      /**
       * DetailPanel does not expose a `secondary` visual contract. `default`
       * is the nearest neutral action style, so we normalize to that here.
       */
      return 'default';
    default:
      return 'default';
  }
}

export function countActiveFilters(values: Record<string, unknown> | undefined): number {
  if (!values) {
    return 0;
  }

  // Mirrors the product expectation of "active" filters while ignoring empty placeholders.
  return Object.values(values).filter((value) => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }

    return value !== undefined && value !== null && value !== '' && value !== false;
  }).length;
}

/** Resolve a column value using the same accessor priority the pattern layer expects. */
export function resolveColumnValue<TView>(
  column: Pick<ColumnDef<TView>, 'accessorFn' | 'accessorKey' | 'key'>,
  item: TView
): unknown {
  if (column.accessorFn) {
    return column.accessorFn(item);
  }

  if (typeof item !== 'object' || item === null) {
    return undefined;
  }

  if (column.accessorKey) {
    return Reflect.get(item, column.accessorKey);
  }

  return Reflect.get(item, column.key);
}

/** Convert heterogeneous field values into stable display strings for summaries and fallbacks. */
export function stringifySurfaceValue(value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return JSON.stringify(value);
}
