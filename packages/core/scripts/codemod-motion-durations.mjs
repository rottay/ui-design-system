#!/usr/bin/env node
/**
 * WO-ENG-01 codemod (pass 2): tokenize inline CSS transition/animation duration literals in
 * the modern engine onto the --ds-motion-* canon.
 *
 * Maps each short duration literal to its nearest canon step. Milliseconds are all interaction
 * durations (< 1s) and map. Seconds < 1s map; seconds >= 1s are LEFT ALONE — those are loop /
 * shimmer / long-form animation tempos (e.g. `1.5s` shimmer) that are intentionally outside the
 * 120/200/320 interaction cadence. Only the modern engine files are touched, so classic/rustic
 * keep zero visual delta.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const componentsDir = resolve(here, "../src/components");

/** Nearest canon token for a duration in milliseconds. */
function canonForMs(ms) {
  if (ms <= 90) return "var(--ds-motion-instant)";
  if (ms <= 150) return "var(--ds-motion-fast)";
  if (ms <= 250) return "var(--ds-motion-normal)";
  if (ms <= 400) return "var(--ds-motion-slow)";
  return "var(--ds-motion-glacial)"; // 401..999ms
}

function modernFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...modernFiles(full));
    else if (/engines\/modern(\/[^/]+)?\.tsx?$/.test(full.replace(/\\/g, "/"))) out.push(full);
  }
  return out;
}

let files = 0;
let replaced = 0;
let leftLong = 0;
for (const file of modernFiles(componentsDir)) {
  const original = readFileSync(file, "utf8");
  let text = original;
  // Milliseconds: always < 1s, always an interaction duration.
  text = text.replace(/\b(\d+)ms\b/g, (m, n) => {
    replaced++;
    return canonForMs(Number(n));
  });
  // Seconds: map < 1s to canon; leave >= 1s (loops / shimmer) untouched.
  text = text.replace(/(?<![\w.])(\d*\.?\d+)s(?![\w])/g, (m, n) => {
    const seconds = Number(n);
    if (seconds >= 1) {
      leftLong++;
      return m; // loop / long-form tempo, outside the canon
    }
    replaced++;
    return canonForMs(Math.round(seconds * 1000));
  });
  if (text !== original) {
    writeFileSync(file, text);
    files++;
  }
}
console.log(
  `codemod-motion-durations: ${files} files, ${replaced} inline durations tokenized, ${leftLong} long (>=1s loop/shimmer) left as-is`,
);
