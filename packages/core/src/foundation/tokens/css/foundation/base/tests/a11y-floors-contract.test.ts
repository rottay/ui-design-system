/**
 * C2b executable-floors contract: the a11y floors are enforced in shipped
 * CSS and in the compile path — not merely declared as constants. Each case
 * pairs the positive property with the drill that proves it bites.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  buildCascade,
  collectDeclarations,
  collectTouchReads,
  reachesFloor,
} from '@checks/touch-target-floor/reach/index.mjs';

import { EXPRESSIVE_A11Y_FLOORS } from '@/foundation/tokens/ts/presentation/expressive-profiles';
import { clampExpressiveEdgeWidth } from '@/foundation/tokens/ts/presentation/expressive-profiles/expansion';
import { assertExpressiveEdgeWidthInvariant } from '@/infrastructure/compilers/composition/tenant-theme';

const CSS_ROOT = resolve(process.cwd(), 'src/foundation/tokens/css');

function css(path: string): string {
  return readFileSync(resolve(CSS_ROOT, path), 'utf8');
}

describe('touch-target floor (44px coarse pointer)', () => {
  /**
   * The corpus is the eight files that carry this floor, and each is judged in
   * its OWN cascade context. The retired private follower joined them into one
   * string and asked `.some()`, so `presentation/components/button`'s correct
   * `max(44px, 2.75rem)` absolved a bare `2.75rem` at `responsive/button` --
   * measured under WO-INV-03 Lot B. The mechanism now lives in
   * `scripts/check/touch-target-floor/reach`, shared with the pre-build
   * gate that measures the same law over the whole corpus plus the artifacts.
   */
  const CORPUS = [
    'foundation/themes/default/index.css',
    'presentation/components/button/index.css',
    'presentation/components/input/index.css',
    'presentation/components/select/index.css',
    'foundation/responsive/button/index.css',
    'runtime/engines/modern/skin/input/index.css',
    'runtime/engines/modern/skin/select/index.css',
    'runtime/engines/modern/skin/menu/index.css',
  ];
  const SKINS = CORPUS.filter((path) => path.startsWith('runtime/engines/modern/skin/'));
  const sources = () => CORPUS.map((path) => ({ name: path, content: css(path) }));
  const FLOOR = EXPRESSIVE_A11Y_FLOORS.touchTargetMinPx;

  it('declares the canonical channel as a physical pixel length', () => {
    // One law, one spelling. `2.75rem` was an accepted alternative here and it
    // is 41.25px at this tree's 15px fluid root -- i.e. it never was the floor.
    expect(css('foundation/themes/default/index.css')).toContain(
      `--ds-touch-target-min: ${FLOOR}px`
    );
  });

  it('every channel a core control skin reads reaches the floor in its own context', () => {
    const cascade = buildCascade(collectDeclarations(sources()));
    const reads = collectTouchReads(sources().filter((source) => SKINS.includes(source.name)));
    // A corpus that stopped being read would report a clean tree.
    expect(reads.length).toBeGreaterThanOrEqual(3);
    for (const skin of SKINS) {
      expect(css(skin), skin).toMatch(/pointer:\s*coarse/);
      expect(reads.some((read) => read.file === skin), `${skin} reads no touch-target channel`).toBe(true);
    }
    for (const read of reads) {
      const verdict = reachesFloor(read.expression, cascade, FLOOR);
      expect(verdict.reached, `${read.file}:${read.line} — ${read.expression}: ${verdict.why}`).toBe(true);
    }
  });

  it('drill: a sibling file cannot absolve a wrong declaration in the coarse context', () => {
    // `responsive/button` declares the channel under `(pointer: coarse)`, the
    // site that governs; `presentation/components/button` declares it at base.
    const defected = sources().map((source) =>
      source.name === 'foundation/responsive/button/index.css'
        ? { ...source, content: source.content.replace('max(44px, 2.75rem)', '2.75rem') }
        : source
    );
    expect(
      defected.find((source) => source.name === 'foundation/responsive/button/index.css')!.content
    ).toContain('--ds-button-touch-target-min: 2.75rem');
    const cascade = buildCascade(collectDeclarations(defected));
    expect(reachesFloor('var(--ds-button-touch-target-min)', cascade, FLOOR).reached).toBe(false);
    // ...and the sibling is present and does carry the floor, so the refusal
    // above is per-context and not a corpus that went empty.
    const base = collectDeclarations(defected).filter(
      (row) =>
        row.channel === '--ds-button-touch-target-min' &&
        row.file === 'presentation/components/button/index.css'
    );
    expect(base).toHaveLength(1);
    expect(reachesFloor(base[0].value, buildCascade([]), FLOOR).reached).toBe(true);
  });

  it('drill: a declared channel is not rescued by its own read-site fallback', () => {
    const cascade = buildCascade(
      collectDeclarations([{ name: 'x.css', content: ':root { --ds-x-touch-target: 2.75rem; }' }])
    );
    expect(reachesFloor('var(--ds-x-touch-target, 44px)', cascade, FLOOR).reached).toBe(false);
    expect(reachesFloor('var(--ds-absent-touch-target, 44px)', cascade, FLOOR).reached).toBe(true);
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
