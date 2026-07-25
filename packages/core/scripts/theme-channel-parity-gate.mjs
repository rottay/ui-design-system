#!/usr/bin/env node
/**
 * theme-channel-parity-gate — DS-A003 typed theme-channel parity graph.
 *
 * Graph:
 *   declared BrandTheme field -> emitted --ds-* variable -> real var() reader
 *                              -> typed owner
 *
 * Reports and decrease-only ratchets:
 *   - declared-but-unemitted: a resolved visual leaf has no direct emitter edge
 *     and is not even read/routed by the inspected compiler sources;
 *   - emitted-but-unconsumed: a concrete emitted variable has no real source
 *     reader (dynamic templates are intentionally not guessed here);
 *   - consumed-but-unowned: an emitted/override channel that is actually read
 *     has neither a typed emitter owner nor an override-token owner.
 *
 * Foundation-only consumer variables outside the tenant compiler/override
 * inventory are out of scope; sharing a broad prefix such as `--ds-color-` is
 * not enough to make a base token a BrandTheme channel. Heuristic boundaries
 * are intentionally fail-soft: unresolved imported types,
 * computed keys and arbitrary JavaScript are reported as analysis limitations,
 * never converted into parity defects. Tests/stories/fixtures/generated outputs
 * are excluded from the consumer side so a proof fixture cannot make a dead dial
 * look alive.
 *
 * Usage:
 *   node scripts/theme-channel-parity-gate.mjs
 *   node scripts/theme-channel-parity-gate.mjs --check [--quiet]
 *   node scripts/theme-channel-parity-gate.mjs --current-json
 *   node scripts/theme-channel-parity-gate.mjs --update-baseline
 */
import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildParityCounters,
  buildThemeChannelParityGraph,
  collectDeclaredThemeFields,
  evaluateParityBaseline,
  extractConsumedCssVariables,
  extractStringArrayExport,
  parseEmitterMappings,
  parseTypeRegistry,
} from './lib/theme-channel-parity-graph.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const srcDir = join(root, 'src');
const contractsDir = join(srcDir, 'foundation', 'contracts');
const tenantThemeContract = join(
  contractsDir,
  'composition',
  'tenants',
  'themes',
  'tenant-theme',
  'index.ts',
);
const emitterFiles = [
  join(srcDir, 'infrastructure', 'compilers', 'kernel', 'foundation', 'css', 'chrome-variables', 'index.ts'),
  join(srcDir, 'infrastructure', 'compilers', 'kernel', 'runtime', 'brand-theme', 'index.ts'),
];
const baselinePath = join(here, 'theme-channel-parity-gate.baseline.json');

const SKIP_DIRS = new Set([
  '__fixtures__',
  '__tests__',
  'coverage',
  'dist',
  'docs',
  'fixtures',
  'node_modules',
  'stories',
]);

function isSource(path) {
  if (!/\.(?:css|ts|tsx)$/i.test(path)) return false;
  if (/\.(?:test|spec|stories)\.(?:ts|tsx)$/i.test(path)) return false;
  const normalized = path.replace(/\\/g, '/');
  if (normalized.includes('/facade/artifacts/')) return false;
  if (normalized.includes('/__generated__/')) return false;
  return true;
}

export function collectFiles(dir, predicate, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stats = statSync(full);
    if (stats.isDirectory()) {
      if (!SKIP_DIRS.has(entry)) collectFiles(full, predicate, out);
    } else if (predicate(full)) {
      out.push(full);
    }
  }
  return out.sort();
}

function readSources(files) {
  return files.map((file) => ({ file, text: readFileSync(file, 'utf8') }));
}

function collectConsumers(files) {
  const consumers = new Map();
  for (const file of files) {
    const names = extractConsumedCssVariables(readFileSync(file, 'utf8'), file);
    for (const name of names) {
      const locations = consumers.get(name) ?? new Set();
      locations.add(relative(root, file).replace(/\\/g, '/'));
      consumers.set(name, locations);
    }
  }
  return consumers;
}

export function runThemeChannelParityGate(paths = {}) {
  const effectiveContracts = paths.contractsDir ?? contractsDir;
  const effectiveSource = paths.srcDir ?? srcDir;
  const effectiveTenantContract = paths.tenantThemeContract ?? tenantThemeContract;
  const effectiveEmitters = paths.emitterFiles ?? emitterFiles;
  const contractFiles = collectFiles(effectiveContracts, (file) => /\.ts$/i.test(file));
  const contractSources = readSources(contractFiles);
  const { registry, ambiguous } = parseTypeRegistry(contractSources);
  const declarationResult = collectDeclaredThemeFields(registry);
  const emitterResult = parseEmitterMappings(readSources(effectiveEmitters), registry);
  const consumerFiles = collectFiles(effectiveSource, isSource);
  const consumers = collectConsumers(consumerFiles);
  const overrideTokens = extractStringArrayExport(
    readFileSync(effectiveTenantContract, 'utf8'),
    'TENANT_THEME_OVERRIDE_TOKENS',
    effectiveTenantContract,
  );
  const graph = buildThemeChannelParityGraph({
    declarations: declarationResult.fields,
    emissions: emitterResult.emissions,
    routedOwners: emitterResult.routedOwners,
    consumers,
    overrideTokens,
  });
  return {
    graph,
    counters: buildParityCounters(graph),
    analysis: {
      contractFiles: contractFiles.length,
      emitterFiles: effectiveEmitters.map((file) => relative(root, file).replace(/\\/g, '/')),
      consumerFiles: consumerFiles.length,
      overrideTokens: overrideTokens.size,
      ambiguousTypes: ambiguous,
      unresolvedDeclarations: declarationResult.unresolved,
      unresolvedEmissions: emitterResult.unresolved,
    },
  };
}

function loadBaseline() {
  if (!existsSync(baselinePath)) return { version: 1, ceilings: {} };
  return JSON.parse(readFileSync(baselinePath, 'utf8'));
}

function issuePreview(issues, field, limit = 12) {
  return issues.slice(0, limit).map((issue) => issue[field] ?? issue.id);
}

function main() {
  const check = process.argv.includes('--check');
  const quiet = process.argv.includes('--quiet');
  const currentJson = process.argv.includes('--current-json');
  const update = process.argv.includes('--update-baseline');
  const result = runThemeChannelParityGate();
  const baseline = loadBaseline();
  const evaluation = evaluateParityBaseline(result.counters, baseline);

  if (currentJson) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }

  if (update) {
    if (!evaluation.ok) {
      process.stderr.write(
        '[theme-channel-parity-gate] refusing to absorb a regression/new bucket into the baseline:\n',
      );
      for (const error of evaluation.errors) process.stderr.write(`  - ${error}\n`);
      process.exitCode = 1;
      return;
    }
    const ceilings = {};
    for (const key of new Set([
      ...Object.keys(baseline.ceilings ?? {}),
      ...Object.keys(result.counters),
    ])) ceilings[key] = result.counters[key] ?? 0;
    const payload = {
      version: 1,
      _comment:
        'DS-A003 decrease-only parity debt, bucketed by typed owner or CSS-variable namespace. --update-baseline may only tighten existing buckets; a new nonzero bucket requires reviewed manual adoption.',
      ceilings: Object.fromEntries(Object.entries(ceilings).sort(([a], [b]) => a.localeCompare(b))),
    };
    writeFileSync(baselinePath, `${JSON.stringify(payload, null, 2)}\n`);
    process.stdout.write(`[theme-channel-parity-gate] tightened ${baselinePath}\n`);
    return;
  }

  if (!quiet || !check) {
    const issues = result.graph.issues;
    process.stdout.write('theme-channel-parity-gate (DS-A003)\n');
    process.stdout.write(`  declared fields         : ${result.graph.nodes.declaredFields}\n`);
    process.stdout.write(`  concrete emitted vars   : ${result.graph.nodes.emittedVariables}\n`);
    process.stdout.write(`  dynamic emitter patterns: ${result.graph.nodes.emittedPatterns}\n`);
    process.stdout.write(`  real consumed vars      : ${result.graph.nodes.consumedVariables}\n`);
    process.stdout.write(`  declared-but-unemitted  : ${issues.declaredButUnemitted.length}\n`);
    process.stdout.write(`  emitted-but-unconsumed  : ${issues.emittedButUnconsumed.length}\n`);
    process.stdout.write(`  consumed-but-unowned    : ${issues.consumedButUnowned.length}\n`);
    process.stdout.write(`  unresolved declarations : ${result.analysis.unresolvedDeclarations.length}\n`);
    process.stdout.write(`  ambiguous type names    : ${result.analysis.ambiguousTypes.length}\n`);
    for (const [label, rows, field] of [
      ['declared-but-unemitted', issues.declaredButUnemitted, 'owner'],
      ['emitted-but-unconsumed', issues.emittedButUnconsumed, 'variable'],
      ['consumed-but-unowned', issues.consumedButUnowned, 'variable'],
    ]) {
      const preview = issuePreview(rows, field);
      if (preview.length > 0) process.stdout.write(`  ${label} sample: ${preview.join(', ')}${rows.length > preview.length ? ', …' : ''}\n`);
    }
  }

  if (evaluation.tighten.length > 0 && !quiet) {
    process.stdout.write(`  tighten opportunities (${evaluation.tighten.length}):\n`);
    for (const entry of evaluation.tighten.slice(0, 20)) process.stdout.write(`    - ${entry}\n`);
  }
  if (!evaluation.ok) {
    process.stderr.write('[theme-channel-parity-gate] parity ratchet failed:\n');
    for (const error of evaluation.errors) process.stderr.write(`  - ${error}\n`);
    if (check) process.exitCode = 1;
  } else if (check && !quiet) {
    process.stdout.write('[theme-channel-parity-gate] PASS\n');
  }
}

const isCli = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCli) main();
