#!/usr/bin/env node
/**
 * WO-ARC-01 codemod: rewrite a literal `variant="..."` JSX attribute on Badge, Tag, Callout, or
 * Avatar onto the equivalent `tone="..."` value, for the subset of variant values each
 * component maps to a Tone (see each component's `TONE_TO_*_VARIANT` map in
 * `@rottay/design-system`, e.g. `TONE_TO_BADGE_VARIANT`). `variant` keeps compiling
 * (`@deprecated`, one release) -- this codemod is an opt-in migration to the new prop name, not
 * a required fix.
 *
 * Scope (deliberately narrow -- see README.md "Limitations"):
 *  - Only a LITERAL string attribute (`variant="primary"`) is rewritten. `variant={expr}` is
 *    left untouched -- resolving an arbitrary expression's value is out of reach for a
 *    regex-based codemod (no AST library is a dependency of this package; see README).
 *  - Only rewritten when the literal value is one this component's TONE_TO_*_VARIANT map
 *    actually covers. Badge/Avatar's 'secondary' and 'gradient', and Tag's 'secondary', have no
 *    Tone equivalent and are left as `variant` (still valid, still deprecated).
 *  - Matched by JSX TAG NAME only (`<Badge`, `<Tag`, `<Callout`, `<Avatar`), not by verifying
 *    the tag's import traces back to `@rottay/design-system` in this file -- a locally-defined
 *    or differently-sourced component with the same tag name would be a false positive. Review
 *    the dry-run diff before writing.
 *
 * Usage (run from within the consuming app's repo):
 *   node variant-tone-split.mjs <path>              # dry run: report files that would change
 *   node variant-tone-split.mjs <path> --write        # apply the rewrite
 *
 * <path> defaults to the current directory when omitted.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const args = process.argv.slice(2);
const write = args.includes("--write");
const pathArg = args.find((a) => !a.startsWith("--")) ?? ".";
const root = resolve(pathArg);

const SKIP_DIRS = new Set(["node_modules", ".git", ".next", "dist", "build", ".turbo"]);

function collectSourceFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      out.push(...collectSourceFiles(full));
    } else if (/\.(tsx?|jsx?)$/.test(full)) {
      out.push(full);
    }
  }
  return out;
}

/** variant -> tone, one map per component, mirroring each component's TONE_TO_*_VARIANT
 * export inverted (see @rottay/design-system's Badge/Tag/Callout/Avatar .types.ts). */
const VARIANT_TO_TONE = {
  Badge: { default: "neutral", primary: "primary", success: "success", warning: "warning", error: "danger", info: "info" },
  Tag: { default: "neutral", primary: "primary", success: "success", warning: "warning", error: "danger" },
  Callout: { info: "info", warning: "warning", error: "danger", success: "success" },
  Avatar: { default: "neutral", primary: "primary", success: "success", warning: "warning", error: "danger" },
};

function buildAttrRegex(component) {
  // `<Component ... variant="value" ...` -- captures up to the variant attribute so the
  // replacement can preserve everything else on the tag byte-for-byte.
  return new RegExp(`(<${component}\\b[^>]*?\\bvariant=)"([a-zA-Z]+)"`, "g");
}

function rewriteFile(text) {
  let changed = false;
  let result = text;
  for (const [component, map] of Object.entries(VARIANT_TO_TONE)) {
    const re = buildAttrRegex(component);
    result = result.replace(re, (full, head, value) => {
      const tone = map[value];
      if (!tone) return full; // no Tone equivalent (e.g. 'secondary', 'gradient') -- leave as variant
      changed = true;
      return `${head.replace(/\bvariant=$/, "tone=")}"${tone}"`;
    });
  }
  return { text: result, changed };
}

const files = collectSourceFiles(root);
const touched = [];
for (const file of files) {
  const original = readFileSync(file, "utf8");
  const { text, changed } = rewriteFile(original);
  if (!changed) continue;
  touched.push(file);
  if (write) writeFileSync(file, text);
}

console.log(
  `variant-tone-split: ${touched.length} file(s) ${write ? "rewritten" : "would change"} (scanned ${files.length})`,
);
for (const f of touched) console.log(`  ${f}`);
if (!write && touched.length > 0) {
  console.log("\nDry run only -- re-run with --write to apply. Review each change: this codemod");
  console.log("matches JSX tag names only, not verified component imports (see README.md).");
}
