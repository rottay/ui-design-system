/**
 * One z-index scale, one file (WO-CAN-05, closes the F-21 scale half).
 *
 * The `--ds-z-index-*` bands and the short `--ds-z-*` aliases used to be
 * declared in two places (`foundation/themes/default/index.css` carried the
 * numbers, `foundation/base/z-index/index.css` carried the derived aliases
 * under an empty "SCALE" header) and four short aliases were read by Modern
 * skins while being declared NOWHERE, so they painted from their own fallback
 * literals -- `--ds-z-notification` resolving to 1600, the POPOVER band, under
 * a popover it must outrank.
 *
 * This suite fixes three properties: exactly one source file declares the
 * namespace, every band is present there, and no read anywhere in the DS is
 * left undeclared. A compiled tenant artifact may still RAISE one band -- that
 * is the sanctioned override path, not a second scale.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const SRC_ROOT = resolve(process.cwd(), 'src');
const CSS_ROOT = resolve(SRC_ROOT, 'foundation/tokens/css');
const SCALE_OWNER = 'src/foundation/tokens/css/foundation/base/z-index/index.css';
const ARTIFACTS_DIR = resolve(CSS_ROOT, 'facade/artifacts');

const NAMESPACE = /--ds-z(?:-index)?-[a-z0-9-]+/g;
const DECLARATION = /(--ds-z(?:-index)?-[a-z0-9-]+)\s*:/g;
const READ = /var\(\s*(--ds-z(?:-index)?-[a-z0-9-]+)/g;

function walk(directory: string, out: string[] = []): string[] {
  for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) =>
    a.name < b.name ? -1 : a.name > b.name ? 1 : 0,
  )) {
    const full = join(directory, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (statSync(full).isFile()) out.push(full);
  }
  return out;
}

const SOURCES = walk(SRC_ROOT).filter(
  (file) =>
    (file.endsWith('.css') || file.endsWith('.ts') || file.endsWith('.tsx')) &&
    !file.includes('/tests/') &&
    !file.includes('.test.'),
);

const stripComments = (css: string): string => css.replace(/\/\*[\s\S]*?\*\//g, '');

function declarationsIn(file: string): string[] {
  return [...stripComments(readFileSync(file, 'utf8')).matchAll(DECLARATION)].map((m) => m[1]);
}

/** Every band the overlay families depend on, in stacking order. */
const CANONICAL_BANDS = [
  '--ds-z-index-base',
  '--ds-z-index-dropdown',
  '--ds-z-index-sticky',
  '--ds-z-index-fixed',
  '--ds-z-index-overlay',
  '--ds-z-index-drawer',
  '--ds-z-index-modal',
  '--ds-z-index-popover',
  '--ds-z-index-tooltip',
  '--ds-z-index-notification',
  '--ds-z-index-max',
] as const;

describe('one z-index scale', () => {
  it('is declared by exactly one source file', () => {
    const declaring = SOURCES.filter((file) => declarationsIn(file).length > 0)
      .map((file) => relative(process.cwd(), file))
      // A compiled tenant artifact overriding one band is the sanctioned path.
      .filter((file) => !file.startsWith(relative(process.cwd(), ARTIFACTS_DIR)));
    expect(declaring).toEqual([SCALE_OWNER]);
  });

  it('declares every canonical band, ordered bottom to top', () => {
    const owner = stripComments(readFileSync(resolve(process.cwd(), SCALE_OWNER), 'utf8'));
    const values = CANONICAL_BANDS.map((band) => {
      const match = owner.match(new RegExp(`${band}\\s*:\\s*(\\d+)\\s*;`));
      expect(match, `${band} must carry a literal band value`).not.toBeNull();
      return Number(match![1]);
    });
    expect(values).toEqual([...values].sort((a, b) => a - b));
    expect(new Set(values).size).toBe(values.length);
  });

  it('leaves no read of the namespace undeclared', () => {
    const declared = new Set(declarationsIn(resolve(process.cwd(), SCALE_OWNER)));
    const undeclared = new Set<string>();
    for (const file of SOURCES) {
      for (const match of stripComments(readFileSync(file, 'utf8')).matchAll(READ)) {
        if (!declared.has(match[1])) undeclared.add(match[1]);
      }
    }
    expect([...undeclared].sort()).toEqual([]);
  });

  it('sources the four formerly-undeclared aliases from the scale', () => {
    const owner = stripComments(readFileSync(resolve(process.cwd(), SCALE_OWNER), 'utf8'));
    // Each was read by a Modern skin and declared nowhere, so each painted
    // from its own fallback literal -- `--ds-z-notification` from 1600, the
    // POPOVER band, under a popover it must outrank.
    expect(owner).toContain('--ds-z-notification: var(--ds-z-index-notification, 1800);');
    expect(owner).toContain('--ds-z-message: var(--ds-z-index-message, 1790);');
    expect(owner).toContain('--ds-z-floatbutton: var(--ds-z-index-dropdown, 1000);');
    expect(owner).toContain('--ds-z-affix: var(--ds-z-index-affix, 100);');
    // Named literal steps, not calc(): the fallback-parity gate can only
    // compare a skin's fallback against a value it can resolve to a scalar.
    expect(owner).toContain('--ds-z-index-message: 1790;');
    expect(owner).toContain('--ds-z-index-affix: 100;');
  });

  it('keeps every Modern skin fallback equal to what the scale resolves', () => {
    const skinRoot = 'src/foundation/tokens/css/runtime/engines/modern/skin';
    expect(
      readFileSync(resolve(process.cwd(), `${skinRoot}/notification/index.css`), 'utf8'),
    ).toContain('z-index: var(--ds-z-notification, 1800);');
    expect(
      readFileSync(resolve(process.cwd(), `${skinRoot}/message/index.css`), 'utf8'),
    ).toContain('z-index: var(--ds-z-message, 1790);');
  });

  it('detects a planted second scale', () => {
    const planted = ':root { --ds-z-index-modal: 2500; }';
    expect([...stripComments(planted).matchAll(DECLARATION)].map((m) => m[1])).toEqual([
      '--ds-z-index-modal',
    ]);
    expect(NAMESPACE.test('--ds-z-index-modal')).toBe(true);
  });
});
