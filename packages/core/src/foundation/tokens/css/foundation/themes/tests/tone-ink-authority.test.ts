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
 *  (bithire's warning is #D6A04E, platform's #F59E0B, evnto's #A16207) and a
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
 *    platform  --ds-color-neutral-900 #171717 -> #ECECEC   (dark-authored)
 *
 *  and the SAME probe run against the pre-P1 bundles from git returned every
 *  one of those values byte-identically, which is the no-loss proof for the
 *  absorption itself. That run is recorded here rather than automated: browser
 *  truth belongs to the Codex visual pass, and this suite must stay runnable
 *  without a browser. Re-run it by hand if the mixes or the neutral ramp move.
 *
 *  Two traps that cost real time and are worth leaving written down. First, a
 *  probe that stamps `data-vertical="platform"` and only toggles `data-theme`
 *  ON/absent measures nothing: platform is a DARK-authored vertical whose block
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
} from '@/tooling/quality/no-loss';

const HERE = dirname(fileURLToPath(import.meta.url));
const THEME_CSS = readFileSync(resolve(HERE, '../default.css'), 'utf8');

/**
 * The pre-authority mixes, per vertical, exactly as callout.css resolved them
 * before P1. Recorded as literals so this file is the baseline: if the seeds or
 * the mix ratios move, this goes red rather than re-deriving to agree.
 */
const EXPECTED_LIGHT = {
  bithire: {
    '--ds-color-info-ink': '#3A6FB0',
    '--ds-color-warning-ink': 'color-mix(in srgb, #D6A04E 55%, #171717 45%)',
    '--ds-color-error-ink': 'color-mix(in srgb, #C5504C 78%, #171717 22%)',
    '--ds-color-success-ink': 'color-mix(in srgb, #327CA8 60%, #171717 40%)',
  },
  platform: {
    '--ds-color-info-ink': '#3B82F6',
    '--ds-color-warning-ink': 'color-mix(in srgb, #F59E0B 55%, #171717 45%)',
    '--ds-color-error-ink': 'color-mix(in srgb, #EF4444 78%, #171717 22%)',
    '--ds-color-success-ink': 'color-mix(in srgb, #22C55E 60%, #171717 40%)',
  },
  evnto: {
    '--ds-color-info-ink': '#475569',
    '--ds-color-warning-ink': 'color-mix(in srgb, #A16207 55%, #171717 45%)',
    '--ds-color-error-ink': 'color-mix(in srgb, #B91C1C 78%, #171717 22%)',
    '--ds-color-success-ink': 'color-mix(in srgb, #15803D 60%, #171717 40%)',
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
    // The authority is a DERIVATION over tenant channels, so the three bundles
    // must disagree. Identical values across verticals would mean the mix had
    // been flattened to a constant — the exact failure --ds-color-on-{tone}
    // already represents.
    const warnings = Object.values(SHIPPED_BUNDLES).map((path) =>
      resolveChannel(loadBundle(path), '--ds-color-warning-ink')
    );
    expect(new Set(warnings).size).toBe(3);
  });

  it('is actually consumed by both AUT-1 twins in the shipped bundles', () => {
    // A minted authority nobody reads is not an absorption. Both former
    // prototokens must now read it out of the real bundle.
    for (const path of Object.values(SHIPPED_BUNDLES)) {
      expect(hasConsumer(path, '--ds-color-warning-ink'), path).toBe(true);
      expect(hasConsumer(path, '--ds-color-error-ink'), path).toBe(true);
      expect(hasConsumer(path, '--ds-color-success-ink'), path).toBe(true);
      const text = readFileSync(resolve(HERE, '../../../../../../..', path), 'utf8');
      // The callout relay and the tag-input rejection ink are the two twins.
      expect(text).toContain('--_ds-callout-tone-ink');
      expect(text).toContain('--_ds-tag-input-rejected-ink');
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
    const bundle = loadBundle(SHIPPED_BUNDLES.platform);
    expect(resolveChannel(bundle, '--ds-color-on-warning')).toBe('#171717');
    expect(resolveChannel(bundle, '--ds-color-warning-ink')).not.toBe('#171717');
  });
});
