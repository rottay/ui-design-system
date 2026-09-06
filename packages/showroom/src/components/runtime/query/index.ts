'use client';

import {
  IMPLEMENTED_ENGINE_NAMES,
  isImplementedEngineName,
  type ImplementedEngineName,
} from '@rottay/design-system';

/**
 * The engines the showroom can switch between: the design system's own
 * implemented roster, derived rather than restated. The showroom used to keep
 * its own three-name list and its own three-way comparison, so retiring or
 * adding an engine in the DS left this file silently stale.
 */
export const SHOWROOM_ENGINES = IMPLEMENTED_ENGINE_NAMES;
export const SHOWROOM_TENANTS = ['rottay', 'bithire', 'evnto'] as const;

export type RuntimeQueryEngine = ImplementedEngineName;
export type RuntimeQueryTenant = (typeof SHOWROOM_TENANTS)[number];

export function isShowroomEngine(
  value: string | null
): value is RuntimeQueryEngine {
  return isImplementedEngineName(value);
}

export function isShowroomTenant(
  value: string | null
): value is RuntimeQueryTenant {
  return value === 'rottay' || value === 'bithire' || value === 'evnto';
}

export function readShowroomRuntimeOverride(rawSearch: string) {
  const normalized = rawSearch.startsWith('?') ? rawSearch.slice(1) : rawSearch;
  const searchParams = new URLSearchParams(normalized);
  const engine = searchParams.get('engine');
  const tenantSlug = searchParams.get('tenant');

  return {
    engine: isShowroomEngine(engine) ? engine : null,
    tenantSlug: isShowroomTenant(tenantSlug) ? tenantSlug : null,
  };
}

export function applyShowroomRuntimeQuery(
  href: string,
  tenant: string | null,
  engine: string | null,
  options?: { replaceExisting?: boolean }
) {
  if (!tenant && !engine) {
    return href;
  }

  if (
    href.startsWith('http://') ||
    href.startsWith('https://') ||
    href.startsWith('#')
  ) {
    return href;
  }

  const replaceExisting = options?.replaceExisting ?? false;
  const [pathWithSearch, hash = ''] = href.split('#');
  const [pathname, rawSearch = ''] = pathWithSearch.split('?');
  const searchParams = new URLSearchParams(rawSearch);

  if (tenant && (replaceExisting || !searchParams.has('tenant'))) {
    searchParams.set('tenant', tenant);
  }

  if (engine && (replaceExisting || !searchParams.has('engine'))) {
    searchParams.set('engine', engine);
  }

  const nextSearch = searchParams.toString();
  const nextHash = hash ? `#${hash}` : '';
  return `${pathname}${nextSearch ? `?${nextSearch}` : ''}${nextHash}`;
}
