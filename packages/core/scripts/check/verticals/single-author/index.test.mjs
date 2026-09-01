/**
 * Causal drills for the first-party single-author gate.
 *
 * A gate that has never been observed to go red is a decoration. Every drill
 * below plants exactly one defect on a disposable fixture tree and asserts the
 * gate names it, and every drill routes through the SAME exported enforcer
 * that `--check` calls (`runFirstPartySingleAuthorGate`) — there is no parallel
 * regex copy here that could pass while the shipped gate is broken.
 *
 * Fixture roots are injected, never mutated in place: the live tree is only
 * ever READ (the self-check drill), so a crashed run cannot leave a planted
 * `_source/extension.css` behind in the repository.
 */

import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, test } from 'node:test';

import {
  PRESERVED_FIRST_PARTY_SLUGS,
  RETIRED_VERTICAL_SLUG,
  runFirstPartySingleAuthorGate,
} from './index.mjs';

const scratchRoots = [];

after(() => {
  for (const root of scratchRoots) rmSync(root, { recursive: true, force: true });
});

/**
 * A byte-shaped miniature of the post-severance repository: three artifact
 * directories, one authored source each, and three production surfaces that
 * speak only the surviving single-source API.
 */
function makeCleanFixture() {
  const root = mkdtempSync(join(tmpdir(), 'single-author-drill-'));
  scratchRoots.push(root);

  const cssRoot = join(root, 'css');
  const artifactsRoot = join(cssRoot, 'facade/artifacts');
  for (const slug of PRESERVED_FIRST_PARTY_SLUGS) {
    mkdirSync(join(artifactsRoot, slug), { recursive: true });
    writeFileSync(join(artifactsRoot, slug, 'index.css'), `:root { --ds-color-text-primary: #101010; }\n`);
  }
  mkdirSync(join(cssRoot, 'runtime/engines/modern'), { recursive: true });
  writeFileSync(join(cssRoot, 'runtime/engines/modern', 'skin.css'), '/* engine skin */\n');

  const productionRoot = join(root, 'production');
  mkdirSync(productionRoot, { recursive: true });
  const productionFiles = [
    join(productionRoot, 'artifact-renderer.ts'),
    join(productionRoot, 'tenant-css-barrel.ts'),
    join(productionRoot, 'build-vertical-artifacts.mjs'),
  ];
  writeFileSync(
    productionFiles[0],
    [
      'export function renderVerticalArtifact({ tenantSlug, compiledCssVariables }) {',
      '  const rootInk = compiledCssVariables[\'--ds-color-text-primary\'];',
      '  if (!rootInk) throw new Error(`${tenantSlug} has no compiled ink`);',
      '  return `:root {\\n  color: var(--ds-color-text-primary);\\n}`;',
      '}',
      '',
    ].join('\n'),
  );
  writeFileSync(productionFiles[1], "export { renderVerticalArtifact } from './artifact-renderer';\n");
  writeFileSync(productionFiles[2], '#!/usr/bin/env node\n// builds the first-party artifacts\n');

  return {
    root,
    cssRoot,
    artifactsRoot,
    productionFiles,
    options: {
      cssRoot,
      artifactsRoot,
      productionFiles,
      rosterSlugs: [...PRESERVED_FIRST_PARTY_SLUGS],
    },
  };
}

function findingsFor(check, result) {
  return result.findings.filter((finding) => finding.check === check);
}

test('BASELINE: the clean fixture tree is green under the shipped enforcer', () => {
  const fixture = makeCleanFixture();
  const result = runFirstPartySingleAuthorGate(fixture.options);
  assert.deepEqual(
    result.findings,
    [],
    `clean fixture must be green; got ${JSON.stringify(result.findings, null, 2)}`,
  );
  assert.deepEqual(result.directorySlugs, [...PRESERVED_FIRST_PARTY_SLUGS].sort());
});

test('SELF-CHECK: the live repository tree is green, roster executed from source', () => {
  const result = runFirstPartySingleAuthorGate();
  assert.deepEqual(
    result.findings,
    [],
    `live tree must be green; got ${JSON.stringify(result.findings, null, 2)}`,
  );
  // Derived by EXECUTING the authored TypeScript roster, not restated here.
  assert.deepEqual(result.rosterSlugs, [...PRESERVED_FIRST_PARTY_SLUGS].sort());
  assert.deepEqual(result.directorySlugs, [...PRESERVED_FIRST_PARTY_SLUGS].sort());
});

test('MUTANT G2: a resurrected rottay _source/extension.css is caught and named', () => {
  const fixture = makeCleanFixture();
  const resurrected = join(fixture.artifactsRoot, 'rottay/_source');
  mkdirSync(resurrected, { recursive: true });
  writeFileSync(join(resurrected, 'extension.css'), ':root { color: #000; }\n');

  const result = runFirstPartySingleAuthorGate(fixture.options);
  const g2 = findingsFor('G2', result);
  assert.ok(g2.length >= 2, `expected the _source directory AND the file to be named; got ${JSON.stringify(g2)}`);
  assert.ok(g2.some((f) => f.message.includes('_source') && f.message.includes('rottay')));
  assert.ok(g2.some((f) => f.message.includes('extension.css') && f.message.includes('rottay')));
});

test('MUTANT G2: an extension.css outside facade/ is caught (the wide-root law)', () => {
  const fixture = makeCleanFixture();
  writeFileSync(join(fixture.cssRoot, 'runtime/engines/modern', 'extension.css'), '/* second author */\n');

  const result = runFirstPartySingleAuthorGate(fixture.options);
  const g2 = findingsFor('G2', result);
  assert.equal(g2.length, 1);
  assert.ok(g2[0].message.includes('runtime/engines/modern'), g2[0].message);
});

test('MUTANT G2: an arbitrary symlink anywhere under the CSS root is caught and named', () => {
  const fixture = makeCleanFixture();
  const outside = join(fixture.root, 'outside');
  mkdirSync(outside, { recursive: true });
  writeFileSync(join(outside, 'borrowed.css'), ':root { color: #fff; }\n');
  symlinkSync(join(outside, 'borrowed.css'), join(fixture.cssRoot, 'runtime/engines/modern', 'skin-alias.css'));

  const result = runFirstPartySingleAuthorGate(fixture.options);
  const g2 = findingsFor('G2', result);
  assert.equal(g2.length, 1, `an innocently named link is still a link: ${JSON.stringify(g2)}`);
  assert.ok(g2[0].message.includes('symbolic link'), g2[0].message);
  assert.ok(g2[0].message.includes('runtime/engines/modern/skin-alias.css'), g2[0].message);
});

test('MUTANT G2: a SYMLINKED _source is caught and named, and is never followed', () => {
  const fixture = makeCleanFixture();
  // The second author, parked outside the scanned root and reached by a link.
  const smuggled = join(fixture.root, 'outside/smuggled');
  mkdirSync(smuggled, { recursive: true });
  writeFileSync(join(smuggled, 'extension.css'), ':root { color: #000; }\n');
  symlinkSync(smuggled, join(fixture.artifactsRoot, 'rottay/_source'));

  const result = runFirstPartySingleAuthorGate(fixture.options);
  const g2 = findingsFor('G2', result);
  assert.ok(
    g2.some((f) => f.message.includes('symbolic link') && f.message.includes('rottay/_source')),
    `the link itself must be named: ${JSON.stringify(g2)}`,
  );
  assert.ok(
    g2.some((f) => f.message.includes("'_source'") && f.message.includes('rottay/_source')),
    `the forbidden identity must be named through the link: ${JSON.stringify(g2)}`,
  );
  // Not following is the point: the walk must not have descended into the
  // link's target, so the smuggled extension.css is never reached or reported.
  assert.ok(
    !g2.some((f) => f.message.includes('smuggled')),
    `the walk must not descend through a link: ${JSON.stringify(g2)}`,
  );
});

test('MUTANT G2: a case-variant _SOURCE directory is caught and named as authored', () => {
  const fixture = makeCleanFixture();
  const planted = join(fixture.artifactsRoot, 'evnto/_SOURCE');
  mkdirSync(planted, { recursive: true });
  writeFileSync(join(planted, 'notes.css'), ':root { color: #000; }\n');

  const result = runFirstPartySingleAuthorGate(fixture.options);
  const g2 = findingsFor('G2', result);
  assert.equal(g2.length, 1, JSON.stringify(g2));
  assert.ok(g2[0].message.includes("'_source'"), g2[0].message);
  assert.ok(g2[0].message.includes('evnto/_SOURCE'), `the path must be named as authored: ${g2[0].message}`);
});

test('MUTANT G2: a case-variant Extension.CSS file is caught and named as authored', () => {
  const fixture = makeCleanFixture();
  writeFileSync(join(fixture.artifactsRoot, 'bithire', 'Extension.CSS'), '/* second author */\n');

  const result = runFirstPartySingleAuthorGate(fixture.options);
  const g2 = findingsFor('G2', result);
  assert.equal(g2.length, 1, JSON.stringify(g2));
  assert.ok(g2[0].message.includes("'extension.css'"), g2[0].message);
  assert.ok(
    g2[0].message.includes('bithire/Extension.CSS'),
    `the path must be named as authored: ${g2[0].message}`,
  );
});

test('MUTANT G1: a resurrected platform artifact directory is caught and named', () => {
  const fixture = makeCleanFixture();
  const planted = join(fixture.artifactsRoot, RETIRED_VERTICAL_SLUG);
  mkdirSync(planted, { recursive: true });
  writeFileSync(join(planted, 'index.css'), ':root { --ds-color-text-primary: #101010; }\n');

  const result = runFirstPartySingleAuthorGate(fixture.options);
  const g1 = findingsFor('G1', result);
  assert.ok(g1.length > 0, 'platform directory must be red');
  assert.ok(
    g1.some((f) => f.message.includes(RETIRED_VERTICAL_SLUG) && f.message.includes('retired')),
    `the retired vertical must be named: ${JSON.stringify(g1)}`,
  );
});

test('MUTANT G1: a fourth identity in the artifact tree is caught and named', () => {
  const fixture = makeCleanFixture();
  const planted = join(fixture.artifactsRoot, 'northwind');
  mkdirSync(planted, { recursive: true });
  writeFileSync(join(planted, 'index.css'), ':root { --ds-color-text-primary: #101010; }\n');

  const result = runFirstPartySingleAuthorGate(fixture.options);
  const g1 = findingsFor('G1', result);
  assert.ok(g1.some((f) => f.message.includes("'northwind'") && f.message.includes('roster')));
  assert.ok(g1.some((f) => f.message.includes("'northwind'") && f.message.includes('unpreserved')));
});

test('MUTANT G1: a fourth identity in the ROSTER SOURCE alone is caught and named', () => {
  const fixture = makeCleanFixture();
  const result = runFirstPartySingleAuthorGate({
    ...fixture.options,
    rosterSlugs: [...PRESERVED_FIRST_PARTY_SLUGS, 'northwind'],
  });
  const g1 = findingsFor('G1', result);
  assert.ok(g1.some((f) => f.message.includes("roster slug 'northwind' has no artifact directory")));
  assert.ok(g1.some((f) => f.message.includes("roster source declares unpreserved identity 'northwind'")));
});

test('MUTANT G1: a removed artifact directory is caught and named', () => {
  const fixture = makeCleanFixture();
  rmSync(join(fixture.artifactsRoot, 'evnto'), { recursive: true, force: true });

  const result = runFirstPartySingleAuthorGate(fixture.options);
  const g1 = findingsFor('G1', result);
  assert.ok(g1.some((f) => f.message.includes("roster slug 'evnto' has no artifact directory")));
  assert.ok(g1.some((f) => f.message.includes("preserved identity 'evnto' has no artifact directory")));
});

test('MUTANT G3: the retired extensionCss API in a production surface is caught', () => {
  const fixture = makeCleanFixture();
  writeFileSync(
    fixture.productionFiles[0],
    [
      'export function renderVerticalArtifact({ tenantSlug, compiledCssVariables, extensionCss }) {',
      '  return [compiledCssVariables, extensionCss].join(String());',
      '}',
      '',
    ].join('\n'),
  );

  const result = runFirstPartySingleAuthorGate(fixture.options);
  const g3 = findingsFor('G3', result);
  assert.ok(g3.length >= 1, 'extensionCss must be red');
  assert.ok(g3.every((f) => f.message.includes("'extensionCss'")));
  assert.ok(g3.some((f) => f.message.includes('artifact-renderer.ts:1')), JSON.stringify(g3));
});

test('MUTANT G3: a resurrected two-author marker string is caught and named', () => {
  const fixture = makeCleanFixture();
  writeFileSync(
    fixture.productionFiles[2],
    [
      '#!/usr/bin/env node',
      '// This artifact is generated from two authored sources.',
      "const banner = '/* Declared artifact extension */';",
      '',
    ].join('\n'),
  );

  const result = runFirstPartySingleAuthorGate(fixture.options);
  const g3 = findingsFor('G3', result);
  assert.ok(g3.some((f) => f.message.includes("'two authored sources'")), JSON.stringify(g3));
  assert.ok(g3.some((f) => f.message.includes("'Declared artifact extension'")), JSON.stringify(g3));
  assert.ok(g3.every((f) => f.message.includes('build-vertical-artifacts.mjs')));
});

test('MUTANT G3: case variants of the retired tokens are caught and named as written', () => {
  const fixture = makeCleanFixture();
  writeFileSync(
    fixture.productionFiles[0],
    [
      'export function renderVerticalArtifact({ tenantSlug, compiledCssVariables, ExtensionCSS }) {',
      "  const banner = '/* DECLARED ARTIFACT EXTENSION */';",
      '  return [banner, compiledCssVariables, ExtensionCSS].join(String());',
      '}',
      '',
    ].join('\n'),
  );

  const result = runFirstPartySingleAuthorGate(fixture.options);
  const g3 = findingsFor('G3', result);
  assert.ok(
    g3.some(
      (f) =>
        f.message.includes('artifact-renderer.ts:1') &&
        f.message.includes("'extensionCss'") &&
        f.message.includes("spelled 'ExtensionCSS'"),
    ),
    `a re-cased API is the same API: ${JSON.stringify(g3)}`,
  );
  assert.ok(
    g3.some(
      (f) =>
        f.message.includes('artifact-renderer.ts:2') &&
        f.message.includes("'Declared artifact extension'") &&
        f.message.includes("spelled 'DECLARED ARTIFACT EXTENSION'"),
    ),
    `a re-cased marker is the same marker: ${JSON.stringify(g3)}`,
  );
  assert.ok(g3.every((f) => f.message.includes('artifact-renderer.ts')), JSON.stringify(g3));
});

test('MUTANT G3: a missing pinned production surface is red, not silently skipped', () => {
  const fixture = makeCleanFixture();
  rmSync(fixture.productionFiles[1], { force: true });

  const result = runFirstPartySingleAuthorGate(fixture.options);
  const g3 = findingsFor('G3', result);
  assert.equal(g3.length, 1);
  assert.ok(g3[0].message.includes('missing'), g3[0].message);
  assert.ok(g3[0].message.includes('tenant-css-barrel.ts'), g3[0].message);
});
