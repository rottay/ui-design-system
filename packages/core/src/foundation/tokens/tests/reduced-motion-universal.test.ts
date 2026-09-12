/** Reduced motion is universal: every shipped stylesheet bundle carries the wildcard kill switch
 *  and its provider seam, and the only source stylesheets that animate without a guard of their
 *  own are the frozen Classic/Rustic ones, which reach users only through those bundles. */
import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

import { describe, expect, it } from "vitest";

const CSS_ROOT = join(__dirname, "../css");
const PACKAGE_ROOT = resolve(__dirname, "../../../..");

const BUNDLES = [
  "artifacts/generated/css/engines/modern/index.css",
  "artifacts/generated/css/all-verticals/index.css",
  "artifacts/generated/css/verticals/rottay/index.css",
  "artifacts/generated/css/verticals/bithire/index.css",
  "artifacts/generated/css/verticals/evnto/index.css",
];

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (entry.name.endsWith(".css")) acc.push(full);
  }
  return acc;
}

const blankComments = (css: string): string =>
  css.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));

const rel = (f: string): string => f.slice(CSS_ROOT.length + 1);

/** Selectors carrying a real `transition`/`animation` value (a bare `none` removes motion). */
function productiveSelectors(blanked: string): string[] {
  const out: string[] = [];
  for (const rule of blanked.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = rule[1].trim();
    if (selector === "" || selector.startsWith("@") || /^(from|to|[\d.,%\s]+)$/.test(selector)) continue;
    const animates = [...rule[2].matchAll(/(^|[\s;])(transition|animation)\s*:([^;]*)/g)].some(
      (decl) => !/^none(\s*!important)?$/.test(decl[3].trim()),
    );
    if (animates) out.push(selector);
  }
  return out;
}

const hasOwnGuard = (blanked: string): boolean =>
  /prefers-reduced-motion/.test(blanked) || /data-ds-motion=['"]reduced['"]/.test(blanked);

/** Classic and Rustic are frozen: their engine sheets, and bridges that only paint Ant Design internals. */
function isFrozen(path: string, selectors: string[]): boolean {
  if (/^runtime\/engines\/(classic|rustic)\//.test(path)) return true;
  return path.startsWith("runtime/bridges/") && selectors.every((s) => s.includes(".ant-"));
}

const SOURCES = walk(CSS_ROOT)
  .filter((f) => !rel(f).startsWith("facade/artifacts/"))
  .sort()
  .map((f) => {
    const blanked = blankComments(readFileSync(f, "utf8"));
    return { path: rel(f), selectors: productiveSelectors(blanked), guarded: hasOwnGuard(blanked) };
  });

const UNGUARDED = SOURCES.filter((s) => s.selectors.length > 0 && !s.guarded);

/** Bodies of every `prefers-reduced-motion: reduce` block, brace-balanced. */
function reduceBlocks(css: string): string[] {
  const out: string[] = [];
  for (const open of css.matchAll(/@media\s*\(\s*prefers-reduced-motion:\s*reduce\s*\)\s*\{/g)) {
    const start = (open.index ?? 0) + open[0].length;
    let index = start;
    for (let depth = 1; index < css.length && depth > 0; index += 1) {
      if (css[index] === "{") depth += 1;
      else if (css[index] === "}") depth -= 1;
    }
    out.push(css.slice(start, index - 1));
  }
  return out;
}

/** The near-zero the switch collapses to, held once so no assertion restates a motion timing. */
const NEAR_ZERO = "0.01ms".replace(".", "\\.");
const COLLAPSE: readonly RegExp[] = [
  new RegExp(`animation-duration:\\s*${NEAR_ZERO}\\s*!important`),
  new RegExp(`transition-duration:\\s*${NEAR_ZERO}\\s*!important`),
  /animation-iteration-count:\s*1\s*!important/,
];

const WILDCARDS = {
  media: /\*,\s*\*::before,\s*\*::after\s*\{([^}]*)\}/,
  seam: /html\[data-ds-motion='reduced'\] \*,\s*html\[data-ds-motion='reduced'\] \*::before,\s*html\[data-ds-motion='reduced'\] \*::after\s*\{([^}]*)\}/,
};

describe("reduced motion -- universal kill switch", () => {
  it.each(BUNDLES)("%s carries the wildcard switch and the provider seam", (bundle) => {
    const css = blankComments(readFileSync(join(PACKAGE_ROOT, bundle), "utf8"));
    const scopes = { media: reduceBlocks(css).join("\n"), seam: css };
    for (const [name, pattern] of Object.entries(WILDCARDS)) {
      const collapses = [...scopes[name as keyof typeof scopes].matchAll(new RegExp(pattern, "g"))].some(
        (match) => COLLAPSE.every((longhand) => longhand.test(match[1])),
      );
      expect(collapses, `${bundle}: ${name} wildcard`).toBe(true);
    }
  });
});

describe("reduced motion -- source census", () => {
  it("leaves only frozen-engine sheets without a guard of their own", () => {
    expect(UNGUARDED.filter((s) => !isFrozen(s.path, s.selectors)).map((s) => s.path)).toEqual([]);
  });

  it("measures a non-empty frozen remainder, so the census is not vacuous", () => {
    expect(UNGUARDED.filter((s) => isFrozen(s.path, s.selectors)).length).toBeGreaterThan(0);
  });

  it("holds the undo countdown full instead of letting the switch empty it", () => {
    const css = blankComments(
      readFileSync(join(CSS_ROOT, "presentation/components/skin/toast-compounds/index.css"), "utf8"),
    );
    expect(css).toMatch(
      /@media \(prefers-reduced-motion: reduce\) \{\s*\.rottay-undo-toast \[data-part='fill'\] \{\s*animation: none !important;/,
    );
    expect(css).toMatch(
      /html\[data-ds-motion='reduced'\] \.rottay-undo-toast \[data-part='fill'\] \{\s*animation: none !important;/,
    );
  });
});
