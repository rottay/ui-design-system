/**
 * Surface helpers
 *
 * These helpers keep the actual surface components readable and enforce the
 * same permission and adapter rules everywhere.
 */

import type { ColumnDef, FieldDef } from '../patterns/types';
import type { DetailAction } from '../patterns/detail-panel';
import type { ButtonVariant } from '../primitives/inputs/Button';
import type {
  EntityAdapter,
  SurfaceAction,
  SurfaceColumn,
  DetailSurfaceTab,
  SurfaceFieldDef,
  SurfacePermissionsConfig,
  SurfaceTabbedView,
} from './types';

export function mapSurfaceData<TRaw, TView>(
  rawData: TRaw[],
  adapter: EntityAdapter<TRaw, TView>
): TView[] {
  return rawData.map((rawItem) => adapter.map(rawItem));
}

export function resolveSurfacePermission(
  permissions: SurfacePermissionsConfig | undefined,
  input: {
    kind: 'field' | 'action' | 'tab';
    id: string;
  }
): boolean {
  if (!permissions) {
    return true;
  }

  const permissionRule =
    input.kind === 'field'
      ? permissions.fields?.[input.id]
      : input.kind === 'action'
        ? permissions.actions?.[input.id]
        : permissions.tabs?.[input.id];

  if (permissions.isAllowed) {
    return permissions.isAllowed({
      kind: input.kind,
      id: input.id,
      permission: permissionRule?.permission,
    });
  }

  if (!permissionRule?.permission) {
    return true;
  }

  return permissions.granted?.includes(permissionRule.permission) ?? false;
}

export function filterSurfaceColumns<TView>(
  columns: SurfaceColumn<TView>[],
  permissions: SurfacePermissionsConfig | undefined
): SurfaceColumn<TView>[] {
  return columns.filter((column) => {
    return resolveSurfacePermission(permissions, {
      kind: 'field',
      id: column.fieldId,
    });
  });
}

export function filterSurfaceActions<TView>(
  actions: SurfaceAction<TView>[] | undefined,
  permissions: SurfacePermissionsConfig | undefined,
  item?: TView
): SurfaceAction<TView>[] {
  return (actions ?? []).filter((action) => {
    const isVisible = action.visible ? action.visible(item as TView) : true;

    if (!isVisible) {
      return false;
    }

    return resolveSurfacePermission(permissions, {
      kind: 'action',
      id: action.id,
    });
  });
}

/**
 * Single-action convenience wrapper.
 *
 * Several surfaces expose one high-salience action such as:
 * - primary CTA on an empty state
 * - cancel/save actions in form flows
 *
 * Those actions should still pass through the exact same visibility and
 * permission rules as action bars. This helper keeps that logic centralized.
 */
export function resolveSurfaceAction<TView>(
  action: SurfaceAction<TView> | undefined,
  permissions: SurfacePermissionsConfig | undefined,
  item?: TView
): SurfaceAction<TView> | undefined {
  return filterSurfaceActions(action ? [action] : undefined, permissions, item)[0];
}

export function filterSurfaceFields(
  fields: SurfaceFieldDef[],
  permissions: SurfacePermissionsConfig | undefined
): SurfaceFieldDef[] {
  return fields.filter((field) => {
    if (!field.fieldId) {
      return true;
    }

    return resolveSurfacePermission(permissions, {
      kind: 'field',
      id: field.fieldId,
    });
  });
}

export function filterSurfaceTabbedViews<TView extends SurfaceTabbedView>(
  views: TView[],
  permissions: SurfacePermissionsConfig | undefined
): TView[] {
  return views.filter((view) => {
    const isVisible =
      typeof view.visible === 'function'
        ? view.visible()
        : view.visible ?? true;

    if (!isVisible) {
      return false;
    }

    return resolveSurfacePermission(permissions, {
      kind: 'tab',
      id: view.permissionId ?? view.key,
    });
  });
}

export function filterDetailSurfaceTabs<TView>(
  tabs: DetailSurfaceTab<TView>[] | undefined,
  permissions: SurfacePermissionsConfig | undefined,
  item: TView
): DetailSurfaceTab<TView>[] {
  return (tabs ?? []).filter((tab) => {
    const isVisible =
      typeof tab.visible === 'function'
        ? tab.visible(item)
        : tab.visible ?? true;

    if (!isVisible) {
      return false;
    }

    return resolveSurfacePermission(permissions, {
      kind: 'tab',
      id: tab.permissionId ?? tab.key,
    });
  });
}

/**
 * Surface actions intentionally support a broader semantic vocabulary than some
 * underlying primitives. These helpers are the translation layer:
 * - surfaces stay product-friendly
 * - primitives and patterns stay strongly typed
 */
export function resolveSurfaceButtonVariant(
  variant: SurfaceAction['variant']
): ButtonVariant {
  switch (variant) {
    case 'primary':
    case 'secondary':
    case 'danger':
    case 'ghost':
    case 'default':
      return variant;
    default:
      return 'secondary';
  }
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

  return Object.values(values).filter((value) => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }

    return value !== undefined && value !== null && value !== '' && value !== false;
  }).length;
}

export function resolveColumnValue<TView>(
  column: Pick<ColumnDef<TView>, 'accessorFn' | 'accessorKey' | 'key'>,
  item: TView
): unknown {
  if (column.accessorFn) {
    return column.accessorFn(item);
  }

  if (column.accessorKey) {
    return (item as Record<string, unknown>)[column.accessorKey];
  }

  return (item as Record<string, unknown>)[column.key];
}

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

export function normalizeSurfaceError(
  error: unknown,
  fallbackMessage = 'Something went wrong while rendering this surface.'
): { message: string; description?: string } {
  if (error instanceof Error) {
    return {
      message: error.message || fallbackMessage,
      description: error.stack,
    };
  }

  if (typeof error === 'string' && error.trim().length > 0) {
    return {
      message: error,
    };
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string'
  ) {
    return {
      message: (error as { message: string }).message,
    };
  }

  return {
    message: fallbackMessage,
  };
}
