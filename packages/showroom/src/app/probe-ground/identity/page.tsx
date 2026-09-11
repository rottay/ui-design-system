import { createHash } from 'node:crypto';

import type { TenantConfig } from '@rottay/design-system';
import {
  canonicalizeTenantThemeValue,
  compileTenantThemeDocumentV2,
  documentThemeAdmission,
  mountTenantTheme,
  previewThemeAdmission,
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
import {
  IdentityStage,
  type IdentityDoorProof,
  type IdentityStageOption,
  type IdentityUnlitRow,
} from './stage';

// ---------------------------------------------------------------------------
// The identity probe-ground.
//
// One candidate per load: the tenant scope, the mode and the artifact are all
// html-anchored, so three identities cannot share a document. The links below
// are full navigations for that reason. Query params:
//   ?candidate=editorial-quiet|product-dense|warm-humanist|baseline
//   ?mode=light|dark
//   ?screen=list|record|form|dashboard|modal|phone   (default: all six)
//
// Nothing here paints: the page compiles the candidate's decision document
// through the one door, mounts it with `mountTenantTheme`, and hands the stage
// exactly what the mount returned -- the artifact, its style elements and the
// projected root attributes. The CLIENT runtime receives that same artifact as
// its visual-authority declaration, so the screens below are evidence about the
// mounted runtime and not only about a stylesheet that loaded. `dashboard` is
// the app-shell screen -- the DS AppShell, whose navigation column is the only
// surface that reads sidebar tone and which also honors both anatomy
// attributes; the list screen is the pattern table, which is the only surface
// the table anatomy CSS reaches.
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

/**
 * Canonical form of a value the two doors built independently.
 *
 * The round trip through JSON is what makes the comparison the right one: a
 * patch is a deep partial, so one door may carry `borderPrimaryColor: undefined`
 * where the other carries nothing at all, and in the JSON data model those are
 * the same value. Canonical form alone refuses the first shape rather than
 * equating it with the second.
 */
function canonicalPayload(value: unknown): string {
  return canonicalizeTenantThemeValue(JSON.parse(JSON.stringify(value ?? null)));
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

  // One call, two answers: the intent the compiler mounts and the report that
  // names which activated decisions moved no keypath. The unlit list below is
  // the door's, never a list this page keeps.
  const admitted = candidate
    ? documentThemeAdmission({
        vertical: 'bithire',
        slug: candidate.slug,
        document: candidate.document,
      })
    : null;

  // The SAME document through the UNSAVED door. R2's law is that previewing a
  // row and publishing it resolve one payload, so the two are mounted side by
  // side here and compared byte for byte rather than asserted in prose.
  const previewed = candidate
    ? previewThemeAdmission({
        vertical: 'bithire',
        slug: candidate.slug,
        document: candidate.document,
      })
    : null;

  const mounted = await (admitted && compilation
    ? mountTenantTheme(admitted.intent, {
        artifact: compilation.artifact,
        themeMode: mode,
        locale: 'en',
      })
    : mountTenantTheme(staticThemeIntent('bithire'), { themeMode: mode, locale: 'en' }));

  const previewMounted =
    previewed && compilation
      ? await mountTenantTheme(previewed.intent, {
          artifact: compilation.artifact,
          themeMode: mode,
          locale: 'en',
        })
      : null;

  const doorProof: IdentityDoorProof | null =
    admitted && previewed && previewMounted
      ? {
          publishOrigin: mounted.hydrationProof.origin,
          previewOrigin: previewMounted.hydrationProof.origin,
          patchIdentical:
            canonicalPayload(admitted.intent.patch) ===
            canonicalPayload(previewed.intent.patch),
          ledgerIdentical:
            canonicalPayload(admitted.admission.ledger) ===
            canonicalPayload(previewed.admission.ledger),
          reportIdentical:
            canonicalPayload([
              admitted.admission.effective,
              admitted.admission.unlit,
            ]) ===
            canonicalPayload([
              previewed.admission.effective,
              previewed.admission.unlit,
            ]),
          digestIdentical: mounted.artifactDigest === previewMounted.artifactDigest,
          cssIdentical: mounted.hydrationProof.css === previewMounted.hydrationProof.css,
          scopeIdentical:
            mounted.hydrationProof.scope.selector ===
            previewMounted.hydrationProof.scope.selector,
        }
      : null;

  const unlit: IdentityUnlitRow[] = (admitted?.admission.unlit ?? []).map((row) => ({
    id: row.id,
    tier: row.tier,
    reason: row.reason ?? 'unlit',
  }));

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
        unlit={unlit}
        tenantConfig={tenantConfig}
        artifact={compilation?.artifact ?? null}
        styleElements={mounted.styleElements}
        authoredSeed={candidate?.document.decisions['palette.seeds']?.primary ?? null}
        doorProof={doorProof}
        columns={columns}
        modes={modes}
        screens={screens}
      />
    </>
  );
}
