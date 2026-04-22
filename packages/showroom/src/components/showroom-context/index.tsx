'use client';

import { usePathname } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  applyShowroomRuntimeQuery,
  isShowroomEngine as isShowroomEngineValue,
  isShowroomTenant as isShowroomTenantValue,
  readShowroomRuntimeOverride,
  type RuntimeQueryEngine,
  type RuntimeQueryTenant,
} from '@/components/showroom-runtime-query';

export type ShowroomEngine = RuntimeQueryEngine;
export type ShowroomTenant = RuntimeQueryTenant;
export type ShowroomTheme = ShowroomTenant;
export type ShowroomVertical = 'platform' | 'bithire' | 'evnto';

const ENGINE_STORAGE_KEY = 'rottay-showroom-engine';
const THEME_STORAGE_KEY = 'rottay-showroom-theme';
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

function isShowroomTheme(value: string | null): value is ShowroomTheme {
  return isShowroomTenantValue(value);
}

function readRuntimeOverrideFromLocation() {
  if (typeof window === 'undefined') {
    return null;
  }

  return readShowroomRuntimeOverride(window.location.search);
}

function getInitialEngine(): ShowroomEngine {
  const runtimeOverride = readRuntimeOverrideFromLocation();
  if (runtimeOverride?.engine) {
    return runtimeOverride.engine;
  }

  if (typeof window === 'undefined') {
    return 'modern' satisfies ShowroomEngine;
  }

  try {
    const storedEngine = window.localStorage.getItem(ENGINE_STORAGE_KEY);
    return isShowroomEngineValue(storedEngine) ? storedEngine : 'modern';
  } catch {
    return 'modern';
  }
}

function getInitialTenant(): ShowroomTheme {
  const runtimeOverride = readRuntimeOverrideFromLocation();
  if (runtimeOverride?.tenantSlug) {
    return runtimeOverride.tenantSlug;
  }

  if (typeof window === 'undefined') {
    return 'rottay' satisfies ShowroomTheme;
  }

  try {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isShowroomTheme(storedTheme) ? storedTheme : 'rottay';
  } catch {
    return 'rottay';
  }
}

export function getShowroomVerticalKey(tenantSlug: ShowroomTenant): ShowroomVertical {
  switch (tenantSlug) {
    case 'bithire':
      return 'bithire';
    case 'evnto':
      return 'evnto';
    case 'rottay':
    default:
      return 'platform';
  }
}

export function getShowroomProductProfileKey(
  tenantSlug: ShowroomTenant,
  engine: ShowroomEngine
) {
  const meta = SHOWROOM_RUNTIME_META[tenantSlug];
  const useModernProfile =
    tenantSlug === 'rottay' && engine === 'modern' && meta.modernProfileKey;

  return useModernProfile
    ? meta.modernProfileKey ?? meta.defaultProfileKey
    : meta.defaultProfileKey;
}

interface ShowroomContextValue {
  engine: ShowroomEngine;
  setEngine: (e: ShowroomEngine) => void;
  tenantSlug: ShowroomTheme;
  setTenantSlug: (s: ShowroomTheme) => void;
}

const ShowroomContext = createContext<ShowroomContextValue>({
  engine: 'modern',
  setEngine: () => {},
  tenantSlug: 'rottay',
  setTenantSlug: () => {},
});

const SHOWROOM_RUNTIME_META: Record<
  ShowroomTenant,
  {
    tenantName: string;
    verticalKey: ShowroomVertical;
    verticalLabel: string;
    defaultProfileKey: string;
    defaultProfileLabel: string;
    modernProfileKey?: string;
    modernProfileLabel?: string;
  }
> = {
  rottay: {
    tenantName: 'Rottay',
    verticalKey: 'platform',
    verticalLabel: 'Platform',
    defaultProfileKey: 'platform.admin',
    defaultProfileLabel: 'Platform Admin',
    modernProfileKey: 'platform.flagship',
    modernProfileLabel: 'Platform Flagship',
  },
  bithire: {
    tenantName: 'BitHire',
    verticalKey: 'bithire',
    verticalLabel: 'BitHire',
    defaultProfileKey: 'recruiting.operator',
    defaultProfileLabel: 'Recruiting Operator',
  },
  evnto: {
    tenantName: 'Evnto',
    verticalKey: 'evnto',
    verticalLabel: 'Evnto',
    defaultProfileKey: 'events.organizer',
    defaultProfileLabel: 'Events Organizer',
  },
};

export function ShowroomProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [engine, setEngine] = useState<ShowroomEngine>(getInitialEngine);
  const [tenantSlug, setTenantSlug] = useState<ShowroomTheme>(getInitialTenant);

  useEffect(() => {
    function syncFromLocation() {
      const runtimeOverride = readRuntimeOverrideFromLocation();

      if (runtimeOverride?.engine || runtimeOverride?.tenantSlug) {
        if (runtimeOverride.engine) {
          setEngine(runtimeOverride.engine);
        }

        if (runtimeOverride.tenantSlug) {
          setTenantSlug(runtimeOverride.tenantSlug);
        }

        try {
          if (runtimeOverride.engine) {
            window.localStorage.setItem(ENGINE_STORAGE_KEY, runtimeOverride.engine);
          }

          if (runtimeOverride.tenantSlug) {
            window.localStorage.setItem(THEME_STORAGE_KEY, runtimeOverride.tenantSlug);
          }
        } catch {
          // Ignore storage failures so query-param forcing still works.
        }

        return;
      }

      try {
        const storedEngine = window.localStorage.getItem(ENGINE_STORAGE_KEY);
        const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

        if (isShowroomEngineValue(storedEngine)) {
          setEngine(storedEngine);
        }

        if (isShowroomTheme(storedTheme)) {
          setTenantSlug(storedTheme);
        }
      } catch {
        // Fail open to in-memory defaults when storage is blocked.
      }
    }

    syncFromLocation();
    window.addEventListener('popstate', syncFromLocation);
    window.addEventListener('showroom-runtime-change', syncFromLocation);

    return () => {
      window.removeEventListener('popstate', syncFromLocation);
      window.removeEventListener('showroom-runtime-change', syncFromLocation);
    };
  }, []);

  useEffect(() => {
    const runtimeOverride = readRuntimeOverrideFromLocation();

    if (runtimeOverride?.engine && runtimeOverride.engine !== engine) {
      setEngine(runtimeOverride.engine);
    }

    if (
      runtimeOverride?.tenantSlug &&
      runtimeOverride.tenantSlug !== tenantSlug
    ) {
      setTenantSlug(runtimeOverride.tenantSlug);
    }
  }, [engine, pathname, tenantSlug]);

  useIsomorphicLayoutEffect(() => {
    document.documentElement.setAttribute('data-showroom-engine', engine);
    document.documentElement.setAttribute('data-showroom-tenant', tenantSlug);

    return () => {
      document.documentElement.removeAttribute('data-showroom-engine');
      document.documentElement.removeAttribute('data-showroom-tenant');
    };
  }, [engine, tenantSlug]);

  const syncRuntimeUrl = useCallback(
    (nextTenantSlug: ShowroomTheme, nextEngine: ShowroomEngine) => {
      if (typeof window === 'undefined') {
        return;
      }

      const currentHref = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      const nextHref = applyShowroomRuntimeQuery(
        currentHref,
        nextTenantSlug,
        nextEngine,
        { replaceExisting: true }
      );

      if (nextHref !== currentHref) {
        window.history.replaceState(window.history.state, '', nextHref);
        window.dispatchEvent(new Event('showroom-runtime-change'));
      }
    },
    []
  );

  const handleSetEngine = useCallback(
    (value: ShowroomEngine) => {
      setEngine(value);
      syncRuntimeUrl(tenantSlug, value);
      try {
        window.localStorage.setItem(ENGINE_STORAGE_KEY, value);
      } catch {
        // Ignore storage failures so the showroom remains navigable.
      }
    },
    [syncRuntimeUrl, tenantSlug]
  );

  const handleSetTenantSlug = useCallback(
    (value: ShowroomTheme) => {
      setTenantSlug(value);
      syncRuntimeUrl(value, engine);
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, value);
      } catch {
        // Ignore storage failures so the showroom remains navigable.
      }
    },
    [engine, syncRuntimeUrl]
  );

  return (
    <ShowroomContext.Provider
      value={{
        engine,
        setEngine: handleSetEngine,
        tenantSlug,
        setTenantSlug: handleSetTenantSlug,
      }}
    >
      {children}
    </ShowroomContext.Provider>
  );
}

export function useShowroom() {
  return useContext(ShowroomContext);
}

export function useShowroomRuntime() {
  const { engine, tenantSlug } = useShowroom();
  const meta = SHOWROOM_RUNTIME_META[tenantSlug];
  const productProfileKey = getShowroomProductProfileKey(tenantSlug, engine);
  const useModernProfile = productProfileKey === meta.modernProfileKey;

  return {
    engine,
    tenantName: meta.tenantName,
    tenantSlug,
    verticalKey: meta.verticalKey,
    verticalLabel: meta.verticalLabel,
    productProfileKey,
    productProfileLabel: useModernProfile
      ? meta.modernProfileLabel ?? meta.defaultProfileLabel
      : meta.defaultProfileLabel,
  };
}
