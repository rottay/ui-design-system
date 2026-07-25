import { describe, it, expect } from "vitest";
import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";
import {
  brandThemeToTokenOverrides,
  brandThemeToPersonality,
  brandThemeToBranding,
  brandThemeToChromeVariables,
  deepMergeTokenOverrides,
  compileBrandTheme,
} from "../index";
import {
  bithireBrandTheme,
  evntoBrandTheme,
} from "@/foundation/tokens/ts/presentation/brand-themes";
import { generateTenantCss } from "@/infrastructure/compilers/runtime/tenant-css/visual-config";
import type { TenantConfig } from "@/foundation/contracts";

const MOCK_BRAND_THEME: BrandTheme = {
  id: "test-brand",
  name: "Test Brand",
  palette: {
    primaryColor: "#FF0000",
    secondaryColor: "#00FF00",
    accentColor: "#0000FF",
    darkPrimaryColor: "#CC0000",
    darkAccentColor: "#0000CC",
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

describe("brandThemeToBranding", () => {
  it("maps palette to TenantBranding color fields", () => {
    const result = brandThemeToBranding(MOCK_BRAND_THEME);
    expect(result.primaryColor).toBe("#FF0000");
    expect(result.secondaryColor).toBe("#00FF00");
    expect(result.accentColor).toBe("#0000FF");
    expect(result.darkPrimaryColor).toBe("#CC0000");
    expect(result.darkAccentColor).toBe("#0000CC");
    expect(result.successColor).toBe("#22C55E");
  });

  it("maps typography font families", () => {
    const result = brandThemeToBranding(MOCK_BRAND_THEME);
    expect(result.fontFamilyBase).toBe("Inter");
  });

  it("returns empty object when no palette or typography", () => {
    const result = brandThemeToBranding({ id: "bare", name: "Bare" });
    expect(result).toEqual({});
  });
});

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

  it("effective branding uses brandTheme palette over config.branding", () => {
    const configBranding = { companyName: "Acme", primaryColor: "#000000" };
    const btBranding = brandThemeToBranding(MOCK_BRAND_THEME);

    // Simulate: { ...configBranding, ...btBranding }
    const effective = { ...configBranding, ...btBranding };
    expect(effective.primaryColor).toBe("#FF0000"); // brandTheme wins
    expect(effective.companyName).toBe("Acme"); // identity preserved
  });
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

describe("integration: classic engine with brandTheme", () => {
  it("normalized config gives AntdConfigProvider effective colors", () => {
    // Simulate what DesignSystemProvider does: normalize config before
    // passing to TenantProvider. AntdConfigProvider reads config.branding
    // from TenantProvider context, so it must see brandTheme.palette colors.
    const tenantConfig = {
      slug: "acme",
      name: "Acme Corp",
      engine: "classic" as const,
      theme: "base",
      plan: "enterprise" as const,
      features: [],
      branding: { companyName: "Acme Corp", primaryColor: "#000000" },
      brandTheme: MOCK_BRAND_THEME,
      tokenOverrides: {
        glass: { blur: "20px" }, // partial override — should not wipe background/border
      },
    };

    // Step 1: Normalize branding (brandTheme palette wins)
    const btBranding = brandThemeToBranding(tenantConfig.brandTheme);
    const normalizedBranding = { ...tenantConfig.branding, ...btBranding };
    expect(normalizedBranding.primaryColor).toBe("#FF0000"); // brandTheme wins
    expect(normalizedBranding.companyName).toBe("Acme Corp"); // identity stays

    // Step 2: Deep-merge tokenOverrides (brandTheme + tenant partial)
    const btOverrides = brandThemeToTokenOverrides(tenantConfig.brandTheme);
    const normalizedOverrides = deepMergeTokenOverrides(
      btOverrides,
      tenantConfig.tokenOverrides
    );
    // brandTheme glass.blur is overridden by tenant, but other glass keys stay undefined
    // (brandTheme didn't set glass, so base is empty — tenant's blur is the only value)
    expect(normalizedOverrides.glass?.blur).toBe("20px");

    // brandTheme surfaces are preserved
    expect(normalizedOverrides.borderRadius?.sm).toBe("4px");
    expect(normalizedOverrides.densityScale).toBe(1.1);

    // This is what AntdConfigProvider would read from context:
    // config.branding.primaryColor === '#FF0000' (from brandTheme, not '#000000')
    expect(normalizedBranding.primaryColor).not.toBe("#000000");
  });
});

describe("compileBrandTheme", () => {
  it("produces personality from brandTheme motion/charts/chrome", () => {
    const result = compileBrandTheme({
      brandTheme: MOCK_BRAND_THEME,
      tenantSlug: "test",
    });
    expect(result.personality.animation?.intensity).toBe(0.8);
    expect(result.personality.animation?.entrance).toBe("spring");
    expect(result.personality.chart?.lineStyle).toBe("smooth");
    expect(result.personality.card?.defaultElevation).toBe("md");
  });

  it("produces tokenOverrides from brandTheme surfaces", () => {
    const result = compileBrandTheme({
      brandTheme: MOCK_BRAND_THEME,
      tenantSlug: "test",
    });
    expect(result.tokenOverrides.borderRadius?.sm).toBe("4px");
    expect(result.tokenOverrides.densityScale).toBe(1.1);
  });

  it("produces CSS variables from palette", () => {
    const result = compileBrandTheme({
      brandTheme: MOCK_BRAND_THEME,
      tenantSlug: "test",
    });
    expect(result.cssVariables["--ds-color-primary"]).toBe("#FF0000");
    expect(result.cssVariables["--ds-color-secondary"]).toBe("#00FF00");
    expect(result.cssVariables["--ds-color-accent"]).toBe("#0000FF");
  });

  it("emits the canonical scale axes explicitly for the static BitHire baseline", () => {
    const result = compileBrandTheme({
      brandTheme: bithireBrandTheme,
      tenantSlug: "bithire",
    });

    expect(result.cssVariables).toMatchObject({
      "--ds-type-scale": "1",
      "--ds-radius-scale": "1",
      "--ds-density-scale": "0.9",
    });
    expect(result.cssString).toContain("--ds-type-scale: 1;");
    expect(result.cssString).toContain("--ds-radius-scale: 1;");
    expect(result.cssString).toContain("--ds-density-scale: 0.9;");
  });

  it("produces normalized dark palette aliases", () => {
    const result = compileBrandTheme({
      brandTheme: MOCK_BRAND_THEME,
      tenantSlug: "test",
    });
    expect(result.cssVariables["--ds-color-dark-primary"]).toBe("#CC0000");
    expect(result.cssVariables["--ds-color-dark-accent"]).toBe("#0000CC");
    expect(result.cssVariables["--ds-dark-color-primary"]).toBeUndefined();
    expect(result.cssVariables["--ds-dark-color-accent"]).toBeUndefined();
  });

  it("produces scoped CSS string", () => {
    const result = compileBrandTheme({
      brandTheme: MOCK_BRAND_THEME,
      tenantSlug: "acme",
    });
    expect(result.cssString).toContain("html[data-tenant='acme']");
    expect(result.cssString).toContain("--ds-color-primary: #FF0000");
  });

  it("merges vertical baseline before brandTheme", () => {
    const result = compileBrandTheme({
      brandTheme: MOCK_BRAND_THEME,
      tenantSlug: "test",
      verticalPersonality: {
        animation: { intensity: 0.5, entrance: "fade" } as any,
      },
      verticalTokenOverrides: {
        densityScale: 0.9,
        borderRadius: { xl: "32px" },
      },
    });
    // brandTheme overrides vertical for keys it defines
    expect(result.personality.animation?.intensity).toBe(0.8); // brandTheme wins
    expect(result.personality.animation?.entrance).toBe("spring"); // brandTheme wins
    // vertical values preserved for keys brandTheme doesn't set
    expect(result.tokenOverrides.borderRadius?.xl).toBe("16px"); // brandTheme has xl: '16px'
    // brandTheme densityScale wins over vertical
    expect(result.tokenOverrides.densityScale).toBe(1.1);
  });

  it("passes through engineBridge", () => {
    const bt: BrandTheme = {
      ...MOCK_BRAND_THEME,
      engineBridge: { modern: { "--p": "oklch(0.5 0.2 250)" } },
    };
    const result = compileBrandTheme({ brandTheme: bt, tenantSlug: "test" });
    expect(result.engineBridge.modern).toEqual({ "--p": "oklch(0.5 0.2 250)" });
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
    expect(vars["--ds-radius-button"]).toBe("9px");
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
    expect(vars["--ds-radius-input"]).toBe("9px");
    expect(vars["--ds-segmented-bg"]).toBe("#f4f6f8");
    expect(vars["--ds-segmented-border"]).toBe("#d7dde5");
    expect(vars["--ds-segmented-item-bg-selected"]).toBe("#ffffff");
    expect(vars["--ds-segmented-item-font-weight-selected"]).toBe("640");
    expect(vars["--ds-segmented-sm-height"]).toBe("29px");
    expect(vars["--ds-table-padding-compact"]).toBe("6px 10px");
    expect(vars["--ds-table-padding-comfortable"]).toBe("9px 12px");
    expect(vars["--ds-tabs-list-padding"]).toBe("3px");
    expect(vars["--ds-tabs-segmented-list-bg"]).toBe("#eef3f8");
    expect(vars["--ds-tabs-item-radius"]).toBe("8px");
    expect(vars["--ds-tabs-item-font-family"]).toBe("Inter");
    expect(vars["--ds-tabs-item-font-weight-active"]).toBe("650");
    expect(vars["--ds-tabs-disabled-opacity"]).toBe("0.46");
    expect(vars["--ds-tabs-badge-height"]).toBe("17px");
    expect(vars["--ds-tabs-indicator-gradient"]).toBe(
      "linear-gradient(90deg, #345, #678)"
    );
    expect(vars["--ds-tabs-panel-radius"]).toBe("12px");
    expect(vars["--ds-tabs-overflow-control-size"]).toBe("30px");
    expect(vars["--ds-tabs-motion-duration"]).toBe("180ms");
    expect(vars["--ds-tabs-sm-height"]).toBe("30px");
  });
});

describe("parity: first-party brand pipeline", () => {
  it("bithire BrandTheme produces same palette as registry branding", () => {
    // Demonstrates that the same BrandTheme works for both first-party
    // (via registry) and DB-backed tenants (via compileBrandTheme).
    // bithireBrandTheme imported at top of file
    const branding = brandThemeToBranding(bithireBrandTheme);
    expect(branding.primaryColor).toBe("#3A6FB0");
    expect(branding.secondaryColor).toBe("#315F86");
    expect(branding.accentColor).toBe("#86A6C2");
  });

  it("DB-backed tenant uses same pipeline as first-party", () => {
    // Hypothetical DB tenant with the same BrandTheme as bithire
    // bithireBrandTheme imported at top of file
    const dbTenantResult = compileBrandTheme({
      brandTheme: bithireBrandTheme,
      tenantSlug: "db-customer",
    });
    const firstPartyResult = compileBrandTheme({
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

describe("parity: static generator with brandTheme", () => {
  const bithireConfig: TenantConfig = {
    slug: "bithire",
    name: "BitHire",
    engine: "classic",
    theme: "base",
    plan: "enterprise",
    features: ["*"],
    branding: {
      companyName: "BitHire",
      primaryColor: "#0A66C2",
      secondaryColor: "#004182",
      accentColor: "#7FC15E",
    },
    brandTheme: bithireBrandTheme,
  };

  it("generateTenantCss uses brandTheme palette for color variables", () => {
    const css = generateTenantCss(bithireConfig, {
      includeDarkSelector: false,
    });
    // The generator should produce color scale variables from the brandTheme palette
    expect(css).toContain("html[data-tenant='bithire']");
    // Primary color scale from #0A66C2
    expect(css).toContain("--ds-color-primary-500");
  });

  it("generateTenantCss uses brandTheme surfaces for token overrides", () => {
    const css = generateTenantCss(bithireConfig, {
      includeDarkSelector: false,
    });
    // densityScale from brandTheme.surfaces (0.9)
    expect(css).toContain("--ds-density-scale");
  });

  it("DB-backed tenant with brandTheme produces valid CSS through same generator", () => {
    const dbTenant: TenantConfig = {
      slug: "db-customer",
      name: "DB Customer",
      engine: "modern",
      theme: "base",
      plan: "pro",
      features: [],
      branding: { companyName: "DB Corp" },
      brandTheme: bithireBrandTheme, // reuse same brand
    };
    const css = generateTenantCss(dbTenant, { includeDarkSelector: false });
    expect(css).toContain("html[data-tenant='db-customer']");
    expect(css).toContain("--ds-color-primary-500"); // palette from brandTheme
    expect(css).toContain("--ds-density-scale"); // surfaces from brandTheme
  });

  it("tenant tokenOverrides layer on top of brandTheme in generator", () => {
    const configWithOverride: TenantConfig = {
      ...bithireConfig,
      tokenOverrides: { densityScale: 1.5 },
    };
    const css = generateTenantCss(configWithOverride, {
      includeDarkSelector: false,
    });
    // Tenant override should win
    expect(css).toContain("--ds-density-scale: 1.5");
  });

  it("generateTenantCss derives personality from brandTheme", () => {
    // A tenant with brandTheme but no legacy personality should still
    // produce --ds-personality-* CSS variables from brandTheme.motion/charts/chrome.
    const css = generateTenantCss(bithireConfig, {
      includeDarkSelector: false,
    });
    // Animation personality from brandTheme.motion
    expect(css).toContain("--ds-personality-animation-intensity");
    expect(css).toContain("--ds-personality-animation-entrance: fade");
    // Chart personality from brandTheme.charts
    expect(css).toContain("--ds-personality-chart-line-style: smooth");
    // Card personality from brandTheme.chrome.card
    expect(css).toContain("--ds-personality-card-padding-density: compact");
    // Typography personality from brandTheme.typography
    expect(css).toContain(
      "--ds-personality-typography-heading-letter-spacing: -0.025em"
    );
  });

  it("brandTheme-only tenant produces same personality vars as legacy tenant", () => {
    // A tenant with no brandTheme but explicit personality should produce
    // the same variables when values match.
    const legacyConfig: TenantConfig = {
      ...bithireConfig,
      brandTheme: undefined,
      personality: {
        animation: {
          intensity: 0.55,
          entrance: "fade",
          entranceDuration: 200,
          hoverLift: 0,
          hoverScale: 1.0,
          useSpring: false,
          springTension: 170,
          springFriction: 26,
          staggerDelay: 30,
          staggerMax: 200,
          pulseSpeed: "slow",
          skeletonStyle: "pulse",
          countUpEnabled: true,
        },
        typography: {
          headingWeightBias: "heavier",
          headingLetterSpacing: "-0.025em",
          labelStyle: "sentence",
        },
      },
    };
    const brandCss = generateTenantCss(bithireConfig, {
      includeDarkSelector: false,
    });
    const legacyCss = generateTenantCss(legacyConfig, {
      includeDarkSelector: false,
    });
    // Both should contain the same personality animation intensity
    expect(brandCss).toContain("--ds-personality-animation-intensity: 0.55");
    expect(legacyCss).toContain("--ds-personality-animation-intensity: 0.55");
    // Both should contain the same heading letter spacing
    expect(brandCss).toContain(
      "--ds-personality-typography-heading-letter-spacing: -0.025em"
    );
    expect(legacyCss).toContain(
      "--ds-personality-typography-heading-letter-spacing: -0.025em"
    );
  });

  it("partial tenant personality override preserves unrelated brandTheme dimensions", () => {
    // A tenant overrides only animation.intensity but brandTheme also defines
    // chart, card, accent, and typography. The per-dimension merge should
    // preserve all unrelated dimensions in the generated CSS.
    const configWithPartialOverride: TenantConfig = {
      ...bithireConfig,
      personality: {
        animation: { intensity: 0.9 } as any, // only override intensity
      },
    };
    const css = generateTenantCss(configWithPartialOverride, {
      includeDarkSelector: false,
    });
    // Tenant override wins for animation intensity
    expect(css).toContain("--ds-personality-animation-intensity: 0.9");
    // BrandTheme chart preserved (not wiped by partial animation override)
    expect(css).toContain("--ds-personality-chart-line-style: smooth");
    // BrandTheme card preserved
    expect(css).toContain("--ds-personality-card-padding-density: compact");
    // BrandTheme accent policy preserved. BitHire deliberately disables
    // chromatic edge rails so emphasis never depends on a colored left bar.
    expect(css).toContain("--ds-personality-accent-bar-position: none");
    // BrandTheme typography preserved
    expect(css).toContain(
      "--ds-personality-typography-heading-letter-spacing: -0.025em"
    );
    // BrandTheme animation.entrance preserved (tenant only overrode intensity)
    expect(css).toContain("--ds-personality-animation-entrance: fade");
  });

  it("vertical baseline layers before brandTheme in static generator", () => {
    // evnto vertical has the canonical slideUp entrance and spacious density,
    // borderRadius sm:10px. The bithire brandTheme overrides most of these.
    // The generator should resolve vertical -> brandTheme -> tenant.
    const configWithVertical: TenantConfig = {
      slug: "vertical-test",
      name: "Vertical Test",
      engine: "modern",
      theme: "base",
      plan: "pro",
      features: [],
      branding: { companyName: "Test" },
      vertical: "evnto",
      brandTheme: {
        id: "partial-brand",
        name: "Partial Brand",
        // Only override palette — personality comes from vertical
        palette: { primaryColor: "#FF0000" },
      },
    };
    const css = generateTenantCss(configWithVertical, {
      includeDarkSelector: false,
    });
    // Vertical personality should be present (brandTheme has no motion/charts/chrome)
    expect(css).toContain("--ds-personality-animation-entrance: slideUp"); // from evnto vertical
    expect(css).toContain("--ds-personality-animation-intensity: 1.5"); // from evnto canon
    expect(css).toContain("--ds-personality-card-padding-density: spacious"); // from evnto vertical
    // Vertical tokenOverrides should be present
    expect(css).toContain("--ds-density-scale: 1.125"); // from evnto canon
    // Palette from brandTheme
    expect(css).toContain("--ds-color-primary-500");
  });

  it("brandTheme overrides vertical personality where both define values", () => {
    const configWithBoth: TenantConfig = {
      slug: "both-test",
      name: "Both Test",
      engine: "modern",
      theme: "base",
      plan: "pro",
      features: [],
      branding: { companyName: "Test" },
      vertical: "evnto", // evnto vertical: slideUp, intensity 1.5
      brandTheme: bithireBrandTheme, // bithire: fade, intensity 0.55
    };
    const css = generateTenantCss(configWithBoth, {
      includeDarkSelector: false,
    });
    // BrandTheme wins over vertical for keys it defines
    expect(css).toContain("--ds-personality-animation-entrance: fade"); // bithire brand wins
    expect(css).toContain("--ds-personality-animation-intensity: 0.55"); // bithire brand wins
    expect(css).toContain("--ds-personality-card-padding-density: compact"); // bithire brand wins
    // BrandTheme surfaces win over vertical
    expect(css).toContain("--ds-density-scale: 0.9"); // bithire brand wins over evnto 1.125
  });

  it("legacy path resolves vertical + profile (no brandTheme)", () => {
    // evnto vertical has: slideUp, intensity 1.5, densityScale 1.125
    // evnto vertical.defaultProductProfile = 'events.organizer'
    // events.organizer derives the same structural/motion baseline.
    const legacyWithVertical: TenantConfig = {
      slug: "legacy-vertical",
      name: "Legacy Vertical",
      engine: "modern",
      theme: "base",
      plan: "pro",
      features: [],
      branding: { companyName: "Test", primaryColor: "#333333" },
      vertical: "evnto",
    };
    const css = generateTenantCss(legacyWithVertical, {
      includeDarkSelector: false,
    });
    expect(css).toContain("--ds-personality-animation-entrance: slideUp");
    expect(css).toContain("--ds-personality-animation-intensity: 1.5");
    expect(css).toContain("--ds-personality-card-padding-density: spacious"); // both have spacious
    expect(css).toContain("--ds-density-scale: 1.125");
    // Profile borderRadius applied
    expect(css).toContain("--ds-radius-sm: 10px"); // from events.organizer
    expect(css).toContain("--ds-radius-lg: 18px");
    expect(css).toContain("--ds-radius-xl: 24px");
    expect(css).not.toContain("--ds-radius-lg: 20px");
    expect(css).not.toContain("--ds-radius-xl: 28px");
  });

  it("keeps bundled and custom Evnto equal on density, radius, depth and motion", () => {
    const base = {
      name: "Evnto parity",
      engine: "modern" as const,
      theme: "base",
      plan: "pro" as const,
      features: [],
      branding: { companyName: "Evnto parity" },
      vertical: "evnto",
    };
    const bundled = generateTenantCss(
      {
        ...base,
        slug: "evnto-bundled",
        brandTheme: evntoBrandTheme,
      },
      { includeDarkSelector: false }
    );
    const custom = generateTenantCss(
      {
        ...base,
        slug: "evnto-custom",
      },
      { includeDarkSelector: false }
    );
    const axes = [
      "--ds-density-scale",
      "--ds-radius-sm",
      "--ds-radius-md",
      "--ds-radius-lg",
      "--ds-radius-xl",
      "--ds-shadow-sm",
      "--ds-shadow-md",
      "--ds-shadow-lg",
      "--ds-shadow-xl",
      "--ds-personality-animation-intensity",
      "--ds-personality-animation-entrance",
      "--ds-personality-animation-entrance-duration",
      "--ds-personality-animation-hover-lift",
      "--ds-personality-animation-hover-scale",
      "--ds-personality-animation-use-spring",
      "--ds-personality-animation-spring-tension",
      "--ds-personality-animation-spring-friction",
      "--ds-personality-animation-stagger-delay",
      "--ds-personality-animation-stagger-max",
    ];
    const valueOf = (css: string, token: string) =>
      css.match(
        new RegExp(`${token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}: ([^;]+);`)
      )?.[1];

    for (const token of axes) {
      expect(valueOf(custom, token), token).toBe(valueOf(bundled, token));
    }
  });

  it("tenant overrides win over profile in legacy path", () => {
    const legacyWithOverride: TenantConfig = {
      slug: "legacy-override",
      name: "Legacy Override",
      engine: "modern",
      theme: "base",
      plan: "pro",
      features: [],
      branding: { companyName: "Test", primaryColor: "#333333" },
      vertical: "evnto",
      personality: {
        animation: { intensity: 0.1 } as any, // tenant override
      },
    };
    const css = generateTenantCss(legacyWithOverride, {
      includeDarkSelector: false,
    });
    // Tenant wins for intensity
    expect(css).toContain("--ds-personality-animation-intensity: 0.1");
    // Profile still wins for entrance (tenant didn't override it)
    expect(css).toContain("--ds-personality-animation-entrance: slideUp");
  });
});
