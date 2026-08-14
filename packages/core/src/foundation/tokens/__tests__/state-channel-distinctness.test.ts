/** A hover or active repaint that resolves to the resting value is a rule that costs bytes and
 *  changes nothing. Ten field families shipped exactly that: `var(--ds-<family>-border-hover,
 *  var(--ds-color-border))`, where the family-private half is declared nowhere, so every chain
 *  fell through to the border the control already had.
 *
 *  Two things make this decidable rather than a guess.
 *
 *  Resolution is DECLARATION-AWARE, because a fallback only fires when the name in front of it is
 *  undeclared. `var(--ds-select-bg-hover, var(--ds-material-control-background-hover), …,
 *  var(--ds-surface-control))` ends on a resting name and is still alive: the middle channel is
 *  declared, so the chain stops there and the resting tail is unreachable.
 *
 *  Comparison is PER ELEMENT, not against a global idea of "rest". `record.css` rests its prose
 *  field on `--ds-color-border-secondary` and hovers it to `--ds-color-border`; against a fixed
 *  list of resting names that reads as dead, when it is exactly the quiet shift the family
 *  documents. So a state rule is judged against the base rule for the same element -- same
 *  `[data-*]` qualifiers on the final compound, no state pseudo-class -- and is an offender only
 *  when it resolves to what that element already had. */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const CORE = join(__dirname, "../../..");

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

/* Still walked from the package source root rather than the token tree: a `.css` file authored
 * outside `foundation/tokens/css` would otherwise be invisible to a drill whose own comment
 * claims to cover the package. (The ten monochrome stylesheets that motivated this were the
 * last co-located ones; they now ship as ordinary skins, so the root walk currently finds
 * nothing extra -- which is the point of keeping it.) */
const CSS_FILES = walk(CORE, [".css"]);
const TS_FILES = walk(CORE, [".ts", ".tsx"]);

/* Classic and Rustic are read-only for this programme. The scope is the Modern skin plus the
 * shared engine-agnostic presentation skin, where structures, charts and the monochrome
 * cohort's stylesheets all live. */
const IN_SCOPE = CSS_FILES.filter(
  (f) => f.includes("/engines/modern/") || f.includes("/presentation/components/"),
);

const display = (file: string): string => file.slice(CORE.length + 1);

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

/**
 * The name a pure `var()` fallback chain resolves to: the first declared one, or the terminal
 * when none is declared.
 *
 * Only a pure chain is judged. `color-mix(in srgb, var(--ds-color-primary) 5%,
 * var(--ds-surface-card))` also mentions a resting name, but it is a tint computed OVER rest --
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

/** `border: 1px solid var(--x)` also sets border-color; the shorthand has to be read as one. */
function colorPart(property: string, value: string): { property: string; value: string } | null {
  if (property === "border-color" || property === "background" || property === "background-color") {
    return { property: property === "background-color" ? "background" : property, value };
  }
  if (property === "border") {
    const match = value.match(/var\(.*\)\s*$/);
    return match ? { property: "border-color", value: match[0] } : null;
  }
  return null;
}

/**
 * The element a rule paints, as the `[data-*]` qualifiers on its final compound selector.
 *
 * Pseudo-classes are dropped so `…[data-part='field'][data-mono='false']:hover` and its base rule
 * key identically, while `[data-mono='true']` stays a different element from `[data-mono='false']`.
 * Returns null for a selector with no data qualifier, which cannot be matched to a base rule and
 * is therefore never judged.
 */
/**
 * A selector with its functional pseudo-class arguments removed.
 *
 * `:not([data-active='true'])` NEGATES a qualifier. Reading it as one keyed the command palette's
 * hover to its own active rule and reported a real repaint as dead; reading it as a disabled
 * marker exempted every field family whose hover is gated `:not([data-disabled='true'])`, which
 * silently switched this whole drill off. Both readings must go through here.
 */
const withoutPseudoArgs = (selector: string): string =>
  selector.replace(/:(?:not|is|where|has)\([^()]*\)/g, "");

/**
 * A selector with only its NEGATIONS removed.
 *
 * `:where(:hover)` is a real hover. Stripping it the way a negation is stripped made the tag-input
 * hover rule read as a base rule, which then became that element's "resting" border -- and the
 * `:active` twin beside it, painting the same correct value, got reported as dead. State detection
 * must keep positive `:is`/`:where` contents; only `:not` says "this element is NOT that".
 */
const withoutNegations = (selector: string): string => selector.replace(/:not\([^()]*\)/g, "");

function elementKey(selector: string): string | null {
  const finalCompound = withoutPseudoArgs(selector).split(",")[0].trim().split(/\s+|>/).filter(Boolean).pop() ?? "";
  const qualifiers = [...finalCompound.matchAll(/\[[^\]]+\]/g)]
    .map((m) => m[0])
    .filter((q) => q.startsWith("[data-"));
  return qualifiers.length > 0 ? qualifiers.sort().join("") : null;
}

/**
 * A state rule on a disabled or inert element that restores the resting paint is CANCELLING a
 * broader hover, which is the correct treatment -- a disabled row must not react to the pointer.
 */
const cancelsStateDeliberately = (selector: string): boolean =>
  /\[aria-disabled=['"]?true|\[data-disabled=['"]?true|:disabled|\[aria-readonly=['"]?true|\[data-readonly=['"]?true/.test(
    withoutNegations(selector),
  );

/** The two states this drill judges. */
const isJudgedState = (selector: string): boolean => /:hover|:active/.test(withoutNegations(selector));

/**
 * Any state at all, for the purpose of deciding what an element looks like AT REST.
 *
 * `:focus` counts. Leaving it out let the focus border overwrite the resting border in the map,
 * so the hover comparison had nothing true to compare against and the drill went quiet on the
 * very defect it was built for.
 */
const isAnyStateRule = (selector: string): boolean =>
  /:hover|:active|:focus|:checked|:visited|:target|:disabled|:indeterminate|\[data-active=|\[data-selected=|\[data-open=|\[aria-selected=|\[aria-expanded=/.test(
    withoutNegations(selector),
  );

interface Rule {
  selector: string;
  declarations: [string, string][];
}

function rules(css: string): Rule[] {
  const out: Rule[] = [];
  for (const rule of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const declarations: [string, string][] = [];
    for (const declaration of rule[2].matchAll(/(^|[\s;])([a-z-]+)\s*:\s*([^;]+)/g)) {
      declarations.push([declaration[2], declaration[3].trim()]);
    }
    if (declarations.length > 0) out.push({ selector: rule[1].trim(), declarations });
  }
  return out;
}

describe("Modern state channels resolve to something other than rest", () => {
  const declared = declaredNames();

  it("indexes a real corpus, so a pass cannot come from scanning nothing", () => {
    expect(IN_SCOPE.length).toBeGreaterThan(200);
    expect(declared.size).toBeGreaterThan(1000);
    const stateRules = IN_SCOPE.reduce(
      (n, f) => n + rules(blankComments(readFileSync(f, "utf8"))).filter((r) => isJudgedState(r.selector)).length,
      0,
    );
    expect(stateRules).toBeGreaterThan(100);
  });

  it("finds no hover or active rule that repaints an element to the value it already had", () => {
    const offenders: string[] = [];
    for (const file of IN_SCOPE) {
      const parsed = rules(blankComments(readFileSync(file, "utf8")));

      /* What each element already looks like, from the rules that carry no state pseudo-class. */
      const restingByElement = new Map<string, Map<string, string>>();
      for (const rule of parsed) {
        if (isAnyStateRule(rule.selector)) continue;
        const key = elementKey(rule.selector);
        if (!key) continue;
        for (const [property, value] of rule.declarations) {
          const paint = colorPart(property, value);
          if (!paint) continue;
          const source = resolvedSource(paint.value, declared);
          if (!source) continue;
          if (!restingByElement.has(key)) restingByElement.set(key, new Map());
          restingByElement.get(key)!.set(paint.property, source);
        }
      }

      for (const rule of parsed) {
        if (!isJudgedState(rule.selector)) continue;
        if (cancelsStateDeliberately(rule.selector)) continue;
        const key = elementKey(rule.selector);
        const resting = key ? restingByElement.get(key) : undefined;
        if (!resting) continue;

        const dead: string[] = [];
        let live = false;
        for (const [property, value] of rule.declarations) {
          const paint = colorPart(property, value);
          const source = paint ? resolvedSource(paint.value, declared) : null;
          if (paint && source && resting.get(paint.property) === source) {
            dead.push(`${property}: ${value}`);
          } else {
            live = true;
          }
        }
        // A rule that also moves background, colour or shadow is composing its hover
        // deliberately -- holding the border steady there is a decision, not a dead
        // chain. Only a rule with nothing left alive is a defect.
        if (dead.length > 0 && !live) {
          offenders.push(`${display(file)} -> ${rule.selector} { ${dead.join("; ")} }`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});
