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
    expect(css('foundation/themes/default.css')).toContain(
      '--ds-touch-target-min: 44px'
    );
    for (const skin of [
      'runtime/engines/modern/skin/button.css',
      'runtime/engines/modern/skin/input.css',
      'runtime/engines/modern/skin/select.css',
      'runtime/engines/modern/skin/menu.css',
    ]) {
      const content = css(skin);
      expect(content, skin).toMatch(/pointer:\s*coarse/);
      expect(content, skin).toContain('--ds-touch-target-min');
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
