#!/usr/bin/env node
/**
 * WO-ENG-01 codemod: unify the modern engine's motion onto the --ds-motion-* canon.
 *
 * Two deterministic transforms across every modern-engine component file:
 *  1. Strip literal fallbacks from `var(--ds-motion-<name>, <literal>)` -> `var(--ds-motion-<canon>)`,
 *     mapping the orphan names (consumed but never defined) onto the canon.
 *  2. Replace the two bare cubic-bezier literals with their named easing tokens.
 *
 * Timing shifts (e.g. 150ms fallback -> --ds-motion-fast = 120ms) are intentional: they unify the
 * modern engine on the Quiet Premium cadence. classic/rustic use the legacy --transition-* catalog
 * and are untouched. Balanced-paren parsing handles the nested cubic-bezier fallbacks.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const componentsDir = resolve(here, "../src/components");

/** Orphan / engine-local motion names -> canon names. */
const NAME_MAP = {
  "duration-fast": "fast",
  "duration-slow": "slow",
  "duration-normal": "normal",
  base: "normal",
  gentle: "glacial",
  "easing-ease-in-out": "ease-in-out",
  "easing-ease-out": "ease-out",
  // canon names pass through unchanged:
  instant: "instant",
  fast: "fast",
  normal: "normal",
  slow: "slow",
  glacial: "glacial",
  "ease-out": "ease-out",
  "ease-in-out": "ease-in-out",
  spring: "spring",
  // entrance-geometry tokens (defined in the canon by this WO):
  "scale-in": "scale-in",
  "offset-in": "offset-in",
};

function modernFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...modernFiles(full));
    else if (/engines\/modern(\/[^/]+)?\.tsx?$/.test(full.replace(/\\/g, "/"))) out.push(full);
  }
  return out;
}

/** Rewrite every `var(--ds-motion-<name>, <fallback>)` to `var(--ds-motion-<canon>)`, balanced. */
function stripMotionFallbacks(text) {
  let changes = 0;
  const marker = "var(--ds-motion-";
  let out = "";
  let i = 0;
  while (i < text.length) {
    const at = text.indexOf(marker, i);
    if (at === -1) {
      out += text.slice(i);
      break;
    }
    out += text.slice(i, at);
    // Balance parens from the `(` after `var`.
    const open = at + 3; // index of '('
    let depth = 0;
    let j = open;
    for (; j < text.length; j++) {
      if (text[j] === "(") depth++;
      else if (text[j] === ")") {
        depth--;
        if (depth === 0) break;
      }
    }
    const inner = text.slice(at + marker.length, j); // e.g. "fast, 150ms" or "ease-out, cubic-bezier(...)"
    const name = inner.split(",")[0].trim();
    const canon = NAME_MAP[name] ?? name;
    out += `var(--ds-motion-${canon})`;
    if (`var(--ds-motion-${canon})` !== text.slice(at, j + 1)) changes++;
    i = j + 1;
  }
  return { text: out, changes };
}

const BARE_BEZIER = [
  [/cubic-bezier\(0\.16,\s*1,\s*0\.3,\s*1\)/g, "var(--ds-motion-ease-out)"],
  [/cubic-bezier\(0\.4,\s*0,\s*0\.6,\s*1\)/g, "var(--ds-motion-ease-in-out)"],
];

let totalFallbacks = 0;
let totalBezier = 0;
let filesChanged = 0;
for (const file of modernFiles(componentsDir)) {
  const original = readFileSync(file, "utf8");
  const stripped = stripMotionFallbacks(original);
  let text = stripped.text;
  let bezier = 0;
  for (const [re, tok] of BARE_BEZIER) {
    text = text.replace(re, () => {
      bezier++;
      return tok;
    });
  }
  if (text !== original) {
    writeFileSync(file, text);
    filesChanged++;
    totalFallbacks += stripped.changes;
    totalBezier += bezier;
  }
}
console.log(
  `codemod-motion-tokens: ${filesChanged} files, ${totalFallbacks} var-fallbacks stripped, ${totalBezier} bare cubic-bezier replaced`,
);
