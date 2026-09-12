import type { TenantConfig } from '@rottay/design-system';
import {
  compileTenantThemeDocumentV2,
  documentThemeAdmission,
  mountTenantTheme,
} from '@rottay/design-system/server';

import { identityCandidate } from '@/app/probe-ground/identity/candidates';
import { buildRootStampScript } from '@/components/torture-tenant';

import { FirstPaintStage } from './stage';

// ---------------------------------------------------------------------------
// WO-EMI-02 / F-20 — the first-paint probe, for the leg jsdom cannot certify.
//
// Everything a real browser has to be asked about lives on ONE route, so a
// spec can name what it certified:
//   * the request declares a DESKTOP viewport, on both halves of the contract
//     (`mountTenantTheme({ viewport })` for the cascade, `ssrViewport` for the
//     runtime), which is what lets the responsive store publish a desktop
//     server snapshot instead of the mobile-first baseline;
//   * the tenant is a compiled DB artifact, not a bundled vertical, so its
//     bytes and the three proof attributes are in the served HTML and can be
//     checked before a single script of the framework has run;
//   * nothing on the page depends on a layout effect to reach its final
//     geometry, so a bounding box measured with hydration held and the same box
//     measured after hydration must be the same box.
//
// `?modal=1` additionally mounts an always-open `Modal adaptiveFullscreen`.
// It is opt-in because an open dialog locks the document scroll, and a
// scrollbar appearing is a relayout this route must not be able to blame on
// the responsive snapshot.
// ---------------------------------------------------------------------------

const VERTICAL = 'bithire' as const;
const CANDIDATE_ID = 'editorial-quiet';

type Query = Record<string, string | string[] | undefined>;

export default async function FirstPaintProbePage({
  searchParams,
}: {
  searchParams: Promise<Query>;
}) {
  const query = await searchParams;
  const withModal = query.modal === '1';

  // A real DS candidate document rather than a probe-local literal: the
  // artifact this route mounts has to be one the compiler produces for a
  // published row, or the bytes it proves are the probe's own invention.
  const candidate = identityCandidate(CANDIDATE_ID);
  if (!candidate) {
    throw new Error(`[showroom] the first-paint probe needs the ${CANDIDATE_ID} candidate.`);
  }

  const { intent } = documentThemeAdmission({
    vertical: VERTICAL,
    slug: candidate.slug,
    document: candidate.document,
  });
  const { artifact } = compileTenantThemeDocumentV2({
    document: candidate.document,
    tenantId: 'wo-emi-02-first-paint',
    slug: candidate.slug,
    verticalKey: VERTICAL,
    rowVersion: 1,
  });

  const mounted = await mountTenantTheme(intent, {
    artifact,
    themeMode: 'light',
    locale: 'en',
    // THE HINT. Without it every server render publishes the phone snapshot and
    // the first paint of a desktop request is a phone paint — F-20 itself.
    viewport: 'desktop',
  });

  const tenantConfig: TenantConfig = {
    slug: candidate.slug,
    name: candidate.title,
    vertical: VERTICAL,
    theme: 'light',
    plan: 'enterprise',
    features: ['*'],
    branding: { companyName: candidate.title },
  };

  return (
    <>
      {/* A page cannot own <html>, so the governed root projection arrives
          first-in-body as a blocking inline script. It is not a chunk, so it
          runs even while the framework's scripts are held. */}
      <script
        data-testid="fp-root-stamp"
        dangerouslySetInnerHTML={{ __html: buildRootStampScript(mounted.rootAttributes) }}
      />
      <FirstPaintStage
        artifact={artifact}
        styleElements={mounted.styleElements}
        tenantConfig={tenantConfig}
        digest={mounted.artifactDigest}
        withModal={withModal}
      />
    </>
  );
}
