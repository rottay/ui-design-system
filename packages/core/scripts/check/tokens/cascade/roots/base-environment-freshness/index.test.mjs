import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { packageRoot as findPackageRoot } from '../../../../../libraries/repo-root/index.mjs';
import {
  baseEnvironmentPath,
  digestOf,
  projectBaseEnvironment,
  serializeBaseEnvironment,
  baseEnvironmentDocument,
  verticalBundlePath,
} from '../../../../../libraries/tokens/base-environment/index.mjs';
import { auditAll, auditSnapshot } from './index.mjs';

const CORE_ROOT = findPackageRoot(dirname(fileURLToPath(import.meta.url)));
const VERTICAL = 'bithire';

/**
 * A scratch tree with exactly the two files the gate reads, so a planted drift
 * is measured against a copy and never against the repository.
 */
function scratch() {
  const root = mkdtempSync(join(tmpdir(), 'base-environment-drill-'));
  for (const mode of ['light', 'dark']) {
    const to = baseEnvironmentPath(root, VERTICAL, mode);
    cpSync(baseEnvironmentPath(CORE_ROOT, VERTICAL, mode), to, { recursive: false, force: true, mkdir: true });
  }
  cpSync(verticalBundlePath(CORE_ROOT, VERTICAL), verticalBundlePath(root, VERTICAL));
  return root;
}

/* ── 1. the tree as it stands ──────────────────────────────────────────────── */

test('the committed projections are fresh and self-consistent', async () => {
  const { audited, findings } = await auditAll({ slugs: [VERTICAL] });
  assert.equal(findings.length, 0, findings.join('\n'));
  assert.equal(audited, 2, 'a census that audits nothing is a vacuous pass');
});

/* ── 2. the gate is shown REFUSING each drift it exists for ─────────────────── */

test('MUTANT: a moved channel is named with its before and after', () => {
  const root = scratch();
  try {
    const path = baseEnvironmentPath(root, VERTICAL, 'light');
    const document = JSON.parse(readFileSync(path, 'utf8'));
    const channel = Object.keys(document.channels)[0];
    document.channels[channel] = 'PLANTED';
    document.digest = digestOf({ vertical: document.vertical, mode: document.mode, channels: document.channels });
    writeFileSync(path, serializeBaseEnvironment(document));
    const findings = auditSnapshot({ coreRoot: root, vertical: VERTICAL, mode: 'light' });
    assert.ok(findings.some((finding) => finding.includes('stale against its bundle')), findings.join('\n'));
    assert.ok(findings.some((finding) => finding.includes(channel)), 'the finding names the channel that moved');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('MUTANT: a hand-edited snapshot whose digest was not recomputed is named', () => {
  const root = scratch();
  try {
    const path = baseEnvironmentPath(root, VERTICAL, 'dark');
    const document = JSON.parse(readFileSync(path, 'utf8'));
    document.channels['--ds-planted-by-hand'] = '#000000';
    writeFileSync(path, serializeBaseEnvironment(document));
    const findings = auditSnapshot({ coreRoot: root, vertical: VERTICAL, mode: 'dark' });
    assert.ok(
      findings.some((finding) => finding.includes('does not describe its own channels')),
      findings.join('\n'),
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('MUTANT: a missing snapshot is a finding, not a skip', () => {
  const root = scratch();
  try {
    rmSync(baseEnvironmentPath(root, VERTICAL, 'light'), { force: true });
    const findings = auditSnapshot({ coreRoot: root, vertical: VERTICAL, mode: 'light' });
    assert.ok(findings.some((finding) => finding.includes('missing')), findings.join('\n'));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

/* ── 3. the projector's own law ────────────────────────────────────────────── */

test('the projection excludes container scopes, language scopes and conditional queries', () => {
  const css = [
    ':root { --ds-a: 1px; --ds-b: 2px; }',
    "[data-density='compact']:not(:root) { --ds-a: 99px; }",
    'html[lang]:lang(ar) { --ds-b: 99px; }',
    '@media print { :root { --ds-a: 98px; } }',
    '.ds-some-component { --ds-c: 3px; }',
    `/* === ${VERTICAL} tenant overrides === */`,
    ":is(html[data-tenant='bithire']) { --ds-a: 77px; }",
  ].join('\n');
  const projected = projectBaseEnvironment(css, { vertical: VERTICAL, mode: 'light' });
  assert.deepEqual(projected.channels, { '--ds-a': '1px', '--ds-b': '2px' });
});

test('the mode arm of a root selector is read, and the other mode is not', () => {
  const css = [
    ':root { --ds-ink: #000; }',
    ":root[data-theme='dark'], html.dark { --ds-ink: #fff; }",
    `/* === ${VERTICAL} tenant overrides === */`,
  ].join('\n');
  assert.equal(projectBaseEnvironment(css, { vertical: VERTICAL, mode: 'light' }).channels['--ds-ink'], '#000');
  assert.equal(projectBaseEnvironment(css, { vertical: VERTICAL, mode: 'dark' }).channels['--ds-ink'], '#fff');
});

test('an unlayered declaration outranks every layer, as the browser sorts it', () => {
  const css = [
    '@layer rottay-tokens, rottay-components;',
    '@layer rottay-components { :root { --ds-x: components; } }',
    '@layer rottay-tokens { :root { --ds-x: tokens; } }',
    `/* === ${VERTICAL} tenant overrides === */`,
  ].join('\n');
  assert.equal(projectBaseEnvironment(css, { vertical: VERTICAL, mode: 'light' }).channels['--ds-x'], 'components');
  const unlayered = [
    '@layer rottay-tokens, rottay-components;',
    '@layer rottay-components { :root { --ds-x: components; } }',
    ':root { --ds-x: unlayered; }',
    `/* === ${VERTICAL} tenant overrides === */`,
  ].join('\n');
  assert.equal(projectBaseEnvironment(unlayered, { vertical: VERTICAL, mode: 'light' }).channels['--ds-x'], 'unlayered');
});

test('a bundle with no tenant marker is REFUSED, never projected whole', () => {
  assert.throws(
    () => projectBaseEnvironment(':root { --ds-a: 1px; }', { vertical: VERTICAL, mode: 'light' }),
    /tenant-artifact marker/,
  );
});

test('the committed document carries its generator and a matching digest', () => {
  const document = baseEnvironmentDocument(
    readFileSync(verticalBundlePath(CORE_ROOT, VERTICAL), 'utf8'),
    { vertical: VERTICAL, mode: 'light' },
  );
  assert.equal(document.generated, true);
  assert.match(document.generator, /base-environment/);
  assert.ok(document.channelCount > 3000, 'the projection is a population, not a sample');
  assert.equal(
    document.digest,
    digestOf({ vertical: document.vertical, mode: document.mode, channels: document.channels }),
  );
});
