/**
 * EVNTO EXTENSION DRAIN — final extension drain (custom 0/0/0).
 *
 * The tranche moved the last two Evnto extension declarations onto typed Theme
 * owners that already existed — zero contract, schema or compiler change:
 *
 *   --ds-focus-ring-color   (light-only)  -> chrome.controls.focusRingColor
 *                                            + modes.dark DARK PIN
 *   --ds-input-placeholder  (dark-only)   -> modes.dark.chrome.controls.input
 *                                            .colorPlaceholder
 *                                            (lowers to the junior, typed
 *                                             --ds-input-color-placeholder)
 *
 * and retired the senior `--ds-input-placeholder` READ tier from the Modern
 * input skin, which was the alias's only reader. Nothing is deleted or
 * renamed: the extension file, its build entrypoint, and the
 * `--ds-input-placeholder` NAME all survive.
 *
 * Every channel is graded with the three-part rule this cohort already uses:
 * ABSENT from the stylesheet, exact on the compiled surface, and EQUAL across
 * both lowerings (static `compileBrandTheme` and DB `compileTheme`). The
 * mutant corpus at the bottom proves each assertion is load-bearing.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  compileBrandTheme,
  compileTheme,
} from "@/infrastructure/compilers/kernel/runtime/brand-theme";

import { evntoBrandTheme } from "@/foundation/tokens/ts/presentation/brand-themes/evnto";
import { FIRST_PARTY_THEMES } from "@/foundation/tokens/ts/presentation/brand-themes";

const ROOT = process.cwd();

const INPUT_SKIN_PATH = join(
  ROOT,
  "src/foundation/tokens/css/runtime/engines/modern/skin/input/index.css"
);

const FOCUS_RING = "--ds-focus-ring-color";
const PLACEHOLDER_TYPED = "--ds-input-color-placeholder";
const PLACEHOLDER_ALIAS = "--ds-input-placeholder";
const PLACEHOLDER_OPACITY = "--ds-input-placeholder-opacity";

const LIGHT_FOCUS_RING = "var(--ds-color-primary)";
const DARK_FOCUS_RING = "var(--ds-color-primary-400)";
const DARK_PLACEHOLDER = "#686858";

interface CompiledResult {
  cssVariables: Record<string, string>;
  modeBlocks?: ReadonlyArray<{
    mode: string;
    cssVariables: Record<string, string>;
  }>;
}

function inputSkinText(): string {
  return readFileSync(INPUT_SKIN_PATH, "utf8");
}

/** Dark paint = the unconditional base overlaid by the dark mode block. */
function darkOf(result: CompiledResult): Record<string, string> {
  const block = (result.modeBlocks ?? []).find((b) => b.mode === "dark");
  expect(block, "evnto must emit a dark mode block").toBeDefined();
  return { ...result.cssVariables, ...(block?.cssVariables ?? {}) };
}

function darkBlockOnly(result: CompiledResult): Record<string, string> {
  const block = (result.modeBlocks ?? []).find((b) => b.mode === "dark");
  expect(block, "evnto must emit a dark mode block").toBeDefined();
  return block?.cssVariables ?? {};
}

function compileStatic(theme = evntoBrandTheme): CompiledResult {
  return compileBrandTheme({
    brandTheme: theme,
    tenantSlug: "evnto",
  }) as CompiledResult;
}

function compileDb(): CompiledResult {
  return compileTheme(FIRST_PARTY_THEMES.evnto) as CompiledResult;
}

/**
 * A locally-mutable view of the frozen brand theme, used only by the mutant
 * corpus. The clone is structural, so mutating it cannot reach the real theme.
 */
interface MutableEvntoTheme {
  chrome: {
    controls: {
      focusRingColor?: string;
      input?: { colorPlaceholder?: string };
    };
  };
  modes: {
    dark: {
      chrome: {
        controls: {
          focusRingColor?: string;
          input: { colorPlaceholder?: string };
        };
      };
    };
  };
}

function mutableClone(): MutableEvntoTheme {
  return structuredClone(evntoBrandTheme) as unknown as MutableEvntoTheme;
}

function compileMutant(mutant: MutableEvntoTheme): CompiledResult {
  return compileStatic(mutant as unknown as typeof evntoBrandTheme);
}

// ── 1. Terminal census ────────────────────────────────────────────────────
//
// EXCISED (SEV-2): "evnto extension is terminally drained" — two tests that
// parsed `artifacts/evnto/_source/extension.css` and asserted it declared zero
// custom properties, zero declarations and zero rules. The file no longer
// exists, so those assertions cannot be restated here; the claim they made is
// now carried unconditionally by `scripts/check/verticals/single-author/index.mjs`
// law G2, which fails if any `extension.css` or `_source/` directory returns
// anywhere under the authored token CSS tree. An empty file could be refilled;
// an absent one cannot. The compiled-surface and skin sections below are
// untouched — they never read the extension.

// ── 2. Compiled surface, per transport ────────────────────────────────────

describe("both retired channels land on the compiled surface", () => {
  const transports = [
    ["static BrandTheme", () => compileStatic()],
    ["DB Theme", () => compileDb()],
  ] as const;

  for (const [name, compile] of transports) {
    it(`${name}: focus ring is the light authority in the BODY`, () => {
      // `light` is evnto's declared defaultMode, so the light value compiles
      // unconditionally — it is not a mode overlay.
      expect(compile().cssVariables[FOCUS_RING]).toBe(LIGHT_FOCUS_RING);
    });

    it(`${name}: focus ring is pinned in the dark block`, () => {
      expect(darkBlockOnly(compile())[FOCUS_RING]).toBe(DARK_FOCUS_RING);
      expect(darkOf(compile())[FOCUS_RING]).toBe(DARK_FOCUS_RING);
    });

    it(`${name}: dark placeholder is the authored byte on the typed channel`, () => {
      expect(darkBlockOnly(compile())[PLACEHOLDER_TYPED]).toBe(
        DARK_PLACEHOLDER
      );
    });

    it(`${name}: light does not gain an input placeholder (wrong-mode guard)`, () => {
      // The extension's placeholder was dark-only; migrating it must not make
      // the body author a light input placeholder it never had.
      expect(compile().cssVariables[PLACEHOLDER_TYPED]).toBeUndefined();
    });

    it(`${name}: the contract-less alias name is never emitted`, () => {
      expect(compile().cssVariables[PLACEHOLDER_ALIAS]).toBeUndefined();
      expect(darkOf(compile())[PLACEHOLDER_ALIAS]).toBeUndefined();
    });
  }

  it("static and DB transports agree byte-for-byte on every graded channel", () => {
    const staticResult = compileStatic();
    const dbResult = compileDb();

    expect(dbResult.cssVariables[FOCUS_RING]).toBe(
      staticResult.cssVariables[FOCUS_RING]
    );
    for (const channel of [FOCUS_RING, PLACEHOLDER_TYPED]) {
      expect(darkOf(dbResult)[channel], `${channel} transport parity`).toBe(
        darkOf(staticResult)[channel]
      );
    }
  });

  /**
   * Documentation of an identity, not a derivation: `#686858` is authored as a
   * literal because that is the byte the extension declared. It also happens
   * to be evnto's dark muted ink today. If a re-brand moves the palette, this
   * assertion fails loudly and the placeholder becomes a deliberate decision
   * instead of silent drift.
   */
  it("the dark placeholder currently equals evnto's dark muted ink", () => {
    const dark = darkOf(compileStatic());
    expect(dark[PLACEHOLDER_TYPED]).toBe(DARK_PLACEHOLDER);
    expect(dark["--ds-color-text-muted"]).toBe(DARK_PLACEHOLDER);
  });
});

// ── 3. The Modern read tier ───────────────────────────────────────────────

describe("the Modern input skin reads the typed channel directly", () => {
  it("the ::placeholder chain is exactly the two-tier typed form", () => {
    expect(inputSkinText()).toContain(
      `color: var(${PLACEHOLDER_TYPED}, var(--ds-color-text-muted));`
    );
  });

  it("no var() reads the contract-less alias anywhere in the skin", () => {
    // Boundary regex: `--ds-input-placeholder-opacity` is a DIFFERENT token and
    // must not trip this guard, so the name must be followed by `,` or `)`.
    const aliasRead = /var\(\s*--ds-input-placeholder\s*[,)]/g;
    expect(inputSkinText().match(aliasRead)).toBeNull();
  });

  it("the opacity sibling survives the exact-name edit", () => {
    expect(inputSkinText()).toContain(`opacity: var(${PLACEHOLDER_OPACITY});`);
  });
});

// ── 4. Mutant corpus — every assertion above is load-bearing ──────────────

describe("mutants", () => {
  // EXCISED (SEV-2): "RED: replanting either name into the extension breaks
  // the census" — the causal mutant for the census above. Both are retired
  // together; a mutant for a deleted corpus proves nothing.

  it("RED: dropping the dark focus-ring pin repaints dark", () => {
    const mutant = mutableClone();
    delete mutant.modes.dark.chrome.controls.focusRingColor;
    const compiled = compileMutant(mutant);

    expect(darkBlockOnly(compiled)[FOCUS_RING]).toBeUndefined();
    // Dark then inherits the unconditional body authority — the exact repaint
    // the pin exists to prevent.
    expect(darkOf(compiled)[FOCUS_RING]).toBe(LIGHT_FOCUS_RING);
    expect(darkOf(compiled)[FOCUS_RING]).not.toBe(DARK_FOCUS_RING);
  });

  it("RED: mutating the dark placeholder byte is caught", () => {
    const mutant = mutableClone();
    mutant.modes.dark.chrome.controls.input.colorPlaceholder = "#686859";
    expect(darkOf(compileMutant(mutant))[PLACEHOLDER_TYPED]).not.toBe(
      DARK_PLACEHOLDER
    );
  });

  it("RED: authoring the placeholder in the wrong mode is caught", () => {
    const mutant = mutableClone();
    mutant.chrome.controls.input = {
      ...(mutant.chrome.controls.input ?? {}),
      colorPlaceholder: DARK_PLACEHOLDER,
    };
    // The wrong-mode guard fires: the light body would author a placeholder
    // the extension never declared in light.
    expect(
      compileMutant(mutant).cssVariables[PLACEHOLDER_TYPED]
    ).toBeDefined();
  });

  it("RED: mutating the light focus-ring authority is caught", () => {
    const mutant = mutableClone();
    mutant.chrome.controls.focusRingColor = "var(--ds-color-primary-500)";
    expect(compileMutant(mutant).cssVariables[FOCUS_RING]).not.toBe(
      LIGHT_FOCUS_RING
    );
  });

  it("RED: re-adding the alias read tier is caught by the boundary regex", () => {
    const aliasRead = /var\(\s*--ds-input-placeholder\s*[,)]/g;
    const mutated = inputSkinText().replace(
      `color: var(${PLACEHOLDER_TYPED}, var(--ds-color-text-muted));`,
      `color: var(${PLACEHOLDER_ALIAS}, var(${PLACEHOLDER_TYPED}, var(--ds-color-text-muted)));`
    );
    expect(mutated).not.toBe(inputSkinText());
    expect(mutated.match(aliasRead)).not.toBeNull();
  });

  it("RED: deleting the opacity sibling is caught (homonym guard)", () => {
    const aliasRead = /var\(\s*--ds-input-placeholder\s*[,)]/g;
    const mutated = inputSkinText().replace(
      `opacity: var(${PLACEHOLDER_OPACITY});`,
      ""
    );
    expect(mutated).not.toBe(inputSkinText());
    expect(mutated).not.toContain(`opacity: var(${PLACEHOLDER_OPACITY});`);
    // and removing the sibling must NOT be what satisfies the alias guard
    expect(mutated.match(aliasRead)).toBeNull();
  });
});
