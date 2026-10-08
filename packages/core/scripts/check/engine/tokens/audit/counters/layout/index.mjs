import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { componentsDir } from '../../context/paths/index.mjs';

/* ============================================================================
   Cross-engine layout contract (WO-ENG-10, spec section 10): "Layout belongs
   to the component layer; engines theme, they do not re-layout." The
   StatsGrid defect (modern stacked stats vertically via a responsive
   auto-fill/minmax grid while classic/rustic rendered a fixed `columns`-track
   horizontal grid) is the shape this counter detects: the modern engine
   declaring an explicit structural layout-axis value that CONTRADICTS an
   agreeing classic+rustic pair.
   ============================================================================ */

/**
 * Structural layout-axis inline-style properties this gate compares, as raw
 * per-occurrence source text. Scoped to the two properties that actually
 * flip a component's rendered arrangement (row-vs-column axis, explicit
 * column/track count) -- `flexWrap`/`gridTemplateRows` and gap/padding
 * values are cosmetic-wrapping or spacing theming (spec section 10 exempts
 * these explicitly), not orientation/axis divergences, so they are not
 * scored here.
 *
 * KNOWN BLIND SPOT: several modern engines express layout via Tailwind/
 * DaisyUI utility classes in `className` (`grid grid-cols-7`, `flex-col`)
 * rather than inline `style={{ ... }}` objects (e.g. Calendar, DatePicker,
 * List, Descriptions). This regex-over-inline-styles heuristic cannot see
 * className-based axis declarations. The WO-ENG-10 sweep (2026-07-09)
 * manually reviewed every className-based case alongside the inline-style
 * ones and found no real divergence beyond StatsGrid; a future className-
 * aware extension would need to parse Tailwind grid-cols-N / flex-row /
 * flex-col tokens the same way, but is not implemented here.
 */
const LAYOUT_AXIS_PATTERNS = [
  { name: 'flexDirection', re: /flexDirection:\s*['"]([a-zA-Z-]+)['"]/g },
  {
    name: 'gridTemplateColumns',
    re: /gridTemplateColumns:\s*([`'"])((?:(?!\1).)*)\1/g,
  },
];

/**
 * Components with a verified-legitimate per-engine layout axis, declared in
 * the component's own contract/types file (spec section 10's "explicitly
 * declares a layout axis as engine-themable" exception) -- format
 * `"<component-dir-relative-to-src/components>:<patternName>"`. Each entry
 * here must correspond to a comment in that component's `*.types.ts` (or
 * engine file) recording the same declaration, so the exemption is
 * discoverable from the component contract, not just this script.
 *
 * `primitives/inputs/Toggle:flexDirection` -- the WO-ENG-10 sweep (2026-07-09)
 * confirmed by direct read that all three engines implement `labelPlacement`
 * ('start' -> row-reverse, 'end' -> row) identically (see
 * `Toggle.types.ts`'s `labelPlacement` doc). This is NOT an actual
 * divergence: classic/rustic write the ternary in the VALUE position
 * (`flexDirection: labelPlacement === 'start' ? 'row-reverse' : 'row'`)
 * while modern writes it at the whole-object position
 * (`...(labelPlacement === 'start' ? { flexDirection: 'row-reverse', ... } :
 * { ... })`) -- both produce the same two possible values, but this script's
 * regex-over-source-text extraction only resolves a literal immediately
 * following `flexDirection:`, so it can see modern's `'row-reverse'` literal
 * but not classic/rustic's ternary-in-value-position one. Properly parsing
 * arbitrary ternary expressions would need a real JS/TS parser, which is out
 * of proportion to this narrow gate -- allowlisted instead of over-engineering
 * the regex.
 */
const LAYOUT_AXIS_EXCEPTIONS = new Set([
  'primitives/inputs/Toggle:flexDirection',
]);

/**
 * Collect every `engines/{classic,modern,rustic}` triad under `src/components`
 * (folder `engines/classic/index.tsx`, same canonical shape
 * `modernFiles()` above recognizes), keyed by the component's
 * directory path relative to `componentsDir` (for example,
 * `patterns/data/stats-grid`).
 * A component missing any one of the three engine files is skipped -- there
 * is nothing to compare it against.
 */
function findEngineTriads(dir, base) {
  const out = new Map();
  function walk(current) {
    for (const entry of readdirSync(current)) {
      const full = join(current, entry);
      if (!statSync(full).isDirectory()) continue;
      if (entry === 'engines') {
        const rel = dirname(full.slice(base.length + 1));
        const engineFile = (name) => {
          for (const ext of ['.tsx', '.ts']) {
            const flat = join(full, `${name}${ext}`);
            if (existsSync(flat)) return flat;
          }
          const folderIndex = join(full, name, 'index.tsx');
          return existsSync(folderIndex) ? folderIndex : null;
        };
        const classic = engineFile('classic');
        const modern = engineFile('modern');
        const rustic = engineFile('rustic');
        if (classic && modern && rustic) out.set(rel, { classic, modern, rustic });
      } else {
        walk(full);
      }
    }
  }
  walk(dir);
  return out;
}

/** Every raw-text match for a layout-axis pattern in a file's source text, as a sorted, de-duped array. */
function extractLayoutAxisValues(text, re) {
  const values = new Set();
  re.lastIndex = 0;
  let m;
  while ((m = re.exec(text))) {
    values.add((m[2] !== undefined ? m[2] : m[1]).replace(/\s+/g, ' ').trim());
  }
  return [...values].sort();
}

/**
 * Count components where the modern engine declares an explicit
 * flexDirection/gridTemplateColumns value that DISAGREES with a
 * classic+rustic consensus (both siblings declare the SAME explicit value
 * for the same axis). Deliberately a narrow, high-precision proxy rather
 * than an exhaustive layout-parity checker:
 *  - Requires all three engines to have a NON-EMPTY value for the axis
 *    before comparing. Classic frequently wraps an Ant Design component
 *    whose own bundled CSS implements the layout internally (no inline
 *    declaration in classic's file at all), and plain stacked `<div>`s
 *    already lay out vertically via normal block flow with no inline
 *    `flexDirection` needed -- neither is a divergence, and requiring all
 *    three non-empty avoids flagging them (the WO-ENG-10 sweep manually
 *    verified this empty-vs-nonempty shape component-by-component and
 *    found no real defect hiding behind it).
 *  - Only flags MODERN as the outlier against an agreeing classic+rustic
 *    pair -- this mirrors the actual StatsGrid defect shape (classic and
 *    rustic already agreed with each other on a fixed `columns`-track grid;
 *    modern alone substituted a different, responsive one). A case where
 *    CLASSIC is the lone outlier against an agreeing modern+rustic pair
 *    (e.g. a differently-tuned pixel threshold) is gap/sizing theming, not
 *    an axis divergence, and is not counted.
 *  - `LAYOUT_AXIS_EXCEPTIONS` lets a reviewed, contract-documented
 *    engine-themable axis opt out by name.
 * Target: 0.
 */
function countCrossEngineLayoutDivergences() {
  const triads = findEngineTriads(componentsDir, componentsDir);
  let count = 0;
  const detail = [];
  for (const [rel, triad] of triads) {
    const classicText = readFileSync(triad.classic, 'utf8');
    const modernText = readFileSync(triad.modern, 'utf8');
    const rusticText = readFileSync(triad.rustic, 'utf8');
    for (const { name, re } of LAYOUT_AXIS_PATTERNS) {
      if (LAYOUT_AXIS_EXCEPTIONS.has(`${rel}:${name}`)) continue;
      const c = extractLayoutAxisValues(classicText, re);
      const m = extractLayoutAxisValues(modernText, re);
      const r = extractLayoutAxisValues(rusticText, re);
      if (c.length === 0 || m.length === 0 || r.length === 0) continue;
      const cKey = JSON.stringify(c);
      const rKey = JSON.stringify(r);
      const mKey = JSON.stringify(m);
      if (cKey === rKey && mKey !== cKey) {
        count += 1;
        detail.push(`${rel} (${name}): classic/rustic=${cKey} modern=${mKey}`);
      }
    }
  }
  if (process.env.DEBUG_LAYOUT) {
    for (const d of detail) console.log(`  layout divergence: ${d}`);
  }
  return count;
}

export {
  countCrossEngineLayoutDivergences,
};
