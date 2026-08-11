#!/usr/bin/env node
/**
 * WO-CRA-23 task #32 — CROSS-FAMILY PART PREDICATES, and the reachability
 * question the class-A/B censuses ask wrong.
 *
 * Both siblings decide reachability like this:
 *
 *     const family = file.split('/').pop().replace('.css', '');
 *     reachable: SEVERABLE_ROOT[family] ?? null;
 *
 * — keyed on the FILE NAME. That is right for a row whose predicate is the
 * file's own root part, and wrong for a row whose predicate belongs to a
 * COMPOSED PRIMITIVE. `list-toolbar.css` keys four rules on
 * `.rottay-button[data-part='trigger']`; the severable part there is Button's,
 * not list-toolbar's, so the lookup answered "list-toolbar hardcodes its root,
 * unreachable" to a question nobody asked. A gate that answers a different
 * question than the one posed returns confident wrong answers, and this one
 * returned at least three.
 *
 * THE RIGHT QUESTION HAS TWO HALVES, and this census asks both:
 *
 *   1. WHOSE part is it?  Attribute the `[data-part=…]` to the scope class in
 *      the SAME COMPOUND, not to the file. `.a .rottay-button[data-part='x']`
 *      predicates Button; `.a[data-part='x'] .rottay-button` predicates `.a`.
 *      Compound-level attribution is the whole fix, and it needs a real
 *      selector parser — hence `parseCssFile`, never a regex over the string.
 *
 *   2. Is it actually severed?  Severable is a capability; severed is a fact.
 *      Join the predicate against the call sites the owning family renders, so
 *      the verdict is DEAD / LIVE / MIXED rather than "could be".
 *
 * A rule keyed on a primitive's DEFAULT part, in a file whose own component
 * renames that part, has never matched. Not "fires on severance" — dead from
 * the first commit, in the same repository, against itself.
 *
 * SCOPE, stated because a census without one is a rumour: three skin trees
 * (`presentation/components/skin`, `runtime/engines/{modern,rustic}/skin`),
 * scope classes taken from the RENDER census — a class no engine emits cannot
 * appear here — and call sites from `callsites.json`, which reads `className=`
 * and JSX attribute literals only. Interpolated parts are invisible to it, so
 * every count here is a FLOOR.
 *
 * Usage:
 *   node crossfamily-parts.mjs              # report
 *   node crossfamily-parts.mjs --self-test  # 6 planted shapes
 *
 * THE FLAG IS `--self-test` AND NOT `--control` ON PURPOSE. `selectors.mjs`
 * runs its own control at MODULE SCOPE gated on `process.argv[2] === '--control'`,
 * so importing it while that flag is set executes the imported module's control
 * and exits — this file's own checks never run, and the 9/9 that prints belongs
 * to the other module. Same shape the class-B header flags for `void-reads.mjs`,
 * arriving through argv rather than through a census. A module-scope side effect
 * keyed on argv is contagious to every importer.
 */
import { readdirSync, readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { parseCssFile } from './selectors.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const CORE = new URL('../../../../../', import.meta.url).pathname.replace(/\/$/, '');
const CSS_ROOTS = [
  'src/foundation/tokens/css/presentation/components/skin',
  'src/foundation/tokens/css/runtime/engines/modern/skin',
  'src/foundation/tokens/css/runtime/engines/rustic/skin',
];

/**
 * scope class -> the rendered facts of the primitive that stamps it.
 *
 * BOTH SPELLINGS, and the base one is the load-bearing half. A composing family
 * writes `.rottay-button[data-part='trigger']` — the BASE class — because it is
 * targeting the primitive regardless of engine. Indexing only the
 * engine-suffixed `rottay-button--modern` returned a clean **0** on a corpus
 * that contains at least three known instances, and the planted control could
 * not catch it because the control planted the suffixed form too: it validated
 * compound attribution while sharing the implementation's assumption about
 * which class to look for. A control that mirrors the code instead of the
 * corpus is a control that cannot fail.
 *
 * The base class spans engines, so its row carries the union: `callerWins` is
 * true when ANY engine lets a caller replace the part, since that is the
 * condition under which the rule can stop matching.
 */
export function scopeClassIndex(render) {
  const byClass = new Map();
  const add = (c, r, merge) => {
    const prev = byClass.get(c);
    if (!prev) {
      byClass.set(c, {
        primitive: r.primitive,
        engine: merge ? 'any' : r.engine,
        rootPart: r.rootPart,
        callerWins: r.callerPartOnRoot === true,
      });
      return;
    }
    if (!merge || prev.primitive !== r.primitive) return;
    prev.callerWins = prev.callerWins || r.callerPartOnRoot === true;
  };
  for (const r of render) {
    if (!r.ok || !Array.isArray(r.rootClasses)) continue;
    for (const c of r.rootClasses) {
      if (/^rottay-[a-z0-9-]+--(modern|rustic|classic)$/.test(c)) add(c, r, false);
      else if (/^rottay-[a-z0-9-]+$/.test(c)) add(c, r, true);
    }
  }
  return byClass;
}

/**
 * Every cross-family part predicate in one file. Attribution is COMPOUND-level:
 * the predicate belongs to the scope class standing beside it, and a compound
 * with no known scope class is not this census's business.
 */
export function crossFamilyRows(file, byClass) {
  const cssFamily = file.split('/').pop().replace('.css', '');
  const rows = [];
  for (const rule of parseCssFile(file)) {
    for (const comp of rule.compounds) {
      const partAttr = comp.attrs.find((a) => a.name === 'data-part' && a.op === '=');
      if (!partAttr) continue;
      const scope = comp.classes.find((c) => byClass.has(c));
      if (!scope) continue;
      const owner = byClass.get(scope);
      const ownerFamily = owner.primitive.split('/').pop().toLowerCase();
      if (cssFamily === ownerFamily) continue;
      rows.push({
        cssFamily,
        file,
        line: rule.line,
        selector: rule.selector.replace(/\s+/g, ' '),
        declCount: rule.declCount,
        scope,
        primitive: owner.primitive,
        engine: owner.engine,
        rootPart: owner.rootPart,
        callerWins: owner.callerWins,
        predicate: partAttr.value,
        dependsOnDefault: partAttr.value === owner.rootPart,
      });
    }
  }
  return rows;
}

/** Severable is a capability; severed is a fact. This resolves the fact. */
export function verdictFor(row, sites) {
  const tag = row.primitive.split('/').pop();
  const spelling = new RegExp(`^(Modern|Rustic|Classic)?${tag}$`);
  const hits = sites.filter(
    (s) =>
      spelling.test(s.tag) &&
      s.file.includes(`/${row.cssFamily}/`) &&
      !/(^|\/)(tests?|__tests__)\//.test(s.file) &&
      !/\.(test|stories|spec)\./.test(s.file)
  );
  const renamed = hits.filter((s) => s.value !== row.rootPart);
  if (!hits.length) return { verdict: 'LIVE-no-callsite', hits: 0, renamed: [] };
  if (renamed.length === hits.length) return { verdict: 'DEAD', hits: hits.length, renamed };
  if (renamed.length) return { verdict: 'MIXED', hits: hits.length, renamed };
  return { verdict: 'LIVE', hits: hits.length, renamed };
}

// ── control ────────────────────────────────────────────────────────────────
if (process.argv.includes('--self-test')) {
  const dir = mkdtempSync(join(tmpdir(), 'xfam-'));
  const css = `
/* 1 cross-family, predicate on the primitive, depends on its default */
.ds-pattern-probe .rottay-button--modern[data-part='trigger'] { color: red; }
/* 2 cross-family, but the predicate qualifies the FAMILY compound, not the primitive */
.ds-pattern-probe[data-part='trigger'] .rottay-button--modern { color: red; }
/* 3 cross-family, predicate on the primitive but NOT its default part */
.ds-pattern-probe .rottay-button--modern[data-part='icon'] { color: red; }
/* 4 same-family: the file IS button, so not this census */
.rottay-button--modern[data-part='trigger'] { color: red; }
/* 5 the ~= operator is a different operator and must not be read as = */
.ds-pattern-probe .rottay-button--modern[data-part~='trigger'] { color: red; }
/* 6 an attribute value containing a space must not split the compound */
.ds-pattern-probe .rottay-button--modern[title='a b'][data-part='trigger'] { color: red; }
/* 7 THE SHAPE THE CORPUS ACTUALLY USES: the BASE class, no engine suffix.
      Indexing only the suffixed spelling returned a clean 0 on a corpus with
      three known instances. This case fails unless the index holds both. */
.ds-pattern-probe .ds-probe__action.rottay-button[data-part='trigger'] { color: red; }
`;
  writeFileSync(join(dir, 'probe.css'), css);
  writeFileSync(join(dir, 'button.css'), css);
  // The index is built by `scopeClassIndex` from render-shaped rows, never by
  // hand — a hand-built map is how the base-class spelling went missing.
  const byClass = scopeClassIndex([
    { ok: true, primitive: 'inputs/Button', engine: 'modern', rootPart: 'trigger',
      callerPartOnRoot: true, rootClasses: ['rottay-button', 'rottay-button--modern'] },
    { ok: true, primitive: 'inputs/Button', engine: 'rustic', rootPart: 'trigger',
      callerPartOnRoot: false, rootClasses: ['rottay-button', 'rottay-button--rustic'] },
  ]);
  const probe = crossFamilyRows(join(dir, 'probe.css'), byClass);
  const same = crossFamilyRows(join(dir, 'button.css'), byClass);
  const checks = [
    ['attributes a predicate standing beside the primitive class', probe.some((r) => r.line === 3 && r.dependsOnDefault)],
    ['does NOT attribute a predicate on the family compound', !probe.some((r) => r.line === 5)],
    ['keeps a non-default predicate but marks it dependsOnDefault=false', probe.some((r) => r.line === 7 && !r.dependsOnDefault)],
    ['excludes same-family rows entirely', same.length === 0],
    ['ignores ~= , which is not the = operator', !probe.some((r) => r.line === 11)],
    ['survives a space inside an attribute value', probe.some((r) => r.line === 13 && r.dependsOnDefault)],
    ['SEES THE BASE CLASS, not only the engine-suffixed one', probe.some((r) => r.line === 17 && r.dependsOnDefault)],
    ['unions callerWins across engines for the base class', byClass.get('rottay-button')?.callerWins === true],
  ];
  let pass = 0;
  for (const [name, ok] of checks) {
    console.log(`${ok ? 'ok  ' : 'FAIL'}   ${name}`);
    if (ok) pass++;
  }
  console.log(`\ncross-family control: ${pass} pass / ${checks.length - pass} fail`);
  process.exit(pass === checks.length ? 0 : 1);
}

// ── census ─────────────────────────────────────────────────────────────────
// GUARDED SO THIS MODULE IS SAFE TO IMPORT. The class-B header already records
// that `void-reads.mjs` cannot be imported because it censuses at module scope,
// and `selectors.mjs` fires its control on a bare argv check for the same
// reason. Both were copied around rather than fixed. This one runs its census
// only when it IS the entry point, so importers get the functions and nothing
// else — which is what lets `fallback-reads.mjs` reuse the attribution instead
// of growing a fourth copy of it.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
const render = JSON.parse(readFileSync(join(HERE, 'render-census.json'), 'utf8'));
const { sites } = JSON.parse(readFileSync(join(HERE, 'callsites.json'), 'utf8'));
const byClass = scopeClassIndex(render);

const files = [];
for (const root of CSS_ROOTS) {
  let entries;
  try { entries = readdirSync(join(CORE, root)); } catch { continue; }
  for (const n of entries) if (n.endsWith('.css')) files.push(join(CORE, root, n));
}

const rows = files.flatMap((f) => crossFamilyRows(f, byClass));
const risky = rows.filter((r) => r.dependsOnDefault && r.callerWins);

const out = [];
for (const r of risky) {
  const j = verdictFor(r, sites);
  out.push({ ...r, file: relative(CORE, r.file), ...j });
}

console.log(`scope classes known from the render census : ${byClass.size}`);
console.log(`css files scanned                          : ${files.length}`);
console.log(`cross-family part predicates               : ${rows.length}`);
console.log(`  ...on a default part the caller can win  : ${risky.length}`);
const byVerdict = out.reduce((a, r) => ((a[r.verdict] = (a[r.verdict] || 0) + 1), a), {});
console.log(`  verdicts                                 : ${JSON.stringify(byVerdict)}`);
console.log('');
for (const r of out.filter((x) => x.verdict === 'DEAD' || x.verdict === 'MIXED')) {
  console.log(`${r.verdict}  ${r.file}:${r.line}  (${r.declCount} decls)`);
  console.log(`      ${r.selector}`);
  console.log(`      predicate belongs to ${r.primitive}/${r.engine}, not to '${r.cssFamily}'`);
  console.log(`      renamed to ${[...new Set(r.renamed.map((s) => s.value))].join(', ')} at ${r.renamed.length}/${r.hits} site(s)`);
  console.log('');
}
writeFileSync(join(HERE, 'CROSSFAMILY-PARTS.json'), `${JSON.stringify({ scopeClasses: byClass.size, filesScanned: files.length, predicates: rows.length, risky: risky.length, rows: out }, null, 1)}\n`);
console.log(`wrote CROSSFAMILY-PARTS.json`);
console.log('\nFLOOR, not a total: callsites.json reads literal JSX attributes, so an');
console.log('interpolated data-part is invisible and every verdict above is a floor.');
}
