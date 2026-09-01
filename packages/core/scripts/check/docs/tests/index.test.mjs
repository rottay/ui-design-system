/**
 * Drills for the public documentation gate.
 *
 * A documentation checker is worth exactly what its failures are worth. Each
 * drill below plants one defect the gate exists to catch and requires the
 * finding by kind, so a future refactor that quietly stops scanning something
 * fails here rather than reporting a clean set.
 *
 * The wrong-case drill is the one that matters most on this host: the
 * filesystem is case-insensitive, so a link to `Api.md` for a file named
 * `api.md` opens successfully in the author's editor and 404s for the reader.
 * `fs.existsSync` cannot see it; the gate must.
 *
 * Fixtures are built under `os.tmpdir()`. Nothing writes into the repository,
 * and no generator is invoked except through an injected stub.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  EXCLUDED_SEGMENTS,
  LEGACY_REFERENCES,
  REQUIRED_DOCUMENTS,
  auditPublicDocs,
  caseExactExists,
  collectPublicDocuments,
  detectSpanish,
  isExcluded,
  localLinksOf,
  mermaidBlocksOf,
  validateMermaid,
} from '../index.mjs';

const REPO_ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../../../../..');

/** A fixture repository containing every required document, all valid. */
function makeFixture(overrides = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'public-doc-set-'));
  const files = {
    'README.md': '# Readme\n\nSee [architecture](docs/architecture/index.md).\n',
    'CONTRIBUTING.md': '# Contributing\n\nSee [ownership](docs/ownership.md).\n',
    'SECURITY.md': '# Security\n\nSee [releasing](docs/releasing.md).\n',
    'CODE_OF_CONDUCT.md': '# Conduct\n\nSee [security](SECURITY.md).\n',
    'CHANGELOG.md': '# Changelog\n\nSee [releasing](docs/releasing.md).\n',
    'LICENSE': 'MIT License\n',
    'docs/architecture/index.md': '# Architecture\n\nSee [customization](../customization.md).\n',
    'docs/customization.md': '# Customization\n\nSee [ownership](ownership.md).\n',
    'docs/ownership.md': '# Ownership\n\nSee [releasing](releasing.md).\n',
    'docs/releasing.md': '# Releasing\n\nSee [architecture](architecture/index.md).\n',
    ...overrides,
  };
  for (const [relative, contents] of Object.entries(files)) {
    if (contents === null) continue;
    const target = path.join(root, relative);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, contents);
  }
  return root;
}

/** Runs the gate over a fixture without invoking any real generator. */
function audit(root, generatedDocuments = []) {
  return auditPublicDocs({
    repoRoot: root,
    packageRoot: root,
    runGenerators: true,
    generatedDocuments,
  });
}

const kinds = (result) => result.findings.map((finding) => finding.kind).sort();

test('a clean fixture produces no findings', () => {
  const result = audit(makeFixture());
  assert.deepEqual(result.findings, []);
  assert.ok(result.documents.length >= 9);
  assert.ok(result.linkCount >= 9);
});

test('RED: a link to a file that does not exist is reported', () => {
  const root = makeFixture({
    'README.md': '# Readme\n\nSee [gone](docs/does-not-exist.md).\n',
  });
  const result = audit(root);
  assert.ok(kinds(result).includes('broken-link'));
  const finding = result.findings.find((entry) => entry.kind === 'broken-link');
  assert.equal(finding.detail, 'docs/does-not-exist.md');
});

test('RED: a link whose only defect is casing is reported', () => {
  // The target exists as docs/ownership.md. On a case-insensitive filesystem
  // fs.existsSync would answer yes for this link and the defect would ship.
  const root = makeFixture({
    'README.md': '# Readme\n\nSee [ownership](docs/Ownership.md).\n',
  });
  assert.equal(fs.existsSync(path.join(root, 'docs/Ownership.md')), true, 'precondition: host is case-insensitive');
  const result = audit(root);
  assert.ok(kinds(result).includes('broken-link'));
  assert.equal(
    result.findings.find((entry) => entry.kind === 'broken-link').detail,
    'docs/Ownership.md',
  );
});

test('RED: every legacy path fragment is reported', () => {
  for (const legacy of LEGACY_REFERENCES) {
    const root = makeFixture({
      'README.md': `# Readme\n\nThe owner lives at \`${legacy}\`.\n\nSee [ownership](docs/ownership.md).\n`,
    });
    const result = audit(root);
    const finding = result.findings.find((entry) => entry.kind === 'legacy-path');
    assert.ok(finding, `expected a legacy-path finding for ${legacy}`);
    assert.equal(finding.detail, legacy);
  }
});

test('RED: a missing required document is reported', () => {
  const root = makeFixture({ 'docs/ownership.md': null });
  const result = audit(root);
  const finding = result.findings.find((entry) => entry.kind === 'missing-required');
  assert.ok(finding);
  assert.equal(finding.document, 'docs/ownership.md');
});

test('RED: Spanish prose is reported, and English prose is not', () => {
  const spanish = [
    '# Guia',
    '',
    'Este documento describe los controles que puede usar cada tenant, y tambien',
    'las reglas para el compilador. Cuando una regla no se cumple, el sistema',
    'falla; por eso siempre debe revisarse desde el origen y no desde el',
    'artefacto, porque el artefacto se regenera.',
    '',
    'See [ownership](docs/ownership.md).',
  ].join('\n');
  const result = audit(makeFixture({ 'README.md': spanish }));
  assert.ok(kinds(result).includes('non-english'));

  // The real English set must stay clean under the same detector.
  for (const document of ['README.md', 'docs/architecture/index.md', 'docs/customization.md']) {
    const source = fs.readFileSync(path.join(REPO_ROOT, document), 'utf8');
    assert.equal(detectSpanish(source).spanish, false, `${document} must not be flagged`);
  }
});

test('RED: inverted punctuation alone is enough to flag a document', () => {
  const result = detectSpanish('# Title\n\nThe answer is simple. ¿Verdad?\n');
  assert.equal(result.spanish, true);
});

test('RED: malformed mermaid is reported by kind', () => {
  const cases = [
    ['```mermaid\n```', 'empty'],
    ['```mermaid\nnot-a-diagram A --> B\n```', 'unrecognised type'],
    ['```mermaid\nflowchart\n  A --> B\n```', 'missing direction'],
    ['```mermaid\nflowchart XX\n  A --> B\n```', 'bad direction'],
    ['```mermaid\nflowchart TD\n```', 'no body'],
    ['```mermaid\nflowchart TD\n  A["open --> B\n```', 'unbalanced quotes'],
    ['```mermaid\nflowchart TD\n  A[open --> B\n```', 'unbalanced brackets'],
  ];
  for (const [block, label] of cases) {
    const root = makeFixture({
      'README.md': `# Readme\n\n${block}\n\nSee [ownership](docs/ownership.md).\n`,
    });
    const result = audit(root);
    assert.ok(kinds(result).includes('mermaid'), `expected a mermaid finding for: ${label}`);
  }
});

test('an unterminated mermaid fence is reported rather than ignored', () => {
  const root = makeFixture({
    'README.md': '# Readme\n\n```mermaid\nflowchart TD\n  A --> B\n\nSee [ownership](docs/ownership.md).\n',
  });
  const result = audit(root);
  const finding = result.findings.find((entry) => entry.kind === 'mermaid');
  assert.ok(finding);
  assert.match(finding.detail, /unterminated/u);
});

test('valid mermaid of each shipped type passes', () => {
  const valid = [
    'flowchart TD\n  A["x"] --> B',
    'graph LR\n  A --> B',
    'sequenceDiagram\n  A->>B: hello',
    'stateDiagram-v2\n  [*] --> Idle',
  ];
  for (const block of valid) {
    assert.equal(validateMermaid(block).valid, true, `expected valid: ${block.split('\n')[0]}`);
  }
});

test('RED: a generator reporting stale output fails the gate', () => {
  const root = makeFixture();
  const result = audit(root, [
    { document: 'generated/stale.md', check: ['node', '-e', 'process.exit(1)'] },
  ]);
  const finding = result.findings.find((entry) => entry.kind === 'stale-generated');
  assert.ok(finding);
  assert.equal(result.generated[0].state, 'STALE');
});

test('a generator reporting fresh output does not fail the gate', () => {
  const result = audit(makeFixture(), [
    { document: 'generated/fresh.md', check: ['node', '-e', 'process.exit(0)'] },
  ]);
  assert.deepEqual(result.findings, []);
  assert.equal(result.generated[0].state, 'FRESH');
});

test('a generated document with no --check owner is UNVERIFIABLE, never silently fresh', () => {
  const result = audit(makeFixture(), [{ document: 'generated/unowned.md', check: null }]);
  assert.equal(result.generated[0].state, 'UNVERIFIABLE');
  assert.deepEqual(result.findings, []);
});

test('excluded historical content cannot fail the gate', () => {
  // Each excluded tree gets a document carrying every defect at once.
  const poison = [
    '# Histórico',
    '',
    'Este documento describe los controles para cada tenant, y tambien las',
    'reglas del compilador cuando una regla no se cumple.',
    '',
    'Ver [roto](./no-existe.md) y `src/ui/primitives/Button` y `docs/ARCHITECTURE.md`.',
    '',
    '```mermaid',
    'not-a-diagram',
    '```',
  ].join('\n');

  const overrides = {};
  for (const segment of ['docs/history', 'docs/evidence']) {
    overrides[`${segment}/poison.md`] = poison;
  }
  const root = makeFixture(overrides);

  for (const segment of ['docs/history', 'docs/evidence']) {
    assert.equal(
      fs.existsSync(path.join(root, segment, 'poison.md')),
      true,
      `precondition: ${segment}/poison.md was planted`,
    );
  }

  const result = audit(root);
  assert.deepEqual(result.findings, [], 'excluded trees must not produce findings');
  assert.equal(
    result.documents.some((document) => document.includes('history') || document.includes('evidence')),
    false,
    'excluded trees must not be scanned',
  );
});

test('every declared exclusion is honoured by the path predicate', () => {
  for (const segment of EXCLUDED_SEGMENTS) {
    assert.equal(isExcluded(segment), true, segment);
    assert.equal(isExcluded(`${segment}/nested/file.md`), true, `${segment}/nested`);
  }
  assert.equal(isExcluded('docs/architecture/index.md'), false);
  assert.equal(isExcluded('README.md'), false);
});

test('link extraction ignores URLs, mail and pure anchors', () => {
  const links = localLinksOf(
    '[a](docs/a.md) [b](https://example.com) [c](mailto:x@example.com) [d](#anchor) [e](docs/e.md#frag)',
  );
  assert.deepEqual(links, ['docs/a.md', 'docs/e.md']);
});

test('case-exact existence rejects a wrongly-cased segment mid-path', () => {
  const root = makeFixture();
  assert.equal(caseExactExists(path.join(root, 'docs/architecture/index.md'), root), true);
  assert.equal(caseExactExists(path.join(root, 'Docs/architecture/index.md'), root), false);
  assert.equal(caseExactExists(path.join(root, 'docs/Architecture/index.md'), root), false);
});

test('NON-VACUITY: the real tree is scanned at a realistic scale', () => {
  // A gate that reaches nothing passes every assertion above. These floors are
  // measured against the committed set, so a scope regression fails here.
  const documents = collectPublicDocuments(REPO_ROOT);
  assert.ok(documents.length >= 10, `expected >= 10 public documents, found ${documents.length}`);

  let links = 0;
  let mermaid = 0;
  for (const document of documents) {
    const source = fs.readFileSync(path.join(REPO_ROOT, document), 'utf8');
    links += localLinksOf(source).length;
    mermaid += mermaidBlocksOf(source).length;
  }
  assert.ok(links >= 40, `expected >= 40 local links, found ${links}`);
  assert.ok(mermaid >= 5, `expected >= 5 mermaid blocks, found ${mermaid}`);

  for (const required of REQUIRED_DOCUMENTS) {
    assert.equal(
      caseExactExists(path.resolve(REPO_ROOT, required), REPO_ROOT),
      true,
      `${required} must exist in the real tree`,
    );
  }
});
