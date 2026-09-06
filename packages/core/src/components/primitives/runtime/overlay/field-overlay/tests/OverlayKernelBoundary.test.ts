/**
 * Overlay kernel boundary law (WO-CAN-05, closes F-21).
 *
 * Three mechanisms may exist in exactly ONE place, the overlay kernel under
 * `components/primitives/runtime/overlay/`:
 *
 *   1. `createPortal`            -- the single portal door
 *   2. a numeric `zIndex`/`z-index` inline-style literal -- the single band scale
 *   3. writing `document.body.style.overflow` -- the single ref-counted lock
 *
 * The law is FAIL-CLOSED: any file outside the kernel that is not enumerated
 * in the frozen ledger below turns this suite red, and an enumerated file may
 * only ever go DOWN. The ledger is not an exemption policy -- every entry is
 * either a Classic/Rustic engine frozen by the 2026-09-05 owner decision
 * (zero content work) or a residue outside this work order's file fence,
 * named with the work order that owns its drain.
 *
 * Each detector carries an adversarial drill: a planted violation must turn
 * it red before a green result on the real tree means anything.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { describe, expect, it } from 'vitest';

const COMPONENTS_ROOT = resolve(process.cwd(), 'src/components');
const KERNEL_PREFIX = 'primitives/runtime/overlay/';

/** Files the law does not govern: tests, stories and type declarations. */
function isGoverned(relativePath: string): boolean {
  if (relativePath.startsWith(KERNEL_PREFIX)) return false;
  if (relativePath.includes(`${sep}tests${sep}`)) return false;
  if (relativePath.includes('.test.')) return false;
  if (relativePath.includes('.stories.')) return false;
  if (relativePath.endsWith('.d.ts')) return false;
  return relativePath.endsWith('.ts') || relativePath.endsWith('.tsx');
}

function walk(directory: string, out: string[] = []): string[] {
  for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) =>
    a.name < b.name ? -1 : a.name > b.name ? 1 : 0,
  )) {
    const full = join(directory, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const GOVERNED_FILES = walk(COMPONENTS_ROOT)
  .map((full) => relative(COMPONENTS_ROOT, full))
  .filter(isGoverned);

/**
 * Comments are prose, not mechanism: a file that explains why it does NOT
 * call `createPortal` must not be counted as calling it.
 */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1');
}

// ---------------------------------------------------------------------------
// Detectors
// ---------------------------------------------------------------------------

function countCreatePortal(source: string): number {
  return (stripComments(source).match(/\bcreatePortal\b/g) ?? []).length;
}

function countBodyOverflowWrites(source: string): number {
  return (
    stripComments(source).match(
      /document\s*\.\s*body\s*\.\s*style\s*\.\s*overflow[A-Za-z]*\s*=/g,
    ) ?? []
  ).length;
}

/**
 * A numeric band literal. `0`, `-1` and `auto` are the CSS defaults for "no
 * stacking context" / "one step behind my own sibling" / "the keyword" -- a
 * local stacking decision, never a page-level band -- so they are outside the
 * law rather than inside the ledger.
 */
function countNumericZIndex(source: string): number {
  const literal = /\b(?:zIndex|['"]z-index['"]|z-index)\s*:\s*(['"]?)(-?\d+|auto)\1/g;
  let count = 0;
  for (const match of stripComments(source).matchAll(literal)) {
    const raw = match[2];
    if (raw === 'auto') continue;
    const value = Number(raw);
    if (value === 0 || value === -1) continue;
    count += 1;
  }
  return count;
}

// ---------------------------------------------------------------------------
// Frozen ledger -- decrease-only, path-keyed, with the owner of each drain
// ---------------------------------------------------------------------------

interface LedgerEntry {
  readonly max: number;
  readonly reason: string;
}

/** Classic/Rustic engines are frozen by owner decision (2026-09-05). */
const FROZEN_ENGINE = 'frozen Classic/Rustic engine (owner 2026-09-05: zero content work)';

const CREATE_PORTAL_LEDGER: Record<string, LedgerEntry> = {
  'primitives/inputs/cascader/engines/rustic/index.tsx': { max: 2, reason: FROZEN_ENGINE },
  'primitives/inputs/color-picker/engines/rustic/index.tsx': { max: 2, reason: FROZEN_ENGINE },
  'primitives/inputs/date-picker/engines/rustic/index.tsx': { max: 4, reason: FROZEN_ENGINE },
  'primitives/inputs/tree-select/engines/rustic/index.tsx': { max: 2, reason: FROZEN_ENGINE },
  'primitives/overlay/sheet/engines/rustic/index.tsx': { max: 2, reason: FROZEN_ENGINE },
  'primitives/overlay/tour/engines/rustic/index.tsx': { max: 2, reason: FROZEN_ENGINE },
};

const BODY_OVERFLOW_LEDGER: Record<string, LedgerEntry> = {
  'primitives/feedback/drawer/engines/rustic/index.tsx': { max: 3, reason: FROZEN_ENGINE },
  'primitives/feedback/modal/engines/rustic/index.tsx': { max: 2, reason: FROZEN_ENGINE },
  'primitives/overlay/alert-dialog/engines/rustic/index.tsx': { max: 2, reason: FROZEN_ENGINE },
  'primitives/overlay/confirm-dialog/engines/rustic/index.tsx': { max: 2, reason: FROZEN_ENGINE },
};

const PUBLIC_PROP_DEFAULT =
  'public component-contract default for a caller-supplied `zIndex` prop, not paint; retires with the compiler-emitted scale (WO-DER-04)';
const TIER_RESIDUE =
  'local stacking inside a tier component, outside this work order file fence; drains with the inline-paint work (WO-FAM-10/11)';

const NUMERIC_Z_INDEX_LEDGER: Record<string, LedgerEntry> = {
  // Public contract defaults.
  'primitives/feedback/drawer/contracts/index.ts': { max: 1, reason: PUBLIC_PROP_DEFAULT },
  'primitives/feedback/modal/contracts/index.ts': { max: 1, reason: PUBLIC_PROP_DEFAULT },
  'primitives/navigation/affix/contracts/index.ts': { max: 1, reason: PUBLIC_PROP_DEFAULT },
  'primitives/overlay/popover/contracts/index.ts': { max: 1, reason: PUBLIC_PROP_DEFAULT },
  'primitives/overlay/tour/contracts/index.ts': { max: 1, reason: PUBLIC_PROP_DEFAULT },
  'primitives/overlay/watermark/contracts/index.ts': { max: 1, reason: PUBLIC_PROP_DEFAULT },
  // Tier residue.
  'patterns/visualization/charts/presentation/tooltip/index.tsx': { max: 1, reason: TIER_RESIDUE },
  'structures/record/edit-fields/index.tsx': { max: 1, reason: TIER_RESIDUE },
  'structures/shell/workspace-shell/index.tsx': { max: 1, reason: TIER_RESIDUE },
  'surfaces/presentation/pages/workspace/collection-workspace/index.tsx': {
    max: 1,
    reason: TIER_RESIDUE,
  },
  // Frozen engines.
  'patterns/communication/notification-center/engines/rustic/index.tsx': { max: 1, reason: FROZEN_ENGINE },
  'patterns/data/data-table/engines/classic/index.tsx': { max: 1, reason: FROZEN_ENGINE },
  'patterns/visualization/timeline/engines/rustic/index.tsx': { max: 2, reason: FROZEN_ENGINE },
  'primitives/display/badge/engines/rustic/index.tsx': { max: 1, reason: FROZEN_ENGINE },
  'primitives/feedback/rate/engines/rustic/index.tsx': { max: 1, reason: FROZEN_ENGINE },
  'patterns/data/data-table/engines/rustic/index.tsx': { max: 5, reason: FROZEN_ENGINE },
  'patterns/data/saved-views/engines/rustic/index.tsx': { max: 1, reason: FROZEN_ENGINE },
  'patterns/forms/filter-builder/engines/classic/index.tsx': { max: 1, reason: FROZEN_ENGINE },
  'patterns/forms/filter-builder/engines/rustic/index.tsx': { max: 1, reason: FROZEN_ENGINE },
  'patterns/forms/form-builder/engines/rustic/index.tsx': { max: 1, reason: FROZEN_ENGINE },
  'patterns/navigation/command-palette/engines/rustic/index.tsx': { max: 1, reason: FROZEN_ENGINE },
  'patterns/navigation/environment-toggle/engines/rustic/index.tsx': { max: 2, reason: FROZEN_ENGINE },
  'patterns/navigation/locale-switcher/engines/rustic/index.tsx': { max: 1, reason: FROZEN_ENGINE },
  'patterns/navigation/shortcuts-overlay/engines/rustic/index.tsx': { max: 1, reason: FROZEN_ENGINE },
  'patterns/navigation/workspace-switcher/engines/rustic/index.tsx': { max: 1, reason: FROZEN_ENGINE },
  'patterns/shell/cockpit-header/engines/classic/index.tsx': { max: 1, reason: FROZEN_ENGINE },
  'primitives/display/card/engines/rustic/index.tsx': { max: 1, reason: FROZEN_ENGINE },
  'primitives/display/carousel/engines/rustic/index.tsx': { max: 2, reason: FROZEN_ENGINE },
  'primitives/display/image/engines/rustic/index.tsx': { max: 1, reason: FROZEN_ENGINE },
  'primitives/display/table/engines/rustic/index.tsx': { max: 4, reason: FROZEN_ENGINE },
  'primitives/display/tree/engines/rustic/index.tsx': { max: 1, reason: FROZEN_ENGINE },
  'primitives/inputs/auto-complete/engines/rustic/index.tsx': { max: 1, reason: FROZEN_ENGINE },
  'primitives/inputs/cascader/engines/rustic/index.tsx': { max: 1, reason: FROZEN_ENGINE },
  'primitives/inputs/color-picker/engines/rustic/index.tsx': { max: 1, reason: FROZEN_ENGINE },
  'primitives/inputs/date-picker/engines/rustic/index.tsx': { max: 1, reason: FROZEN_ENGINE },
  'primitives/inputs/mentions/engines/rustic/index.tsx': { max: 1, reason: FROZEN_ENGINE },
  'primitives/inputs/select/engines/rustic/index.tsx': { max: 1, reason: FROZEN_ENGINE },
  'primitives/inputs/tree-select/engines/rustic/index.tsx': { max: 2, reason: FROZEN_ENGINE },
  'primitives/inputs/upload/engines/rustic/index.tsx': { max: 1, reason: FROZEN_ENGINE },
  'primitives/navigation/float-button/engines/rustic/index.tsx': { max: 1, reason: FROZEN_ENGINE },
  'primitives/overlay/alert-dialog/engines/rustic/index.tsx': { max: 1, reason: FROZEN_ENGINE },
  'primitives/overlay/confirm-dialog/engines/rustic/index.tsx': { max: 1, reason: FROZEN_ENGINE },
  'primitives/overlay/context-menu/engines/rustic/index.tsx': { max: 1, reason: FROZEN_ENGINE },
  'primitives/overlay/hover-card/engines/rustic/index.tsx': { max: 1, reason: FROZEN_ENGINE },
};

interface Violation {
  file: string;
  count: number;
}

function scan(count: (source: string) => number): Violation[] {
  const found: Violation[] = [];
  for (const file of GOVERNED_FILES) {
    const hits = count(readFileSync(join(COMPONENTS_ROOT, file), 'utf8'));
    if (hits > 0) found.push({ file, count: hits });
  }
  return found;
}

function assertWithinLedger(
  violations: readonly Violation[],
  ledger: Record<string, LedgerEntry>,
  mechanism: string,
): void {
  const unowned = violations.filter(({ file }) => ledger[file] === undefined);
  expect(
    unowned.map(({ file, count }) => `${file} (${count}x)`),
    `${mechanism} escaped the overlay kernel in a file with no frozen-ledger entry`,
  ).toEqual([]);

  for (const { file, count } of violations) {
    const entry = ledger[file]!;
    expect(count, `${file}: ${mechanism} is decrease-only (${entry.reason})`).toBeLessThanOrEqual(
      entry.max,
    );
  }
}

describe('overlay kernel boundary', () => {
  it('sees a real, non-trivial component corpus', () => {
    expect(GOVERNED_FILES.length).toBeGreaterThan(500);
  });

  it('keeps createPortal inside the kernel', () => {
    assertWithinLedger(scan(countCreatePortal), CREATE_PORTAL_LEDGER, 'createPortal');
  });

  it('keeps the body scroll lock inside the kernel', () => {
    assertWithinLedger(
      scan(countBodyOverflowWrites),
      BODY_OVERFLOW_LEDGER,
      'document.body.style.overflow',
    );
  });

  it('keeps numeric z-index literals inside the kernel', () => {
    assertWithinLedger(
      scan(countNumericZIndex),
      NUMERIC_Z_INDEX_LEDGER,
      'a numeric z-index literal',
    );
  });

  it('leaves no Modern engine file in any ledger', () => {
    const modernEntries = [
      ...Object.keys(CREATE_PORTAL_LEDGER),
      ...Object.keys(BODY_OVERFLOW_LEDGER),
      ...Object.keys(NUMERIC_Z_INDEX_LEDGER),
    ].filter((file) => file.includes('/engines/modern/'));
    expect(modernEntries).toEqual([]);
  });

  it('has no stale ledger row', () => {
    const live = new Set([
      ...scan(countCreatePortal).map(({ file }) => `portal:${file}`),
      ...scan(countBodyOverflowWrites).map(({ file }) => `overflow:${file}`),
      ...scan(countNumericZIndex).map(({ file }) => `z:${file}`),
    ]);
    const declared = [
      ...Object.keys(CREATE_PORTAL_LEDGER).map((f) => `portal:${f}`),
      ...Object.keys(BODY_OVERFLOW_LEDGER).map((f) => `overflow:${f}`),
      ...Object.keys(NUMERIC_Z_INDEX_LEDGER).map((f) => `z:${f}`),
    ];
    expect(declared.filter((row) => !live.has(row))).toEqual([]);
  });
});

describe('overlay kernel boundary detectors (adversarial drills)', () => {
  it('detects a planted createPortal', () => {
    expect(countCreatePortal("import { createPortal } from 'react-dom';")).toBe(1);
    expect(countCreatePortal('// a comment naming createPortal')).toBe(0);
    expect(countCreatePortal('/* block naming createPortal */')).toBe(0);
  });

  it('detects a planted body scroll lock', () => {
    expect(countBodyOverflowWrites("document.body.style.overflow = 'hidden';")).toBe(1);
    expect(countBodyOverflowWrites('document.body.style.overflowY = "hidden";')).toBe(1);
    expect(countBodyOverflowWrites('const prior = document.body.style.overflow;')).toBe(0);
  });

  it('detects a planted numeric z-index and keeps the CSS defaults out', () => {
    expect(countNumericZIndex('style={{ zIndex: 1050 }}')).toBe(1);
    expect(countNumericZIndex("style={{ zIndex: '9999' }}")).toBe(1);
    expect(countNumericZIndex('z-index: 1700;')).toBe(1);
    expect(countNumericZIndex('style={{ zIndex: 0 }}')).toBe(0);
    expect(countNumericZIndex('style={{ zIndex: -1 }}')).toBe(0);
    expect(countNumericZIndex("style={{ zIndex: 'auto' }}")).toBe(0);
    expect(countNumericZIndex("style={{ zIndex: 'var(--ds-z-index-modal)' }}")).toBe(0);
  });

  it('refuses to accept a planted violation in an unowned file', () => {
    expect(() =>
      assertWithinLedger(
        [{ file: 'primitives/feedback/modal/engines/modern/index.tsx', count: 1 }],
        CREATE_PORTAL_LEDGER,
        'createPortal',
      ),
    ).toThrow();
  });

  it('refuses to accept a ledger entry that grew', () => {
    expect(() =>
      assertWithinLedger(
        [{ file: 'primitives/overlay/sheet/engines/rustic/index.tsx', count: 99 }],
        CREATE_PORTAL_LEDGER,
        'createPortal',
      ),
    ).toThrow();
  });
});
