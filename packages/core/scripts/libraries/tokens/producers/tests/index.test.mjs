/**
 * Drills del censo de productores.
 *
 * Las emisiones del kernel del compilador se plantan en una sandbox de tmpdir
 * que imita `src/infrastructure/compilers/...`; el arbol real nunca se escribe.
 */

import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import test from 'node:test';

import {
  CORE_ROOT,
  DEFAULT_BRAND_THEME_COMPILER_ROOT,
  collectFlatThemeCompilerSources,
  extractKeyedVarsEmissions,
} from '../../../../check/tokens/cascade/channels/liveness/index.mjs';
import * as census from '../index.mjs';

const KERNEL_FILE = 'src/infrastructure/compilers/kernel/foundation/css/drill/index.ts';
const LOWERING_FOUNDATION_FILE =
  'src/infrastructure/compilers/runtime/theme/runtime/lowering/foundation/drill/index.ts';

function withSandbox(files, run) {
  const sandbox = mkdtempSync(join(tmpdir(), 'kernel-census-drill-'));
  const write = (relativePath, text) => {
    const target = join(sandbox, relativePath);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, text);
  };
  try {
    for (const [relativePath, text] of Object.entries(files)) write(relativePath, text);
    run({ sandbox, write, remove: (relativePath) => rmSync(join(sandbox, relativePath), { force: true }) });
  } finally {
    rmSync(sandbox, { recursive: true, force: true });
  }
}

const LIVE = census.collectChannelProducers();

test('--ds-type-scale has a producer, and the producer is the compiler kernel', () => {
  assert.ok(LIVE.producers.has('--ds-type-scale'), 'appearance-posture emits --ds-type-scale');
  assert.ok(LIVE.compiledByKind.kernel.has('--ds-type-scale'));
  assert.ok(!LIVE.compiledByKind.derived.has('--ds-type-scale'), 'the derivation registry does not emit it');
  assert.ok(!LIVE.declared.has('--ds-type-scale'), 'no authored CSS declares it');
});

test('a planted kernel emission joins the set, and leaves it when removed', () => {
  const name = '--ds-kernel-census-drill-planted';
  withSandbox({ [KERNEL_FILE]: `export function f(vars) {\n  vars["${name}"] = "1";\n}\n` }, ({ sandbox, remove }) => {
    assert.ok(census.collectCompilerEmissions({ coreRoot: sandbox }).byKind.kernel.has(name));
    remove(KERNEL_FILE);
    assert.ok(!census.collectCompilerEmissions({ coreRoot: sandbox }).byKind.kernel.has(name));
  });
});

test('a planted lowering-foundation emission joins under its own kind', () => {
  const name = '--ds-kernel-census-drill-foundation';
  withSandbox({ [LOWERING_FOUNDATION_FILE]: `export function f(vars) {\n  vars["${name}"] = "1";\n}\n` }, ({ sandbox }) => {
    const { byKind } = census.collectCompilerEmissions({ coreRoot: sandbox });
    assert.ok(byKind['lowering-foundation'].has(name));
    assert.ok(!byKind.kernel.has(name));
  });
});

test('INJECTION: a kernel name that is not an assignment never joins', () => {
  const source = [
    '/** Reads --ds-kernel-census-drill-comment when the tenant authors it. */',
    'const label = "--ds-kernel-census-drill-string";',
    'export function f(vars) {',
    '  const current = vars["--ds-kernel-census-drill-read"];',
    '  vars["--ds-kernel-census-drill-control"] = current;',
    '}',
    '',
  ].join('\n');
  const testsSource = 'export function f(vars) {\n  vars["--ds-kernel-census-drill-test"] = "1";\n}\n';
  withSandbox(
    {
      [KERNEL_FILE]: source,
      'src/infrastructure/compilers/kernel/foundation/css/drill/tests/index.ts': testsSource,
    },
    ({ sandbox }) => {
      const { byKind } = census.collectCompilerEmissions({ coreRoot: sandbox });
      assert.ok(byKind.kernel.has('--ds-kernel-census-drill-control'), 'the control assignment joins, so the drill measures something');
      for (const name of [
        '--ds-kernel-census-drill-comment',
        '--ds-kernel-census-drill-string',
        '--ds-kernel-census-drill-read',
        '--ds-kernel-census-drill-test',
      ]) {
        assert.ok(!byKind.kernel.has(name), `${name} is not an emission`);
      }
    },
  );
});

test('an interpolated kernel emission is resolved over a literal domain or reported, never dropped', () => {
  const source = [
    'const TABLE = { a: "--ds-kernel-census-drill-a" };',
    'export function f(vars, prefix, key) {',
    '  for (const size of ["sm", "md"] as const) {',
    '    vars[`--ds-kernel-census-drill-${size}-gap`] = "1";',
    '  }',
    '  vars[`--ds-kernel-census-drill-${prefix}-bg`] = "1";',
    '  vars[TABLE[key]] = "1";',
    '}',
    '',
  ].join('\n');
  withSandbox({ [KERNEL_FILE]: source }, ({ sandbox }) => {
    const { byKind, unresolved } = census.collectCompilerEmissions({ coreRoot: sandbox });
    assert.ok(byKind.kernel.has('--ds-kernel-census-drill-sm-gap'));
    assert.ok(byKind.kernel.has('--ds-kernel-census-drill-md-gap'));
    assert.ok(![...byKind.kernel].some((name) => name.includes('${')), 'a template is never a name');
    const lines = unresolved.filter((site) => site.kind === 'kernel').map((site) => site.line).sort();
    assert.deepEqual(lines, [6, 7], `the open template and the member key are reported; got ${JSON.stringify(unresolved)}`);
    for (const site of unresolved) {
      assert.ok(site.path.endsWith('drill/index.ts') && site.reason.length > 0, JSON.stringify(site));
    }
  });
});

test('the derivation registry measures exactly what it measured before the kernel joined', () => {
  const derivedRoot = census.COMPILER_PRODUCER_ROOTS.find((entry) => entry.kind === 'derived');
  assert.equal(resolve(CORE_ROOT, derivedRoot.root), DEFAULT_BRAND_THEME_COMPILER_ROOT);
  const before = census.collectCompiledChannels(collectFlatThemeCompilerSources());
  assert.deepEqual([...LIVE.compiledByKind.derived].sort(), [...before].sort());
});

test('the producer set is the union of the declared set and every compiler kind', () => {
  const kinds = Object.values(LIVE.compiledByKind);
  assert.equal(kinds.length, census.COMPILER_PRODUCER_ROOTS.length);
  assert.deepEqual([...LIVE.compiled].sort(), [...new Set(kinds.flatMap((set) => [...set]))].sort());
  assert.equal(LIVE.producers.size, new Set([...LIVE.declared, ...LIVE.compiled]).size);
});

test('the unresolved compiler emissions are a pinned figure, not a silent gap', () => {
  const byKind = {};
  for (const site of LIVE.unresolved) byKind[site.kind] = (byKind[site.kind] ?? 0) + 1;
  // Resolve a site or remove it, then lower the pin; never raise it to absorb a new one.
  // kernel 75 -> 19: the 56 chrome-variables templates whose hole is a parameter
  // every literal call site binds (setPremiumCardVars x 7 namespaces, the button
  // variant and legacy hover-bg setters) left through resolveThroughLiteralCallSites.
  assert.deepEqual(byKind, { kernel: 19, 'lowering-foundation': 40 });
});

/* ── The template hole a literal call site binds ─────────────────────────── */

const CALL_SITE_SOURCE = [
  'function setCardVars(vars, namespace, card) {',
  '  if (card.iconBg) vars[`--ds-${namespace}-drill-icon-bg`] = card.iconBg;',
  '}',
  'export function compile(vars, chrome) {',
  '  setCardVars(vars, "alpha-card", chrome.alpha);',
  '  setCardVars(vars, "beta-card", chrome.beta);',
  '}',
  '',
].join('\n');
const CALL_SITE = { raw: '`--ds-${namespace}-drill-icon-bg`', line: 2 };

test('CALL SITE (a): a template hole every literal call site binds is produced, once per literal', () => {
  assert.deepEqual(census.resolveThroughLiteralCallSites(CALL_SITE_SOURCE, CALL_SITE), [
    '--ds-alpha-card-drill-icon-bg',
    '--ds-beta-card-drill-icon-bg',
  ]);
  withSandbox({ [KERNEL_FILE]: CALL_SITE_SOURCE }, ({ sandbox }) => {
    const { byKind, unresolved, throughCallSites } = census.collectCompilerEmissions({ coreRoot: sandbox });
    assert.ok(byKind.kernel.has('--ds-alpha-card-drill-icon-bg'));
    assert.ok(byKind.kernel.has('--ds-beta-card-drill-icon-bg'));
    assert.deepEqual(unresolved.filter((site) => site.kind === 'kernel'), []);
    assert.equal(throughCallSites.length, 1);
    assert.equal(throughCallSites[0].line, 2);
  });
});

test('CALL SITE (b): a hole no literal closes stays unresolved, never invented', () => {
  const open = {
    'one caller passes an identifier': CALL_SITE_SOURCE.replace('"beta-card"', 'chrome.name'),
    'the setter is exported, so any module may call it': CALL_SITE_SOURCE.replace(
      'function setCardVars',
      'export function setCardVars',
    ),
    'the setter escapes as a value': `${CALL_SITE_SOURCE}export const table = [setCardVars];\n`,
    'the body reassigns the parameter': CALL_SITE_SOURCE.replace(
      '  if (card.iconBg)',
      '  namespace = card.name;\n  if (card.iconBg)',
    ),
    'nobody calls the setter': CALL_SITE_SOURCE.replace(/  setCardVars\(.*\n/g, ''),
    'the hole is a local, not a parameter': CALL_SITE_SOURCE.replace(
      '  if (card.iconBg)',
      '  const scope = card.name;\n  if (card.iconBg)',
    ).replace('${namespace}-drill', '${scope}-drill'),
  };
  for (const [label, source] of Object.entries(open)) {
    const line = source.split('\n').findIndex((text) => text.includes('drill-icon-bg')) + 1;
    const raw = /vars\[(`[^`]*`)\]/.exec(source)[1];
    assert.equal(census.resolveThroughLiteralCallSites(source, { raw, line }), null, label);
    withSandbox({ [KERNEL_FILE]: source }, ({ sandbox }) => {
      const { byKind, unresolved } = census.collectCompilerEmissions({ coreRoot: sandbox });
      assert.ok(![...byKind.kernel].some((name) => name.includes('drill-icon-bg')), label);
      assert.deepEqual(unresolved.filter((site) => site.kind === 'kernel').map((site) => site.line), [line], label);
    });
  }
});

test('CALL SITE (c) CONTROL: without the call-site pass the same hole is unresolved', () => {
  const keyed = extractKeyedVarsEmissions(CALL_SITE_SOURCE);
  assert.equal(keyed.resolved.size, 0, 'the underlying extractor binds no domain for a parameter');
  assert.deepEqual(keyed.unresolved.map((site) => [site.raw, site.line]), [[CALL_SITE.raw, CALL_SITE.line]]);
});

test('LIVE: the tenant workspace-card tile is produced by the chrome compiler through its literal call site', () => {
  assert.ok(LIVE.producers.has('--ds-workspace-card-icon-bg'));
  assert.ok(LIVE.compiledByKind.kernel.has('--ds-workspace-card-icon-bg'));
  assert.ok(!LIVE.declared.has('--ds-workspace-card-icon-bg'), 'no authored CSS declares it: the producer is the compiler');
  const { throughCallSites } = census.collectCompilerEmissions();
  const site = throughCallSites.find((entry) => entry.raw === '`--ds-${namespace}-icon-bg`');
  assert.ok(site?.path.endsWith('kernel/foundation/css/chrome-variables/index.ts'), JSON.stringify(site));
  assert.deepEqual(site.names, [
    '--ds-collection-card-icon-bg',
    '--ds-compact-card-icon-bg',
    '--ds-metric-card-icon-bg',
    '--ds-premium-card-icon-bg',
    '--ds-signal-card-icon-bg',
    '--ds-tall-card-icon-bg',
    '--ds-workspace-card-icon-bg',
  ]);
});
