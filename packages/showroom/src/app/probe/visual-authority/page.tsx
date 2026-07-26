'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

import {
  VisualAuthorityProbe,
  VISUAL_AUTHORITY_GROUNDS,
  VISUAL_AUTHORITY_TENANTS,
  type VisualAuthorityGround,
  type VisualAuthorityTenant,
} from '@/components/visual-authority-probe';

// ---------------------------------------------------------------------------
// P0-A visual-authority probe route.
//
//   /probe/visual-authority?tenant=themanagement   DB tenant, compiled envelope
//   /probe/visual-authority?tenant=bithire         bundled static vertical
//
// Optional `?ground=light|dark|auto` forces the presentation theme; absent lets
// each tenant's own background mode decide. Same tree either way.
// ---------------------------------------------------------------------------

function isTenant(value: string | null): value is VisualAuthorityTenant {
  return value !== null && (VISUAL_AUTHORITY_TENANTS as readonly string[]).includes(value);
}

function isGround(value: string | null): value is VisualAuthorityGround {
  return value !== null && (VISUAL_AUTHORITY_GROUNDS as readonly string[]).includes(value);
}

function VisualAuthorityProbeContent() {
  const params = useSearchParams();
  const tenantParam = params.get('tenant');
  const groundParam = params.get('ground');

  return (
    <VisualAuthorityProbe
      tenant={isTenant(tenantParam) ? tenantParam : 'themanagement'}
      {...(isGround(groundParam) ? { ground: groundParam } : {})}
    />
  );
}

export default function VisualAuthorityProbePage() {
  return (
    <Suspense fallback={null}>
      <VisualAuthorityProbeContent />
    </Suspense>
  );
}
