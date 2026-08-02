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
      // spacing.rhythm — authored ALONGSIDE a non-default density on purpose:
      // the two axes must both survive, which is the orthogonality proof.
      rhythm: 'airy',
      // motion.dial
      motion: { intensity: 0.62, durationScale: 1.15, ambient: 'subtle' },
      // surfaces.elevation-posture + surfaces.effect-intensity
      surfaces: { elevation: 'elevated', effectIntensity: 0.18 },
      // navigation.sidebar-tone
      navigation: { sidebarTone: 'strong' },
      // experience.profile (C1b) — its ruled/soft defaults are deliberately
      // shadowed by the authored dials above, which is itself load-bearing:
      // the radius/motion probes prove authored-over-profile precedence.
      experienceProfile: 'rottay/management-editorial@1',
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
      // profiles.expressive (C1b) — edge overrides the experience profile's
      // own `ruled`, proving the per-axis Pro layer wins over the composition.
      // profiles.icon (C2) — the opened icon axis travels as data.
      profiles: { edge: 'inset-double', motif: 'micro-grid', icon: 'duotone' },
      // responsive.posture (E2) — the opened adaptive ladder, also data-only.
      responsivePosture: 'expansive',
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
    // C2 envelope law: the document authors 0.9, but this probe document also
    // selects rottay/management-editorial@1 whose envelope floors the radius
    // dial at 1.0 — the explicit override bends the posture, never breaks it.
    expect(artifact.variables['--ds-radius-scale']).toBe('1'),
  'shape.button-style': (artifact) =>
    expect(artifact.variables['--ds-radius-button']).toBe('2px'),
  'density.mode': (artifact) =>
    expect(artifact.variables['--ds-density-mode-factor']).toBeDefined(),
  'motion.dial': (artifact) =>
    expect(artifact.variables['--ds-motion-intensity']).toBe('0.62'),
  'spacing.rhythm': (artifact) => {
    // airy -> 1.2, inside the 0.8-1.25 envelope.
    expect(artifact.variables['--ds-rhythm-scale']).toBe('1.2');
    // Orthogonality, asserted rather than asserted-about: the document also
    // authors density 'spacious', and BOTH axes reach the artifact. If rhythm
    // had been folded into the density factor this key would be missing or
    // the density one would have moved.
    expect(artifact.variables['--ds-density-mode-factor']).toBeDefined();
    // Rhythm must never reach a control-sizing channel.
    expect(artifact.variables['--ds-density-effective-scale']).toBeUndefined();
  },
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
  'experience.profile': (artifact) => {
    expect(artifact.variables['--ds-experience-profile']).toBe(
      '"rottay/management-editorial@1"'
    );
    // One expanded channel per representative axis of the composition:
    // editorial type posture (table chrome case) and paper material.
    expect(artifact.variables['--ds-table-header-text-transform']).toBe('none');
    expect(artifact.variables['--ds-material-card-highlight']).toContain(
      'color-mix'
    );
  },
  'profiles.icon': (artifact) => {
    // The icon posture is DATA, not CSS: it must survive into the artifact's
    // normalized appearance (the shape the bootstrap provider threads into
    // the icon context) and select the governed duotone table.
    expect(
      (artifact.normalizedAppearance.advanced?.profiles as { icon?: string })
        ?.icon
    ).toBe('duotone');
    expect(artifact.variables['--ds-icon-posture']).toBeUndefined();
  },
  'responsive.posture': (artifact) => {
    // Like the icon posture, the ladder is DATA, not CSS: it must survive into
    // the artifact's normalized appearance — the shape the adaptive runtime
    // reads through resolveActiveResponsivePosture.
    expect(artifact.normalizedAppearance.advanced?.responsivePosture).toBe(
      'expansive'
    );
    // A container ladder must never leak into a sizing channel: this axis
    // changes WHEN a posture flips, never how large anything is. The
    // exhaustive "emits no channel at all" proof is its own test below —
    // asserting one invented variable name absent would prove nothing.
    expect(artifact.variables['--ds-density-effective-scale']).toBeUndefined();
  },
  'profiles.expressive': (artifact) => {
    // inset-double (explicit Pro axis) beats the experience profile's ruled.
    expect(artifact.variables['--ds-edge-emphasis-width']).toBe('3px');
    // micro-grid (explicit Pro axis) beats the experience profile's contour.
    expect(artifact.variables['--ds-material-canvas-texture']).toContain(
      'repeating-linear-gradient'
    );
    expect(artifact.variables['--ds-page-header-bg']).toBeUndefined();
  },
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

  it('pins exact tier membership (binding C1 posture: seeds are Standard, dark-mode is internal compatibility)', () => {
    // Counts alone cannot catch a tier swap — the C1b-F0-1 defect kept
    // Standard at 11 and Internal at 1 with the two palette rows inverted.
    // Membership is therefore pinned literally; moving a capability between
    // tiers is a reviewed contract change that must edit this expectation.
    expect([...TENANT_STANDARD_MANIFEST].sort()).toEqual([
      'density.mode',
      'experience.profile',
      'motion.dial',
      'navigation.sidebar-tone',
      'palette.seeds',
      'shape.button-style',
      'shape.radius-scale',
      'spacing.rhythm',
      'surfaces.effect-intensity',
      'surfaces.elevation-posture',
      'typography.families',
      'typography.pairing',
      'typography.scale',
    ]);
    // E2 written reason: `responsive.posture` moves frontier → PRO. It is a
    // bounded selection from a closed first-party ladder registry, not a
    // free dial, and it changes layout capacity rather than brand surface —
    // which is Pro's remit, not Standard's. Its absent value resolves to the
    // pre-capability thresholds, so admitting it moves no existing tenant.
    expect([...TENANT_PRO_MANIFEST].sort()).toEqual([
      'chrome.anatomy',
      'chrome.families',
      'profiles.expressive',
      'profiles.icon',
      'recipe-profile',
      'responsive.posture',
      'token-overrides',
    ]);
    expect([...TENANT_INTERNAL_MANIFEST]).toEqual(['palette.dark-mode']);
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

  it('responsive.posture emits NO css channel: the same variable set with and without it', () => {
    // The data-only claim, proven exhaustively rather than by naming a channel
    // that was never going to exist. Two compilations of the SAME document,
    // differing only by the authored ladder, must produce an identical
    // variable map — identical keys AND identical values.
    const withoutLadder = structuredClone(FULL_SURFACE_DOCUMENT);
    if (withoutLadder.mode !== 'advanced') throw new Error('advanced fixture');
    delete (withoutLadder.visualFoundation.advanced as Record<string, unknown>)
      .responsivePosture;

    const compile = (document: TenantThemeDocument) =>
      compileTenantThemeConfig(hydrateTenantThemeConfig(document, IDENTITY), {
        verticalEnvelope: ENVELOPE,
      });

    const bare = compile(withoutLadder);
    const laddered = compile(FULL_SURFACE_DOCUMENT);

    expect(laddered.normalizedAppearance.advanced?.responsivePosture).toBe(
      'expansive'
    );
    expect(bare.normalizedAppearance.advanced?.responsivePosture).toBeUndefined();
    expect(laddered.variables).toEqual(bare.variables);

    // The emitted stylesheet differs in exactly ONE place — the provenance
    // comment, which embeds the artifact digest, and the digest legitimately
    // moves because the DOCUMENT gained a field. Every declaration is
    // identical, which is what "no channel" means.
    const declarations = (css: string) =>
      css.split('\n').filter((line) => !line.trimStart().startsWith('/*'));
    expect(declarations(laddered.css)).toEqual(declarations(bare.css));
  });

  it('drill: frontier paths stay rejected and every opened vocabulary stays closed', () => {
    const statusSeeds = structuredClone(FULL_SURFACE_DOCUMENT);
    if (statusSeeds.mode !== 'advanced') throw new Error('advanced fixture');
    (statusSeeds.visualFoundation.general!.palette as Record<string, unknown>).success =
      '#5B8A3A';
    expect(validateTenantThemeDocument(statusSeeds).success).toBe(false);

    // E2: responsive.posture is OPEN now, so this drill flips from whole-path
    // rejection to vocabulary closure. All three published ladders validate...
    for (const id of ['compact', 'balanced', 'expansive']) {
      const real = structuredClone(FULL_SURFACE_DOCUMENT);
      if (real.mode !== 'advanced') throw new Error('advanced fixture');
      (real.visualFoundation.advanced as Record<string, unknown>)
        .responsivePosture = id;
      expect(validateTenantThemeDocument(real).success, id).toBe(true);
    }

    // ...and an invented ladder fails closed rather than resolving to the
    // baseline, which is the whole difference between a closed vocabulary and
    // a suggestion: a typo must never silently ship the default.
    const hostilePosture = structuredClone(FULL_SURFACE_DOCUMENT);
    if (hostilePosture.mode !== 'advanced') throw new Error('advanced fixture');
    (hostilePosture.visualFoundation.advanced as Record<string, unknown>)
      .responsivePosture = 'cavernous';
    expect(validateTenantThemeDocument(hostilePosture).success).toBe(false);

    // The OLD frontier path stays rejected. The capability opened at
    // `advanced.responsivePosture`; a document that authors it one level up —
    // the exact shape this drill asserted while the row was frontier — is
    // still an unknown key, so opening the axis widened nothing by accident.
    const misplacedPosture = structuredClone(FULL_SURFACE_DOCUMENT);
    if (misplacedPosture.mode !== 'advanced')
      throw new Error('advanced fixture');
    (
      misplacedPosture.visualFoundation as Record<string, unknown>
    ).responsivePosture = 'expansive';
    expect(validateTenantThemeDocument(misplacedPosture).success).toBe(false);

    // C2: the icon axis is OPEN now — the drill flips from field rejection
    // to vocabulary closure: a hostile posture value still fails closed.
    const hostileIcon = structuredClone(FULL_SURFACE_DOCUMENT);
    if (hostileIcon.mode !== 'advanced') throw new Error('advanced fixture');
    (
      hostileIcon.visualFoundation.advanced!.profiles as Record<string, unknown>
    ).icon = 'stroke-9000';
    expect(validateTenantThemeDocument(hostileIcon).success).toBe(false);

    // E1: spacing.rhythm is a CLOSED domain. An out-of-vocabulary posture is
    // rejected outright rather than clamped into the envelope, so a typo can
    // never silently resolve to `normal`.
    const hostileRhythm = structuredClone(FULL_SURFACE_DOCUMENT);
    if (hostileRhythm.mode !== 'advanced') throw new Error('advanced fixture');
    (hostileRhythm.visualFoundation.general as Record<string, unknown>).rhythm =
      'cavernous';
    expect(validateTenantThemeDocument(hostileRhythm).success).toBe(false);

    // ...and a raw number cannot smuggle past the enumeration either, which
    // is what keeps 0.8-1.25 an envelope rather than the contract.
    const numericRhythm = structuredClone(FULL_SURFACE_DOCUMENT);
    if (numericRhythm.mode !== 'advanced') throw new Error('advanced fixture');
    (numericRhythm.visualFoundation.general as Record<string, unknown>).rhythm = 1.2;
    expect(validateTenantThemeDocument(numericRhythm).success).toBe(false);
  });

  it('declares every C1 foundation authority with channels and consumers', () => {
    expect(FOUNDATION_AUTHORITIES.map((authority) => authority.id)).toEqual([
      'on-tone-ink',
      // P1: the AUT-1 absorption minted a SECOND tone-ink axis. It is declared
      // here — not in the capability registry — because it is a foundation
      // derivation, not a tenant dial: tenants move the tone seeds and this
      // follows. Listing it is what keeps it from being mistaken for either.
      'tinted-well-tone-ink',
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
