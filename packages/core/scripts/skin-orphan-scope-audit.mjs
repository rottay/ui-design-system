#!/usr/bin/env node
/**
 * Orphan scope-class audit.
 *
 * Walks the OPPOSITE direction to `skin-dead-part-audit.mjs`, deliberately:
 *
 *   skin-dead-part-audit :  skin selector  ->  is that part ever stamped?
 *   this gate            :  stamped class  ->  can any skin selector reach it?
 *
 * The two share no module and no technique, so their agreement carries real
 * information. A class stamped on a shipped element that no rule can match is
 * silent: it renders, it looks intentional, and it paints nothing.
 *
 * WHY QUOTE-AGNOSTIC MATCHING IS NOT A DETAIL. The census that motivated this
 * gate used `\[data-part='([^']+)'\]` and missed 546 double-quoted selectors
 * across ten skins, which turned a live rule into a false orphan. Attribute
 * selectors here are matched with all three CSS spellings ('x', "x", x), and
 * the positive control below plants a double-quoted case for exactly that
 * reason.
 *
 * SCOPE IS PRINTED, NOT ASSUMED. An unbounded "N orphans" claim is the failure
 * mode: a class declared outside the searched trees reads as unreachable when
 * it is fine (`ds-sr-only` lives in `runtime/engines/**`, not the skin dir).
 * Every run prints the trees it searched and the file counts, so a reader can
 * see what the number is a statement about.
 *
 * Usage:
 *   node scripts/skin-orphan-scope-audit.mjs            # report
 *   node scripts/skin-orphan-scope-audit.mjs --check    # exit 1 above baseline
 *   node scripts/skin-orphan-scope-audit.mjs --seed     # (re)author the baseline
 *   node scripts/skin-orphan-scope-audit.mjs --self-test  # positive control
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdtempSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const BASELINE_PATH = join(HERE, 'skin-orphan-scope-audit.baseline.json');

/** Every tree a scope class may legitimately be declared in. */
const CSS_TREES = [
  'src/foundation/tokens/css/presentation/components',
  'src/foundation/tokens/css/runtime/engines',
  'src/foundation/tokens/css/foundation',
  'src/foundation/tokens/css/facade',
];
/** The tiers whose authored components are audited for stamped classes. */
const TSX_TREES = ['src/ui/structures', 'src/ui/patterns'];

function walk(dir, test, out = []) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== 'node_modules') walk(p, test, out); }
    else if (test(e.name)) out.push(p);
  }
  return out;
}

/** Class names any CSS selector in the given trees can match. */
function reachableClasses(root, trees) {
  const classes = new Set();
  let files = 0;
  for (const tree of trees) {
    const abs = join(root, tree);
    if (!existsSync(abs)) continue;
    for (const f of walk(abs, (n) => n.endsWith('.css'))) {
      files += 1;
      let parsed;
      try { parsed = postcss.parse(readFileSync(f, 'utf8'), { from: f }); }
      catch { continue; } // a skin that does not parse is skins.parseErrors' job, not this gate's
      parsed.walkRules((rule) => {
        if (rule.parent?.type === 'atrule' && /keyframes/.test(rule.parent.name)) return;
        for (const sel of rule.selectors) {
          for (const m of sel.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)) classes.add(m[1]);
        }
      });
    }
  }
  return { classes, files };
}

/**
 * Classes a component stamps on real DOM. Deliberately conservative: only
 * `className=` literals and template heads, because a fully interpolated class
 * is invisible to any static scan and a FLOOR is honest where a guess is not.
 */
function stampedClasses(root, trees) {
  const rows = [];
  let files = 0;
  for (const tree of trees) {
    const abs = join(root, tree);
    if (!existsSync(abs)) continue;
    for (const f of walk(abs, (n) => /\.tsx$/.test(n) && !/\.(test|stories)\.tsx$/.test(n))) {
      files += 1;
      const src = readFileSync(f, 'utf8');
      const found = new Set();
      // className="a b" | className={'a b'} | className={`a b ${x}`} | ['a','b'] join
      for (const m of src.matchAll(/className\s*=\s*(?:"([^"]*)"|'([^']*)'|\{\s*[`'"]([^`'"]*)[`'"])/g)) {
        for (const cls of (m[1] ?? m[2] ?? m[3] ?? '').split(/\s+/)) {
          if (/^ds-[a-z0-9-]+$/.test(cls)) found.add(cls);
        }
      }
      for (const m of src.matchAll(/\[\s*((?:'ds-[a-z0-9-]+'\s*,\s*)+'ds-[a-z0-9-]+')/g)) {
        for (const q of m[1].matchAll(/'(ds-[a-z0-9-]+)'/g)) found.add(q[1]);
      }
      if (found.size) rows.push({ file: relative(root, f).split(sep).join('/'), classes: [...found] });
    }
  }
  return { rows, files };
}

/** Classes that are structural noise rather than a family's own scope. */
const IGNORED = new Set(['ds-structure', 'ds-compat']);

function audit(root, { cssTrees = CSS_TREES, tsxTrees = TSX_TREES } = {}) {
  const { classes: reachable, files: cssFiles } = reachableClasses(root, cssTrees);
  const { rows, files: tsxFiles } = stampedClasses(root, tsxTrees);
  const orphans = [];
  for (const row of rows) {
    for (const cls of row.classes) {
      if (IGNORED.has(cls)) continue;
      if (!reachable.has(cls)) orphans.push({ file: row.file, class: cls });
    }
  }
  orphans.sort((a, b) => (a.file + a.class).localeCompare(b.file + b.class));
  return { orphans, cssFiles, tsxFiles, cssTrees, tsxTrees, reachableCount: reachable.size };
}

/* ── positive control ──────────────────────────────────────────────────────
   A census that has only ever returned "found N" has never shown it can find
   anything. This plants known orphans in a fixture tree and fails unless each
   is caught, including the double-quoted case the real bug hid behind. */
function selfTest() {
  const w = writeFileSync;
  const dir = mkdtempSync(join(tmpdir(), 'orphan-gate-'));
  const css = join(dir, 'src/foundation/tokens/css/presentation/components');
  const tsx = join(dir, 'src/ui/structures/probe');
  mkdirSync(css, { recursive: true });
  mkdirSync(tsx, { recursive: true });

  w(join(css, 'probe.css'), [
    `.ds-structure.ds-probe[data-part='root'] { color: red; }`,
    `.ds-structure.ds-probe [data-part="double-quoted"] { color: blue; }`,
    `.ds-probe-reached { color: green; }`,
  ].join('\n'));

  w(join(tsx, 'index.tsx'), [
    `export const A = () => <div className="ds-structure ds-probe" />;`,
    `export const B = () => <div className="ds-probe-reached" />;`,
    `export const C = () => <div className="ds-probe-orphan-plain" />;`,
    `export const D = () => <div className={'ds-probe-orphan-single'} />;`,
    `export const E = () => <div className={['ds-structure', 'ds-probe-orphan-array'].join(' ')} />;`,
  ].join('\n'));

  const { orphans } = audit(dir, {
    cssTrees: ['src/foundation/tokens/css/presentation/components'],
    tsxTrees: ['src/ui/structures'],
  });
  const got = new Set(orphans.map((o) => o.class));
  const mustFind = ['ds-probe-orphan-plain', 'ds-probe-orphan-single', 'ds-probe-orphan-array'];
  const mustNotFind = ['ds-probe', 'ds-probe-reached', 'ds-structure'];

  const missed = mustFind.filter((c) => !got.has(c));
  const falsePositives = mustNotFind.filter((c) => got.has(c));
  console.log(`[self-test] planted ${mustFind.length} orphans, caught ${mustFind.length - missed.length}`);
  console.log(`[self-test] reachable classes that must NOT be flagged: ${mustNotFind.join(', ')}`);
  if (missed.length) console.error(`[self-test] MISSED: ${missed.join(', ')}`);
  if (falsePositives.length) console.error(`[self-test] FALSE POSITIVE: ${falsePositives.join(', ')}`);
  const ok = !missed.length && !falsePositives.length;
  console.log(`[self-test] ${ok ? 'PASS — the gate demonstrably finds what it claims to find' : 'FAIL'}`);
  return ok ? 0 : 1;
}

/* ── main ─────────────────────────────────────────────────────────────────── */
const mode = process.argv.includes('--self-test') ? 'self-test'
  : process.argv.includes('--check') ? 'check'
  : process.argv.includes('--seed') ? 'seed'
  : 'report';

if (mode === 'self-test') process.exit(selfTest());

const result = audit(ROOT);
const key = (o) => `${o.file}::${o.class}`;

console.log('[skin-orphan-scope-audit]');
console.log(`  CSS trees searched   : ${result.cssTrees.join(', ')}`);
console.log(`  CSS files parsed     : ${result.cssFiles}   (reachable classes: ${result.reachableCount})`);
console.log(`  TSX trees searched   : ${result.tsxTrees.join(', ')}`);
console.log(`  TSX files scanned    : ${result.tsxFiles}`);
console.log(`  orphan scope classes : ${result.orphans.length}`);
for (const o of result.orphans) console.log(`    ${o.class}  <-  ${o.file}`);
console.log('  NOTE: interpolated class names are invisible to a static scan, so this is a FLOOR.');

if (mode === 'seed') {
  writeFileSync(BASELINE_PATH, `${JSON.stringify({ orphans: result.orphans.map(key) }, null, 2)}\n`);
  console.log(`[skin-orphan-scope-audit] baseline seeded with ${result.orphans.length} entr(ies)`);
  process.exit(0);
}

if (mode === 'check') {
  if (!existsSync(BASELINE_PATH)) {
    console.error('[skin-orphan-scope-audit] --check requires a reviewed baseline; run --seed');
    process.exit(2);
  }
  const baseline = new Set(JSON.parse(readFileSync(BASELINE_PATH, 'utf8')).orphans);
  const current = result.orphans.map(key);
  const added = current.filter((k) => !baseline.has(k));
  const cleared = [...baseline].filter((k) => !current.includes(k));
  for (const k of cleared) console.log(`  cleared (tighten with --seed): ${k}`);
  if (added.length) {
    console.error(`[skin-orphan-scope-audit] FAIL — ${added.length} new orphan scope class(es):`);
    for (const k of added) console.error(`    ${k}`);
    process.exit(1);
  }
  console.log('[skin-orphan-scope-audit] OK — no new orphan scope classes.');
  process.exit(0);
}
