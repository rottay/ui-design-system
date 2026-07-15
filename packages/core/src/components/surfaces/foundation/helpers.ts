/**
 * @fileoverview Surface helpers for permissions, adapters, and data normalization.
 * @description Centralizes the permission resolution logic (field/action/tab visibility),
 * column filtering, action variant mapping, and value display helpers used by every
 * surface component. Adding new permission or filter logic should happen here, not
 * inside individual surfaces.
 */

import type { ColumnDef, FieldDef } from '../../patterns/foundation/types';
import type { DetailAction } from '../../patterns/data/detail-panel';
import type { ButtonVariant } from '../../primitives/inputs/Button';
import type {
  AppResolvedSurfaceAccess,
  EntityAdapter,
  SurfaceAccessInput,
  SurfaceAction,
  SurfaceCapabilityKind,
  SurfaceColumn,
  DetailSurfaceTab,
  SurfaceFieldDef,
  SurfaceResolvedCapability,
  SurfaceTabbedView,
} from './types';

/** True only for the explicit app-resolved superadmin presentation signal. */
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

/** Resolve one capability without interpreting app roles, grants, or cascades. */
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

export function mapSurfaceData<TRaw, TView>(
  rawData: TRaw[],
  adapter: EntityAdapter<TRaw, TView>
): TView[] {
  return rawData.map((rawItem) => adapter.map(rawItem));
}

/**
 * Resolve field, action, or tab visibility against the surface permission model.
 *
 * Surfaces intentionally keep permissions data-driven. This helper is the
 * narrow place where explicit grants and custom `isAllowed` logic are combined.
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

  if (isResolvedSurfaceAccess(access)) {
    return resolveSurfaceCapability(access, input)?.visible ?? false;
  }

  const permissions = access;

  // Legacy permissions never owned route visibility. Keep routes app-owned.
  if (input.kind === 'route') {
    return true;
  }

  const legacyKind = input.kind === 'column' ? 'field' : input.kind;

  if (legacyKind === 'action') {
    if (permissions.allowedActions && !permissions.allowedActions.includes(input.id)) {
      return false;
    }

    if (permissions.deniedActions?.includes(input.id)) {
      return false;
    }
  }

  const permissionRule =
    legacyKind === 'field'
      ? permissions.fields?.[input.id]
      : legacyKind === 'action'
        ? permissions.actions?.[input.id]
        : permissions.tabs?.[input.id];

  if (permissions.isAllowed) {
    return permissions.isAllowed({
      kind: legacyKind,
      id: input.id,
      permission: permissionRule?.permission,
      context: permissions.runtimeContext,
    });
  }

  if (!permissionRule?.permission) {
    return true;
  }

  // When cascade rules are defined, expand granted permissions before checking.
  if (permissions.cascadeRules) {
    const expanded = expandCascadedPermissions(permissions.granted, permissions.cascadeRules);

    return expanded.has(permissionRule.permission);
  }

  return permissions.granted?.includes(permissionRule.permission) ?? false;
}

// ---------------------------------------------------------------------------
// Permission cascade + row-level helpers (Wave 5, section 5)
// ---------------------------------------------------------------------------

/**
 * Expand granted permissions using cascade rules.
 * Returns a new Set containing all explicitly granted + implied permissions.
 *
 * Example: granted=['users:delete'], cascadeRules={'users:delete':['users:edit','users:view']}
 * Result: Set{'users:delete','users:edit','users:view'}
 */
export function expandCascadedPermissions(
  granted: string[] | undefined,
  cascadeRules: Record<string, string[]> | undefined
): Set<string> {
  const expanded = new Set(granted ?? []);

  if (!cascadeRules) {
    return expanded;
  }

  for (const permission of expanded) {
    const implied = cascadeRules[permission];

    if (implied) {
      for (const impliedPermission of implied) {
        expanded.add(impliedPermission);
      }
    }
  }

  return expanded;
}

/**
 * Filter row-level actions: combines global permission checks with
 * per-row evaluation when isRowAllowed is defined.
 *
 * Applies the same visibility and permission logic as `filterSurfaceActions`,
 * then additionally checks `isRowAllowed` for each surviving action.
 */
export function filterSurfaceRowActions<TView>(
  actions: SurfaceAction<TView>[] | undefined,
  access: SurfaceAccessInput | undefined,
  row: TView,
  rowIndex: number
): SurfaceAction<TView>[] {
  if (isAllSurfaceAccess(access)) {
    return actions ?? [];
  }

  // Start with the global action filter (visibility + permission rules).
  const globallyAllowed = filterSurfaceActions(actions, access, row);

  if (isResolvedSurfaceAccess(access)) {
    return globallyAllowed;
  }

  if (!access?.isRowAllowed) {
    return globallyAllowed;
  }

  return globallyAllowed.filter((action) => {
    const permissionRule = access.actions?.[action.id];

    return access.isRowAllowed!({
      kind: 'action',
      id: action.id,
      permission: permissionRule?.permission,
      row,
      rowIndex,
      context: access.runtimeContext,
    });
  });
}

/**
 * Check if a specific field is visible for a specific row.
 * Falls back to global field permission if isRowAllowed is not defined.
 */
export function isFieldVisibleForRow<TView>(
  fieldId: string,
  access: SurfaceAccessInput | undefined,
  row: TView,
  rowIndex: number
): boolean {
  if (!access || isAllSurfaceAccess(access)) {
    return true;
  }

  if (isResolvedSurfaceAccess(access)) {
    return resolveSurfacePermission(access, { kind: 'field', id: fieldId });
  }

  // If isRowAllowed is defined, use it for field-level row checks.
  if (access.isRowAllowed) {
    const permissionRule = access.fields?.[fieldId];

    return access.isRowAllowed({
      kind: 'field',
      id: fieldId,
      permission: permissionRule?.permission,
      row,
      rowIndex,
      context: access.runtimeContext,
    });
  }

  // Fall back to global field permission.
  return resolveSurfacePermission(access, {
    kind: 'field',
    id: fieldId,
  });
}

/**
 * Resolve field access level for a specific row.
 *
 * Priority chain:
 * 1. `resolveFieldAccess` (dynamic per-row field access) -- highest priority
 * 2. `isRowAllowed` (row-level permission check)
 * 3. `isAllowed` (global dynamic callback)
 * 4. Static field rules + granted array
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

  if (isResolvedSurfaceAccess(access)) {
    const capability = resolveSurfaceCapability(access, { kind: 'field', id: fieldId });

    if (!capability?.visible) {
      return 'hidden';
    }

    return capability.disabled ? 'readonly' : 'visible';
  }

  // 1. Dynamic per-row field access has highest priority.
  if (access.resolveFieldAccess) {
    return access.resolveFieldAccess({
      fieldId,
      row,
      rowIndex,
      context: access.runtimeContext,
    });
  }

  // 2-4. Fall back to boolean visibility check.
  const isVisible = isFieldVisibleForRow(fieldId, access, row, rowIndex);

  return isVisible ? 'visible' : 'hidden';
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
      kind: isResolvedSurfaceAccess(access) ? 'column' : 'field',
      id: column.fieldId,
    });
  });
}

/** Filter action bars against both declarative visibility and permission rules. */
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
 * Those actions should still pass through the exact same visibility and
 * permission rules as action bars. This helper keeps that logic centralized.
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
      id: view.permissionId ?? view.key,
    });
  });

  if (!isResolvedSurfaceAccess(access)) {
    return visibleViews;
  }

  return visibleViews.map((view) => {
    const capability = resolveSurfaceCapability(access, {
      kind: 'tab',
      id: view.permissionId ?? view.key,
    });

    return capability?.disabled && !view.disabled
      ? { ...view, disabled: true }
      : view;
  });
}

/** Apply tab visibility and permission rules to detail surfaces on a per-item basis. */
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
      id: tab.permissionId ?? tab.key,
    });
  });

  if (!isResolvedSurfaceAccess(access)) {
    return visibleTabs;
  }

  return visibleTabs.map((tab) => {
    const capability = resolveSurfaceCapability(access, {
      kind: 'tab',
      id: tab.permissionId ?? tab.key,
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
