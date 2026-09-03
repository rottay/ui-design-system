/**
 * Emission reproduces the compiler's CSS byte for byte.
 *
 * Run for a theme with two mode blocks and for one with zero, because the
 * `.filter(Boolean).join("\n\n")` grammar drops an empty base block and a naive
 * reimplementation gets the blank-line count wrong.
 */

import { describe, expect, it } from "vitest";

import type { ThemeCompilation } from "@/foundation/contracts/composition/tenants/themes/compiled";
import { themeToBrandTheme } from "@/foundation/contracts/composition/tenants/themes/iso";
import { compileBrandTheme } from "@/infrastructure/compilers/kernel/runtime/brand-theme";
import { FIRST_PARTY_THEMES } from "@/foundation/tokens/ts/presentation/brand-themes";

import { compileTheme } from "../../lowering";
import { resolveTheme } from "../../resolution";
import { resolveAdapter } from "../../../presentation/adapters";
import { containerScope, emitThemeCss, firstPartyScope, tenantArtifactScope } from "..";

const modern = resolveAdapter("modern");
const slugs = ["rottay", "bithire", "evnto"] as const;

describe("emitThemeCss reproduces cssString", () => {
  for (const slug of slugs) {
    it(`is byte-identical for ${slug}`, () => {
      const theme = FIRST_PARTY_THEMES[slug];
      const compiled = compileTheme(resolveTheme(theme), modern);
      const legacy = compileBrandTheme({
        brandTheme: themeToBrandTheme(theme),
        tenantSlug: theme.id,
      });
      expect(emitThemeCss(compiled, firstPartyScope(slug))).toBe(legacy.cssString);
    });
  }

  it("covers a theme that really has mode blocks", () => {
    const compiled = compileTheme(resolveTheme(FIRST_PARTY_THEMES.rottay), modern);
    expect(compiled.modeBlocks.length).toBeGreaterThan(0);
  });

  it("emits no leading blank line when the base block is empty", () => {
    const empty: ThemeCompilation = {
      cssVariables: {},
      modeBlocks: [
        { mode: "dark", cssVariables: { "--x": "1" }, colorScheme: "dark" },
      ],
      runtime: { personality: {}, tokenOverrides: {} },
    };
    const css = emitThemeCss(empty, firstPartyScope("rottay"));
    expect(css.startsWith("\n")).toBe(false);
    expect(css).toBe(
      "html[data-tenant='rottay'][data-theme='dark'], html[data-tenant='rottay'].dark {\n" +
        "  color-scheme: dark;\n  --x: 1;\n}"
    );
  });

  it("emits the empty string when there is nothing at all", () => {
    const nothing: ThemeCompilation = {
      cssVariables: {},
      modeBlocks: [],
      runtime: { personality: {}, tokenOverrides: {} },
    };
    expect(emitThemeCss(nothing, firstPartyScope("rottay"))).toBe("");
  });

  it("joins two mode blocks with exactly one blank line each", () => {
    const two: ThemeCompilation = {
      cssVariables: { "--a": "1" },
      colorScheme: "light",
      modeBlocks: [
        { mode: "light", cssVariables: { "--a": "2" }, colorScheme: "light" },
        { mode: "dark", cssVariables: { "--a": "3" }, colorScheme: "dark" },
      ],
      runtime: { personality: {}, tokenOverrides: {} },
    };
    expect(emitThemeCss(two, containerScope(".probe")).split("\n\n")).toHaveLength(3);
  });

  it("drops a null-valued declaration exactly as the compiler does", () => {
    const nulled = {
      cssVariables: { "--a": "1", "--b": null },
      modeBlocks: [],
      runtime: { personality: {}, tokenOverrides: {} },
    } as unknown as ThemeCompilation;
    expect(emitThemeCss(nulled, containerScope(".probe"))).toBe(
      ".probe {\n  --a: 1;\n}"
    );
  });
});

describe("the three named scopes", () => {
  it("firstPartyScope is the static artifact grammar", () => {
    const scope = firstPartyScope("bithire");
    expect(scope.baseSelector).toBe("html[data-tenant='bithire']");
    expect(scope.modeSelector("dark")).toBe(
      "html[data-tenant='bithire'][data-theme='dark'], html[data-tenant='bithire'].dark"
    );
  });

  it("tenantArtifactScope is the DB grammar at specificity (0,4,0)", () => {
    expect(tenantArtifactScope("bithire", "acme").baseSelector).toBe(
      '[data-ds-root][data-vertical="bithire"][data-tenant][data-tenant="acme"]'
    );
  });

  it("containerScope is the identity, for the preview", () => {
    expect(containerScope(".preview-root").baseSelector).toBe(".preview-root");
  });
});
