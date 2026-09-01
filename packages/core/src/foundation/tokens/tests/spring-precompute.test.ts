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
  it('rottay (useSpring: true) ships a precomputed linear() --ds-motion-spring', () => {
    const spring = springOverride(read('rottay'));
    expect(spring, 'expected a tenant-scoped linear() spring override').not.toBeNull();
    expect(spring).toMatch(/^linear\(0,/);
  });

  it('evnto (useSpring: true) ships its own distinct linear() curve', () => {
    const evnto = springOverride(read('evnto'));
    const rottay = springOverride(read('rottay'));
    expect(evnto).not.toBeNull();
    // evnto tunes a bouncier spring (tension 200 / friction 18) than Rottay
    // (170 / 26), so the curves differ.
    expect(evnto).not.toBe(rottay);
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
