/**
 * Self-test for container-query-gate.mjs (W6-A).
 *
 * Pure-function unit tests drill the two detection passes in isolation
 * (mirroring skin-dead-part-audit.test.mjs's direct-import style); a small
 * set of spawnSync fixture runs prove the CLI wiring end to end, including
 * the negative paths a pure-function test cannot reach on its own (baseline
 * loading, --seed round-trip, process exit codes) -- mirroring
 * css-layer-paint-gate.test.mjs's fixture() convention.
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import {
  classifyMediaParams,
  evaluateDeadNames,
  evaluateViewportQueries,
  extractContainerQueries,
  extractDeclaredContainerNames,
  extractMediaQueries,
  stripComments,
} from './container-query-gate.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const gate = join(scriptDir, 'container-query-gate.mjs');

function runGate(args) {
  return spawnSync(process.execPath, [gate, ...args], { encoding: 'utf8' });
}

function fixture() {
  const dir = mkdtempSync(join(tmpdir(), 'container-query-gate-'));
  const write = (rel, source) => {
    const full = join(dir, rel);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, source);
    return full;
  };
  const cssRoot = join(dir, 'css-root');
  const componentsRoot = join(cssRoot, 'presentation/components');
  const baselinePath = join(dir, 'baseline.json');
  write('baseline.json', JSON.stringify({ deadContainerNames: {}, viewportQueries: {} }));
  return {
    dir,
    write,
    cssRoot,
    componentsRoot,
    baselinePath,
    args: ['--css-root', cssRoot, '--components-root', componentsRoot, '--baseline', baselinePath],
    cleanup: () => rmSync(dir, { recursive: true, force: true }),
  };
}

/* ------------------------------------------------------------------------ */
/* stripComments                                                            */
/* ------------------------------------------------------------------------ */

test('stripComments blanks comment text but preserves every newline (line numbers stay accurate)', () => {
  const css = '.a { color: red; }\n/* line 2\n   line 3 */\n.b { color: blue; }\n';
  const stripped = stripComments(css);
  assert.equal(stripped.split('\n').length, css.split('\n').length);
  assert.doesNotMatch(stripped, /line 2|line 3/);
  assert.match(stripped, /\.b \{ color: blue; \}/);
});

/* ------------------------------------------------------------------------ */
/* extractDeclaredContainerNames                                            */
/* ------------------------------------------------------------------------ */

test('extractDeclaredContainerNames reads the longhand property, a multi-name list, and ignores none', () => {
  const css = [
    '.a { container-type: inline-size; container-name: ds-page; }',
    '.b { container-name: ds-rail ds-detail; }',
    '.c { container-name: none; }',
  ].join('\n');
  assert.deepEqual([...extractDeclaredContainerNames(css)].sort(), ['ds-detail', 'ds-page', 'ds-rail']);
});

test('extractDeclaredContainerNames reads the container shorthand and never matches container-type alone', () => {
  const css = [
    '.a { container: ds-collection / inline-size; }',
    '.b { container-type: inline-size; }',
  ].join('\n');
  assert.deepEqual([...extractDeclaredContainerNames(css)], ['ds-collection']);
});

test('extractDeclaredContainerNames ignores names quoted inside a comment', () => {
  const css = '/* container-name: ds-ghost; */\n.a { color: red; }';
  assert.deepEqual([...extractDeclaredContainerNames(css)], []);
});

test('extractDeclaredContainerNames does not match a custom property that merely ENDS in "container"', () => {
  // Regression: --ds-spacing-container is a real token (spacing.css); a plain
  // \b boundary treats the leading `-` as a word break and false-matches the
  // `container` shorthand inside it.
  const css = '  --ds-spacing-container: var(--ds-spacing-6);\n';
  assert.deepEqual([...extractDeclaredContainerNames(css)], []);
});

/* ------------------------------------------------------------------------ */
/* extractContainerQueries                                                  */
/* ------------------------------------------------------------------------ */

test('extractContainerQueries captures a named query with its real line number', () => {
  const css = '.a { color: red; }\n\n@container ds-page (max-width: 640px) {\n  .b { color: blue; }\n}\n';
  const queries = extractContainerQueries(css, 'fixture.css');
  assert.deepEqual(queries, [{ name: 'ds-page', line: 3, file: 'fixture.css' }]);
});

test('extractContainerQueries skips unnamed, not(), and style() queries', () => {
  const css = [
    '@container (min-width: 400px) { .a { color: red; } }',
    '@container not (min-width: 400px) { .b { color: red; } }',
    "@container style(--responsive: true) { .c { color: red; } }",
  ].join('\n');
  assert.deepEqual(extractContainerQueries(css), []);
});

test('extractContainerQueries does not read a name out of prose that quotes @container in a comment', () => {
  const css = '/* see @container ds-ghost (max-width: 1px) for reference */\n.a { color: red; }';
  assert.deepEqual(extractContainerQueries(css), []);
});

/* ------------------------------------------------------------------------ */
/* classifyMediaParams / extractMediaQueries                                */
/* ------------------------------------------------------------------------ */

test('classifyMediaParams: semantic features and print are exempt, width queries are viewport, everything else is other', () => {
  assert.equal(classifyMediaParams('(forced-colors: active)'), 'semantic');
  assert.equal(classifyMediaParams('(prefers-reduced-motion: reduce)'), 'semantic');
  assert.equal(classifyMediaParams('(prefers-contrast: more)'), 'semantic');
  assert.equal(classifyMediaParams('print'), 'semantic');
  assert.equal(classifyMediaParams('print, screen'), 'semantic');
  assert.equal(classifyMediaParams('(max-width: 640px)'), 'viewport');
  assert.equal(classifyMediaParams('(min-width: 900px)'), 'viewport');
  assert.equal(classifyMediaParams('(hover: hover)'), 'other');
});

test('extractMediaQueries reports the real line and strips comments first', () => {
  const css = '/* @media (max-width: 1px) in prose */\n.a{}\n@media (max-width: 640px) {\n  .b{}\n}\n';
  const queries = extractMediaQueries(css);
  assert.equal(queries.length, 1);
  assert.equal(queries[0].kind, 'viewport');
  assert.equal(queries[0].line, 3);
});

/* ------------------------------------------------------------------------ */
/* evaluateDeadNames / evaluateViewportQueries (pure evaluators)            */
/* ------------------------------------------------------------------------ */

test('evaluateDeadNames: undeclared name with no baseline entry is newDead; a baselined one is not', () => {
  const declaredNames = new Set(['ds-page']);
  const referencedQueries = [{ name: 'ds-page' }, { name: 'ds-table' }, { name: 'ds-ghost' }];
  const result = evaluateDeadNames({
    declaredNames,
    referencedQueries,
    baseline: { 'ds-table': { reason: 'accepted debt' } },
  });
  assert.deepEqual(result.dead, ['ds-ghost', 'ds-table']);
  assert.deepEqual(result.newDead, ['ds-ghost']);
  assert.deepEqual(result.revived, []);
});

test('evaluateDeadNames: a baselined name that is now declared is revived', () => {
  const result = evaluateDeadNames({
    declaredNames: new Set(['ds-table']),
    referencedQueries: [{ name: 'ds-table' }],
    baseline: { 'ds-table': { reason: 'was dead' } },
  });
  assert.deepEqual(result.dead, []);
  assert.deepEqual(result.revived, ['ds-table']);
});

test('evaluateViewportQueries: classifies new / grown / shrunk / stale against a baseline', () => {
  const result = evaluateViewportQueries({
    countsByFile: { 'a.css': 2, 'b.css': 1, 'c.css': 3 },
    baseline: {
      'b.css': { count: 1 },
      'c.css': { count: 5 },
      'd.css': { count: 1 },
    },
  });
  assert.deepEqual(result.newViolations, [{ file: 'a.css', count: 2 }]);
  assert.deepEqual(result.grown, []);
  assert.deepEqual(result.shrunk, [{ file: 'c.css', count: 3, ceiling: 5 }]);
  assert.deepEqual(result.stale, ['d.css']);
});

test('evaluateViewportQueries: growth past the ceiling is reported', () => {
  const result = evaluateViewportQueries({
    countsByFile: { 'a.css': 4 },
    baseline: { 'a.css': { count: 1 } },
  });
  assert.deepEqual(result.grown, [{ file: 'a.css', count: 4, ceiling: 1 }]);
});

/* ------------------------------------------------------------------------ */
/* CLI integration                                                          */
/* ------------------------------------------------------------------------ */

test('gate passes on the real tree with the committed baseline', () => {
  const result = runGate(['--check']);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /OK -- no new dead container names/);
});

test('fixture: a new dead @container name fails --check and names the site', () => {
  const f = fixture();
  try {
    f.write(
      'css-root/foo.css',
      '@container ds-ghost (min-width: 10px) {\n  .x { color: red; }\n}\n',
    );
    const result = runGate([...f.args, '--check']);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /new dead @container name: 'ds-ghost'/);
    assert.match(result.stderr, /foo\.css:1/);
  } finally {
    f.cleanup();
  }
});

test('fixture: declaring container-name clears the dead-name failure', () => {
  const f = fixture();
  try {
    f.write(
      'css-root/foo.css',
      '.root { container-type: inline-size; container-name: ds-ghost; }\n\n' +
        '@container ds-ghost (min-width: 10px) {\n  .x { color: red; }\n}\n',
    );
    const result = runGate([...f.args, '--check']);
    assert.equal(result.status, 0, result.stderr || result.stdout);
  } finally {
    f.cleanup();
  }
});

test('fixture: a NEW viewport @media under presentation/components fails --check', () => {
  const f = fixture();
  try {
    f.write(
      'css-root/presentation/components/foo.css',
      '@media (max-width: 600px) {\n  .x { color: red; }\n}\n',
    );
    const result = runGate([...f.args, '--check']);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /new viewport-query file/);
  } finally {
    f.cleanup();
  }
});

test('fixture: semantic queries (forced-colors, prefers-*, print) are never restricted', () => {
  const f = fixture();
  try {
    f.write(
      'css-root/presentation/components/foo.css',
      [
        '@media (forced-colors: active) { .a { color: red; } }',
        '@media (prefers-reduced-motion: reduce) { .b { color: red; } }',
        '@media print { .c { color: red; } }',
      ].join('\n'),
    );
    const result = runGate([...f.args, '--check']);
    assert.equal(result.status, 0, result.stderr || result.stdout);
  } finally {
    f.cleanup();
  }
});

test('fixture: --seed writes a baseline that then makes --check pass, and re-running --seed is idempotent', () => {
  const f = fixture();
  try {
    f.write(
      'css-root/presentation/components/foo.css',
      '@media (max-width: 600px) {\n  .x { color: red; }\n}\n',
    );
    f.write('css-root/bar.css', '@container ds-ghost (min-width: 10px) {\n  .y { color: blue; }\n}\n');

    const seeded = runGate([...f.args, '--seed']);
    assert.equal(seeded.status, 0, seeded.stderr || seeded.stdout);

    const checked = runGate([...f.args, '--check']);
    assert.equal(checked.status, 0, checked.stderr || checked.stdout);

    const reseeded = runGate([...f.args, '--seed']);
    assert.equal(reseeded.status, 0, reseeded.stderr || reseeded.stdout);
    const recheck = runGate([...f.args, '--check']);
    assert.equal(recheck.status, 0, recheck.stderr || recheck.stdout);
  } finally {
    f.cleanup();
  }
});

test('fixture: growth past a seeded ceiling fails --check', () => {
  const f = fixture();
  try {
    f.write(
      'css-root/presentation/components/foo.css',
      '@media (max-width: 600px) {\n  .x { color: red; }\n}\n',
    );
    const seeded = runGate([...f.args, '--seed']);
    assert.equal(seeded.status, 0, seeded.stderr || seeded.stdout);

    f.write(
      'css-root/presentation/components/foo.css',
      '@media (max-width: 600px) { .x { color: red; } }\n@media (min-width: 900px) { .y { color: blue; } }\n',
    );
    const result = runGate([...f.args, '--check']);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /viewport-query ceiling grew/);
  } finally {
    f.cleanup();
  }
});
