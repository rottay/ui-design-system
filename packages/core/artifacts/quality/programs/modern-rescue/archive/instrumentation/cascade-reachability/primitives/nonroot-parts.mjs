#!/usr/bin/env node
/**
 * WO-CRA-23 task #30 — the orphan-channel census on anchors that are NOT `root`.
 *
 * `void-reads.mjs` (class A) and `fallback-reads.mjs` (class B) both test
 * `[data-part='root']` as a literal. A primitive whose rendered root stamps a
 * different default part — `field`, `trigger`, `anchor` — is invisible to both:
 * its declarations sit in rules neither census inspects, so it returns a clean
 * zero for a family it never looked at. Eighth instance of a false absence in
 * this programme, and the first where the matcher worked and the HOOK was wrong.
 *
 * The anchor set is taken from `render-census.json`, i.e. from the DOM each
 * engine actually produces, never from reading the TSX. `Input` routes a
 * caller's `data-part` and `className` to different elements, so nothing short
 * of rendering states which element is the anchor.
 *
 * Both terms are reported, as class B did:
 *   PRESENT    the structural shape exists
 *   REACHABLE  a caller can actually replace that anchor (render-proven)
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, relative } from 'node:path';

const CONTROL = process.argv.includes('--control');
const CORE = new URL('../../../../../', import.meta.url).pathname.replace(/\/$/, '');
const require = createRequire(join(CORE, 'package.json'));
const postcss = require('postcss');

const CSS_ROOT = CONTROL
  ? new URL('./control/', import.meta.url).pathname.replace(/\/$/, '')
  : join(CORE, 'src/foundation/tokens/css');

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (e.endsWith('.css')) out.push(p);
  }
  return out;
}

const keyedOn = (sel, part) =>
  new RegExp(`\\[data-part\\s*=\\s*['"]?${part}['"]?\\]`).test(sel);

/** var() reads with their fallback text; recurses into fallbacks. */
function readsIn(value) {
  const found = [];
  for (let i = 0; i < value.length; i += 1) {
    if (!value.startsWith('var(', i)) continue;
    let depth = 0, comma = -1, j = i + 3;
    for (; j < value.length; j += 1) {
      const ch = value[j];
      if (ch === '(') depth += 1;
      else if (ch === ')') { depth -= 1; if (depth === 0) break; }
      else if (ch === ',' && depth === 1 && comma === -1) comma = j;
    }
    const name = (comma === -1 ? value.slice(i + 4, j) : value.slice(i + 4, comma)).trim();
    const fallback = comma === -1 ? null : value.slice(comma + 1, j).trim();
    if (name.startsWith('--')) found.push({ name, fallback });
    if (comma !== -1) found.push(...readsIn(fallback));
    i = j;
  }
  return found;
}

// ── the anchor set, from the DOM ───────────────────────────────────────────
let ANCHORS; // part -> [{ primitive, engine, callerCanReplace }]
if (CONTROL) {
  ANCHORS = new Map([
    ['field', [{ primitive: 'ctl/Input', engine: 'modern', callerCanReplace: true }]],
    ['trigger', [{ primitive: 'ctl/Button', engine: 'modern', callerCanReplace: true }]],
  ]);
} else {
  const rendered = JSON.parse(readFileSync(new URL('./render-census.json', import.meta.url).pathname, 'utf8'));
  ANCHORS = new Map();
  for (const r of rendered) {
    if (!r.ok || !r.rootPart || r.rootPart === 'root') continue;
    if (!ANCHORS.has(r.rootPart)) ANCHORS.set(r.rootPart, []);
    ANCHORS.get(r.rootPart).push({
      primitive: r.primitive, engine: r.engine, callerCanReplace: r.callerPartOnRoot === true,
      classes: (r.rootClasses ?? []).filter((c) => !c.includes('--')),
    });
  }
}

const files = walk(CSS_ROOT);
const parsed = new Map();
for (const f of files) {
  try { parsed.set(f, postcss.parse(readFileSync(f, 'utf8'), { from: f })); }
  catch { console.error(`  PARSE FAILED ${relative(CORE, f)}`); }
}

const rows = [];
const unscoped = [];
for (const [part, owners] of ANCHORS) {
  /**
   * A part NAME is not an identifier. `edit-fields` writes
   * `.ds-structure.ds-edit-fields[data-part='group']` for its own anatomy, which
   * has nothing to do with `InputNumber` stamping `group` on its root. Scoping
   * the search by the owner's rendered scope class is what separates them; a
   * first run without it charged 16 edit-fields rows to three primitives.
   */
  const scopes = [...new Set(owners.flatMap((o) => o.classes ?? []))];
  if (CONTROL) scopes.push('ctl-input', 'ctl-btn');

  /**
   * Second scoping mechanism, for the portal families. Their rendered root is a
   * trigger wrapper carrying NO class, so class scoping drops them entirely —
   * and dropping them printed a clean 0 with 28 impls silently unmeasured. A
   * rule in the family's OWN skin file keyed on that family's anchor is that
   * family's, so the file is the scope where the class cannot be.
   */
  const familyFiles = new Set(owners.map((o) =>
    o.primitive.split('/')[1].replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()));
  const ownersWithoutClass = owners.filter((o) => !(o.classes ?? []).length);
  if (ownersWithoutClass.length && !scopes.length) {
    unscoped.push({ part, owners: ownersWithoutClass.map((o) => `${o.primitive}/${o.engine}`), via: 'file' });
  }
  const inScope = (sel, file) =>
    scopes.some((c) => sel.includes(`.${c}`)) ||
    familyFiles.has(file.split('/').pop().replace('.css', ''));

  // pass 1: declarations, split by whether they sit in a rule keyed on THIS part
  const inPart = new Map();
  const elsewhere = new Set();
  for (const [df, root] of parsed) {
    root.walkDecls((decl) => {
      if (!decl.prop.startsWith('--')) return;
      const sel = decl.parent?.selector ?? '';
      if (keyedOn(sel, part) && inScope(sel, df)) {
        if (!inPart.has(decl.prop)) inPart.set(decl.prop, []);
        inPart.get(decl.prop).push({ value: decl.value.replace(/\s+/g, ' ').trim() });
      } else {
        elsewhere.add(decl.prop);
      }
    });
  }
  // pass 2: reads from rules that survive the anchor being replaced
  for (const [file, root] of parsed) {
    root.walkDecls((decl) => {
      const sel = decl.parent?.selector ?? '';
      if (keyedOn(sel, part) && inScope(sel, file)) return; // dies with the declaration
      for (const read of readsIn(decl.value)) {
        if (!inPart.has(read.name)) continue;
        if (elsewhere.has(read.name)) continue;
        const famName = file.split('/').pop().replace('.css', '');
        const fileOwners = owners.filter((o) =>
          o.primitive.split('/')[1].replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase() === famName);
        rows.push({
          anchor: part,
          family: famName,
          file: relative(CORE, file),
          line: decl.source?.start?.line ?? 0,
          readingProp: decl.prop,
          channel: read.name,
          klass: read.fallback === null ? 'A' : 'B',
          fallback: read.fallback,
          /**
           * Attributed to the owner whose FILE this row is in, never to the
           * anchor's owner set. `trigger` is the default part of ten primitives,
           * and pooling them let Button — the one that IS caller-replaceable —
           * lend its severability to Popover and HoverCard, which are not.
           * Reachability is a property of one component, not of a part name.
           */
          owners: fileOwners.length
            ? fileOwners.map((o) => `${o.primitive}/${o.engine}${o.callerCanReplace ? '*' : ''}`)
            : ['(no owner renders this file\'s family)'],
          reachable: fileOwners.length ? fileOwners.some((o) => o.callerCanReplace) : null,
        });
      }
    });
  }
}

if (CONTROL) {
  const fired = rows.map((r) => `${r.channel}:${r.klass}`).sort();
  const want = ['--ctl-btn-gap:A', '--ctl-input-h:B', '--ctl-input-pad:A'];
  const silent = ['--ctl-card-pad', '--ctl-same-x', '--ctl-shared-y'];
  const okFired = JSON.stringify(fired) === JSON.stringify(want);
  const okSilent = silent.every((n) => !rows.some((r) => r.channel === n));
  console.log(`${okFired ? 'ok  ' : 'FAIL'} fires on a non-root anchor: class A on field, class B on field, class A on trigger`);
  if (!okFired) console.log(`       got ${JSON.stringify(fired)}`);
  console.log(`${okSilent ? 'ok  ' : 'FAIL'} stays silent on: a root anchor (owned by the other halves), a same-rule pair, a channel declared at :root`);
  console.log(`\nnon-root anchor control: ${[okFired, okSilent].filter(Boolean).length} pass / ${[okFired, okSilent].filter((x) => !x).length} fail`);
  process.exit(okFired && okSilent ? 0 : 1);
}

writeFileSync(new URL('./NONROOT-PARTS.json', import.meta.url).pathname,
  JSON.stringify({ anchors: [...ANCHORS.keys()], rows }, null, 1));

const reach = rows.filter((r) => r.reachable === true);
console.log(`css files parsed                 ${files.length}`);
console.log(`non-root anchors (rendered)      ${ANCHORS.size}  [${[...ANCHORS.keys()].join(' ')}]`);
console.log(`engine impls behind them         ${[...ANCHORS.values()].reduce((n, v) => n + v.length, 0)}`);
console.log(`\nPRESENT    orphan rows on a non-root anchor   ${rows.length}   (A ${rows.filter((r) => r.klass === 'A').length} · B ${rows.filter((r) => r.klass === 'B').length})`);
console.log(`REACHABLE  anchor is caller-replaceable        ${reach.length}`);
if (unscoped.length) {
  console.log(`\nUNSCOPED — the rendered root carries no class, so its anchor cannot be`);
  console.log(`bound to a selector. NOT measured, and not therefore safe:`);
  for (const u of unscoped) console.log(`  [data-part='${u.part}']  ${u.owners.join(' ')}`);
}
console.log('');

if (rows.length) {
  const by = new Map();
  for (const r of rows) {
    const k = `${r.anchor} · ${r.family}`;
    if (!by.has(k)) by.set(k, []);
    by.get(k).push(r);
  }
  console.log('ANCHOR · FAMILY                 rows  A/B   reachable  channels');
  for (const [k, list] of [...by].sort((a, b) => b[1].length - a[1].length)) {
    const a = list.filter((r) => r.klass === 'A').length;
    console.log(`${k.padEnd(31)} ${String(list.length).padStart(4)}  ${a}/${list.length - a}   ` +
      `${(list.some((r) => r.reachable) ? 'YES' : 'no').padEnd(9)}  ${[...new Set(list.map((r) => r.channel))].slice(0, 3).join(' ')}`);
  }
}
