/**
 * The drill for `consumer-proof`: the gate must be seen failing, per leg.
 *
 * Six plants, six reds. A gate whose classifier returned "clean" for everything
 * would report zero findings on a broken fixture and look exactly like a
 * healthy contract, so every drill here asserts a specific planted violation is
 * REPORTED, and the roster assertion keeps a new leg from arriving without one.
 *
 * The last two plants belong to the R4 amendment of WO-CON-04. DEL-03 built a
 * four-file scratch package whose built module and declaration exported only
 * `unrelated`, and `auditPublished` returned `[]` while the fixture imported
 * `Button` and `DesignSystemProvider`; it then retyped an emitted
 * `mount/index.d.ts` and watched the gate exit 0 while a real bundler consumer
 * flipped to TS2345. Both reproductions are executable here, by name.
 */
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
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
  TWINNED_DRILL_CLASSES,
  auditPresence,
  auditPublished,
  auditSurface,
  auditWiring,
  declaredExports,
  guaranteedSubpaths,
  installPackedConsumer,
  readAppImports,
  rootImportNames,
  runDrill,
  subpathOf,
} from '../index.mjs';
import { packageRoot as findPackageRoot } from '../../../libraries/repo-root/index.mjs';

const PACKAGE_ROOT = findPackageRoot(import.meta.dirname);
const BUILT = existsSync(join(PACKAGE_ROOT, 'dist/build-stamp.json'));

/**
 * One run per drill class for the whole file: the two packed drills install a
 * tarball and compile against it, and a second identical run would only measure
 * the same thing again more slowly.
 */
const DRILL_RESULTS = new Map();
async function drillOnce(drill) {
  if (!DRILL_RESULTS.has(drill)) DRILL_RESULTS.set(drill, await runDrill(drill));
  return DRILL_RESULTS.get(drill);
}

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

test('every declared drill class is planted and every plant is caught', { timeout: 1800000 }, async (t) => {
  assert.deepEqual(
    [...DRILL_CLASSES].sort(),
    [
      'emitted-declaration',
      'forbidden-import',
      'missing-capitalized-export',
      'missing-fixture',
      'mount-signature',
      'unwired-alias',
    ],
  );
  for (const drill of DRILL_CLASSES) {
    if (TWINNED_DRILL_CLASSES.includes(drill) && !BUILT) {
      t.diagnostic(`dist/ is absent; ${drill} is a post-build subject`);
      continue;
    }
    const { findings } = await drillOnce(drill);
    assert.ok(findings.length > 0, `drill ${drill} planted a violation the gate did not report`);
  }
});

test('the mount-signature drill fails on the SIGNATURE, not on a missing module', { timeout: 900000 }, async () => {
  const { findings } = await drillOnce('mount-signature');
  assert.ok(findings.every((finding) => finding.leg === 'signature'));
  const detail = findings.map((finding) => finding.detail).join('\n');
  // A shim that failed to resolve would report TS2307 "cannot find module";
  // the drill is only evidence if the diagnostics are about the call itself.
  assert.equal(/error TS2307/.test(detail), false, detail);
  assert.match(detail, /error TS(2554|2339|2551|2353|2571)/);
  assert.match(detail, /layout\.tsx|tenant-layout\.tsx/);
});

test('an unknown drill class is refused rather than silently passing', async () => {
  await assert.rejects(() => runDrill('no-such-drill'), /unknown drill class/);
});

test('the gate names the fixture the vitest integration project collects', () => {
  assert.equal(FIXTURE_DIR.startsWith('tests/integration/'), true);
  assert.equal(FIXTURE_SUITE, `${FIXTURE_DIR}/index.test.ts`);
});

test('the DEL-03 scratch package is caught, and the two names it hid are named', async () => {
  const workspace = mkdtempSync(join(tmpdir(), 'consumer-proof-scratch-'));
  try {
    mkdirSync(join(workspace, 'dist'), { recursive: true });
    mkdirSync(join(workspace, FIXTURE_APP), { recursive: true });
    writeFileSync(join(workspace, 'package.json'), JSON.stringify({
      name: '@rottay/design-system',
      version: '0.0.0',
      type: 'module',
      exports: { '.': { types: './dist/index.d.ts', import: './dist/index.js' } },
    }, null, 2));
    writeFileSync(join(workspace, 'dist/index.js'), 'export const unrelated = 1;\n');
    writeFileSync(join(workspace, 'dist/index.d.ts'), 'export declare const unrelated: number;\n');
    writeFileSync(
      join(workspace, FIXTURE_APP, 'page.tsx'),
      "import { Button, DesignSystemProvider } from '@rottay/design-system';\nexport default function Page() {\n  return <DesignSystemProvider><Button /></DesignSystemProvider>;\n}\n",
    );

    const findings = await auditPublished({ packageRoot: workspace });
    const detail = findings.map((finding) => finding.detail).join('\n');
    assert.ok(findings.length >= 2, detail);
    assert.ok(findings.every((finding) => finding.leg === 'published'));
    assert.match(detail, /does not declare Button|no longer declares Button/);
    assert.match(detail, /DesignSystemProvider/);
  } finally {
    rmSync(workspace, { recursive: true, force: true });
  }
});

test('a declaration that publishes the name is not reported as missing', async () => {
  const workspace = mkdtempSync(join(tmpdir(), 'consumer-proof-declared-'));
  try {
    mkdirSync(join(workspace, 'dist'), { recursive: true });
    mkdirSync(join(workspace, FIXTURE_APP), { recursive: true });
    writeFileSync(join(workspace, 'package.json'), JSON.stringify({
      name: '@rottay/design-system',
      version: '0.0.0',
      type: 'module',
      exports: { '.': { types: './dist/index.d.ts', import: './dist/index.js' } },
    }, null, 2));
    // Re-exported through a chain, which is the shape a regular expression over
    // the entry declaration would answer wrongly.
    writeFileSync(join(workspace, 'dist/button.d.ts'), 'export declare const Button: () => null;\n');
    writeFileSync(join(workspace, 'dist/button.js'), 'export const Button = () => null;\n');
    writeFileSync(join(workspace, 'dist/index.d.ts'), "export * from './button';\nexport type Only = string;\n");
    writeFileSync(join(workspace, 'dist/index.js'), "export * from './button.js';\n");
    writeFileSync(
      join(workspace, FIXTURE_APP, 'page.tsx'),
      "import { Button, type Only } from '@rottay/design-system';\nexport default Button;\nexport type { Only };\n",
    );
    assert.deepEqual(await auditPublished({ packageRoot: workspace }), []);

    const declared = await declaredExports(join(workspace, 'dist/index.d.ts'));
    assert.equal(declared.get('Button'), true);
    assert.equal(declared.get('Only'), false);
  } finally {
    rmSync(workspace, { recursive: true, force: true });
  }
});

test('a declared value that the built module does not carry is still reported', async () => {
  const workspace = mkdtempSync(join(tmpdir(), 'consumer-proof-hollow-'));
  try {
    mkdirSync(join(workspace, 'dist'), { recursive: true });
    mkdirSync(join(workspace, FIXTURE_APP), { recursive: true });
    writeFileSync(join(workspace, 'package.json'), JSON.stringify({
      name: '@rottay/design-system',
      version: '0.0.0',
      type: 'module',
      exports: { '.': { types: './dist/index.d.ts', import: './dist/index.js' } },
    }, null, 2));
    writeFileSync(join(workspace, 'dist/index.d.ts'), 'export declare const Button: () => null;\n');
    writeFileSync(join(workspace, 'dist/index.js'), 'export const somethingElse = 1;\n');
    writeFileSync(
      join(workspace, FIXTURE_APP, 'page.tsx'),
      "import { Button } from '@rottay/design-system';\nexport default Button;\n",
    );
    const findings = await auditPublished({ packageRoot: workspace });
    assert.equal(findings.length, 1);
    assert.match(findings[0].detail, /no longer exports Button/);
  } finally {
    rmSync(workspace, { recursive: true, force: true });
  }
});

test('the packed consumer resolves through node_modules, with no alias to this repository', { timeout: 900000 }, (t) => {
  if (!BUILT) {
    t.skip('dist/ is absent; the packed consumer is a post-build subject');
    return;
  }
  const { workspace, packedRoot } = installPackedConsumer({ packageRoot: PACKAGE_ROOT });
  try {
    const tsconfig = JSON.parse(readFileSync(join(workspace, 'tsconfig.json'), 'utf8'));
    assert.equal('paths' in tsconfig.compilerOptions, false);
    assert.equal('baseUrl' in tsconfig.compilerOptions, false);
    assert.equal(JSON.stringify(tsconfig).includes(join(PACKAGE_ROOT, 'src')), false);
    assert.equal(existsSync(join(packedRoot, 'dist/index.d.ts')), true);
    assert.equal(existsSync(join(packedRoot, 'src')), false);
    assert.equal(packedRoot.startsWith(join(workspace, 'node_modules')), true);
  } finally {
    rmSync(workspace, { recursive: true, force: true });
  }
});

test('the missing-capitalized-export plant turns the packed leg red, and its twin is green', { timeout: 1800000 }, async (t) => {
  if (!BUILT) {
    t.skip('dist/ is absent; the packed drills are post-build subjects');
    return;
  }
  const { findings, twinFindings, dropped } = await drillOnce('missing-capitalized-export');
  assert.equal(/^[A-Z]/.test(dropped), true);
  assert.ok(rootImportNames(PACKAGE_ROOT).includes(dropped));
  assert.deepEqual(twinFindings, []);
  const detail = findings.map((finding) => finding.detail).join('\n');
  assert.ok(findings.every((finding) => finding.leg === 'packed'), detail);
  // The declaration leg names it, and the compiler refuses the import: a plant
  // that only produced TS2307 would mean the package stopped resolving at all.
  assert.match(detail, new RegExp(`no longer declares ${dropped}`));
  assert.match(detail, new RegExp(`error TS2305: Module '"@rottay/design-system"' has no exported member '${dropped}'`));
  assert.equal(/error TS2307/.test(detail), false, detail);
});

test('the emitted-declaration plant turns the packed leg red, and its twin is green', { timeout: 1800000 }, async (t) => {
  if (!BUILT) {
    t.skip('dist/ is absent; the packed drills are post-build subjects');
    return;
  }
  const { findings, twinFindings } = await drillOnce('emitted-declaration');
  assert.deepEqual(twinFindings, []);
  const detail = findings.map((finding) => finding.detail).join('\n');
  assert.ok(findings.every((finding) => finding.leg === 'packed'), detail);
  assert.match(detail, /error TS2345/);
  assert.match(detail, /layout\.tsx|tenant-layout\.tsx/);
  assert.equal(/error TS2307/.test(detail), false, detail);
});
