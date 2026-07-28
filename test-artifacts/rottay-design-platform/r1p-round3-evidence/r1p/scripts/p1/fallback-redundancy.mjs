/**
 * P1 task 2 core measurement: is a component-literal declaration doing any work?
 *
 * The DS component CSS-variable pattern is
 *   `prop: var(--ds-<component>-<role>, var(--ds-<generic-token>))`
 * so a component channel only earns its place when its value DIFFERS from what
 * the component's own fallback chain already resolves to. An extension
 * declaration that restates the fallback is pure redundancy: deleting it
 * changes no pixel, which is the death proof.
 *
 * Method:
 *  1. Harvest every `var(--X, <fallback>)` read of the channel from real
 *     consumer sources (DS core + apps, non-test).
 *  2. Resolve <fallback> against the artifact's effective map for the state the
 *     declaration lives in, with the channel itself removed.
 *  3. Compare to the declared value, normalized (case, whitespace, hex form).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { stateOf } from './state-of.mjs';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { effectiveMap } from '../effective-map.mjs';

const OUT = '/Users/daniel/Developer/Rottay/ui-design-system/test-artifacts/rottay-design-platform/r1p-round3-evidence/r1p/closure/remediation';
const ROOT = '/Users/daniel/Developer/Rottay';
const CORE = `${ROOT}/ui-design-system/packages/core`;

const ledger = JSON.parse(readFileSync(`${OUT}/p1-ledger.json`, 'utf-8'));

// ------------------------------------------------------- harvest fallback chains
const SOURCE_ROOTS = [
  `${CORE}/src`, `${ROOT}/ui-design-system/packages/showroom/src`,
  `${ROOT}/app-bithire/src`, `${ROOT}/app-evnto/src`, `${ROOT}/app-platform/src`,
];
function listFiles(root) {
  try {
    return execFileSync('find', [root, '-type', 'f', '(', '-name', '*.ts', '-o', '-name', '*.tsx',
      '-o', '-name', '*.css', '-o', '-name', '*.js', '-o', '-name', '*.jsx', ')',
      '-not', '-path', '*/node_modules/*'], { encoding: 'utf-8', maxBuffer: 1 << 28 }).split('\n').filter(Boolean);
  } catch { return []; }
}

/** Balanced-paren extraction of the arguments of a var() starting at `open`. */
function readVarArgs(text, open) {
  let depth = 0;
  for (let i = open; i < text.length; i += 1) {
    if (text[i] === '(') depth += 1;
    else if (text[i] === ')') { depth -= 1; if (depth === 0) return text.slice(open + 1, i); }
  }
  return null;
}
function splitTopLevel(args) {
  const parts = []; let depth = 0; let cur = '';
  for (const ch of args) {
    if (ch === '(') depth += 1;
    if (ch === ')') depth -= 1;
    if (ch === ',' && depth === 0) { parts.push(cur); cur = ''; continue; }
    cur += ch;
  }
  parts.push(cur);
  return parts.map((p) => p.trim());
}

const fallbacks = new Map(); // prop -> Map(fallbackExpr -> {count, files:Set})
for (const rootDir of SOURCE_ROOTS) {
  for (const file of listFiles(rootDir)) {
    if (/facade\/artifacts\/(bithire|evnto|rottay)\//.test(file)) continue;
    if (/\/tests?\/|\.test\.|__tests__/.test(file)) continue;
    let text; try { text = readFileSync(file, 'utf-8'); } catch { continue; }
    if (!text.includes('var(--ds-')) continue;
    let idx = 0;
    while ((idx = text.indexOf('var(', idx)) !== -1) {
      const args = readVarArgs(text, idx + 3);
      idx += 4;
      if (args == null) continue;
      const parts = splitTopLevel(args);
      const name = parts[0];
      if (!name?.startsWith('--')) continue;
      const fb = parts.length > 1 ? parts.slice(1).join(',').trim() : '';
      if (!fallbacks.has(name)) fallbacks.set(name, new Map());
      const m = fallbacks.get(name);
      const rec = m.get(fb) ?? { count: 0, files: [] };
      rec.count += 1;
      if (rec.files.length < 3) rec.files.push(file.replace(ROOT + '/', ''));
      m.set(fb, rec);
    }
  }
}
console.log(`harvested fallback chains for ${fallbacks.size} channels`);

// ------------------------------------------------------- effective maps
const STATES = ['default', 'light', 'dark'];
const maps = {};
for (const slug of ['bithire', 'evnto', 'rottay']) {
  const css = readFileSync(`${CORE}/src/foundation/tokens/css/facade/artifacts/${slug}/index.css`, 'utf-8');
  maps[slug] = {};
  for (const st of STATES) maps[slug][st] = Object.fromEntries([...effectiveMap(css, st, slug)].map(([k, v]) => [k, v.value]));
}

/** Resolve a value expression's var() chains against a variable map, skipping `skip`. */
function resolve(expr, varMap, skip, depth = 0) {
  if (depth > 12 || expr == null) return null;
  let out = '';
  let i = 0;
  while (i < expr.length) {
    const at = expr.indexOf('var(', i);
    if (at === -1) { out += expr.slice(i); break; }
    out += expr.slice(i, at);
    const args = readVarArgs(expr, at + 3);
    if (args == null) return null;
    const parts = splitTopLevel(args);
    const name = parts[0];
    const fb = parts.length > 1 ? parts.slice(1).join(',').trim() : null;
    let replacement;
    if (name !== skip && Object.prototype.hasOwnProperty.call(varMap, name)) {
      replacement = resolve(varMap[name], varMap, skip, depth + 1);
    } else if (fb != null) {
      replacement = resolve(fb, varMap, skip, depth + 1);
    } else {
      return null; // unresolvable: no value, no fallback
    }
    if (replacement == null) return null;
    out += replacement;
    i = at + 4 + args.length; // past `var(` + args + `)`
  }
  return out.trim();
}

const HEX3 = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i;
function norm(v) {
  if (v == null) return null;
  let s = String(v).trim().toLowerCase().replace(/\s+/g, ' ').replace(/\s*,\s*/g, ',').replace(/;$/, '');
  const m = HEX3.exec(s);
  if (m) s = `#${m[1]}${m[1]}${m[2]}${m[2]}${m[3]}${m[3]}`;
  // rgba(r, g, b, 0.10) === rgba(r,g,b,.1)
  s = s.replace(/(\d)0+(?=[,)])/g, (mm, d) => (mm.includes('.') ? mm.replace(/0+$/, '') : mm));
  s = s.replace(/0\.(\d*?)0+(?=[,)])/g, '0.$1').replace(/0\.(?=[,)])/g, '0');
  return s;
}

/** Which state does a selector arm describe? */

const report = {};
for (const [slug, v] of Object.entries(ledger.verticals)) {
  const out = { redundant: [], loadBearing: [], noConsumerFallback: [], unresolvable: [] };
  for (const row of v.rows) {
    if (row.cls !== 'component-literal' && row.cls !== 'semantic-vocabulary' && row.cls !== 'unclassified-semantic') continue;
    const st = stateOf(row.selector);
    const varMap = maps[slug][st];
    const chains = fallbacks.get(row.prop);
    if (!chains || [...chains.keys()].every((k) => k === '')) {
      out.noConsumerFallback.push({ prop: row.prop, value: row.value, state: st, readers: row.readers });
      continue;
    }
    // every distinct non-empty fallback used by a real consumer
    const results = [];
    for (const [fb, meta] of chains) {
      if (!fb) { results.push({ fb: '(none)', resolved: null, meta: meta.count }); continue; }
      results.push({ fb, resolved: resolve(fb, varMap, row.prop), meta: meta.count });
    }
    const declared = norm(row.value);
    const allSame = results.every((r) => r.resolved != null && norm(r.resolved) === declared);
    const anyUnresolved = results.some((r) => r.resolved == null);
    const rec = { prop: row.prop, value: row.value, state: st, readers: row.readers, chains: results.map((r) => ({ fb: r.fb, resolved: r.resolved, uses: r.meta })) };
    if (allSame) out.redundant.push(rec);
    else if (anyUnresolved) out.unresolvable.push(rec);
    else out.loadBearing.push(rec);
  }
  report[slug] = out;
  console.log(`${slug}: redundant ${out.redundant.length} | load-bearing ${out.loadBearing.length} | no-consumer-fallback ${out.noConsumerFallback.length} | unresolvable ${out.unresolvable.length}`);
}
writeFileSync(`${OUT}/p1-fallback-redundancy.json`, JSON.stringify(report, null, 1));
console.log(`wrote ${OUT}/p1-fallback-redundancy.json`);
