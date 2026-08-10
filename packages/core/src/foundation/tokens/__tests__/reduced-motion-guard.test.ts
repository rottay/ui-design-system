/** Pins the R5 motion batch: the exact roster that gained a reduced-motion guard, the guard's
 *  causal shape on each one, and the fact that no in-scope stylesheet animates unguarded. */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const CSS_ROOT = join(__dirname, "../css");

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (entry.name.endsWith(".css")) acc.push(full);
  }
  return acc;
}

/** Comments are blanked, not deleted, so a commented-out `transition:` or the word
 *  "prefers-reduced-motion" in prose can never satisfy a check. */
const blankComments = (css: string): string =>
  css.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));

const DECLARES_MOTION = /(^|[\s;{])(transition|animation)\s*:/m;
const norm = (s: string): string => s.replace(/\s+/g, " ").trim();

/* Classic and Rustic are read-only this programme, so the batch's scope is Modern plus shared. */
const IN_SCOPE = walk(CSS_ROOT)
  .filter((f) => f.includes("/engines/modern/") || f.includes("/components/"))
  .sort();

const rel = (f: string): string => f.slice(CSS_ROOT.length + 1);

/** The 22 stylesheets that declared motion with no reduced-motion guard at all before the batch. */
const ROSTER = [
  "presentation/components/arc.css",
  "presentation/components/card.css",
  "presentation/components/icon-frame.css",
  "presentation/components/meter.css",
  "presentation/components/skin/code-block.css",
  "presentation/components/skin/collection-workspace-render-dispatch.css",
  "presentation/components/skin/guided-draft-form.css",
  "presentation/components/skin/image-compounds.css",
  "presentation/components/skin/markdown-view.css",
  "presentation/components/skin/record-workbench.css",
  "presentation/components/skin/scroll-area.css",
  "runtime/engines/modern/framework-bridge.css",
  "runtime/engines/modern/skin/collapse.css",
  "runtime/engines/modern/skin/command-palette.css",
  "runtime/engines/modern/skin/environment-toggle.css",
  "runtime/engines/modern/skin/locale-switcher.css",
  "runtime/engines/modern/skin/pattern-map-view.css",
  "runtime/engines/modern/skin/record-facts.css",
  "runtime/engines/modern/skin/result.css",
  "runtime/engines/modern/skin/shortcuts-overlay.css",
  "runtime/engines/modern/skin/skeleton.css",
  "runtime/engines/modern/skin/user-profile-card.css",
];

/** Commas inside `:is()` / `:where()` separate arguments, not selectors, so the split is
 *  paren-depth aware. */
function splitSelectorList(list: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let buf = "";
  for (const ch of list) {
    if (ch === "(") depth += 1;
    else if (ch === ")") depth -= 1;
    if (ch === "," && depth === 0) {
      parts.push(norm(buf));
      buf = "";
    } else buf += ch;
  }
  if (norm(buf) !== "") parts.push(norm(buf));
  return parts.filter((p) => p !== "");
}

/** Selectors carrying a `transition:`/`animation:` shorthand; keyframe stops and at-rule preludes
 *  are not selectors. A prelude of `A, B` animates both, so it is split like the guard's list. */
function productiveSelectors(blanked: string): Set<string> {
  const out = new Set<string>();
  for (const rule of blanked.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = rule[1].trim();
    if (!/(^|[\s;])(transition|animation)\s*:/m.test(rule[2])) continue;
    if (selector === "" || selector.startsWith("@") || selector.includes("%")) continue;
    for (const one of splitSelectorList(selector)) out.add(one);
  }
  return out;
}

/** Body of the first `prefers-reduced-motion: reduce` block, brace-balanced. */
function reduceBlock(blanked: string): string | null {
  const open = blanked.match(/@media\s*\(\s*prefers-reduced-motion:\s*reduce\s*\)\s*\{/);
  if (open?.index === undefined) return null;
  let i = open.index + open[0].length;
  const start = i;
  for (let depth = 1; i < blanked.length && depth > 0; i += 1) {
    if (blanked[i] === "{") depth += 1;
    else if (blanked[i] === "}") depth -= 1;
  }
  return blanked.slice(start, i - 1);
}

describe("R5 motion batch -- the guarded roster is exactly the 22 previously unguarded files", () => {
  it("matches the roster on disk, with no file added or dropped", () => {
    const onDisk = IN_SCOPE.filter((f) =>
      /Reduced motion: durations collapse but the transition still fires/.test(
        readFileSync(f, "utf8"),
      ),
    ).map(rel);
    expect(onDisk).toEqual(ROSTER);
  });

  it.each(ROSTER)("%s carries a reduce guard collapsing duration without killing the event", (path) => {
    const blanked = blankComments(readFileSync(join(CSS_ROOT, path), "utf8"));
    const block = reduceBlock(blanked);
    expect(block).not.toBeNull();
    /* Near-zero, not `none`: transitionend/animationend still fire, so no state machine stalls. */
    expect(block).toMatch(/transition-duration:\s*0\.01ms\s*!important/);
    expect(block).toMatch(/animation-duration:\s*0\.01ms\s*!important/);
    expect(block).toMatch(/animation-iteration-count:\s*1\s*!important/);
  });

  it.each(ROSTER)("%s guards every selector that actually animates", (path) => {
    const blanked = blankComments(readFileSync(join(CSS_ROOT, path), "utf8"));
    const productive = productiveSelectors(blanked);
    /* A guard over nothing would pass the shape check vacuously. */
    expect(productive.size).toBeGreaterThan(0);

    const block = reduceBlock(blanked) ?? "";
    const guarded = new Set(splitSelectorList(block.slice(0, block.indexOf("{"))));
    expect([...productive].filter((s) => !guarded.has(s))).toEqual([]);
  });
});

describe("R5 motion batch -- nothing in scope animates unguarded", () => {
  it("leaves the previously unguarded roster empty", () => {
    const unguarded = IN_SCOPE.filter((f) => {
      const blanked = blankComments(readFileSync(f, "utf8"));
      return DECLARES_MOTION.test(blanked) && !/prefers-reduced-motion/.test(blanked);
    }).map(rel);
    expect(unguarded).toEqual([]);
  });

  it("still sees motion declared across the scope, so the sweep is not measuring an empty set", () => {
    const moving = IN_SCOPE.filter((f) => DECLARES_MOTION.test(blankComments(readFileSync(f, "utf8"))));
    expect(moving.length).toBeGreaterThanOrEqual(ROSTER.length);
  });
});
