'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState, type ComponentProps } from 'react';
import {
  applyShowroomRuntimeQuery,
  isShowroomEngine,
  isShowroomTenant,
  readShowroomRuntimeOverride,
} from '@/composition/components/showroom-runtime-query';

type ShowroomLinkProps = ComponentProps<typeof Link>;
const ENGINE_STORAGE_KEY = 'rottay-showroom-engine';
const THEME_STORAGE_KEY = 'rottay-showroom-theme';

function readRuntimeLinkState() {
  if (typeof window === 'undefined') {
    return { engine: null, tenant: null };
  }

  const runtimeOverride = readShowroomRuntimeOverride(window.location.search);

  if (runtimeOverride.engine || runtimeOverride.tenantSlug) {
    return {
      engine: runtimeOverride.engine,
      tenant: runtimeOverride.tenantSlug,
    };
  }

  try {
    const storedEngine = window.localStorage.getItem(ENGINE_STORAGE_KEY);
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

    return {
      engine: isShowroomEngine(storedEngine) ? storedEngine : null,
      tenant: isShowroomTenant(storedTheme) ? storedTheme : null,
    };
  } catch {
    return { engine: null, tenant: null };
  }
}

export function ShowroomLink(props: ShowroomLinkProps) {
  const pathname = usePathname();
  const [runtimeState, setRuntimeState] = useState(readRuntimeLinkState);

  useEffect(() => {
    function syncRuntimeState() {
      setRuntimeState(readRuntimeLinkState());
    }

    syncRuntimeState();
    window.addEventListener('popstate', syncRuntimeState);
    window.addEventListener('showroom-runtime-change', syncRuntimeState);

    return () => {
      window.removeEventListener('popstate', syncRuntimeState);
      window.removeEventListener('showroom-runtime-change', syncRuntimeState);
    };
  }, []);

  useEffect(() => {
    setRuntimeState(readRuntimeLinkState());
  }, [pathname]);

  const href = useMemo(
    () =>
      typeof props.href === 'string'
        ? applyShowroomRuntimeQuery(props.href, runtimeState.tenant, runtimeState.engine)
        : props.href,
    [props.href, runtimeState.engine, runtimeState.tenant]
  );

  return <Link {...props} href={href} prefetch={props.prefetch ?? false} />;
}
