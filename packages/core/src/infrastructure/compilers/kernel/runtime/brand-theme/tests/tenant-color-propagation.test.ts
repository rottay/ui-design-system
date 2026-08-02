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
 * The drill closes the loop with EXTENSION-CANNOT-BEAT-TENANT: a channel that
 * stays frozen while its seed moves is exactly what a planted extension
 * re-declaration produces, and the shared detector in
 * `runtime/tenant-css/artifact-renderer/tests/support` is what flags it. One
 * mechanic, asserted from both directions.
 */
import postcss from 'postcss';
import { describe, expect, it } from 'vitest';

import { bithireBrandTheme } from '@/foundation/tokens/ts/presentation/brand-themes/bithire';
import {
  compileTenantThemeConfig,
  getTenantThemeVerticalEnvelope,
  hydrateTenantThemeConfig,
} from '@/infrastructure/compilers/composition/tenant-theme';
import {
  FIRST_PARTY_ARTIFACT_SPECS,
  renderFirstPartyArtifact,
} from '@/infrastructure/compilers/runtime/tenant-css';
import { generateTenantCss } from '@/infrastructure/compilers/runtime/tenant-css/visual-config';
import type { TenantConfig } from '@/foundation/contracts';
import {
  ruleRootStates,
  tenantOverrideConflicts,
} from '@/infrastructure/compilers/runtime/tenant-css/artifact-renderer/tests/support';
import type { BrandTheme } from '@/foundation/contracts/composition/tenants/themes';

import { compileBrandTheme } from '../index';

/** Hues far from bithire's blues, so no derived step lands unchanged by luck. */
const NEW_PRIMARY = '#B4322A';
const NEW_BACKGROUND = '#FFF7E8';

const compile = (brandTheme: BrandTheme) =>
  compileBrandTheme({ brandTheme, tenantSlug: 'bithire' }).cssVariables;

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
  compileBrandTheme({
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
    // Was 3 and 5: the page ground and its aliases. Now the whole ladder the
    // derivation builds off it — secondary, tertiary, elevated, input.
    expect(count(BACKGROUND_MOVED, 'grounds')).toBeGreaterThanOrEqual(3);
    expect(count(DB_BACKGROUND_MOVED, 'grounds')).toBeGreaterThanOrEqual(7);
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
    expect(DB_PRIMARY_MOVED.length).toBeGreaterThanOrEqual(22);
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
 * Two of the five names are absent, for two different and non-negotiable
 * reasons:
 *
 *   • `focus ring` — the two channels that literally spell `focus-ring` are on
 *     the STOPPED list below, because claiming them repaints bithire's and
 *     evnto's dark focus treatment. The focused CONTROL still tracks the seed,
 *     through `--ds-input-border-focus` and `--ds-input-shadow-focus`, which
 *     land in the `inputs` family — capability covered, repaint not taken.
 *   • `links` — `--ds-color-link` already has an author: the legacy-branding
 *     emitter in `runtime/tenant-css/visual-config` derives it from this same
 *     primary seed. Deriving it here too produced a two-author conflict that
 *     `assertSingleLightEmitter` rejects by design, so the competing emission
 *     was removed at ITS source rather than filtered at the merge. The family
 *     was never inert on the path that ships it; it was inert only in this
 *     compiler's own map. Pinned separately below.
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
  // `cards` reaches its ground through `--ds-color-bg-elevated`. The DB path
  // emits that channel, so the chain closes there. The static path does not —
  // all three first-party extensions author the ground ladder by hand, and a
  // compiled channel underneath an extension is precisely what
  // EXTENSION-CANNOT-BEAT-TENANT forbids. So the alias is emitted on both
  // paths and only resolves to a derived value on the one that owns the
  // ground. Draining this means moving those extension literals into
  // `palette.background*Color`, which is a repaint decision, not a mechanical one.
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

  it('the DB document path reaches the same families, and one more', () => {
    // Same derivation module, so neither path can invent its own vocabulary.
    const seeded = { ...DB_SEED, background: '#F4F8FB' };
    expectFamiliesReached(
      'db',
      reachFrom(
        dbVariables({ ...seeded, primary: NEW_PRIMARY }),
        movedBetween(
          dbVariables(seeded),
          dbVariables({ ...seeded, primary: NEW_PRIMARY })
        )
      ),
      reachFrom(dbVariables({ ...seeded, background: NEW_BACKGROUND }), DB_BACKGROUND_MOVED)
    );
  });

  it('the reach totals are floors, not anecdotes', () => {
    // Before the derivation: 16 and 14.
    expect(MINIMAL_PRIMARY_REACH.length).toBeGreaterThanOrEqual(21);
    expect(MINIMAL_BACKGROUND_REACH.length).toBeGreaterThanOrEqual(16);
  });
});

/**
 * Channels this compiler must NOT derive because something else already does.
 *
 * `assertSingleLightEmitter` in `runtime/tenant-css/visual-config` throws when
 * a light-block channel has two authors, and its message is explicit that the
 * fix is to remove the competing emission at its source rather than filter at
 * the merge. Both of these are derived from the primary seed by the
 * legacy-branding emitter, so this compiler deriving them too was a duplicate
 * author, not added reach. The pin exists so a future wave does not re-add
 * them without first retiring the other emitter.
 */
const OWNED_BY_ANOTHER_EMITTER = [
  '--ds-color-border-focus',
  '--ds-color-link',
] as const;

describe('TENANT-COLOR PROPAGATION · one channel, one author', () => {
  it('the derivation does not claim a channel another emitter owns', () => {
    const claimed = OWNED_BY_ANOTHER_EMITTER.filter(
      (channel) => channel in MINIMAL_BASE
    );
    expect(claimed).toEqual([]);
  });

  it('a palette-only tenant still gets those channels from the emitter that owns them', () => {
    // The capability is not lost by withholding it here — it is just authored
    // one tier down, where it already tracked the same seed.
    const css = generateTenantCss(
      {
        id: 'minimal',
        slug: 'minimal',
        name: 'Minimal',
        branding: { companyName: 'Minimal', primaryColor: '#B4322A' },
      } as unknown as TenantConfig,
      { includeDarkSelector: false }
    );
    for (const channel of OWNED_BY_ANOTHER_EMITTER) {
      expect({ channel, emitted: css.includes(`${channel}:`) }).toEqual({
        channel,
        emitted: true,
      });
    }
    expect(css).toContain('#B4322A');
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
  '--ds-color-link-hover',
  '--ds-color-link-visited',
  '--ds-focus-ring-color',
  '--ds-overlay-bg',
  '--ds-shadow-focus-ring',
  '--ds-table-bg',
  '--ds-table-row-bg',
] as const;

const withheld = [
  ...STOPPED_PENDING_SIGHTED_CONFIRM,
  ...OWNED_BY_ANOTHER_EMITTER,
];

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
});

describe('TENANT-COLOR PROPAGATION · a frozen channel is a detected override', () => {
  const spec = FIRST_PARTY_ARTIFACT_SPECS.find((candidate) => candidate.slug === 'bithire')!;
  const CLEAN_EXTENSION = '/* no extension authorship */\n';
  const VICTIM = '--ds-color-primary-500';

  const render = (brandTheme: BrandTheme, extensionCss: string) =>
    renderFirstPartyArtifact({ spec, brandTheme, extensionCss }).css;

  /**
   * The value the artifact serves in the DEFAULT state.
   *
   * Not simply the last declaration in the file: bithire's compiled dark mode
   * block comes after the base block and restates the same channels, so a
   * naive last-wins read reports the dark value and never moves when the light
   * seed does. Only rules that can author the default state compete for it.
   */
  const servedValue = (css: string, channel: string): string | undefined => {
    let value: string | undefined;
    postcss.parse(css).walkRules((rule) => {
      // postcss narrows `.parent` per node kind, so walking the chain with the
      // inferred type re-narrows on every hop; the walk only reads `type`.
      type CssAncestor = { type: string; parent?: CssAncestor };
      for (
        let parent = rule.parent as CssAncestor | undefined;
        parent;
        parent = parent.parent
      ) {
        if (parent.type === 'atrule') return;
      }
      if (!ruleRootStates(rule).has('default')) return;
      rule.walkDecls(channel, (decl) => {
        value = decl.value.trim();
      });
    });
    return value;
  };

  it('the victim is a channel that genuinely tracks its seed', () => {
    expect(PRIMARY_MOVED).toContain(VICTIM);
  });

  it('drill · an extension literal freezes it while the seed moves, and that is flagged', () => {
    const pinned = `html[data-tenant='bithire'] {\n  ${VICTIM}: #123456;\n}\n`;
    const before = render(bithireBrandTheme, pinned);
    const after = render(withPalette({ primaryColor: NEW_PRIMARY }), pinned);

    // The seed moved and the compiled block moved with it…
    expect(compile(withPalette({ primaryColor: NEW_PRIMARY }))[VICTIM]).not.toBe(BASE[VICTIM]);
    // …while the value the artifact actually serves is frozen at the literal.
    expect(servedValue(before, VICTIM)).toBe('#123456');
    expect(servedValue(after, VICTIM)).toBe('#123456');

    // And this is precisely what the shared detector calls a tenant override.
    expect(tenantOverrideConflicts(after)).toContain(VICTIM);
  });

  it('without the plant the same channel tracks its seed and is not flagged', () => {
    const before = render(bithireBrandTheme, CLEAN_EXTENSION);
    const after = render(withPalette({ primaryColor: NEW_PRIMARY }), CLEAN_EXTENSION);

    expect(servedValue(after, VICTIM)).not.toBe(servedValue(before, VICTIM));
    expect(tenantOverrideConflicts(after)).not.toContain(VICTIM);
  });
});
