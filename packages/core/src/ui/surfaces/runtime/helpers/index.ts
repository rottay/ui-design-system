/**
 * @fileoverview Surface helpers for presentation access, adapters, and data normalization.
 * @description Centralizes final app-resolved visibility (field/action/tab visibility),
 * column filtering, action variant mapping, and value display helpers used by every
 * surface component. Adding new presentation-access or filter logic should happen here, not
 * inside individual surfaces.
 */

import type { ColumnDef, FieldDef } from '../../../../foundation/contracts/runtime/components/patterns/core';
import type { DetailAction } from '../../../patterns/data/detail-panel';
import type { ButtonVariant } from '../../../primitives/inputs/Button';
import type {
  AppResolvedSurfaceAccess,
  EntityAdapter,
  SurfaceAccessInput,
  SurfaceAction,
  SurfaceCapabilityRegistration,
  SurfaceCapabilityKind,
  SurfaceColumn,
  DetailSurfaceTab,
  SurfaceFieldDef,
  SurfaceResolvedCapability,
  SurfaceTabbedView,
} from '../../foundation/contracts';

/** True only for explicit upstream-resolved, unfiltered presentation access. */
export function isAllSurfaceAccess(
  access: SurfaceAccessInput | undefined
): access is Extract<AppResolvedSurfaceAccess, { mode: 'all' }> {
  return Boolean(access && 'mode' in access && access.mode === 'all');
}

/** True only for a bounded app-resolved capability inventory. */
export function isResolvedSurfaceAccess(
  access: SurfaceAccessInput | undefined
): access is Extract<AppResolvedSurfaceAccess, { mode: 'resolved' }> {
  return Boolean(access && 'mode' in access && access.mode === 'resolved');
}

/** Resolve one final presentation decision without interpreting app policy. */
export function resolveSurfaceCapability(
  access: SurfaceAccessInput | undefined,
  input: { kind: SurfaceCapabilityKind; id: string }
): SurfaceResolvedCapability | undefined {
  if (!isResolvedSurfaceAccess(access)) {
    return undefined;
  }

  return access.capabilities.find(
    (capability) => capability.kind === input.kind && capability.id === input.id
  );
}

/**
 * Resolve a declared capability registry without invoking item/data callbacks.
 * The app-resolved `all` path preserves every declaration; resolved access only
 * projects the app's explicit visibility/disabled decisions.
 */
export function resolveSurfaceCapabilityRegistry(
  registrations: ReadonlyArray<SurfaceCapabilityRegistration>,
  access: SurfaceAccessInput | undefined
): SurfaceCapabilityRegistration[] {
  const seen = new Set<string>();
  const resolved: SurfaceCapabilityRegistration[] = [];

  for (const registration of registrations) {
    const id = registration.id.trim();
    if (!id) continue;

    const registryKey = `${registration.kind}:${id}`;
    if (seen.has(registryKey)) continue;
    seen.add(registryKey);

    const normalized = id === registration.id ? registration : { ...registration, id };
    if (isAllSurfaceAccess(access)) {
      resolved.push(normalized);
      continue;
    }

    if (!resolveSurfacePermission(access, { kind: registration.kind, id })) {
      continue;
    }

    if (!isResolvedSurfaceAccess(access)) {
      resolved.push(normalized);
      continue;
    }

    const capability = resolveSurfaceCapability(access, { kind: registration.kind, id });
    resolved.push(
      capability?.disabled && !normalized.disabled
        ? { ...normalized, disabled: true }
        : normalized
    );
  }

  return resolved;
}

export function mapSurfaceData<TRaw, TView>(
  rawData: TRaw[],
  adapter: EntityAdapter<TRaw, TView>
): TView[] {
  return rawData.map((rawItem) => adapter.map(rawItem));
}

/**
 * Resolve a final route, field, column, action, or tab presentation decision.
 * The DS never receives roles, grants, cascades, wildcard syntax, or policy callbacks.
 */
export function resolveSurfacePermission(
  access: SurfaceAccessInput | undefined,
  input: {
    kind: SurfaceCapabilityKind;
    id: string;
  }
): boolean {
  if (!access || isAllSurfaceAccess(access)) {
    return true;
  }

  return resolveSurfaceCapability(access, input)?.visible ?? false;
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

/** Filter action bars against declarative visibility and final access decisions. */
export function filterSurfaceActions<TView>(
  actions: SurfaceAction<TView>[] | undefined,
  access: SurfaceAccessInput | undefined,
  item?: TView
): SurfaceAction<TView>[] {
  if (isAllSurfaceAccess(access)) {
    return actions ?? [];
  }

  const visibleActions = (actions ?? []).filter((action) => {
    const isVisible = action.visible ? action.visible(item as TView) : true;

    if (!isVisible) {
      return false;
    }

    return resolveSurfacePermission(access, {
      kind: 'action',
      id: action.id,
    });
  });

  if (!isResolvedSurfaceAccess(access)) {
    return visibleActions;
  }

  return visibleActions.map((action) => {
    const capability = resolveSurfaceCapability(access, { kind: 'action', id: action.id });

    return capability?.disabled && !action.disabled
      ? { ...action, disabled: true }
      : action;
  });
}

/**
 * Single-action convenience wrapper.
 *
 * Several surfaces expose one high-salience action such as:
 * - primary CTA on an empty state
 * - cancel/save actions in form flows
 *
 * Those actions should still pass through the exact same visibility and final
 * access decisions as action bars. This helper keeps that logic centralized.
 */
export function resolveSurfaceAction<TView>(
  action: SurfaceAction<TView> | undefined,
  access: SurfaceAccessInput | undefined,
  item?: TView
): SurfaceAction<TView> | undefined {
  if (isAllSurfaceAccess(access)) {
    return action;
  }

  return filterSurfaceActions(action ? [action] : undefined, access, item)[0];
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

/** Filter tabbed navigation so hidden or unauthorized views never reach the renderer. */
export function filterSurfaceTabbedViews<TView extends SurfaceTabbedView>(
  views: TView[],
  access: SurfaceAccessInput | undefined
): TView[] {
  if (isAllSurfaceAccess(access)) {
    return views;
  }

  const visibleViews = views.filter((view) => {
    const isVisible =
      typeof view.visible === 'function'
        ? view.visible()
        : view.visible ?? true;

    if (!isVisible) {
      return false;
    }

    return resolveSurfacePermission(access, {
      kind: 'tab',
      id: view.capabilityId ?? view.permissionId ?? view.key,
    });
  });

  if (!isResolvedSurfaceAccess(access)) {
    return visibleViews;
  }

  return visibleViews.map((view) => {
    const capability = resolveSurfaceCapability(access, {
      kind: 'tab',
      id: view.capabilityId ?? view.permissionId ?? view.key,
    });

    return capability?.disabled && !view.disabled
      ? { ...view, disabled: true }
      : view;
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

/** Normalize arbitrary surface errors into user-facing message + description pairs. */
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
