'use client';

import { useSearchParams } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { ProductProfileKey } from '@rottay/design-system';

import {
  applyShowroomRuntimeQuery,
  readShowroomRuntimeOverride,
  type RuntimeQueryEngine,
} from '@/components/runtime/query';

import {
  DEFAULT_SHOWROOM_TENANT,
  ENGINE_COOKIE,
  SHOWROOM_CATALOG,
  TENANT_COOKIE,
  type ShowroomTenant,
  type ShowroomVertical,
} from './catalog';

export type ShowroomEngine = RuntimeQueryEngine;
export type { ShowroomTenant, ShowroomVertical };
export type ShowroomTheme = ShowroomTenant;

/** The reader's remembered choice, as the server read it from the request cookies. */
export interface ShowroomSelection {
  readonly tenant: ShowroomTenant | null;
  readonly engine: ShowroomEngine | null;
}

const NO_SELECTION: ShowroomSelection = { tenant: null, engine: null };
const DEFAULT_ENGINE: ShowroomEngine = 'modern';
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

function writeSelectionCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; max-age=31536000; samesite=lax`;
}

export function getShowroomVerticalKey(tenantSlug: ShowroomTenant): ShowroomVertical {
  return (SHOWROOM_CATALOG[tenantSlug] ?? SHOWROOM_CATALOG[DEFAULT_SHOWROOM_TENANT]).vertical;
}

export function getShowroomProductProfileKey(tenantSlug: ShowroomTenant): ProductProfileKey {
  return (SHOWROOM_CATALOG[tenantSlug] ?? SHOWROOM_CATALOG[DEFAULT_SHOWROOM_TENANT]).profileKey;
}

interface ShowroomContextValue {
  engine: ShowroomEngine;
  setEngine: (e: ShowroomEngine) => void;
  tenantSlug: ShowroomTheme;
  setTenantSlug: (s: ShowroomTheme) => void;
  /** What a link carries forward: the explicit choice only, never the defaults. */
  linkQuery: ShowroomSelection;
}

const ShowroomContext = createContext<ShowroomContextValue>({
  engine: DEFAULT_ENGINE,
  setEngine: () => {},
  tenantSlug: DEFAULT_SHOWROOM_TENANT,
  setTenantSlug: () => {},
  linkQuery: NO_SELECTION,
});

/** Resolves only from what the server render also sees (the query and the cookie choice), so
 *  the first client render equals the served HTML. */
export function ShowroomProvider({
  children,
  stored = NO_SELECTION,
}: {
  children: ReactNode;
  stored?: ShowroomSelection;
}) {
  const searchParams = useSearchParams();
  const override = readShowroomRuntimeOverride(searchParams?.toString() ?? '');
  const [remembered, setRemembered] = useState<ShowroomSelection>(stored);

  const tenantSlug = override.tenantSlug ?? remembered.tenant ?? DEFAULT_SHOWROOM_TENANT;
  const engine = override.engine ?? remembered.engine ?? DEFAULT_ENGINE;
  const linkTenant = override.tenantSlug ?? remembered.tenant;
  const linkEngine = override.engine ?? remembered.engine;

  useEffect(() => {
    if (!override.tenantSlug && !override.engine) return;
    if (override.tenantSlug) writeSelectionCookie(TENANT_COOKIE, override.tenantSlug);
    if (override.engine) writeSelectionCookie(ENGINE_COOKIE, override.engine);
    setRemembered((current) => ({
      tenant: override.tenantSlug ?? current.tenant,
      engine: override.engine ?? current.engine,
    }));
  }, [override.tenantSlug, override.engine]);

  useIsomorphicLayoutEffect(() => {
    document.documentElement.setAttribute('data-showroom-engine', engine);
    document.documentElement.setAttribute('data-showroom-tenant', tenantSlug);

    return () => {
      document.documentElement.removeAttribute('data-showroom-engine');
      document.documentElement.removeAttribute('data-showroom-tenant');
    };
  }, [engine, tenantSlug]);

  const select = useCallback((next: ShowroomSelection) => {
    if (next.tenant) writeSelectionCookie(TENANT_COOKIE, next.tenant);
    if (next.engine) writeSelectionCookie(ENGINE_COOKIE, next.engine);
    setRemembered((current) => ({
      tenant: next.tenant ?? current.tenant,
      engine: next.engine ?? current.engine,
    }));

    const currentHref = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    const nextHref = applyShowroomRuntimeQuery(currentHref, next.tenant, next.engine, {
      replaceExisting: true,
    });
    if (nextHref !== currentHref) {
      window.history.replaceState(window.history.state, '', nextHref);
      window.dispatchEvent(new Event('showroom-runtime-change'));
    }
  }, []);

  const setEngine = useCallback(
    (value: ShowroomEngine) => select({ tenant: tenantSlug, engine: value }),
    [select, tenantSlug],
  );
  const setTenantSlug = useCallback(
    (value: ShowroomTheme) => select({ tenant: value, engine }),
    [engine, select],
  );

  const value = useMemo<ShowroomContextValue>(
    () => ({
      engine,
      setEngine,
      tenantSlug,
      setTenantSlug,
      linkQuery: { tenant: linkTenant, engine: linkEngine },
    }),
    [engine, setEngine, tenantSlug, setTenantSlug, linkTenant, linkEngine],
  );

  return <ShowroomContext.Provider value={value}>{children}</ShowroomContext.Provider>;
}

export function useShowroom() {
  return useContext(ShowroomContext);
}

export function useShowroomRuntime() {
  const { engine, tenantSlug } = useShowroom();
  const entry = SHOWROOM_CATALOG[tenantSlug];

  return {
    engine,
    tenantName: entry.name,
    tenantSlug,
    verticalKey: entry.vertical,
    verticalLabel: entry.name,
    productProfileKey: entry.profileKey,
    productProfileLabel: entry.profileLabel,
  };
}
