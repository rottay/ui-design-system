/**
 * C2b executable-floors contract: the a11y floors are enforced in shipped
 * CSS and in the compile path — not merely declared as constants. Each case
 * pairs the positive property with the drill that proves it bites.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { EXPRESSIVE_A11Y_FLOORS } from '@/foundation/tokens/ts/presentation/expressive-profiles';
import { clampExpressiveEdgeWidth } from '@/foundation/tokens/ts/presentation/expressive-profiles/expansion';
import { assertExpressiveEdgeWidthInvariant } from '@/infrastructure/compilers/composition/tenant-theme';

const CSS_ROOT = resolve(process.cwd(), 'src/foundation/tokens/css');

function css(path: string): string {
  return readFileSync(resolve(CSS_ROOT, path), 'utf8');
}

describe('touch-target floor (44px coarse pointer)', () => {
  it('declares the canonical channel and enforces it in every core control skin', () => {
    expect(css('foundation/themes/default/index.css')).toContain(
      '--ds-touch-target-min: 44px'
    );
    // A skin may read the canonical root directly or a per-component channel
    // that resolves to it -- `button` reads only `--ds-button-touch-target-min`
    // now. Naming the root was never the floor; RESOLVING to it is, so every
    // channel a skin reads is followed to its declaration and required to carry
    // the 44px floor. A component channel declared at anything less would fail
    // here even though the old substring check would have passed it.
    const declarations = [
      css('foundation/themes/default/index.css'),
      css('presentation/components/button/index.css'),
      css('presentation/components/input/index.css'),
      css('presentation/components/select/index.css'),
      css('foundation/responsive/button/index.css'),
      css('runtime/engines/modern/skin/input/index.css'),
      css('runtime/engines/modern/skin/select/index.css'),
      css('runtime/engines/modern/skin/menu/index.css'),
    ].join('\n');
    const CANONICAL_FLOOR = /(?:44px|2\.75rem)/;
    for (const skin of [
      'runtime/engines/modern/skin/button/index.css',
      'runtime/engines/modern/skin/input/index.css',
      'runtime/engines/modern/skin/select/index.css',
      'runtime/engines/modern/skin/menu/index.css',
    ]) {
      const content = css(skin);
      expect(content, skin).toMatch(/pointer:\s*coarse/);
      const reads = [
        ...content.matchAll(/var\((--ds-[a-z-]*touch-target-min)\s*(,\s*[^)]+)?\)/g),
      ].map((match) => ({ channel: match[1], fallback: (match[2] ?? '').slice(1).trim() }));
      expect(reads.length, `${skin} reads no touch-target channel`).toBeGreaterThan(0);
      for (const { channel, fallback } of reads) {
        // Either the read carries the floor in place, or the channel it names
        // is declared somewhere in the cascade with the floor. One of the two,
        // never neither -- that is what makes the 44px reachable.
        if (CANONICAL_FLOOR.test(fallback)) continue;
        const declared = [
          ...declarations.matchAll(new RegExp(`${channel}:\\s*([^;]+);`, 'g')),
        ].map((match) => match[1].trim());
        expect(
          declared.length,
          `${channel} is read by ${skin} with no in-place floor and no declaration`
        ).toBeGreaterThan(0);
        for (const value of declared) {
          expect(value, `${channel} in ${skin}`).toMatch(CANONICAL_FLOOR);
        }
      }
    }
  });
});

describe('expressive edge-width cap', () => {
  it('clamps at emission (runtime invariant, not a constant)', () => {
    expect(clampExpressiveEdgeWidth('9px')).toBe(
      `${EXPRESSIVE_A11Y_FLOORS.edgeWidthMaxPx}px`
    );
    expect(clampExpressiveEdgeWidth('2px')).toBe('2px');
    expect(clampExpressiveEdgeWidth('var(--x)')).toBe('var(--x)');
  });

  it('drill: the compile-side guard rejects an oversized edge value fail-closed', () => {
    const issue = assertExpressiveEdgeWidthInvariant(
      '--ds-edge-emphasis-width',
      '9px'
    );
    expect(issue?.code).toBe('unsafe_value');
    expect(
      assertExpressiveEdgeWidthInvariant('--ds-edge-emphasis-width', '3px')
    ).toBeNull();
    // Non-edge channels are out of this invariant's jurisdiction.
    expect(
      assertExpressiveEdgeWidthInvariant('--ds-border-width-4', '4px')
    ).toBeNull();
  });

  it('C2c classification: structural widths pass, expressive component floors are capped', () => {
    // A sidebar track is a layout dimension — 240px is legitimate and the
    // cap must never block it.
    expect(
      assertExpressiveEdgeWidthInvariant('--ds-sidebar-width', '240px')
    ).toBeNull();
    // A component floor DERIVED from the edge grammar is expressive even
    // though its name never says "edge" — the classification list catches
    // what the regex cannot.
    expect(
      assertExpressiveEdgeWidthInvariant('--ds-table-header-rule-width', '9px')
        ?.code
    ).toBe('unsafe_value');
    expect(
      assertExpressiveEdgeWidthInvariant('--ds-menu-border-width', '2px')
    ).toBeNull();
  });
});
