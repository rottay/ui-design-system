#!/usr/bin/env node
/**
 * WO-CRA-23 primitives census — final join.
 *
 * Left side: the RENDERED root of every engine implementation (classes, default
 * part, and whether a caller's part displaces it). Rendering is the authority —
 * a recipe helper builds the class list, so no static read of the TSX can state
 * the scope class, and `Input` routes `data-part` and `className` to different
 * elements.
 * Right side: every CSS rule, selector-split and compound-parsed.
 * A rule is at risk when its SUBJECT compound demands both a class the rendered
 * root carries and `[data-part='<default>']`.
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { execFileSync } from 'node:child_process';
import { parseCssFile } from './selectors.mjs';

const SNAP = new URL('../../../../../', import.meta.url).pathname.replace(/\/$/, '');
const PIN = execFileSync('git', ['-C', SNAP, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const rendered = JSON.parse(readFileSync(new URL('./render-census.json', import.meta.url).pathname, 'utf8'));

function walk(dir, pred, out = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, pred, out); else if (pred(p)) out.push(p);
  }
  return out;
}
const cssFiles = walk(join(SNAP, 'src'), (f) => f.endsWith('.css'));
const allRules = [];
for (const f of cssFiles) allRules.push(...parseCssFile(f));
const rel = (f) => relative(SNAP, f).replace('src/foundation/tokens/css/', '');

const strip = (c) => c.replace(/^\w+\(|\)$/g, '');

const findings = [];
for (const row of rendered) {
  if (!row.ok || !row.callerPartOnRoot) continue;
  const part = row.rootPart;
  if (!part) continue;
  const classes = new Set(row.rootClasses ?? []);
  if (!classes.size) continue;

  const hits = [];
  for (const r of allRules) {
    for (const c of r.compounds) {
      const keyed = c.attrs.some((a) => a.name === 'data-part' && a.op === '=' && a.value === part);
      if (!keyed) continue;
      const own = c.classes.map(strip);
      // Every class in this compound must be one the rendered root carries,
      // and at least one must be present — otherwise the compound is some other
      // element that merely shares the part name.
      if (own.length && own.every((x) => classes.has(x))) { hits.push({ r, c }); break; }
    }
  }
  if (!hits.length) continue;

  const byFile = {};
  for (const h of hits) {
    const k = rel(h.r.file);
    byFile[k] = byFile[k] || { rules: 0, decls: 0, props: new Set() };
    byFile[k].rules++; byFile[k].decls += h.r.declCount;
    h.r.props.forEach((p) => byFile[k].props.add(p));
  }
  findings.push({
    primitive: row.primitive, engine: row.engine, part,
    rootTag: row.rootTag, rootClasses: [...classes],
    rules: hits.length,
    decls: hits.reduce((a, h) => a + h.r.declCount, 0),
    props: [...new Set(hits.flatMap((h) => h.r.props))].sort(),
    byFile: Object.fromEntries(Object.entries(byFile).map(([k, v]) => [k, { rules: v.rules, decls: v.decls }])),
  });
}
findings.sort((a, b) => b.rules - a.rules || b.decls - a.decls);

// One rendered element reached through several export aliases (`default`,
// `List`, `ModernDescriptions`) is ONE finding. Leaving the raw rows in place
// reported 27 where there are 21, and inflating a backlog by alias is the same
// error as splitting one population across two spellings — just inverted.
const seen = new Map();
for (const f of findings) {
  const k = `${f.primitive}|${f.engine}|${f.part}`;
  if (!seen.has(k)) seen.set(k, f);
}
const deduped = [...seen.values()];
if (deduped.length !== findings.length) {
  console.log(`alias dedupe: ${findings.length} raw rows -> ${deduped.length} distinct primitive/engine/part\n`);
}
findings.length = 0;
findings.push(...deduped);

writeFileSync(new URL('./FINDINGS.json', import.meta.url).pathname,
  JSON.stringify({ pin: PIN, findings }, null, 1));

console.log(`pin ${PIN}`);
console.log(`rendered rows ${rendered.length} (ok ${rendered.filter((r) => r.ok).length}, unrendered ${rendered.filter((r) => !r.ok).length})`);
console.log(`caller part lands on root: ${rendered.filter((r) => r.ok && r.callerPartOnRoot).length} engine impls`);
console.log(`of those, with skin keyed on the default part: ${findings.length}\n`);
console.log('PRIMITIVE                  engine   part      rules decls  properties at risk');
for (const f of findings) {
  const visible = f.props.filter((p) => !/^--/.test(p));
  console.log(`${f.primitive.padEnd(26)} ${f.engine.padEnd(8)} ${f.part.padEnd(9)} ${String(f.rules).padStart(4)} ${String(f.decls).padStart(5)}  ${visible.slice(0, 8).join(' ')}${visible.length > 8 ? ` +${visible.length - 8}` : ''}`);
}
console.log('\n--- unrendered (instrument blind spot) ---');
const bad = rendered.filter((r) => !r.ok);
const grouped = {};
for (const b of bad) {
  const key = (b.error || '').split('\n')[0].slice(0, 70);
  (grouped[key] = grouped[key] || []).push(`${b.primitive}/${b.engine}`);
}
for (const [k, v] of Object.entries(grouped).sort((a, b) => b[1].length - a[1].length)) {
  console.log(`${String(v.length).padStart(3)}  ${k}`);
  console.log(`     ${v.slice(0, 8).join(' ')}${v.length > 8 ? ` +${v.length - 8}` : ''}`);
}
