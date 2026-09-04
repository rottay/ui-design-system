/**
 * TENANT-COLOR PROPAGATION — how far a seed actually reaches.
 *
 * The product rule is that a tenant's colors come from the tenant. That claim
 * is only worth something if changing a seed reaches the channels the UI
 * paints with. The failure mode is not a crash: the compiler keeps compiling,
 * the artifact keeps regenerating, the primary ramp moves — and the button
 * that is supposed to BE the primary color does not, because its value was
 * pinned somewhere upstream. The tenant appears customizable and is not.
 *
 * That WAS the state of this system: a changed `primaryColor` moved the ramp
 * and essentially nothing else, and the gap was pinned here as a named
 * KNOWN_INERT inventory that had to go red when it closed.
 *
 * It has largely closed. `foundation/css/color-math/palette-derivations` derives the
 * semantic defaults — button primary chrome, the focused-control treatment,
 * the control and card grounds — from the palette seeds, and both compile
 * paths merge it UNDER their authored layers. So the assertions below are
 * inverted from the original: they assert propagation, on the path where
 * propagation is the correct expectation.
 *
 * Which path that is matters, and is the whole design:
 *
 *   • On a theme that AUTHORS its chrome (bithire, evnto, rottay), the derived
 *     default loses and the authored value stands. Button chrome staying put
 *     when bithire's seed moves is not a defect — it is the merge order doing
 *     its job, and it is what keeps the three shipped artifacts pixel-identical.
 *   • On a theme that authors nothing but a palette — the white-label case the
 *     product rule is actually about — the seeds now reach.
 *
 * Both are pinned. The residue that is still unreachable is a much shorter,
 * explicitly-reasoned STOPPED list rather than five whole families.
 *
 * `--ds-color-border-focus`, `--ds-color-link` and `--ds-color-link-hover`
 * moved from that STOPPED residue into the pinned-and-reachable side in this
 * revision: they are now derived by the shared `deriveInteractionFloor`
 * (`../../../foundation/css/color-math/interaction-floor`), the one
 * remaining author of that floor now that the competing retired-branding
 * emitter which used to force this compiler to defer to it is retired. See
 * "one channel, one author" below.
 */
import { describe, expect, it } from 'vitest';

import { bithireBrandTheme } from '@/foundation/tokens/ts/presentation/brand-themes/bithire';
import {
  compileTenantThemeConfig,
  getTenantThemeVerticalEnvelope,
  hydrateTenantThemeConfig,
} from '@/infrastructure/compilers/composition/tenant-theme';
import type { BrandTheme } from '@/foundation/contracts/composition/tenants/themes';

import { lowerBrandThemeFixture } from "@tests/support/theme-lowering";

/** Hues far from bithire's blues, so no derived step lands unchanged by luck. */
const NEW_PRIMARY = '#B4322A';
const NEW_BACKGROUND = '#FFF7E8';

const compile = (brandTheme: BrandTheme) =>
  lowerBrandThemeFixture({ brandTheme, tenantSlug: 'bithire' }).cssVariables;

const withPalette = (patch: Record<string, string>): BrandTheme => ({
  ...bithireBrandTheme,
  palette: { ...bithireBrandTheme.palette!, ...patch },
});

const BASE = compile(bithireBrandTheme);

function movedBetween(
  before: Record<string, string>,
  after: Record<string, string>
): string[] {
  return Object.keys(after)
    .filter((channel) => after[channel] !== before[channel])
    .sort();
}

const PRIMARY_MOVED = movedBetween(BASE, compile(withPalette({ primaryColor: NEW_PRIMARY })));
const BACKGROUND_MOVED = movedBetween(
  BASE,
  compile(withPalette({ backgroundColor: NEW_BACKGROUND }))
);

// ── the DB path, seeded the way a customer seeds it ─────

function dbVariables(palette: Record<string, string>): Record<string, string> {
  return compileTenantThemeConfig(
    hydrateTenantThemeConfig(
      {
        schemaVersion: 1,
        mode: 'simple',
        appearance: { palette, density: 'normal' },
      },
      { tenantId: 'tenant_propagation', slug: 'probe', verticalKey: 'bithire', rowVersion: 1 }
    ),
    { verticalEnvelope: getTenantThemeVerticalEnvelope('bithire')! }
  ).variables;
}

const DB_SEED = { primary: '#3A6FB0', secondary: '#5B7C99', accent: '#6f92b0' };
const DB_PRIMARY_MOVED = movedBetween(
  dbVariables(DB_SEED),
  dbVariables({ ...DB_SEED, primary: NEW_PRIMARY })
);
const DB_BACKGROUND_MOVED = movedBetween(
  dbVariables({ ...DB_SEED, background: '#F4F8FB' }),
  dbVariables({ ...DB_SEED, background: NEW_BACKGROUND })
);

// ── families ────────────────────────────────────────────

const FAMILIES: Record<string, (channel: string) => boolean> = {
  'primary ramp': (channel) => /^--ds-color-primary(-\d+)?$/.test(channel),
  'chart series': (channel) => channel.startsWith('--ds-chart-series-'),
  grounds: (channel) =>
    channel === '--ds-color-background' || /^--ds-color-bg(-|$)/.test(channel),
  'button primary chrome': (channel) => channel.startsWith('--ds-button-primary-'),
  'focus ring': (channel) => channel.includes('focus-ring'),
  links: (channel) => channel.includes('-link'),
  cards: (channel) => channel.includes('-card'),
  inputs: (channel) => channel.includes('-input'),
};

const count = (channels: string[], family: string) =>
  channels.filter(FAMILIES[family]).length;

// ── the minimal tenant: a palette and nothing else ──────

/**
 * The white-label case the product rule is about: no chrome, no surfaces, no
 * artifact extension — just the two seeds a customer actually sets. Anything
 * this theme paints with, it paints with BECAUSE of a derivation, so it is the
 * only honest place to measure reach.
 */
const MINIMAL: BrandTheme = {
  id: 'minimal',
  name: 'Minimal',
  palette: { primaryColor: '#3A6FB0', backgroundColor: '#F4F8FB' },
} as BrandTheme;

const minimal = (patch: Record<string, string>) =>
  lowerBrandThemeFixture({
    brandTheme: { ...MINIMAL, palette: { ...MINIMAL.palette!, ...patch } },
    tenantSlug: 'minimal',
  }).cssVariables;

const MINIMAL_BASE = minimal({});
const MINIMAL_PRIMARY_MOVED = movedBetween(
  MINIMAL_BASE,
  minimal({ primaryColor: NEW_PRIMARY })
);
const MINIMAL_BACKGROUND_MOVED = movedBetween(
  MINIMAL_BASE,
  minimal({ backgroundColor: NEW_BACKGROUND })
);

/**
 * Channels that track a seed WITHOUT their own text changing.
 *
 * A derived default is emitted as a `var()` chain wherever its value simply IS
 * a seed — deliberately, so the value stays mode-invariant and the compiled
 * mode block does not duplicate it at a specificity that would outrank an
 * artifact extension. Such a channel propagates perfectly and moves zero
 * characters, so textual diffing alone reports it as frozen. Reach follows the
 * chains: a channel counts when its own value moved, or when it resolves
 * through a channel that did.
 */
function reachFrom(
  variables: Record<string, string>,
  moved: string[]
): string[] {
  const reached = new Set(moved);
  for (let pass = 0; pass < REACH_MAX_DEPTH; pass += 1) {
    for (const [channel, value] of Object.entries(variables)) {
      if (reached.has(channel)) continue;
      for (const reference of value.matchAll(/var\(\s*(--[a-z0-9-]+)/g)) {
        if (reached.has(reference[1])) {
          reached.add(channel);
          break;
        }
      }
    }
  }
  return [...reached].sort();
}

/** Longest alias chain the derivation builds is 2 hops; 6 is slack, not a guess. */
const REACH_MAX_DEPTH = 6;

const MINIMAL_PRIMARY_REACH = reachFrom(
  minimal({ primaryColor: NEW_PRIMARY }),
  MINIMAL_PRIMARY_MOVED
);
const MINIMAL_BACKGROUND_REACH = reachFrom(
  minimal({ backgroundColor: NEW_BACKGROUND }),
  MINIMAL_BACKGROUND_MOVED
);

describe('TENANT-COLOR PROPAGATION · the reach a seed has today', () => {
  it('a new primary moves the whole primary ramp on every path', () => {
    // 11 channels: the ten ramp steps plus the resolved `--ds-color-primary`.
    expect(count(PRIMARY_MOVED, 'primary ramp')).toBeGreaterThanOrEqual(11);
    expect(count(DB_PRIMARY_MOVED, 'primary ramp')).toBeGreaterThanOrEqual(11);
  });

  it('a new primary re-seeds the categorical chart palette on the DB path', () => {
    expect(count(DB_PRIMARY_MOVED, 'chart series')).toBeGreaterThanOrEqual(10);
  });

  it('a new background moves the grounds', () => {
    // The first-party static theme authors a wider ground ladder. A DB
    // document is a delta over that vertical and therefore carries only the
    // three canonical aliases of the page ground it actually changed.
    expect(count(BACKGROUND_MOVED, 'grounds')).toBeGreaterThanOrEqual(3);
    expect(count(DB_BACKGROUND_MOVED, 'grounds')).toBeGreaterThanOrEqual(3);
  });

  it('a new background re-derives the tint steps of the other ramps', () => {
    // The ground is an input to every ramp derivation, so moving it must move
    // more than the three `--ds-color-bg-*` channels it literally names.
    const ramps = BACKGROUND_MOVED.filter((channel) =>
      /^--ds-color-(secondary|accent|success|warning|error|info)-\d+$/.test(channel)
    );
    expect(ramps.length).toBeGreaterThanOrEqual(20);
  });

  it('the totals are floors, not anecdotes', () => {
    // bithire's background floor rose 39 → 42 when the ground ladder started
    // deriving; its primary floor stays 11 because bithire authors the chrome
    // those channels would otherwise reach, which is the merge order working.
    expect(PRIMARY_MOVED.length).toBeGreaterThanOrEqual(11);
    expect(BACKGROUND_MOVED.length).toBeGreaterThanOrEqual(39);
    // Eleven primary channels + ten categorical chart slots.
    expect(DB_PRIMARY_MOVED.length).toBeGreaterThanOrEqual(21);
    expect(DB_BACKGROUND_MOVED.length).toBeGreaterThanOrEqual(25);
  });
});

/**
 * The families that used to be inert, and the seed each one now tracks.
 *
 * This list WAS `KNOWN_INERT_UNDER_PRIMARY` and asserted zero. It is the same
 * five names, inverted: each is now required to be reachable from the seed it
 * is semantically keyed to. Emptying the inventory by deleting it would have
 * lost the evidence, so the names stayed and the expectation flipped.
 *
 * `links` moved INTO this list in this revision. It used to be excluded and
 * pinned separately (see the "one channel, one author" describe block below)
 * because `--ds-color-link` already had an author: the retired-branding
 * emitter in the runtime tenant-CSS generator derived it from this same
 * primary seed, and the retired single-emitter assertion rejected two compiled paths
 * claiming the same light-block channel. That generator, and the emitter
 * inside it, are retired in full. The shared floor this compiler and the DB
 * appearance compiler both call (`deriveInteractionFloor`) is now the ONLY
 * author of `--ds-color-link` and `--ds-color-border-focus`, so the
 * conflict this family used to avoid no longer exists to avoid. `floor: 2`,
 * not 3 — the floor reaches `--ds-color-link` and `--ds-color-link-hover`,
 * but not `--ds-color-link-visited`, which nothing derives.
 *
 * `focus ring` remains absent, for the reason it always was: the two
 * channels that literally spell `focus-ring` are on the STOPPED list below,
 * because claiming them repaints bithire's and evnto's dark focus treatment.
 * The focused CONTROL still tracks the seed, through `--ds-input-border-focus`
 * and `--ds-input-shadow-focus`, which land in the `inputs` family —
 * capability covered, repaint not taken. (`--ds-color-border-focus` is a
 * DIFFERENT channel from anything spelling `focus-ring`, and IS covered — see
 * "one channel, one author" below.)
 */
const FORMERLY_INERT: readonly {
  family: string;
  seed: 'primary' | 'background';
  floor: number;
  /** Where the derivation is allowed to author it. See `cards` below. */
  paths: readonly ('static' | 'db')[];
}[] = [
  {
    family: 'button primary chrome',
    seed: 'primary',
    floor: 3,
    paths: ['static', 'db'],
  },
  { family: 'inputs', seed: 'primary', floor: 2, paths: ['static', 'db'] },
  // `--ds-color-link` and `--ds-color-link-hover`, from the shared
  // interaction floor. Scoped to `static` here because this suite only
  // proves DB-path presence, not DB-path novelty, for these two channels —
  // see "one channel, one author" below for why.
  { family: 'links', seed: 'primary', floor: 2, paths: ['static'] },
  // `cards` reaches its ground through `--ds-color-bg-elevated`. The DB path
  // emits that channel, so the chain closes there. The static path does not:
  // the three first-party themes still author their ground ladder as chrome
  // literals rather than as `palette.background*Color` seeds, so the alias is
  // emitted on both paths and only resolves to a derived value on the one that
  // owns the ground. Draining this means moving those literals onto the palette,
  // which is a repaint decision, not a mechanical one.
  { family: 'cards', seed: 'background', floor: 1, paths: ['db'] },
];

describe('TENANT-COLOR PROPAGATION · the reach a palette-only tenant has', () => {
  const expectFamiliesReached = (
    path: 'static' | 'db',
    primaryReach: string[],
    backgroundReach: string[]
  ) => {
    const wanted = FORMERLY_INERT.filter((entry) => entry.paths.includes(path));
    expect(wanted.length).toBeGreaterThan(0);
    const reached = wanted.map(({ family, seed, floor }) => ({
      family,
      ok:
        (seed === 'primary' ? primaryReach : backgroundReach).filter(
          FAMILIES[family]
        ).length >= floor,
    }));
    expect(reached).toEqual(wanted.map(({ family }) => ({ family, ok: true })));
  };

  it('every formerly-inert family now tracks its seed', () => {
    expectFamiliesReached(
      'static',
      MINIMAL_PRIMARY_REACH,
      MINIMAL_BACKGROUND_REACH
    );
  });

  it('the DB document remains a delta over the authored vertical', () => {
    // A customer patch does not erase bithire's authored chrome. The delta
    // contains seed-coupled families; unchanged authored component families
    // remain in the separately loaded vertical baseline.
    //
    // `button primary chrome` and `inputs` used to be listed here as families
    // the primary seed did NOT reach. That was the deferral, not the law: the
    // compiler could not tell the customer's `palette.primary` from bithire's
    // own leaf, so the leaf stood and these families went on pointing at a blue
    // the customer had replaced. Now that authorship is carried, a tenant's
    // seed re-derives the family it owns, and the reach is asserted as an exact
    // set rather than an emptiness.
    const seeded = { ...DB_SEED, background: '#F4F8FB' };
    const primaryReach = reachFrom(
      { ...BASE, ...dbVariables({ ...seeded, primary: NEW_PRIMARY }) },
      movedBetween(
        dbVariables(seeded),
        dbVariables({ ...seeded, primary: NEW_PRIMARY })
      )
    );
    const backgroundReach = reachFrom(
      dbVariables({ ...seeded, background: NEW_BACKGROUND }),
      DB_BACKGROUND_MOVED
    );
    expect(primaryReach.filter(FAMILIES['button primary chrome'])).toEqual([
      '--ds-button-primary-bg',
      '--ds-button-primary-bg-active',
      '--ds-button-primary-bg-hover',
      '--ds-button-primary-border',
    ]);
    expect(primaryReach.filter(FAMILIES.inputs)).toEqual([
      '--ds-input-border-focus',
      '--ds-input-caret-color',
      '--ds-input-shadow-focus',
    ]);
    // The background seed is a separate authority and gains nothing here: cards
    // still reach their ground through the alias chain, not through the primary
    // derivation. Keeping this emptiness pins that the two seeds stayed apart.
    expect(backgroundReach.filter(FAMILIES.cards)).toEqual([]);
    expect(count(primaryReach, 'primary ramp')).toBeGreaterThanOrEqual(11);
    expect(count(primaryReach, 'chart series')).toBeGreaterThanOrEqual(10);
    expect(count(backgroundReach, 'grounds')).toBeGreaterThanOrEqual(3);
  });

  it('the reach totals are floors, not anecdotes', () => {
    // Before the derivation: 16 and 14.
    // TODO(regenerate): 21 undercounts as of the interaction-floor wiring
    // (this file's "one channel, one author" section) -- `--ds-color-link`,
    // `--ds-color-link-hover`, `--ds-color-border-focus` and
    // `--ds-color-primary-foreground` are all now reachable from MINIMAL's
    // primary seed and were not before, so the true count is measurably
    // higher than 21. Left as the old literal (still a valid floor, since
    // `toBeGreaterThanOrEqual` only breaks on a DECREASE) rather than
    // guessed at; re-run this suite and replace with the observed value.
    expect(MINIMAL_PRIMARY_REACH.length).toBeGreaterThanOrEqual(21);
    expect(MINIMAL_BACKGROUND_REACH.length).toBeGreaterThanOrEqual(16);
  });
});

/**
 * Channels this compiler now derives directly -- and the reason the pin
 * flipped.
 *
 * These two used to be channels this compiler had to NOT derive, because
 * something else already did: the retired single-emitter assertion in the (now fully
 * retired) runtime tenant-CSS generator threw when a light-block channel had
 * two authors, and both were derived from the primary seed by that
 * generator's own retired-branding emitter. Retiring the competing emitter is
 * exactly the "first retire the other emitter" precondition the original pin
 * named as the only way this could ever change. It has changed: the shared
 * `deriveInteractionFloor` (used by both this compiler and the DB appearance
 * compiler) is the floor's one remaining author, so a palette-only theme now
 * gets these two channels directly from `compileTheme`, with no second
 * emitter left to collide with.
 */
const NOW_CLAIMED_BY_THIS_COMPILER = [
  '--ds-color-border-focus',
  '--ds-color-link',
] as const;

describe('TENANT-COLOR PROPAGATION · one channel, one author', () => {
  it('the derivation now claims these two channels directly -- the other emitter that used to own them is retired', () => {
    const claimed = NOW_CLAIMED_BY_THIS_COMPILER.filter(
      (channel) => channel in MINIMAL_BASE
    );
    expect(claimed).toEqual([...NOW_CLAIMED_BY_THIS_COMPILER]);
    // Pass-through: for an unauthored theme these restate the primary seed
    // verbatim (see `deriveInteractionFloor`'s file header for why).
    expect(MINIMAL_BASE['--ds-color-border-focus']).toBe(MINIMAL.palette!.primaryColor);
    expect(MINIMAL_BASE['--ds-color-link']).toBe(MINIMAL.palette!.primaryColor);
  });

  it('the DB delta carries these channels from the one author, at the tenant seed', () => {
    // This used to assert the two channels were ABSENT from the DB delta, on
    // the reasoning that they were unchanged. They were only ever "unchanged"
    // because the compiler could not see that the customer, not bithire, had
    // authored the seed they derive from; it kept the vertical's leaf and the
    // delta had nothing to carry. With authorship carried they move, so the
    // absence is gone. What the section is actually about survives intact and
    // is asserted directly: ONE author. The shared floor derives them from the
    // tenant's seed, the retired emitter contributes nothing, and no second
    // value competes.
    const seeded = { primary: '#B4322A', secondary: '#5B7C99', accent: '#6f92b0' };
    const delta = dbVariables(seeded);
    for (const channel of NOW_CLAIMED_BY_THIS_COMPILER) {
      // Pass-through, exactly as on the static path: the floor restates the
      // seed verbatim, so the emitted value IS the tenant's primary.
      expect({ channel, value: delta[channel] }).toEqual({
        channel,
        value: seeded.primary,
      });
      // ... and it is not the vertical's, which is what the old emitter would
      // have left standing here.
      expect(BASE[channel]).toBeTruthy();
      expect(delta[channel]).not.toBe(BASE[channel]);
    }
    expect(BASE['--ds-color-link']).toBe(bithireBrandTheme.palette!.linkColor);
  });
});

/**
 * Channels the derivation produces correctly and does NOT ship.
 *
 * Each one is a real repaint of a shipped vertical: adopting it changes what
 * bithire or evnto renders today, because their artifact extensions either
 * cover the channel in one mode only or do not cover it at all, so the derived
 * value would displace a DS default that is currently painting. The derivation
 * is not wrong; shipping it is a sighted-confirm decision, not a mechanical
 * one. The list is here so the remaining gap stays countable, and so that
 * claiming any of these turns this test RED in the same change.
 *
 * `--ds-color-link-hover` moved OUT of this list in this revision. It is one
 * of the four channels the shared interaction floor now derives directly
 * (see `NOW_CLAIMED_BY_THIS_COMPILER` above and
 * `extended-palette-floor.test.ts`), so it is claimed, not withheld.
 * `--ds-color-link-visited` stays — nothing derives it.
 */
const STOPPED_PENDING_SIGHTED_CONFIRM = [
  '--ds-button-primary-bg-active',
  '--ds-color-bg-canvas',
  '--ds-color-bg-overlay',
  '--ds-color-bg-surface',
  '--ds-color-interactive-bg-active',
  '--ds-color-interactive-bg-hover',
  '--ds-color-interactive-bg-muted',
  '--ds-color-interactive-border',
  '--ds-color-link-visited',
  '--ds-focus-ring-color',
  '--ds-overlay-bg',
  '--ds-shadow-focus-ring',
  '--ds-table-bg',
  '--ds-table-row-bg',
] as const;

const withheld = STOPPED_PENDING_SIGHTED_CONFIRM;

describe('TENANT-COLOR PROPAGATION · the reach still withheld', () => {
  it('no withheld channel is claimed by a palette-only compile', () => {
    const claimed = withheld.filter((channel) => channel in MINIMAL_BASE);
    expect(claimed).toEqual([]);
  });

  it('the shipped verticals still own every withheld channel they declare', () => {
    // The stop is about not DISPLACING authorship. Where bithire already
    // states one of these by hand, the compiler must leave it exactly there.
    for (const channel of withheld) {
      if (!(channel in BASE)) continue;
      expect({ channel, moved: PRIMARY_MOVED.includes(channel) }).toEqual({
        channel,
        moved: false,
      });
    }
  });
});

describe('TENANT-COLOR PROPAGATION · authored chrome outranks the derivation', () => {
  /**
   * The other half of the contract, and the reason the three shipped
   * artifacts did not move a pixel: a derived default is a DEFAULT. bithire
   * authors its button chrome, so its buttons keep the authored value even
   * though the derivation would have reached them.
   */
  it('a theme that authors a channel keeps its own value', () => {
    const authored = bithireBrandTheme.chrome?.controls?.buttonPrimary?.bg;
    expect(authored).toBeTruthy();
    expect(BASE['--ds-button-primary-bg']).toBe(authored);
    // …and the palette-only theme, authoring nothing, gets the derivation.
    expect(MINIMAL_BASE['--ds-button-primary-bg']).toBe('var(--ds-color-primary)');
  });

  it('the authored value does not follow the seed, and that is the point', () => {
    // A hand-authored literal is a tenant decision; the compiler must not
    // silently retune it when a different seed moves.
    expect(PRIMARY_MOVED).not.toContain('--ds-button-primary-bg');
    expect(MINIMAL_PRIMARY_REACH).toContain('--ds-button-primary-bg');
  });

  it('the same holds for the interaction floor: bithire authors border-focus/link/link-hover by hand, and they stay put', () => {
    // The three channels the shared floor would otherwise derive for these,
    // fixed literals in bithire's own default palette (see
    // extended-palette-floor.test.ts's "reaches real first-party output"
    // section for the authored-vs-derived split across all three tenants).
    const palette = bithireBrandTheme.palette!;
    expect(palette.borderFocusColor).toBeTruthy();
    expect(palette.linkColor).toBeTruthy();
    expect(palette.linkHoverColor).toBeTruthy();
    expect(BASE['--ds-color-border-focus']).toBe(palette.borderFocusColor);
    expect(BASE['--ds-color-link']).toBe(palette.linkColor);
    expect(BASE['--ds-color-link-hover']).toBe(palette.linkHoverColor);
    expect(PRIMARY_MOVED).not.toContain('--ds-color-border-focus');
    expect(PRIMARY_MOVED).not.toContain('--ds-color-link');
    expect(PRIMARY_MOVED).not.toContain('--ds-color-link-hover');
    // …while the palette-only theme, authoring none of the three, gets them
    // from the floor and DOES track a primary edit.
    expect(MINIMAL_PRIMARY_REACH).toContain('--ds-color-border-focus');
    expect(MINIMAL_PRIMARY_REACH).toContain('--ds-color-link');
    expect(MINIMAL_PRIMARY_REACH).toContain('--ds-color-link-hover');
  });
});
