import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { artifactsDir, requireUiSource } from '../../context/paths/index.mjs';
import { luminanceHex } from '../../parsing/index.mjs';

/**
 * Decide whether a resolved focus-ring color is "dark-blind": too dark or too
 * faint to read as a >=3:1 ring against a dark canvas (#0A0A0C-class surfaces).
 * - hex: perceived luminance below ~96/255 is too dark to see on a dark canvas.
 * - rgb()/rgba(): near-black channels (all < 60), or alpha below 0.35, disappear.
 * - keywords (white), color-mix(...var(--ds-color-primary...)), and light hex
 *   pass (a light/saturated ring is exactly what the contract requires).
 */
function isDarkBlindFocusColor(value) {
  const v = value.trim().toLowerCase();
  if (v === 'transparent') return true;
  const hex = /^#([0-9a-f]{6})$/.exec(v);
  if (hex) return luminanceHex('#' + hex[1]) < 96;
  const hex3 = /^#([0-9a-f]{3})$/.exec(v);
  if (hex3) {
    const [r, g, b] = hex3[1].split('').map((c) => parseInt(c + c, 16));
    return r * 0.299 + g * 0.587 + b * 0.114 < 96;
  }
  const rgb = /^rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)\s*(?:[,/]\s*([\d.]+%?))?\s*\)$/.exec(v);
  if (rgb) {
    const [r, g, b] = [rgb[1], rgb[2], rgb[3]].map(Number);
    let alpha = 1;
    if (rgb[4] !== undefined) alpha = rgb[4].endsWith('%') ? Number(rgb[4].slice(0, -1)) / 100 : Number(rgb[4]);
    if (alpha < 0.35) return true;
    if (r < 60 && g < 60 && b < 60) return true;
    return false;
  }
  // named "white"/"whitesmoke"/etc. and color-mix / var-driven values are treated
  // as visible (the dark override is expected to be light/saturated).
  return false;
}

/**
 * Count dark-surface tenant artifacts whose EFFECTIVE dark focus-ring color is
 * dark-blind (WO-ENG-04 interaction-state contract). The audit-3.4 defect is a
 * focus ring that resolves near-black / low-alpha on a dark canvas, so no ring
 * is visible. For each dark-surface tenant (default --ds-color-bg-primary is
 * dark) the effective ring color is the dark region's --ds-focus-ring-color, or,
 * when absent, the inherited default var(--ds-color-primary) — resolved one hop
 * to that region's --ds-color-primary. A dark-blind result counts. Target: 0.
 */
function countDarkFocusRingDefects() {
  if (!existsSync(artifactsDir)) return 0;
  let count = 0;
  for (const slug of readdirSync(artifactsDir)) {
    const file = join(artifactsDir, slug, 'index.css');
    if (!existsSync(file)) continue;
    const css = readFileSync(file, 'utf8');
    const bg = css.match(/--ds-color-bg-primary:\s*(#[0-9a-fA-F]{6})/);
    if (!bg || luminanceHex(bg[1]) >= 128) continue; // not a dark-surface tenant
    const lightIdx = css.search(/(?<!:not\()\[data-theme=['"]light['"]\]|(?<!:not\()\.light(?=[\s,{])/);
    const darkRegion = lightIdx >= 0 ? css.slice(0, lightIdx) : css;
    const resolvePrimary = () => {
      const p = darkRegion.match(/--ds-color-primary:\s*([^;]+);/);
      return p ? p[1].trim() : null;
    };
    let val;
    const explicit = darkRegion.match(/--ds-focus-ring-color:\s*([^;]+);/);
    if (explicit) {
      val = explicit[1].trim();
      const varRef = /^var\(\s*(--[a-zA-Z0-9-]+)\s*(?:,\s*([^)]+))?\)$/.exec(val);
      if (varRef) {
        if (varRef[1] === '--ds-color-primary') val = resolvePrimary() ?? val;
        else {
          const inner = darkRegion.match(new RegExp(`${varRef[1]}:\\s*([^;]+);`));
          val = inner ? inner[1].trim() : varRef[2] ? varRef[2].trim() : val;
        }
      }
    } else {
      // No dark override: the ring inherits the foundation default
      // var(--ds-color-primary); resolve it in this dark region.
      val = resolvePrimary();
      if (val === null) continue; // no dark primary literal to test
    }
    if (val && isDarkBlindFocusColor(val)) count += 1;
  }
  return count;
}

/**
 * Flagship interactive components whose modern engines must consume the state
 * contract tokens (press scale, focus ring, elevation), not inline literals.
 */
const FLAGSHIP_STATE_FILES = [
  'primitives/inputs/Button/engines/modern/index.tsx',
  'primitives/inputs/Input/engines/modern/index.tsx',
  'primitives/inputs/Select/engines/modern/index.tsx',
  'primitives/navigation/Tabs/engines/modern/index.tsx',
];

/**
 * Count inline per-component interaction-state literals in the flagship modern
 * engines (WO-ENG-04): a hardcoded press/scale factor (`scale(0.98)` — not
 * `scale(var(...))`) or a focus/hover box-shadow / outline carrying a hardcoded
 * color literal (rgb/rgba/hex) instead of a token. These are the values that
 * must live in the tokenized state contract. Target: 0 (decrease-only ratchet).
 */
function countInlineStateLiterals() {
  const scaleRe = /scale\(\s*0?\.\d+\s*\)/g; // scale(0.98) / scale(.98), not scale(var(...))
  const shadowLiteralRe =
    /(?:box-?shadow|boxShadow|outline)\s*:?\s*['"]?[^;'"\n]*(?:rgba?\([^)]*\)|#[0-9a-fA-F]{3,8}\b)/gi;
  let count = 0;
  for (const rel of FLAGSHIP_STATE_FILES) {
    const full = requireUiSource(rel, 'inline-state audit');
    const text = readFileSync(full, 'utf8');
    count += (text.match(scaleRe) || []).length;
    count += (text.match(shadowLiteralRe) || []).length;
  }
  return count;
}

export {
  countDarkFocusRingDefects,
  countInlineStateLiterals,
};
