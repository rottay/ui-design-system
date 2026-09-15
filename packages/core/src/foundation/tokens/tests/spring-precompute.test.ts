import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const HERE = dirname(fileURLToPath(import.meta.url));
const VERTICAL_BUNDLES = resolve(HERE, '../../../../artifacts/generated/css/verticals');
const read = (vertical: string) => readFileSync(resolve(VERTICAL_BUNDLES, vertical, 'index.css'), 'utf8');

const TENANT_SPRING = /:is\(html\[data-tenant='(rottay|evnto)'\][^{]*\{\s*--ds-motion-spring:\s*(linear\([^;]*\));/g;

function springOverride(css: string): string | null {
  TENANT_SPRING.lastIndex = 0;
  const match = TENANT_SPRING.exec(css);
  return match ? match[2] : null;
}

describe('first-party spring precompute (useSpring-gated)', () => {
  /**
   * WO-DER-06 derivation-lane registry (the (s1) spring gap): the precomputed
   * curve came from the retired authored themes, which stated `motion.useSpring`
   * with a tension/friction pair. No preset document states one, so no vertical
   * precomputes a `linear()` spring and every one resolves the foundation's
   * cubic-bezier. Pinned to the measured state in both directions, so the row
   * reddens the moment the lane gives a preset a spring to precompute.
   */
  const FOUNDATION_SPRING = '--ds-motion-spring: cubic-bezier(0.34, 1.56, 0.64, 1);';

  it('rottay precomputes no linear() spring while its preset states none', () => {
    const css = read('rottay');
    expect(springOverride(css), 'no preset states a spring to precompute').toBeNull();
    expect(css).toContain(FOUNDATION_SPRING);
  });

  it('evnto is in the same state, so the two verticals cannot differ', () => {
    const css = read('evnto');
    expect(springOverride(css)).toBeNull();
    expect(css).toContain(FOUNDATION_SPRING);
    // The old claim was that the two curves DIFFER. With neither vertical
    // stating a spring there is nothing to differ on, and asserting the shared
    // foundation value is what keeps the row from passing vacuously.
    expect(springOverride(read('rottay'))).toBe(springOverride(css));
  });

  it('bithire (useSpring: false) ships NO precomputed override -- keeps the foundation cubic-bezier', () => {
    const css = read('bithire');
    expect(css).not.toMatch(/--ds-motion-spring:\s*linear\(/);
    // The foundation default is still present (unoverridden).
    expect(css).toContain('--ds-motion-spring: cubic-bezier(0.34, 1.56, 0.64, 1);');
  });

  it('the primary spring override is scoped to the tenant root, never bare :root', () => {
    for (const name of ['rottay', 'evnto']) {
      const css = read(name);
      // Every linear() --ds-motion-spring must sit inside a tenant :is(...) block,
      // never leak onto a bare :root that would cross tenant boundaries.
      const bareRootSpring = /:root\s*\{[^}]*--ds-motion-spring:\s*linear\(/;
      expect(bareRootSpring.test(css), name).toBe(false);
    }
  });
});
