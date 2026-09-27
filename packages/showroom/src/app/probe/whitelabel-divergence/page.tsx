import { groundFor, GroundStage } from '@/components/probe-ground';
import { DivergenceSurface } from '@/components/divergence-surface';
import {
  DIVERGENCE_ROUTES,
  divergenceTenantConfig,
  type DivergenceGround,
  type DivergenceRoute,
} from '@/components/divergence-surface/config';
import {
  DIVERGENCE_FIXTURE_IDS,
  DIVERGENCE_FIXTURES,
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
// build artifact; each load compiles the document through the probe-ground
// kernel's legacy source under the code-owned bithire envelope — the same
// validated path a DB-driven customer tenant takes.
// ---------------------------------------------------------------------------

type Query = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | null {
  return (Array.isArray(value) ? value[0] : value) ?? null;
}

function isFixtureId(value: string | null): value is DivergenceFixtureId {
  return value !== null && (DIVERGENCE_FIXTURE_IDS as readonly string[]).includes(value);
}

function isRoute(value: string | null): value is DivergenceRoute {
  return value !== null && (DIVERGENCE_ROUTES as readonly string[]).includes(value);
}

export default async function WhitelabelDivergencePage({
  searchParams,
}: {
  searchParams: Promise<Query>;
}) {
  const query = await searchParams;
  const fixtureParam = first(query.fixture);
  const routeParam = first(query.route);

  const fixture: DivergenceFixtureId = isFixtureId(fixtureParam) ? fixtureParam : 'sober';
  const route: DivergenceRoute = isRoute(routeParam) ? routeParam : 'dashboard';
  const ground: DivergenceGround = first(query.ground) === 'dark' ? 'dark' : 'light';

  const spec = DIVERGENCE_FIXTURES[fixture];
  const mounted = await groundFor({
    source: {
      kind: 'legacy',
      document: spec.document,
      tenantId: spec.identity.tenantId,
      rowVersion: spec.identity.rowVersion,
      vertical: 'bithire',
      name: spec.displayName,
    },
    slug: spec.identity.slug,
    mode: ground,
  });
  const { artifact } = mounted.stage;
  if (!artifact) throw new Error(`The ${fixture} divergence ground mounted no artifact`);

  // Wrapper scope: the surface models app-bithire's SSR spread onto its own scope root, so this
  // ground renders without the kernel's <html> stamp.
  return (
    <GroundStage
      {...mounted.stage}
      tenantConfig={divergenceTenantConfig(fixture, ground)}
      styleTestId="divergence-artifact-style"
    >
      <DivergenceSurface fixture={fixture} route={route} ground={ground} artifact={artifact} />
    </GroundStage>
  );
}
