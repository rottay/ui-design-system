import { buildThemePrepaintScript } from '@rottay/design-system/server';

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

  return (
    <>
      <script
        data-testid="probe-first-paint-stamp"
        dangerouslySetInnerHTML={{
          __html: `${buildRootStampScript(plan.rootAttributes)};${buildThemePrepaintScript()}`,
        }}
      />
      {plan.artifact ? (
        <style
          id="rottay-runtime-tenant-theme"
          data-tenant={plan.artifact.slug}
          data-digest={plan.artifact.digest}
          data-compiler={plan.artifact.compilerVersion}
          dangerouslySetInnerHTML={{ __html: plan.css }}
        />
      ) : null}
    </>
  );
}
