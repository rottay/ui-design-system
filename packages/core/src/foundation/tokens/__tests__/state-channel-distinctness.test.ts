/** A hover or active repaint that resolves to the resting value is a rule that costs bytes and
 *  changes nothing. Ten field families shipped exactly that: `var(--ds-<family>-border-hover,
 *  var(--ds-color-border))`, where the family-private half is declared nowhere, so every chain
 *  fell through to the border the control already had.
 *
 *  Resolution is declaration-aware, because a fallback only fires when the name in front of it is
 *  undeclared. `var(--ds-select-bg-hover, var(--ds-material-control-background-hover, ...,
 *  var(--ds-surface-control)))` ends on a resting name and is still perfectly alive: the middle
 *  channel is declared, so the chain stops there and the resting tail is unreachable. Judging by
 *  the last name alone would condemn the correct idiom along with the broken one. */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const CORE = join(__dirname, "../../..");
const CSS_ROOT = join(__dirname, "../css");

function walk(dir: string, exts: string[], acc: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "dist") continue;
      walk(full, exts, acc);
    } else if (exts.some((x) => entry.name.endsWith(x))) acc.push(full);
  }
  return acc;
}

/** Comments are blanked, not deleted, so prose describing the old chain cannot fail the sweep. */
const blankComments = (src: string): string =>
  src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));

const CSS_FILES = walk(CSS_ROOT, [".css"]);
const TS_FILES = walk(CORE, [".ts", ".tsx"]);

/* Classic and Rustic are read-only for this programme; the repaired scope is Modern skin. */
const IN_SCOPE = CSS_FILES.filter((f) => f.includes("/engines/modern/"));

/** A property is declared by CSS *or* by a component stamping it at runtime. */
function declaredNames(): Set<string> {
  const declared = new Set<string>();
  for (const file of CSS_FILES) {
    const css = blankComments(readFileSync(file, "utf8"));
    for (const d of css.matchAll(/(^|[\s;{])(--ds-[a-z0-9-]+)\s*:/g)) declared.add(d[2]);
  }
  for (const file of TS_FILES) {
    const src = blankComments(readFileSync(file, "utf8"));
    for (const d of src.matchAll(/["'`](--ds-[a-z0-9-]+)["'`]\s*(?:as\s+\w+\s*)?\]?\s*\??\s*[:=]/g)) {
      declared.add(d[1]);
    }
    for (const d of src.matchAll(/setProperty\(\s*["'`](--ds-[a-z0-9-]+)["'`]/g)) declared.add(d[1]);
  }
  return declared;
}

/** The resting names a state repaint must not end up resolving to. */
const RESTING_SOURCE: Record<string, string[]> = {
  "border-color": ["--ds-color-border"],
  background: ["--ds-surface-control", "--ds-surface-card"],
  "background-color": ["--ds-surface-control", "--ds-surface-card"],
};

/**
 * The name a pure `var()` fallback chain actually resolves to: the first declared one, or the
 * terminal when none is declared.
 *
 * Only a pure chain is judged. `color-mix(in srgb, var(--ds-color-primary) 5%,
 * var(--ds-surface-card))` also mentions a resting name, but it is a tint computed OVER rest —
 * a real repaint, and the idiom most of the corpus uses deliberately.
 */
function resolvedSource(value: string, declared: Set<string>): string | null {
  const chain = value.replace(/\s+/g, " ").trim();
  if (!/^var\(/.test(chain)) return null;
  if (/(?:color-mix|rgba?|hsla?|hwb|lab|lch|oklch|oklab|gradient|calc)\(/.test(chain)) return null;
  const names = [...chain.matchAll(/var\(\s*(--ds-[a-z0-9-]+)\s*(,)?/g)];
  if (names.length === 0) return null;
  for (const name of names) {
    if (declared.has(name[1])) return name[1];
  }
  const last = names[names.length - 1];
  return last[2] ? null : last[1];
}

/**
 * Declarations that only apply while the pointer is over the control or pressing it.
 *
 * Attribute states such as `[data-active='true']` are out of scope: a selected tab adopting the
 * card surface it merges into is correct, so flagging it would make the drill argue with a working
 * idiom instead of catching a dead repaint.
 */
function stateRules(css: string): { selector: string; declarations: [string, string][] }[] {
  const out: { selector: string; declarations: [string, string][] }[] = [];
  for (const rule of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = rule[1].trim();
    if (!/:hover|:active/.test(selector)) continue;
    const declarations: [string, string][] = [];
    for (const declaration of rule[2].matchAll(/(^|[\s;])([a-z-]+)\s*:\s*([^;]+)/g)) {
      declarations.push([declaration[2], declaration[3].trim()]);
    }
    out.push({ selector, declarations });
  }
  return out;
}

describe("Modern state channels resolve to something other than rest", () => {
  const declared = declaredNames();

  it("indexes a real corpus, so a pass cannot come from scanning nothing", () => {
    expect(IN_SCOPE.length).toBeGreaterThan(100);
    expect(declared.size).toBeGreaterThan(1000);
    const rules = IN_SCOPE.reduce(
      (n, f) => n + stateRules(blankComments(readFileSync(f, "utf8"))).length,
      0,
    );
    expect(rules).toBeGreaterThan(100);
  });

  it("finds no hover or active rule whose every paint resolves back to rest", () => {
    const offenders: string[] = [];
    for (const file of IN_SCOPE) {
      const css = blankComments(readFileSync(file, "utf8"));
      for (const { selector, declarations } of stateRules(css)) {
        const dead: string[] = [];
        let live = false;
        for (const [property, value] of declarations) {
          const resting = RESTING_SOURCE[property];
          const source = resting ? resolvedSource(value, declared) : null;
          if (source && resting?.includes(source)) dead.push(`${property}: ${value}`);
          else live = true;
        }
        // A rule that also moves background, colour or shadow is composing its
        // hover deliberately -- holding the border steady there is a decision,
        // not a dead chain. Only a rule with nothing left alive is a defect.
        if (dead.length > 0 && !live) {
          offenders.push(`${file.slice(CSS_ROOT.length + 1)} -> ${selector} { ${dead.join("; ")} }`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});
