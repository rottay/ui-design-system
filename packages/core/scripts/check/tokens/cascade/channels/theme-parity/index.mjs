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
 *   node scripts/check/tokens/cascade/channels/theme-parity/index.mjs
 *   node scripts/check/tokens/cascade/channels/theme-parity/index.mjs --check [--quiet]
 *   node scripts/check/tokens/cascade/channels/theme-parity/index.mjs --current-json
 *   node scripts/check/tokens/cascade/channels/theme-parity/index.mjs --update-baseline
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
  auditDataOnlyProjections,
  buildParityCounters,
  buildThemeChannelParityGraph,
  collectDeclaredThemeFields,
  DATA_ONLY_THEME_PROJECTIONS,
  evaluateParityBaseline,
  extractConsumedCssVariables,
  extractStringArrayExport,
  parseEmitterMappings,
  parseTypeRegistry,
} from '../../../../../libraries/tokens/index.mjs';
import { packageRoot as findPackageRoot } from '../../../../../libraries/repo-root/index.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = findPackageRoot(here);
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
const compilersDir = join(srcDir, 'infrastructure', 'compilers');
const baselinePath = join(here, 'baseline/index.json');
const obligationsPath = join(here, 'obligations/index.json');

/**
 * TRANSITIONAL OBLIGATIONS, evaluated AFTER the ratchet and never inside it.
 *
 * A ceiling is the wrong instrument for a bucket like
 * `declared-but-unemitted.BrandSegmentedChrome`: `evaluateParityBaseline` reads
 * only `baseline.ceilings`, so a number there makes the red vanish and records
 * nothing -- no owner, no reason, no target, and, since the test is
 * `count > ceiling`, no expiry either. The baseline file is also the wrong
 * PLACE: `--update-baseline` rewrites it as `{version,_comment,ceilings}`, so
 * the reviewed `_adoptions` prose is not preserved and an obligation stored
 * there would not survive the next tighten.
 *
 * So an obligation lives in a sibling folder, suppresses exactly one bucket,
 * and only under all five conditions below. It is exact in both directions:
 * growth is a regression and shrinkage is an unrecorded partial drain.
 */
export function loadObligations(path = obligationsPath) {
  if (!existsSync(path)) return { obligations: [] };
  return JSON.parse(readFileSync(path, 'utf8'));
}

export function evaluateObligations(ledger, counters, { resolveOwner }) {
  const failures = [];
  const consumed = new Map();
  for (const obligation of ledger.obligations ?? []) {
    const label = obligation.id ?? '<unnamed>';
    for (const field of ['id', 'ownerLot', 'resolution', 'reason', 'declaringOwner']) {
      if (typeof obligation[field] !== 'string' || obligation[field].trim() === '') {
        failures.push(`obligation ${label} is missing ${field}`);
      }
    }
    if (!obligation.expiry || typeof obligation.expiry.kind !== 'string') {
      failures.push(`obligation ${label} is missing an expiry`);
    }
    if (typeof obligation.count !== 'number') {
      failures.push(`obligation ${label} is missing an exact count`);
      continue;
    }

    // O1 — every legacy emitter owner still exists. When C2 moves one, the
    // obligation expires by construction and the declarations must be swept.
    for (const owner of obligation.legacyEmitterOwners ?? []) {
      if (!existsSync(join(root, owner))) {
        failures.push(
          `obligation ${label} EXPIRED: legacy owner ${owner} no longer exists — `
          + `its owner lot ${obligation.ownerLot} has run; delete the declarations and the obligation`,
        );
      }
    }
    // O2 — the declaring owner still exists.
    if (obligation.declaringOwner && !existsSync(join(root, obligation.declaringOwner))) {
      failures.push(`obligation ${label} EXPIRED: declaring owner moved — re-anchor or resolve`);
    }
    // O3 — the live counter is EXACTLY the recorded count.
    const live = counters[obligation.id];
    if (live === undefined) {
      failures.push(`obligation ${label} names a bucket the census no longer reports; delete the entry`);
      continue;
    }
    if (live !== obligation.count) {
      failures.push(`obligation ${label} count mismatch: expected ${obligation.count}, measured ${live}`);
      continue;
    }
    // O4 — every named field is still in the live issue list.
    const owners = resolveOwner();
    for (const field of obligation.fields ?? []) {
      if (!owners.has(field)) {
        failures.push(`obligation ${label} names a field that is no longer unemitted: ${field}`);
      }
    }
    if (failures.length === 0) consumed.set(obligation.id, obligation);
  }
  return { failures, consumed };
}



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
  // The whole compiler tree is scanned, not just the known projector: a new
  // data-* projection added anywhere must show up as unrostered, not vanish.
  const projectionFiles =
    paths.projectionFiles ??
    collectFiles(paths.compilersDir ?? compilersDir, (file) => /\.ts$/i.test(file) && isSource(file));
  const dataOnly = auditDataOnlyProjections({
    registry,
    declarations: declarationResult.fields,
    projectionSources: readSources(projectionFiles),
    emissions: emitterResult.emissions,
  });
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
    dataProjectedOwners: dataOnly.provenOwners,
  });
  return {
    graph,
    counters: buildParityCounters(graph),
    dataOnly: {
      roster: DATA_ONLY_THEME_PROJECTIONS.map((entry) => `${entry.owner} -> ${entry.attribute}`),
      proven: [...dataOnly.provenOwners].sort(),
      projections: dataOnly.projections.map(
        (entry) => `${entry.attribute} <- [${entry.family}].${entry.field} (${entry.functionName})`,
      ).sort(),
      violations: dataOnly.violations,
    },
    analysis: {
      contractFiles: contractFiles.length,
      emitterFiles: effectiveEmitters.map((file) => relative(root, file).replace(/\\/g, '/')),
      projectionFiles: projectionFiles.length,
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
  const dataOnlyViolations = result.dataOnly.violations;

  // Obligations are consulted AFTER the ratchet, never inside it. Each one
  // suppresses exactly one `new unbaselined bucket` error and nothing else; an
  // id that also appears in `ceilings` is an error, because that is the opaque
  // route this instrument exists to close.
  const ledger = loadObligations();
  const { failures: obligationFailures, consumed } = evaluateObligations(ledger, result.counters, {
    resolveOwner: () => new Set(result.graph.issues.declaredButUnemitted.map((issue) => issue.id)),
  });
  for (const id of consumed.keys()) {
    if (Object.hasOwn(baseline.ceilings ?? {}, id)) {
      obligationFailures.push(`obligation is not a ceiling: ${id} also appears in baseline.ceilings`);
    }
  }
  const suppressed = new Set([...consumed.keys()].map((id) => `new unbaselined bucket: ${id}=${consumed.get(id).count}`));
  const ratchetErrors = evaluation.errors.filter((error) => !suppressed.has(error));
  const ratchetOk = ratchetErrors.length === 0;
  const ok = ratchetOk && dataOnlyViolations.length === 0 && obligationFailures.length === 0;

  if (currentJson) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }

  if (update) {
    if ((ledger.obligations ?? []).length > 0) {
      process.stderr.write(
        '[theme-channel-parity-gate] refusing to tighten while a transitional obligation is open:\n',
      );
      for (const obligation of ledger.obligations) {
        process.stderr.write(`  - ${obligation.id} (owner ${obligation.ownerLot})\n`);
      }
      process.stderr.write(
        '  Tightening rewrites the baseline as {version,_comment,ceilings} and does not preserve\n'
        + '  _adoptions; resolve the obligation in its owner lot first.\n',
      );
      process.exitCode = 1;
      return;
    }
    if (!ok) {
      process.stderr.write(
        '[theme-channel-parity-gate] refusing to absorb a regression/new bucket into the baseline:\n',
      );
      for (const error of [...evaluation.errors, ...dataOnlyViolations])
        process.stderr.write(`  - ${error}\n`);
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
    process.stdout.write(`  data-only projections   : ${result.dataOnly.proven.length}/${result.dataOnly.roster.length} rostered pairs proven\n`);
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
  if (dataOnlyViolations.length > 0) {
    process.stderr.write('[theme-channel-parity-gate] data-only projection roster failed:\n');
    for (const violation of dataOnlyViolations) process.stderr.write(`  - ${violation}\n`);
  }
  for (const [id, obligation] of consumed) {
    process.stdout.write(
      `  obligation (owner ${obligation.ownerLot}, expires on ${obligation.expiry.kind}): ${id}=${obligation.count}\n`,
    );
  }
  if (!ratchetOk) {
    process.stderr.write('[theme-channel-parity-gate] parity ratchet failed:\n');
    for (const error of ratchetErrors) process.stderr.write(`  - ${error}\n`);
  }
  if (obligationFailures.length > 0) {
    process.stderr.write('[theme-channel-parity-gate] transitional obligation failed:\n');
    for (const failure of obligationFailures) process.stderr.write(`  - ${failure}\n`);
  }
  if (!ok) {
    if (check) process.exitCode = 1;
  } else if (check && !quiet) {
    process.stdout.write('[theme-channel-parity-gate] PASS\n');
  }
}

const isCli = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCli) main();
