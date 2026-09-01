/**
 * Contract test for palette-derived semantic neutrals in the default theme
 * (audit TOK-01). Re-pointing a semantic token at the neutral ramp must be
 * value-preserving: each re-pointed token has to resolve, through the var()
 * graph, to exactly the literal it carried before derivation. Tokens whose
 * value matches no ramp step must stay literal (no approximation).
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const CSS_PATH = resolve(
  process.cwd(),
  "src/foundation/tokens/css/foundation/themes/default/index.css"
);

const DARK_SELECTOR = ":root[data-theme='dark']";

function parseDeclarations(section: string): Map<string, string> {
  const declarations = new Map<string, string>();
  for (const match of section.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/gi)) {
    declarations.set(match[1], match[2].replace(/\s+/g, " ").trim());
  }
  return declarations;
}

function resolveVarGraph(
  name: string,
  scope: Map<string, string>,
  depth = 0
): string {
  if (depth > 16) throw new Error(`var() cycle while resolving ${name}`);
  const value = scope.get(name);
  if (value === undefined) throw new Error(`Unknown token ${name}`);
  return value.replace(
    /var\(\s*(--[a-z0-9-]+)\s*(?:,[^)]*)?\)/gi,
    (_reference, inner: string) => resolveVarGraph(inner, scope, depth + 1)
  );
}

const css = readFileSync(CSS_PATH, "utf8");
const darkStart = css.indexOf(DARK_SELECTOR);
if (darkStart < 0) throw new Error("Dark theme block not found");
const rootScope = parseDeclarations(css.slice(0, darkStart));
const darkScope = new Map([
  ...rootScope,
  ...parseDeclarations(css.slice(darkStart)),
]);

/**
 * Pre-derivation literals of every dark-scope semantic neutral that now
 * references the neutral ramp. This map is the zero-visual-change contract:
 * it must never be regenerated from the CSS it verifies.
 */
const DARK_REPOINTED_BEFORE = {
  "--ds-color-bg-primary": "#0b1220",
  "--ds-color-bg-secondary": "#111827",
  "--ds-color-text-secondary": "#cbd5e1",
  "--ds-color-text-tertiary": "#94a3b8",
  "--ds-color-text-muted": "#94a3b8",
  "--ds-color-text-inverse": "#020617",
  "--ds-color-border-primary": "#334155",
} as const;

/**
 * Semantic neutrals whose value matches no step of their scope's neutral
 * ramp. They must stay byte-identical literals: re-pointing them at a near
 * step would silently change rendered color.
 *
 * The bare `:root` block IS the light block, so a literal here is a literal
 * light-mode value. Thirteen of these were Rottay's dark palette sitting in
 * that block; they moved to `ROOT_REWIRED` below, where each carries three
 * pins instead of this one.
 */
const NO_EXACT_STEP_LITERALS: Record<string, Record<string, string>> = {
  root: {
    "--ds-color-text-secondary": "#A0A0A5",
    // W8 (APCA remediation, reviewed): tertiary lifted #8A8A90 → #9A9AA2 to
    // keep the secondary>tertiary>muted ladder coherent after the muted
    // APCA fix. Deliberate, documented change — not a silent approximation.
    "--ds-color-text-tertiary": "#9A9AA2",
    // W8 (APCA remediation, reviewed): muted lifted #6B6B72 → #96969E to
    // reach the APCA body/ui floor on page backgrounds. Deliberate,
    // documented change — not a silent approximation.
    "--ds-color-text-muted": "#96969E",
    "--ds-color-text-disabled": "#4A4A50",
    "--ds-color-text-on-primary": "#0C0C0E",
  },
  dark: {
    "--ds-color-bg-tertiary": "#172033",
    "--ds-color-bg-elevated": "#182235",
    "--ds-color-surface": "#101826",
    "--ds-color-surface-muted": "#152033",
    "--ds-color-text-primary": "#f3f4f6",
    "--ds-color-border-secondary": "#1e293b",
  },
};

/**
 * The thirteen contaminated light seeds. Each carried a dark literal on bare
 * `:root` — a ground that painted near-black under near-white ink on any
 * untenanted light document — and now derives from the light neutral ramp,
 * which `.dark` was already doing in its own text.
 *
 * This is NOT the value-preserving contract the dark table above encodes: the
 * light value changed on purpose, because it was wrong. What is pinned is the
 * derivation, the light value it now resolves to, and the dark literal it must
 * never return to.
 */
const ROOT_REWIRED: Record<
  string,
  { derivation: string; retiredDarkLiteral: string; resolvesTo: string }
> = {
  "--ds-color-bg-primary": {
    derivation: "var(--ds-color-neutral-50)",
    retiredDarkLiteral: "#0A0A0C",
    resolvesTo: "#fafafa",
  },
  "--ds-color-bg-secondary": {
    derivation: "var(--ds-color-neutral-100)",
    retiredDarkLiteral: "#0F0F12",
    resolvesTo: "#f5f5f5",
  },
  "--ds-color-bg-tertiary": {
    derivation: "var(--ds-color-neutral-200)",
    retiredDarkLiteral: "#141417",
    resolvesTo: "#e5e5e5",
  },
  "--ds-color-bg-hover": {
    derivation: "var(--ds-color-neutral-100)",
    retiredDarkLiteral: "#18181C",
    resolvesTo: "#f5f5f5",
  },
  // Follows its own family head rather than a rung: canvas and bg-primary are
  // one surface, and a vertical that overrides the head must carry the canvas.
  "--ds-color-bg-canvas": {
    derivation: "var(--ds-color-bg-primary)",
    retiredDarkLiteral: "#0A0A0C",
    resolvesTo: "#fafafa",
  },
  "--ds-color-bg-elevated": {
    derivation: "var(--ds-color-neutral-0)",
    retiredDarkLiteral: "#18181C",
    resolvesTo: "#ffffff",
  },
  "--ds-color-bg-input": {
    derivation: "var(--ds-color-neutral-0)",
    retiredDarkLiteral: "#0F0F12",
    resolvesTo: "#ffffff",
  },
  "--ds-color-text-primary": {
    derivation: "var(--ds-color-neutral-900)",
    retiredDarkLiteral: "#ECECEC",
    resolvesTo: "#171717",
  },
  "--ds-color-border": {
    derivation: "var(--ds-color-neutral-200)",
    retiredDarkLiteral: "#1C1C20",
    resolvesTo: "#e5e5e5",
  },
  "--ds-color-border-primary": {
    derivation: "var(--ds-color-neutral-200)",
    retiredDarkLiteral: "#1C1C20",
    resolvesTo: "#e5e5e5",
  },
  "--ds-color-border-secondary": {
    derivation: "var(--ds-color-neutral-300)",
    retiredDarkLiteral: "#252529",
    resolvesTo: "#d4d4d4",
  },
  "--ds-color-border-subtle": {
    derivation: "var(--ds-color-neutral-100)",
    retiredDarkLiteral: "#161619",
    resolvesTo: "#f5f5f5",
  },
  "--ds-color-border-tertiary": {
    derivation: "var(--ds-color-neutral-100)",
    retiredDarkLiteral: "#161619",
    resolvesTo: "#f5f5f5",
  },
};

/**
 * The six seeds `.dark` did not already override. Wiring them to the light
 * ramp would have repainted dark too, so each is pinned at exactly what dark
 * resolved to before the rewire — which is the retired `:root` literal itself.
 * These are the value-preservation half of the rewire and nothing else asserts
 * them: without this table the light repair could move dark unnoticed.
 */
const DARK_PINS_HOLDING_THE_LIGHT_REWIRE: Record<string, string> = {
  "--ds-color-bg-hover": "#18181C",
  "--ds-color-bg-canvas": "#0A0A0C",
  "--ds-color-bg-input": "#0F0F12",
  "--ds-color-border": "#1C1C20",
  "--ds-color-border-subtle": "#161619",
  "--ds-color-border-tertiary": "#161619",
};

/**
 * Semantic neutrals that are DERIVED rather than literal, each with the exact
 * derivation it must carry and the literal it was rescued from.
 *
 * `--ds-color-bg-subtle` left the byte-identical ledger above deliberately. It
 * was the only member of the bg-* family that bithire and evnto never
 * override, so a literal here resolved near-black (#0D0D10) on both LIGHT
 * verticals while every sibling resolved light — measured over the shipped
 * bundles: bithire bg-primary #F4F8FB / bg-secondary #f3f2ef, evnto #FFFFFF /
 * #fafafa, subtle #0D0D10 in both. Following bg-secondary keeps ONE definition
 * and lets each vertical's own canvas carry its subtle; verticals that author a
 * literal still win by scope and order, and the fallback preserves the
 * pre-change value for any tree with no secondary canvas.
 */
const ROOT_DERIVED = {
  "--ds-color-bg-subtle": {
    derivation: "var(--ds-color-bg-secondary, #0D0D10)",
    retiredLiteral: "#0D0D10",
    /**
     * bg-secondary is pinned in ROOT_REWIRED, so this chain is anchored. It
     * terminates light now: following the family head was already the right
     * shape, and the head was the thing that was wrong.
     */
    resolvesTo: "#f5f5f5",
  },
} as const;

describe("default theme semantic neutral derivation (TOK-01)", () => {
  it("resolves every re-pointed dark semantic neutral to its pre-change literal", () => {
    for (const [token, before] of Object.entries(DARK_REPOINTED_BEFORE)) {
      expect(resolveVarGraph(token, darkScope), token).toBe(before);
    }
  });

  it("re-pointed dark semantic neutrals reference the neutral ramp, not literals", () => {
    const darkOwnScope = parseDeclarations(css.slice(darkStart));
    for (const token of Object.keys(DARK_REPOINTED_BEFORE)) {
      expect(darkOwnScope.get(token), token).toMatch(
        /^var\(--ds-color-neutral-\d+\)$/
      );
    }
  });

  it("keeps every no-exact-step semantic neutral byte-identical (no approximation)", () => {
    for (const [scopeName, expected] of Object.entries(
      NO_EXACT_STEP_LITERALS
    )) {
      const scope =
        scopeName === "root"
          ? rootScope
          : parseDeclarations(css.slice(darkStart));
      for (const [token, literal] of Object.entries(expected)) {
        expect(scope.get(token), `${scopeName} ${token}`).toBe(literal);
      }
    }
  });

  it("keeps derived semantic neutrals on their derivation, never back on the retired literal", () => {
    for (const [token, pin] of Object.entries(ROOT_DERIVED)) {
      const declared = rootScope.get(token);
      expect(declared, `root ${token}`).toBe(pin.derivation);
      // The leg that makes this pin non-vacuous: re-flattening the channel to
      // the literal it was rescued from must go red, not pass quietly.
      expect(
        declared,
        `root ${token} regressed to the retired literal ${pin.retiredLiteral} — that value resolves near-black on the light verticals`
      ).not.toBe(pin.retiredLiteral);
      // And the chain must still terminate in the canvas rung, so the
      // derivation is real rather than a var() that points nowhere.
      expect(resolveVarGraph(token, rootScope), `root ${token} chain`).toBe(
        pin.resolvesTo
      );
    }
  });

  it("wires every contaminated light seed to the ramp, never back to its dark literal", () => {
    for (const [token, pin] of Object.entries(ROOT_REWIRED)) {
      const declared = rootScope.get(token);
      expect(declared, `root ${token}`).toBe(pin.derivation);
      expect(
        declared,
        `root ${token} regressed to ${pin.retiredDarkLiteral} — a dark value in the light block`
      ).not.toBe(pin.retiredDarkLiteral);
      expect(resolveVarGraph(token, rootScope), `root ${token} chain`).toBe(
        pin.resolvesTo
      );
    }
  });

  it("keeps dark byte-identical where the light rewire would have repainted it", () => {
    const darkOwnScope = parseDeclarations(css.slice(darkStart));
    for (const [token, literal] of Object.entries(
      DARK_PINS_HOLDING_THE_LIGHT_REWIRE
    )) {
      expect(darkOwnScope.get(token), `dark ${token}`).toBe(literal);
    }
  });

  it("confirms the no-exact-step ledger against the ramp of each scope", () => {
    const ramps: Record<string, Map<string, string>> = {
      root: rootScope,
      dark: darkScope,
    };
    for (const [scopeName, expected] of Object.entries(
      NO_EXACT_STEP_LITERALS
    )) {
      const scope = ramps[scopeName];
      const stepValues = new Set<string>();
      for (const [token] of scope) {
        if (/^--ds-color-neutral-(?:0|\d+)$/.test(token)) {
          stepValues.add(resolveVarGraph(token, scope).toLowerCase());
        }
      }
      for (const [token, literal] of Object.entries(expected)) {
        expect(
          stepValues.has(literal.toLowerCase()),
          `${scopeName} ${token} now has an exact neutral step; re-point it`
        ).toBe(false);
      }
    }
  });
});
