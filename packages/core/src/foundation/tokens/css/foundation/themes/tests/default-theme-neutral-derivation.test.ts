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
  "src/foundation/tokens/css/foundation/themes/default.css"
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
 */
const NO_EXACT_STEP_LITERALS: Record<string, Record<string, string>> = {
  root: {
    "--ds-color-bg-primary": "#0A0A0C",
    "--ds-color-bg-secondary": "#0F0F12",
    "--ds-color-bg-tertiary": "#141417",
    "--ds-color-bg-subtle": "#0D0D10",
    "--ds-color-bg-hover": "#18181C",
    "--ds-color-bg-canvas": "#0A0A0C",
    "--ds-color-bg-elevated": "#18181C",
    "--ds-color-bg-input": "#0F0F12",
    "--ds-color-text-primary": "#ECECEC",
    "--ds-color-text-secondary": "#A0A0A5",
    "--ds-color-text-tertiary": "#8A8A90",
    "--ds-color-text-muted": "#6B6B72",
    "--ds-color-text-disabled": "#4A4A50",
    "--ds-color-text-on-primary": "#0C0C0E",
    "--ds-color-border": "#1C1C20",
    "--ds-color-border-primary": "#1C1C20",
    "--ds-color-border-secondary": "#252529",
    "--ds-color-border-subtle": "#161619",
    "--ds-color-border-tertiary": "#161619",
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
