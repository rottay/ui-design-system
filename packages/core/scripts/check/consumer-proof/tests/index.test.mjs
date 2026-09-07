/**
 * The drill for `consumer-proof`: the gate must be seen failing, per leg.
 *
 * Four plants, four legs, four reds. A gate whose classifier returned "clean"
 * for everything would report zero findings on a broken fixture and look
 * exactly like a healthy contract, so every drill here asserts a specific
 * planted violation is REPORTED, and the roster assertion keeps a new leg from
 * arriving without one.
 */
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import {
  CONTRACT_DOCUMENT,
  DRILL_CLASSES,
  FIXTURE_APP,
  FIXTURE_DIR,
  FIXTURE_SUITE,
  PUBLIC_SPECIFIER_SOURCES,
  auditPresence,
  auditPublished,
  auditSurface,
  auditWiring,
  guaranteedSubpaths,
  readAppImports,
  runDrill,
  subpathOf,
} from '../index.mjs';
import { packageRoot as findPackageRoot } from '../../../libraries/repo-root/index.mjs';

const PACKAGE_ROOT = findPackageRoot(import.meta.dirname);

test('the fixture the gate audits is on disk where the gate says it is', () => {
  assert.equal(existsSync(join(PACKAGE_ROOT, FIXTURE_SUITE)), true);
  assert.equal(existsSync(join(PACKAGE_ROOT, FIXTURE_APP)), true);
  assert.equal(existsSync(join(PACKAGE_ROOT, CONTRACT_DOCUMENT)), true);
  for (const source of Object.values(PUBLIC_SPECIFIER_SOURCES)) {
    assert.equal(existsSync(join(PACKAGE_ROOT, source)), true, source);
  }
});

test('the clean tree is green on every leg that does not need a build', async () => {
  assert.deepEqual(auditPresence(), []);
  assert.deepEqual(auditWiring(), []);
  assert.deepEqual(auditSurface(), []);
});

test('the published leg is green on a built tree, and states when it cannot run', async (t) => {
  if (!existsSync(join(PACKAGE_ROOT, 'dist/build-stamp.json'))) {
    t.skip('dist/ is absent; the published leg is a post-build subject');
    return;
  }
  assert.deepEqual(await auditPublished(), []);
});

test('the fixture addresses the package, and every specifier it names is readable', () => {
  const imports = readAppImports(join(PACKAGE_ROOT, FIXTURE_APP), PACKAGE_ROOT);
  const packageImports = imports.filter((entry) => subpathOf(entry.specifier) !== null);
  assert.ok(packageImports.length >= 4, `only ${packageImports.length} design-system imports`);
  assert.ok(packageImports.some((entry) => entry.names.includes('mountTenantTheme')));
  assert.ok(packageImports.some((entry) => entry.specifier.endsWith('/icons')));
});

test('subpathOf answers only for this package', () => {
  assert.equal(subpathOf('@rottay/design-system'), '.');
  assert.equal(subpathOf('@rottay/design-system/server'), './server');
  assert.equal(subpathOf('@rottay/design-system-extras'), null);
  assert.equal(subpathOf('react'), null);
});

test('the document reader refuses a table it cannot trust', () => {
  assert.throws(() => guaranteedSubpaths('no fences here'), /fences/);
  assert.throws(
    () => guaranteedSubpaths(
      '<!-- consumer-contract:published:end -->\n<!-- consumer-contract:published:start -->',
    ),
    /fences/,
  );
  assert.throws(
    () => guaranteedSubpaths([
      '<!-- consumer-contract:published:start -->',
      '| Subpath | Disposition |',
      '| --- | --- |',
      '| `./server` | retire-by |',
      '<!-- consumer-contract:published:end -->',
    ].join('\n')),
    /no guaranteed row/,
  );
});

test('presence fails on a tree whose fixture is an empty folder', () => {
  const workspace = mkdtempSync(join(tmpdir(), 'consumer-proof-presence-'));
  try {
    mkdirSync(join(workspace, FIXTURE_APP), { recursive: true });
    const findings = auditPresence({ packageRoot: workspace });
    assert.ok(findings.length >= 2, JSON.stringify(findings));
    assert.ok(findings.every((finding) => finding.leg === 'presence'));
  } finally {
    rmSync(workspace, { recursive: true, force: true });
  }
});

test('surface fails when the fixture reaches outside the guaranteed table', () => {
  const workspace = mkdtempSync(join(tmpdir(), 'consumer-proof-surface-'));
  try {
    mkdirSync(join(workspace, FIXTURE_APP), { recursive: true });
    writeFileSync(
      join(workspace, FIXTURE_APP, 'page.tsx'),
      "import { Button } from '@rottay/design-system/primitives/button';\nexport default Button;\n",
    );
    const findings = auditSurface({
      packageRoot: workspace,
      documentMarkdown: [
        '<!-- consumer-contract:published:start -->',
        '| Subpath | Disposition | Retire-by |',
        '| --- | --- | --- |',
        '| `.` | guaranteed | — |',
        '| `./primitives/button` | retire-by | WO-RET-01 |',
        '<!-- consumer-contract:published:end -->',
      ].join('\n'),
    });
    assert.equal(findings.length, 1);
    assert.match(findings[0].detail, /primitives\/button/);
  } finally {
    rmSync(workspace, { recursive: true, force: true });
  }
});

test('every declared drill class is planted and every plant is caught', { timeout: 900000 }, () => {
  assert.deepEqual(
    [...DRILL_CLASSES].sort(),
    ['forbidden-import', 'missing-fixture', 'mount-signature', 'unwired-alias'],
  );
  for (const drill of DRILL_CLASSES) {
    const { findings } = runDrill(drill);
    assert.ok(findings.length > 0, `drill ${drill} planted a violation the gate did not report`);
  }
});

test('the mount-signature drill fails on the SIGNATURE, not on a missing module', { timeout: 900000 }, () => {
  const { findings } = runDrill('mount-signature');
  assert.ok(findings.every((finding) => finding.leg === 'signature'));
  const detail = findings.map((finding) => finding.detail).join('\n');
  // A shim that failed to resolve would report TS2307 "cannot find module";
  // the drill is only evidence if the diagnostics are about the call itself.
  assert.equal(/error TS2307/.test(detail), false, detail);
  assert.match(detail, /error TS(2554|2339|2551|2353|2571)/);
  assert.match(detail, /layout\.tsx|tenant-layout\.tsx/);
});

test('an unknown drill class is refused rather than silently passing', () => {
  assert.throws(() => runDrill('no-such-drill'), /unknown drill class/);
});

test('the gate names the fixture the vitest integration project collects', () => {
  assert.equal(FIXTURE_DIR.startsWith('tests/integration/'), true);
  assert.equal(FIXTURE_SUITE, `${FIXTURE_DIR}/index.test.ts`);
});
