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
const loweringDir = join(
  srcDir,
  'infrastructure',
  'compilers',
  'runtime',
  'theme',
  'runtime',
  'lowering',
);
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

export const CENSUS_CATEGORIES = [
  'declared-but-unemitted',
  'emitted-but-unconsumed',
  'consumed-but-unowned',
];

/** The census category a bucket id belongs to, or null when the id is not a bucket. */
export function categoryOf(id) {
  if (typeof id !== 'string') return null;
  return CENSUS_CATEGORIES.find((category) => id.startsWith(`${category}.`)) ?? null;
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
    const category = categoryOf(obligation.id);
    if (!category) {
      failures.push(`obligation ${label} is not a census bucket id`);
      continue;
    }
    // A roll-up is the sum of its buckets; obligating it would hide which
    // bucket the debt is in, which is the opacity this instrument closes.
    if (obligation.id === `${category}.total`) {
      failures.push(`obligation ${label} is a category roll-up; obligate the bucket that holds the debt`);
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
    // O4 — every named field is still in the live issue list of its own category.
    const owners = resolveOwner(category);
    for (const field of obligation.fields ?? []) {
      if (!owners.has(field)) {
        failures.push(`obligation ${label} names a field that is no longer unemitted: ${field}`);
      }
    }
    if (failures.length === 0) consumed.set(obligation.id, obligation);
  }
  return { failures, consumed };
}

/**
 * An obligated bucket is already accounted for -- exactly, by an owner lot,
 * with an expiry. Leaving it inside its category roll-up as well would force
 * the roll-up ceiling up by the same amount, and a raised roll-up ceiling is
 * permanent anonymous slack: precisely the ceiling-shaped opacity the
 * obligation replaces. So the ratchet reads the roll-up net of the exact
 * obligated counts, and every other bucket keeps its own ceiling untouched.
 * O3 has already proved each deducted count equals the live measurement.
 */
export function deductObligations(counters, consumed) {
  const adjusted = { ...counters };
  for (const [id, obligation] of consumed) {
    const total = `${categoryOf(id)}.total`;
    if (Object.hasOwn(adjusted, total)) adjusted[total] -= obligation.count;
  }
  return adjusted;
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

/**
 * Every emitter that can declare a chrome channel. The lowering's writers are
 * one owner per concern since C2, so the inventory walks them rather than
 * naming a single compiler file: a channel emitted by any one of them is
 * emitted, and an inventory that saw only one owner would report the others'
 * fields as declared-but-unemitted.
 *
 * THE LOWERING IS A TREE. Reading `<branch>/<owner>/index.ts` and nothing
 * below it was true while every owner was a single file. It stopped being
 * true when the families grew nested owners: `derivation/motion/character`,
 * `derivation/typography/{numeric,roles,weights}` and
 * `derivation/elevation/border` hold the `vars[...]` assignments for
 * `BrandMotion.character`, `BrandTypography.{numeric,roleWeights}` and
 * `BrandSurfaces.borderStyle` while their parent only composes them -- and
 * the whole `derivation/` branch already sat one level deeper than the read
 * reached, so its owners were invisible as a block. A parent that never
 * names a field is not evidence that nothing emits it, so the walk is
 * recursive and every `index.ts` under the lowering is an emitter.
 *
 * Tests and fixtures stay out, the same law the consumer side applies: a
 * proof fixture must never be able to make a declared field look emitted.
 *
 * GENERATED OUTPUT IS NOT AUTHORED, so it is not production by position. An
 * authored `index.ts` under the lowering is an emitter because someone put it
 * in the ownership tree; a `__generated__/index.ts` is only an emitter when a
 * productive owner imports it. Admitting it unconditionally lets an
 * unimported generated file certify a channel as emitted and make a real
 * declared-but-unemitted finding disappear -- the same false negative the
 * consumer side already closes by excluding `/__generated__/` in `isSource`.
 * The productivity test is a fixpoint so a generated owner reached only
 * through another admitted generated owner still counts, and it reads
 * IMPORTS BY RUNTIME SEMANTICS: only a reference that survives type erasure
 * admits the owner. A comment, a string mention and an `import type` /
 * `export type` bind nothing at runtime, so none of them may certify an
 * emission -- otherwise a commented-out import would suppress a real
 * declared-but-unemitted finding.
 */
const EMITTER_SKIP_DIRS = new Set([...SKIP_DIRS, 'test', 'tests']);
const GENERATED_DIR = '__generated__';

function isGeneratedOwner(file) {
  return file.replace(/\\/g, '/').includes(`/${GENERATED_DIR}/`);
}

function walkOwners(dir, out = []) {
  const own = join(dir, 'index.ts');
  if (existsSync(own)) out.push(own);
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory() || EMITTER_SKIP_DIRS.has(entry.name)) continue;
    walkOwners(join(dir, entry.name), out);
  }
  return out;
}

/**
 * Source reduced to CODE: every comment removed and every literal replaced by an
 * opaque placeholder, so text that merely LOOKS like an import cannot be read as
 * one. `const doc = "import { emit } from './__generated__'"` is a string, and a
 * string binds nothing when the file runs, so it must not certify an emission --
 * otherwise the productivity test is defeated by quoting the import it refuses.
 *
 * The scan is character-aware rather than a regex because `//` occurs
 * legitimately inside literals (URLs) and a naive strip truncates a file
 * mid-literal. A quoted literal cannot span a line, so a stray quote resyncs at
 * the newline instead of swallowing the file; a regex literal is skipped whole,
 * so the quotes inside a character class never open one; a template keeps its
 * `${}` expressions as code while its text becomes a placeholder that no
 * specifier read accepts. Every failure mode of the scan loses a real import,
 * which can only ADD a declared-but-unemitted finding; none of them can certify
 * a channel that nothing productive emits.
 */
const TEMPLATE_TEXT = '\u0000T\u0000';
const REGEX_MAY_START_AFTER =
  /(?:^|[({[,;:=!&|?+\-*/%~^<>]|\b(?:return|typeof|case|in|of|do|else|yield|await|new|void|delete))\s*$/;

function skipRegexLiteral(source, start) {
  let inClass = false;
  for (let index = start + 1; index < source.length; index += 1) {
    const character = source[index];
    if (character === '\\') index += 1;
    else if (character === '\n') break;
    else if (character === '[') inClass = true;
    else if (character === ']') inClass = false;
    else if (character === '/' && !inClass) return index + 1;
  }
  return start + 1;
}

function tokenize(source) {
  const quoted = [];
  const templates = [];
  let inTemplateText = false;
  let out = '';
  let index = 0;
  while (index < source.length) {
    const character = source[index];
    const next = source[index + 1];
    if (inTemplateText) {
      if (character === '\\') index += 2;
      else if (character === '`') {
        templates.pop();
        inTemplateText = false;
        index += 1;
      } else if (character === '$' && next === '{') {
        templates[templates.length - 1] = 0;
        inTemplateText = false;
        index += 2;
      } else index += 1;
      continue;
    }
    if (character === '/' && next === '/') {
      while (index < source.length && source[index] !== '\n') index += 1;
      out += '\n';
      continue;
    }
    if (character === '/' && next === '*') {
      index += 2;
      while (index < source.length && !(source[index] === '*' && source[index + 1] === '/')) index += 1;
      index += 2;
      out += ' ';
      continue;
    }
    if (character === '/' && REGEX_MAY_START_AFTER.test(out)) {
      index = skipRegexLiteral(source, index);
      out += ' ';
      continue;
    }
    if (character === "'" || character === '"') {
      let value = '';
      let scan = index + 1;
      for (; scan < source.length && source[scan] !== '\n' && source[scan] !== character; scan += 1) {
        if (source[scan] === '\\') {
          value += source[scan] + (source[scan + 1] ?? '');
          scan += 1;
          continue;
        }
        value += source[scan];
      }
      quoted.push(value);
      out += `\u0000Q${quoted.length - 1}\u0000`;
      index = source[scan] === character ? scan + 1 : scan;
      continue;
    }
    if (character === '`') {
      templates.push(0);
      inTemplateText = true;
      out += TEMPLATE_TEXT;
      index += 1;
      continue;
    }
    if (templates.length && character === '{') templates[templates.length - 1] += 1;
    else if (templates.length && character === '}') {
      if (templates[templates.length - 1] === 0) {
        inTemplateText = true;
        out += TEMPLATE_TEXT;
        index += 1;
        continue;
      }
      templates[templates.length - 1] -= 1;
    }
    out += character;
    index += 1;
  }
  return { text: out, quoted };
}

/**
 * True when an import/export clause still binds something at runtime. A
 * statement-level `type` modifier erases the whole statement, and a named
 * clause whose every specifier is inline-`type` is erased with it; `{ type }`
 * and `{ type as T }` bind a value called `type` and are not erased.
 */
function bindsAtRuntime(clause) {
  const outside = clause.replace(/\{[\s\S]*\}/, '').trim();
  if (outside.replace(/,/g, '').trim()) return true;
  const braces = clause.match(/\{([\s\S]*)\}/);
  if (!braces) return true;
  const specifiers = braces[1]
    .split(',')
    .map((specifier) => specifier.trim())
    .filter(Boolean);
  if (!specifiers.length) return false;
  return specifiers.some((specifier) => !/^type\s+(?!as\s)\S/.test(specifier));
}

/**
 * `import(...)` in a TYPE position is an import type query, not a load.
 * TypeScript erases `typeof import('./x')`, an annotation, a union member, a
 * generic argument and an `extends` / `keyof` / `satisfies` operand before
 * anything runs, and it erases a type alias whole, so the alias right-hand side
 * is removed before the read. A bare `import('./x')` in VALUE position does load
 * the module and still counts -- the distinction is what runs, not the keyword.
 */
const TYPE_QUERY_BEFORE = /(?:\btypeof|\bkeyof|\bextends|\bsatisfies|[:<|&])\s*$/;
const TYPE_ALIAS = /\btype\s+[A-Za-z_$][\w$]*\s*(?:<[^>]*>)?\s*=[^;]*;/g;

/**
 * Relative module specifiers a source names AS A VALUE, as the owner files they
 * could resolve to.
 *
 * Productivity is a runtime question, so it is answered with runtime semantics:
 * only a reference that survives type erasure makes a generated emitter
 * productive. A mention inside a comment or a literal, an `import type` /
 * `export type`, and an import type query leave the generated owner exactly as
 * unimported as if the line were absent -- and admitting any of them would let
 * prose suppress a real declared-but-unemitted finding. Value imports,
 * side-effect imports, value re-exports, `require` and a value-position dynamic
 * `import()` all bind at runtime and all count.
 */
function importedOwners(file) {
  const targets = new Set();
  const tokenized = tokenize(readFileSync(file, 'utf8'));
  const text = tokenized.text.replace(TYPE_ALIAS, ' ');
  const quotedAt = (index) => tokenized.quoted[Number(index)];
  const specifiers = [];
  for (const match of text.matchAll(
    /\b(?:import|export)\s+(type\s+)?([^\u0000]*?)\bfrom\s*\u0000Q(\d+)\u0000/g,
  )) {
    if (match[1] || !bindsAtRuntime(match[2])) continue;
    specifiers.push(quotedAt(match[3]));
  }
  for (const match of text.matchAll(/\b(?:import|require)\s*\(\s*\u0000Q(\d+)\u0000/g)) {
    if (TYPE_QUERY_BEFORE.test(text.slice(0, match.index))) continue;
    specifiers.push(quotedAt(match[1]));
  }
  for (const match of text.matchAll(/\bimport\s*\u0000Q(\d+)\u0000/g)) {
    specifiers.push(quotedAt(match[1]));
  }
  for (const specifier of specifiers) {
    if (!specifier.startsWith('.')) continue;
    const resolved = resolve(dirname(file), specifier.replace(/\.(?:js|ts)$/, ''));
    targets.add(`${resolved}.ts`);
    targets.add(join(resolved, 'index.ts'));
  }
  return targets;
}

export function collectEmitterOwners(dir) {
  const owners = walkOwners(dir);
  const admitted = new Set(owners.filter((file) => !isGeneratedOwner(file)));
  const candidates = owners.filter(isGeneratedOwner);
  for (let grew = true; grew; ) {
    grew = false;
    const imported = new Set();
    for (const file of admitted) for (const target of importedOwners(file)) imported.add(target);
    for (const candidate of candidates) {
      if (admitted.has(candidate) || !imported.has(candidate)) continue;
      admitted.add(candidate);
      grew = true;
    }
  }
  return [...admitted].sort();
}

const emitterFiles = [
  join(srcDir, 'infrastructure', 'compilers', 'kernel', 'foundation', 'css', 'chrome-variables', 'index.ts'),
  ...collectEmitterOwners(loweringDir),
];

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
  const dataOnlyViolations = result.dataOnly.violations;

  // An obligation is validated against the RAW census and only then removed
  // from the ratchet's view: it suppresses exactly one `new unbaselined
  // bucket` error and the same exact count inside that bucket's category
  // roll-up, and nothing else. An id that also appears in `ceilings` is an
  // error, because that is the opaque route this instrument exists to close.
  const ledger = loadObligations();
  const issuesByCategory = {
    'declared-but-unemitted': result.graph.issues.declaredButUnemitted,
    'emitted-but-unconsumed': result.graph.issues.emittedButUnconsumed,
    'consumed-but-unowned': result.graph.issues.consumedButUnowned,
  };
  const { failures: obligationFailures, consumed } = evaluateObligations(ledger, result.counters, {
    resolveOwner: (category) => new Set(issuesByCategory[category].map((issue) => issue.id)),
  });
  for (const id of consumed.keys()) {
    if (Object.hasOwn(baseline.ceilings ?? {}, id)) {
      obligationFailures.push(`obligation is not a ceiling: ${id} also appears in baseline.ceilings`);
    }
  }
  const ratchetCounters = deductObligations(result.counters, consumed);
  const evaluation = evaluateParityBaseline(ratchetCounters, baseline);
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
    const total = `${categoryOf(id)}.total`;
    process.stdout.write(
      `  obligation (owner ${obligation.ownerLot}, expires on ${obligation.expiry.kind}): ${id}=${obligation.count}`
      + ` [${total} measured ${result.counters[total]}, ratcheted ${ratchetCounters[total]}]\n`,
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
