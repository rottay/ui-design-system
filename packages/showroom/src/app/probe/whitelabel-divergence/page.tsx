'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

import {
  DivergenceSurface,
  DIVERGENCE_ROUTES,
  type DivergenceGround,
  type DivergenceRoute,
} from '@/components/divergence-surface';
import {
  DIVERGENCE_FIXTURE_IDS,
  type DivergenceFixtureId,
} from '@/components/divergence-surface/fixtures';

// ---------------------------------------------------------------------------
// W4 divergence probe (design w4-whitelabel section 9 — wave exit demo).
//
// Chrome-free capture route: one tenant fixture, one demo route, one ground
// per load, driven by query params so the divergence spec can photograph the
// same bithire vertical under both compiled tenant-theme artifacts:
//   ?fixture=sober|editorial   which tenant document compiles (default sober)
//   ?route=dashboard|list|detail  which demo screen renders (default dashboard)
//   ?ground=light|dark         which presentation theme paints (default light)
//
// The fixtures are never registered as product tenants and never generate a
// build artifact; each load compiles the document through
// compileTenantThemeConfig under the code-owned bithire envelope — the same
// validated path a DB-driven customer tenant takes.
// ---------------------------------------------------------------------------

function isFixtureId(value: string | null): value is DivergenceFixtureId {
  return value !== null && (DIVERGENCE_FIXTURE_IDS as readonly string[]).includes(value);
}

function isRoute(value: string | null): value is DivergenceRoute {
  return value !== null && (DIVERGENCE_ROUTES as readonly string[]).includes(value);
}

function WhitelabelDivergenceContent() {
  const params = useSearchParams();

  const fixtureParam = params.get('fixture');
  const routeParam = params.get('route');
  const groundParam = params.get('ground');

  const fixture: DivergenceFixtureId = isFixtureId(fixtureParam) ? fixtureParam : 'sober';
  const route: DivergenceRoute = isRoute(routeParam) ? routeParam : 'dashboard';
  const ground: DivergenceGround = groundParam === 'dark' ? 'dark' : 'light';

  return <DivergenceSurface fixture={fixture} route={route} ground={ground} />;
}

export default function WhitelabelDivergencePage() {
  return (
    <Suspense fallback={null}>
      <WhitelabelDivergenceContent />
    </Suspense>
  );
}
