#!/usr/bin/env node
/**
 * WO-ARC-01 codemod: rewrite a consuming app's `SizeType` import from `@rottay/design-system`
 * onto the canonical `Size` type.
 *
 * Scope (deliberately narrow -- see README.md "Limitations"): a type-only import naming
 * `SizeType` from `@rottay/design-system` (or a `@rottay/design-system/...` subpath) is
 * rewritten to `Size`, and every bare `SizeType` identifier reference in that same file is
 * renamed to `Size` alongside it. This does NOT rewrite JSX prop literal values (e.g. a
 * `size="small"` string on a DS component) -- see the README for why that transform is left to
 * manual review instead of a mechanical rewrite.
 *
 * Usage (run from within the consuming app's repo):
 *   node sizetype-to-size.mjs <path>              # dry run: report files that would change
 *   node sizetype-to-size.mjs <path> --write       # apply the rewrite
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

/**
 * Matches a named import/import-type clause naming `SizeType` from a `@rottay/design-system`
 * specifier (root or subpath), across both `import type { SizeType }` and `import { type
 * SizeType }` inline-type-modifier forms. Captures the clause's other named imports (if any)
 * so `SizeType` can be removed/replaced without disturbing siblings.
 */
const IMPORT_LINE_RE =
  /^(import\s+(?:type\s+)?\{)([^}]*)(\}\s*from\s*['"]@rottay\/design-system(?:\/[^'"]*)?['"];?)$/gm;

/** True when `names` (a comma-separated import-clause body) names `SizeType` as a bare or
 * `type `-prefixed specifier (not e.g. `MySizeType`). */
function namesSizeType(names) {
  return names
    .split(",")
    .map((n) => n.trim().replace(/^type\s+/, ""))
    .some((n) => n === "SizeType" || n.startsWith("SizeType as "));
}

function rewriteFile(text) {
  let changed = false;
  let sizeTypeImported = false;

  const rewritten = text.replace(IMPORT_LINE_RE, (full, head, names, tail) => {
    if (!namesSizeType(names)) return full;
    sizeTypeImported = true;
    changed = true;
    const nextNames = names
      .split(",")
      .map((n) => n.trim())
      .map((n) => {
        const bare = n.replace(/^type\s+/, "");
        if (bare === "SizeType") return n.replace("SizeType", "Size");
        if (bare.startsWith("SizeType as ")) return n.replace("SizeType as ", "Size as ");
        return n;
      })
      // De-dupe: a file that already separately imports `Size` would otherwise get two.
      .filter((n, i, arr) => arr.indexOf(n) === i);
    return `${head} ${nextNames.join(", ")} ${tail}`;
  });

  if (!sizeTypeImported) return { text, changed: false };

  // Rename bare `SizeType` identifier references (type annotations, generic args) -- but not
  // inside the import line itself (already handled above) and not a longer identifier that
  // merely contains the substring (`\b` word boundaries guard both ends).
  const finalText = rewritten.replace(/\bSizeType\b/g, "Size");
  return { text: finalText, changed: changed || finalText !== rewritten };
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
  `sizetype-to-size: ${touched.length} file(s) ${write ? "rewritten" : "would change"} (scanned ${files.length})`,
);
for (const f of touched) console.log(`  ${f}`);
if (!write && touched.length > 0) {
  console.log("\nDry run only -- re-run with --write to apply.");
}
