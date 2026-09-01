/**
 * @fileoverview Final presentation-access resolution for page chrome and surfaces.
 * @module Structures/Foundation/Chrome/Runtime/Access
 * @category StructureFoundation
 * @package @rottay/design-system
 *
 * @remarks
 * This cluster moved down from `ui/surfaces/runtime/helpers` together with the
 * chrome contracts it operates on. `HeaderSurface` filters its own actions and
 * tabs through `filterSurfaceActions` / `filterSurfaceTabbedViews`, and that
 * component is page chrome, so it belongs to the structures tier -- which may
 * not import from surfaces. Leaving the resolver in the surfaces tree would
 * have inverted the canonical `primitives -> patterns -> structures -> surfaces`
 * order the moment the shell moved.
 *
 * The nine functions are one unit, not nine movable pieces:
 * `resolveSurfaceCapabilityRegistry` calls `isAllSurfaceAccess`,
 * `isResolvedSurfaceAccess`, `resolveSurfacePermission` and
 * `resolveSurfaceCapability`; `resolveSurfaceAction` delegates to
 * `filterSurfaceActions`. Splitting them across tiers would only move the
 * inversion, so the whole closure is declared here exactly once.
 *
 * What did NOT move is the half of `ui/surfaces/runtime/helpers` that resolves
 * access against surface-only vocabulary -- `filterSurfaceColumns`,
 * `filterSurfaceFields`, `filterDetailSurfaceTabs`, `filterSurfaceRowActions`
 * and the per-row field helpers. Those read `SurfaceColumn`, `SurfaceFieldDef`
 * and `DetailSurfaceTab`, which are surface contracts; they stay in the
 * surfaces tier and build on this file, which is the dependency direction the
 * tree is supposed to have.
 *
 * These are exported from the package through `ui/surfaces/runtime/helpers`,
 * which re-exports them by name. That barrel is their only public path today
 * and it keeps working unchanged.
 */

import type { ButtonVariant } from '../../../../../primitives/inputs/button';
import type {
  AppResolvedSurfaceAccess,
  SurfaceAccessInput,
  SurfaceAction,
  SurfaceCapabilityKind,
  SurfaceCapabilityRegistration,
  SurfaceResolvedCapability,
  SurfaceTabbedView,
} from '../../contracts';

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
