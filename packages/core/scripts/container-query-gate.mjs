#!/usr/bin/env node
/**
 * Container-query gate (W6-A).
 *
 * Two checks over first-party src CSS:
 *
 *   (a) DEAD-NAME PROTECTION. Every `@container <name> (...)` must name a
 *       container some skin actually declares via `container-name` (or the
 *       `container` shorthand). A query against an undeclared name is not a
 *       syntax error -- the browser simply never matches it, so every rule
 *       inside stays permanently inert. Same detection shape as
 *       skin-dead-part-audit.mjs (cross-reference what is REFERENCED against
 *       what is DECLARED), but backed by a decrease-only baseline rather than
 *       a hard zero: the tree already carries one inherited dead name
 *       (`ds-table`) this lane did not create and was told to leave as-is --
 *       see container-query-gate.baseline.json for the finding. A hard-zero
 *       gate would fail on day one for debt outside this lane's mandate; a
 *       baselined ratchet accepts today's debt by name and reason while still
 *       catching every NEW dead name at the moment it is introduced.
 *
 *   (b) VIEWPORT-QUERY RATCHET. NEW `@media (max-width|min-width)`
 *       declarations under `presentation/components/**` fail. Semantic
 *       queries (forced-colors, prefers-*, print) are always allowed -- they
 *       gate accessibility/user preference, not layout, and have no
 *       container-query equivalent. Capability queries that are neither
 *       width- nor semantic-based (e.g. `(hover: hover)`) are out of scope
 *       entirely: this gate only restricts layout breakpoints. The residual
 *       width queries left after the W6-A command-home migration are a
 *       decrease-only baseline, seeded at post-migration reality.
 *
 * Usage:
 *   node scripts/container-query-gate.mjs           # print the report
 *   node scripts/container-query-gate.mjs --check   # exit 1 on any violation
 *   node scripts/container-query-gate.mjs --seed    # (re)author the baseline from current reality
 */
import { readFileSync, readdirSync, existsSync, writeFileSync } from 'node:fs';
import { join, dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');

/** Reads a `--flag value` pair from argv; falls back to `fallback` when absent. */
function argValue(flag, fallback) {
  const i = process.argv.indexOf(flag);
  return i >= 0 && process.argv[i + 1] ? resolve(process.argv[i + 1]) : fallback;
}

// Overridable for the fixture-mode self-test only; production invocation (report/
// --check/--seed) always uses the real package tree.
const CSS_ROOT = argValue('--css-root', join(ROOT, 'src/foundation/tokens/css'));
const COMPONENTS_ROOT = argValue('--components-root', join(CSS_ROOT, 'presentation/components'));
const BASELINE_PATH = argValue('--baseline', join(HERE, 'container-query-gate.baseline.json'));

function toPosix(p) {
  return p.split(sep).join('/');
}

function relPath(absolute) {
  return toPosix(relative(ROOT, absolute));
}

/** Every `.css` file under `dir`, recursing, skipping generated tenant artifacts. */
export function collectCssFiles(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (full.includes(`${sep}facade${sep}artifacts${sep}`)) continue;
      collectCssFiles(full, out);
    } else if (entry.name.endsWith('.css')) {
      out.push(full);
    }
  }
  return out;
}

/** Blanks `/* ... *\/` comments (prose that quotes CSS syntax -- a documented
 *  house idiom, see selection-preview-rail.css and patterns.css -- must never
 *  be mistaken for a real declaration or query) while preserving every
 *  newline, so line numbers computed against the result still match the
 *  original file. */
export function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, (match) => match.replace(/[^\n]/g, ' '));
}

/**
 * Every container name a `container-name` declaration or the `container`
 * shorthand actually declares. `none` clears rather than declaring; both
 * forms accept a space-separated list of custom-idents.
 */
export function extractDeclaredContainerNames(rawCss) {
  const css = stripComments(rawCss);
  const names = new Set();
  // Anchored on the LEFT with a negative lookbehind, not `\b`: a plain word
  // boundary treats `-` as a break, so it would fire mid-identifier inside a
  // custom property that merely ENDS in "container" (`--ds-spacing-container:`
  // is a real token in spacing.css). Excluding [a-zA-Z0-9-] on the left keeps
  // the match anchored to an actual property start (preceded by `{`, `;`,
  // whitespace, or the start of the file) while still tolerating more than one
  // declaration packed on a single line.
  for (const m of css.matchAll(/(?<![a-zA-Z0-9-])container-name\s*:\s*([^;}]+)[;}]/g)) {
    const value = m[1].trim();
    if (value === 'none') continue;
    for (const token of value.split(/\s+/)) if (token) names.add(token);
  }
  // The `container` shorthand: `container: <name-list>? [ / <type> ]?`. The
  // regex below never matches `container-name:`/`container-type:` -- after the
  // literal word "container" it requires only whitespace then `:`, and both
  // longhand properties have a `-` in that position instead.
  for (const m of css.matchAll(/(?<![a-zA-Z0-9-])container\s*:\s*([^;}]+)[;}]/g)) {
    const value = m[1].trim();
    const nameSegment = value.split('/')[0].trim();
    if (!nameSegment || nameSegment === 'none') continue;
    for (const token of nameSegment.split(/\s+/)) if (token) names.add(token);
  }
  return names;
}

/** Every NAMED `@container <name> (...)` query. Unnamed queries (`@container
 *  (...)`, `@container not (...)`, `@container style(...)`) resolve against
 *  the nearest ancestor container and have no name to validate. */
export function extractContainerQueries(rawCss, fileLabel = '') {
  const css = stripComments(rawCss);
  const queries = [];
  for (const m of css.matchAll(/@container\s+(\S+)/g)) {
    const token = m[1];
    if (token.startsWith('(') || token === 'not' || token.startsWith('not(') || token === 'style' || token.startsWith('style(')) {
      continue;
    }
    const line = css.slice(0, m.index).split('\n').length;
    queries.push({ name: token, line, file: fileLabel });
  }
  return queries;
}

const SEMANTIC_MEDIA_RE = /forced-colors|prefers-[a-z-]+/i;
const PRINT_MEDIA_RE = /(^|[\s,(])print(\s|,|$|\))/i;
const VIEWPORT_MEDIA_RE = /\b(?:max|min)-width\s*:/i;

/** Classifies one `@media` condition string (the text between `@media` and `{`). */
export function classifyMediaParams(params) {
  const trimmed = params.trim();
  if (SEMANTIC_MEDIA_RE.test(trimmed) || PRINT_MEDIA_RE.test(trimmed)) return 'semantic';
  if (VIEWPORT_MEDIA_RE.test(trimmed)) return 'viewport';
  return 'other';
}

/** Every `@media` at-rule in a file, classified. Comments stripped first. */
export function extractMediaQueries(rawCss) {
  const css = stripComments(rawCss);
  const queries = [];
  for (const m of css.matchAll(/@media\s+([^{]+)\{/g)) {
    const line = css.slice(0, m.index).split('\n').length;
    queries.push({ params: m[1].trim(), line, kind: classifyMediaParams(m[1]) });
  }
  return queries;
}

function loadBaseline() {
  if (!existsSync(BASELINE_PATH)) return { deadContainerNames: {}, viewportQueries: {} };
  const parsed = JSON.parse(readFileSync(BASELINE_PATH, 'utf8'));
  return {
    deadContainerNames: parsed.deadContainerNames ?? {},
    viewportQueries: parsed.viewportQueries ?? {},
  };
}

/** Pure evaluator for check (a): dead container-name references. */
export function evaluateDeadNames({ declaredNames, referencedQueries, baseline }) {
  const deadSet = new Set();
  for (const q of referencedQueries) {
    if (!declaredNames.has(q.name)) deadSet.add(q.name);
  }
  const dead = [...deadSet].sort();
  const baselineNames = new Set(Object.keys(baseline));
  const newDead = dead.filter((name) => !baselineNames.has(name));
  const revived = [...baselineNames].filter((name) => !deadSet.has(name));
  return { dead, newDead, revived };
}

/** Pure evaluator for check (b): the viewport-query ratchet, per file. */
export function evaluateViewportQueries({ countsByFile, baseline }) {
  const newViolations = [];
  const grown = [];
  const shrunk = [];
  for (const [file, count] of Object.entries(countsByFile)) {
    const entry = baseline[file];
    if (!entry) {
      newViolations.push({ file, count });
      continue;
    }
    if (count > entry.count) {
      grown.push({ file, count, ceiling: entry.count });
    } else if (count < entry.count) {
      shrunk.push({ file, count, ceiling: entry.count });
    }
  }
  const liveFiles = new Set(Object.keys(countsByFile));
  const stale = Object.keys(baseline).filter((file) => !liveFiles.has(file));
  return { newViolations, grown, shrunk, stale };
}

function runGate() {
  const allCssFiles = collectCssFiles(CSS_ROOT);

  const declaredNames = new Set();
  const referencedQueries = [];
  for (const file of allCssFiles) {
    const css = readFileSync(file, 'utf8');
    for (const name of extractDeclaredContainerNames(css)) declaredNames.add(name);
    referencedQueries.push(...extractContainerQueries(css, relPath(file)));
  }

  const componentCssFiles = collectCssFiles(COMPONENTS_ROOT);
  const countsByFile = {};
  for (const file of componentCssFiles) {
    const css = readFileSync(file, 'utf8');
    const viewportCount = extractMediaQueries(css).filter((q) => q.kind === 'viewport').length;
    if (viewportCount > 0) countsByFile[relPath(file)] = viewportCount;
  }

  const baseline = loadBaseline();
  const nameResult = evaluateDeadNames({ declaredNames, referencedQueries, baseline: baseline.deadContainerNames });
  const viewportResult = evaluateViewportQueries({ countsByFile, baseline: baseline.viewportQueries });

  const sitesByName = new Map();
  for (const q of referencedQueries) {
    if (!sitesByName.has(q.name)) sitesByName.set(q.name, []);
    sitesByName.get(q.name).push({ file: q.file, line: q.line });
  }

  return {
    declaredNameCount: declaredNames.size,
    referencedQueryCount: referencedQueries.length,
    nameResult,
    countsByFile,
    viewportResult,
    sitesByName,
  };
}

function reasonForDeadName(name) {
  if (name === 'ds-table') {
    return (
      'pre-existing at W6-A landing: patterns.css queries @container ds-table for the ' +
      'data-table column-priority-collapse rule, but no engine skin (checked ' +
      'runtime/engines/{modern,rustic}/skin/{table,data-table}.css) declares ' +
      'container-name: ds-table -- only a patterns.css comment claims it does. The rule ' +
      'has been silently inert since it landed. W6-A was told to keep ds-table as-is; ' +
      'this is disclosed debt for a follow-up, not something this lane fixes.'
    );
  }
  return 'dead @container name with zero matching container-name declaration in src css; accepted debt pending a fix or a query removal';
}

function reasonForViewportFile() {
  return (
    'pre-existing viewport query outside the W6-A command-home migration scope ' +
    '(design doc W6 section 1.2 explicitly excludes this file as a "single" to audit ' +
    'individually in a later wave)'
  );
}

function seed(result) {
  const deadContainerNames = {};
  for (const name of result.nameResult.dead) {
    deadContainerNames[name] = { reason: reasonForDeadName(name) };
  }
  const viewportQueries = {};
  for (const [file, count] of Object.entries(result.countsByFile)) {
    viewportQueries[file] = { count, reason: reasonForViewportFile() };
  }
  const payload = {
    _comment:
      'Decrease-only accepted-debt ledger for container-query-gate.mjs. (a) deadContainerNames: ' +
      '@container <name> queries with no matching container-name declaration anywhere in src css -- ' +
      'a NEW dead name (not listed here) fails --check; revive a name by declaring container-name on ' +
      'some skin. (b) viewportQueries: per-file count of @media (max-width|min-width) declarations ' +
      'under presentation/components/** -- growth past a file\'s ceiling, or a NEW file with any ' +
      'count, fails --check; a file dropping below its ceiling is a tighten opportunity via --seed.',
    deadContainerNames,
    viewportQueries,
  };
  writeFileSync(BASELINE_PATH, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(
    `[container-query-gate] seeded ${Object.keys(deadContainerNames).length} dead name(s) and ` +
      `${Object.keys(viewportQueries).length} viewport-query file(s) to ${relPath(BASELINE_PATH)}`,
  );
}

function main() {
  const mode = process.argv.includes('--seed') ? 'seed' : process.argv.includes('--check') ? 'check' : 'report';
  const result = runGate();

  if (mode === 'seed') {
    seed(result);
    return;
  }

  const totalViewport = Object.values(result.countsByFile).reduce((sum, n) => sum + n, 0);
  console.log('[container-query-gate]');
  console.log(`  container-name declared     : ${result.declaredNameCount}`);
  console.log(`  @container <name> queries   : ${result.referencedQueryCount}`);
  console.log(`  dead names                  : ${result.nameResult.dead.length} (${result.nameResult.dead.join(', ') || 'none'})`);
  console.log(`  new dead names (fail)       : ${result.nameResult.newDead.length}`);
  console.log(`  residual viewport queries   : ${totalViewport} across ${Object.keys(result.countsByFile).length} file(s)`);
  console.log(`  new viewport files (fail)   : ${result.viewportResult.newViolations.length}`);
  console.log(`  grown viewport files (fail) : ${result.viewportResult.grown.length}`);

  if (mode === 'report') {
    for (const q of result.nameResult.dead) {
      console.log(`    dead name: ${q}`);
    }
    for (const [file, count] of Object.entries(result.countsByFile).sort()) {
      console.log(`    viewport: ${file} -- ${count}`);
    }
  }

  const failures = [];
  for (const name of result.nameResult.newDead) {
    const sites = result.sitesByName.get(name) ?? [];
    const where = sites.map((s) => `${s.file}:${s.line}`).join(', ');
    failures.push(`new dead @container name: '${name}' has no matching container-name declaration anywhere in src css (${where})`);
  }
  for (const v of result.viewportResult.newViolations) {
    failures.push(`new viewport-query file: ${v.file} carries ${v.count} @media (max-width|min-width) declaration(s) with no baseline entry`);
  }
  for (const v of result.viewportResult.grown) {
    failures.push(`viewport-query ceiling grew: ${v.file} carries ${v.count}, ceiling is ${v.ceiling}`);
  }
  for (const file of result.viewportResult.stale) {
    failures.push(`stale viewport-query baseline entry (file carries no viewport queries anymore): ${file}`);
  }

  if (result.nameResult.revived.length > 0) {
    console.log(`[container-query-gate] ${result.nameResult.revived.length} baselined dead name(s) now declared; run --seed to tighten:`);
    for (const name of result.nameResult.revived) console.log(`  + ${name}`);
  }
  if (result.viewportResult.shrunk.length > 0) {
    for (const v of result.viewportResult.shrunk) {
      console.log(`[container-query-gate] ${v.file} is at ${v.count}/${v.ceiling} -- tighten the baseline ceiling`);
    }
  }

  if (failures.length > 0) {
    console.error(`[container-query-gate] FAIL (${failures.length})`);
    for (const f of failures) console.error(`  - ${f}`);
    if (mode === 'check') process.exit(1);
    return;
  }
  console.log('[container-query-gate] OK -- no new dead container names, no new/grown viewport-query residue.');
}

const invokedDirectly = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  main();
}
