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
const BRAND_THEME = join(
  CORE_ROOT,
  'src/infrastructure/compilers/kernel/runtime/brand-theme/index.ts',
);

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

const APPEARANCE_SOURCE = [
  'export function appearanceAdvancedToVariables(vars: Record<string, string>): void {',
  "  vars['--ds-fixture-appearance-bg'] = 'transparent';",
  '}',
  '',
  '// \u2500\u2500 Combined',
  'export const combined = 1;',
  '',
].join('\n');

const CONSUMER_CSS = [
  '.fixture {',
  '  background: var(--ds-fixture-chrome-bg);',
  '  color: var(--ds-fixture-appearance-bg);',
  '}',
  '',
].join('\n');

function brandSource({ emitter = 'brandThemeToChromeVariables', duplicate = false, deprecatedOnly = false, stray = false } = {}) {
  const body = stray
    ? ["  const vars: Record<string, string> = {};", "  vars['--ds-fixture-orphan'] = 'red';", '  return 1;'].join('\n')
    : '  return 1;';
  if (deprecatedOnly) {
    return ['export const compileBrandThemeDeprecated = (): number => {', body, '};', ''].join('\n');
  }
  const parts = [
    `export function ${emitter}(vars: Record<string, string>): void {`,
    "  vars['--ds-fixture-chrome-bg'] = 'transparent';",
    '}',
    '',
    'export const compileBrandTheme = (): number => {',
    body,
    '};',
    '',
  ];
  if (duplicate) parts.push('export const compileBrandTheme = (): number => {', '  return 2;', '};', '');
  parts.push('export const compileBrandThemeDeprecated = compileBrandTheme;', '');
  return parts.join('\n');
}

const EMITTER_TREES = {
  clean: brandSource(),
  renamed: brandSource({ emitter: 'chromeVars' }),
  duplicated: brandSource({ duplicate: true }),
  'prefix-only': brandSource({ deprecatedOnly: true }),
  'stray-var': brandSource({ stray: true }),
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
  write('infrastructure/compilers/kernel/runtime/brand-theme/index.ts', EMITTER_TREES[name]);
  write('infrastructure/compilers/kernel/runtime/appearance/index.ts', APPEARANCE_SOURCE);
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

function brandFixture(name) {
  return join(plantEmitterRoot(name), 'infrastructure/compilers/kernel/runtime/brand-theme/index.ts');
}

test('T1: the three real emitters each resolve to exactly one exported declaration', () => {
  const resolved = requireExportedDeclarations(BRAND_THEME, [
    'brandThemeToChromeVariables',
    'compileBrandTheme',
  ]);
  assert.equal(resolved.size, 2);
  assert.equal(resolved.get('brandThemeToChromeVariables').kind, 'function');
  assert.equal(resolved.get('compileBrandTheme').kind, 'const');

  const appearance = join(
    CORE_ROOT,
    'src/infrastructure/compilers/kernel/runtime/appearance/index.ts',
  );
  assert.equal(
    requireExactlyOneExportedDeclaration(appearance, 'appearanceAdvancedToVariables').name,
    'appearanceAdvancedToVariables',
  );

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
  // `renamed/` keeps `compileBrandTheme` and drops the other symbol; this
  // asserts the resolver is per-symbol rather than per-file.
  const brand = brandFixture('renamed');
  assert.throws(
    () => requireExactlyOneExportedDeclaration(brand, 'brandThemeToChromeVariables'),
    SymbolAbsentError,
  );
  assert.equal(requireExactlyOneExportedDeclaration(brand, 'compileBrandTheme').name, 'compileBrandTheme');
});

test('T4: two exported declarations of one name are AMBIGUOUS, never silently picked', () => {
  const result = runAudit('duplicated');
  assert.equal(result.status, 1, result.output);
  assert.match(result.output, /emitter-symbol-ambiguous/);

  const brand = brandFixture('duplicated');
  assert.throws(() => requireExactlyOneExportedDeclaration(brand, 'compileBrandTheme'), SymbolAmbiguousError);
});

test('T5: PREFIX DRILL — only the Deprecated alias present is an ABSENCE, not a match', () => {
  // The regression this library exists for. `export const compileBrandTheme` is
  // a literal prefix of `export const compileBrandThemeDeprecated`, so
  // `indexOf` matches the alias; identifier equality does not.
  const result = runAudit('prefix-only');
  assert.equal(result.status, 1, result.output);
  assert.match(result.output, /emitter-symbol-missing/);

  const brand = brandFixture('prefix-only');
  const source = readFileSync(brand, 'utf8');
  assert.ok(
    source.indexOf('export const compileBrandTheme') >= 0,
    'precondition: substring matching WOULD find the symbol here',
  );
  assert.throws(() => requireExactlyOneExportedDeclaration(brand, 'compileBrandTheme'), SymbolAbsentError);
});

test('T6: a stray var inside compileBrandTheme is now in scope and reported', () => {
  // The gap the old window left: `compileBrandTheme`'s body is the largest
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
