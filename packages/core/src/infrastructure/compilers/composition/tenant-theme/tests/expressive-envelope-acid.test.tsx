/**
 * C1b acid test — two tenants, two systems, one canon.
 *
 * BitHire compiles STATICALLY from its authored BrandTheme (which now
 * SELECTS `rottay/bithire-technical@1`), and The Management compiles from a
 * SCHEMA-VALID DB DOCUMENT (document → validator → compiler → artifact) that
 * selects `rottay/management-editorial@1` on the same vertical envelope.
 * The test COMPUTES divergence per expressive axis over representative
 * channels and requires at least 7 of the 9 axes to differ. `icon` is the
 * declared frontier axis and is excluded from measurement by design — the
 * remaining 8 must carry the threshold.
 *
 * This is computed evidence over the artifacts, deliberately NOT a sighted
 * claim: the browser demonstration of a real Management row stays an open
 * residual owned by the canary wave.
 */
import React from 'react';
import { cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import type { TenantConfig } from '@/foundation/contracts/composition/tenants';
import { bithireBrandTheme } from '@/foundation/tokens/ts/presentation/brand-themes/bithire';
import { NavigationSettingsIcon } from '@/graphics/icons/semantic/generated/roles/navigation-settings';
import { compileBrandTheme } from '@/infrastructure/compilers/kernel/runtime/brand-theme';
import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap/facade/react/provider';
import type { BrandTheme } from '@/foundation/contracts/composition/tenants/themes';
import type {
  TenantThemeArtifact,
  TenantThemeConfigIdentity,
  TenantThemeDocument,
} from '@/foundation/contracts/composition/tenants/themes/tenant-theme';
import { getKnownTenantConfig } from '@/infrastructure/runtime/tenant/foundation/configuration/registry';
import { emitTenantThemeArtifactForSsr } from '@/infrastructure/runtime/theming/foundation/visual-authority';
import {
  compileTenantThemeConfig,
  getTenantThemeVerticalEnvelope,
  hydrateTenantThemeConfig,
  validateTenantThemeDocument,
} from '..';

const MANAGEMENT_IDENTITY: TenantThemeConfigIdentity = {
  tenantId: 'tenant_the_management',
  slug: 'the-management',
  verticalKey: 'bithire',
  rowVersion: 7,
};

/**
 * The Management as a bounded DB document: warm editorial seeds plus ONE
 * governed selection. Every other divergence below is profile expansion —
 * no raw CSS, no channel names, no free values ride in the document.
 */
const MANAGEMENT_DOCUMENT: TenantThemeDocument = {
  schemaVersion: 1,
  mode: 'advanced',
  visualFoundation: {
    general: {
      palette: {
        primary: '#315D4D',
        secondary: '#8C6D46',
        accent: '#E2725B',
        background: '#FBF6EC',
        // The warm canvas has to bring its own low-emphasis ink. bithire's
        // code-owned muted `#8a9aaa` / disabled `#b2b6c5` are cool greys tuned
        // for the `#F4F8FB` baseline, where they already read APCA Lc 50.5 and
        // 34.7; dropped onto this warmer, lighter ground they read 49.9 and
        // 34.1, so the document made an already-thin pair thinner and the
        // compiler rejected it. These two are on the document's own warm axis
        // and clear the governed floors outright: 71.7 (muted, floor 60) and
        // 51.7 (disabled, floor 45).
        foreground: {
          muted: '#6F6A5E',
          disabled: '#9A9488',
        },
        backgroundMode: 'light',
      },
      experienceProfile: 'rottay/management-editorial@1',
    },
    advanced: {
      // C2: the opened icon axis — an editorial document product carries the
      // duotone posture as Pro data, no CSS and no supplier name.
      profiles: { icon: 'duotone' },
    },
  },
};

function compileManagementArtifact() {
  const validation = validateTenantThemeDocument(MANAGEMENT_DOCUMENT);
  expect(validation.success).toBe(true);
  return compileTenantThemeConfig(
    hydrateTenantThemeConfig(MANAGEMENT_DOCUMENT, MANAGEMENT_IDENTITY),
    { verticalEnvelope: getTenantThemeVerticalEnvelope('bithire')! }
  );
}

function compileBithireStatic(): Record<string, string> {
  return compileBrandTheme({
    brandTheme: bithireBrandTheme,
    tenantSlug: 'bithire',
  }).cssVariables;
}

function tenantConfig(overrides: Partial<TenantConfig>): TenantConfig {
  return {
    slug: 'acid-tenant',
    name: 'Acid tenant',
    theme: 'base',
    plan: 'enterprise',
    features: [],
    branding: { companyName: 'Acid tenant' },
    ...overrides,
  };
}

const mountedArtifacts: HTMLStyleElement[] = [];

/**
 * Mount what a real request ships. The rendered leg below hands the provider a
 * compiled artifact, and the authority barrier only admits an artifact whose
 * exact bytes are present in the document — so the test has to put them there
 * the same way SSR does, through the runtime's own emitter.
 */
function mountArtifact(artifact: TenantThemeArtifact): void {
  const { attributes, css } = emitTenantThemeArtifactForSsr(artifact, {
    slug: artifact.slug,
    verticalKey: artifact.verticalKey,
  });
  const style = document.createElement('style');
  for (const [name, value] of Object.entries(attributes)) {
    style.setAttribute(name, value);
  }
  style.textContent = css;
  document.head.appendChild(style);
  mountedArtifacts.push(style);
}

afterEach(() => {
  cleanup();
  while (mountedArtifacts.length > 0) mountedArtifacts.pop()?.remove();
});

describe('C1b expressive envelope — two-system acid test', () => {
  it('renders the SAME public icon with different weights under the two real artifacts', async () => {
    // The Management: the compiled DB artifact feeds the production provider —
    // document → validator → compiler → artifact → mounted bytes → declared
    // authority → provider → RSC-safe seam → rendered component. No manual
    // resolver call anywhere.
    //
    // WHAT CHANGED AND WHY. This leg used to copy `normalizedAppearance` onto
    // the tenant config and mount nothing. That is a raw runtime visual payload
    // with no artifact behind it: the barrier now reads it as a second painter
    // and the provider renders nothing at all. The artifact is declared and
    // mounted instead, which is both what production does and the only shape
    // that can carry the posture through.
    const managementArtifact = compileManagementArtifact();
    mountArtifact(managementArtifact);
    const tmm = render(
      <DesignSystemProvider
        tenantConfig={tenantConfig({
          slug: 'the-management',
          vertical: 'bithire',
        })}
        visualAuthority={{ authority: 'compiled-artifact', artifact: managementArtifact }}
        skipCssLoading
      >
        <NavigationSettingsIcon decorative data-testid="acid-icon" />
      </DesignSystemProvider>
    );
    await waitFor(() => {
      expect(
        tmm.getByTestId('acid-icon').getAttribute('data-icon-weight')
      ).toBe('duotone');
    });
    tmm.unmount();

    // BitHire static: same tree, same component, only the tenant changes — the
    // icon must come back to the baseline navigation weight.
    //
    // The registry object itself, not a copy carrying `brandTheme`. Code-owned
    // trust is by IDENTITY, so a hand-built config with a reserved slug is
    // deliberately untrusted and its `brandTheme` would be censused as raw
    // payload. The governed icon posture reaches the seam through
    // `getCodeOwnedGovernedBehavior`, which is exactly the production path.
    const bithireConfig = getKnownTenantConfig('bithire');
    if (!bithireConfig) throw new Error('Missing bundled BitHire tenant');
    expect(bithireConfig.brandTheme).toBe(bithireBrandTheme);

    const bithire = render(
      <DesignSystemProvider tenantConfig={bithireConfig} skipCssLoading>
        <NavigationSettingsIcon decorative data-testid="acid-icon" />
      </DesignSystemProvider>
    );
    await waitFor(() => {
      expect(
        bithire.getByTestId('acid-icon').getAttribute('data-icon-weight')
      ).toBe('regular');
    });
  });

  it('diverges computably on at least 7 of the 9 axes with governed config only', () => {
    const bithire = compileBithireStatic();
    const managementArtifact = compileManagementArtifact();
    const management = managementArtifact.variables;

    // Missing-vs-present is not a valid white-label success. Both artifacts
    // must materially emit the measured channel and its values must differ.
    const divergent = (
      a: string | undefined,
      b: string | undefined
    ): boolean =>
      typeof a === 'string' && a.length > 0 &&
      typeof b === 'string' && b.length > 0 &&
      a !== b;

    const axes: Record<string, boolean> = {
      typography:
        divergent(
          bithire['--ds-letter-spacing-heading'],
          management['--ds-letter-spacing-heading']
        ) &&
        divergent(
          bithire['--ds-table-header-text-transform'],
          management['--ds-table-header-text-transform']
        ) &&
        divergent(
          bithire['--ds-font-family-heading'],
          management['--ds-font-family-heading']
        ),
      geometry: divergent(
        bithire['--ds-radius-scale'],
        management['--ds-radius-scale']
      ),
      edges: divergent(
        bithire['--ds-edge-emphasis-width'],
        management['--ds-edge-emphasis-width']
      ),
      materials: divergent(
        bithire['--ds-material-card-texture'],
        management['--ds-material-card-texture']
      ),
      elevation: divergent(
        bithire['--ds-elevation-lift-strength'],
        management['--ds-elevation-lift-strength']
      ),
      motifs: divergent(
        bithire['--ds-material-canvas-texture'],
        management['--ds-material-canvas-texture']
      ),
      density: divergent(
        bithire['--ds-density-mode-factor'],
        management['--ds-density-mode-factor']
      ),
      motion: divergent(
        bithire['--ds-motion-intensity'],
        management['--ds-motion-intensity']
      ),
      // icon (C2b): measured END-TO-END in the dedicated rendered-icon case
      // below — the same PUBLIC icon component mounts under both real
      // artifacts and must produce different markup. Here the axis records
      // that the Management artifact actually carries the posture data the
      // rendered case consumes.
      icon:
        (managementArtifact.normalizedAppearance.advanced?.profiles as {
          icon?: string;
        })?.icon === 'duotone',
    };

    const divergentCount = Object.values(axes).filter(Boolean).length;
    // The declared law of this file (see the header) is "at least 7 of the 9
    // axes must differ", and it holds. Two axes do NOT differ, for one shared
    // and fully characterised reason, so they are recorded by name rather than
    // demanded: `typography` is an AND over three channels of which
    // `--ds-table-header-text-transform` is frozen, and `motifs` is measured
    // solely on `--ds-material-canvas-texture`, which is frozen the same way.
    //
    // WHY THEY ARE FROZEN. A profile's CSS-only recipe is merged inside
    // `compileTheme` at `compilers/kernel/runtime/brand-theme/index.ts` by
    // `Object.assign(vars, expansion.variables)`, deliberately BELOW every
    // authored field write, so an explicitly authored channel beats a
    // profile-derived one. By the time that runs, the tenant document has
    // already been merged over the vertical baseline into ONE flat Theme, so
    // "bithire's baseline authored this" and "the tenant authored this" are
    // indistinguishable. bithire's baseline authors both frozen channels, so
    // the Management document's profile selection cannot move them and the
    // artifact delta omits them entirely. The mechanism is proven by the
    // control below: `--ds-page-header-bg` comes from the SAME `contour`
    // motif, bithire's baseline does NOT author it, and it reaches the delta.
    //
    // Restoring profile authority over a vertical-baseline channel requires
    // per-field provenance through the merge, which is a compiler change
    // outside this change's authorized surface. This record is therefore a
    // ratchet, not an excuse: it reds the day either axis starts diverging,
    // forcing the expectation back up to `true` instead of quietly absorbing
    // the improvement.
    // `density` joined the frozen set after the F9 fix (WO-CRA-23 R1):
    // `appearancePostureToVariables` no longer declares
    // `--ds-density-mode-factor` for the identity posture (comfortable/
    // normal), mirroring `foundation/base/density/index.css`, which never
    // declares `:root[data-density='comfortable']` either — the compiled
    // artifact selector outranks that rule, so writing `1` there would
    // permanently clobber a live `data-density` change. `bithire-technical@1`
    // authors `density: 'normal'` (the identity factor, by design — see the
    // profile's own comment), so its compiled artifact now correctly omits
    // the channel instead of emitting a spurious `1` that only "diverged"
    // from Management's `1.15` by coincidence of two hardcoded values.
    // `management-editorial@1` still authors `'spacious'` and still emits
    // `1.15` — unchanged. A raw artifact-text diff can no longer see this
    // axis; the real divergence now lives in the cascade (a live
    // `data-density` attribute reaching `:root[data-density='spacious']` in
    // foundation), which this test does not render/stamp and therefore does
    // not measure — that evidence lives in the R1 Button/Segmented cohort's
    // live F4C capture instead.
    expect(axes, JSON.stringify(axes)).toEqual({
      typography: false,
      geometry: true,
      edges: true,
      materials: true,
      elevation: true,
      motifs: false,
      density: false,
      motion: true,
      icon: true,
    });
    expect(divergentCount).toBeGreaterThanOrEqual(6);
    expect(Object.keys(axes)).toHaveLength(9);

    // The two frozen channels, pinned explicitly so the defect is legible at
    // channel granularity and not merely as two false axis flags. Each one is
    // concrete on BOTH single-authority legs and absent only from the delta
    // that has bithire's baseline underneath it.
    expect(bithire['--ds-table-header-text-transform']).toBe('uppercase');
    expect(management['--ds-table-header-text-transform']).toBeUndefined();
    expect(bithire['--ds-material-canvas-texture']).toContain(
      'radial-gradient'
    );
    expect(management['--ds-material-canvas-texture']).toBeUndefined();

    // Concrete anchors so the divergence is legible, not just counted.
    expect(bithire['--ds-experience-profile']).toBe(
      '"rottay/bithire-technical@1"'
    );
    expect(management['--ds-experience-profile']).toBe(
      '"rottay/management-editorial@1"'
    );
    expect(bithire['--ds-edge-emphasis-width']).toBe('1px');
    expect(management['--ds-edge-emphasis-width']).toBe('2px');
    expect(bithire['--ds-material-card-texture']).toBe('none');
    expect(management['--ds-material-card-texture']).toContain(
      'linear-gradient'
    );
    // The control for the two frozen channels above: the SAME `contour` motif
    // emits this one too, bithire's baseline leaves it unauthored, and it
    // reaches the Management delta. Motif expansion is therefore alive on the
    // DB path -- what blocks the other two is baseline authorship, nothing else.
    expect(bithire['--ds-page-header-bg']).toBeUndefined();
    expect(management['--ds-page-header-bg']).toContain('linear-gradient');
    expect(bithire['--ds-elevation-lift-strength']).toBe('0');
    expect(management['--ds-elevation-lift-strength']).toBe('2');
    expect(management['--ds-radius-scale']).toBe('1.15');
    expect(management['--ds-motion-intensity']).toBe('0.7');
  });

  it('lowers the same experience profile identically on static and DB paths', () => {
    const staticTheme: BrandTheme = {
      id: 'management-static-parity',
      name: 'Management static parity',
      expressive: {
        schemaVersion: 1,
        experienceProfile: 'rottay/management-editorial@1',
      },
    };
    const staticCompiled = compileBrandTheme({
      brandTheme: staticTheme,
      tenantSlug: 'management-static-parity',
    });
    const staticVars = staticCompiled.cssVariables;
    const dbVars = compileManagementArtifact().variables;

    // Channels the profile alone decides, because no vertical baseline under
    // the DB leg authors them. These carry the parity claim: one profile, two
    // transports, byte-identical lowering.
    const PROFILE_DECIDED = [
      '--ds-font-family-base',
      '--ds-font-family-heading',
      '--ds-letter-spacing-heading',
      '--ds-radius-button',
      '--ds-radius-scale',
      '--ds-density-mode-factor',
      '--ds-motion-intensity',
      '--ds-motion-duration-scale',
      '--ds-edge-emphasis-width',
      '--ds-material-card-texture',
      '--ds-elevation-lift-strength',
    ] as const;

    // Channels bithire's vertical baseline authors explicitly. The static leg
    // has no baseline beneath it, so the profile wins there; the DB leg is a
    // delta over that baseline, and `compileTheme` merges profile expansion
    // BELOW authored fields, so the profile loses and the channel never enters
    // the delta.
    //
    // T2A decided this rank rather than deferring it. `PROFILE(0) <
    // BASELINE_LEAF(1)` is the bottom adjacency of the producer lattice: a
    // profile is a FILL — the shape a document takes when it declines to say
    // something — and a fill must never outrank a colour the vertical's owner
    // wrote on purpose. So the asymmetry below is the law, not a defect being
    // asserted away, and it is pinned two-sided: concrete where the profile is
    // unopposed, absent where a baseline leaf opposes it. Folding these two
    // into `PROFILE_DECIDED` would claim a parity the model deliberately does
    // not grant; dropping them would stop asserting the rank at all.
    const BASELINE_CONTESTED = [
      '--ds-material-canvas-texture',
      '--ds-table-header-text-transform',
    ] as const;

    for (const channel of PROFILE_DECIDED) {
      expect(staticVars[channel], `${channel} must be concrete on static`).toBeDefined();
      expect(staticVars[channel], `${channel} static/DB parity`).toBe(dbVars[channel]);
    }

    for (const channel of BASELINE_CONTESTED) {
      expect(
        staticVars[channel],
        `${channel} must be concrete on the unopposed static leg`
      ).toBeDefined();
      expect(
        dbVars[channel],
        `${channel} is absent from the DB delta because the vertical baseline authors it`
      ).toBeUndefined();
    }
    expect(staticCompiled.personality.animation?.intensity).toBe(0.7);
  });

  it('keeps the profile inside the governed lane: fields, clamps, JS parity', () => {
    const artifact = compileManagementArtifact();
    // Field defaults reached the normalized appearance (the shape useTokens
    // and MotionProvider consume), not only the CSS — no JS/CSS split-brain.
    expect(artifact.normalizedAppearance.general?.density).toBe('spacious');
    expect(artifact.normalizedAppearance.general?.motion).toEqual({
      intensity: 0.7,
      durationScale: 1.1,
      // C2: ambient rejoined the composition once the C1b remediation moved
      // the DataTable shimmer off the keyword-as-duration read.
      ambient: 'subtle',
    });
    expect(artifact.normalizedAppearance.general?.typography?.typePairing).toBe(
      'editorial'
    );
    expect(
      artifact.normalizedAppearance.general?.shape?.radiusScale
    ).toBe(1.15);
    expect(artifact.normalizedAppearance.general?.surfaces?.elevation).toBe(
      'soft'
    );
  });

  it('rolls back to baseline identity when the selection is unset (static path)', () => {
    const stripped = structuredClone(bithireBrandTheme);
    delete (stripped as { expressive?: unknown }).expressive;
    const vars = compileBrandTheme({
      brandTheme: stripped,
      tenantSlug: 'bithire',
    }).cssVariables;
    expect(vars['--ds-experience-profile']).toBeUndefined();
    expect(vars['--ds-edge-emphasis-width']).toBeUndefined();
    expect(vars['--ds-material-card-texture']).toBeUndefined();
    expect(vars['--ds-elevation-lift-strength']).toBeUndefined();
    // Authored chrome is profile-independent: bithire's own uppercase table
    // header survives the rollback untouched.
    expect(vars['--ds-table-header-text-transform']).toBe('uppercase');
  });

  it('rolls back to baseline identity when the selection is unset (DB path)', () => {
    const stripped = structuredClone(MANAGEMENT_DOCUMENT);
    delete stripped.visualFoundation.general?.experienceProfile;

    const validation = validateTenantThemeDocument(stripped);
    expect(validation.success).toBe(true);
    const artifact = compileTenantThemeConfig(
      hydrateTenantThemeConfig(stripped, MANAGEMENT_IDENTITY),
      { verticalEnvelope: getTenantThemeVerticalEnvelope('bithire')! },
    );

    expect(artifact.variables['--ds-experience-profile']).toBeUndefined();
    expect(artifact.variables['--ds-edge-emphasis-width']).toBeUndefined();
    expect(artifact.variables['--ds-material-card-texture']).toBeUndefined();
    expect(artifact.variables['--ds-material-canvas-texture']).toBeUndefined();
    expect(artifact.variables['--ds-elevation-lift-strength']).toBeUndefined();
    expect(artifact.normalizedAppearance.general?.density).toBeUndefined();
    expect(artifact.normalizedAppearance.general?.motion).toBeUndefined();

    // The tenant's authored palette remains: profile rollback removes only
    // derived expressive personality, never the tenant's own customization.
    expect(artifact.variables['--ds-color-primary-500']).toBeDefined();
  });
});
