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

import { THEME_CONTROL_CATALOG } from '@/contracts/theme/runtime/catalog';
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
import { firstPartyFixture, lowerFlatThemeFixture } from "@tests/support/theme-lowering";
import type { FlatTheme } from '@/foundation/contracts/composition/tenants/themes';

const bithireFlatTheme = firstPartyFixture('bithire');

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
 *
 * ## The palette is authored to CLEAR the ingestion floor, not to dodge it
 *
 * APCA admission is a rejection law, never a repaint: `compileTenantThemeConfig`
 * throws when a tenant-attributable pair lands under its governed floor, and it
 * does so before any propagation could be measured. A propagation fixture that
 * cannot be ingested measures nothing, so the reading hierarchy here is authored
 * explicitly rather than left to derivation, and every value was MEASURED
 * against the ground the compiler actually emits:
 *
 *   light  muted    #4A463C on #FBF6EC  Lc  86.6  (floor 60)
 *   light  disabled #6B665A on #FBF6EC  Lc  73.5  (floor 45)
 *   dark   muted    #C4BCAB on #141311  Lc -66.0  (floor 60)
 *   dark   disabled #A8A294 on #141311  Lc -51.5  (floor 45)
 *   dark   on-primary (derived white) on #12655E  Lc -88.4  (floor 60)
 *
 * `backgroundMode: 'auto'` publishes BOTH ramps, so a clear-scheme ink is also
 * an admission operand in dark: the light hierarchy alone is rejected against
 * `#141311`. Both halves are therefore authored, and both stay inside the
 * fixture's own warm editorial hue rather than collapsing to black/white.
 *
 * The dark seed is a deep teal (`#12655E`) rather than the light teal it was:
 * the derived on-primary ink over the light teal measured Lc -54.1, under the
 * body floor of 60. Nothing here relaxes a floor, exempts a pair, or repaints a
 * compiled value — the fixture simply authors colors a tenant could publish.
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
        foreground: { muted: '#4A463C', disabled: '#6B665A' },
        backgroundMode: 'auto',
        dark: {
          primary: '#12655E',
          background: '#141311',
          foreground: { muted: '#C4BCAB', disabled: '#A8A294' },
        },
        status: {
          success: '#166534',
          warning: '#92400E',
          error: '#991B1B',
          info: '#1E40AF',
        },
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
  readonly static?: (theme: FlatTheme) => FlatTheme;
}

const MUTATORS: Record<string, Mutators> = {
  'palette.seeds': {
    db: (d) => { d.visualFoundation!.general!.palette!.primary = '#B3123C'; return d; },
    static: (b) => { b.palette!.primaryColor = '#B3123C'; return b; },
  },
  'palette.dark-mode': {
    // A deep amber, not the light amber this once was: the mutated document is
    // ingested by the same admission law as the baseline, and a light dark-mode
    // seed leaves the derived on-primary ink at Lc -45.6, under the body floor.
    // Measured: derived white over #C2610A is Lc -73.8.
    db: (d) => { d.visualFoundation!.general!.palette!.dark!.primary = '#C2610A'; return d; },
  },
  'palette.status-seeds': {
    db: (d) => {
      d.visualFoundation!.general!.palette!.status!.success = '#047857';
      return d;
    },
    static: (b) => {
      b.palette!.successColor = '#047857';
      return b;
    },
  },
  'typography.pairing': {
    db: (d) => { d.visualFoundation!.general!.typography!.typePairing = 'geometric'; return d; },
    // Found by the keypath guard below, not by hand: this wrote
    // `typography.fontFamilyBase` -- a FAMILY, which is `typography.families`'
    // door and the very leaf that outranks the pairing. The declared keypath is
    // `typography.typePairing`, and the two families it expands into are
    // cleared so the pairing is what the reading measures.
    static: (b) => {
      const typography = { ...(b.typography ?? {}) } as Record<string, unknown>;
      delete typography.fontFamilyBase;
      delete typography.fontFamilyHeading;
      typography.typePairing = 'geometric';
      b.typography = typography as FlatTheme['typography'];
      return b;
    },
  },
  'typography.families': {
    db: (d) => { d.visualFoundation!.general!.typography!.fontFamilyHeading = "'Playfair Display', serif"; return d; },
    static: (b) => { b.typography = { ...(b.typography ?? {}), fontFamilyHeading: "'Playfair Display', serif" }; return b; },
  },
  'typography.scale': {
    db: (d) => { d.visualFoundation!.general!.typography!.scale = 0.95; return d; },
    static: (b) => { b.typography = { ...(b.typography ?? {}), scale: 1.08 } as FlatTheme['typography']; return b; },
  },
  'shape.radius-scale': {
    db: (d) => { d.visualFoundation!.general!.shape!.radiusScale = 0.8; return d; },
    // Found by the keypath guard below: this wrote `surfaces.borderRadius.md`,
    // a raw radius rather than the scale, which proves that authoring a radius
    // paints a radius. The declared keypath is `surfaces.radiusScale`.
    static: (b) => {
      b.surfaces = {
        ...(b.surfaces ?? {}),
        radiusScale: 1.2,
      } as FlatTheme['surfaces'];
      return b;
    },
  },
  'shape.button-style': {
    db: (d) => { d.visualFoundation!.general!.shape!.buttonStyle = 'pill'; return d; },
  },
  // The two arms start from DIFFERENT bases and therefore need different values:
  // the DB arm mutates `BASE_DOC` (a customer document, `spacious`/`airy`), the
  // static arm mutates the composed bithire baseline. A mutator that writes the
  // value its own base already holds writes no leaf at all.
  //
  // D6-2c-ii (2026-09-15): tenant-document compiles over neutral + preset, and
  // bithire's preset decides `density.mode: compact` and `spacing.rhythm: tight`,
  // which is what the STATIC mutators used to write. Static re-anchored on the
  // measured neighbours -- density `compact` -> `spacious`, rhythm `tight` ->
  // `airy`, 1 channel each (0 -> 1). The DB values are unchanged: they already
  // differ from `BASE_DOC`.
  'density.mode': {
    db: (d) => { d.visualFoundation!.general!.density = 'compact'; return d; },
    static: (b) => { b.surfaces = { ...(b.surfaces ?? {}), density: 'spacious' } as FlatTheme['surfaces']; return b; },
  },
  'spacing.rhythm': {
    db: (d) => { d.visualFoundation!.general!.rhythm = 'tight'; return d; },
    static: (b) => { b.surfaces = { ...(b.surfaces ?? {}), rhythm: 'airy' } as FlatTheme['surfaces']; return b; },
  },
  'motion.dial': {
    db: (d) => { d.visualFoundation!.general!.motion!.intensity = 0.11; return d; },
    static: (b) => { b.motion = { ...(b.motion ?? {}), intensity: 0.11 } as FlatTheme['motion']; return b; },
  },
  'surfaces.elevation-posture': {
    db: (d) => { d.visualFoundation!.general!.surfaces!.elevation = 'flat'; return d; },
    // F-72: this used to write `surfaces.shadows.md` -- a raw shadow value, not
    // the posture. It proved that authoring a shadow paints a shadow, which
    // nobody doubted, and said nothing about the control. The catalog's
    // `keypath.brandTheme` for this row is `surfaces.elevation`, and the
    // keypath guard below now refuses a mutator that writes anywhere else.
    // The explicit shadow map is CLEARED, not written: a FlatTheme states its
    // own shadows, and an explicit leaf outranks the posture that would derive
    // it. Measured -- setting `surfaces.elevation` alone moves 0 channels on
    // bithire. Clearing the leaf it competes with is the same precedence fact
    // `tests/integration/transport-parity` proves for four other rows, applied
    // here so the posture is measured instead of the shadow.
    static: (b) => {
      const surfaces = { ...(b.surfaces ?? {}) } as Record<string, unknown>;
      delete surfaces.shadows;
      surfaces.elevation = 'flat';
      b.surfaces = surfaces as FlatTheme['surfaces'];
      return b;
    },
  },
  'surfaces.effect-intensity': {
    db: (d) => { d.visualFoundation!.general!.surfaces!.effectIntensity = 0.05; return d; },
    static: (b) => { b.surfaces = { ...(b.surfaces ?? {}), effectIntensity: 0.77 } as FlatTheme['surfaces']; return b; },
  },
  // D6-2c-ii (2026-09-15): tenant-document compiles over neutral + preset, and
  // the composed baseline states the sidebar inks as `var()` references rather
  // than the hex the authored theme carried, so the `subtle` tone is now REFUSED
  // at admission -- "light/dark --ds-sidebar-text cannot be APCA-verified against
  // --ds-sidebar-bg (non-hex-foreground)" -- and the refusal threw before this
  // leg could measure anything. DB re-anchored on `inverse` (`BASE_DOC` holds
  // `strong`) and static on `strong` (the composed baseline holds `inverse`);
  // both are admitted and move. The refusal itself is reported for registration:
  // it is an admission rule that no longer has a hex pair to verify, not a
  // property of this capability.
  'navigation.sidebar-tone': {
    db: (d) => { d.visualFoundation!.general!.navigation!.sidebarTone = 'inverse'; return d; },
    // F-72: this used to write `chrome.sidebar.bg` -- a colour, not the tone.
    // The catalog's `keypath.brandTheme` for this row is `chrome.sidebar.tone`.
    static: (b) => {
      const chrome = b as unknown as { chrome?: Record<string, Record<string, unknown>> };
      chrome.chrome = {
        ...(chrome.chrome ?? {}),
        sidebar: { ...(chrome.chrome?.sidebar ?? {}), tone: 'strong' },
      };
      return b;
    },
  },
  'experience.profile': {
    db: (d) => { d.visualFoundation!.general!.experienceProfile = 'rottay/bithire-technical@1'; return d; },
  },
  'chrome.families': {
    // A clear-scheme parchment, not the near-black this once was: the card inks
    // are the vertical's clear-scheme inks, and dropping a dark ground under
    // them makes the card pair unreadable and the mutated document inadmissible
    // (measured Lc 0.0 for both `--ds-card-title-color` and
    // `--ds-card-body-color`). The channel still MOVES, which is all this leg
    // measures; it now moves to a value a tenant could publish.
    db: (d) => {
      (d.visualFoundation!.advanced!.chrome as Record<string, Record<string, unknown>>).cardComponent!.bg = '#EFE7D6';
      return d;
    },
    static: (b) => {
      const chrome = b as unknown as { chrome?: Record<string, Record<string, unknown>> };
      chrome.chrome = {
        ...(chrome.chrome ?? {}),
        cardComponent: { ...(chrome.chrome?.cardComponent ?? {}), bg: '#EFE7D6' },
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
    static: (b) => {
      const recipes = b as unknown as { recipes?: Record<string, unknown> };
      recipes.recipes = { ...(recipes.recipes ?? {}), profile: 'rottay/editorial@1' };
      return b;
    },
  },
  'profiles.expressive': {
    db: (d) => { (d.visualFoundation!.advanced!.profiles as Record<string, string>).edge = 'hairline'; return d; },
  },
  'profiles.icon': {
    db: (d) => { (d.visualFoundation!.advanced!.profiles as Record<string, string>).icon = 'solid-active'; return d; },
  },
  // D6-2c-ii (2026-09-15): tenant-document compiles over neutral + preset, and
  // bithire's preset decides `responsive.posture: compact`, so the STATIC mutator
  // wrote the value already there. Re-anchored on `expansive`, measured to move 4
  // channels (0 -> 4). The DB value stays `compact`: `BASE_DOC` holds `expansive`.
  'responsive.posture': {
    db: (d) => { d.visualFoundation!.advanced!.responsivePosture = 'compact'; return d; },
    static: (b) => {
      const responsive = b as unknown as { responsive?: Record<string, unknown> };
      responsive.responsive = { ...(responsive.responsive ?? {}), posture: 'expansive' };
      return b;
    },
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
 *    attributes, and `compileTheme().cssVariables` is the wrong instrument
 *    for it (`chrome.anatomy`, `profiles.icon`, `responsive.posture`).
 *  - AUTHORING-SHAPE: the FlatTheme field that carries it is a governed
 *    selection envelope (`expressive`, `recipes`, `responsive`) or a derived
 *    ramp with no single authored field (`typography.scale`,
 *    `shape.button-style`, `token-overrides`, `palette.dark-mode`). Mutating
 *    those needs the selection catalogs, which leg 1 does not own.
 */
/**
 * Capabilities with NO static mutator, each with the measured reason.
 *
 * F-72 asks for this set to be empty. It is not, and every remaining entry is
 * accounted for by a measurement rather than by a shrug -- three of them are
 * not a static-path question at all, and the other four were driven through the
 * catalog's own `keypath.brandTheme` and moved nothing, for reasons the
 * transport-parity suite proves independently.
 *
 * It went from ten to four real gaps in this lot: `typography.scale`,
 * `recipe-profile` and `responsive.posture` gained working static mutators, and
 * the two entries F-72 named by hand (`surfaces.elevation-posture` writing
 * `shadows.md`, `navigation.sidebar-tone` writing `sidebar.bg`) were moved onto
 * their real keypaths, where the keypath guard below now holds them.
 */
const STATIC_UNCOVERED_REASONS: Readonly<Record<string, string>> = {
  'palette.dark-mode':
    'its brandTheme keypath is `modes.dark.palette.*`, and this leg reads the ROOT block of the static lowering '
    + 'only; a mode delta is outside what `compileStatic` returns. Measured: 0 channels moved.',
  'shape.button-style':
    'bithire authors its button chrome explicitly and an explicit leaf outranks the silhouette that would '
    + 'derive it. Measured: setting `surfaces.buttonStyle` moves 0 channels on this fixture.',
  'experience.profile':
    'locked-by-default (D-28 b): the vertical product posture, not a tenant taste axis, so there is no tenant '
    + 'static authorship to mutate. Measured: 0 channels moved.',
  'profiles.expressive':
    'a six-key record composed into postures; one key is outranked by the explicit leaves the composition '
    + 'writes. Measured: setting `expressive.profiles.edge` moves 0 channels.',
  'chrome.anatomy':
    'its catalog effect is `root-attributes`, not `css-channels`: it travels as a normalized root attribute and '
    + 'never reaches a CSS channel, so a static channel assertion would assert something never promised.',
  'token-overrides':
    'not one of the 29 catalog decisions -- a retired row the registry still names. It has no brandTheme keypath '
    + 'to mutate.',
  'profiles.icon':
    'not a catalog decision either, and it declares `derivedRootAttributes`: it travels as data, which the '
    + 'data-only leg below asserts instead.',
};

const STATIC_UNCOVERED = new Set(Object.keys(STATIC_UNCOVERED_REASONS));

/**
 * Capabilities where a channel that MOVED is read directly by the declared
 * `evidence.consumer`. Exact set, and deliberately not "all active": most
 * consumers read a channel DOWNSTREAM of the one the dial moves, and proving
 * that indirection is a different assertion than this leg makes. Every row here
 * is a closed loop from authored value to production consumer.
 */
const CONSUMER_REACHED = new Set([
  'palette.seeds',
  'palette.status-seeds',
  'palette.dark-mode',
  'typography.pairing',
  'typography.families',
  'typography.scale',
  // WO-DER-03: the silhouette CLOSES the loop now. Its expansion used to live
  // in the DB ingress at the vertical's own rank, where bithire's authored
  // button chrome outranked it, so the word moved a channel no consumer read.
  // The `shape` family derives it at the tenant rank on both transports and it
  // lands on the five per-size radii the button skin actually paints through.
  'shape.button-style',
  'surfaces.elevation-posture',
  'surfaces.effect-intensity',
  'navigation.sidebar-tone',
  'motion.dial',
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

/**
 * The artifact publishes its channels in TWO blocks, and reading only the first
 * under-measures the system.
 *
 * `variables` is the unscoped root block. Everything a dual-ramp tenant author
 * moves in the dark scheme lands in `modeDeltas` instead — `palette.dark-mode`
 * moves `--ds-color-primary`, `--ds-color-link`, `--ds-color-border-focus` and
 * the chart series, and NONE of them appear in the root block. A measurement
 * that ignored the deltas would report the dark-mode dial inert, which is a
 * defect in the instrument rather than in the system.
 *
 * The delta channels are keyed `mode:name` so a light value and a dark value
 * for the same channel cannot silently cancel each other out.
 */
function compileDb(document: Doc) {
  const artifact = compileTenantThemeConfig(
    hydrateTenantThemeConfig(document, IDENTITY),
    { verticalEnvelope: ENVELOPE }
  );
  const modeChannels: Record<string, string> = {};
  for (const delta of artifact.modeDeltas ?? []) {
    for (const [name, value] of Object.entries(delta.variables)) {
      modeChannels[`${delta.mode}:${name}`] = value;
    }
  }
  return {
    variables: artifact.variables as Record<string, string>,
    modeChannels,
    anatomy: tenantThemeAnatomyAttributes(artifact),
    normalized: JSON.stringify(artifact.normalizedAppearance),
  };
}

/** Drops the `mode:` prefix a delta channel carries, leaving the channel name. */
const channelName = (key: string): string => key.slice(key.indexOf(':') + 1);

const compileStatic = (theme: FlatTheme): Record<string, string> =>
  lowerFlatThemeFixture({ flatTheme: theme, tenantSlug: 'propagation-probe' })
    .cssVariables;

function changedKeys(
  before: Record<string, string>,
  after: Record<string, string>
): string[] {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  return [...keys].filter((key) => before[key] !== after[key]).sort();
}

/**
 * The leaf paths a mutator actually wrote, by diffing before against after.
 *
 * Deep rather than shallow, because a mutator that rewrites a container and a
 * mutator that writes a leaf are the same edit from the outside and only one of
 * them is at the keypath.
 */
function writtenLeaves(
  before: unknown,
  after: unknown,
  prefix = ''
): string[] {
  if (before === after) return [];
  const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);
  // A branch that did not exist before is still DESCENDED into: a mutator that
  // creates `responsive` wholesale wrote `responsive.posture`, and reporting
  // the container instead would have accused it of missing its own door.
  if (!isRecord(before) && !isRecord(after)) return prefix ? [prefix] : [];
  const left = isRecord(before) ? before : {};
  const right = isRecord(after) ? after : {};
  const written: string[] = [];
  for (const key of new Set([...Object.keys(left), ...Object.keys(right)])) {
    written.push(...writtenLeaves(left[key], right[key], prefix ? `${prefix}.${key}` : key));
  }
  return written;
}

/**
 * A catalog keypath expanded into the prefixes a write may legally land under.
 *
 * `chrome.{cardComponent,table,sidebar,layout}.anatomy` is four keypaths written
 * once, and `modes.dark.palette.*` is a subtree. Both spellings are the
 * catalog's, so both are read here rather than normalised away in the catalog.
 */
export function keypathPrefixes(keypath: string | null): string[] {
  if (!keypath) return [];
  const braced = keypath.match(/\{([^}]*)\}/u);
  const expanded = braced
    ? braced[1].split(',').map((option) => keypath.replace(/\{[^}]*\}/u, option.trim()))
    : [keypath];
  return expanded.map((path) => path.replace(/\.\*$/u, ''));
}

const under = (leaf: string, prefixes: readonly string[]): boolean =>
  prefixes.some((prefix) => leaf === prefix || leaf.startsWith(`${prefix}.`));

/**
 * THE ANTI-F-72 LAW, and the durable half of this file.
 *
 * F-72 found two mutators probing a door that is not the control's: this suite
 * wrote `surfaces.shadows.md` for `surfaces.elevation-posture` and
 * `chrome.sidebar.bg` for `navigation.sidebar-tone`. Both moved channels, both
 * passed every assertion, and neither said anything about the control -- the
 * first proved that authoring a shadow paints a shadow.
 *
 * Fixing the two is worth little on its own; what closes the class is that a
 * mutator must now write UNDER the catalog's own declared keypath for its row,
 * and the comparison is mechanical. A future mutator aimed at the wrong door
 * fails here before it can report a false green.
 */
describe('capability propagation — every mutator probes the control own door (F-72)', () => {
  const catalogById = new Map(THEME_CONTROL_CATALOG.map((row) => [row.id as string, row]));

  for (const capability of ACTIVE) {
    const row = catalogById.get(capability.id);
    const mutators = MUTATORS[capability.id];
    if (!row || !mutators) continue;

    if (mutators.static) {
      it(`${capability.id}: the static mutator writes its own keypath.brandTheme`, () => {
        const prefixes = keypathPrefixes(row.keypath.brandTheme);
        expect(prefixes.length, `${capability.id} has a static mutator and no brandTheme keypath`)
          .toBeGreaterThan(0);
        const base = clone(bithireFlatTheme) as FlatTheme;
        const written = writtenLeaves(base, mutators.static!(clone(base)));
        expect(written.length, 'the mutator changed nothing at all').toBeGreaterThan(0);
        expect(
          written.filter((leaf) => under(leaf, prefixes)),
          `${capability.id} wrote ${written.join(', ')}; its declared door is ${prefixes.join(' | ')}`,
        ).not.toEqual([]);
      });
    }

    if (mutators.db) {
      it(`${capability.id}: the DB mutator writes its own keypath.document`, () => {
        // The catalog states the document keypath in its v1 projection spelling
        // (`appearance.general.…`); the v1 document object this suite authors
        // spells the same place `visualFoundation.…`. The alias is applied here,
        // once, rather than a second keypath being invented in the catalog.
        const prefixes = keypathPrefixes(row.keypath.document)
          .map((path) => path.replace(/^appearance\./u, 'visualFoundation.'));
        expect(prefixes.length, `${capability.id} has a DB mutator and no document keypath`)
          .toBeGreaterThan(0);
        const base = clone(BASE_DOC);
        const written = writtenLeaves(base, mutators.db!(clone(base)));
        expect(written.length, 'the mutator changed nothing at all').toBeGreaterThan(0);
        expect(
          written.filter((leaf) => under(leaf, prefixes)),
          `${capability.id} wrote ${written.join(', ')}; its declared door is ${prefixes.join(' | ')}`,
        ).not.toEqual([]);
      });
    }
  }

  it('the keypath matcher refuses a near miss', () => {
    expect(under('surfaces.shadows.md', keypathPrefixes('surfaces.elevation'))).toBe(false);
    expect(under('surfaces.elevation', keypathPrefixes('surfaces.elevation'))).toBe(true);
    expect(under('chrome.sidebar.bg', keypathPrefixes('chrome.sidebar.tone'))).toBe(false);
    expect(under('chrome.sidebar.tone', keypathPrefixes('chrome.sidebar.tone'))).toBe(true);
    expect(under('chrome.table.anatomy', keypathPrefixes('chrome.{cardComponent,table}.anatomy'))).toBe(true);
    expect(under('modes.dark.palette.primaryColor', keypathPrefixes('modes.dark.palette.*'))).toBe(true);
    expect(under('modes.light.palette.primaryColor', keypathPrefixes('modes.dark.palette.*'))).toBe(false);
  });
});

describe('capability propagation — every remaining static gap has a measured reason', () => {
  it('names a cause for each uncovered capability, and none for a covered one', () => {
    for (const [id, reason] of Object.entries(STATIC_UNCOVERED_REASONS)) {
      expect(reason.length, `${id}: the reason is a placeholder`).toBeGreaterThan(60);
      expect(MUTATORS[id]?.static, `${id} is ledgered as uncovered and has a static mutator`).toBeUndefined();
    }
  });
});

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

      const channels = [
        ...changedKeys(baseline.variables, mutated.variables),
        ...changedKeys(baseline.modeChannels, mutated.modeChannels),
      ];
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

const catalogEffectById = new Map(
  THEME_CONTROL_CATALOG.map((row) => [row.id as string, row.effect as string])
);

describe('static path — an authored change reaches the compiled brand', () => {
  it('moves at least one channel for every capability with a static mutator', () => {
    const baseline = compileStatic(clone(bithireFlatTheme) as FlatTheme);
    const inert: string[] = [];

    for (const capability of ACTIVE) {
      const mutate = MUTATORS[capability.id]?.static;
      if (!mutate) continue;
      // A data-only capability moves an attribute or a runtime block, never a
      // channel, so the channel law has no subject for it. Read off the
      // CATALOG's own `effect`, never off an id list, so a fourth data-only
      // row is excluded here for the same stated reason.
      if (catalogEffectById.get(capability.id) === 'data-only') continue;
      const mutated = compileStatic(mutate(clone(bithireFlatTheme) as FlatTheme));
      if (changedKeys(baseline, mutated).length === 0) inert.push(capability.id);
    }

    expect(inert).toEqual([]);
  });
});

describe('consumer reachability — the moved channel is read by production', () => {
  it('closes the loop for the ledgered capabilities', () => {
    const baseline = compileDb(clone(BASE_DOC));
    const staticBaseline = compileStatic(clone(bithireFlatTheme) as FlatTheme);
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
        changedKeys(baseline.modeChannels, mutated.modeChannels).forEach((k) =>
          moved.add(channelName(k))
        );
      }
      if (mutators.static) {
        const mutated = compileStatic(
          mutators.static(clone(bithireFlatTheme) as FlatTheme)
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

    // Root block only, deliberately: this control is about two CLEAR-scheme
    // dials owning disjoint territory, and folding the dark deltas in would
    // compare a light channel against a dark one of the same name.
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
