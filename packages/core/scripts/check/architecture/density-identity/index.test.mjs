/**
 * Drill for the density type-identity sentinel. Every mutation runs on a scratch copy of the probe
 * in a temporary folder, so the committed probe is never edited and nothing needs restoring.
 */

import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import {
  CORE_ROOT,
  PROBE_FILE,
  PROBE_TSCONFIG,
  SURVIVORS,
  compileProbe,
  evaluate,
  survivorDeclarations,
  survivorFindings,
  testFilesInScope,
} from './index.mjs';

const PROBE = readFileSync(PROBE_FILE, 'utf8');

/** A scratch probe whose tsconfig points at the package with absolute paths; returns its tsconfig. */
function scratchProbe(source, extraFiles = []) {
  const root = mkdtempSync(join(tmpdir(), 'density-identity-'));
  const probe = join(root, 'density-identity/probe');
  mkdirSync(join(probe, 'tsconfig'), { recursive: true });
  writeFileSync(join(probe, 'index.ts'), source);
  const committed = JSON.parse(readFileSync(PROBE_TSCONFIG, 'utf8'));
  const paths = Object.fromEntries(Object.entries(committed.compilerOptions.paths)
    .map(([alias, [target]]) => [alias, [join(CORE_ROOT, target.replace(/^(\.\.\/)+/u, ''))]]));
  writeFileSync(join(probe, 'tsconfig/index.json'), JSON.stringify({
    extends: join(CORE_ROOT, 'tsconfig.json'),
    // Outside the package, automatic @types discovery would walk the temp folder; point it at the package's own.
    compilerOptions: { noEmit: true, rootDir: '/', paths, typeRoots: [join(CORE_ROOT, 'node_modules/@types')] },
    include: [],
    files: [join(probe, 'index.ts'), ...extraFiles],
  }));
  return { tsconfig: join(probe, 'tsconfig/index.json'), cleanup: () => rmSync(root, { recursive: true, force: true }) };
}

function flip(source, from, to) {
  assert.ok(source.includes(from), `the probe no longer spells ${from}`);
  return source.replace(from, to);
}

test('CONTROL: the committed probe is green, with no test file in scope', () => {
  const { findings, compiled, declarations } = evaluate();
  assert.deepEqual(findings, []);
  assert.equal(compiled.status, 0);
  assert.deepEqual(testFilesInScope(compiled.files), []);
  assert.deepEqual(declarations, Object.entries(SURVIVORS).map(([name, path]) => `${name} @ ${path}`).sort());
});

test('CONTROL: an unmutated scratch copy is green too, so a red below is the mutation and nothing else', () => {
  const scratch = scratchProbe(PROBE);
  try {
    assert.deepEqual(compileProbe(scratch.tsconfig).diagnostics, []);
  } finally {
    scratch.cleanup();
  }
});

test('DRILL: flipping the VerticalManifest identity reds the probe, at that line', () => {
  const mutated = flip(PROBE, "Equals<VerticalManifest['density'], DensityPosture>",
    "Equals<VerticalManifest['density'], Exclude<DensityPosture, 'spacious'>>");
  const scratch = scratchProbe(mutated);
  try {
    const { diagnostics } = compileProbe(scratch.tsconfig);
    const line = mutated.split('\n').findIndex((text) => text.includes('verticalManifestDensity')) + 1;
    assert.deepEqual(diagnostics.map((item) => [item.file.endsWith('density-identity/probe/index.ts'), item.line, item.code]),
      [[true, line, 'TS2322']]);
  } finally {
    scratch.cleanup();
  }
});

test('DRILL: widening the two-step MarkdownView identity to three steps reds the probe', () => {
  const mutated = flip(PROBE, "Equals<MarkdownViewProps['density'], Exclude<DensityPosture, 'spacious'> | undefined>",
    "Equals<MarkdownViewProps['density'], DensityPosture | undefined>");
  const scratch = scratchProbe(mutated);
  try {
    const { diagnostics } = compileProbe(scratch.tsconfig);
    assert.equal(diagnostics.length, 1);
    assert.equal(diagnostics[0].code, 'TS2322');
  } finally {
    scratch.cleanup();
  }
});

test('DRILL: a test file pulled into the scope is refused, so the pre-existing test debt can never enter it', () => {
  const testFile = join(CORE_ROOT, 'tests/architecture/density-one-type-per-axis/index.test.ts');
  const scratch = scratchProbe(PROBE, [testFile]);
  try {
    const { files } = compileProbe(scratch.tsconfig);
    assert.deepEqual(testFilesInScope(files), ['tests/architecture/density-one-type-per-axis/index.test.ts']);
  } finally {
    scratch.cleanup();
  }
});

test('DRILL: the survivor law refuses a second declaration, a moved one and a missing one', () => {
  const owner = SURVIVORS.DensityPosture;
  const posture = "export const DENSITY_POSTURES = ['compact', 'comfortable', 'spacious'] as const;\nexport type DensityPosture = (typeof DENSITY_POSTURES)[number];";
  const mode = "export type DensityMode = 'compact' | 'normal' | 'spacious';";
  const clean = { [owner]: posture, [SURVIVORS.DensityMode]: mode };
  assert.deepEqual(survivorFindings(survivorDeclarations(clean)), []);
  assert.equal(survivorFindings(survivorDeclarations({ ...clean, 'src/x/index.ts': 'type DensityPosture = string;' })).length, 1);
  assert.equal(survivorFindings(survivorDeclarations({ [SURVIVORS.DensityMode]: mode, 'src/moved/index.ts': posture })).length, 2);
  assert.equal(survivorFindings(survivorDeclarations({ [owner]: posture })).length, 1);
});
