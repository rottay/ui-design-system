#!/usr/bin/env node
/**
 * Dead-part audit (P-79).
 *
 * There are three ways a skin can silently paint nothing, and we guard two:
 *
 *   - it does not PARSE            -> skins.parseErrors
 *   - it is never IMPORTED         -> skins.unwired
 *   - its selectors MATCH NOTHING  -> this script
 *
 * The third silence is the one P-79 exposed. `BaseComponentProps` declares
 * `data-part` on every component ("skin anatomy hook"), so `tsc` accepts a stamp
 * anywhere -- but Grid and Card drop it, and Button drops it in modern. A rule
 * anchored on a part that never lands simply never fires: tsc is happy, the paint
 * counter does not read attributes, jsdom is not consulted, and the pixels are
 * quietly wrong.
 *
 * The check: every `[data-part='X']` a skin selects for must be a part the source
 * actually stamps somewhere. A skin that reaches for a part nobody stamps is
 * either a typo, a part that was renamed or removed out from under it, or a stamp
 * that a primitive silently ate.
 *
 * TWO FALSE-POSITIVE CLASSES, both found the hard way -- do not remove these:
 *
 *   1. CSS COMMENTS. Skin headers quote selectors as prose
 *      (`[data-part='x'][data-part='x']`, the double-count idiom). A scanner that
 *      does not strip comments accuses three real skins of selecting for a part
 *      named "x". Comments are stripped before scanning.
 *   2. PARTS PASSED AS PROPS. detail-panel renders
 *      `<SkeletonBlock part="skeleton-badge" />`, and SkeletonBlock emits
 *      `data-part={props.part}` on a raw div. The part lands; a scanner looking
 *      only for a literal `data-part=` attribute calls five live rules dead. So a
 *      bare `part="X"` prop counts as a stamp too.
 *
 * Both make the gate CONSERVATIVE, which is the right bias: a gate that cries
 * wolf gets ignored, and an ignored gate is worse than no gate.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = join(HERE, '../src');
const COMPONENTS = join(SRC, 'components');
const SKIN_DIRS = [
  'tokens/css/engines/modern/skin',
  'tokens/css/engines/rustic/skin',
  'tokens/css/components/skin',
];

/** Every `data-part` the source stamps -- as an attribute, or handed to a `part` prop. */
function collectStampedParts() {
  const stamped = new Set();
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!/node_modules/.test(p)) walk(p);
      } else if (/\.tsx?$/.test(entry.name)) {
        const src = readFileSync(p, 'utf8');
        for (const m of src.matchAll(/data-part\s*=\s*["'`{\s]*([a-z0-9-]+)/gi)) stamped.add(m[1]);
        for (const m of src.matchAll(/["']data-part["']\s*:\s*["']([a-z0-9-]+)["']/gi)) stamped.add(m[1]);
        // A `part` prop forwarded onto a data-part by the receiving component.
        for (const m of src.matchAll(/\bpart\s*=\s*["']([a-z0-9-]+)["']/gi)) stamped.add(m[1]);
      }
    }
  };
  walk(COMPONENTS);
  return stamped;
}

/** Every `data-part` a skin rule selects for. Comments stripped first -- see the header. */
function collectReferencedParts() {
  const refs = new Map();
  for (const dir of SKIN_DIRS) {
    const full = join(SRC, dir);
    if (!existsSync(full)) continue;
    for (const f of readdirSync(full).filter((n) => n.endsWith('.css'))) {
      const css = readFileSync(join(full, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
      for (const m of css.matchAll(/\[data-part=["']([a-z0-9-]+)["']\]/gi)) {
        const key = m[1];
        if (!refs.has(key)) refs.set(key, new Set());
        refs.get(key).add(`${dir.split('/').slice(-2).join('/')}/${f}`);
      }
    }
  }
  return refs;
}

export function countDeadParts({ verbose = false } = {}) {
  const stamped = collectStampedParts();
  const refs = collectReferencedParts();
  const dead = [...refs.keys()].filter((k) => !stamped.has(k)).sort();

  if (verbose) {
    console.log(`data-part values stamped in source  : ${stamped.size}`);
    console.log(`data-part values referenced in skins: ${refs.size}`);
  }
  for (const part of dead) {
    console.error(
      `  - dead skin selector: [data-part='${part}'] is selected for by ` +
        `${[...refs.get(part)].join(', ')} but NO source file stamps it. The rule reaches nobody.`,
    );
  }
  return dead.length;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const n = countDeadParts({ verbose: true });
  console.log(`\nskins.deadParts: ${n}`);
  process.exit(n === 0 ? 0 : 1);
}
