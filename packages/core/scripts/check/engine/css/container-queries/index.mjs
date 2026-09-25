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
 *       see baseline/index.json for the finding. A hard-zero
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
 *   (c) SELF-REFERENTIAL QUERIES. A container query resolves against the
 *       nearest ANCESTOR container of that name, never the element itself. A
 *       rule inside `@container <name>` whose subject compound carries every
 *       simple selector of a compound that declares `container-name: <name>`
 *       (the same selector, or a narrower one such as `root:hover`) can only
 *       match the declaring element, so it matches nothing unless that element
 *       sits inside another container of the same name. A selector that names
 *       such an ancestor (`.card .card[data-part='root']`) says so and is not a
 *       finding; a bare one is, and the same-name nesting it may rely on is
 *       adjudicated per site. A pseudo-element or `&` on the declaring
 *       element itself is counted as not judged. The live sites are a decrease-only ledger: a new site fails,
 *       and a site that stops being live must move to `removed` with a reason
 *       and the commit that moved it.
 *
 * Usage:
 *   node scripts/check/engine/css/container-queries/index.mjs           # print the report
 *   node scripts/check/engine/css/container-queries/index.mjs --check   # exit 1 on any violation
 *   node scripts/check/engine/css/container-queries/index.mjs --seed    # (re)author the baseline from current reality
 */
import { readFileSync, readdirSync, existsSync, writeFileSync } from 'node:fs';
import { join, dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { packageRoot as findPackageRoot } from '../../../../libraries/repo-root/index.mjs';

const postcss = createRequire(import.meta.url)('postcss');

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = findPackageRoot(HERE);

/** Reads a `--flag value` pair from argv; falls back to `fallback` when absent. */
function argValue(flag, fallback) {
  const i = process.argv.indexOf(flag);
  return i >= 0 && process.argv[i + 1] ? resolve(process.argv[i + 1]) : fallback;
}

// Overridable for the fixture-mode self-test only; production invocation (report/
// --check/--seed) always uses the real package tree.
const CSS_ROOT = argValue('--css-root', join(ROOT, 'src/foundation/tokens/css'));
const COMPONENTS_ROOT = argValue('--components-root', join(CSS_ROOT, 'presentation/components'));
const BASELINE_PATH = argValue('--baseline', join(HERE, 'baseline/index.json'));

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

/** Splits `text` on `separator` characters that sit outside brackets, parens and quotes. */
function splitTopLevel(text, isSeparator) {
  const parts = [];
  let depth = 0;
  let quote = null;
  let current = '';
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quote) {
      current += ch;
      if (ch === '\\') {
        current += text[i + 1] ?? '';
        i += 1;
      } else if (ch === quote) {
        quote = null;
      }
      continue;
    }
    if (ch === '"' || ch === "'") quote = ch;
    else if (ch === '(' || ch === '[') depth += 1;
    else if (ch === ')' || ch === ']') depth -= 1;
    if (depth === 0 && isSeparator(ch)) {
      parts.push(current);
      current = ch;
      continue;
    }
    current += ch;
  }
  parts.push(current);
  return parts;
}

/** The comma branches of a selector list, trimmed. */
export function selectorBranches(selector) {
  return splitTopLevel(selector, (ch) => ch === ',')
    .map((part, index) => (index === 0 ? part : part.slice(1)).trim())
    .filter(Boolean);
}

/** One simple selector in a canonical spelling: attribute quotes and inner whitespace dropped. */
function normalizeSimple(simple) {
  if (!simple.startsWith('[')) return simple.replace(/\s+/g, ' ');
  const inner = simple.slice(1, -1).trim();
  const match = inner.match(/^([^~|^$*=\s]+)\s*([~|^$*]?=)\s*(.+?)(\s+[iIsS])?$/u);
  if (!match) return `[${inner}]`;
  const value = match[3].replace(/^(['"])(.*)\1$/u, '$2');
  return `[${match[1]}${match[2]}${value}${match[4] ? match[4].trim().toLowerCase() : ''}]`;
}

/** The simple selectors of one compound, plus whether it carries a pseudo-element or a nesting `&`. */
export function parseCompound(compound) {
  const simples = [];
  let i = 0;
  const text = compound.trim();
  while (i < text.length) {
    let j = i + 1;
    if (text[i] === '[') {
      let depth = 0;
      let quote = null;
      for (j = i; j < text.length; j += 1) {
        const ch = text[j];
        if (quote) { if (ch === quote) quote = null; continue; }
        if (ch === '"' || ch === "'") quote = ch;
        else if (ch === '[') depth += 1;
        else if (ch === ']') { depth -= 1; if (depth === 0) { j += 1; break; } }
      }
    } else if (text[i] === ':') {
      j = text[i + 1] === ':' ? i + 2 : i + 1;
      while (j < text.length && /[\w-]/u.test(text[j])) j += 1;
      if (text[j] === '(') {
        let depth = 0;
        for (; j < text.length; j += 1) {
          if (text[j] === '(') depth += 1;
          else if (text[j] === ')') { depth -= 1; if (depth === 0) { j += 1; break; } }
        }
      }
    } else {
      while (j < text.length && !/[.#[:]/u.test(text[j])) j += 1;
    }
    simples.push(normalizeSimple(text.slice(i, j)));
    i = j;
  }
  return {
    simples: new Set(simples.filter((simple) => simple !== '*')),
    pseudoElement: simples.some((simple) => simple.startsWith('::') || /^:(before|after|first-line|first-letter)$/u.test(simple)),
    nesting: simples.some((simple) => simple.includes('&')),
  };
}

/**
 * A complex selector as compounds, each tagged with whether it is an ANCESTOR
 * of the subject. A compound whose right-hand combinator is descendant or child
 * is an ancestor of the subject: a sibling of the subject or of an ancestor
 * shares its parent chain.
 */
export function parseComplexSelector(selector) {
  const tokens = [];
  let current = '';
  const flush = () => {
    if (current.trim()) tokens.push({ compound: current.trim() });
    current = '';
  };
  const parts = splitTopLevel(selector.trim(), (ch) => /[\s>+~]/u.test(ch));
  for (const part of parts) {
    const head = part[0];
    if (head && /[\s>+~]/u.test(head)) {
      flush();
      const last = tokens.at(-1);
      if (last && head !== ' ' && head !== '\n' && head !== '\t') last.combinator = head;
      else if (last && !last.combinator) last.combinator = ' ';
      current = part.slice(1);
    } else {
      current += part;
    }
  }
  flush();
  return tokens.map((token, index) => ({
    ...parseCompound(token.compound),
    text: token.compound,
    ancestor: index < tokens.length - 1 && (token.combinator ?? ' ') !== '+' && token.combinator !== '~',
  }));
}

/** True when `candidate` carries every simple selector of `declared`: it matches only elements `declared` matches. */
export function compoundWithin(candidate, declared) {
  if (declared.simples.size === 0) return false;
  for (const simple of declared.simples) if (!candidate.simples.has(simple)) return false;
  return true;
}

function containerNamesOf(decl) {
  const value = decl.value.trim();
  const segment = decl.prop === 'container' ? value.split('/')[0].trim() : value;
  if (!segment || segment === 'none') return [];
  return segment.split(/\s+/u).filter(Boolean);
}

function queriedName(params) {
  const token = params.trim().split(/\s+/u)[0] ?? '';
  if (!token || token.startsWith('(') || token === 'not' || token.startsWith('not(') || token === 'style' || token.startsWith('style(')) return null;
  return token;
}

/**
 * The facts check (c) needs from one stylesheet: every combinator-free compound
 * that declares a container name, and every rule branch inside a named
 * `@container`.
 */
export function extractSelfReferenceFacts(rawCss, fileLabel = '') {
  const declarations = [];
  const queries = [];
  const root = postcss.parse(rawCss);
  root.walkRules((rule) => {
    const names = [];
    for (const node of rule.nodes ?? []) {
      if (node.type === 'decl' && (node.prop === 'container-name' || node.prop === 'container')) names.push(...containerNamesOf(node));
    }
    const branches = selectorBranches(rule.selector);
    if (names.length > 0) {
      for (const branch of branches) {
        const complex = parseComplexSelector(branch);
        if (complex.length !== 1 || complex[0].pseudoElement || complex[0].nesting) continue;
        for (const name of names) declarations.push({ name, compound: complex[0], selector: branch, file: fileLabel, line: rule.source?.start?.line ?? 0 });
      }
    }
    for (let parent = rule.parent; parent; parent = parent.parent) {
      if (parent.type !== 'atrule' || parent.name !== 'container') continue;
      const name = queriedName(parent.params);
      if (!name) continue;
      for (const branch of branches) {
        queries.push({ name, selector: branch, complex: parseComplexSelector(branch), file: fileLabel, line: rule.source?.start?.line ?? 0 });
      }
    }
  });
  return { declarations, queries };
}

/** The stable id of one self-referential site; a repeat of the same selector in the same file carries its ordinal. */
export function selfReferenceSiteId(site) {
  const base = `${site.file} :: @container ${site.name} :: ${site.selector.replace(/\s+/gu, ' ')}`;
  return site.occurrence > 1 ? `${base} #${site.occurrence}` : base;
}

/** Pure evaluator for check (c). */
export function evaluateSelfReferentialQueries({ declarations, queries, baseline = {} }) {
  const declarersByName = new Map();
  for (const declaration of declarations) {
    if (!declarersByName.has(declaration.name)) declarersByName.set(declaration.name, []);
    declarersByName.get(declaration.name).push(declaration);
  }
  const live = new Map();
  const occurrences = new Map();
  let unjudged = 0;
  for (const query of queries) {
    const declarers = declarersByName.get(query.name) ?? [];
    const subject = query.complex.at(-1);
    if (!subject || declarers.length === 0) continue;
    const declarer = declarers.find((d) => compoundWithin(subject, d.compound));
    if (!declarer) continue;
    if (subject.pseudoElement || subject.nesting) {
      unjudged += 1;
      continue;
    }
    const namedAncestor = query.complex.some(
      (compound) => compound.ancestor && declarers.some((d) => compoundWithin(compound, d.compound)),
    );
    if (namedAncestor) continue;
    const site = { name: query.name, selector: query.selector, file: query.file, line: query.line, declaredBy: `${declarer.file}:${declarer.line} ${declarer.selector}` };
    const base = selfReferenceSiteId(site);
    const occurrence = (occurrences.get(base) ?? 0) + 1;
    occurrences.set(base, occurrence);
    site.occurrence = occurrence;
    live.set(selfReferenceSiteId(site), site);
  }
  const ledger = new Set(Object.keys(baseline.sites ?? {}));
  const removed = baseline.removed ?? {};
  const newSites = [...live.keys()].filter((id) => !ledger.has(id)).sort();
  const staleSites = [...ledger].filter((id) => !live.has(id)).sort();
  const malformed = [];
  for (const [id, entry] of Object.entries(baseline.sites ?? {})) {
    if (typeof entry?.adjudication !== 'string' || entry.adjudication.trim() === '') malformed.push(`${id}: a ledger site needs an adjudication`);
  }
  for (const [id, entry] of Object.entries(removed)) {
    if (typeof entry?.reason !== 'string' || entry.reason.trim() === '' || typeof entry?.mover !== 'string' || !/^[0-9a-f]{7,40}\b/u.test(entry.mover)) {
      malformed.push(`${id}: a removed site needs a reason and the commit that moved it`);
    }
    if (ledger.has(id)) malformed.push(`${id}: listed both as a live site and as removed`);
  }
  return { live: [...live.values()], newSites, staleSites, malformed, unjudged };
}

function loadBaseline() {
  if (!existsSync(BASELINE_PATH)) return { deadContainerNames: {}, viewportQueries: {}, selfReferentialQueries: {} };
  const parsed = JSON.parse(readFileSync(BASELINE_PATH, 'utf8'));
  return {
    deadContainerNames: parsed.deadContainerNames ?? {},
    viewportQueries: parsed.viewportQueries ?? {},
    selfReferentialQueries: parsed.selfReferentialQueries ?? {},
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
  const selfFacts = { declarations: [], queries: [] };
  for (const file of allCssFiles) {
    const css = readFileSync(file, 'utf8');
    for (const name of extractDeclaredContainerNames(css)) declaredNames.add(name);
    referencedQueries.push(...extractContainerQueries(css, relPath(file)));
    const facts = extractSelfReferenceFacts(css, relPath(file));
    selfFacts.declarations.push(...facts.declarations);
    selfFacts.queries.push(...facts.queries);
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
  const selfResult = evaluateSelfReferentialQueries({ ...selfFacts, baseline: baseline.selfReferentialQueries });

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
    selfResult,
    sitesByName,
    baseline,
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
    ...(result.baseline.selfReferentialQueries && Object.keys(result.baseline.selfReferentialQueries).length > 0
      ? { selfReferentialQueries: result.baseline.selfReferentialQueries }
      : {}),
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
  console.log(`  self-referential queries    : ${result.selfResult.live.length} live (${result.selfResult.unjudged} pseudo-element/nesting subject(s) not judged)`);
  console.log(`  new self-referential (fail) : ${result.selfResult.newSites.length}`);

  if (mode === 'report') {
    for (const q of result.nameResult.dead) {
      console.log(`    dead name: ${q}`);
    }
    for (const [file, count] of Object.entries(result.countsByFile).sort()) {
      console.log(`    viewport: ${file} -- ${count}`);
    }
    for (const site of result.selfResult.live) {
      console.log(`    self-referential: ${site.file}:${site.line} @container ${site.name} ${site.selector} (declared by ${site.declaredBy})`);
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
  for (const id of result.selfResult.newSites) {
    const site = result.selfResult.live.find((s) => selfReferenceSiteId(s) === id);
    failures.push(`new self-referential container query: ${site.file}:${site.line} queries @container ${site.name} from ${site.selector}, which only the declaring element matches (declared by ${site.declaredBy}); query from a descendant, or ledger it with an adjudication`);
  }
  for (const id of result.selfResult.staleSites) {
    failures.push(`self-referential site no longer live: ${id} -- move it to selfReferentialQueries.removed with a reason and the commit that moved it`);
  }
  for (const line of result.selfResult.malformed) failures.push(`self-referential ledger: ${line}`);
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
  console.log('[container-query-gate] OK -- no new dead container names, no new/grown viewport-query residue, no new self-referential container query.');
}

const invokedDirectly = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  main();
}
