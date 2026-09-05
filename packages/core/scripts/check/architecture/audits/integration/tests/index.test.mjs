/**
 * Drills for the integration fence.
 *
 * The fence was not merely fragile, it was VACUOUS: two of its three emitters
 * sliced between string markers and contributed zero scanned variables, and its
 * end marker already matched two sites in the real file. It had no test owner
 * and no manifest entry, so none of that could be caught by anything.
 *
 * These drills assert on the EXTRACTION CONTRACT rather than on the number of
 * orphan variables. That distinction is load-bearing: a rename that disables an
 * emitter and a correct measurement of zero are indistinguishable by var count,
 * so any drill counting orphans would pass whether the fence worked or not.
 */

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { packageRoot as findPackageRoot } from '../../../../../libraries/repo-root/index.mjs';
import {
  SymbolAbsentError,
  SymbolAmbiguousError,
  collectExportedDeclarations,
  requireExactlyOneExportedDeclaration,
  requireExportedDeclarations,
} from '../../../../../libraries/exported-symbol/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const AUDIT = resolve(HERE, '../index.mjs');
const CORE_ROOT = findPackageRoot(HERE);
const LOWERING = join(CORE_ROOT, 'src/infrastructure/compilers/runtime/theme/runtime/lowering/index.ts');
const LOWERING_CHROME = join(CORE_ROOT, 'src/infrastructure/compilers/runtime/theme/runtime/lowering/foundation/chrome/index.ts');

/**
 * Emitter trees are planted in a temp directory rather than committed under
 * `tests/fixtures/`. They mirror `src/infrastructure/compilers/...`, and the
 * scripts-tree law forbids that shape inside `scripts/` -- committing them
 * would trade a tested fence for an adjudicated baseline entry.
 */
const CHROME_SOURCE = [
  'export function chromeToVariables(vars: Record<string, string>): void {',
  "  vars['--ds-fixture-chrome-bg'] = 'transparent';",
  '}',
  '',
].join('\n');

const CONSUMER_CSS = [
  '.fixture {',
  '  background: var(--ds-fixture-chrome-bg);',
  '}',
  '',
].join('\n');

/**
 * The ORCHESTRATION owner's planted source. Since C2 it authors the compile
 * symbol and nothing else — the chrome writer is its own owner below, which is
 * what makes "per-symbol" also mean "per-owner" in T3.
 */
function brandSource({ duplicate = false, deprecatedOnly = false, stray = false } = {}) {
  const body = stray
    ? ["  const vars: Record<string, string> = {};", "  vars['--ds-fixture-orphan'] = 'red';", '  return 1;'].join('\n')
    : '  return 1;';
  if (deprecatedOnly) {
    return ['export const compileThemeDeprecated = (): number => {', body, '};', ''].join('\n');
  }
  const parts = ['export const compileTheme = (): number => {', body, '};', ''];
  if (duplicate) parts.push('export const compileTheme = (): number => {', '  return 2;', '};', '');
  parts.push('export const compileThemeDeprecated = compileTheme;', '');
  return parts.join('\n');
}

/**
 * The lowering's chrome writer, as its own planted owner: C2 split the compiler
 * into one owner per concern, so the audit reads the chrome channel here and the
 * orchestration separately.
 */
function chromeOwnerSource({ emitter = 'brandThemeToChromeVariables' } = {}) {
  return [
    `export function ${emitter}(vars: Record<string, string>): void {`,
    "  vars['--ds-fixture-chrome-bg'] = 'transparent';",
    '}',
    '',
    'function brandThemeRadiusScale(): string {',
    "  return '1';",
    '}',
    '',
  ].join('\n');
}

const EMITTER_TREES = {
  clean: brandSource(),
  renamed: brandSource(),
  duplicated: brandSource({ duplicate: true }),
  'prefix-only': brandSource({ deprecatedOnly: true }),
  'stray-var': brandSource({ stray: true }),
};

const CHROME_OWNER_TREES = {
  clean: chromeOwnerSource(),
  renamed: chromeOwnerSource({ emitter: 'chromeVars' }),
  duplicated: chromeOwnerSource(),
  'prefix-only': chromeOwnerSource(),
  'stray-var': chromeOwnerSource(),
};

const plantedRoots = new Map();
function plantEmitterRoot(name) {
  if (plantedRoots.has(name)) return plantedRoots.get(name);
  const root = join(mkdtempSync(join(tmpdir(), `ds-integration-${name}-`)), 'src');
  const write = (relative, contents) => {
    const absolute = join(root, relative);
    mkdirSync(dirname(absolute), { recursive: true });
    writeFileSync(absolute, contents);
  };
  write('infrastructure/compilers/kernel/foundation/css/chrome-variables/index.ts', CHROME_SOURCE);
  write('infrastructure/compilers/runtime/theme/runtime/lowering/index.ts', EMITTER_TREES[name]);
  write(
    'infrastructure/compilers/runtime/theme/runtime/lowering/foundation/chrome/index.ts',
    CHROME_OWNER_TREES[name],
  );
  write('foundation/tokens/css/runtime/engines/modern/index.css', CONSUMER_CSS);
  plantedRoots.set(name, root);
  return root;
}

function runAudit(fixture) {
  const result = spawnSync(
    process.execPath,
    [AUDIT, '--package-root', CORE_ROOT, '--emitter-root', plantEmitterRoot(fixture)],
    { encoding: 'utf8' },
  );
  return { status: result.status, output: `${result.stdout ?? ''}${result.stderr ?? ''}` };
}

function chromeFixture(name) {
  return join(
    plantEmitterRoot(name),
    'infrastructure/compilers/runtime/theme/runtime/lowering/foundation/chrome/index.ts',
  );
}

function brandFixture(name) {
  return join(plantEmitterRoot(name), 'infrastructure/compilers/runtime/theme/runtime/lowering/index.ts');
}

test('T1: the two real emitters each resolve to exactly one exported declaration', () => {
  // The two moved apart in C2: the chrome writer is its own owner and the
  // orchestration is the lowering's index, so each is resolved where it lives.
  const chrome = requireExportedDeclarations(LOWERING_CHROME, [
    'brandThemeToChromeVariables',
  ]);
  assert.equal(chrome.size, 1);
  assert.equal(chrome.get('brandThemeToChromeVariables').kind, 'function');
  const resolved = requireExportedDeclarations(LOWERING, ['compileTheme']);
  assert.equal(resolved.size, 1);
  assert.equal(resolved.get('compileTheme').kind, 'function');

  const audit = spawnSync(process.execPath, [AUDIT], { encoding: 'utf8' });
  assert.equal(audit.status, 0, audit.stdout + audit.stderr);
});

test('T2: renaming an emitter turns the fence RED instead of emptying it', () => {
  const result = runAudit('renamed');
  assert.equal(result.status, 1, result.output);
  assert.match(result.output, /emitter-symbol-missing/);
  assert.match(result.output, /brandThemeToChromeVariables/);
});

test('T3: renaming the named compile symbol is the same failure', () => {
  // The two emitters are separate owners since C2, so "per-symbol rather than
  // per-file" is now also "per-owner": each file answers for its own symbol and
  // refuses the other's, and `renamed/` drops the chrome one from the owner that
  // is supposed to have it.
  assert.throws(
    () => requireExactlyOneExportedDeclaration(chromeFixture('renamed'), 'brandThemeToChromeVariables'),
    SymbolAbsentError,
  );
  const brand = brandFixture('renamed');
  assert.throws(
    () => requireExactlyOneExportedDeclaration(brand, 'brandThemeToChromeVariables'),
    SymbolAbsentError,
  );
  assert.equal(requireExactlyOneExportedDeclaration(brand, 'compileTheme').name, 'compileTheme');
  assert.equal(
    requireExactlyOneExportedDeclaration(chromeFixture('clean'), 'brandThemeToChromeVariables').name,
    'brandThemeToChromeVariables',
  );
});

test('T4: two exported declarations of one name are AMBIGUOUS, never silently picked', () => {
  const result = runAudit('duplicated');
  assert.equal(result.status, 1, result.output);
  assert.match(result.output, /emitter-symbol-ambiguous/);

  const brand = brandFixture('duplicated');
  assert.throws(() => requireExactlyOneExportedDeclaration(brand, 'compileTheme'), SymbolAmbiguousError);
});

test('T5: PREFIX DRILL — only the Deprecated alias present is an ABSENCE, not a match', () => {
  // The regression this library exists for. `export const compileTheme` is
  // a literal prefix of `export const compileThemeDeprecated`, so
  // `indexOf` matches the alias; identifier equality does not.
  const result = runAudit('prefix-only');
  assert.equal(result.status, 1, result.output);
  assert.match(result.output, /emitter-symbol-missing/);

  const brand = brandFixture('prefix-only');
  const source = readFileSync(brand, 'utf8');
  assert.ok(
    source.indexOf('export const compileTheme') >= 0,
    'precondition: substring matching WOULD find the symbol here',
  );
  assert.throws(() => requireExactlyOneExportedDeclaration(brand, 'compileTheme'), SymbolAbsentError);
});

test('T6: a stray var inside compileTheme is now in scope and reported', () => {
  // The gap the old window left: `compileTheme`'s body is the largest
  // export in the real file and sat entirely outside the marker slice, so the
  // header's claim that a stray assignment "is caught too" was not true.
  //
  // The fixture root exercises rule 1 only -- the audit's other rules census
  // roots a fixture does not carry -- so the assertions are on the CHROME
  // findings rather than on the exit code, which those other rules dominate.
  const planted = runAudit('stray-var');
  assert.equal(planted.status, 1);
  assert.match(planted.output, /Premium chrome var "--ds-fixture-orphan" is emitted but has no non-test consumer/);

  const clean = runAudit('clean');
  assert.doesNotMatch(
    clean.output,
    /--ds-fixture-orphan/,
    'the clean fixture must not report the plant, or T6 is measuring the fixture rather than the rule',
  );
  assert.doesNotMatch(clean.output, /emitter-symbol-/, clean.output);
});

test('T7: anti-silent-green — a broken fence never prints the success line', () => {
  for (const fixture of ['renamed', 'duplicated', 'prefix-only']) {
    const result = runAudit(fixture);
    assert.notEqual(result.status, 0, fixture);
    assert.doesNotMatch(result.output, /all checks passed/, fixture);
    assert.match(result.output, /emitter-symbol-(missing|ambiguous)/, fixture);
  }
  // And the success line is reachable, so the assertions above are not
  // satisfied by a gate that can never print it.
  const real = spawnSync(process.execPath, [AUDIT], { encoding: 'utf8' });
  assert.equal(real.status, 0, real.stdout + real.stderr);
  assert.match(real.stdout, /all checks passed/);
});

test('the resolver counts every declaration form, so absence cannot be undercounted', () => {
  const source = [
    'export function fn() {}',
    'export class Cls {}',
    'export const value = 1;',
    'export enum E { A }',
    'export type T = string;',
    'export interface I { a: string }',
    'const local = 1;',
    'export { local };',
    'export default function () {}',
  ].join('\n');
  const found = collectExportedDeclarations('fixture.ts', source);
  assert.deepEqual(
    found.map((declaration) => `${declaration.name}:${declaration.kind}`).sort(),
    [
      'Cls:class',
      'E:enum',
      'I:interface',
      'T:type',
      'fn:function',
      'local:export-specifier',
      'value:const',
    ],
  );
  // `export default` has no name, so a NAMED lookup for it must be an absence
  // rather than a silent match on whatever the default happens to be.
  assert.throws(() => requireExactlyOneExportedDeclaration('fixture.ts', 'default', source), SymbolAbsentError);
});
