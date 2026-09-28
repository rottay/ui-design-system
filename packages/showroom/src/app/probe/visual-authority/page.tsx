import { groundFor, GroundStage, type GroundRequest } from '@/components/probe-ground';
import { VisualAuthorityProbe } from '@/components/visual-authority-probe';
import {
  dbTenantConfig,
  THEMANAGEMENT_DOCUMENT,
  THEMANAGEMENT_IDENTITY,
  VISUAL_AUTHORITY_DEFAULT_GROUND,
  VISUAL_AUTHORITY_GROUNDS,
  VISUAL_AUTHORITY_TENANTS,
  type VisualAuthorityGround,
  type VisualAuthorityTenant,
} from '@/components/visual-authority-probe/config';

// ---------------------------------------------------------------------------
// P0-A visual-authority probe route.
//
//   /probe/visual-authority?tenant=themanagement   DB tenant, compiled envelope
//   /probe/visual-authority?tenant=bithire         bundled static vertical
//
// Optional `?ground=light|dark` forces the presentation theme; absent paints
// each tenant's own background mode. Same tree either way.
// ---------------------------------------------------------------------------

type Query = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | null {
  return (Array.isArray(value) ? value[0] : value) ?? null;
}

function isTenant(value: string | null): value is VisualAuthorityTenant {
  return value !== null && (VISUAL_AUTHORITY_TENANTS as readonly string[]).includes(value);
}

function isGround(value: string | null): value is VisualAuthorityGround {
  return value !== null && (VISUAL_AUTHORITY_GROUNDS as readonly string[]).includes(value);
}

function requestFor(tenant: VisualAuthorityTenant, mode: VisualAuthorityGround): GroundRequest {
  if (tenant === 'bithire') return { source: { kind: 'static' }, slug: 'bithire', mode };
  return {
    source: {
      kind: 'legacy',
      document: THEMANAGEMENT_DOCUMENT,
      tenantId: THEMANAGEMENT_IDENTITY.tenantId,
      rowVersion: THEMANAGEMENT_IDENTITY.rowVersion,
      vertical: 'bithire',
      name: 'The Management',
    },
    slug: THEMANAGEMENT_IDENTITY.slug,
    mode,
  };
}

export default async function VisualAuthorityProbePage({
  searchParams,
}: {
  searchParams: Promise<Query>;
}) {
  const query = await searchParams;
  const tenantParam = first(query.tenant);
  const groundParam = first(query.ground);
  const tenant: VisualAuthorityTenant = isTenant(tenantParam) ? tenantParam : 'themanagement';
  const mode = isGround(groundParam) ? groundParam : VISUAL_AUTHORITY_DEFAULT_GROUND[tenant];

  const { stage, stamp } = await groundFor(requestFor(tenant, mode));

  return (
    <>
      <script data-testid="visual-authority-stamp" dangerouslySetInnerHTML={{ __html: stamp }} />
      <GroundStage
        {...stage}
        tenantConfig={stage.artifact ? dbTenantConfig(stage.artifact) : null}
        styleTestId="visual-authority-artifact-style"
      >
        <VisualAuthorityProbe tenant={tenant} artifact={stage.artifact} />
      </GroundStage>
    </>
  );
}
