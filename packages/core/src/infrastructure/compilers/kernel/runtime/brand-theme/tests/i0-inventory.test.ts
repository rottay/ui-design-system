/**
 * @fileoverview Wave I0 — Inventory And Test Net
 *
 * Protects current outputs before any physical moves or contract changes.
 * 1. Public CSS export surface — driven from real package.json exports
 * 2. First-party artifact integrity — tenant CSS files with richness checks
 * 3. H3 contract field presence — every contract field checked per vertical
 */

import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import {
  rottayBrandTheme,
  bithireBrandTheme,
  evntoBrandTheme,
} from "@/foundation/tokens/ts/presentation/brand-themes";
import {
  EVNTO_CANONICAL_MOTION,
  EVNTO_CANONICAL_SURFACES,
} from "@/foundation/presets/policy/experience-baselines/evnto";
import { PRODUCT_PROFILES } from "@/foundation/presets/product-profiles";
import { VERTICAL_REGISTRY } from "@/foundation/presets/verticals";
import { generateTenantCss } from "@/infrastructure/compilers/runtime/tenant-css/visual-config";
import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";

const DIST = resolve(process.cwd(), "dist");
const CSS_SRC = resolve(process.cwd(), "src/foundation/tokens/css");
const PKG_JSON = JSON.parse(
  readFileSync(resolve(process.cwd(), "package.json"), "utf-8")
);

describe("Evnto canonical visual axes", () => {
  const productProfile = PRODUCT_PROFILES["events.organizer"];
  const vertical = VERTICAL_REGISTRY.evnto;

  it("shares one exact immutable source across brand, profile, and vertical registries", () => {
    expect(evntoBrandTheme.surfaces).toBe(EVNTO_CANONICAL_SURFACES);
    expect(productProfile?.personality.animation).toBe(EVNTO_CANONICAL_MOTION);
    expect(vertical?.personality.animation).toBe(EVNTO_CANONICAL_MOTION);
    expect(productProfile?.tokenOverrides?.borderRadius).toBe(
      EVNTO_CANONICAL_SURFACES.borderRadius
    );
    expect(vertical?.tokenOverrides?.borderRadius).toBe(
      EVNTO_CANONICAL_SURFACES.borderRadius
    );
    expect(productProfile?.tokenOverrides?.shadows).toBe(
      EVNTO_CANONICAL_SURFACES.shadows
    );
    expect(vertical?.tokenOverrides?.shadows).toBe(
      EVNTO_CANONICAL_SURFACES.shadows
    );

    expect(Object.isFrozen(EVNTO_CANONICAL_SURFACES)).toBe(true);
    expect(Object.isFrozen(EVNTO_CANONICAL_SURFACES.borderRadius)).toBe(true);
    expect(Object.isFrozen(EVNTO_CANONICAL_SURFACES.shadows)).toBe(true);
    expect(Object.isFrozen(EVNTO_CANONICAL_SURFACES.glass)).toBe(true);
    expect(Object.isFrozen(EVNTO_CANONICAL_SURFACES.gradients)).toBe(true);
    expect(Object.isFrozen(EVNTO_CANONICAL_SURFACES.overlays)).toBe(true);
    expect(Object.isFrozen(EVNTO_CANONICAL_MOTION)).toBe(true);
  });

  it("rejects mutations without contaminating any resolution path", () => {
    expect(
      Reflect.set(EVNTO_CANONICAL_SURFACES.borderRadius, "md", "999px")
    ).toBe(false);
    expect(Reflect.set(EVNTO_CANONICAL_MOTION, "entranceDuration", 999)).toBe(
      false
    );

    expect(evntoBrandTheme.surfaces?.borderRadius?.md).toBe("14px");
    expect(productProfile?.tokenOverrides?.borderRadius?.md).toBe("14px");
    expect(vertical?.tokenOverrides?.borderRadius?.md).toBe("14px");
    expect(productProfile?.personality.animation?.entranceDuration).toBe(350);
    expect(vertical?.personality.animation?.entranceDuration).toBe(350);
  });
});

// ══════════════════════════════════════════════════════════
// SECTION 1: Public CSS Export Surface (driven from package.json)
// ══════════════════════════════════════════════════════════

describe("public CSS export surface (from package.json)", () => {
  // Parse every style subpath from the real package.json exports field
  const styleExports: Array<{
    subpath: string;
    style?: string;
    import_?: string;
    default_?: string;
  }> = [];
  for (const [subpath, value] of Object.entries(PKG_JSON.exports ?? {})) {
    if (!subpath.startsWith("./styles")) continue;
    if (typeof value === "string") {
      styleExports.push({ subpath, style: value, default_: value });
    } else if (value && typeof value === "object") {
      styleExports.push({
        subpath,
        style: (value as any).style,
        import_: (value as any).import,
        default_: (value as any).default,
      });
    }
  }

  it("package.json has exactly 7 style subpath exports", () => {
    expect(styleExports.length).toBe(7);
  });

  // Validate every condition key resolves to a real dist file
  it.each(styleExports)(
    "$subpath — all condition keys resolve to existing dist file",
    ({ subpath, style, import_, default_ }) => {
      const targets = new Set([style, import_, default_].filter(Boolean));
      expect(
        targets.size,
        `${subpath} should have at least one target`
      ).toBeGreaterThan(0);
      for (const target of targets) {
        const path = resolve(process.cwd(), target!.replace("./", ""));
        expect(existsSync(path), `${subpath} -> ${target} must exist`).toBe(
          true
        );
        const content = readFileSync(path, "utf-8");
        expect(content.length).toBeGreaterThan(1000);
      }
    }
  );

  it("./styles and ./styles.css both resolve to dist/styles.css", () => {
    const styles = styleExports.find((e) => e.subpath === "./styles");
    const stylesCss = styleExports.find((e) => e.subpath === "./styles.css");
    expect(styles?.style).toBe("./dist/styles.css");
    expect(stylesCss?.style).toBe("./dist/styles.css");
  });

  it("./styles/rottay and ./styles/platform resolve to same dist file", () => {
    const rottay = styleExports.find((e) => e.subpath === "./styles/rottay");
    const platform = styleExports.find(
      (e) => e.subpath === "./styles/platform"
    );
    expect(rottay?.style).toBe(platform?.style);
  });

  it("each style export has style + import + default condition keys", () => {
    for (const exp of styleExports) {
      expect(exp.style, `${exp.subpath} missing style key`).toBeTruthy();
      expect(exp.import_, `${exp.subpath} missing import key`).toBeTruthy();
      expect(exp.default_, `${exp.subpath} missing default key`).toBeTruthy();
    }
  });
});

// ══════════════════════════════════════════════════════════
// SECTION 2: First-Party Artifact Integrity
// ══════════════════════════════════════════════════════════

describe("first-party artifact integrity", () => {
  const TENANTS = ["rottay", "bithire", "evnto"] as const;

  it.each(TENANTS)("%s/index.css artifact exists", (tenant) => {
    expect(
      existsSync(resolve(CSS_SRC, `facade/artifacts/${tenant}/index.css`))
    ).toBe(true);
  });

  it("rottay artifact is richest (400+ unique --ds-* vars)", () => {
    const css = readFileSync(
      resolve(CSS_SRC, "facade/artifacts/rottay/index.css"),
      "utf-8"
    );
    expect(new Set(css.match(/--ds-[\w-]+/g)).size).toBeGreaterThan(400);
  });

  it("bithire artifact has substantial coverage (80+)", () => {
    const css = readFileSync(
      resolve(CSS_SRC, "facade/artifacts/bithire/index.css"),
      "utf-8"
    );
    expect(new Set(css.match(/--ds-[\w-]+/g)).size).toBeGreaterThan(80);
  });

  it("evnto artifact has substantial coverage (60+)", () => {
    const css = readFileSync(
      resolve(CSS_SRC, "facade/artifacts/evnto/index.css"),
      "utf-8"
    );
    expect(new Set(css.match(/--ds-[\w-]+/g)).size).toBeGreaterThan(60);
  });

  it.each(TENANTS)("%s artifact uses canonical button color vars", (tenant) => {
    const css = readFileSync(
      resolve(CSS_SRC, `facade/artifacts/${tenant}/index.css`),
      "utf-8"
    );
    expect(css).toContain("--ds-button-primary-color");
    expect(css).toContain("--ds-button-secondary-color");
    expect(css).not.toMatch(/--ds-button-[\w-]+-text\s*:/);
  });

  it("DB-owned tenants have no legacy CSS authority", () => {
    expect(
      existsSync(resolve(CSS_SRC, "facade/legacy/themanagementmiami/index.css"))
    ).toBe(false);
  });

  it("public entrypoint source files exist in facade/entrypoints/", () => {
    for (const f of [
      "facade/entrypoints/styles.css",
      "facade/entrypoints/platform.css",
      "facade/entrypoints/bithire.css",
      "facade/entrypoints/evnto.css",
    ]) {
      expect(existsSync(resolve(CSS_SRC, f)), `${f} must exist`).toBe(true);
    }
  });
});

// ══════════════════════════════════════════════════════════
// SECTION 3: H3 Contract — every field, every vertical
// Green for present fields, it.skip for documented gaps.
// ══════════════════════════════════════════════════════════

// ── Shared checkers for fields present in ALL three verticals ──

function checkPaletteBase(bt: BrandTheme, name: string) {
  describe(`${name} palette (base)`, () => {
    it("primaryColor", () => expect(bt.palette?.primaryColor).toBeTruthy());
    it("secondaryColor", () => expect(bt.palette?.secondaryColor).toBeTruthy());
    it("accentColor", () => expect(bt.palette?.accentColor).toBeTruthy());
    it("darkPrimaryColor", () =>
      expect(bt.palette?.darkPrimaryColor).toBeTruthy());
    it("darkSecondaryColor", () =>
      expect(bt.palette?.darkSecondaryColor).toBeTruthy());
    // A theme must own the ground for the mode it renders in. `backgroundColor`
    // is the clear-mode ground and `darkBackgroundColor` its dark twin; before
    // WO-TOK-06 only the dark name existed and light-first themes stored a
    // near-white in it. Requiring both would force a dark ground onto a product
    // that has no dark mode.
    it("declares a ground for the mode it renders in", () =>
      expect(
        bt.palette?.backgroundColor ?? bt.palette?.darkBackgroundColor
      ).toBeTruthy());
  });
}

function checkTypography(bt: BrandTheme, name: string) {
  describe(`${name} typography`, () => {
    it("fontFamilyBase", () =>
      expect(bt.typography?.fontFamilyBase).toBeTruthy());
    it("fontFamilyHeading", () =>
      expect(bt.typography?.fontFamilyHeading).toBeTruthy());
    it("fontFamilyMono", () =>
      expect(bt.typography?.fontFamilyMono).toBeTruthy());
    it("headingWeightBias", () =>
      expect(bt.typography?.headingWeightBias).toBeTruthy());
    it("headingLetterSpacing", () =>
      expect(bt.typography?.headingLetterSpacing).toBeTruthy());
    it("labelStyle", () => expect(bt.typography?.labelStyle).toBeTruthy());
  });
}

function checkMotion(bt: BrandTheme, name: string) {
  describe(`${name} motion`, () => {
    it("intensity", () => expect(bt.motion?.intensity).toBeDefined());
    it("entrance", () => expect(bt.motion?.entrance).toBeTruthy());
    it("entranceDuration", () =>
      expect(bt.motion?.entranceDuration).toBeDefined());
    it("hoverLift", () => expect(bt.motion?.hoverLift).toBeDefined());
    it("hoverScale", () => expect(bt.motion?.hoverScale).toBeDefined());
    it("useSpring", () => expect(bt.motion?.useSpring).toBeDefined());
    it("springTension", () => expect(bt.motion?.springTension).toBeDefined());
    it("springFriction", () => expect(bt.motion?.springFriction).toBeDefined());
    it("staggerDelay", () => expect(bt.motion?.staggerDelay).toBeDefined());
    it("staggerMax", () => expect(bt.motion?.staggerMax).toBeDefined());
    it("pulseSpeed", () => expect(bt.motion?.pulseSpeed).toBeTruthy());
    it("skeletonStyle", () => expect(bt.motion?.skeletonStyle).toBeTruthy());
    it("countUpEnabled", () => expect(bt.motion?.countUpEnabled).toBeDefined());
  });
}

function checkCharts(bt: BrandTheme, name: string) {
  describe(`${name} charts`, () => {
    it("lineStyle", () => expect(bt.charts?.lineStyle).toBeTruthy());
    it("tooltipStyle", () => expect(bt.charts?.tooltipStyle).toBeTruthy());
    it("useGradientFill", () =>
      expect(bt.charts?.useGradientFill).toBeDefined());
    it("showDots", () => expect(bt.charts?.showDots).toBeDefined());
    it("animateOnMount", () => expect(bt.charts?.animateOnMount).toBeDefined());
    it("mountDuration", () => expect(bt.charts?.mountDuration).toBeDefined());
  });
}

function checkSidebar(bt: BrandTheme, name: string) {
  describe(`${name} chrome.sidebar`, () => {
    it("bg", () => expect(bt.chrome?.sidebar?.bg).toBeTruthy());
    it("text", () => expect(bt.chrome?.sidebar?.text).toBeTruthy());
    it("textMuted", () => expect(bt.chrome?.sidebar?.textMuted).toBeTruthy());
    it("groupFontSize", () =>
      expect(bt.chrome?.sidebar?.groupFontSize).toBeTruthy());
    it("groupFontWeight", () =>
      expect(bt.chrome?.sidebar?.groupFontWeight).toBeDefined());
    it("groupColor", () => expect(bt.chrome?.sidebar?.groupColor).toBeTruthy());
    it("groupLetterSpacing", () =>
      expect(bt.chrome?.sidebar?.groupLetterSpacing).toBeTruthy());
    it("itemFontSize", () =>
      expect(bt.chrome?.sidebar?.itemFontSize).toBeTruthy());
    it("itemFontWeight", () =>
      expect(bt.chrome?.sidebar?.itemFontWeight).toBeDefined());
    it("itemFontWeightActive", () =>
      expect(bt.chrome?.sidebar?.itemFontWeightActive).toBeDefined());
    it("itemColor", () => expect(bt.chrome?.sidebar?.itemColor).toBeTruthy());
    it("itemColorActive", () =>
      expect(bt.chrome?.sidebar?.itemColorActive).toBeTruthy());
    it("itemBgActive", () =>
      expect(bt.chrome?.sidebar?.itemBgActive).toBeTruthy());
    it("itemBgHover", () =>
      expect(bt.chrome?.sidebar?.itemBgHover).toBeTruthy());
    it("itemPadding", () =>
      expect(bt.chrome?.sidebar?.itemPadding).toBeTruthy());
    it("iconSize", () => expect(bt.chrome?.sidebar?.iconSize).toBeTruthy());
  });
}

// ── Rottay ──

describe("H3 contract: rottay", () => {
  checkPaletteBase(rottayBrandTheme, "rottay");
  checkTypography(rottayBrandTheme, "rottay");
  checkMotion(rottayBrandTheme, "rottay");
  checkCharts(rottayBrandTheme, "rottay");
  checkSidebar(rottayBrandTheme, "rottay");

  describe("rottay surfaces", () => {
    it("densityScale", () =>
      expect(rottayBrandTheme.surfaces?.densityScale).toBeDefined());
    it("borderRadius.sm", () =>
      expect(rottayBrandTheme.surfaces?.borderRadius?.sm).toBe("6px"));
    it("borderRadius.md", () =>
      expect(rottayBrandTheme.surfaces?.borderRadius?.md).toBe("10px"));
    it("borderRadius.lg", () =>
      expect(rottayBrandTheme.surfaces?.borderRadius?.lg).toBe("14px"));
    it("borderRadius.xl", () =>
      expect(rottayBrandTheme.surfaces?.borderRadius?.xl).toBe("18px"));
    it("shadows.sm", () =>
      expect(rottayBrandTheme.surfaces?.shadows?.sm).toBeTruthy());
    it("glass (none)", () =>
      expect(rottayBrandTheme.surfaces?.glass?.blur).toBe("none"));
    it("gradients (none)", () =>
      expect(rottayBrandTheme.surfaces?.gradients?.primary).toBe("none"));
    it("overlays", () =>
      expect(rottayBrandTheme.surfaces?.overlays?.light).toBeTruthy());
  });

  describe("rottay chrome.layout", () => {
    it("bg", () => expect(rottayBrandTheme.chrome?.layout?.bg).toBeTruthy());
    it("headerBg", () =>
      expect(rottayBrandTheme.chrome?.layout?.headerBg).toBeTruthy());
    it("headerBackdrop", () =>
      expect(rottayBrandTheme.chrome?.layout?.headerBackdrop).toBeTruthy());
    it("headerBorder", () =>
      expect(rottayBrandTheme.chrome?.layout?.headerBorder).toBeTruthy());
    it("siderBg", () =>
      expect(rottayBrandTheme.chrome?.layout?.siderBg).toBeTruthy());
    it("siderBorder", () =>
      expect(rottayBrandTheme.chrome?.layout?.siderBorder).toBeTruthy());
  });

  describe("rottay chrome.shell", () => {
    it("gridSize", () =>
      expect(rottayBrandTheme.chrome?.shell?.gridSize).toBeTruthy());
    it("gridLine", () =>
      expect(rottayBrandTheme.chrome?.shell?.gridLine).toBeTruthy());
    it("gridOpacity", () =>
      expect(rottayBrandTheme.chrome?.shell?.gridOpacity).toBeDefined());
  });

  describe("rottay chrome.controls", () => {
    it("buttonPrimary.bg", () =>
      expect(
        rottayBrandTheme.chrome?.controls?.buttonPrimary?.bg
      ).toBeTruthy());
    it("buttonPrimary.bgHover", () =>
      expect(
        rottayBrandTheme.chrome?.controls?.buttonPrimary?.bgHover
      ).toBeTruthy());
    it("buttonPrimary.text", () =>
      expect(
        rottayBrandTheme.chrome?.controls?.buttonPrimary?.text
      ).toBeTruthy());
    it("buttonPrimary.border", () =>
      expect(
        rottayBrandTheme.chrome?.controls?.buttonPrimary?.border
      ).toBeTruthy());
    it("buttonPrimary.shadow", () =>
      expect(
        rottayBrandTheme.chrome?.controls?.buttonPrimary?.shadow
      ).toBeTruthy());
    it("buttonSecondary.bg", () =>
      expect(
        rottayBrandTheme.chrome?.controls?.buttonSecondary?.bg
      ).toBeTruthy());
    it("buttonSecondary.bgHover", () =>
      expect(
        rottayBrandTheme.chrome?.controls?.buttonSecondary?.bgHover
      ).toBeTruthy());
    it("buttonSecondary.text", () =>
      expect(
        rottayBrandTheme.chrome?.controls?.buttonSecondary?.text
      ).toBeTruthy());
    it("buttonSecondary.border", () =>
      expect(
        rottayBrandTheme.chrome?.controls?.buttonSecondary?.border
      ).toBeTruthy());
    it("buttonDefault.bg", () =>
      expect(
        rottayBrandTheme.chrome?.controls?.buttonDefault?.bg
      ).toBeTruthy());
    it("buttonDefault.bgHover", () =>
      expect(
        rottayBrandTheme.chrome?.controls?.buttonDefault?.bgHover
      ).toBeTruthy());
    it("buttonDefault.text", () =>
      expect(
        rottayBrandTheme.chrome?.controls?.buttonDefault?.text
      ).toBeTruthy());
    it("buttonDefault.border", () =>
      expect(
        rottayBrandTheme.chrome?.controls?.buttonDefault?.border
      ).toBeTruthy());
    it("buttonGhost.bg", () =>
      expect(rottayBrandTheme.chrome?.controls?.buttonGhost?.bg).toBeTruthy());
    it("buttonGhost.bgHover", () =>
      expect(
        rottayBrandTheme.chrome?.controls?.buttonGhost?.bgHover
      ).toBeTruthy());
    it("buttonGhost.text", () =>
      expect(
        rottayBrandTheme.chrome?.controls?.buttonGhost?.text
      ).toBeTruthy());
    it("input.bg", () =>
      expect(rottayBrandTheme.chrome?.controls?.input?.bg).toBeTruthy());
    it("input.border", () =>
      expect(rottayBrandTheme.chrome?.controls?.input?.border).toBeTruthy());
    it("input.borderFocus", () =>
      expect(
        rottayBrandTheme.chrome?.controls?.input?.borderFocus
      ).toBeTruthy());
    it("input.shadowFocus", () =>
      expect(
        rottayBrandTheme.chrome?.controls?.input?.shadowFocus
      ).toBeTruthy());
  });

  describe("rottay chrome.table", () => {
    it("headerBg", () =>
      expect(rottayBrandTheme.chrome?.table?.headerBg).toBeTruthy());
    it("headerColor", () =>
      expect(rottayBrandTheme.chrome?.table?.headerColor).toBeTruthy());
    it("headerFontWeight", () =>
      expect(rottayBrandTheme.chrome?.table?.headerFontWeight).toBeDefined());
    it("headerFontSize", () =>
      expect(rottayBrandTheme.chrome?.table?.headerFontSize).toBeTruthy());
  });

  describe("rottay palette (semantic — filled I4)", () => {
    it("successColor", () =>
      expect(rottayBrandTheme.palette?.successColor).toBe("#22C55E"));
    it("warningColor", () =>
      expect(rottayBrandTheme.palette?.warningColor).toBe("#F59E0B"));
    it("errorColor", () =>
      expect(rottayBrandTheme.palette?.errorColor).toBe("#EF4444"));
    it("infoColor", () =>
      expect(rottayBrandTheme.palette?.infoColor).toBe("#3B82F6"));
  });

  describe("rottay dark-mode (filled I4)", () => {
    // Rottay IS dark-first: darkPrimaryColor, darkBackgroundColor already in palette base.
    // Chrome values (sidebar, layout, controls, table) are authored as dark values.
    it("palette dark strategy: darkPrimaryColor", () =>
      expect(rottayBrandTheme.palette?.darkPrimaryColor).toBeTruthy());
    it("palette dark strategy: darkBackgroundColor", () =>
      expect(rottayBrandTheme.palette?.darkBackgroundColor).toBe("#0C0C0E"));
    it("sidebar is dark-authored", () =>
      expect(rottayBrandTheme.chrome?.sidebar?.bg).toBe("#0D0D10"));
    it("layout is dark-authored", () =>
      expect(rottayBrandTheme.chrome?.layout?.bg).toBe("#0C0C0E"));
    it("controls are dark-authored", () =>
      expect(rottayBrandTheme.chrome?.controls?.buttonDefault?.bg).toBe(
        "#18181B"
      ));
    it("table is dark-authored", () =>
      expect(rottayBrandTheme.chrome?.table?.headerBg).toBe("#131316"));
  });

  describe("rottay state semantics", () => {
    // success/warning/error/info: verified in palette section above
    it("disabled: opacity authored", () =>
      expect(rottayBrandTheme.chrome?.controls?.disabled?.opacity).toBe(0.4));
    it("disabled: text authored", () =>
      expect(rottayBrandTheme.chrome?.controls?.disabled?.text).toBeTruthy());
    it("disabled: all button vars emitted in generated CSS", () => {
      const css = generateTenantCss(
        {
          slug: "rottay",
          name: "Rottay",
          engine: "classic",
          theme: "base",
          plan: "enterprise",
          features: ["*"],
          branding: { companyName: "Rottay" },
          brandTheme: rottayBrandTheme,
        },
        { includeDarkSelector: false }
      );
      expect(css).toContain("--ds-button-disabled-opacity: 0.4");
      expect(css).toContain("--ds-button-disabled-bg");
      expect(css).toContain("--ds-button-disabled-color");
      expect(css).toContain("--ds-button-disabled-border:");
      expect(css).toContain("--ds-button-disabled-border-color");
    });
    it("disabled: all input vars emitted in generated CSS", () => {
      const css = generateTenantCss(
        {
          slug: "rottay",
          name: "Rottay",
          engine: "classic",
          theme: "base",
          plan: "enterprise",
          features: ["*"],
          branding: { companyName: "Rottay" },
          brandTheme: rottayBrandTheme,
        },
        { includeDarkSelector: false }
      );
      expect(css).toContain("--ds-input-bg-disabled");
      expect(css).toContain("--ds-input-color-disabled");
      expect(css).toContain("--ds-input-border-disabled");
      expect(css).toContain("--ds-input-border-color-disabled");
      expect(css).toContain("--ds-input-disabled-opacity");
    });
    it("disabled: artifact dark block matches authored values", () => {
      const artifact = readFileSync(
        resolve(CSS_SRC, "facade/artifacts/rottay/index.css"),
        "utf-8"
      );
      expect(artifact).toContain("--ds-button-disabled-opacity: 0.4");
      expect(artifact).toContain("--ds-button-disabled-bg: #18181B");
      expect(artifact).toContain("--ds-button-disabled-color: #52525B");
      expect(artifact).toContain("--ds-button-disabled-border-color: #2A2A2F");
      expect(artifact).toContain("--ds-input-bg-disabled: #18181B");
      expect(artifact).toContain("--ds-input-color-disabled: #52525B");
      expect(artifact).toContain("--ds-input-border-color-disabled: #2A2A2F");
      expect(artifact).toContain("--ds-input-disabled-opacity: 0.4");
    });
    it("disabled: artifact light block also synced (no stale values)", () => {
      const artifact = readFileSync(
        resolve(CSS_SRC, "facade/artifacts/rottay/index.css"),
        "utf-8"
      );
      // Light block has different bg values but same opacity and aliases
      expect(artifact).not.toContain("--ds-button-disabled-opacity: 0.5");
      expect(artifact).not.toContain("--ds-button-disabled-color: #C4C4C2");
      // Light block should have the aligned border-color alias
      expect(artifact).toContain("--ds-button-disabled-border-color: #E5E5E3");
      expect(artifact).toContain("--ds-input-border-color-disabled: #E5E5E3");
    });
    // focus: expressed through input focus ring
    it("focus: input has borderFocus", () =>
      expect(
        rottayBrandTheme.chrome?.controls?.input?.borderFocus
      ).toBeTruthy());
    it("focus: input has shadowFocus", () =>
      expect(
        rottayBrandTheme.chrome?.controls?.input?.shadowFocus
      ).toBeTruthy());
  });
});

// ── BitHire ──

describe("H3 contract: bithire", () => {
  checkPaletteBase(bithireBrandTheme, "bithire");
  checkTypography(bithireBrandTheme, "bithire");
  checkMotion(bithireBrandTheme, "bithire");
  checkCharts(bithireBrandTheme, "bithire");
  checkSidebar(bithireBrandTheme, "bithire");

  describe("bithire palette (semantic — present)", () => {
    it("successColor", () =>
      expect(bithireBrandTheme.palette?.successColor).toBeTruthy());
    it("warningColor", () =>
      expect(bithireBrandTheme.palette?.warningColor).toBeTruthy());
    it("errorColor", () =>
      expect(bithireBrandTheme.palette?.errorColor).toBeTruthy());
    it("infoColor", () =>
      expect(bithireBrandTheme.palette?.infoColor).toBeTruthy());
  });

  describe("bithire surfaces (filled I5)", () => {
    it("densityScale", () =>
      expect(bithireBrandTheme.surfaces?.densityScale).toBeDefined());
    it("borderRadius.sm", () =>
      expect(bithireBrandTheme.surfaces?.borderRadius?.sm).toBe("7px"));
    it("borderRadius.lg", () =>
      expect(bithireBrandTheme.surfaces?.borderRadius?.lg).toBe("14px"));
    it("shadows.sm", () =>
      expect(bithireBrandTheme.surfaces?.shadows?.sm).toBeTruthy());
    it("glass", () =>
      expect(bithireBrandTheme.surfaces?.glass?.blur).toBe("12px"));
    it("gradients", () =>
      expect(bithireBrandTheme.surfaces?.gradients?.primary).toContain(
        "linear-gradient"
      ));
    it("effect intensity", () =>
      expect(bithireBrandTheme.surfaces?.effectIntensity).toBe(0.58));
    it("overlays", () =>
      expect(bithireBrandTheme.surfaces?.overlays?.light).toBeTruthy());
  });

  describe("bithire chrome.controls", () => {
    it("buttonPrimary.bg", () =>
      expect(
        bithireBrandTheme.chrome?.controls?.buttonPrimary?.bg
      ).toBeTruthy());
    it("buttonPrimary.bgHover", () =>
      expect(
        bithireBrandTheme.chrome?.controls?.buttonPrimary?.bgHover
      ).toBeTruthy());
    it("buttonPrimary.text", () =>
      expect(
        bithireBrandTheme.chrome?.controls?.buttonPrimary?.text
      ).toBeTruthy());
    it("buttonPrimary.border", () =>
      expect(
        bithireBrandTheme.chrome?.controls?.buttonPrimary?.border
      ).toBeTruthy());
    it("buttonPrimary.shadow", () =>
      expect(
        bithireBrandTheme.chrome?.controls?.buttonPrimary?.shadow
      ).toBeTruthy());
    it("buttonSecondary.bg", () =>
      expect(
        bithireBrandTheme.chrome?.controls?.buttonSecondary?.bg
      ).toBeTruthy());
    it("buttonSecondary.bgHover", () =>
      expect(
        bithireBrandTheme.chrome?.controls?.buttonSecondary?.bgHover
      ).toBeTruthy());
    it("buttonSecondary.text", () =>
      expect(
        bithireBrandTheme.chrome?.controls?.buttonSecondary?.text
      ).toBeTruthy());
    it("buttonSecondary.border", () =>
      expect(
        bithireBrandTheme.chrome?.controls?.buttonSecondary?.border
      ).toBeTruthy());
    it("buttonDefault.bg", () =>
      expect(
        bithireBrandTheme.chrome?.controls?.buttonDefault?.bg
      ).toBeTruthy());
    it("buttonDefault.text", () =>
      expect(
        bithireBrandTheme.chrome?.controls?.buttonDefault?.text
      ).toBeTruthy());
    it("buttonGhost.bg", () =>
      expect(bithireBrandTheme.chrome?.controls?.buttonGhost?.bg).toBeTruthy());
    it("buttonGhost.text", () =>
      expect(
        bithireBrandTheme.chrome?.controls?.buttonGhost?.text
      ).toBeTruthy());
    it("disabled.opacity", () =>
      expect(bithireBrandTheme.chrome?.controls?.disabled?.opacity).toBe(0.45));
    it("disabled.text", () =>
      expect(bithireBrandTheme.chrome?.controls?.disabled?.text).toBeTruthy());
    it("input.bg", () =>
      expect(bithireBrandTheme.chrome?.controls?.input?.bg).toBeTruthy());
    it("input.border", () =>
      expect(bithireBrandTheme.chrome?.controls?.input?.border).toBeTruthy());
    it("input.borderFocus", () =>
      expect(
        bithireBrandTheme.chrome?.controls?.input?.borderFocus
      ).toBeTruthy());
    it("input.shadowFocus", () =>
      expect(
        bithireBrandTheme.chrome?.controls?.input?.shadowFocus
      ).toBeTruthy());
  });

  describe("bithire chrome.table", () => {
    it("headerBg", () =>
      expect(bithireBrandTheme.chrome?.table?.headerBg).toBeTruthy());
    it("headerColor", () =>
      expect(bithireBrandTheme.chrome?.table?.headerColor).toBeTruthy());
    it("headerFontWeight", () =>
      expect(bithireBrandTheme.chrome?.table?.headerFontWeight).toBeDefined());
    it("headerFontSize", () =>
      expect(bithireBrandTheme.chrome?.table?.headerFontSize).toBeTruthy());
  });

  describe("bithire chrome.layout (filled I5)", () => {
    it("bg", () =>
      expect(bithireBrandTheme.chrome?.layout?.bg).toBe("#F4F7FA"));
    it("headerBg", () =>
      expect(bithireBrandTheme.chrome?.layout?.headerBg).toBeTruthy());
    it("headerBackdrop", () =>
      expect(bithireBrandTheme.chrome?.layout?.headerBackdrop).toBeTruthy());
    it("headerBorder", () =>
      expect(bithireBrandTheme.chrome?.layout?.headerBorder).toBeTruthy());
    it("siderBg", () =>
      expect(bithireBrandTheme.chrome?.layout?.siderBg).toBeTruthy());
    it("siderBorder", () =>
      expect(bithireBrandTheme.chrome?.layout?.siderBorder).toBeTruthy());
  });

  describe("bithire chrome.shell (filled I5 — intentionally minimal)", () => {
    it("gridSize (none)", () =>
      expect(bithireBrandTheme.chrome?.shell?.gridSize).toBe("0px"));
    it("gridLine (transparent)", () =>
      expect(bithireBrandTheme.chrome?.shell?.gridLine).toBe("transparent"));
    it("gridOpacity (0)", () =>
      expect(bithireBrandTheme.chrome?.shell?.gridOpacity).toBe(0));
  });

  describe("bithire dark-mode (filled I5)", () => {
    // BitHire is light-first: its ground is `backgroundColor`, and its dark mode
    // takes the design system's dark ground. The near-white it used to store in
    // `darkBackgroundColor` was its CLEAR ground under a dark name.
    it("palette dark strategy: darkPrimaryColor", () =>
      expect(bithireBrandTheme.palette?.darkPrimaryColor).toBeTruthy());
    it("palette: clear ground declared", () =>
      expect(bithireBrandTheme.palette?.backgroundColor).toBe("#F4F8FB"));
    it("palette: no dark ground, so the DS default applies", () =>
      expect(bithireBrandTheme.palette?.darkBackgroundColor).toBeUndefined());
    // Sidebar is light-authored; dark treatment derives from palette.
    it("sidebar authored (light-first)", () =>
      expect(bithireBrandTheme.chrome?.sidebar?.bg).toBe("#ffffff"));
    it("layout authored", () =>
      expect(bithireBrandTheme.chrome?.layout?.bg).toBe("#F4F7FA"));
    it("controls authored", () =>
      expect(
        bithireBrandTheme.chrome?.controls?.buttonPrimary?.bg
      ).toBeTruthy());
    it("table authored", () =>
      expect(bithireBrandTheme.chrome?.table?.headerBg).toBeTruthy());
  });

  describe("bithire state semantics (filled I5)", () => {
    it("disabled: opacity authored", () =>
      expect(bithireBrandTheme.chrome?.controls?.disabled?.opacity).toBe(0.45));
    it("disabled: text authored", () =>
      expect(bithireBrandTheme.chrome?.controls?.disabled?.text).toBeTruthy());
    it("focus: input has borderFocus", () =>
      expect(
        bithireBrandTheme.chrome?.controls?.input?.borderFocus
      ).toBeTruthy());
    it("focus: input has shadowFocus", () =>
      expect(
        bithireBrandTheme.chrome?.controls?.input?.shadowFocus
      ).toBeTruthy());
  });

  describe("bithire surfaces in artifact (light + dark)", () => {
    const artifact = readFileSync(
      resolve(CSS_SRC, "facade/artifacts/bithire/index.css"),
      "utf-8"
    );
    // Split at the projected dark selector (not the :not() pseudo in the light block).
    const darkSelector =
      ':is(html[data-tenant="bithire"], :where([data-ds-root][data-vertical=\'bithire\']))[data-theme="dark"]';
    const darkIdx = artifact.indexOf(darkSelector);
    const lightBlock = darkIdx > 0 ? artifact.slice(0, darkIdx) : artifact;
    const darkBlock = darkIdx > 0 ? artifact.slice(darkIdx) : "";

    it("light: radius scale sm/md/lg/xl", () => {
      expect(lightBlock).toContain("--ds-radius-sm: 7px");
      expect(lightBlock).toContain("--ds-radius-md: 10px");
      expect(lightBlock).toContain("--ds-radius-lg: 14px");
      expect(lightBlock).toContain("--ds-radius-xl: 18px");
    });
    it("light: shadow scale matches authored source", () => {
      const authored = bithireBrandTheme.surfaces!.shadows!;
      expect(lightBlock).toContain(`--ds-shadow-sm: ${authored.sm}`);
      expect(lightBlock).toContain(`--ds-shadow-md: ${authored.md}`);
      expect(lightBlock).toContain(`--ds-shadow-lg: ${authored.lg}`);
      expect(lightBlock).toContain(`--ds-shadow-xl: ${authored.xl}`);
    });
    it("dark: radius scale matches light", () => {
      expect(darkBlock).toContain("--ds-radius-sm: 7px");
      expect(darkBlock).toContain("--ds-radius-md: 10px");
      expect(darkBlock).toContain("--ds-radius-lg: 14px");
      expect(darkBlock).toContain("--ds-radius-xl: 18px");
    });
    it("dark: shadow scale uses the authored dark elevation set", () => {
      // Dark mode carries its own compact elevation set authored in the
      // BitHire extension, using the same blue-petrol neutral authority.
      expect(darkBlock).toContain(
        "--ds-shadow-sm: 0 1px 2px rgba(20, 40, 59, 0.06)"
      );
      expect(darkBlock).toContain(
        "--ds-shadow-md: 0 4px 12px rgba(20, 40, 59, 0.08)"
      );
      expect(darkBlock).toContain(
        "--ds-shadow-lg: 0 8px 24px rgba(20, 40, 59, 0.1)"
      );
      expect(darkBlock).toContain(
        "--ds-shadow-xl: 0 16px 48px rgba(20, 40, 59, 0.12)"
      );
    });
    it("no stale 4px radius in either block", () => {
      expect(artifact).not.toContain("--ds-radius-sm: 4px");
    });
  });

  describe("bithire surfaces in generated CSS", () => {
    const css = generateTenantCss(
      {
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
      },
      { includeDarkSelector: false }
    );
    it("radius scale sm/md/lg/xl", () => {
      expect(css).toContain("--ds-radius-sm: 7px");
      expect(css).toContain("--ds-radius-md: 10px");
      expect(css).toContain("--ds-radius-lg: 14px");
      expect(css).toContain("--ds-radius-xl: 18px");
    });
    it("shadow scale sm/md/lg/xl", () => {
      expect(css).toContain("--ds-shadow-sm");
      expect(css).toContain("--ds-shadow-md");
      expect(css).toContain("--ds-shadow-lg");
      expect(css).toContain("--ds-shadow-xl");
    });
    it("density", () => {
      expect(css).toContain("--ds-density-scale: 0.9");
    });
  });

  describe("bithire artifact + generated output (I5 public path)", () => {
    it("artifact has layout vars", () => {
      const artifact = readFileSync(
        resolve(CSS_SRC, "facade/artifacts/bithire/index.css"),
        "utf-8"
      );
      expect(artifact).toContain("--ds-layout-bg: #F4F7FA");
      expect(artifact).toContain("--ds-layout-header-bg");
      expect(artifact).toContain("--ds-layout-sider-bg");
    });
    it("artifact has shell vars (minimal)", () => {
      const artifact = readFileSync(
        resolve(CSS_SRC, "facade/artifacts/bithire/index.css"),
        "utf-8"
      );
      expect(artifact).toContain("--ds-shell-grid-size: 0px");
      // gridOpacity removed from CSS — alpha baked into gridLine color
    });
    it("artifact has BitHire premium DS-only chrome vars", () => {
      const artifact = readFileSync(
        resolve(CSS_SRC, "facade/artifacts/bithire/index.css"),
        "utf-8"
      );
      expect(artifact).toContain(
        "--ds-premium-card-header-top-line-display: none"
      );
      expect(artifact).toContain("--ds-table-header-bubble-bg: transparent");
      expect(artifact).toContain("--ds-shell-breadcrumb-height: 28px");
      expect(artifact).toContain("--ds-global-search-results-width");
      expect(artifact).not.toContain("--bithire-");
    });
    it("artifact has buttonDefault + buttonGhost", () => {
      const artifact = readFileSync(
        resolve(CSS_SRC, "facade/artifacts/bithire/index.css"),
        "utf-8"
      );
      expect(artifact).toContain("--ds-button-default-bg: #FFFFFF");
      expect(artifact).toContain("--ds-button-ghost-bg: transparent");
    });
    it("artifact has disabled vars", () => {
      const artifact = readFileSync(
        resolve(CSS_SRC, "facade/artifacts/bithire/index.css"),
        "utf-8"
      );
      expect(artifact).toContain("--ds-button-disabled-opacity: 0.45");
      expect(artifact).toContain("--ds-input-disabled-opacity: 0.45");
    });
    it("generated CSS includes chrome vars", () => {
      const css = generateTenantCss(
        {
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
        },
        { includeDarkSelector: false }
      );
      expect(css).toContain("--ds-layout-bg: #F4F7FA");
      expect(css).toContain("--ds-shell-grid-size: 0px");
      expect(css).toContain("--ds-button-default-bg: #FFFFFF");
      expect(css).toContain("--ds-button-disabled-opacity: 0.45");
    });
  });
});

// ── Evnto ──

describe("H3 contract: evnto", () => {
  checkPaletteBase(evntoBrandTheme, "evnto");
  checkTypography(evntoBrandTheme, "evnto");
  checkMotion(evntoBrandTheme, "evnto");
  checkCharts(evntoBrandTheme, "evnto");
  checkSidebar(evntoBrandTheme, "evnto");

  it("uses the canonical marquee entrance without routine bounce", () => {
    expect(evntoBrandTheme.motion?.entrance).toBe("slideUp");
    expect(evntoBrandTheme.motion?.entranceDuration).toBe(350);
  });

  describe("evnto surfaces (filled I6)", () => {
    it("densityScale", () =>
      expect(evntoBrandTheme.surfaces?.densityScale).toBe(1.125));
    it("borderRadius.sm", () =>
      expect(evntoBrandTheme.surfaces?.borderRadius?.sm).toBe("10px"));
    it("borderRadius.md", () =>
      expect(evntoBrandTheme.surfaces?.borderRadius?.md).toBe("14px"));
    it("borderRadius.lg", () =>
      expect(evntoBrandTheme.surfaces?.borderRadius?.lg).toBe("18px"));
    it("borderRadius.xl", () =>
      expect(evntoBrandTheme.surfaces?.borderRadius?.xl).toBe("24px"));
    it("shadows.sm", () =>
      expect(evntoBrandTheme.surfaces?.shadows?.sm).toBeTruthy());
    it("glass (none)", () =>
      expect(evntoBrandTheme.surfaces?.glass?.blur).toBe("none"));
    it("gradients (none)", () =>
      expect(evntoBrandTheme.surfaces?.gradients?.primary).toBe("none"));
    it("overlays", () =>
      expect(evntoBrandTheme.surfaces?.overlays?.light).toBeTruthy());
  });

  describe("evnto chrome.controls (filled I6)", () => {
    it("buttonPrimary.bg", () =>
      expect(evntoBrandTheme.chrome?.controls?.buttonPrimary?.bg).toBeTruthy());
    it("buttonPrimary.border", () =>
      expect(
        evntoBrandTheme.chrome?.controls?.buttonPrimary?.border
      ).toBeTruthy());
    it("buttonPrimary.shadow", () =>
      expect(
        evntoBrandTheme.chrome?.controls?.buttonPrimary?.shadow
      ).toBeTruthy());
    it("buttonSecondary.bg", () =>
      expect(
        evntoBrandTheme.chrome?.controls?.buttonSecondary?.bg
      ).toBeTruthy());
    it("buttonDefault.bg", () =>
      expect(evntoBrandTheme.chrome?.controls?.buttonDefault?.bg).toBeTruthy());
    it("buttonDefault.text", () =>
      expect(
        evntoBrandTheme.chrome?.controls?.buttonDefault?.text
      ).toBeTruthy());
    it("buttonGhost.bg", () =>
      expect(evntoBrandTheme.chrome?.controls?.buttonGhost?.bg).toBeTruthy());
    it("buttonGhost.text", () =>
      expect(evntoBrandTheme.chrome?.controls?.buttonGhost?.text).toBeTruthy());
    it("input.bg", () =>
      expect(evntoBrandTheme.chrome?.controls?.input?.bg).toBeTruthy());
    it("disabled.opacity", () =>
      expect(evntoBrandTheme.chrome?.controls?.disabled?.opacity).toBe(0.4));
    it("disabled.text", () =>
      expect(evntoBrandTheme.chrome?.controls?.disabled?.text).toBeTruthy());
  });

  describe("evnto chrome.table (filled I6)", () => {
    it("headerBg", () =>
      expect(evntoBrandTheme.chrome?.table?.headerBg).toBeTruthy());
    it("headerColor", () =>
      expect(evntoBrandTheme.chrome?.table?.headerColor).toBe("#737373"));
    it("headerFontWeight", () =>
      expect(evntoBrandTheme.chrome?.table?.headerFontWeight).toBe(500));
    it("headerFontSize", () =>
      expect(evntoBrandTheme.chrome?.table?.headerFontSize).toBe("0.75rem"));
  });

  describe("evnto palette (semantic — filled I6)", () => {
    it("successColor", () =>
      expect(evntoBrandTheme.palette?.successColor).toBe("#15803D"));
    it("warningColor", () =>
      expect(evntoBrandTheme.palette?.warningColor).toBe("#A16207"));
    it("errorColor", () =>
      expect(evntoBrandTheme.palette?.errorColor).toBe("#B91C1C"));
    it("infoColor", () =>
      expect(evntoBrandTheme.palette?.infoColor).toBe("#475569"));
  });

  describe("evnto chrome.layout (filled I6)", () => {
    it("bg", () => expect(evntoBrandTheme.chrome?.layout?.bg).toBe("#FFFFFF"));
    it("headerBg", () =>
      expect(evntoBrandTheme.chrome?.layout?.headerBg).toBeTruthy());
    it("headerBackdrop", () =>
      expect(evntoBrandTheme.chrome?.layout?.headerBackdrop).toBeTruthy());
    it("headerBorder", () =>
      expect(evntoBrandTheme.chrome?.layout?.headerBorder).toBeTruthy());
    it("siderBg", () =>
      expect(evntoBrandTheme.chrome?.layout?.siderBg).toBeTruthy());
    it("siderBorder", () =>
      expect(evntoBrandTheme.chrome?.layout?.siderBorder).toBeTruthy());
  });

  describe("evnto chrome.shell (filled I6 — intentionally minimal)", () => {
    it("gridSize (none)", () =>
      expect(evntoBrandTheme.chrome?.shell?.gridSize).toBe("0px"));
    it("gridLine (transparent)", () =>
      expect(evntoBrandTheme.chrome?.shell?.gridLine).toBe("transparent"));
    it("gridOpacity (0)", () =>
      expect(evntoBrandTheme.chrome?.shell?.gridOpacity).toBe(0));
  });

  describe("evnto dark-mode (filled I6)", () => {
    it("palette: darkPrimaryColor", () =>
      expect(evntoBrandTheme.palette?.darkPrimaryColor).toBeTruthy());
    it("palette: darkBackgroundColor", () =>
      expect(evntoBrandTheme.palette?.darkBackgroundColor).toBeTruthy());
    it("sidebar authored (light-first)", () =>
      expect(evntoBrandTheme.chrome?.sidebar?.bg).toBe("#fafafa"));
    it("layout authored", () =>
      expect(evntoBrandTheme.chrome?.layout?.bg).toBe("#FFFFFF"));
    it("controls authored", () =>
      expect(evntoBrandTheme.chrome?.controls?.buttonPrimary?.bg).toBeTruthy());
    it("table authored", () =>
      expect(evntoBrandTheme.chrome?.table?.headerBg).toBeTruthy());
  });

  describe("evnto state semantics (filled I6)", () => {
    it("disabled: opacity", () =>
      expect(evntoBrandTheme.chrome?.controls?.disabled?.opacity).toBe(0.4));
    it("focus: borderFocus", () =>
      expect(
        evntoBrandTheme.chrome?.controls?.input?.borderFocus
      ).toBeTruthy());
    it("focus: shadowFocus", () =>
      expect(
        evntoBrandTheme.chrome?.controls?.input?.shadowFocus
      ).toBeTruthy());
  });

  describe("evnto artifact + generated output (I6 public path)", () => {
    const artifact = readFileSync(
      resolve(CSS_SRC, "facade/artifacts/evnto/index.css"),
      "utf-8"
    );
    const darkSelector =
      ":is(html[data-tenant='evnto'], :where([data-ds-root][data-vertical='evnto']))[data-theme='dark']";
    const darkIdx = artifact.indexOf(darkSelector);
    const darkBlock = darkIdx > 0 ? artifact.slice(darkIdx) : "";
    it("artifact: radius-sm is 10px", () => {
      expect(artifact).toContain("--ds-radius-sm: 10px");
    });
    it("artifact: shadow matches authored", () => {
      const authored = evntoBrandTheme.surfaces!.shadows!;
      expect(artifact).toContain(`--ds-shadow-sm: ${authored.sm}`);
    });
    it("artifact: layout vars present", () => {
      expect(artifact).toContain("--ds-layout-bg: #FFFFFF");
      expect(artifact).toContain("--ds-layout-sider-bg: #FAFAFA");
    });
    it("artifact: shell vars present (minimal)", () => {
      expect(artifact).toContain("--ds-shell-grid-size: 0px");
    });
    it("artifact: table header complete", () => {
      expect(artifact).toContain("--ds-table-header-color: #737373");
      expect(artifact).toContain("--ds-table-header-font-weight: 500");
    });
    it("artifact: disabled vars present", () => {
      expect(artifact).toContain("--ds-button-disabled-opacity: 0.4");
      expect(artifact).toContain("--ds-input-disabled-opacity: 0.4");
    });
    it("dark block: radius matches authored", () => {
      expect(darkBlock).toContain("--ds-radius-sm: 10px");
      expect(darkBlock).toContain("--ds-radius-xl: 24px");
    });
    it("dark block: shadow matches authored", () => {
      const authored = evntoBrandTheme.surfaces!.shadows!;
      expect(darkBlock).toContain(`--ds-shadow-sm: ${authored.sm}`);
    });
    it("dark block: layout present", () => {
      expect(darkBlock).toContain("--ds-layout-bg");
      expect(darkBlock).toContain("--ds-layout-sider-bg");
    });
    it("dark block: shell present", () => {
      expect(darkBlock).toContain("--ds-shell-grid-size: 0px");
    });
    it("dark block: controls complete", () => {
      expect(darkBlock).toContain("--ds-button-default-bg");
      expect(darkBlock).toContain("--ds-button-ghost-bg");
      expect(darkBlock).toContain("--ds-button-disabled-opacity: 0.4");
    });
    it("dark block: table metadata", () => {
      expect(darkBlock).toContain("--ds-table-header-color");
      expect(darkBlock).toContain("--ds-table-header-font-weight: 500");
    });
    it("dark block: disabled treatment", () => {
      expect(darkBlock).toContain("--ds-input-disabled-opacity: 0.4");
      expect(darkBlock).toContain("--ds-input-border-color-disabled");
    });
    it("generated CSS includes chrome", () => {
      const css = generateTenantCss(
        {
          slug: "evnto",
          name: "Evnto",
          engine: "classic",
          theme: "base",
          plan: "enterprise",
          features: ["*"],
          branding: {
            companyName: "Evnto",
            primaryColor: "#171717",
            secondaryColor: "#B8A898",
            accentColor: "#06b6d4",
          },
          vertical: "evnto",
          brandTheme: evntoBrandTheme,
        },
        { includeDarkSelector: false }
      );
      expect(css).toContain("--ds-layout-bg: #FFFFFF");
      expect(css).toContain("--ds-shell-grid-size: 0px");
      expect(css).toContain("--ds-button-default-bg: #FFFFFF");
      expect(css).toContain("--ds-button-disabled-opacity: 0.4");
      expect(css).toContain("--ds-radius-sm: 10px");
    });
  });
});
