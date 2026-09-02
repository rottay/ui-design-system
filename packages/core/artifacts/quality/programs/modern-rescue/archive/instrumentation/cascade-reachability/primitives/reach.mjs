#!/usr/bin/env node
/**
 * WO-CRA-23 task #36 — REACH, not naming.
 *
 * The authorship table counts which families a vertical NAMES. A vertical
 * diverges with zero own-prefix channels wherever a DS value is a formula over
 * inputs it does author, so naming and reaching are different questions and the
 * second is the programme's.
 *
 * For every family skin declaration, each var() chain is walked through the
 * resolution order of one cell (vertical x theme) until it terminates in:
 *
 *   VERTICAL   a channel this vertical declares — the vertical REACHES the family
 *   DS-LITERAL a literal supplied by the DS — identical in all three verticals
 *   FALLBACK   the name is undeclared in scope, so the inline fallback arm fires
 *   UNDECLARED undeclared with no fallback — the declaration drops entirely
 *
 * THE FALLBACK-INERT LAW IS THE WALK'S CORE. `var(--a, X)` never reaches X when
 * `--a` is declared IN SCOPE, and does reach it when it is not. Termination is a
 * property of the cell, not of the text, which is why this cannot be answered by
 * a name census and can be answered statically.
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, relative } from 'node:path';

const CONTROL = process.argv.includes('--control');
const CORE = new URL('../../../../../', import.meta.url).pathname.replace(/\/$/, '');
const require = createRequire(join(CORE, 'package.json'));
const postcss = require('postcss');
const CSS = join(CORE, 'src/foundation/tokens/css');

const VERTICALS = ['bithire', 'evnto', 'rottay'];
const THEMES = ['light', 'dark'];

/**
 * Which themes a block applies to, read from the BLOCK OPENER.
 *
 * `:not([data-theme="dark"])` CONTAINS the substring `[data-theme="dark"]`, so
 * the negations must be tested FIRST or every light block bins as dark. And
 * rottay is DARK-FIRST — its default block is `:not([data-theme='light'])` —
 * so a classifier whose else-branch assumes light mis-bins 646 of its
 * declarations. Bin by what the opener says; never by "not obviously dark".
 */
function themesOf(selector) {
  const s = selector.replace(/\s+/g, ' ');
  if (/:not\(\s*\[data-theme=['"]?dark['"]?\]\s*\)/.test(s)) return ['light'];
  if (/:not\(\s*\[data-theme=['"]?light['"]?\]\s*\)/.test(s)) return ['dark'];
  if (/\[data-theme=['"]?dark['"]?\]/.test(s)) return ['dark'];
  if (/\[data-theme=['"]?light['"]?\]/.test(s)) return ['light'];
  if (/(^|[^-\w])\.dark([^-\w]|$)/.test(s) || /html\.dark/.test(s)) return ['dark'];
  return THEMES;
}

const tenantOf = (sel) => VERTICALS.find((v) =>
  new RegExp(`data-tenant=['"]${v}['"]`).test(sel) ||
  new RegExp(`data-vertical=['"]${v === 'rottay' ? 'platform' : v}['"]`).test(sel)) ?? null;

function walkFiles(dir, out = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walkFiles(p, out);
    else if (e.endsWith('.css')) out.push(p);
  }
  return out;
}

// ── build one declaration map per cell ─────────────────────────────────────
// Precedence, later wins: DS base -> DS theme -> vertical base -> vertical theme.
// Tenant paint is unlayered and outranks every DS layer, so it is applied last.
const cell = {};
for (const v of VERTICALS) for (const t of THEMES) cell[`${v}/${t}`] = { ds: new Map(), vertical: new Map() };

const files = CONTROL
  ? walkFiles(new URL('./control/reach/', import.meta.url).pathname.replace(/\/$/, ''))
  : walkFiles(CSS);

for (const f of files) {
  let root;
  try { root = postcss.parse(readFileSync(f, 'utf8'), { from: f }); } catch { continue; }
  root.walkRules((rule) => {
    const decls = rule.nodes.filter((n) => n.type === 'decl' && n.prop.startsWith('--'));
    if (!decls.length) return;
    const owner = tenantOf(rule.selector);
    const themes = themesOf(rule.selector);
    for (const t of themes) {
      for (const v of VERTICALS) {
        if (owner && owner !== v) continue;
        const bucket = owner ? cell[`${v}/${t}`].vertical : cell[`${v}/${t}`].ds;
        for (const d of decls) bucket.set(d.prop, d.value.replace(/\s+/g, ' ').trim());
      }
    }
  });
}

/** The first var() in a value, with its fallback arm. */
function firstVar(value) {
  const i = value.indexOf('var(');
  if (i === -1) return null;
  let depth = 0, comma = -1, j = i + 3;
  for (; j < value.length; j += 1) {
    const ch = value[j];
    if (ch === '(') depth += 1;
    else if (ch === ')') { depth -= 1; if (depth === 0) break; }
    else if (ch === ',' && depth === 1 && comma === -1) comma = j;
  }
  return {
    name: (comma === -1 ? value.slice(i + 4, j) : value.slice(i + 4, comma)).trim(),
    fallback: comma === -1 ? null : value.slice(comma + 1, j).trim(),
  };
}

/** Walk one value in one cell until it terminates. */
function resolve(value, key, depth = 0, seen = new Set()) {
  if (depth > 24) return { terminal: 'CYCLE', hops: depth };
  const v = firstVar(value);
  if (!v) return { terminal: 'DS-LITERAL', hops: depth, literal: value.slice(0, 60) };
  if (seen.has(v.name)) return { terminal: 'CYCLE', hops: depth };
  seen.add(v.name);

  const { ds, vertical } = cell[key];
  // The vertical's own declaration wins: tenant paint is unlayered.
  if (vertical.has(v.name)) return { terminal: 'VERTICAL', hops: depth + 1, via: v.name };
  if (ds.has(v.name)) return resolve(ds.get(v.name), key, depth + 1, seen);
  // Undeclared in scope -> the fallback arm fires. This is the whole law.
  if (v.fallback !== null) {
    const r = resolve(v.fallback, key, depth + 1, seen);
    return r.terminal === 'DS-LITERAL' ? { ...r, terminal: 'FALLBACK', via: v.name } : r;
  }
  return { terminal: 'UNDECLARED', hops: depth + 1, via: v.name };
}

// ── the corpus: family skin declarations that paint ────────────────────────
const SKIN = CONTROL ? files : files.filter((f) => /\/skin\//.test(f));
const rows = [];
for (const f of SKIN) {
  let root;
  try { root = postcss.parse(readFileSync(f, 'utf8'), { from: f }); } catch { continue; }
  const family = f.split('/').pop().replace('.css', '');
  root.walkDecls((d) => {
    if (d.prop.startsWith('--')) return;          // a channel definition, not paint
    if (!d.value.includes('var(')) return;
    for (const v of VERTICALS) for (const t of THEMES) {
      const r = resolve(d.value.replace(/\s+/g, ' ').trim(), `${v}/${t}`);
      rows.push({ family, prop: d.prop, vertical: v, theme: t, terminal: r.terminal, via: r.via ?? null });
    }
  });
}

if (CONTROL) {
  const byName = (n) => rows.filter((r) => r.prop === n);
  const checks = [
    ['color', 'VERTICAL', 'bithire', 'light', 'a chain the vertical terminates'],
    ['background', 'DS-LITERAL', 'bithire', 'light', 'a chain ending in a DS literal'],
    ['border-color', 'FALLBACK', 'bithire', 'light', 'an undeclared name, so the inline fallback fires'],
    ['outline-color', 'VERTICAL', 'rottay', 'dark', 'rottay DARK-FIRST: its default block is dark, not light'],
    ['outline-color', 'DS-LITERAL', 'rottay', 'light', 'and its light block is the explicit one'],
  ];
  let pass = 0, fail = 0;
  for (const [prop, want, v, t, what] of checks) {
    const got = byName(prop).find((r) => r.vertical === v && r.theme === t);
    const ok = got && got.terminal === want;
    ok ? pass++ : fail++;
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${v}/${t} ${prop} -> ${want}: ${what}`);
    if (!ok && got) console.log(`       got ${got.terminal} via ${got.via}`);
  }
  console.log(`\nreach control: ${pass} pass / ${fail} fail`);
  process.exit(fail === 0 ? 0 : 1);
}

writeFileSync(new URL('./REACH.json', import.meta.url).pathname, JSON.stringify({ rows }, null, 1));

const fams = [...new Set(rows.map((r) => r.family))];
console.log(`skin files ${SKIN.length} · families ${fams.length} · painted var() declarations ${rows.length / 6}`);
console.log(`cells = 3 verticals x 2 themes, binned by the block opener\n`);
console.log('CELL            VERTICAL   DS-LITERAL   FALLBACK   UNDECLARED');
for (const v of VERTICALS) for (const t of THEMES) {
  const c = rows.filter((r) => r.vertical === v && r.theme === t);
  const n = (k) => String(c.filter((r) => r.terminal === k).length).padStart(8);
  console.log(`${(v + '/' + t).padEnd(15)} ${n('VERTICAL')}   ${n('DS-LITERAL')}   ${n('FALLBACK')}   ${n('UNDECLARED')}`);
}

// Reach per family: does ANY declaration terminate in a vertical channel?
console.log('\nFAMILIES REACHED (>=1 declaration terminating in a vertical channel)');
for (const v of VERTICALS) for (const t of THEMES) {
  const reached = fams.filter((f) => rows.some((r) => r.family === f && r.vertical === v && r.theme === t && r.terminal === 'VERTICAL'));
  console.log(`  ${(v + '/' + t).padEnd(15)} ${String(reached.length).padStart(3)} / ${fams.length}`);
}
