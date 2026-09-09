import { createHash } from 'node:crypto';

import type { TenantConfig } from '@rottay/design-system';
import {
  compileTenantThemeDocumentV2,
  documentThemeIntent,
  mountTenantTheme,
  staticThemeIntent,
} from '@rottay/design-system/server';

import { buildRootStampScript } from '@/components/torture-tenant';

// Every pack a candidate may select for a text role. The root layout loads only
// `editorial-display`, so without these an unloaded pack variable would silently
// drop the candidate's base family back to the showroom body font.
import '@rottay/design-system/fonts/editorial-text.css';
import '@rottay/design-system/fonts/grotesk-display.css';
import '@rottay/design-system/fonts/humanist-text.css';
import '@rottay/design-system/fonts/geometric-display.css';
import '@rottay/design-system/fonts/plex-mono.css';

import {
  BASELINE_ID,
  IDENTITY_CANDIDATES,
  IDENTITY_MODES,
  IDENTITY_SCREENS,
  identityCandidate,
  sanitizeColumn,
  sanitizeMode,
  sanitizeScreen,
} from './candidates';
import { IdentityStage, type IdentityStageOption } from './stage';

// ---------------------------------------------------------------------------
// WO-DER-07 identity probe-ground.
//
// One candidate per load: the tenant scope, the mode and the artifact are all
// html-anchored, so three identities cannot share a document. The links below
// are full navigations for that reason. Query params:
//   ?candidate=editorial-quiet|product-dense|warm-humanist|baseline
//   ?mode=light|dark
//   ?screen=list|record|form|dashboard|modal|phone   (default: all six)
//
// Nothing here paints: the page compiles the candidate's decision document
// through the one door, mounts it with `mountTenantTheme`, and stamps exactly
// what the mount returns.
// ---------------------------------------------------------------------------

type Query = Record<string, string | string[] | undefined>;

function readQuery(query: Query, key: string): string | null {
  const raw = query[key];
  if (Array.isArray(raw)) return raw[0] ?? null;
  return raw ?? null;
}

function href(candidate: string, mode: string, screen: string): string {
  return `/probe-ground/identity?candidate=${candidate}&mode=${mode}&screen=${screen}`;
}

export default async function IdentityProbeGroundPage({
  searchParams,
}: {
  searchParams: Promise<Query>;
}) {
  const query = await searchParams;
  const column = sanitizeColumn(readQuery(query, 'candidate'));
  const mode = sanitizeMode(readQuery(query, 'mode'));
  const screen = sanitizeScreen(readQuery(query, 'screen'));
  const candidate = identityCandidate(column);

  const compilation = candidate
    ? compileTenantThemeDocumentV2({
        document: candidate.document,
        tenantId: `wo-der-07-${candidate.id}`,
        slug: candidate.slug,
        verticalKey: 'bithire',
        rowVersion: 1,
      })
    : null;

  const mounted = await (candidate && compilation
    ? mountTenantTheme(
        documentThemeIntent({
          vertical: 'bithire',
          slug: candidate.slug,
          document: candidate.document,
        }),
        { artifact: compilation.artifact, themeMode: mode, locale: 'en' },
      )
    : mountTenantTheme(staticThemeIntent('bithire'), { themeMode: mode, locale: 'en' }));

  const digest = candidate
    ? `decision digest sha256-${createHash('sha256')
        .update(JSON.stringify(candidate.document))
        .digest('hex')}`
    : `bithire vertical baseline · artifact ${mounted.artifactDigest}`;

  // Null for the baseline column: `bithire` is a reserved code-owned identity,
  // so its config is resolved from the DS registry inside the stage rather than
  // hand-authored here, which the provider refuses.
  const tenantConfig: TenantConfig | null = candidate
    ? {
        slug: candidate.slug,
        name: candidate.title,
        vertical: 'bithire',
        engine: 'modern',
        theme: mode,
        plan: 'enterprise',
        features: ['*'],
        branding: { companyName: candidate.title },
      }
    : null;

  const columns: IdentityStageOption[] = [
    { id: BASELINE_ID, label: 'Baseline (today)', href: href(BASELINE_ID, mode, screen), active: column === BASELINE_ID },
    ...IDENTITY_CANDIDATES.map((row) => ({
      id: row.id,
      label: row.title,
      href: href(row.id, mode, screen),
      active: column === row.id,
    })),
  ];

  const modes: IdentityStageOption[] = IDENTITY_MODES.map((value) => ({
    id: value,
    label: value,
    href: href(column, value, screen),
    active: mode === value,
  }));

  const screens: IdentityStageOption[] = ['all', ...IDENTITY_SCREENS].map((value) => ({
    id: value,
    label: value,
    href: href(column, mode, value),
    active: screen === value,
  }));

  return (
    <>
      <script
        data-testid="identity-probe-stamp"
        dangerouslySetInnerHTML={{ __html: buildRootStampScript(mounted.rootAttributes) }}
      />
      {mounted.styleElements.map((element) => (
        <style
          key={element.id}
          {...element.attributes}
          data-testid="identity-probe-artifact-style"
          dangerouslySetInnerHTML={{ __html: element.css }}
        />
      ))}
      <IdentityStage
        title={candidate ? candidate.title : 'BitHire baseline (today)'}
        intent={
          candidate
            ? candidate.intent
            : 'The vertical as it ships today, for reference. No decision document is mounted.'
        }
        mode={mode}
        screen={screen}
        digest={digest}
        decisionCount={candidate ? Object.keys(candidate.document.decisions).length : 0}
        tenantConfig={tenantConfig}
        columns={columns}
        modes={modes}
        screens={screens}
      />
    </>
  );
}
