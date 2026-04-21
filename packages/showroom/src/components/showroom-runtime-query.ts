'use client';

export const SHOWROOM_ENGINES = ['classic', 'modern', 'rustic'] as const;
export const SHOWROOM_TENANTS = ['rottay', 'bithire', 'evnto'] as const;

export type RuntimeQueryEngine = (typeof SHOWROOM_ENGINES)[number];
export type RuntimeQueryTenant = (typeof SHOWROOM_TENANTS)[number];

export function isShowroomEngine(
  value: string | null
): value is RuntimeQueryEngine {
  return value === 'classic' || value === 'modern' || value === 'rustic';
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
