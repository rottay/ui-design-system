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
import { describe, expect, it } from 'vitest';

import { bithireBrandTheme } from '@/foundation/tokens/ts/presentation/brand-themes/bithire';
import { compileBrandTheme } from '@/infrastructure/compilers/kernel/runtime/brand-theme';
import type { BrandTheme } from '@/foundation/contracts/composition/tenants/themes';
import type {
  TenantThemeConfigIdentity,
  TenantThemeDocument,
} from '@/foundation/contracts/composition/tenants/themes/tenant-theme';
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
        backgroundMode: 'light',
      },
      experienceProfile: 'rottay/management-editorial@1',
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

describe('C1b expressive envelope — two-system acid test', () => {
  it('diverges computably on at least 7 of the 9 axes with governed config only', () => {
    const bithire = compileBithireStatic();
    const management = compileManagementArtifact().variables;

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
      // icon: frontier — excluded from measurement by design.
    };

    const divergentCount = Object.values(axes).filter(Boolean).length;
    expect(axes, JSON.stringify(axes)).toEqual(
      Object.fromEntries(Object.keys(axes).map((axis) => [axis, true]))
    );
    expect(divergentCount).toBeGreaterThanOrEqual(7);

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
    expect(management['--ds-material-canvas-texture']).toContain(
      'radial-gradient'
    );
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

    const profileChannels = [
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
      '--ds-material-canvas-texture',
      '--ds-elevation-lift-strength',
      '--ds-table-header-text-transform',
    ] as const;

    for (const channel of profileChannels) {
      expect(staticVars[channel], `${channel} must be concrete on static`).toBeDefined();
      expect(staticVars[channel], `${channel} static/DB parity`).toBe(dbVars[channel]);
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
    delete stripped.visualFoundation.general.experienceProfile;

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
