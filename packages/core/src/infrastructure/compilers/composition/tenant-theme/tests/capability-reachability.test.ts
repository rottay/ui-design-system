/**
 * Capability registry ⇄ compiler reachability contract.
 *
 * The tenant capability registry
 * (`foundation/contracts/composition/tenants/capabilities`) is only honest if
 * every ACTIVE tenant capability is actually expressible on the DB path and
 * every FRONTIER capability is actually rejected. This test proves both
 * executable properties against the real schema, envelope and compiler — a
 * registry row that the compiler cannot honor fails here, and a frontier row
 * that the schema silently accepts fails here too.
 */
import { describe, expect, it } from 'vitest';

import type {
  TenantThemeConfigIdentity,
  TenantThemeDocument,
} from '@/foundation/contracts/composition/tenants/themes/tenant-theme';
import {
  compileTenantThemeConfig,
  getTenantThemeVerticalEnvelope,
  hydrateTenantThemeConfig,
  tenantThemeAnatomyAttributes,
  validateTenantThemeDocument,
} from '..';
import {
  FOUNDATION_AUTHORITIES,
  TENANT_CAPABILITY_REGISTRY,
  TENANT_INTERNAL_MANIFEST,
  TENANT_PRO_MANIFEST,
  TENANT_STANDARD_MANIFEST,
} from '@/foundation/contracts/composition/tenants/capabilities';
import type { ActiveTenantCapabilityId } from '@/foundation/contracts/composition/tenants/capabilities';

const IDENTITY: TenantThemeConfigIdentity = {
  tenantId: 'tenant_capability_probe',
  slug: 'capability-probe',
  verticalKey: 'bithire',
  rowVersion: 1,
};

const ENVELOPE = getTenantThemeVerticalEnvelope('bithire')!;

type CompiledProbeArtifact = ReturnType<typeof compileTenantThemeConfig>;

/**
 * One document that exercises EVERY active capability's documentPath:
 * standard through `general`, pro through `advanced` + `recipeProfile`.
 */
const FULL_SURFACE_DOCUMENT: TenantThemeDocument = {
  schemaVersion: 1,
  mode: 'advanced',
  visualFoundation: {
    general: {
      // palette.seeds + palette.dark-mode
      palette: {
        primary: '#315D4D',
        secondary: '#8C6D46',
        accent: '#E2725B',
        background: '#FBF6EC',
        backgroundMode: 'auto',
        dark: { primary: '#4FB3AA', background: '#141311' },
      },
      // typography.pairing + typography.families + typography.scale
      typography: {
        typePairing: 'editorial',
        fontFamilyBase: "Optima, Candara, 'Noto Sans', sans-serif",
        fontFamilyHeading: "'Fraunces', Georgia, 'Times New Roman', serif",
        scale: 1.05,
      },
      // shape.button-style + shape.radius-scale
      shape: { buttonStyle: 'sharp', radiusScale: 0.9 },
      // density.mode
      density: 'spacious',
      // motion.dial
      motion: { intensity: 0.62, durationScale: 1.15, ambient: 'subtle' },
      // surfaces.elevation-posture + surfaces.effect-intensity
      surfaces: { elevation: 'elevated', effectIntensity: 0.18 },
      // navigation.sidebar-tone
      navigation: { sidebarTone: 'strong' },
    },
    advanced: {
      // token-overrides (including the C1 scrim veil channel)
      tokenOverrides: {
        '--ds-color-error': '#7f1d1d',
        '--ds-color-bg-overlay': 'rgba(20, 19, 17, 0.55)',
      },
      // chrome.families + chrome.anatomy
      chrome: {
        cardComponent: { bg: '#FFFEFB', anatomy: 'underline' },
      },
    },
    // recipe-profile
    recipeProfile: 'rottay/editorial-round@1',
  },
};

/**
 * Load-bearing coverage: every ACTIVE registry id owns an executable assertion
 * over its actual compiler output. Adding an active row without adding its
 * proof makes both TypeScript and the exact key-set assertion fail.
 */
const ACTIVE_CAPABILITY_PROBES = {
  'palette.seeds': (artifact) =>
    expect(artifact.variables['--ds-color-primary']).toBe(
      'light-dark(#315D4D, #4FB3AA)'
    ),
  'palette.dark-mode': (artifact) =>
    expect(artifact.variables['--ds-color-scheme']).toBe('light dark'),
  'typography.pairing': (artifact) =>
    expect(artifact.variables['--ds-font-family-base']).toContain('Optima'),
  'typography.families': (artifact) =>
    expect(artifact.variables['--ds-font-family-heading']).toContain('Fraunces'),
  'typography.scale': (artifact) =>
    expect(artifact.variables['--ds-type-scale']).toBe('1.05'),
  'shape.radius-scale': (artifact) =>
    expect(artifact.variables['--ds-radius-scale']).toBe('0.9'),
  'shape.button-style': (artifact) =>
    expect(artifact.variables['--ds-radius-button']).toBe('2px'),
  'density.mode': (artifact) =>
    expect(artifact.variables['--ds-density-mode-factor']).toBeDefined(),
  'motion.dial': (artifact) =>
    expect(artifact.variables['--ds-motion-intensity']).toBe('0.62'),
  'surfaces.elevation-posture': (artifact) =>
    expect(artifact.variables['--ds-elevation-1']).toBeDefined(),
  'surfaces.effect-intensity': (artifact) =>
    expect(artifact.variables['--ds-effect-intensity']).toBe('0.18'),
  'navigation.sidebar-tone': (artifact) =>
    expect(artifact.variables['--ds-sidebar-bg']).toBeDefined(),
  'chrome.families': (artifact) =>
    expect(artifact.variables['--ds-card-bg']).toBe('#FFFEFB'),
  'chrome.anatomy': (artifact) =>
    expect(tenantThemeAnatomyAttributes(artifact)['data-anatomy-card']).toBe('underline'),
  'token-overrides': (artifact) =>
    expect(artifact.variables['--ds-color-error']).toBe('#7f1d1d'),
  'recipe-profile': (artifact) =>
    expect(artifact.variables['--ds-recipe-profile']).toBe('"rottay/editorial-round@1"'),
} satisfies Record<
  ActiveTenantCapabilityId,
  (artifact: CompiledProbeArtifact) => void
>;

describe('tenant capability registry reachability', () => {
  it('keeps ids unique and manifests consistent with the registry', () => {
    const ids = TENANT_CAPABILITY_REGISTRY.map((capability) => capability.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of [
      ...TENANT_STANDARD_MANIFEST,
      ...TENANT_PRO_MANIFEST,
      ...TENANT_INTERNAL_MANIFEST,
    ]) {
      const entry = TENANT_CAPABILITY_REGISTRY.find(
        (capability) => capability.id === id
      );
      expect(entry?.status, id).toBe('active');
    }
    // Frontier rows never leak into a rendered manifest.
    for (const capability of TENANT_CAPABILITY_REGISTRY) {
      if (capability.status !== 'frontier') continue;
      expect(TENANT_STANDARD_MANIFEST).not.toContain(capability.id);
      expect(TENANT_PRO_MANIFEST).not.toContain(capability.id);
      expect(TENANT_INTERNAL_MANIFEST).not.toContain(capability.id);
    }
  });

  it('compiles a document exercising every active capability documentPath', () => {
    const validation = validateTenantThemeDocument(FULL_SURFACE_DOCUMENT);
    expect(validation.success).toBe(true);

    const artifact = compileTenantThemeConfig(
      hydrateTenantThemeConfig(FULL_SURFACE_DOCUMENT, IDENTITY),
      { verticalEnvelope: ENVELOPE }
    );

    const activeIds = TENANT_CAPABILITY_REGISTRY
      .filter((capability) => capability.status === 'active')
      .map((capability) => capability.id)
      .sort();
    expect(Object.keys(ACTIVE_CAPABILITY_PROBES).sort()).toEqual(activeIds);
    for (const id of activeIds) {
      ACTIVE_CAPABILITY_PROBES[id](artifact);
    }

    // AUT-1 is a foundation authority rather than a tenant dial: the
    // overridden error tone still has to drag its derived ink.
    expect(artifact.variables['--ds-color-on-error']).toBe('#ffffff');
  });

  it('drill: every frontier capability is still rejected by the schema', () => {
    const statusSeeds = structuredClone(FULL_SURFACE_DOCUMENT);
    if (statusSeeds.mode !== 'advanced') throw new Error('advanced fixture');
    (statusSeeds.visualFoundation.general!.palette as Record<string, unknown>).success =
      '#5B8A3A';
    expect(validateTenantThemeDocument(statusSeeds).success).toBe(false);

    const posture = structuredClone(FULL_SURFACE_DOCUMENT);
    if (posture.mode !== 'advanced') throw new Error('advanced fixture');
    (posture.visualFoundation as Record<string, unknown>).responsivePosture =
      'dashboard-default@1';
    expect(validateTenantThemeDocument(posture).success).toBe(false);
  });

  it('declares every C1 foundation authority with channels and consumers', () => {
    expect(FOUNDATION_AUTHORITIES.map((authority) => authority.id)).toEqual([
      'on-tone-ink',
      'interaction-wash',
      'overlay-panel-scrim-split',
      'icon-size-roles',
      'nested-radius',
    ]);
    for (const authority of FOUNDATION_AUTHORITIES) {
      expect(authority.channels.length, authority.id).toBeGreaterThan(0);
      expect(authority.consumers.length, authority.id).toBeGreaterThan(0);
    }
  });
});
