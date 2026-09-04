import { describe, it, expect } from "vitest";
import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";
import { brandThemeToChromeVariables } from "@/infrastructure/compilers/runtime/theme/runtime/lowering/foundation/chrome";
import {
  brandThemeToPersonality,
  brandThemeToTokenOverrides,
  deepMergeTokenOverrides,
  mergePartialPersonality,
} from "@/infrastructure/compilers/runtime/theme/runtime/lowering/foundation/personality";
import { lowerBrandThemeFixture } from "@tests/support/theme-lowering";
import { bithireBrandTheme } from "@/foundation/tokens/ts/presentation/brand-themes";
import { getVerticalPreset } from "@/foundation/presets/verticals";
// `BrandExpressiveSelection.schemaVersion` is REQUIRED. Derived from the
// contract's own constant rather than restated as a literal, so a version bump
// moves these drills with it instead of leaving them silently on v1.
import { EXPRESSIVE_PROFILE_SCHEMA_VERSION } from "@/foundation/tokens/ts/presentation/expressive-profiles";

const MOCK_BRAND_THEME: BrandTheme = {
  id: "test-brand",
  name: "Test Brand",
  // The theme's OTHER mode (it declares no `appearance`, so its body is the
  // implicit light default) is a typed overlay now, not a `dark`-prefixed
  // pair of fields on the same palette object.
  modes: {
    dark: {
      palette: {
        primaryColor: "#CC0000",
        accentColor: "#0000CC",
      },
    },
  },
  palette: {
    primaryColor: "#FF0000",
    secondaryColor: "#00FF00",
    accentColor: "#0000FF",
    successColor: "#22C55E",
  },
  typography: {
    fontFamilyBase: "Inter",
    headingWeightBias: "heavier",
    headingLetterSpacing: "-0.02em",
    labelStyle: "uppercase",
  },
  surfaces: {
    densityScale: 1.1,
    borderRadius: { sm: "4px", md: "8px", lg: "12px", xl: "16px" },
    shadows: { sm: "0 1px 2px rgba(0,0,0,0.1)" },
  },
  motion: {
    intensity: 0.8,
    entrance: "spring",
    hoverLift: 3,
    useSpring: true,
    springTension: 200,
    staggerDelay: 40,
  },
  charts: {
    lineStyle: "smooth",
    tooltipStyle: "glass",
    useGradientFill: true,
  },
  chrome: {
    card: {
      defaultElevation: "md",
      hoverElevation: "lift-two",
      showBorder: false,
    },
    accent: {
      barPosition: "top",
      barThickness: 3,
      barStyle: "gradient",
    },
  },
};

describe("brandThemeToTokenOverrides", () => {
  it("maps surfaces to TenantTokenOverrides shape", () => {
    const result = brandThemeToTokenOverrides(MOCK_BRAND_THEME);
    expect(result.densityScale).toBe(1.1);
    expect(result.borderRadius).toEqual({
      sm: "4px",
      md: "8px",
      lg: "12px",
      xl: "16px",
    });
    expect(result.shadows).toEqual({ sm: "0 1px 2px rgba(0,0,0,0.1)" });
  });

  it("returns empty object when no surfaces", () => {
    const result = brandThemeToTokenOverrides({ id: "bare", name: "Bare" });
    expect(result).toEqual({});
  });
});

describe("brandThemeToPersonality", () => {
  it("maps motion to animation personality", () => {
    const result = brandThemeToPersonality(MOCK_BRAND_THEME);
    expect(result.animation?.intensity).toBe(0.8);
    expect(result.animation?.entrance).toBe("spring");
    expect(result.animation?.hoverLift).toBe(3);
    expect(result.animation?.useSpring).toBe(true);
    expect(result.animation?.springTension).toBe(200);
  });

  it("maps charts to chart personality", () => {
    const result = brandThemeToPersonality(MOCK_BRAND_THEME);
    expect(result.chart?.lineStyle).toBe("smooth");
    expect(result.chart?.tooltipStyle).toBe("glass");
    expect(result.chart?.useGradientFill).toBe(true);
  });

  it("maps typography to typography personality", () => {
    const result = brandThemeToPersonality(MOCK_BRAND_THEME);
    expect(result.typography?.headingWeightBias).toBe("heavier");
    expect(result.typography?.labelStyle).toBe("uppercase");
  });

  it("maps chrome.card and chrome.accent", () => {
    const result = brandThemeToPersonality(MOCK_BRAND_THEME);
    expect(result.card?.defaultElevation).toBe("md");
    expect(result.accent?.barStyle).toBe("gradient");
  });

  it("returns empty object when no visual categories", () => {
    const result = brandThemeToPersonality({ id: "bare", name: "Bare" });
    expect(result).toEqual({});
  });
});

// `brandThemeToBranding` -- the palette-to-legacy-`TenantBranding` mapper --
// is deleted, and nothing replaces it as a standalone function. The provider
// used to pre-merge a compiled BrandTheme back into `config.branding` with
// exactly this function so the classic engine's AntdConfigProvider (which
// historically read colors off `config.branding`) would see them; per that
// provider's own current comment ("this provider used to pre-merge it... one
// resolution, downstream, from the raw config. Nothing is normalized here."),
// that whole double-resolution step is retired architecturally, not merely
// renamed. The classic engine now resolves color through the SAME downstream
// chain as every other engine (`useTokens`, reading `compileTheme`'s
// `cssVariables`), not through a second `branding`-shaped normalization this
// compiler owned. There is no successor at this module's level to migrate
// `describe("brandThemeToBranding", ...)` onto.

describe("brandTheme precedence", () => {
  it("tenant tokenOverrides can override brandTheme surfaces", () => {
    // This test validates the design: brandTheme is not the final word.
    // Tenant-specific overrides must be able to layer on top.
    const btOverrides = brandThemeToTokenOverrides(MOCK_BRAND_THEME);
    const tenantOverrides = { borderRadius: { sm: "2px" } };

    // Simulate the merge chain: brandTheme -> tenant
    const merged = {
      ...btOverrides.borderRadius,
      ...tenantOverrides.borderRadius,
    };
    expect(merged.sm).toBe("2px"); // tenant wins
    expect(merged.md).toBe("8px"); // brandTheme preserved
  });

  // "effective branding uses brandTheme palette over config.branding" is
  // deleted with `brandThemeToBranding` above -- it simulated exactly the
  // retired pre-merge step, and `config.branding` no longer has a compiler-
  // level normalization to be "effective" against.
});

describe("deepMergeTokenOverrides", () => {
  it("deep-merges glass without losing base keys", () => {
    const base = {
      glass: {
        blur: "12px",
        background: "rgba(0,0,0,0.5)",
        border: "1px solid white",
      },
      gradients: {
        primary: "linear-gradient(red, blue)",
        surface: "linear-gradient(white, gray)",
      },
    };
    const override = {
      glass: { blur: "20px" }, // only override blur
    };
    const result = deepMergeTokenOverrides(base, override);
    expect(result.glass?.blur).toBe("20px"); // override wins
    expect(result.glass?.background).toBe("rgba(0,0,0,0.5)"); // base preserved
    expect(result.glass?.border).toBe("1px solid white"); // base preserved
    expect(result.gradients?.primary).toBe("linear-gradient(red, blue)"); // untouched
  });

  it("deep-merges overlays without wiping namespace", () => {
    const base = {
      overlays: {
        light: "rgba(255,255,255,0.1)",
        medium: "rgba(255,255,255,0.3)",
        heavy: "rgba(255,255,255,0.5)",
      },
    };
    const override = {
      overlays: { heavy: "rgba(255,255,255,0.9)" },
    };
    const result = deepMergeTokenOverrides(base, override);
    expect(result.overlays?.light).toBe("rgba(255,255,255,0.1)"); // base preserved
    expect(result.overlays?.heavy).toBe("rgba(255,255,255,0.9)"); // override wins
  });

  it("returns base when override is undefined", () => {
    const base = { densityScale: 1.1, glass: { blur: "8px" } };
    const result = deepMergeTokenOverrides(base, undefined);
    expect(result).toBe(base); // identity — no allocation
  });

  it("override densityScale wins over base", () => {
    const base = { densityScale: 1.1 };
    const override = { densityScale: 0.9 };
    const result = deepMergeTokenOverrides(base, override);
    expect(result.densityScale).toBe(0.9);
  });
});

// "integration: classic engine with brandTheme" is deleted in full. It
// simulated the exact two-step pre-merge (`brandThemeToBranding` then
// `deepMergeTokenOverrides` folded back into `config.branding` /
// `config.tokenOverrides` for AntdConfigProvider to read) that the runtime
// provider's own current source comments describes as retired: "this
// provider used to pre-merge it... Pre-merging meant the same chain ran
// twice on two different inputs, and the second run could not tell an
// authored tenant value from a value the first run had just derived. One
// resolution, downstream, from the raw config." The classic engine now goes
// through the same single `useTokens` resolution as every other engine; that
// resolution is not owned by this compiler module and is not this file's
// test to write.

describe("compileTheme", () => {
  it("produces personality from brandTheme motion/charts/chrome", () => {
    const result = lowerBrandThemeFixture({
      brandTheme: MOCK_BRAND_THEME,
      tenantSlug: "test",
    });
    expect(result.personality.animation?.intensity).toBe(0.8);
    expect(result.personality.animation?.entrance).toBe("spring");
    expect(result.personality.chart?.lineStyle).toBe("smooth");
    expect(result.personality.card?.defaultElevation).toBe("md");
  });

  it("produces tokenOverrides from brandTheme surfaces", () => {
    const result = lowerBrandThemeFixture({
      brandTheme: MOCK_BRAND_THEME,
      tenantSlug: "test",
    });
    expect(result.tokenOverrides.borderRadius?.sm).toBe("4px");
    expect(result.tokenOverrides.densityScale).toBe(1.1);
  });

  it("produces CSS variables from palette", () => {
    const result = lowerBrandThemeFixture({
      brandTheme: MOCK_BRAND_THEME,
      tenantSlug: "test",
    });
    expect(result.cssVariables["--ds-color-primary"]).toBe("#FF0000");
    expect(result.cssVariables["--ds-color-secondary"]).toBe("#00FF00");
    expect(result.cssVariables["--ds-color-accent"]).toBe("#0000FF");
  });

  it("emits the canonical scale axes explicitly for the static BitHire baseline", () => {
    const result = lowerBrandThemeFixture({
      brandTheme: bithireBrandTheme,
      tenantSlug: "bithire",
    });

    // C1b registered delta: bithire SELECTS rottay/bithire-technical@1, whose
    // sharp geometry retunes the radius dial to 0.85 over the neutral seed.
    // The four visible radius steps stay byte-identical because bithire
    // authors them as literals; the dial records the declared posture for
    // every non-overridden consumer.
    // R1 Cohort 1: the dial moved 0.85 -> 1.25 because BitHire's expressive
    // geometry axis moved `sharp` -> `rounded`. That is the authorized
    // direction change, not drift: the art-direction contract names the sharp,
    // hairline, flat posture as this tenant's leading contradiction against an
    // approachable professional-network north star. 'rounded' was chosen over
    // 'soft' deliberately -- The Management already holds 'soft', and taking it
    // here collapsed the geometry axis in the two-system acid test.
    // The four visible radius steps are still authored as literals by the
    // theme, so this records the declared posture for non-overridden consumers
    // rather than repainting the authored ramp. Pill CONTROLS remain forbidden
    // and are governed by the recipe profile, not by this dial.
    expect(result.cssVariables).toMatchObject({
      "--ds-type-scale": "1",
      "--ds-radius-scale": "1.25",
      "--ds-density-scale": "0.9",
    });
    expect(result.cssString).toContain("--ds-type-scale: 1;");
    // Same R1 Cohort 1 geometry move as the dial assertion above.
    expect(result.cssString).toContain("--ds-radius-scale: 1.25;");
    expect(result.cssString).toContain("--ds-density-scale: 0.9;");
  });

  it("produces a typed dark mode block instead of --ds-color-dark-* aliases", () => {
    // `--ds-color-dark-primary` / `--ds-color-dark-accent` (and the whole
    // `--ds-color-dark-{role}-{step}` ramp family) are gone; a theme's other
    // mode is now a real `CompiledBrandModeBlock`, scoped to its own
    // selector, carrying the ordinary (non-`dark`-prefixed) channel names.
    const result = lowerBrandThemeFixture({
      brandTheme: MOCK_BRAND_THEME,
      tenantSlug: "test",
    });
    expect(Object.keys(result.cssVariables).some((key) => key.startsWith("--ds-color-dark-"))).toBe(
      false,
    );
    expect(result.modeBlocks).toHaveLength(1);
    const darkBlock = result.modeBlocks![0];
    expect(darkBlock.mode).toBe("dark");
    expect(darkBlock.cssVariables["--ds-color-primary"]).toBe("#CC0000");
    expect(darkBlock.cssVariables["--ds-color-accent"]).toBe("#0000CC");
    // The light (base) block is unaffected -- it is still the theme's own
    // authored primary/accent, not the dark overlay's.
    expect(result.cssVariables["--ds-color-primary"]).toBe("#FF0000");
    expect(result.cssVariables["--ds-color-accent"]).toBe("#0000FF");
  });

  it("produces scoped CSS string", () => {
    const result = lowerBrandThemeFixture({
      brandTheme: MOCK_BRAND_THEME,
      tenantSlug: "acme",
    });
    expect(result.cssString).toContain("html[data-tenant='acme']");
    expect(result.cssString).toContain("--ds-color-primary: #FF0000");
  });

  it("merges a vertical baseline UNDER the theme's own personality and overrides", () => {
    // The retired compiler took the vertical baseline as a SECOND input. The
    // canonical lowering reads one resolved theme, in which the baseline is
    // already merged, so the merge ORDER is now the contract of the two merge
    // owners rather than of a compiler parameter. Same assertion, on the code
    // that actually decides it.
    const personality = mergePartialPersonality(
      { animation: { intensity: 0.5, entrance: "fade" } as never },
      brandThemeToPersonality(MOCK_BRAND_THEME)
    );
    const overrides = deepMergeTokenOverrides(
      { densityScale: 0.9, borderRadius: { xl: "32px" } },
      brandThemeToTokenOverrides(MOCK_BRAND_THEME)
    );
    // The theme overrides the vertical for keys it defines.
    expect(personality.animation?.intensity).toBe(0.8);
    expect(personality.animation?.entrance).toBe("spring");
    expect(overrides.borderRadius?.xl).toBe("16px");
    expect(overrides.densityScale).toBe(1.1);
  });

  it("does not project engineBridge into the compiled product", () => {
    // `engineBridge` was carried through the retired compiler's return value
    // and read by nobody. The canonical product is CSS channels plus the
    // runtime half; an engine's own library seeds are the ADAPTER's business,
    // which is why the lowering has no passthrough for them.
    const bt: BrandTheme = {
      ...MOCK_BRAND_THEME,
      engineBridge: { modern: { "--p": "oklch(0.5 0.2 250)" } },
    };
    const result = lowerBrandThemeFixture({ brandTheme: bt, tenantSlug: "test" });
    expect((result as unknown as Record<string, unknown>).engineBridge).toBeUndefined();
    expect(bt.engineBridge?.modern).toEqual({ "--p": "oklch(0.5 0.2 250)" });
  });
});

describe("brandThemeToChromeVariables", () => {
  it("emits canonical button color vars from text alias", () => {
    const vars = brandThemeToChromeVariables({
      id: "button-alias",
      name: "Button Alias",
      chrome: {
        controls: {
          buttonPrimary: { bg: "#ffffff", text: "#111111" },
          buttonSecondary: { color: "#222222", text: "#333333" },
        },
      },
    });

    expect(vars["--ds-button-primary-color"]).toBe("#111111");
    expect(vars["--ds-button-secondary-color"]).toBe("#222222");
    expect(vars["--ds-button-primary-text"]).toBeUndefined();
    expect(vars["--ds-button-secondary-text"]).toBeUndefined();
  });

  it("emits premium card variant chrome and listing grid vars", () => {
    const vars = brandThemeToChromeVariables({
      id: "premium-cards",
      name: "Premium Cards",
      chrome: {
        workspaceCard: {
          bg: "linear-gradient(#fff, #f7f9ff)",
          footerBg: "#f7f9ff",
        },
        compactCard: {
          padding: "10px",
        },
        tallCard: {
          minHeight: "280px",
        },
        collectionCard: {
          selectedBorder: "#0055ff",
        },
        listingGrid: {
          gap: "18px",
          minCardWidth: "300px",
        },
        metricCard: {
          valueHoverColor: "#0055ff",
          trendColorError: "#cc0000",
        },
        signalCard: {
          accent: "#0055ff",
          shadowHover: "0 12px 28px rgba(0,0,0,0.12)",
        },
      },
    });

    expect(vars["--ds-workspace-card-footer-bg"]).toBe("#f7f9ff");
    expect(vars["--ds-compact-card-padding"]).toBe("10px");
    expect(vars["--ds-tall-card-min-height"]).toBe("280px");
    expect(vars["--ds-collection-card-selected-border"]).toBe("#0055ff");
    expect(vars["--ds-listing-grid-min-card-width"]).toBe("300px");
    expect(vars["--ds-metric-card-value-color-hover"]).toBe("#0055ff");
    expect(vars["--ds-metric-card-trend-color-error"]).toBe("#cc0000");
    expect(vars["--ds-signal-card-accent"]).toBe("#0055ff");
    expect(vars["--ds-signal-card-shadow-hover"]).toBe(
      "0 12px 28px rgba(0,0,0,0.12)"
    );
  });

  it("emits optical geometry for modern controls, tabs, and table density", () => {
    const vars = brandThemeToChromeVariables({
      id: "optical-geometry",
      name: "Optical Geometry",
      chrome: {
        controls: {
          buttonGeometry: {
            fontWeight: 620,
            letterSpacing: "-0.01em",
            gap: "6px",
            radius: "9px",
            groupGap: "7px",
            groupMobileDirection: "row",
            groupMobileGap: "11px",
            groupMobileWidth: "min(100%, 32rem)",
            iconHoverTransform: "translateX(1px)",
            labelOffsetY: "-0.02em",
            hoverFilter: "saturate(1.08)",
            focusRingOffset: "3px",
            spinnerDuration: "var(--ds-motion-attention)",
            surfaceHighlight: "linear-gradient(#fff2, transparent)",
            surfaceHighlightOpacity: "0.35",
            gradient: "linear-gradient(90deg, #123, #456)",
            aiTexture: "radial-gradient(circle, #fff2, transparent)",
            sm: { height: "31px", paddingX: "10px", fontSize: "12px" },
          },
          fieldGeometry: {
            gap: "7px",
            radius: "9px",
            md: { height: "35px", paddingX: "11px", fontSize: "13px" },
          },
          segmented: {
            bg: "#f4f6f8",
            border: "#d7dde5",
            itemBgSelected: "#ffffff",
            itemFontWeightSelected: 640,
            sm: { height: "29px", paddingX: "9px", fontSize: "12px" },
          },
        },
        table: {
          cellPaddingCompact: "6px 10px",
          cellPaddingComfortable: "9px 12px",
        },
        tabs: {
          listPadding: "3px",
          segmentedListBg: "#eef3f8",
          itemRadius: "8px",
          itemFontFamily: "Inter",
          itemFontWeightActive: 650,
          disabledOpacity: 0.46,
          badgeHeight: "17px",
          indicatorGradient: "linear-gradient(90deg, #345, #678)",
          panelRadius: "12px",
          overflowControlSize: "30px",
          motionDuration: "180ms",
          smHeight: "30px",
          smPadding: "0 10px",
        },
      },
    });

    expect(vars["--ds-button-font-weight"]).toBe("620");
    expect(vars["--ds-button-sm-height"]).toBe("31px");
    expect(vars["--ds-button-sm-padding-x"]).toBe("10px");
    // Radius channels are emitted as their own product with the tenant dial.
    // This fixture sets no radiusScale, so the divisor is 1 and the corner
    // rests at the authored 9px while staying reachable by `shape.radius-scale`.
    expect(vars["--ds-radius-button"]).toBe(
      "calc(9px * var(--ds-radius-scale, 1))"
    );
    expect(vars["--ds-button-group-gap"]).toBe("7px");
    expect(vars["--ds-button-group-mobile-direction"]).toBe("row");
    expect(vars["--ds-button-group-mobile-gap"]).toBe("11px");
    expect(vars["--ds-button-group-mobile-width"]).toBe("min(100%, 32rem)");
    expect(vars["--ds-button-icon-hover-transform"]).toBe("translateX(1px)");
    expect(vars["--ds-button-label-offset-y"]).toBe("-0.02em");
    expect(vars["--ds-button-hover-filter"]).toBe("saturate(1.08)");
    expect(vars["--ds-button-focus-ring-offset"]).toBe("3px");
    expect(vars["--ds-button-spinner-duration"]).toBe(
      "var(--ds-motion-attention)"
    );
    expect(vars["--ds-button-surface-highlight"]).toBe(
      "linear-gradient(#fff2, transparent)"
    );
    expect(vars["--ds-button-surface-highlight-opacity"]).toBe("0.35");
    expect(vars["--ds-button-gradient"]).toBe(
      "linear-gradient(90deg, #123, #456)"
    );
    expect(vars["--ds-button-ai-texture"]).toBe(
      "radial-gradient(circle, #fff2, transparent)"
    );
    expect(vars["--ds-input-md-height"]).toBe("35px");
    expect(vars["--ds-radius-input"]).toBe(
      "calc(9px * var(--ds-radius-scale, 1))"
    );
    expect(vars["--ds-segmented-bg"]).toBe("#f4f6f8");
    expect(vars["--ds-segmented-border"]).toBe("#d7dde5");
    expect(vars["--ds-segmented-item-bg-selected"]).toBe("#ffffff");
    expect(vars["--ds-segmented-item-font-weight-selected"]).toBe("640");
    expect(vars["--ds-segmented-sm-height"]).toBe("29px");
    expect(vars["--ds-table-padding-compact"]).toBe("6px 10px");
    expect(vars["--ds-table-padding-comfortable"]).toBe("9px 12px");
    expect(vars["--ds-tabs-list-padding"]).toBe("3px");
    expect(vars["--ds-tabs-segmented-list-bg"]).toBe("#eef3f8");
    expect(vars["--ds-tabs-item-radius"]).toBe(
      "calc(8px * var(--ds-radius-scale, 1))"
    );
    expect(vars["--ds-tabs-item-font-family"]).toBe("Inter");
    expect(vars["--ds-tabs-item-font-weight-active"]).toBe("650");
    expect(vars["--ds-tabs-disabled-opacity"]).toBe("0.46");
    expect(vars["--ds-tabs-badge-height"]).toBe("17px");
    expect(vars["--ds-tabs-indicator-gradient"]).toBe(
      "linear-gradient(90deg, #345, #678)"
    );
    expect(vars["--ds-tabs-panel-radius"]).toBe(
      "calc(12px * var(--ds-radius-scale, 1))"
    );
    expect(vars["--ds-tabs-overflow-control-size"]).toBe("30px");
    expect(vars["--ds-tabs-motion-duration"]).toBe("180ms");
    expect(vars["--ds-tabs-sm-height"]).toBe("30px");
  });
});

describe("parity: first-party brand pipeline", () => {
  // "bithire BrandTheme produces same palette as registry branding" is
  // deleted with `brandThemeToBranding` (see the note above the retired
  // `describe("brandThemeToBranding", ...)` block). The property it wanted
  // -- bithire's own seeds reach the compiled output -- is covered directly
  // below via `cssVariables`, and by `--ds-color-primary` assertions
  // elsewhere in this file and in `color-ramps.test.ts`.

  it("DB-backed tenant uses same pipeline as first-party", () => {
    // Hypothetical DB tenant with the same BrandTheme as bithire
    // bithireBrandTheme imported at top of file
    const dbTenantResult = lowerBrandThemeFixture({
      brandTheme: bithireBrandTheme,
      tenantSlug: "db-customer",
    });
    const firstPartyResult = lowerBrandThemeFixture({
      brandTheme: bithireBrandTheme,
      tenantSlug: "bithire",
    });
    // Same personality
    expect(dbTenantResult.personality).toEqual(firstPartyResult.personality);
    // Same token overrides
    expect(dbTenantResult.tokenOverrides).toEqual(
      firstPartyResult.tokenOverrides
    );
    // Same CSS variables (different slug in selector)
    expect(dbTenantResult.cssVariables).toEqual(firstPartyResult.cssVariables);
    // Different CSS string (different tenant slug)
    expect(dbTenantResult.cssString).toContain(
      "html[data-tenant='db-customer']"
    );
    expect(firstPartyResult.cssString).toContain("html[data-tenant='bithire']");
  });
});

/**
 * This block used to be "parity: static generator with brandTheme" and
 * exercised the retired the retired runtime tenant-CSS generator end to end against a legacy
 * TenantConfig shape: a `vertical: 'evnto'` STRING the generator looked up
 * internally, tenant-level `personality`/`tokenOverrides` PARTIALS layered on
 * top of an already-compiled result, and a `--ds-personality-*` CSS-variable
 * emission that generator alone owned. That whole conversion is gone.
 *
 * What survives at THIS compiler's level, migrated below:
 *   - compileTheme itself still turns a BrandTheme's palette/surfaces
 *     into CSS variables and a CSS string.
 *   - the vertical -> theme merge order, now asserted on the two merge owners
 *     (`mergePartialPersonality`, `deepMergeTokenOverrides`) rather than on a
 *     compiler parameter: the canonical lowering reads ONE resolved theme, in
 *     which the vertical baseline is already merged.
 *   - personality is asserted on the STRUCTURED `result.personality` object,
 *     not a `--ds-personality-*` CSS variable -- that channel-naming
 *     conversion belonged to the retired generator and compileTheme
 *     never re-implemented it.
 *
 * Deleted outright, with no successor at this compiler's level:
 *   - "tenant tokenOverrides layer on top of brandTheme in generator" and
 *     "partial tenant personality override preserves unrelated brandTheme
 *     dimensions": both simulated a tenant-level PARTIAL layered on top of an
 *     ALREADY-COMPILED brandTheme result. compileTheme has no such final
 *     tenant-override parameter (see this file's own header: "Tenant-level
 *     overrides ... are NOT applied here"); that layer is `useTokens` /
 *     `DesignSystemProvider`'s job at runtime, not this module's.
 *   - "brandTheme-only tenant produces same personality vars as legacy
 *     tenant", "legacy path resolves vertical + profile (no brandTheme)", and
 *     "tenant overrides win over profile in legacy path": all three compiled
 *     a TenantConfig with NO BrandTheme at all, resolved purely through the
 *     retired generator's vertical-string + product-profile lookup.
 *     compileTheme requires a BrandTheme; a vertical-only config never
 *     reached this compiler and still does not.
 *   - "keeps bundled and custom Evnto equal on density, radius, depth and
 *     motion": the "custom" side was exactly the no-BrandTheme legacy path
 *     above. The surviving half of its claim -- that evntoBrandTheme's own
 *     authored axes equal the single canonical source of truth
 *     (EVNTO_CANONICAL_SURFACES / EVNTO_CANONICAL_MOTION) -- is already
 *     covered by `i0-inventory.test.ts`'s "Evnto canonical visual axes" block.
 */
describe("parity: compileTheme with vertical baselines and real first-party tenants", () => {
  const evntoVertical = getVerticalPreset("evnto")!;

  it("compileTheme produces a scoped CSS string with the palette's color scale", () => {
    const result = lowerBrandThemeFixture({ brandTheme: bithireBrandTheme, tenantSlug: "bithire" });
    expect(result.cssString).toContain("html[data-tenant='bithire']");
    expect(result.cssString).toContain("--ds-color-primary-500");
  });

  it("compileTheme produces the surfaces-derived densityScale token override", () => {
    const result = lowerBrandThemeFixture({ brandTheme: bithireBrandTheme, tenantSlug: "bithire" });
    expect(result.cssString).toContain("--ds-density-scale");
    expect(result.tokenOverrides.densityScale).toBe(bithireBrandTheme.surfaces!.densityScale);
  });

  it("a DB-backed tenant reusing bithire's BrandTheme compiles the same way, under its own selector", () => {
    const result = lowerBrandThemeFixture({ brandTheme: bithireBrandTheme, tenantSlug: "db-customer" });
    expect(result.cssString).toContain("html[data-tenant='db-customer']");
    expect(result.cssString).toContain("--ds-color-primary-500");
    expect(result.cssString).toContain("--ds-density-scale");
  });

  it("compileTheme derives personality from brandTheme.motion/charts/chrome/typography", () => {
    const result = lowerBrandThemeFixture({ brandTheme: bithireBrandTheme, tenantSlug: "bithire" });
    expect(result.personality.animation?.intensity).toBe(bithireBrandTheme.motion!.intensity);
    expect(result.personality.animation?.entrance).toBe("fade");
    expect(result.personality.chart?.lineStyle).toBe("smooth");
    expect(result.personality.card?.paddingDensity).toBe("compact");
    expect(result.personality.typography?.headingLetterSpacing).toBe("-0.025em");
  });

  it("vertical baseline layers UNDER brandTheme: a palette-only brandTheme still gets the vertical's personality/tokenOverrides", () => {
    const partialBrand: BrandTheme = {
      id: "partial-brand",
      name: "Partial Brand",
      // Only override palette — personality/tokenOverrides come from the vertical.
      palette: { primaryColor: "#FF0000" },
    };
    const personality = mergePartialPersonality(
      evntoVertical.personality,
      brandThemeToPersonality(partialBrand)
    );
    const overrides = deepMergeTokenOverrides(
      evntoVertical.tokenOverrides ?? {},
      brandThemeToTokenOverrides(partialBrand)
    );
    expect(personality.animation?.entrance).toBe(evntoVertical.personality.animation?.entrance);
    expect(personality.animation?.intensity).toBe(evntoVertical.personality.animation?.intensity);
    expect(personality.card?.paddingDensity).toBe(evntoVertical.personality.card?.paddingDensity);
    expect(overrides.densityScale).toBe(evntoVertical.tokenOverrides?.densityScale);
    // Palette comes from the theme itself, not the vertical.
    const result = lowerBrandThemeFixture({
      brandTheme: partialBrand,
      tenantSlug: "vertical-test",
    });
    expect(result.cssVariables["--ds-color-primary-500"]).toBeDefined();
  });

  it("brandTheme overrides the vertical baseline for every key it defines itself", () => {
    const personality = mergePartialPersonality(
      evntoVertical.personality,
      brandThemeToPersonality(bithireBrandTheme)
    );
    const overrides = deepMergeTokenOverrides(
      evntoVertical.tokenOverrides ?? {},
      brandThemeToTokenOverrides(bithireBrandTheme)
    );
    // The theme wins over the vertical for every key it defines itself.
    expect(personality.animation?.entrance).toBe("fade");
    expect(personality.animation?.intensity).toBe(bithireBrandTheme.motion!.intensity);
    expect(personality.card?.paddingDensity).toBe("compact");
    expect(overrides.densityScale).toBe(bithireBrandTheme.surfaces!.densityScale);
    // Sanity: bithire and the evnto vertical genuinely disagree on these axes,
    // so "brandTheme wins" is actually exercised, not vacuously true.
    expect(bithireBrandTheme.motion!.intensity).not.toBe(evntoVertical.personality.animation?.intensity);
    expect(bithireBrandTheme.surfaces!.densityScale).not.toBe(evntoVertical.tokenOverrides?.densityScale);
  });
});

// ---------------------------------------------------------------------------
// B-1 — option B: the tenant floor outranks the vertical baseline
//
// Every drill uses bithire, and that is the packet's law rather than a habit:
// bithire is the ONLY first-party vertical whose baseline selects an experience
// profile AND authors the fields that profile would move. rottay and evnto
// select no profile, so a drill written on them would pass with the gate
// removed. Values are asserted, never object identity -- `resolveTenantPosture`
// returns undefined when it promotes nothing, and an identity check could not
// tell that apart from a promotion that happened to land the same value.
// ---------------------------------------------------------------------------

describe("B-1 option B: tenant floor vs vertical baseline", () => {
  const EDITORIAL = "rottay/management-editorial@1";
  const TECHNICAL = "rottay/bithire-technical@1";
  // A floor belongs to a TENANT, so it travels with that tenant's authorship.
  // These drills are about the floor's effect on posture, not about any claimed
  // leaf, so the claim set is empty -- which moves no byte on its own (proven in
  // `tests/index.test.ts`) and leaves the floor as the only variable.
  const lower = (tenantPatch?: Partial<BrandTheme>) =>
    lowerBrandThemeFixture({
      brandTheme: bithireBrandTheme,
      tenantSlug: "b1-drill",
      ...(tenantPatch
        ? { tenantPatch, tenantAuthoredPaths: new Set<string>() }
        : {}),
    } as Parameters<typeof lowerBrandThemeFixture>[0]).cssVariables;

  it("drill 1: with NO tenant floor the vertical's authoring still wins", () => {
    const vars = lower();
    // bithire authors both, and its baseline selects TECHNICAL. Before B-1 the
    // authored fields won here; they must still win, because the profile that
    // competes with them is the vertical's own, not a tenant's.
    expect(vars["--ds-letter-spacing-heading"]).toBe("-0.025em");
    expect(vars["--ds-motion-intensity"]).toBe("0.55");
  });

  it("drill 3: the vertical's OWN profile selection never promotes", () => {
    // Restating bithire's own selection as a tenant patch is a no-op the packet
    // must NOT be measured on (it would be a vacuous green), so this asserts the
    // other half: passing a patch that selects the SAME profile the baseline
    // already selects still lets the tenant floor win, because the selection now
    // arrives on the tenant floor.
    const sameProfile = lower({
      expressive: {
        schemaVersion: EXPRESSIVE_PROFILE_SCHEMA_VERSION,
        experienceProfile: TECHNICAL,
      },
    });
    expect(sameProfile["--ds-letter-spacing-heading"]).toBe("0.01em");
    // ...while the baseline's own identical selection does not:
    expect(lower()["--ds-letter-spacing-heading"]).toBe("-0.025em");
  });

  it("drill 2 + Z-4: a tenant profile wins, and the promotion is VISIBLE", () => {
    const vars = lower({
      expressive: {
        schemaVersion: EXPRESSIVE_PROFILE_SCHEMA_VERSION,
        experienceProfile: EDITORIAL,
      },
    });
    // The canonical vocabulary is the PAIRING (owner ruling): editorial's
    // headingLs is `0`. The retired `headingTracking` for that axis was `0em`.
    expect(vars["--ds-letter-spacing-heading"]).toBe("0");
    // Z-4: the promotion EXECUTED. `typePairing` is a field the tenant never
    // wrote -- it can only be here because the profile's field default was
    // promoted into the tenant floor, which is exactly the step this packet
    // adds. A run where the promotion silently did nothing cannot reach these.
    expect(vars["--ds-font-family-heading"]).toContain("editorial");
    expect(vars["--ds-line-height-display"]).toBeDefined();
  });

  it("drill 4: clamps apply to the WINNER, and winning buys nothing past them", () => {
    // motionIntensityMax is 1. A tenant asking for more still lands on 1: the
    // floor decides WHICH value competes, never whether the floor holds.
    const vars = lower({ motion: { intensity: 4 } as BrandTheme["motion"] });
    expect(Number(vars["--ds-motion-intensity"])).toBeLessThanOrEqual(1);
  });

  it("drill 5: STRUCTURAL_WIDTH channels are untouched by the tenant floor", () => {
    const before = lower();
    const after = lower({
      expressive: {
        schemaVersion: EXPRESSIVE_PROFILE_SCHEMA_VERSION,
        experienceProfile: EDITORIAL,
      },
    });
    for (const channel of [
      "--ds-sidebar-width",
      "--ds-sidebar-collapsed-width",
      "--ds-listing-grid-min-card-width",
    ]) {
      expect(after[channel]).toBe(before[channel]);
    }
  });

  it("drill 9: an EMPTY tenant floor is indistinguishable from none", () => {
    // The negative that keeps `absent => identity` honest. A patch that names
    // nothing the posture reads must not perturb a single variable, or the
    // API-shaped guarantee degrades into "almost identity".
    const none = lower();
    const empty = lower({ id: "tenant" } as Partial<BrandTheme>);
    expect(empty).toEqual(none);
  });
});
