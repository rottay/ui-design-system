import {
  buildThemePrepaintScript,
  emitTenantThemeArtifactForSsr,
} from '@rottay/design-system/server';

import {
  buildRootStampScript,
  resolveTortureFirstPaint,
  type TortureFirstPaintPlan,
  type TortureQuery,
} from '@/components/torture-tenant';
import { publishedManagementSpecimen } from '@/components/torture-tenant/specimen';

// ---------------------------------------------------------------------------
// Server-owned first paint for the whitelabel probe.
//
// A page cannot own <html> and a layout cannot read searchParams, so the tenant
// cannot reach the root element through JSX. The sanctioned seam is this pair,
// emitted first-in-body: an inline stamp that writes the DS's own governed root
// attribute projection onto documentElement, and — for the compiled DB tenant —
// the artifact CSS that projection's scope selects. Head stylesheets are
// render-blocking and this script is the first node in the body, so neither can
// be preceded by a paint.
//
// The client providers CLAIM these same three surfaces (`data-theme`,
// `data-tenant`, `data-engine`) rather than owning them exclusively, so nothing
// here becomes a second authority: the ground simply arrives in the first byte
// stream instead of in a layout effect.
// ---------------------------------------------------------------------------

/** Route props shared by the dispatcher and every scene route. */
export interface TortureRouteProps {
  searchParams: Promise<TortureQuery>;
}

export function resolveTortureFirstPaintPlan(query: TortureQuery): TortureFirstPaintPlan {
  return resolveTortureFirstPaint(query, { specimen: publishedManagementSpecimen() });
}

export function TortureFirstPaint({ query }: { query: TortureQuery }) {
  const plan = resolveTortureFirstPaintPlan(query);

  if (!plan.rootAttributes) {
    return null;
  }

  // THE artifact element for this document, and the only one: the mount proof
  // requires exactly one, so `TortureSurface` deliberately does not mount a
  // second copy of the same bytes — it declares the artifact this node carries.
  // The attributes come from the design system rather than from this file,
  // because they are what `resolveVisualAuthority` queries for; the earlier
  // hand-written `data-tenant`/`data-digest` pair named nothing it reads.
  const emission = plan.artifact
    ? emitTenantThemeArtifactForSsr(plan.artifact, {
        slug: plan.artifact.slug,
        verticalKey: plan.artifact.verticalKey,
      })
    : null;

  return (
    <>
      <script
        data-testid="probe-first-paint-stamp"
        dangerouslySetInnerHTML={{
          __html: `${buildRootStampScript(plan.rootAttributes)};${buildThemePrepaintScript()}`,
        }}
      />
      {emission ? (
        <style
          {...emission.attributes}
          data-testid="probe-tenant-artifact-style"
          dangerouslySetInnerHTML={{ __html: emission.css }}
        />
      ) : null}
    </>
  );
}
