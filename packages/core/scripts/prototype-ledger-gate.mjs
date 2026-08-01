#!/usr/bin/env node
/**
 * prototype-ledger-gate -- every prototoken is governed, or it does not exist.
 *
 * WHY THIS GATE EXISTS. `--_ds-proto-*` names are CANDIDATE AXES: private
 * hooks a family opens so a future authority can be adjudicated over it. That
 * is a legitimate device, but only while every one of them is written down.
 * Ungoverned, the set rots in three directions at once, and the phase-C audit
 * found all three live:
 *
 *   1. A family invents a proto, gives it a literal fallback, and the literal
 *      silently becomes a second source of truth (13px vs 14px for the SAME
 *      error glyph -- two families, two answers, no owner).
 *   2. A proto is retired from the CSS but its row survives in prose, so the
 *      documentation describes axes that no longer exist.
 *   3. A proto leaks into a generated tenant artifact, or reaches a shipped
 *      skin bundle without an active row, becoming an accidental contract.
 *
 * So this gate holds a bidirectional identity between the CSS/TSX sources and
 * `foundation/tokens/prototype-ledger.json`: every proto in the source has an
 * `active` row, every `active` row exists in the source, and every consumer
 * site a row claims is re-verified against the file on disk.
 *
 * THERE IS NO BASELINE. Zero is the only green. A baseline here would be the
 * exact failure mode the ledger exists to close: a list of protos we agreed
 * not to look at.
 *
 * Checks:
 *   (a) a proto in the sources with no `active` ledger entry
 *   (b) an `active` ledger entry with no occurrence in the sources
 *   (c) a claimed consumer site that does not resolve (missing file, or the
 *       file no longer contains the name)
 *   (d) an entry whose `category` is outside the nine canonical dispositions
 *   (e) ANY proto reaching a generated artifact, or an UNGOVERNED proto in a
 *       shipped bundle
 *   (f) ANY `--ds-proto-` (no underscore) in the sources -- a private name
 *       that lost its underscore has entered the public namespace
 *
 * Usage:
 *   node scripts/prototype-ledger-gate.mjs           # print the census
 *   node scripts/prototype-ledger-gate.mjs --check   # exit 1 on any violation
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const CORE_ROOT = resolve(HERE, '..');

export const LEDGER_PATH = join(CORE_ROOT, 'src/foundation/tokens/prototype-ledger.json');

/** The private prototoken prefix. */
const PROTO_PREFIX = '--_ds-proto-';

/** The same name WITHOUT the private underscore: a public-namespace leak. */
const LEAK_PREFIX = '--ds-proto-';

/**
 * The nine canonical dispositions. A prototoken is exactly one of these, and
 * the set is closed: a tenth disposition is a governance decision, not a
 * spelling choice, so it lands here explicitly or the gate rejects it.
 */
export const CATEGORIES = Object.freeze([
  'PRIVATE',
  'DERIVE_FROM_EXISTING',
  'FOUNDATION_AUTHORITY',
  'RECIPE_AXIS',
  'MERGE_RENAME',
  'APP_SLOT',
  'RUNTIME_INSTANCE_BRIDGE',
  'PRODUCT_DOMAIN',
  'DELETE',
]);

/** Sources the ledger governs. */
const SOURCE_ROOT = 'src';
const SOURCE_EXTENSIONS = ['.css', '.ts', '.tsx'];

/**
 * Test and story files are excluded: they may quote a proto name as an
 * assertion string, which is evidence ABOUT the axis, not a declaration of
 * one. Counting them would let a deleted proto stay "present" through its own
 * regression test.
 */
const EXCLUDED_SOURCE = /(^|\/)tests?\//;
const EXCLUDED_FILE = /\.(test|spec|stories)\.[jt]sx?$/;

/**
 * Generated tenant snapshots. These carry variable DEFINITIONS compiled from a
 * BrandTheme, never skin rules, so a prototoken here is unambiguously a leak:
 * it would mean a tenant artifact had taken a position on a PRIVATE axis.
 * Hard zero.
 */
const ARTIFACT_SURFACE = {
  root: 'src/foundation/tokens/css/facade/artifacts',
  match: (path) => path.endsWith('index.css'),
};

/**
 * Shipped bundles. These INLINE the whole skin corpus, so every prototoken a
 * skin consumes rides along by construction -- that is not a leak, it is how a
 * `var()` hook compiles. The enforceable invariant is therefore GOVERNANCE,
 * not absence: a name that reaches a consumer's stylesheet must have an active
 * ledger row. An ungoverned private name shipping to apps is the failure this
 * catches.
 *
 * These files are COMMITTED build products, so this check reads generated
 * output on purpose. A prototoken retired from the sources but still present
 * in a committed bundle therefore fails here, and it SHOULD: until the bundle
 * is regenerated, consumers are still being shipped that name. The fix is
 * `pnpm build:vertical-css`, not an exemption.
 */
const BUNDLE_SURFACE = {
  root: 'styles',
  match: (path) => path.endsWith('.css'),
};

function toPosix(value) {
  return value.split(sep).join('/');
}

/**
 * Blanks comment bodies while preserving byte offsets and line breaks, so a
 * name mentioned in prose cannot register as a declaration and every reported
 * line number still points at the real line.
 *
 * Handles CSS/JS block comments and optional JS line comments without
 * mistaking comment-looking text inside string literals for prose. CSS scans
 * disable `//` comments because an unquoted URL may legitimately contain it.
 */
export function blankComments(source, { lineComments = true } = {}) {
  let out = '';
  let index = 0;
  let quote = null;
  let escaped = false;
  while (index < source.length) {
    const character = source[index];

    if (quote !== null) {
      out += character;
      if (escaped) {
        escaped = false;
      } else if (character === '\\') {
        escaped = true;
      } else if (character === quote) {
        quote = null;
      }
      index += 1;
      continue;
    }

    if (character === "'" || character === '"' || character === '`') {
      quote = character;
      out += character;
      index += 1;
      continue;
    }

    if (source.startsWith('/*', index)) {
      const end = source.indexOf('*/', index + 2);
      const stop = end === -1 ? source.length : end + 2;
      for (let cursor = index; cursor < stop; cursor += 1) {
        out += source[cursor] === '\n' ? '\n' : ' ';
      }
      index = stop;
      continue;
    }
    if (lineComments && source.startsWith('//', index)) {
      let stop = source.indexOf('\n', index);
      if (stop === -1) stop = source.length;
      out += ' '.repeat(stop - index);
      index = stop;
      continue;
    }
    out += source[index];
    index += 1;
  }
  return out;
}

/**
 * The census rule, applied to comment-stripped source.
 *
 * A prototoken occurrence is either a DECLARATION -- the name opening a line,
 * which covers both `--_ds-proto-x: value` and the wrapped
 * `var(\n  --_ds-proto-x,\n  fallback\n)` continuation -- or a CONSUMPTION
 * inside `var(`. Anything else (a name embedded in a selector, a string, a
 * URL) is not a token site.
 */
export function findProtoSites(sourceText, options) {
  const clean = blankComments(sourceText, options);
  const sites = [];
  const lines = clean.split('\n');

  lines.forEach((line, offset) => {
    const declaration = line.match(
      /^\s*['"]?(--_ds-proto-[a-z0-9-]+)['"]?\s*(:|,|\))/
    );
    if (declaration) {
      sites.push({
        name: declaration[1],
        line: offset + 1,
        kind: declaration[2] === ':' ? 'def' : 'use',
      });
    }
    const objectDeclaration = line.match(
      /(?:^|[{,])\s*['"](--_ds-proto-[a-z0-9-]+)['"]\s*:/
    );
    if (objectDeclaration && objectDeclaration[1] !== declaration?.[1]) {
      sites.push({ name: objectDeclaration[1], line: offset + 1, kind: 'def' });
    }
    for (const match of line.matchAll(/var\(\s*(--_ds-proto-[a-z0-9-]+)/g)) {
      sites.push({ name: match[1], line: offset + 1, kind: 'use' });
    }
  });

  return sites;
}

/** Every `--ds-proto-` (no underscore) occurrence: the public-namespace leak. */
export function findLeaks(sourceText, options) {
  const clean = blankComments(sourceText, options);
  const leaks = [];
  clean.split('\n').forEach((line, offset) => {
    for (const match of line.matchAll(/(?<!-)--ds-proto-[a-z0-9-]+/g)) {
      leaks.push({ name: match[0], line: offset + 1 });
    }
  });
  return leaks;
}

function walk(directory, accept, files = []) {
  let entries;
  try {
    entries = readdirSync(directory, { withFileTypes: true });
  } catch {
    return files;
  }
  for (const entry of entries) {
    const full = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'dist') continue;
      walk(full, accept, files);
      continue;
    }
    if (accept(full)) files.push(full);
  }
  return files;
}

/** Production source files the ledger governs. */
export function listSourceFiles(root = CORE_ROOT) {
  return walk(join(root, SOURCE_ROOT), (full) => {
    const rel = toPosix(relative(root, full));
    if (!SOURCE_EXTENSIONS.some((extension) => rel.endsWith(extension))) return false;
    if (EXCLUDED_SOURCE.test(rel)) return false;
    if (EXCLUDED_FILE.test(rel)) return false;
    return true;
  }).sort();
}

/** Scans the sources and returns `{ census, leaks }`, both keyed by file. */
export function scanSources(root = CORE_ROOT) {
  const census = new Map();
  const leaks = [];

  for (const full of listSourceFiles(root)) {
    const rel = toPosix(relative(root, full));
    const text = readFileSync(full, 'utf8');
    const commentOptions = { lineComments: !rel.endsWith('.css') };

    for (const site of findProtoSites(text, commentOptions)) {
      if (!census.has(site.name)) census.set(site.name, []);
      census.get(site.name).push({ file: rel, line: site.line, kind: site.kind });
    }
    for (const leak of findLeaks(text, commentOptions)) {
      leaks.push({ file: rel, line: leak.line, name: leak.name });
    }
  }

  return { census, leaks };
}

/**
 * Every prototoken occurrence on one generated surface, comments blanked so a
 * wildcard quoted in a copied docblock (`--_ds-proto-modal-density-*`) is not
 * scored as a name.
 */
export function scanGeneratedSurface(surface, root = CORE_ROOT) {
  const found = [];
  const base = join(root, surface.root);
  if (!existsSync(base)) return found;
  const files = statSync(base).isDirectory()
    ? walk(base, (full) => surface.match(toPosix(full)))
    : [base];
  for (const full of files) {
    const rel = toPosix(relative(root, full));
    const text = blankComments(readFileSync(full, 'utf8'), { lineComments: false });
    text.split('\n').forEach((line, offset) => {
      for (const match of line.matchAll(/--_ds-proto-[a-z0-9-]+/g)) {
        found.push({ file: rel, line: offset + 1, name: match[0] });
      }
    });
  }
  return found;
}

export function scanArtifacts(root = CORE_ROOT) {
  return scanGeneratedSurface(ARTIFACT_SURFACE, root);
}

export function scanBundles(root = CORE_ROOT) {
  return scanGeneratedSurface(BUNDLE_SURFACE, root);
}

export function loadLedger(path = LEDGER_PATH) {
  const parsed = JSON.parse(readFileSync(path, 'utf8'));
  return Array.isArray(parsed.entries) ? parsed.entries : [];
}

/**
 * The whole verdict. Returns a flat list of problem strings; empty is green.
 */
export function evaluate({ root = CORE_ROOT, entries } = {}) {
  const problems = [];
  const { census, leaks } = scanSources(root);

  const active = new Map();
  const seen = new Set();

  for (const entry of entries) {
    if (!entry.name || !entry.name.startsWith(PROTO_PREFIX)) {
      problems.push(`ledger: entry "${entry.name}" is not a ${PROTO_PREFIX}* name`);
      continue;
    }
    if (seen.has(entry.name)) problems.push(`ledger: duplicate entry ${entry.name}`);
    seen.add(entry.name);

    // (d) closed disposition vocabulary
    if (!CATEGORIES.includes(entry.category)) {
      problems.push(`${entry.name}: category "${entry.category}" is not one of ${CATEGORIES.join(', ')}`);
    }
    if (entry.status !== 'active' && entry.status !== 'retired') {
      problems.push(`${entry.name}: status must be "active" or "retired" (got "${entry.status}")`);
    }
    if (entry.status === 'retired' && !entry.retiredBy) {
      problems.push(`${entry.name}: a retired entry MUST record retiredBy`);
    }
    if (entry.status === 'active') active.set(entry.name, entry);
  }

  // (a) a proto in the sources with no active row
  for (const name of [...census.keys()].sort()) {
    if (!active.has(name)) {
      const where = census.get(name)[0];
      problems.push(`${name}: present in ${where.file}:${where.line} with no active ledger entry`);
    }
  }

  // (b) an active row with no occurrence in the sources
  for (const name of [...active.keys()].sort()) {
    if (!census.has(name)) {
      problems.push(`${name}: active ledger entry with no occurrence in ${SOURCE_ROOT} -- retire it`);
    }
  }

  // (c) every claimed consumer site is re-verified on disk
  for (const entry of entries) {
    if (entry.status !== 'active') continue;
    for (const consumer of entry.consumers ?? []) {
      const full = join(root, consumer.file);
      if (!existsSync(full)) {
        problems.push(`${entry.name}: consumer file ${consumer.file} does not exist`);
        continue;
      }
      if (!readFileSync(full, 'utf8').includes(entry.name)) {
        problems.push(`${entry.name}: consumer ${consumer.file} no longer contains the name`);
      }
    }
    if (!entry.consumers || entry.consumers.length === 0) {
      problems.push(`${entry.name}: an active entry MUST list at least one verified consumer`);
    }
  }

  // (e1) a generated tenant artifact holds no prototoken at all
  for (const escape of scanArtifacts(root)) {
    problems.push(`${escape.name}: PRIVATE prototoken reached the generated artifact ${escape.file}:${escape.line}`);
  }

  // (e2) every prototoken compiled into a shipped bundle is governed
  const ungoverned = new Map();
  for (const shipped of scanBundles(root)) {
    if (active.has(shipped.name) || ungoverned.has(shipped.name)) continue;
    ungoverned.set(shipped.name, shipped);
  }
  for (const [name, where] of ungoverned) {
    problems.push(`${name}: UNGOVERNED prototoken shipped in ${where.file}:${where.line} with no active ledger entry`);
  }

  // (f) no public-namespace leak
  for (const leak of leaks) {
    problems.push(`${leak.name}: public-namespace leak (missing underscore) at ${leak.file}:${leak.line}`);
  }

  return problems;
}

function main() {
  const check = process.argv.includes('--check');
  const entries = loadLedger();
  const { census } = scanSources();

  if (!check) {
    const activeCount = entries.filter((entry) => entry.status === 'active').length;
    const retiredCount = entries.filter((entry) => entry.status === 'retired').length;
    console.log(`prototokens in src : ${census.size}`);
    console.log(`ledger entries     : ${entries.length} (${activeCount} active, ${retiredCount} retired)`);
    const byCategory = new Map();
    for (const entry of entries) {
      byCategory.set(entry.category, (byCategory.get(entry.category) ?? 0) + 1);
    }
    for (const category of CATEGORIES) {
      if (byCategory.has(category)) console.log(`  ${category.padEnd(24)} ${byCategory.get(category)}`);
    }
    return;
  }

  const problems = evaluate({ entries });
  if (problems.length > 0) {
    console.error(`prototype-ledger-gate: ${problems.length} violation(s)\n`);
    for (const problem of problems) console.error(`  - ${problem}`);
    process.exit(1);
  }
  console.log(`prototype-ledger-gate: OK (${census.size} prototokens, all governed)`);
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  main();
}
