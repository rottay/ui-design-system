'use client';

import { Suspense, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';

const ENGINE_STORAGE_KEY = 'rottay-showroom-engine';
const THEME_STORAGE_KEY = 'rottay-showroom-theme';

function sanitizeTenant(value: string | null) {
  return value === 'rottay' || value === 'bithire' || value === 'evnto'
    ? value
    : 'rottay';
}

function sanitizeEngine(value: string | null) {
  return value === 'classic' || value === 'modern' || value === 'rustic'
    ? value
    : 'modern';
}

function sanitizePath(value: string | null) {
  if (!value || !value.startsWith('/')) {
    return '/playground';
  }

  return value;
}

function RuntimeProbePageContent() {
  const searchParams = useSearchParams();

  const tenant = useMemo(
    () => sanitizeTenant(searchParams.get('tenant')),
    [searchParams]
  );
  const engine = useMemo(
    () => sanitizeEngine(searchParams.get('engine')),
    [searchParams]
  );
  const path = useMemo(
    () => sanitizePath(searchParams.get('path')),
    [searchParams]
  );

  useEffect(() => {
    const nextUrl = new URL(path, window.location.origin);
    nextUrl.searchParams.set('tenant', tenant);
    nextUrl.searchParams.set('engine', engine);

    window.localStorage.setItem(ENGINE_STORAGE_KEY, engine);
    window.localStorage.setItem(THEME_STORAGE_KEY, tenant);
    window.location.replace(nextUrl.toString());
  }, [engine, path, tenant]);

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
        background: '#0b1020',
        color: '#f8fafc',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div style={{ display: 'grid', gap: 12, textAlign: 'center', maxWidth: 560 }}>
        <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700 }}>
          showroom runtime probe
        </h1>
        <p style={{ margin: 0, lineHeight: 1.6, color: '#cbd5e1' }}>
          Applying <strong>{tenant}</strong> + <strong>{engine}</strong> and
          redirecting to <code>{path}</code>.
        </p>
      </div>
    </main>
  );
}

export default function RuntimeProbePage() {
  return (
    <Suspense fallback={null}>
      <RuntimeProbePageContent />
    </Suspense>
  );
}
