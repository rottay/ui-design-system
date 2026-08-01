/**
 * Drills for prototype-ledger-gate.
 *
 * A gate with no baseline is only worth its ability to FAIL, so every check
 * gets a planted violation and an assertion that the scan goes red. The
 * fixtures are built in a temp directory: a drill that mutated the repository
 * to prove the gate works would be a gate that vandalizes the tree it guards.
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  CATEGORIES,
  blankComments,
  evaluate,
  findProtoSites,
  findLeaks,
  loadLedger,
  scanArtifacts,
  scanSources,
} from './prototype-ledger-gate.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const CORE_ROOT = resolve(HERE, '..');

const SKIN = 'src/foundation/tokens/css/runtime/engines/modern/skin/fixture.css';
const ARTIFACT = 'src/foundation/tokens/css/facade/artifacts/fixture/index.css';
const BUNDLE = 'styles/fixture.css';

function write(root, relative, contents) {
  const full = join(root, relative);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, contents);
}

/** A minimal well-formed corpus: one proto, one consumer, one matching row. */
function buildFixture(overrides = {}) {
  const root = mkdtempSync(join(tmpdir(), 'proto-ledger-'));
  write(root, SKIN, '.fixture {\n  color: var(--_ds-proto-fixture-ink, red);\n}\n');
  write(root, ARTIFACT, ':root {\n  --ds-color-primary: #123456;\n}\n');
  write(root, BUNDLE, '.fixture {\n  color: var(--_ds-proto-fixture-ink, red);\n}\n');

  const entries = [
    {
      name: '--_ds-proto-fixture-ink',
      family: 'fixture',
      axis: 'ink',
      purpose: 'Fixture ink.',
      cssType: '<color>',
      fallback: 'red',
      consumers: [{ file: SKIN, line: 2, kind: 'use' }],
      scope: 'private',
      category: 'PRIVATE',
      owner: 'design-system',
      status: 'active',
    },
  ];

  return { root, entries: overrides.entries ? overrides.entries(entries) : entries };
}

function run(fixture) {
  try {
    return evaluate({ root: fixture.root, entries: fixture.entries });
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
}

test('a well-formed corpus is green (the drill can actually pass)', () => {
  assert.deepEqual(run(buildFixture()), []);
});

test('(a) a proto in the sources with no active row fails', () => {
  const fixture = buildFixture();
  write(fixture.root, SKIN, '.fixture {\n  color: var(--_ds-proto-fixture-ink, red);\n  border-color: var(--_ds-proto-fixture-edge, blue);\n}\n');

  const problems = run(fixture);
  assert.equal(problems.length, 1);
  assert.match(problems[0], /--_ds-proto-fixture-edge.*no active ledger entry/);
});

test('(b) an active row with no occurrence in the sources fails', () => {
  const fixture = buildFixture({
    entries: (entries) => [
      ...entries,
      { ...entries[0], name: '--_ds-proto-fixture-ghost', consumers: [{ file: SKIN, line: 2 }] },
    ],
  });

  const problems = run(fixture);
  assert.ok(problems.some((p) => /--_ds-proto-fixture-ghost.*no occurrence/.test(p)), problems.join('\n'));
});

test('(c) a consumer pointing at a missing file fails', () => {
  const fixture = buildFixture({
    entries: (entries) => [
      { ...entries[0], consumers: [{ file: 'src/does/not/exist.css', line: 1 }] },
    ],
  });

  const problems = run(fixture);
  assert.ok(problems.some((p) => /consumer file src\/does\/not\/exist\.css does not exist/.test(p)), problems.join('\n'));
});

test('(c) a consumer whose file no longer contains the name fails', () => {
  const fixture = buildFixture();
  write(fixture.root, 'src/other.css', '.other { color: red; }\n');
  fixture.entries[0].consumers = [{ file: 'src/other.css', line: 1 }];

  const problems = run(fixture);
  assert.ok(problems.some((p) => /src\/other\.css no longer contains the name/.test(p)), problems.join('\n'));
});

test('(c) an active row with no consumers at all fails', () => {
  const fixture = buildFixture({ entries: (entries) => [{ ...entries[0], consumers: [] }] });

  const problems = run(fixture);
  assert.ok(problems.some((p) => /MUST list at least one verified consumer/.test(p)), problems.join('\n'));
});

test('(d) a category outside the nine dispositions fails', () => {
  const fixture = buildFixture({
    entries: (entries) => [{ ...entries[0], category: 'KEEP' }],
  });

  const problems = run(fixture);
  assert.ok(problems.some((p) => /category "KEEP" is not one of/.test(p)), problems.join('\n'));
});

test('(e1) a prototoken inside a generated tenant artifact fails', () => {
  const fixture = buildFixture();
  write(fixture.root, ARTIFACT, ':root {\n  --ds-color-primary: var(--_ds-proto-fixture-ink, #123456);\n}\n');

  const problems = run(fixture);
  assert.ok(problems.some((p) => /reached the generated artifact/.test(p)), problems.join('\n'));
});

test('(e2) an UNGOVERNED prototoken shipped in a bundle fails', () => {
  const fixture = buildFixture();
  write(fixture.root, BUNDLE, '.fixture {\n  color: var(--_ds-proto-fixture-smuggled, red);\n}\n');

  const problems = run(fixture);
  assert.ok(problems.some((p) => /--_ds-proto-fixture-smuggled.*UNGOVERNED.*shipped/.test(p)), problems.join('\n'));
});

test('(e2) a GOVERNED prototoken in a bundle is allowed (bundles inline the skins)', () => {
  const fixture = buildFixture();
  write(fixture.root, BUNDLE, '.a { color: var(--_ds-proto-fixture-ink, red); }\n.b { color: var(--_ds-proto-fixture-ink, red); }\n');

  assert.deepEqual(run(fixture), []);
});

test('(f) a public-namespace leak (missing underscore) fails', () => {
  const fixture = buildFixture();
  write(fixture.root, SKIN, '.fixture {\n  color: var(--_ds-proto-fixture-ink, red);\n  background: var(--ds-proto-fixture-ink, blue);\n}\n');

  const problems = run(fixture);
  assert.ok(problems.some((p) => /public-namespace leak/.test(p)), problems.join('\n'));
});

test('a retired row must record what retired it', () => {
  const fixture = buildFixture({
    entries: (entries) => [
      ...entries,
      { ...entries[0], name: '--_ds-proto-fixture-old', status: 'retired', consumers: [] },
    ],
  });

  const problems = run(fixture);
  assert.ok(problems.some((p) => /MUST record retiredBy/.test(p)), problems.join('\n'));
});

test('a retired row is NOT required to exist in the sources', () => {
  const fixture = buildFixture({
    entries: (entries) => [
      ...entries,
      { ...entries[0], name: '--_ds-proto-fixture-old', status: 'retired', retiredBy: 'C0', consumers: [] },
    ],
  });

  assert.deepEqual(run(fixture), []);
});

test('prose cannot declare a prototoken: comments are blanked, line numbers survive', () => {
  const source = '/* --_ds-proto-modal-density-* dials */\n.a { color: var(--_ds-proto-real, red); }\n';
  const clean = blankComments(source);

  assert.equal(clean.includes('modal-density'), false);
  assert.equal(clean.split('\n').length, source.split('\n').length);

  const sites = findProtoSites(source);
  assert.deepEqual(sites, [{ name: '--_ds-proto-real', line: 2, kind: 'use' }]);
  assert.deepEqual(findLeaks(source), []);
});

test('comment-looking text inside strings and CSS URLs cannot blind the scanner', () => {
  const ts = [
    "const endpoint = 'https://example.test/*not-a-comment*/';",
    "const style = { '--_ds-proto-string-key': 'var(--_ds-proto-string-key, red)' };",
    '// --_ds-proto-comment-only',
  ].join('\n');
  const sites = findProtoSites(ts);
  assert.ok(sites.some((site) => site.name === '--_ds-proto-string-key'));
  assert.ok(sites.every((site) => site.name !== '--_ds-proto-comment-only'));

  const css = '.a { background: url(https://example.test/a); color: var(--_ds-proto-css-ink); }';
  assert.ok(
    findProtoSites(css, { lineComments: false }).some(
      (site) => site.name === '--_ds-proto-css-ink'
    )
  );
});

test('quoted multiline style-object keys are counted as declarations', () => {
  const source = [
    'const style = {',
    "  '--_ds-proto-inline-size': '2rem',",
    '};',
  ].join('\n');
  assert.deepEqual(findProtoSites(source), [
    { name: '--_ds-proto-inline-size', line: 2, kind: 'def' },
  ]);
});

test('the census separates declarations from consumptions, including wrapped var()', () => {
  const source = [
    '.a {',
    '  --_ds-proto-thing: 4px;',
    '  padding: var(',
    '    --_ds-proto-thing,',
    '    8px',
    '  );',
    '}',
  ].join('\n');

  assert.deepEqual(findProtoSites(source), [
    { name: '--_ds-proto-thing', line: 2, kind: 'def' },
    { name: '--_ds-proto-thing', line: 4, kind: 'use' },
  ]);
});

test('the shipped ledger governs the real tree with zero findings', () => {
  const problems = evaluate({ root: CORE_ROOT, entries: loadLedger() });
  assert.deepEqual(problems, [], problems.join('\n'));
});

test('the real tree is scanned non-trivially (a blind gate cannot be green)', () => {
  const { census } = scanSources(CORE_ROOT);
  assert.ok(census.size > 50, `expected the real prototoken corpus, saw ${census.size}`);
  assert.deepEqual(scanArtifacts(CORE_ROOT), []);
});

test('the disposition vocabulary is closed and complete', () => {
  assert.equal(CATEGORIES.length, 9);
  assert.equal(new Set(CATEGORIES).size, 9);
});
