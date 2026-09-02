#!/usr/bin/env node
/**
 * WO-CRA-23 task #28 — CLASS B: the fallback that fires and delivers another
 * cell's value. Sibling of `void-reads.mjs`, which censuses class A.
 *
 *   class A  reads the void      the declaration is severed · paint DISAPPEARS
 *   class B  reads the wrong one the declaration is severed · paint STAYS and LIES
 *
 * The structural precondition is identical to A — a custom property declared
 * ONLY inside root-keyed rules, read from a rule that survives severance — and
 * the two differ on exactly one bit: whether the read carries a fallback.
 * A's exclusion 2 ("a read with a fallback degrades, it does not read the
 * void") is this census's ENTRY condition. Every row A skips for that reason
 * lands here, so the two partition the population rather than overlapping.
 *
 * Degrading is not the same as being harmless, which is the whole point:
 *
 *   fallback -> a plain literal            a degradation; usually benign
 *   fallback -> ANOTHER CHANNEL            delivers a different cell's value:
 *                                          another size, another tone, the
 *                                          opposite mode. Nothing looks broken.
 *
 * So severity is not the read count. It is the comparison between the fallback
 * and the values the channel is actually declared with. A channel declared once,
 * with a fallback equal to it, is a no-op. A channel declared per size, with a
 * fallback naming one of those sizes, is wrong in every other size — and that is
 * `tag.css`, where the close button's cap falls to the md cell for all five.
 *
 * The var() tokenizer below is a deliberate copy of `void-reads.mjs`'s, not an
 * import: that module runs its census at module scope, so importing it would
 * execute the class-A pass as a side effect. Copy, not shared module — flagged
 * for extraction rather than left implicit.
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
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (entry.endsWith('.css')) out.push(full);
  }
  return out;
}

/** The part hook, in every quoting the tree uses. */
const ROOT_KEYED = /\[data-part\s*=\s*['"]?root['"]?\]/;

/**
 * var() reads, each with the raw text of its fallback. The comma must be at
 * depth zero, and the fallback is RECURSED into: `var(--a, var(--b, 1rem))` is
 * a read of --a with a fallback AND a read of --b with a fallback, and skipping
 * to the closing paren hides the inner one. That blind spot is what made the
 * class-A instrument miss the family it was written for, so the control plants
 * the nested shape rather than describing it.
 */
function readsIn(value) {
  const found = [];
  for (let i = 0; i < value.length; i += 1) {
    if (!value.startsWith('var(', i)) continue;
    let depth = 0;
    let comma = -1;
    let j = i + 3;
    for (; j < value.length; j += 1) {
      const ch = value[j];
      if (ch === '(') depth += 1;
      else if (ch === ')') {
        depth -= 1;
        if (depth === 0) break;
      } else if (ch === ',' && depth === 1 && comma === -1) comma = j;
    }
    const name = (comma === -1 ? value.slice(i + 4, j) : value.slice(i + 4, comma)).trim();
    const fallback = comma === -1 ? null : value.slice(comma + 1, j).trim();
    if (name.startsWith('--')) found.push({ name, fallback });
    if (comma !== -1) found.push(...readsIn(fallback));
    i = j;
  }
  return found;
}

const norm = (s) => (s ?? '').replace(/\s+/g, ' ').trim();

/**
 * The first channel a value reads, or null for a bare literal.
 *
 * Severity is decided on this and NOT on the declaration text, because
 * `var(--ds-tag-md-height, var(--ds-tag-default-height))` and
 * `var(--ds-tag-md-height, 1.75rem)` differ as strings and resolve to the same
 * value wherever the primary channel is declared. Comparing text and reporting
 * identity of values is the error this programme has already paid for once;
 * comparing the primary channel is the coarsest comparison that does not
 * repeat it. It is still not a value comparison — see the limit printed with
 * every run.
 */
function primaryChannel(value) {
  const m = /var\(\s*(--[\w-]+)/.exec(value ?? '');
  return m ? m[1] : null;
}

/**
 * REACHABILITY. A class-B row fires only when the root-keyed declaration stops
 * matching, and every discriminator in this corpus (`data-size`, `data-variant`)
 * is stamped unconditionally — so the only trigger is a caller replacing the
 * root `data-part`. A family that hardcodes its root part cannot be severed and
 * its rows are unreachable however alarming the fallback reads.
 *
 * Verdicts below are render-proven where a render exists (Tag, Card) and AST-
 * proven otherwise, each against the file that actually stamps the scope class.
 * Three of these owners were originally mapped to directories that do not
 * exist, and the miss printed as "no root emission found" — which reads like a
 * fact about the code and was a fact about the map. Own the mapping explicitly.
 *
 * This map is keyed on the FILE NAME, which is the right key only when the
 * severable part is the file's own. Cross-family rows are adjudicated by the
 * read-liveness pass further down, and file-wide by `crossfamily-parts.mjs`.
 */
const SEVERABLE_ROOT = {
  tag: true,                // render-proven, 3 shipped call sites (task #26)
  'semantic-surface': true, // SemanticSurface/index.tsx:55 SPREAD_OVERRIDE · 0 callers
  'list-toolbar': false,    // engines/modern/index.tsx:828 HARDCODED
  'data-table': false,      // engines/modern/index.tsx:1206 HARDCODED
  'edit-header': false,     // structures/headers/edit/index.tsx:217,231 HARDCODED
  'widget-board': false,    // patterns/data/widget-board/engines/foundation:876 HARDCODED
  'card-compounds': false,  // render-proven: callerPartOnRoot false on all three engines
  'action-dock': false,     // structures/workspace/action-dock/index.tsx:270 HARDCODED
  alert: false,
  callout: false,
  form: false,
  mentions: false,
  'app-shell': false,
};

/** The attribute that distinguishes one root-keyed rule from its siblings. */
function discriminator(selector) {
  const attrs = [...selector.matchAll(/\[data-([a-z-]+)\s*=\s*['"]?([^'"\]]+)['"]?\]/g)]
    .filter((m) => m[1] !== 'part')
    .map((m) => `${m[1]}=${m[2]}`);
  return attrs.length ? attrs.join(' ') : '(undiscriminated)';
}

const files = walk(CSS_ROOT);

// ── pass 1: where every custom property is declared, and with what value ────
const inRoot = new Map(); // name -> [{ file, line, value, cell }]
const elsewhere = new Set();

for (const file of files) {
  let root;
  try {
    root = postcss.parse(readFileSync(file, 'utf8'), { from: file });
  } catch {
    console.error(`  PARSE FAILED ${relative(CORE, file)}`);
    continue;
  }
  root.walkDecls((decl) => {
    if (!decl.prop.startsWith('--')) return;
    const sel = decl.parent?.selector ?? '';
    if (ROOT_KEYED.test(sel)) {
      if (!inRoot.has(decl.prop)) inRoot.set(decl.prop, []);
      inRoot.get(decl.prop).push({
        file,
        line: decl.source?.start?.line ?? 0,
        value: norm(decl.value),
        cell: discriminator(sel),
      });
    } else {
      elsewhere.add(decl.prop);
    }
  });
}

// ── pass 2: reads WITH a fallback, from rules that survive severance ────────
const rows = [];

for (const file of files) {
  let root;
  try {
    root = postcss.parse(readFileSync(file, 'utf8'), { from: file });
  } catch {
    continue;
  }
  root.walkDecls((decl) => {
    const sel = decl.parent?.selector ?? '';
    if (ROOT_KEYED.test(sel)) return; // the read dies with the declaration
    for (const read of readsIn(decl.value)) {
      if (read.fallback === null) continue; // class A's territory
      if (!inRoot.has(read.name)) continue;
      if (elsewhere.has(read.name)) continue; // a surviving declaration keeps it live

      const decls = inRoot.get(read.name);
      const values = [...new Set(decls.map((d) => d.value))];
      const fb = norm(read.fallback);
      const fbChannel = primaryChannel(fb);
      // Equivalent when the fallback and the declaration reach for the same
      // channel, even if their own fallback arms are written differently.
      const same = (d) =>
        d.value === fb || (fbChannel !== null && primaryChannel(d.value) === fbChannel);
      const matching = decls.filter(same);
      const differing = decls.filter((d) => !same(d));

      // A fallback naming another channel delivers that channel's value; a bare
      // literal is a degradation. The distinction is the severity, not the count.
      const fallbackIsChannel = /var\(\s*--/.test(fb);

      const family = file.split('/').pop().replace('.css', '');
      rows.push({
        family,
        reachable: SEVERABLE_ROOT[family] ?? null,
        file: relative(CORE, file),
        line: decl.source?.start?.line ?? 0,
        tree: file.includes('/runtime/engines/') ? 'engine' : 'component',
        readingProp: decl.prop,
        readingSelector: norm(sel).slice(0, 120),
        channel: read.name,
        fallback: fb,
        fallbackIsChannel,
        declaredCells: decls.map((d) => `${d.cell} -> ${d.value}`),
        distinctValues: values.length,
        cellsMatchingFallback: matching.length,
        cellsDifferingFromFallback: differing.length,
        severity:
          differing.length === 0 ? 'no-op'
            : fallbackIsChannel ? 'wrong-cell'
              : 'wrong-literal',
      });
    }
  });
}

const bySeverity = (s) => rows.filter((r) => r.severity === s);

if (CONTROL) {
  const fired = new Map();
  for (const r of rows) fired.set(r.channel, r);
  const checks = [
    ['--_ctl-tag-h', 'wrong-cell', 'the tag shape via a NESTED fallback: wrong in every size cell but the one the fallback names'],
    ['--ctl-same-pad', 'no-op', 'one declared cell, fallback equal to it'],
    ['--ctl-diff-bg', 'wrong-cell', 'one declared cell, fallback naming a different channel'],
  ];
  const silent = ['--ctl-toolbar-radius', '--ctl-a-gap', '--ctl-shared', '--ctl-inroot-x'];
  let pass = 0;
  let fail = 0;
  for (const [name, severity, what] of checks) {
    const got = fired.get(name);
    const ok = got && got.severity === severity;
    ok ? pass++ : fail++;
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${name} -> ${severity}: ${what}`);
    if (got && name === '--_ctl-tag-h') {
      console.log(`       cells differing from the fallback: ${got.cellsDifferingFromFallback} of ${got.declaredCells.length}`);
    }
    if (!ok && got) console.log(`       got severity ${got.severity}`);
  }
  for (const name of silent) {
    const ok = !fired.has(name);
    ok ? pass++ : fail++;
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${name} stays silent`);
  }
  console.log(`\nclass-B control: ${pass} pass / ${fail} fail`);
  process.exit(fail === 0 ? 0 : 1);
}

/**
 * IS THE READ ITSELF LIVE? — the cross-family question the gate above skips.
 *
 * The reachability gate asks whether the DECLARATION can be severed. It
 * silently assumes the reading rule matches something, and for a cross-family
 * row that assumption IS the question. When a family's skin keys on a COMPOSED
 * PRIMITIVE's part (`.rottay-button[data-part='trigger']`) while the family's
 * own TSX renders that button with a renamed part, the rule never matches, the
 * channel is never read, and `reachable:false` is a confident answer to a
 * question nobody asked.
 *
 * Measured on `list-toolbar`: 29 selectors demand `.rottay-button[data-part='trigger']`
 * and all 8 of its Buttons rename the part. Every one is dead. A row whose read
 * is dead is MOOT, and the dead rule is the real finding.
 */
const callSites = JSON.parse(
  readFileSync(new URL('./callsites.json', import.meta.url).pathname, 'utf8')).sites;
for (const r of rows) {
  const demands = [...r.readingSelector.matchAll(/\.rottay-([a-z0-9-]+)[^\s,]*\[data-part='([^']+)'\]/g)]
    .map((m) => ({ primitive: m[1].replace(/--.*$/, ''), part: m[2] }));
  if (!demands.length) { r.readLive = null; continue; }
  r.crossFamilyDemands = demands.map((d) => `${d.primitive}:${d.part}`);
  const stamped = callSites.filter((s) => s.file.includes(`/${r.family}/`) && s.foreign === false);
  r.readLive = demands.every((d) => {
    const stem = d.primitive.replace(/^rottay-/, '').split('-')[0];
    const here = stamped.filter((s) => s.tag.toLowerCase().includes(stem));
    if (!here.length) return true;                    // nobody renames it here
    return here.some((s) => s.value === d.part);      // at least one keeps the demanded part
  });
}
const moot = rows.filter((r) => r.readLive === false);
const crossFamily = rows.filter((r) => r.readLive !== null);

writeFileSync(
  new URL('./FALLBACK-READS.json', import.meta.url).pathname,
  JSON.stringify({ filesParsed: files.length, rows }, null, 1)
);

console.log(`cross-family rows (read keys on a composed primitive's part)  ${crossFamily.length}`);
console.log(`  of those, the READING RULE IS DEAD — row is moot            ${moot.length}`);
for (const m of moot) console.log(`    ${m.family}:${m.line} ${m.channel} — needs ${m.crossFamilyDemands.join(' ')}`);

console.log(`files parsed                                  ${files.length}`);
console.log(`props declared ONLY in root-keyed rules        ${[...inRoot.keys()].filter((n) => !elsewhere.has(n)).length}`);
console.log(`class-B reads (fallback fires on severance)    ${rows.length}`);
console.log(`  wrong-cell    delivers another channel       ${bySeverity('wrong-cell').length}`);
console.log(`  wrong-literal degrades to a bare value       ${bySeverity('wrong-literal').length}`);
console.log(`  no-op         fallback equals the declaration ${bySeverity('no-op').length}`);

const live = rows.filter((r) => r.reachable === true && r.severity !== 'no-op');
const latent = rows.filter((r) => r.reachable === false);
const unmapped = rows.filter((r) => r.reachable === null);
console.log(`\nREACHABLE TODAY (root part is severable)      ${live.length}`);
for (const r of live) {
  console.log(`  ${r.family}:${r.line} ${r.channel} -> ${r.fallback.slice(0, 46)}`);
  console.log(`     ${r.cellsDifferingFromFallback} of ${r.declaredCells.length} declared cells differ`);
}
console.log(`LATENT (root part hardcoded; fires only if made severable)  ${latent.length}`);
if (unmapped.length) {
  console.log(`UNMAPPED owner — treat as unknown, never as safe            ${unmapped.length}`);
  for (const r of [...new Set(unmapped.map((r) => r.family))]) console.log(`  ${r}`);
}
console.log(
  '\nLIMIT: severity compares the fallback\'s PRIMARY CHANNEL against each\n' +
  'declaration\'s, never resolved values. Two channels that resolve equal read\n' +
  'here as differing cells. It is a floor on similarity, not a value proof.\n'
);

const fams = new Map();
for (const r of rows) {
  const k = `${r.family} (${r.tree})`;
  if (!fams.has(k)) fams.set(k, []);
  fams.get(k).push(r);
}
console.log('FAMILY                     reads  wrong-cell  worst channel');
for (const [k, list] of [...fams].sort((a, b) => b[1].filter((r) => r.severity !== 'no-op').length - a[1].filter((r) => r.severity !== 'no-op').length)) {
  const bad = list.filter((r) => r.severity !== 'no-op');
  const worst = bad.sort((a, b) => b.cellsDifferingFromFallback - a.cellsDifferingFromFallback)[0];
  console.log(
    `${k.padEnd(26)} ${String(list.length).padStart(5)}  ${String(bad.length).padStart(10)}  ` +
    (worst ? `${worst.channel} -> ${worst.fallback.slice(0, 40)} (${worst.cellsDifferingFromFallback}/${worst.declaredCells.length} cells wrong)` : '-')
  );
}
