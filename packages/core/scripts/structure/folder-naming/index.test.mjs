/**
 * Self-test for structure/folder-naming/index.mjs — exact-path exception contract.
 *
 * The gate carries two exception sets and both are *exact* `Set.has` lookups on
 * a fully qualified `category/.../folder` path:
 *
 *   ALLOWED_FORBIDDEN_PREFIX_PATHS — Rule 1 (premium-/workspace-/surface-)
 *   ALLOWED_REPEATED_PARENT        — Rule 2 (child repeats parent name)
 *
 * These tests pin the properties that an exception set can silently lose:
 * that a listed path is green, that a near miss sharing the same prefix or the
 * same category is still red, that an allowed owner does not shelter its own
 * children, and that the `structures/record/record-*` debt is NOT excepted.
 *
 * Every case runs hermetically: the gate is copied into a throwaway package
 * whose `src/` is built per-case, so the assertions never depend on the live
 * tree. The gate resolves its roots from its own location
 * (`__dirname/../../../src`),
 * which is what makes the copy work.
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const gate = join(scriptDir, 'index.mjs');

/** The 4 component roots plus the token owners the gate requires to exist. */
const FIXTURE_BASE_DIRS = [
  'src/ui/primitives',
  'src/ui/patterns',
  'src/ui/structures',
  'src/ui/surfaces',
  'src/foundation/tokens/ts/presentation/brand-themes',
  'src/foundation/tokens/ts/runtime/mirrors',
];

/**
 * Build a throwaway package containing a copy of the gate plus `componentDirs`
 * (paths relative to `src/ui`), run the gate, and return its parsed result.
 */
function runGateOn(componentDirs) {
  const root = mkdtempSync(join(tmpdir(), 'folder-naming-'));
  try {
    mkdirSync(join(root, 'scripts/structure/folder-naming'), { recursive: true });
    copyFileSync(gate, join(root, 'scripts/structure/folder-naming/index.mjs'));

    for (const dir of FIXTURE_BASE_DIRS) {
      mkdirSync(join(root, dir), { recursive: true });
    }
    for (const dir of componentDirs) {
      mkdirSync(join(root, 'src/ui', dir), { recursive: true });
    }

    const proc = spawnSync(process.execPath, [join(root, 'scripts/structure/folder-naming/index.mjs')], {
      encoding: 'utf8',
    });

    // Reported violations arrive on stderr as `  [rule] category/.../folder`.
    const findings = [];
    for (const line of proc.stderr.split('\n')) {
      const match = /^\s{2}\[([a-z-]+)]\s(.+)$/.exec(line);
      if (match) findings.push({ rule: match[1], path: match[2] });
    }

    return {
      status: proc.status,
      findings,
      paths: findings.map((f) => f.path),
      byRule: (rule) => findings.filter((f) => f.rule === rule).map((f) => f.path),
      output: `${proc.stdout}${proc.stderr}`,
    };
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

/* ------------------------------------------------------------------ */
/* The rename itself                                                   */
/* ------------------------------------------------------------------ */

test('the Rule 1 set is named for what it governs', () => {
  const source = readFileSync(gate, 'utf8');
  assert.match(source, /const ALLOWED_FORBIDDEN_PREFIX_PATHS = new Set\(\[/);
  assert.equal(
    source.includes('ALLOWED_EXCEPTIONS'),
    false,
    'the ambiguous ALLOWED_EXCEPTIONS name must be gone, not aliased',
  );
});

/* ------------------------------------------------------------------ */
/* T1 — every excepted path is green                                   */
/* ------------------------------------------------------------------ */

test('T1: the three canonical exceptions plus workspace-switcher and data-table pass', () => {
  const result = runGateOn([
    'structures/feedback/surface-lifecycle',
    'structures/shell/surface-chrome',
    'structures/shell/workspace-shell',
    'patterns/navigation/workspace-switcher',
    'patterns/data/data-table',
  ]);

  assert.deepEqual(result.findings, [], 'no violation expected');
  assert.equal(result.status, 0, `expected exit 0, got ${result.status}:\n${result.output}`);
});

/* ------------------------------------------------------------------ */
/* T2 — near misses are still red (exact match, not prefix/category)   */
/* ------------------------------------------------------------------ */

test('T2: near misses of the excepted paths are still forbidden prefixes', () => {
  const nearMisses = [
    // Same category and same parent as an excepted owner...
    'structures/feedback/surface-rogue',
    'structures/shell/surface-page',
    // ...and one sharing the excepted owner's `workspace-` prefix.
    'structures/shell/workspace-dashboard',
  ];
  const result = runGateOn(nearMisses);

  assert.equal(result.status, 1, `expected exit 1, got ${result.status}:\n${result.output}`);
  assert.deepEqual(result.byRule('forbidden-prefix').sort(), [...nearMisses].sort());
  assert.equal(result.findings.length, 3, 'exactly 3 violations, all forbidden-prefix');
});

test('T2b: excepting a path does not except its sibling or its whole category', () => {
  const result = runGateOn([
    'structures/shell/workspace-shell', // excepted
    'structures/shell/workspace-dashboard', // sibling, NOT excepted
    'patterns/navigation/workspace-switcher', // excepted
    'patterns/navigation/workspace-picker', // sibling, NOT excepted
  ]);

  assert.equal(result.status, 1);
  assert.deepEqual(result.paths.sort(), [
    'patterns/navigation/workspace-picker',
    'structures/shell/workspace-dashboard',
  ]);
});

/* ------------------------------------------------------------------ */
/* T3/T4 — the record/* debt stays red                                 */
/* ------------------------------------------------------------------ */

test('T3: all five structures/record/record-* owners report repeated-parent', () => {
  const recordOwners = [
    'structures/record/record-action-bar',
    'structures/record/record-field',
    'structures/record/record-field-grid',
    'structures/record/record-panel',
    'structures/record/record-summary-strip',
  ];
  const result = runGateOn(recordOwners);

  assert.equal(result.status, 1, `expected exit 1, got ${result.status}:\n${result.output}`);
  assert.deepEqual(result.byRule('repeated-parent-child').sort(), [...recordOwners].sort());
  assert.equal(result.findings.length, 5, 'exactly 5 violations, all repeated-parent-child');
});

test('T4: a newly added record/record-* owner is red too', () => {
  const result = runGateOn(['structures/record/record-widget']);

  assert.equal(result.status, 1);
  assert.deepEqual(result.findings, [
    { rule: 'repeated-parent-child', path: 'structures/record/record-widget' },
  ]);
});

test('T4b: patterns/data/data-table is the only repeated-parent exception', () => {
  const result = runGateOn(['patterns/data/data-table', 'patterns/data/data-grid']);

  assert.equal(result.status, 1);
  assert.deepEqual(result.paths, ['patterns/data/data-grid']);
});

/* ------------------------------------------------------------------ */
/* T5 — an allowed owner does not shelter its children                 */
/* ------------------------------------------------------------------ */

test('T5: forbidden-prefix children under an allowed owner stay red', () => {
  const result = runGateOn([
    'structures/shell/workspace-shell/workspace-rail',
    'structures/feedback/surface-lifecycle/surface-skeleton',
  ]);

  assert.equal(result.status, 1, `expected exit 1, got ${result.status}:\n${result.output}`);
  assert.deepEqual(result.byRule('forbidden-prefix').sort(), [
    'structures/feedback/surface-lifecycle/surface-skeleton',
    'structures/shell/workspace-shell/workspace-rail',
  ]);
  // The excepted owners themselves are not reported.
  assert.equal(result.paths.includes('structures/shell/workspace-shell'), false);
  assert.equal(result.paths.includes('structures/feedback/surface-lifecycle'), false);
});
