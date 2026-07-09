#!/usr/bin/env node
/**
 * engine-token-audit — the modern-engine motion/token ratchet (WO-ENG-01..12 gate).
 *
 * Counts the motion + token literals the Quiet Premium spec (engines/modern/README.md
 * section 12) drives to zero, and enforces a DECREASE-ONLY ratchet: no counter may rise above
 * its recorded baseline. WO-ENG-01 seeds the motion counters; later WOs extend this file with
 * the remaining section-12 counters (hardcoded colors, shadow scales, gradient/glass/glow
 * usage, theme.css lines, radius declarations, cross-engine layout).
 *
 * Usage:
 *   node scripts/engine-token-audit.mjs            # print the current counts
 *   node scripts/engine-token-audit.mjs --check    # exit 1 if any counter rose above baseline
 *   node scripts/engine-token-audit.mjs --update-baseline   # rewrite the baseline to current
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const componentsDir = join(root, "src/components");
const baselinePath = join(here, "engine-token-audit.baseline.json");

/** Collect every modern-engine component source file (`engines/modern.tsx` or `engines/modern/*.tsx`). */
function modernFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      out.push(...modernFiles(full));
    } else if (/engines\/modern(\/[^/]+)?\.tsx?$/.test(full.replace(/\\/g, "/"))) {
      out.push(full);
    }
  }
  return out;
}

/** The motion token names components consume that the canon must define (else they resolve to fallbacks). */
const ORPHAN_MOTION_NAMES = [
  "--ds-motion-duration-fast",
  "--ds-motion-duration-slow",
  "--ds-motion-base",
  "--ds-motion-gentle",
  "--ds-motion-easing-ease-in-out",
];

function countMotionLiterals(files) {
  let cubicBezier = 0;
  let rawDuration = 0;
  let orphanTokens = 0;
  const cubicRe = /cubic-bezier\(/g;
  // Forbidden = INTERACTION-motion literals (< 1s). Milliseconds are always interaction
  // durations; seconds are counted only when < 1s. Durations >= 1s are loop/shimmer/spinner
  // tempos that legitimately sit outside the 120/200/320 canon and are allowlisted.
  const msRe = /\b\d+(?:\.\d+)?ms\b/g;
  const sRe = /(?<![\w.])(\d*\.?\d+)s(?![\w])/g;
  const orphanRe = new RegExp(
    ORPHAN_MOTION_NAMES.map((n) => n.replace(/[-]/g, "\\-")).join("|"),
    "g",
  );
  for (const file of files) {
    const text = readFileSync(file, "utf8");
    cubicBezier += (text.match(cubicRe) || []).length;
    rawDuration += (text.match(msRe) || []).length;
    for (const m of text.matchAll(sRe)) {
      if (Number(m[1]) < 1) rawDuration += 1; // sub-second seconds are interaction durations
    }
    orphanTokens += (text.match(orphanRe) || []).length;
  }
  return { cubicBezier, rawDuration, orphanTokens };
}

const tokensCssDir = join(root, "src/tokens/css");
const artifactsDir = join(tokensCssDir, "artifacts");

/** Recursively collect every `.css` file under a directory. */
function cssFilesUnder(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...cssFilesUnder(full));
    else if (full.endsWith(".css")) out.push(full);
  }
  return out;
}

/** NTSC perceived luminance (0-255) of a 6-digit hex color. */
function luminanceHex(hex) {
  const n = Number.parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return r * 0.299 + g * 0.587 + b * 0.114;
}

/**
 * Count elevation/shadow SCALE definition sites at the foundation/engine layer
 * (tenant artifacts are surface-adaptive overrides of the one scale, not scales).
 * The single source of truth is one --ds-elevation-* ramp defined with literal
 * box-shadow values; --ds-shadow-* must be var() aliases of it. A parallel
 * --ds-shadow-* ramp defined with literal values counts as a second scale.
 * Target: exactly 1.
 */
function countShadowScales() {
  const files = [
    ...cssFilesUnder(join(tokensCssDir, "foundation")),
    ...cssFilesUnder(join(tokensCssDir, "engines")),
  ];
  let scales = 0;
  for (const f of files) {
    const t = readFileSync(f, "utf8");
    if (/--ds-elevation-1:\s*(?!var\()[^;]*(?:rgba?\(|px|none)/.test(t)) scales += 1;
    if (/--ds-shadow-(?:sm|md|lg):\s*(?!var\()[^;]*(?:rgba?\(|px)/.test(t)) scales += 1;
  }
  return scales;
}

/**
 * Count depth declarations that resolve to a pure-black-only value in the dark
 * region of a dark-surface tenant artifact. Covers the elevation ramp AND the
 * tokens components actually consume for depth (--ds-shadow-xs..2xl,
 * --ds-card-shadow / -hover / -elevated), since a pure-black value on any of them
 * renders flat on a dark canvas. A dark-surface depth token must carry a hairline
 * highlight (white) and/or a primary glow — in practice by aliasing the dark
 * --ds-elevation-* ramp. Target: 0.
 */
function countDarkPureBlackElevations() {
  if (!existsSync(artifactsDir)) return 0;
  let count = 0;
  for (const slug of readdirSync(artifactsDir)) {
    const file = join(artifactsDir, slug, "index.css");
    if (!existsSync(file)) continue;
    const css = readFileSync(file, "utf8");
    const bg = css.match(/--ds-color-bg-primary:\s*(#[0-9a-fA-F]{6})/);
    if (!bg || luminanceHex(bg[1]) >= 128) continue; // not a dark-surface tenant
    // Split off the light-mode counterpart block (a POSITIVE light selector, not the
    // dark block's own `:not([data-theme='light'])` scope) so only the dark region
    // is scanned.
    const lightIdx = css.search(/(?<!:not\()\[data-theme=['"]light['"]\]|(?<!:not\()\.light(?=[\s,{])/);
    const darkRegion = lightIdx >= 0 ? css.slice(0, lightIdx) : css;
    const depthToken = /--ds-(?:elevation-[1-5]|shadow-(?:xs|sm|md|lg|xl|2xl)|card-shadow(?:-hover|-elevated)?):\s*([^;]+);/g;
    for (const m of darkRegion.matchAll(depthToken)) {
      const val = m[1].trim();
      if (val === "none") continue;
      const hasHighlight = /255/.test(val) || /color-mix|var\(--ds-color-primary/.test(val);
      const isBlackShadow = /rgba?\(\s*0\s*,\s*0\s*,\s*0/.test(val);
      if (isBlackShadow && !hasHighlight) count += 1;
    }
  }
  return count;
}

const files = modernFiles(componentsDir);
const motion = countMotionLiterals(files);

const counters = {
  "motion.cubicBezierLiterals": motion.cubicBezier,
  "motion.rawDurationLiterals": motion.rawDuration,
  "motion.orphanMotionTokens": motion.orphanTokens,
  "depth.shadowScales": countShadowScales(),
  "depth.darkPureBlackElevations": countDarkPureBlackElevations(),
  // Later WOs extend here: color.hardcodedHex, effects.gradientConsumers, ...
};

/** Invariants checked for exact equality (not just decrease-only) in --check. */
const EXACT = {
  // One elevation source of truth: the foundation ramp, with --ds-shadow-* aliases.
  "depth.shadowScales": 1,
};

const mode = process.argv.includes("--check")
  ? "check"
  : process.argv.includes("--update-baseline")
    ? "update"
    : "report";

if (mode === "update") {
  writeFileSync(baselinePath, JSON.stringify(counters, null, 2) + "\n");
  console.log("engine-token-audit: baseline updated");
  console.log(counters);
  process.exit(0);
}

console.log("engine-token-audit — modern engine files:", files.length);
for (const [k, v] of Object.entries(counters)) console.log(`  ${k}: ${v}`);

if (mode === "check") {
  if (!existsSync(baselinePath)) {
    console.error("engine-token-audit --check: no baseline (run --update-baseline first)");
    process.exit(1);
  }
  const baseline = JSON.parse(readFileSync(baselinePath, "utf8"));
  const risen = [];
  for (const [k, v] of Object.entries(counters)) {
    const base = baseline[k] ?? Infinity;
    if (v > base) risen.push(`${k}: ${v} > baseline ${base}`);
  }
  const invariant = [];
  for (const [k, expected] of Object.entries(EXACT)) {
    if (counters[k] !== expected) invariant.push(`${k}: ${counters[k]} != required ${expected}`);
  }
  if (risen.length || invariant.length) {
    console.error("engine-token-audit --check FAILED:");
    for (const r of risen) console.error("  - rose above baseline: " + r);
    for (const r of invariant) console.error("  - invariant broken: " + r);
    process.exit(1);
  }
  console.log("engine-token-audit --check OK (all counters at or below baseline; invariants hold)");
}
