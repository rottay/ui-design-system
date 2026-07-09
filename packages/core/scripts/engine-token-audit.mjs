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

const files = modernFiles(componentsDir);
const motion = countMotionLiterals(files);

const counters = {
  "motion.cubicBezierLiterals": motion.cubicBezier,
  "motion.rawDurationLiterals": motion.rawDuration,
  "motion.orphanMotionTokens": motion.orphanTokens,
  // Later WOs extend here: color.hardcodedHex, depth.shadowScales, effects.gradientConsumers, ...
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
  if (risen.length) {
    console.error("engine-token-audit --check FAILED (counters rose above baseline):");
    for (const r of risen) console.error("  - " + r);
    process.exit(1);
  }
  console.log("engine-token-audit --check OK (all counters at or below baseline)");
}
