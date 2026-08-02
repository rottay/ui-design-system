/**
 * @fileoverview Capability PROPAGATION matrix (FASE 5, leg 1).
 *
 * THE QUESTION, which no existing suite asks: when a tenant moves a dial, does
 * the move actually travel? Every capability in the registry is declared with a
 * documentPath, a brandThemePath, representative derived channels, and a
 * productive `evidence.consumer`. Those declarations are inventory. This file
 * asks whether the inventory is CAUSAL, by mutating the input and watching the
 * output move:
 *
 *   input mutated -> the artifact differs in the expected channel
 *                 -> that channel reaches the declared evidence.consumer
 *                 -> the resolved value differs.
 *
 * A capability that compiles, validates, digests and emits — and still paints
 * nothing when its dial moves — passes every existing suite and fails here.
 *
 * ## NOT DUPLICATED HERE (referenced, never re-asserted)
 *
 * - `compilers/composition/tenant-theme/tests/capability-reachability.test.ts`
 *   owns registry<->manifest agreement, tier membership, "every documentPath
 *   compiles", "responsive.posture emits no channel", and frontier rejection.
 *   This file assumes all of that and asks only about MOVEMENT.
 * - `compilers/composition/tenant-theme/tests/static-db-channel-vocabulary.test.ts`
 *   owns "both paths emit the same channel language, DB is a subset of static".
 *   This file assumes the vocabulary and asks whether a value change travels
 *   through it.
 *
 * ## Registry-driven, never pinned to today's split
 *
 * The suite reads `TENANT_CAPABILITY_REGISTRY` and filters `status === 'active'`
 * at runtime. Nothing here hardcodes how many capabilities exist or which tier
 * owns them, because the tier split is being actively re-cut: a suite pinned to
 * today's standard/pro boundary would fail on re-tiering for no visual reason.
 * What IS pinned is coverage: `MUTATORS` must have an entry for every active id,
 * so adding an active capability fails this file until its propagation is
 * proven or explicitly ledgered.
 *
 * ## Three rows propagate as DATA, not CSS
 *
 * `chrome.anatomy`, `profiles.icon` and `responsive.posture` declare
 * `derivedRootAttributes` instead of CSS channels — they travel to the provider
 * as root attributes / normalized appearance, and asserting a computed style for
 * them would be asserting a thing the system never promised. Their leg 2 is a
 * root-attribute / normalized-appearance assertion, driven off the registry's own
 * `derivedRootAttributes` presence rather than off a hardcoded id list.
 *
 * ## Measurement window
 *
 * Leg 3 reads production consumer files from disk. CSS lanes are in flight in
 * this tree, so every consumer is read ONCE into `consumerCache` at first touch
 * and the whole suite measures inside that single window. The assertion is
 * channel REACHABILITY (boundary-matched token presence), never byte equality,
 * so an in-flight reformat of a skin file cannot flip this suite red.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { TENANT_CAPABILITY_REGISTRY } from '@/foundation/contracts/composition/tenants/capabilities';
import type {
  TenantThemeAdvancedDocument,
  TenantThemeConfigIdentity,
} from '@/foundation/contracts/composition/tenants/themes/tenant-theme';
import {
  compileTenantThemeConfig,
  getTenantThemeVerticalEnvelope,
  hydrateTenantThemeConfig,
  tenantThemeAnatomyAttributes,
} from '@/infrastructure/compilers/composition/tenant-theme';
import { compileBrandTheme } from '@/infrastructure/compilers/kernel/runtime/brand-theme';
import { bithireBrandTheme } from '@/foundation/tokens/ts/presentation/brand-themes/bithire';
import type { BrandTheme } from '@/foundation/contracts/composition/tenants/themes';

const IDENTITY: TenantThemeConfigIdentity = {
  tenantId: 'tenant_propagation_probe',
  slug: 'propagation-probe',
  verticalKey: 'bithire',
  rowVersion: 1,
};
const ENVELOPE = getTenantThemeVerticalEnvelope('bithire')!;

/**
 * The ADVANCED variant, not the `TenantThemeDocument` union: the baseline below
 * authors `mode: 'advanced'` because that is the only mode whose surface can
 * express every active capability at once, and the union's simple branch has no
 * `visualFoundation` to mutate.
 */
type Doc = TenantThemeAdvancedDocument;
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

/**
 * Baseline document authoring EVERY active capability, so each mutation below
 * is a value CHANGE rather than a first appearance — a first appearance would
 * prove emission (already covered elsewhere), not propagation.
 */
const BASE_DOC: Doc = {
  schemaVersion: 1,
  mode: 'advanced',
  visualFoundation: {
    general: {
      palette: {
        primary: '#315D4D',
        secondary: '#8C6D46',
        accent: '#E2725B',
        background: '#FBF6EC',
        backgroundMode: 'auto',
        dark: { primary: '#4FB3AA', background: '#141311' },
      },
      typography: {
        typePairing: 'editorial',
        fontFamilyBase: "Optima, Candara, 'Noto Sans', sans-serif",
        fontFamilyHeading: "'Fraunces', Georgia, 'Times New Roman', serif",
        scale: 1.05,
      },
      shape: { buttonStyle: 'sharp', radiusScale: 0.9 },
      density: 'spacious',
      rhythm: 'airy',
      motion: { intensity: 0.62, durationScale: 1.15, ambient: 'subtle' },
      surfaces: { elevation: 'elevated', effectIntensity: 0.18 },
      navigation: { sidebarTone: 'strong' },
      experienceProfile: 'rottay/management-editorial@1',
    },
    advanced: {
      tokenOverrides: {
        '--ds-color-error': '#7f1d1d',
        '--ds-color-bg-overlay': 'rgba(20, 19, 17, 0.55)',
      },
      chrome: { cardComponent: { bg: '#FFFEFB', anatomy: 'underline' } },
      profiles: { edge: 'inset-double', motif: 'micro-grid', icon: 'duotone' },
      responsivePosture: 'expansive',
    },
    recipeProfile: 'rottay/editorial-round@1',
  },
};

/**
 * Per-capability mutators.
 *
 * The registry's authoring paths are prose (`'typography (ramp channels)'`,
 * `'chrome.controls.button* (radius channels)'`, brace-sets, globs), so the
 * LOCATION cannot be derived mechanically and is named here. The VALUE is
 * chosen inside the capability's own declared domain — `enumValues` for enums,
 * `bounds` for scales — which is why re-cutting a domain in the registry
 * surfaces here instead of silently passing.
 */
interface Mutators {
  readonly db?: (document: Doc) => Doc;
  readonly static?: (theme: BrandTheme) => BrandTheme;
}

const MUTATORS: Record<string, Mutators> = {
  'palette.seeds': {
    db: (d) => { d.visualFoundation!.general!.palette!.primary = '#B3123C'; return d; },
    static: (b) => { b.palette!.primaryColor = '#B3123C'; return b; },
  },
  'palette.dark-mode': {
    db: (d) => { d.visualFoundation!.general!.palette!.dark!.primary = '#FF9A3C'; return d; },
  },
  'typography.pairing': {
    db: (d) => { d.visualFoundation!.general!.typography!.typePairing = 'geometric'; return d; },
    static: (b) => { b.typography = { ...(b.typography ?? {}), fontFamilyBase: 'Futura, sans-serif' }; return b; },
  },
  'typography.families': {
    db: (d) => { d.visualFoundation!.general!.typography!.fontFamilyHeading = "'Playfair Display', serif"; return d; },
    static: (b) => { b.typography = { ...(b.typography ?? {}), fontFamilyHeading: "'Playfair Display', serif" }; return b; },
  },
  'typography.scale': {
    db: (d) => { d.visualFoundation!.general!.typography!.scale = 0.95; return d; },
  },
  'shape.radius-scale': {
    db: (d) => { d.visualFoundation!.general!.shape!.radiusScale = 0.8; return d; },
    static: (b) => {
      b.surfaces = {
        ...(b.surfaces ?? {}),
        borderRadius: { ...(b.surfaces?.borderRadius ?? {}), md: '19px' },
      } as BrandTheme['surfaces'];
      return b;
    },
  },
  'shape.button-style': {
    db: (d) => { d.visualFoundation!.general!.shape!.buttonStyle = 'pill'; return d; },
  },
  'density.mode': {
    db: (d) => { d.visualFoundation!.general!.density = 'compact'; return d; },
    static: (b) => { b.surfaces = { ...(b.surfaces ?? {}), density: 'compact' } as BrandTheme['surfaces']; return b; },
  },
  'spacing.rhythm': {
    db: (d) => { d.visualFoundation!.general!.rhythm = 'tight'; return d; },
    static: (b) => { b.surfaces = { ...(b.surfaces ?? {}), rhythm: 'tight' } as BrandTheme['surfaces']; return b; },
  },
  'motion.dial': {
    db: (d) => { d.visualFoundation!.general!.motion!.intensity = 0.11; return d; },
    static: (b) => { b.motion = { ...(b.motion ?? {}), intensity: 0.11 } as BrandTheme['motion']; return b; },
  },
  'surfaces.elevation-posture': {
    db: (d) => { d.visualFoundation!.general!.surfaces!.elevation = 'flat'; return d; },
    static: (b) => {
      b.surfaces = {
        ...(b.surfaces ?? {}),
        shadows: { ...(b.surfaces?.shadows ?? {}), md: '0 0 0 1px #123456' },
      } as BrandTheme['surfaces'];
      return b;
    },
  },
  'surfaces.effect-intensity': {
    db: (d) => { d.visualFoundation!.general!.surfaces!.effectIntensity = 0.05; return d; },
    static: (b) => { b.surfaces = { ...(b.surfaces ?? {}), effectIntensity: 0.77 } as BrandTheme['surfaces']; return b; },
  },
  'navigation.sidebar-tone': {
    db: (d) => { d.visualFoundation!.general!.navigation!.sidebarTone = 'subtle'; return d; },
    static: (b) => {
      const chrome = b as unknown as { chrome?: Record<string, Record<string, unknown>> };
      chrome.chrome = {
        ...(chrome.chrome ?? {}),
        sidebar: { ...(chrome.chrome?.sidebar ?? {}), bg: '#0b1a2b' },
      };
      return b;
    },
  },
  'experience.profile': {
    db: (d) => { d.visualFoundation!.general!.experienceProfile = 'rottay/bithire-technical@1'; return d; },
  },
  'chrome.families': {
    db: (d) => {
      (d.visualFoundation!.advanced!.chrome as Record<string, Record<string, unknown>>).cardComponent!.bg = '#101820';
      return d;
    },
    static: (b) => {
      const chrome = b as unknown as { chrome?: Record<string, Record<string, unknown>> };
      chrome.chrome = {
        ...(chrome.chrome ?? {}),
        cardComponent: { ...(chrome.chrome?.cardComponent ?? {}), bg: '#101820' },
      };
      return b;
    },
  },
  'chrome.anatomy': {
    db: (d) => {
      (d.visualFoundation!.advanced!.chrome as Record<string, Record<string, unknown>>).cardComponent!.anatomy = 'framed';
      return d;
    },
  },
  'token-overrides': {
    db: (d) => {
      (d.visualFoundation!.advanced!.tokenOverrides as Record<string, string>)['--ds-color-error'] = '#00404f';
      return d;
    },
  },
  'recipe-profile': {
    db: (d) => { d.visualFoundation!.recipeProfile = 'rottay/technical-sharp@1'; return d; },
  },
  'profiles.expressive': {
    db: (d) => { (d.visualFoundation!.advanced!.profiles as Record<string, string>).edge = 'hairline'; return d; },
  },
  'profiles.icon': {
    db: (d) => { (d.visualFoundation!.advanced!.profiles as Record<string, string>).icon = 'solid-active'; return d; },
  },
  'responsive.posture': {
    db: (d) => { d.visualFoundation!.advanced!.responsivePosture = 'compact'; return d; },
  },
};

/**
 * Capabilities whose STATIC authoring point this leg does not yet mutate.
 *
 * Exact, not a floor: a capability leaving this list without gaining a `static`
 * mutator fails the coverage assertion. Cause is one of two, and both are
 * honest gaps in THIS leg rather than defects in the system:
 *
 *  - DATA-ONLY: the capability travels as normalized appearance / root
 *    attributes, and `compileBrandTheme().cssVariables` is the wrong instrument
 *    for it (`chrome.anatomy`, `profiles.icon`, `responsive.posture`).
 *  - AUTHORING-SHAPE: the BrandTheme field that carries it is a governed
 *    selection envelope (`expressive`, `recipes`, `responsive`) or a derived
 *    ramp with no single authored field (`typography.scale`,
 *    `shape.button-style`, `token-overrides`, `palette.dark-mode`). Mutating
 *    those needs the selection catalogs, which leg 1 does not own.
 */
const STATIC_UNCOVERED = new Set([
  'palette.dark-mode',
  'typography.scale',
  'shape.button-style',
  'experience.profile',
  'chrome.anatomy',
  'token-overrides',
  'recipe-profile',
  'profiles.expressive',
  'profiles.icon',
  'responsive.posture',
]);

/**
 * Capabilities where a channel that MOVED is read directly by the declared
 * `evidence.consumer`. Exact set, and deliberately not "all active": most
 * consumers read a channel DOWNSTREAM of the one the dial moves, and proving
 * that indirection is a different assertion than this leg makes. Every row here
 * is a closed loop from authored value to production consumer.
 */
const CONSUMER_REACHED = new Set([
  'palette.seeds',
  'palette.dark-mode',
  'typography.pairing',
  'typography.families',
  'typography.scale',
  'surfaces.elevation-posture',
  'surfaces.effect-intensity',
  'navigation.sidebar-tone',
]);

/**
 * Wrap-immune channel matcher WITH a frontier.
 *
 * Wrap-immune: finds the channel whether the consumer writes it bare
 * (`--ds-x:`), wrapped (`var(--ds-x)`), wrapped with a fallback
 * (`var(--ds-x, 0)`), or inside a TS string literal — the four shapes the
 * declared consumers actually use.
 * Frontier: `--ds-color-primary` is NOT satisfied by `--ds-color-primary-500`,
 * so a ramp step can never stand in for its seed.
 */
function channelReaches(source: string, channel: string): boolean {
  const escaped = channel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`${escaped}(?![-\\w])`).test(source);
}

const consumerCache = new Map<string, string>();
function consumerSource(relativePath: string): string {
  const cached = consumerCache.get(relativePath);
  if (cached !== undefined) return cached;
  const source = readFileSync(resolve(process.cwd(), relativePath), 'utf8');
  consumerCache.set(relativePath, source);
  return source;
}

const ACTIVE = TENANT_CAPABILITY_REGISTRY.filter(
  (capability) => capability.status === 'active'
);

function compileDb(document: Doc) {
  const artifact = compileTenantThemeConfig(
    hydrateTenantThemeConfig(document, IDENTITY),
    { verticalEnvelope: ENVELOPE }
  );
  return {
    variables: artifact.variables as Record<string, string>,
    anatomy: tenantThemeAnatomyAttributes(artifact),
    normalized: JSON.stringify(artifact.normalizedAppearance),
  };
}

const compileStatic = (theme: BrandTheme): Record<string, string> =>
  compileBrandTheme({ brandTheme: theme, tenantSlug: 'propagation-probe' })
    .cssVariables;

function changedKeys(
  before: Record<string, string>,
  after: Record<string, string>
): string[] {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  return [...keys].filter((key) => before[key] !== after[key]).sort();
}

describe('capability propagation — coverage is pinned to the registry', () => {
  it('owns a mutator for every ACTIVE capability', () => {
    expect(Object.keys(MUTATORS).sort()).toEqual(
      ACTIVE.map((capability) => capability.id).sort()
    );
  });

  it('declares a static-path disposition for every ACTIVE capability', () => {
    const covered = ACTIVE.filter((c) => MUTATORS[c.id]?.static).map((c) => c.id);
    const uncovered = ACTIVE.filter((c) => !MUTATORS[c.id]?.static).map((c) => c.id);
    expect(new Set(uncovered)).toEqual(STATIC_UNCOVERED);
    expect(covered.length + uncovered.length).toBe(ACTIVE.length);
  });
});

describe('DB path — an authored change reaches the artifact', () => {
  it('moves a channel, a root attribute, or the normalized appearance for every active capability', () => {
    const baseline = compileDb(clone(BASE_DOC));
    const inert: string[] = [];

    for (const capability of ACTIVE) {
      const mutate = MUTATORS[capability.id]?.db;
      if (!mutate) continue;
      const mutated = compileDb(mutate(clone(BASE_DOC)));

      const channels = changedKeys(baseline.variables, mutated.variables);
      const attributes = changedKeys(baseline.anatomy, mutated.anatomy);
      const normalizedMoved = baseline.normalized !== mutated.normalized;

      // Leg 2 + leg 4 are one measurement: a channel is "different" only by
      // its resolved VALUE, so a moved key is a moved value by construction.
      if (channels.length === 0 && attributes.length === 0 && !normalizedMoved) {
        inert.push(capability.id);
      }
    }

    // Named rather than counted: an inert capability is a dial a customer can
    // move with no effect anywhere, and the failure should say which one.
    expect(inert).toEqual([]);
  });

  it('routes the three data-only capabilities away from CSS, exactly as the registry declares', () => {
    const baseline = compileDb(clone(BASE_DOC));
    const dataOnly = ACTIVE.filter(
      (capability) =>
        (capability as { derivedRootAttributes?: readonly string[] })
          .derivedRootAttributes !== undefined
    );

    // Registry-driven: the set is read off `derivedRootAttributes`, never off a
    // hardcoded id list, so opening a fourth data-only capability lands here.
    expect(dataOnly.length).toBeGreaterThan(0);

    for (const capability of dataOnly) {
      const mutate = MUTATORS[capability.id]?.db;
      if (!mutate) continue;
      const mutated = compileDb(mutate(clone(BASE_DOC)));
      const movedAsData =
        changedKeys(baseline.anatomy, mutated.anatomy).length > 0 ||
        baseline.normalized !== mutated.normalized;
      expect(movedAsData, `${capability.id} must travel as data`).toBe(true);
    }
  });
});

describe('static path — an authored change reaches the compiled brand', () => {
  it('moves at least one channel for every capability with a static mutator', () => {
    const baseline = compileStatic(clone(bithireBrandTheme) as BrandTheme);
    const inert: string[] = [];

    for (const capability of ACTIVE) {
      const mutate = MUTATORS[capability.id]?.static;
      if (!mutate) continue;
      const mutated = compileStatic(mutate(clone(bithireBrandTheme) as BrandTheme));
      if (changedKeys(baseline, mutated).length === 0) inert.push(capability.id);
    }

    expect(inert).toEqual([]);
  });
});

describe('consumer reachability — the moved channel is read by production', () => {
  it('closes the loop for the ledgered capabilities', () => {
    const baseline = compileDb(clone(BASE_DOC));
    const staticBaseline = compileStatic(clone(bithireBrandTheme) as BrandTheme);
    const reached: string[] = [];

    for (const capability of ACTIVE) {
      const evidence = (
        capability as { evidence?: { consumer: string; symbol: string } }
      ).evidence;
      const mutators = MUTATORS[capability.id];
      if (!evidence || !mutators) continue;

      const moved = new Set<string>();
      if (mutators.db) {
        const mutated = compileDb(mutators.db(clone(BASE_DOC)));
        changedKeys(baseline.variables, mutated.variables).forEach((k) => moved.add(k));
      }
      if (mutators.static) {
        const mutated = compileStatic(
          mutators.static(clone(bithireBrandTheme) as BrandTheme)
        );
        changedKeys(staticBaseline, mutated).forEach((k) => moved.add(k));
      }

      const source = consumerSource(evidence.consumer);
      if ([...moved].some((channel) => channelReaches(source, channel))) {
        reached.push(capability.id);
      }
    }

    expect(new Set(reached)).toEqual(CONSUMER_REACHED);
  });
});

describe('positive controls — the chain is not vacuous', () => {
  it('rejects a ramp step standing in for its seed (matcher frontier)', () => {
    const rampOnly = ':root { --ds-color-primary-500: #abc; }';
    expect(channelReaches(rampOnly, '--ds-color-primary-500')).toBe(true);
    expect(channelReaches(rampOnly, '--ds-color-primary')).toBe(false);
    // Wrap-immunity, asserted rather than assumed.
    expect(channelReaches('color: var(--ds-color-primary, #000);', '--ds-color-primary')).toBe(true);
    expect(channelReaches("const c = '--ds-color-primary';", '--ds-color-primary')).toBe(true);
  });

  it('does not let one capability move another capability\'s exclusive channel', () => {
    const baseline = compileDb(clone(BASE_DOC));
    const typographyMoved = compileDb(MUTATORS['typography.families']!.db!(clone(BASE_DOC)));
    const paletteMoved = compileDb(MUTATORS['palette.seeds']!.db!(clone(BASE_DOC)));

    const byTypography = new Set(changedKeys(baseline.variables, typographyMoved.variables));
    const byPalette = new Set(changedKeys(baseline.variables, paletteMoved.variables));

    // If every mutation moved everything, the whole suite above would pass
    // vacuously. It does not: the two dials own disjoint channel territory.
    expect(byTypography.has('--ds-font-family-heading')).toBe(true);
    expect(byTypography.has('--ds-color-primary')).toBe(false);
    expect(byPalette.has('--ds-color-primary')).toBe(true);
    expect(byPalette.has('--ds-font-family-heading')).toBe(false);
  });
});
