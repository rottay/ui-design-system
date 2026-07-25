import { describe, expect, it } from "vitest";
import {
  RAMP_STEPS,
  deriveOklchRamp,
} from "@/foundation/kernel/color/oklch/ramp";
import { appearanceToVariables, deriveAppearanceColorRamps } from "..";

const LIGHT_SEED = "#2F6B9A";
const DARK_SEED = "#7FB2DA";
const DARK_GROUND = "#101014";

describe("W4 type-scale and radius-scale dial emission", () => {
  it("emits --ds-type-scale and --ds-radius-scale from the general dials", () => {
    const vars = appearanceToVariables({
      general: {
        typography: { scale: 0.96 },
        shape: { radiusScale: 1.1 },
      },
    });
    expect(vars["--ds-type-scale"]).toBe("0.96");
    expect(vars["--ds-radius-scale"]).toBe("1.1");
  });

  it("clamps runtime dial values to the contract bounds", () => {
    const vars = appearanceToVariables({
      general: {
        typography: { scale: 4 },
        shape: { radiusScale: 0.1 },
      },
    });
    expect(vars["--ds-type-scale"]).toBe("1.1");
    expect(vars["--ds-radius-scale"]).toBe("0.75");
  });

  it("emits neither dial when the fields are absent", () => {
    const vars = appearanceToVariables({
      general: { typography: { fontFamilyBase: "Inter, sans-serif" } },
    });
    expect(vars["--ds-type-scale"]).toBeUndefined();
    expect(vars["--ds-radius-scale"]).toBeUndefined();
  });
});

describe("W4 coordinated surface-detail dial emission", () => {
  it("emits the general effect intensity into the shared Modern material channel", () => {
    const vars = appearanceToVariables({
      general: { surfaces: { effectIntensity: 0.42 } },
    });
    expect(vars["--ds-effect-intensity"]).toBe("0.42");
  });

  it("clamps unsafe runtime values and ignores non-finite input", () => {
    expect(
      appearanceToVariables({
        general: { surfaces: { effectIntensity: 3 } },
      })["--ds-effect-intensity"]
    ).toBe("1");
    expect(
      appearanceToVariables({
        general: { surfaces: { effectIntensity: -2 } },
      })["--ds-effect-intensity"]
    ).toBe("0");
    expect(
      appearanceToVariables({
        general: { surfaces: { effectIntensity: Number.NaN } },
      })["--ds-effect-intensity"]
    ).toBeUndefined();
  });
});

describe("W4 overlay chrome parity", () => {
  it("projects DB-owned tooltip and popover chrome into engine variables", () => {
    const vars = appearanceToVariables({
      advanced: {
        chrome: {
          tooltip: {
            borderedBackground: "#142238",
            borderedRadius: "0.35rem",
            enterDuration: "180ms",
          },
          popover: {
            borderedBackground: "#FFFCF6",
            borderedMutedForeground: "#6F665C",
            comfortablePaddingInline: "1.1rem",
          },
        },
      },
    });

    expect(vars["--ds-tooltip-bordered-background"]).toBe("#142238");
    expect(vars["--ds-tooltip-bordered-radius"]).toBe("0.35rem");
    expect(vars["--ds-tooltip-enter-duration"]).toBe("180ms");
    expect(vars["--ds-popover-bordered-background"]).toBe("#FFFCF6");
    expect(vars["--ds-popover-bordered-muted-foreground"]).toBe("#6F665C");
    expect(vars["--ds-popover-comfortable-padding-inline"]).toBe("1.1rem");
  });
});

describe("W4 dual-ramp light-dark emission", () => {
  const dualGeneral = {
    palette: {
      primary: LIGHT_SEED,
      backgroundMode: "auto" as const,
      dark: { primary: DARK_SEED, background: DARK_GROUND },
    },
  };

  it("emits light-dark() ramp steps from both honest ramps under auto", () => {
    const vars = appearanceToVariables({ general: dualGeneral });
    const lightRamp = deriveOklchRamp(LIGHT_SEED, "#FFFFFF", "light");
    const darkRamp = deriveOklchRamp(DARK_SEED, DARK_GROUND, "dark");
    for (const step of RAMP_STEPS) {
      expect(vars[`--ds-color-primary-${step}`]).toBe(
        `light-dark(${lightRamp[step]}, ${darkRamp[step]})`
      );
    }
    expect(vars["--ds-color-primary"]).toBe(
      `light-dark(${LIGHT_SEED}, ${DARK_SEED})`
    );
    expect(vars["--ds-color-scheme"]).toBe("light dark");
  });

  it("pairs roles without an authored dark seed against their own light seed", () => {
    const vars = appearanceToVariables({
      general: {
        palette: {
          primary: LIGHT_SEED,
          secondary: "#8C6D46",
          backgroundMode: "auto",
          dark: { primary: DARK_SEED, background: DARK_GROUND },
        },
      },
    });
    const secondaryDarkRamp = deriveOklchRamp("#8C6D46", DARK_GROUND, "dark");
    const secondaryLightRamp = deriveOklchRamp("#8C6D46", "#FFFFFF", "light");
    expect(vars["--ds-color-secondary-500"]).toBe(
      `light-dark(${secondaryLightRamp[500]}, ${secondaryDarkRamp[500]})`
    );
    expect(vars["--ds-color-secondary"]).toBe("#8C6D46");
  });

  it("keys the dark half to the authored dark background", () => {
    const authored = deriveAppearanceColorRamps(
      {
        palette: {
          primary: LIGHT_SEED,
          backgroundMode: "auto",
          dark: { primary: DARK_SEED, background: "#201B15" },
        },
      },
      { "--ds-color-primary": LIGHT_SEED }
    );
    const fallback = deriveAppearanceColorRamps(
      {
        palette: {
          primary: LIGHT_SEED,
          backgroundMode: "auto",
          dark: { primary: DARK_SEED },
        },
      },
      { "--ds-color-primary": LIGHT_SEED }
    );
    expect(authored["--ds-color-primary-50"]).not.toBe(
      fallback["--ds-color-primary-50"]
    );
  });

  it("stays byte-stable when dark seeds are absent", () => {
    const vars = appearanceToVariables({
      general: {
        palette: { primary: LIGHT_SEED, backgroundMode: "auto" },
      },
    });
    for (const [token, value] of Object.entries(vars)) {
      expect(value.includes("light-dark("), token).toBe(false);
    }
    expect(vars["--ds-color-scheme"]).toBeUndefined();
    expect(vars["--ds-color-primary"]).toBe(LIGHT_SEED);
  });

  it("keeps single-mode tenants single-valued even when dark seeds are authored", () => {
    const vars = appearanceToVariables({
      general: {
        palette: {
          primary: LIGHT_SEED,
          backgroundMode: "dark",
          dark: { primary: DARK_SEED, background: DARK_GROUND },
        },
      },
    });
    for (const [token, value] of Object.entries(vars)) {
      expect(value.includes("light-dark("), token).toBe(false);
    }
    expect(vars["--ds-color-scheme"]).toBeUndefined();
  });
});

describe("W4 first-class canvas, reading ink and separator emission", () => {
  const light = {
    background: "#FBF6EC",
    foreground: {
      primary: "#2E261C",
      secondary: "#5C4F3D",
      muted: "#6B5B48",
      disabled: "#74644F",
    },
    border: { primary: "#C8B9A5", secondary: "#E2D9CC" },
  };
  const dark = {
    background: "#17130F",
    foreground: {
      primary: "#FFF8ED",
      secondary: "#E2D6C4",
      muted: "#C1B39F",
      disabled: "#9A8C79",
    },
    border: { primary: "#685B4A", secondary: "#40362B" },
  };

  it("emits the complete light hierarchy from General instead of raw overrides", () => {
    const vars = appearanceToVariables({
      general: { palette: { ...light, backgroundMode: "light" } },
    });
    expect(vars["--ds-color-bg-primary"]).toBe(light.background);
    expect(vars["--ds-color-bg"]).toBe(light.background);
    expect(vars["--ds-color-background"]).toBe(light.background);
    expect(vars["--ds-color-text-primary"]).toBe(light.foreground.primary);
    expect(vars["--ds-color-text-secondary"]).toBe(light.foreground.secondary);
    expect(vars["--ds-color-text-muted"]).toBe(light.foreground.muted);
    expect(vars["--ds-color-text-disabled"]).toBe(light.foreground.disabled);
    expect(vars["--ds-color-border-primary"]).toBe(light.border.primary);
    expect(vars["--ds-color-border-secondary"]).toBe(light.border.secondary);
  });

  it("selects the authored dark hierarchy in dark mode", () => {
    const vars = appearanceToVariables({
      general: { palette: { ...light, backgroundMode: "dark", dark } },
    });
    expect(vars["--ds-color-bg-primary"]).toBe(dark.background);
    expect(vars["--ds-color-text-primary"]).toBe(dark.foreground.primary);
    expect(vars["--ds-color-text-muted"]).toBe(dark.foreground.muted);
    expect(vars["--ds-color-border-primary"]).toBe(dark.border.primary);
  });

  it("emits mode-aware foundations under auto without pinning light ink", () => {
    const vars = appearanceToVariables({
      general: { palette: { ...light, backgroundMode: "auto", dark } },
    });
    expect(vars["--ds-color-bg-primary"]).toBe(
      `light-dark(${light.background}, ${dark.background})`
    );
    expect(vars["--ds-color-text-primary"]).toBe(
      `light-dark(${light.foreground.primary}, ${dark.foreground.primary})`
    );
    expect(vars["--ds-color-border-secondary"]).toBe(
      `light-dark(${light.border.secondary}, ${dark.border.secondary})`
    );
    expect(vars["--ds-color-scheme"]).toBe("light dark");
  });
});

describe("W4 generated chart series (compiler-owned, always on a concrete seed)", () => {
  it("emits ten hex series colors when a hex primary seed exists", () => {
    const vars = appearanceToVariables({
      general: { palette: { primary: LIGHT_SEED } },
    });
    for (let slot = 1; slot <= 10; slot += 1) {
      expect(vars[`--ds-chart-series-${slot}`]).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  it("emits no series without a concrete primary seed", () => {
    const vars = appearanceToVariables({ general: {} });
    for (const token of Object.keys(vars)) {
      expect(token.startsWith("--ds-chart-series-")).toBe(false);
    }
  });

  it("never rewrites the authored --ds-chart-category channel", () => {
    const vars = appearanceToVariables({
      general: { palette: { primary: LIGHT_SEED } },
      advanced: {
        tokenOverrides: { "--ds-chart-category-1": "#0F766E" },
      },
    });
    expect(vars["--ds-chart-category-1"]).toBe("#0F766E");
    expect(vars["--ds-chart-series-1"]).toMatch(/^#[0-9a-fA-F]{6}$/);
  });
});

describe("W4 typePairing preset application", () => {
  it("lets explicit free-form families win over the pairing preset", () => {
    const vars = appearanceToVariables({
      general: {
        typography: {
          typePairing: "editorial",
          fontFamilyHeading: "'Custom Serif', serif",
          fontFamilyBase: "'Custom Sans', sans-serif",
        },
      },
    });
    expect(vars["--ds-font-family-heading"]).toBe(
      "'Custom Serif', \"Noto Sans Arabic\", serif"
    );
    expect(vars["--ds-font-family-base"]).toBe(
      "'Custom Sans', \"Noto Sans Arabic\", sans-serif"
    );
  });

  it("emits the pairing families and tuned dials when no explicit family is set", () => {
    const vars = appearanceToVariables({
      general: { typography: { typePairing: "editorial" } },
    });
    expect(vars["--ds-font-family-heading"]).toContain("var(--ds-font-pack-");
    expect(vars["--ds-font-family-base"]).toContain("var(--ds-font-pack-");
    expect(vars["--ds-letter-spacing-heading"]).toBeDefined();
    expect(vars["--ds-line-height-display"]).toBeDefined();
  });
});
