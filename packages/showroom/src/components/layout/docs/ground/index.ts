import { cookies } from 'next/headers';
import { isImplementedEngineName } from '@rottay/design-system/server';

import { groundFor } from '@/components/probe-ground';
import {
  ENGINE_COOKIE,
  SHOWROOM_CATALOG,
  SHOWROOM_TENANTS,
  TENANT_COOKIE,
  isShowroomTenant,
  type ShowroomTenant,
} from '@/components/showroom-context/catalog';
import type { ShowroomSelection } from '@/components/showroom-context';

export type DocsGroundStamps = Record<ShowroomTenant, string>;

/** Reads the reader's stored choice; anything the catalog or the engine roster refuses is absent. */
export async function readDocsSelection(): Promise<ShowroomSelection> {
  const jar = await cookies();
  const tenant = jar.get(TENANT_COOKIE)?.value ?? null;
  const engine = jar.get(ENGINE_COOKIE)?.value ?? null;
  return {
    tenant: isShowroomTenant(tenant) ? tenant : null,
    engine: isImplementedEngineName(engine) ? engine : null,
  };
}

/**
 * One static ground per catalog tenant, each on its vertical's own mode. The client picks the
 * one it resolves, so the stamp that paints first is the tenant the page hydrates.
 */
export async function docsGroundStamps(): Promise<DocsGroundStamps> {
  const entries = await Promise.all(
    SHOWROOM_TENANTS.map(async (slug) => {
      const { vertical, mode } = SHOWROOM_CATALOG[slug];
      const ground = await groundFor({ slug, mode, locale: 'en', source: { kind: 'static', vertical } });
      return [slug, ground.stamp] as const;
    }),
  );
  return Object.fromEntries(entries) as DocsGroundStamps;
}
