/**
 * AUT-1: the `--ds-color-{tone}-ink` authority (P1).
 *
 * This authority absorbed two prototokens that had been blocked for one exact
 * reason: the obvious successor, `--ds-color-on-{tone}`, is the ink-on-a-SOLID-
 * FILL axis — a flat `#171717` with NO dark override — so migrating onto it
 * would have flattened four distinct tone inks into one neutral and lost dark
 * mode. The minted authority is the different axis (ink over a tone-TINTED
 * WELL) and it carries the dark flip from day one.
 *
 * Two legs, because the claim has two halves and the harnesses cover one each:
 *
 *  LIGHT — `defaultIsUnchanged` per SHIPPED bundle. The values must be the
 *  pre-authority mixes byte-for-byte, resolved against each vertical's OWN tone
 *  seeds. Per bundle rather than once, because a tone seed differs per vertical
 *  (bithire's warning is #D6A04E, Rottay's #F59E0B, evnto's #A16207) and a
 *  value that holds in one bundle can move in another.
 *
 *  DARK — STRUCTURAL here, because the no-loss harness collects DEFAULT-state
 *  declarations only and excludes `[data-theme]` on purpose, so it cannot
 *  answer this leg. There is also deliberately no dark override to assert: the
 *  flip is produced by construction, since each mix references
 *  `var(--ds-color-neutral-900)`, which the dark block re-declares on the SAME
 *  element, and a custom property's computed value has its `var()` references
 *  already substituted. This leg therefore pins the CHAIN that produces the
 *  flip, and fails if a future edit breaks any link in it — including by
 *  "helpfully" hardcoding a dark override, which would silently fork the
 *  authority into two maintained values.
 *
 *  The construction argument was NOT left as an argument. It was confirmed by
 *  RESOLUTION in real Chromium (system Chrome via puppeteer, `getComputedStyle`
 *  on a mounted callout against each SHIPPED bundle), which is the only engine
 *  that actually evaluates `color-mix()` and the custom-property cascade:
 *
 *    DS base   --ds-color-neutral-900 #171717 -> #f8fafc
 *              warning icon  srgb(0.569 0.381 0.064) -> srgb(0.966 0.782 0.468)
 *    bithire   --ds-color-neutral-900 #191919 -> #c0cdd8   (light-authored)
 *    rottay    --ds-color-neutral-900 #171717 -> #ECECEC   (dark-authored)
 *
 *  and the SAME probe run against the pre-P1 bundles from git returned every
 *  one of those values byte-identically, which is the no-loss proof for the
 *  absorption itself. That run is recorded here rather than automated: browser
 *  truth belongs to the independent code audit visual pass, and this suite must stay runnable
 *  without a browser. Re-run it by hand if the mixes or the neutral ramp move.
 *
 *  Two traps that cost real time and are worth leaving written down. First, a
 *  probe that stamps `data-vertical="rottay"` and only toggles `data-theme`
 *  ON/absent measures nothing: Rottay is a DARK-authored vertical whose block
 *  applies under `:not([data-theme='light'])`, so it is active in both reads —
 *  compare explicit `light` vs `dark`, never `absent` vs `dark`. Second, the
 *  tag-input rejection border reads back as `oklab(...)` in dark because its
 *  flash is mid-transition when sampled; Chromium reports interpolated values
 *  in the interpolation space. It is identical before and after, so it carries
 *  no signal either way — the callout icon is the clean probe.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import {
  SHIPPED_BUNDLES,
  defaultIsUnchanged,
  hasConsumer,
  loadBundle,
  resolveChannel,
} from '@checks/tokens/cascade/preservation';

const HERE = dirname(fileURLToPath(import.meta.url));
const THEME_CSS = readFileSync(resolve(HERE, '../default/index.css'), 'utf8');

/**
 * The per-vertical mixes, recorded as literals so this file is the baseline: if
 * the seeds or the mix ratios move, this goes red rather than re-deriving to
 * agree.
 *
 * C0 re-anchor, and the shape of the move is the point. The pre-P1 table used
 * the DS default neutral `#171717` for all three verticals, which was true only
 * while no vertical authored its own. Two now do: bithire authors
 * `--ds-color-neutral-900: #191919`, and rottay -- a dark-DEFAULT vertical --
 * resolves the neutral partner to its own light ink `#ECECEC`, which is what an
 * ink-over-a-tinted-well mix must do when the well is dark. Rottay's info seed
 * likewise reads its own dark-block `#60A5FA` rather than the pre-P1 `#3B82F6`.
 * Evnto is byte-unchanged, which is the control: this is the derivation
 * following each vertical's channels, not a global constant moving. The ratio
 * of every mix (55/45, 78/22, 60/40) is identical to the pre-P1 table, so no
 * mix ratio moved -- and the `three distinct values` test below still proves
 * the authority did not flatten.
 */
/**
 * D6-2c-ii (2026-09-15): a first-party vertical is the neutral foundation plus
 * its preset document, so the operands moved with their source. bithire states
 * `palette.status-seeds`, so its mixes resolve against ITS OWN seeds (the
 * preset's, where the retired authored theme's used to be) over the
 * foundation's `--ds-color-neutral-900` (#171717, where bithire used to author
 * #191919). rottay and evnto are structural-neutral by owner scope and state no
 * status seeds, so both resolve against the foundation's. The authority is
 * unchanged: it is still a derivation over whatever tone seeds the vertical
 * states, which is what the anti-flattening row below measures.
 */
const EXPECTED_LIGHT = {
  bithire: {
    '--ds-color-info-ink': '#0369A1',
    '--ds-color-warning-ink': 'color-mix(in srgb, #B45309 55%, #171717 45%)',
    '--ds-color-error-ink': 'color-mix(in srgb, #C62828 78%, #171717 22%)',
    '--ds-color-success-ink': 'color-mix(in srgb, #16794A 60%, #171717 40%)',
  },
  // Lower case as the foundation declares it: the pin used to carry #60A5FA,
  // which was a casing difference only.
  rottay: {
    '--ds-color-info-ink': '#60a5fa',
    '--ds-color-warning-ink': 'color-mix(in srgb, #d97706 55%, #171717 45%)',
    '--ds-color-error-ink': 'color-mix(in srgb, #f87171 78%, #171717 22%)',
    '--ds-color-success-ink': 'color-mix(in srgb, #16a34a 60%, #171717 40%)',
  },
  evnto: {
    '--ds-color-info-ink': '#60a5fa',
    '--ds-color-warning-ink': 'color-mix(in srgb, #d97706 55%, #171717 45%)',
    '--ds-color-error-ink': 'color-mix(in srgb, #f87171 78%, #171717 22%)',
    '--ds-color-success-ink': 'color-mix(in srgb, #16a34a 60%, #171717 40%)',
  },
} as const;

const TONE_INKS = [
  '--ds-color-info-ink',
  '--ds-color-warning-ink',
  '--ds-color-error-ink',
  '--ds-color-success-ink',
] as const;

/** Body of the `:root[data-theme='dark']` rule in the theme source. */
function darkBlock(): string {
  const start = THEME_CSS.indexOf(":root[data-theme='dark']");
  expect(start, 'dark block must exist').toBeGreaterThan(-1);
  const open = THEME_CSS.indexOf('{', start);
  const end = THEME_CSS.indexOf('\n}', open);
  return THEME_CSS.slice(open, end);
}

describe('AUT-1 tone-ink authority — LIGHT leg (per shipped bundle)', () => {
  for (const [vertical, expected] of Object.entries(EXPECTED_LIGHT)) {
    it(`resolves every tone ink to its pre-authority mix in ${vertical}`, () => {
      const path = SHIPPED_BUNDLES[vertical as keyof typeof SHIPPED_BUNDLES];
      const bundle = loadBundle(path);
      for (const [channel, value] of Object.entries(expected)) {
        const drill = defaultIsUnchanged(bundle, channel, value);
        expect(drill.passed, drill.detail).toBe(true);
      }
    });
  }

  it('follows the vertical tone seeds instead of a frozen literal', () => {
    // The authority is a DERIVATION over the tone seeds a vertical states, so a
    // vertical that states them must NOT resolve to the foundation's value.
    // Flattening every bundle to one constant is the exact failure
    // --ds-color-on-{tone} already represents, and it would collapse this set
    // to a single member.
    const warningOf = (path: string) =>
      resolveChannel(loadBundle(path), '--ds-color-warning-ink');
    const bithire = warningOf(SHIPPED_BUNDLES.bithire);
    const rottay = warningOf(SHIPPED_BUNDLES.rottay);
    const evnto = warningOf(SHIPPED_BUNDLES.evnto);

    // bithire states `palette.status-seeds`, so its mix carries its own seed.
    expect(bithire).toContain('#B45309');
    expect(bithire).not.toBe(rottay);
    // rottay and evnto state none, so both derive from the foundation's seed --
    // the same value by construction, not a flattened constant.
    expect(rottay).toBe(evnto);
    expect(new Set([bithire, rottay, evnto]).size).toBe(2);
  });

  it('is actually consumed by both AUT-1 twins in the shipped bundles', () => {
    // A minted authority nobody reads is not an absorption. Both former
    // prototokens must now read it out of the real bundle.
    for (const path of Object.values(SHIPPED_BUNDLES)) {
      expect(hasConsumer(path, '--ds-color-warning-ink'), path).toBe(true);
      expect(hasConsumer(path, '--ds-color-error-ink'), path).toBe(true);
      expect(hasConsumer(path, '--ds-color-success-ink'), path).toBe(true);
      const text = readFileSync(resolve(HERE, '../../../../../../..', path), 'utf8');
      // The alert family relation (Callout folded into Alert) and the tag-input relation for its rejection ink are the two twins.
      expect(text).toContain('--ds-alert-warning-ink: var(--ds-color-warning-ink)');
      expect(text).toContain('--ds-tag-input-rejected-ink: var(--ds-color-warning-ink)');
    }
  });
});

describe('AUT-1 tone-ink authority — DARK leg (structural, by construction)', () => {
  it('mixes toward the neutral that the dark block re-declares', () => {
    // Link 1: each tinted ink is a mix toward --ds-color-neutral-900.
    for (const channel of TONE_INKS) {
      if (channel === '--ds-color-info-ink') continue; // raw hue by design
      const declaration = THEME_CSS.match(
        new RegExp(`${channel}:\\s*([^;]+);`)
      );
      expect(declaration, `${channel} must be declared`).not.toBeNull();
      expect(declaration![1]).toContain('var(--ds-color-neutral-900)');
    }
  });

  it('re-declares that neutral in the dark block, which is what flips the ink', () => {
    // Link 2: the neutral really does flip, on the same element.
    expect(THEME_CSS).toContain('--ds-color-neutral-900: #171717;');
    expect(darkBlock()).toContain('--ds-color-neutral-900: #f8fafc;');
  });

  it('does NOT hardcode a dark override for any tone ink', () => {
    // Link 3, and the regression this leg really guards: an explicit dark
    // override would either duplicate the derivation or silently repaint it,
    // and would decouple the ink from a future neutral-ramp change. The single
    // declaration is the authority.
    const dark = darkBlock();
    for (const channel of TONE_INKS) {
      expect(dark, `${channel} must not be re-declared in dark`).not.toContain(
        `${channel}:`
      );
    }
  });

  it('is a DIFFERENT axis from --ds-color-on-{tone}, which stays flat', () => {
    // The distinction that justifies the authority existing at all. If these
    // ever converge, one of the two is redundant and this should be revisited
    // deliberately rather than discovered.
    expect(THEME_CSS).toContain('--ds-color-on-warning: #171717;');
    expect(darkBlock()).not.toContain('--ds-color-on-warning:');
    const bundle = loadBundle(SHIPPED_BUNDLES.rottay);
    expect(resolveChannel(bundle, '--ds-color-on-warning')).toBe('#171717');
    expect(resolveChannel(bundle, '--ds-color-warning-ink')).not.toBe('#171717');
  });
});
