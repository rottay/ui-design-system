/**
 * @fileoverview Wave I0 — Inventory And Test Net
 *
 * Protects current outputs before any physical moves or contract changes.
 * 1. Public CSS export surface — driven from real package.json exports
 * 2. First-party artifact integrity — tenant CSS files with richness checks
 * 3. H3 contract field presence — every contract field checked per vertical
 */

import { describe, it, expect } from "vitest";
import { createHash } from "crypto";
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
import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";
import { deriveReadableInk } from "@/infrastructure/compilers/kernel/foundation/css/color-math/readable-ink";

import { compileBrandTheme } from "../index";

const DIST = resolve(process.cwd(), "dist");
const CSS_SRC = resolve(process.cwd(), "src/foundation/tokens/css");

/**
 * Resolve what a channel actually computes to in one mode.
 *
 * A compiled mode block carries ONLY the channels that mode changes, so
 * "is this declaration inside the dark block" stopped being a meaningful
 * question the moment BrandTheme.modes replaced the hand-written blocks — a
 * channel absent from the block is inherited from the base block, which is the
 * whole point. These assertions ask what renders instead of where it is
 * written, which is also what they were trying to prove all along.
 */
function modeEffective(artifact: string, mode: "light" | "dark") {
  const section = (marker: string): Record<string, string> => {
    const start = artifact.indexOf(marker);
    if (start < 0) return {};
    const open = artifact.indexOf("{", start);
    const close = artifact.indexOf("\n}", open);
    const out: Record<string, string> = {};
    for (const line of artifact.slice(open + 1, close).split("\n")) {
      const match = /^\s*(--[\w-]+):\s*(.+);\s*$/.exec(line);
      if (match) out[match[1]] = match[2];
    }
    return out;
  };
  const base = section("=== Compiled from BrandTheme via compileBrandTheme");
  const overlay = section(`=== Compiled from BrandTheme.modes.${mode}`);
  return (channel: string): string | undefined => overlay[channel] ?? base[channel];
}
const PKG_JSON = JSON.parse(
  readFileSync(resolve(process.cwd(), "package.json"), "utf-8")
);

describe("Evnto canonical visual axes", () => {
  const productProfile = PRODUCT_PROFILES["events.organizer"];
  const vertical = VERTICAL_REGISTRY.evnto;

  it("shares one exact immutable source across brand, profile, and vertical registries", () => {
    // The brand theme extends the baseline with `surfaceRoles`, a role only
    // BrandTheme expresses — the vertical and profile registries read the axes
    // one by one and have no slot for it. So the anti-drift invariant is
    // per-AXIS identity rather than identity of the container: every canonical
    // axis must still be the one frozen source, and the extension must be
    // purely additive.
    for (const axis of Object.keys(EVNTO_CANONICAL_SURFACES) as Array<
      keyof typeof EVNTO_CANONICAL_SURFACES
    >) {
      expect(evntoBrandTheme.surfaces?.[axis], axis).toBe(
        EVNTO_CANONICAL_SURFACES[axis]
      );
    }
    expect(
      Object.keys(evntoBrandTheme.surfaces ?? {}).filter(
        (key) => !(key in EVNTO_CANONICAL_SURFACES)
      )
    ).toEqual(["surfaceRoles"]);
    expect(productProfile?.personality?.animation).toBe(EVNTO_CANONICAL_MOTION);
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
    expect(productProfile?.personality?.animation?.entranceDuration).toBe(350);
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

  it("publishes no retired style alias or retired bundle name", () => {
    const retiredIdentity = ["plat", "form"].join("");
    const retiredStyleEntry = `./styles/${retiredIdentity}`;

    // The alias is gone rather than deprecated. `./styles/rottay` is the
    // vertical bundle; `./styles/default` is the neutral-baseline name for
    // consumers that do not want to spell a vertical at all. Both resolve to
    // dist/rottay.css, which is ONE file, not two names for two files.
    expect(
      styleExports.find((e) => e.subpath === retiredStyleEntry),
    ).toBeUndefined();

    for (const exp of styleExports) {
      expect(
        exp.style,
        `${exp.subpath} still points at the retired bundle name`,
      ).not.toContain(retiredIdentity);
    }

    const rottay = styleExports.find((e) => e.subpath === "./styles/rottay");
    const neutral = styleExports.find((e) => e.subpath === "./styles/default");
    expect(rottay?.style).toBe("./dist/rottay.css");
    expect(neutral?.style).toBe("./dist/rottay.css");
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
      "facade/entrypoints/rottay.css",
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

/**
 * A theme's OTHER mode -- the one that is not `appearance.defaultMode` --
 * as a typed overlay. `BrandPalette.darkPrimaryColor` / `darkSecondaryColor`
 * / `darkBackgroundColor` are gone: a palette authors exactly the mode it is
 * FOR, and the other mode (when authored) is a sibling `modes.{light,dark}`
 * overlay, never a second `dark`-prefixed field on the same palette object.
 */
function nonDefaultModePalette(bt: BrandTheme) {
  const nonDefault = bt.appearance?.defaultMode === "dark" ? "light" : "dark";
  return bt.modes?.[nonDefault]?.palette;
}

function checkPaletteBase(bt: BrandTheme, name: string) {
  describe(`${name} palette (base)`, () => {
    it("primaryColor", () => expect(bt.palette?.primaryColor).toBeTruthy());
    it("secondaryColor", () => expect(bt.palette?.secondaryColor).toBeTruthy());
    it("accentColor", () => expect(bt.palette?.accentColor).toBeTruthy());
    // A theme must own the ground for the mode it renders in.
    // `backgroundColor` is THIS theme's own ground -- the mode it declares
    // via `appearance.defaultMode` -- with no `dark`-prefixed twin on the
    // same object any more.
    it("declares a ground for its own default mode", () =>
      expect(bt.palette?.backgroundColor).toBeTruthy());
    // The other mode, when authored, is a full sibling overlay: its own
    // seeds and its own ground, not a same-object dark-prefixed pair.
    it("its non-default mode overlay authors its own primary/secondary seeds", () => {
      const overlay = nonDefaultModePalette(bt);
      expect(overlay?.primaryColor).toBeTruthy();
      expect(overlay?.secondaryColor).toBeTruthy();
    });
    it("its non-default mode overlay declares its own ground", () =>
      expect(nonDefaultModePalette(bt)?.backgroundColor).toBeTruthy());
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
    // VERTICAL-CONFLICT-9: base error/info seeds moved to the 400 ramp step
    // so that --ds-color-on-error/info keep their previous dark-on-tone values.
    it("errorColor", () =>
      expect(rottayBrandTheme.palette?.errorColor).toBe("#F87171"));
    it("infoColor", () =>
      expect(rottayBrandTheme.palette?.infoColor).toBe("#60A5FA"));
  });

  describe("rottay dark-mode (filled I4)", () => {
    // Rottay IS dark-first: dark is its DECLARED appearance.defaultMode, so
    // the top-level palette.primaryColor / .backgroundColor already ARE its
    // dark values -- there is no separate `dark`-prefixed field any more.
    // Chrome values (sidebar, layout, controls, table) are authored as dark values.
    it("declares dark as its default mode", () =>
      expect(rottayBrandTheme.appearance?.defaultMode).toBe("dark"));
    it("palette dark strategy: primaryColor", () =>
      expect(rottayBrandTheme.palette?.primaryColor).toBeTruthy());
    it("palette dark strategy: backgroundColor", () =>
      expect(rottayBrandTheme.palette?.backgroundColor).toBe("#0C0C0E"));
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
    it("disabled: all button vars emitted in compiled CSS", () => {
      // Was the retired runtime tenant-CSS generator (the retired runtime tenant-CSS generator);
      // compileBrandTheme's own cssString is the direct successor for "what
      // does this BrandTheme actually compile to as CSS text".
      const css = compileBrandTheme({
        brandTheme: rottayBrandTheme,
        tenantSlug: "rottay",
      }).cssString;
      expect(css).toContain("--ds-button-disabled-opacity: 0.4");
      expect(css).toContain("--ds-button-disabled-bg");
      expect(css).toContain("--ds-button-disabled-color");
      expect(css).toContain("--ds-button-disabled-border:");
      expect(css).toContain("--ds-button-disabled-border-color");
    });
    it("disabled: all input vars emitted in compiled CSS", () => {
      const css = compileBrandTheme({
        brandTheme: rottayBrandTheme,
        tenantSlug: "rottay",
      }).cssString;
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

  describe("bithire dark-mode (filled I5, now a real authored overlay)", () => {
    // BitHire is light-first (appearance.defaultMode: "light"). It used to
    // have NO real dark surface at all: with no `darkBackgroundColor` field,
    // its dark mode fell all the way back to the DS default ground and
    // nothing else. It now authors a full typed `modes.dark` overlay --
    // its own ground, its own seeded ramps, and its own full chrome set --
    // so "no dark ground, so the DS default applies" is no longer true.
    it("declares light as its default mode", () =>
      expect(bithireBrandTheme.appearance?.defaultMode).toBe("light"));
    it("palette: light (default) ground declared", () =>
      expect(bithireBrandTheme.palette?.backgroundColor).toBe("#F4F8FB"));
    it("palette: the dark overlay declares its OWN ground -- no longer falling back to the DS default", () =>
      expect(bithireBrandTheme.modes?.dark?.palette?.backgroundColor).toBeTruthy());
    it("palette: the dark overlay declares its own primary seed", () =>
      expect(bithireBrandTheme.modes?.dark?.palette?.primaryColor).toBeTruthy());
    // Sidebar is light-authored; dark treatment is now ALSO explicitly authored.
    it("sidebar authored (light-first)", () =>
      expect(bithireBrandTheme.chrome?.sidebar?.bg).toBe("#ffffff"));
    it("dark overlay authors its own sidebar too", () =>
      expect(bithireBrandTheme.modes?.dark?.chrome?.sidebar?.bg).toBeTruthy());
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
    const darkIdx = artifact.indexOf(
      "=== Compiled from BrandTheme.modes.dark",
    );
    const lightBlock = darkIdx > 0 ? artifact.slice(0, darkIdx) : artifact;
    const dark = modeEffective(artifact, "dark");

    it("light: radius dial operands sm/md/lg/xl", () => {
      // The vertical emits the `-base` OPERANDS of the foundation dial, not the
      // resolved radii. themes/default.css computes
      // `calc(base * var(--ds-radius-scale, 1))`, so dividing the authored value
      // by this theme's scale reproduces 7/10/14/18 today while leaving the dial
      // able to move them. A flat `--ds-radius-*` here would replace that calc.
      const authored = bithireBrandTheme.surfaces!.borderRadius!;
      expect(lightBlock).toContain("--ds-radius-scale: 1.25");
      expect(lightBlock).toContain(
        `--ds-radius-sm-base: calc(${authored.sm} / 1.25)`
      );
      expect(lightBlock).toContain(
        `--ds-radius-md-base: calc(${authored.md} / 1.25)`
      );
      expect(lightBlock).toContain(
        `--ds-radius-lg-base: calc(${authored.lg} / 1.25)`
      );
      expect(lightBlock).toContain(
        `--ds-radius-xl-base: calc(${authored.xl} / 1.25)`
      );
    });
    it("light: shadow scale matches authored source", () => {
      const authored = bithireBrandTheme.surfaces!.shadows!;
      expect(lightBlock).toContain(`--ds-shadow-sm: ${authored.sm}`);
      expect(lightBlock).toContain(`--ds-shadow-md: ${authored.md}`);
      expect(lightBlock).toContain(`--ds-shadow-lg: ${authored.lg}`);
      expect(lightBlock).toContain(`--ds-shadow-xl: ${authored.xl}`);
    });
    it("dark: radius scale matches light", () => {
      // Shape does not change with mode, so the overlay restates none of it and
      // dark inherits the base scale. Asserting inheritance is the point.
      expect(dark("--ds-radius-sm-base")).toBe("calc(7px / 1.25)");
      expect(dark("--ds-radius-md-base")).toBe("calc(10px / 1.25)");
      expect(dark("--ds-radius-lg-base")).toBe("calc(14px / 1.25)");
      expect(dark("--ds-radius-xl-base")).toBe("calc(18px / 1.25)");
    });
    it("dark: shadow scale uses the authored dark elevation set", () => {
      // Elevation DOES change with mode: dark carries its own compact set on
      // the same blue-petrol neutral authority, now authored in
      // modes.dark.surfaces.shadows instead of the extension.
      expect(dark("--ds-shadow-sm")).toBe("0 1px 2px rgba(20, 40, 59, 0.06)");
      expect(dark("--ds-shadow-md")).toBe("0 4px 12px rgba(20, 40, 59, 0.08)");
      expect(dark("--ds-shadow-lg")).toBe("0 8px 24px rgba(20, 40, 59, 0.1)");
      expect(dark("--ds-shadow-xl")).toBe("0 16px 48px rgba(20, 40, 59, 0.12)");
    });
    it("no stale 4px radius in either block", () => {
      expect(artifact).not.toContain("--ds-radius-sm: 4px");
    });
  });

  describe("bithire surfaces in compiled CSS", () => {
    // Was the retired runtime tenant-CSS generator (the retired runtime tenant-CSS generator);
    // compileBrandTheme's own cssString is the direct successor.
    const css = compileBrandTheme({
      brandTheme: bithireBrandTheme,
      tenantSlug: "bithire",
    }).cssString;
    // As in the artifact block above: the compiler emits the dial operands.
    // BitHire's scale is 1.25, so each operand is the authored value divided by
    // it and the foundation's multiply reproduces 7/10/14/18 at rest.
    it("radius dial operands sm/md/lg/xl", () => {
      expect(css).toContain("--ds-radius-scale: 1.25");
      expect(css).toContain("--ds-radius-sm-base: calc(7px / 1.25)");
      expect(css).toContain("--ds-radius-md-base: calc(10px / 1.25)");
      expect(css).toContain("--ds-radius-lg-base: calc(14px / 1.25)");
      expect(css).toContain("--ds-radius-xl-base: calc(18px / 1.25)");
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
      // R1-P moved the value that actually shipped (the artifact extension's
      // semantic control token) into the theme, so the default button surface
      // is the token rather than the literal it used to be shadowed with.
      expect(artifact).toContain("--ds-button-default-bg: var(--ds-control-surface)");
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
    it("compiled CSS includes chrome vars", () => {
      const css = compileBrandTheme({
        brandTheme: bithireBrandTheme,
        tenantSlug: "bithire",
      }).cssString;
      expect(css).toContain("--ds-layout-bg: #F4F7FA");
      expect(css).toContain("--ds-shell-grid-size: 0px");
      expect(css).toContain("--ds-button-default-bg: var(--ds-control-surface)");
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
    // Evnto's dark values now live in its typed `modes.dark` overlay rather
    // than a `dark`-prefixed pair on the same palette object.
    it("palette: dark overlay declares its own primary seed", () =>
      expect(evntoBrandTheme.modes?.dark?.palette?.primaryColor).toBeTruthy());
    it("palette: dark overlay declares its own ground", () =>
      expect(evntoBrandTheme.modes?.dark?.palette?.backgroundColor).toBeTruthy());
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
    const dark = modeEffective(artifact, "dark");
    // The vertical emits the dial OPERAND, not the resolved radius:
    // themes/default.css computes `calc(base * var(--ds-radius-scale, 1))`, and
    // a flat `--ds-radius-sm` at tenant scope would replace that calc outright.
    // Evnto's scale is 1, so the operand is the authored value unchanged.
    it("artifact: radius-sm operand is the authored 10px", () => {
      expect(artifact).toContain("--ds-radius-sm-base: 10px");
      expect(artifact).not.toContain("--ds-radius-sm: 10px");
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
    // Shape does not change with mode, so the dark overlay restates none of it
    // and inherits the base operands. Asserting that inheritance is the point.
    it("dark: radius operands match authored", () => {
      expect(dark("--ds-radius-sm-base")).toBe("10px");
      expect(dark("--ds-radius-xl-base")).toBe("24px");
    });
    it("dark: shadow matches authored", () => {
      const authored = evntoBrandTheme.surfaces!.shadows!;
      expect(dark("--ds-shadow-sm")).toBe(authored.sm);
    });
    it("dark: layout carries its own ground", () => {
      expect(dark("--ds-layout-bg")).toBe("#131210");
      expect(dark("--ds-layout-sider-bg")).toBe("#0E0D0B");
    });
    it("dark: shell stays minimal", () => {
      expect(dark("--ds-shell-grid-size")).toBe("0px");
    });
    it("dark: controls complete", () => {
      expect(dark("--ds-button-default-bg")).toBe("#1C1A16");
      expect(dark("--ds-button-ghost-bg")).toBe("transparent");
      expect(dark("--ds-button-disabled-opacity")).toBe("0.4");
    });
    it("dark: table metadata", () => {
      expect(dark("--ds-table-header-color")).toBe("#A8A898");
      expect(dark("--ds-table-header-font-weight")).toBe("500");
    });
    it("dark: disabled treatment", () => {
      expect(dark("--ds-input-disabled-opacity")).toBe("0.4");
      expect(dark("--ds-input-border-color-disabled")).toBeDefined();
    });
    it("compiled CSS includes chrome", () => {
      // Was the retired runtime tenant-CSS generator (the retired runtime tenant-CSS generator);
      // compileBrandTheme's own cssString is the direct successor. None of
      // the pins below depend on vertical-baseline resolution (the old
      // config's `vertical: "evnto"` field), only on evntoBrandTheme's own
      // authored chrome, so dropping it changes nothing this test checks.
      const css = compileBrandTheme({
        brandTheme: evntoBrandTheme,
        tenantSlug: "evnto",
      }).cssString;
      expect(css).toContain("--ds-layout-bg: #FFFFFF");
      expect(css).toContain("--ds-shell-grid-size: 0px");
      expect(css).toContain("--ds-button-default-bg: #FFFFFF");
      expect(css).toContain("--ds-button-disabled-opacity: 0.4");
      expect(css).toContain("--ds-radius-sm-base: 10px");
    });
  });
});

// ══════════════════════════════════════════════════════════
// SECTION 4: VERTICAL-CONFLICT-9 canaries
// Roster/hash is computed from raw source strings, not PostCSS.
// Exact live numbers live ONLY in the receipt/handoff; the gate owns
// exactness. Tests here assert durable contracts and decrease-only ceilings.
// ══════════════════════════════════════════════════════════

describe("VERTICAL-CONFLICT-9 · DEAD-61 short atom", () => {
  const ledger = JSON.parse(
    readFileSync(resolve(process.cwd(), "src/foundation/tokens/residual-adjudication.json"), "utf-8")
  );

  const ROSTER = [
    "--ds-card-shadow-elevated",
    "--ds-color-bg-input",
    "--ds-color-bg-primary",
    "--ds-color-error",
    "--ds-color-info",
    "--ds-font-family-base",
    "--ds-font-family-display",
    "--ds-font-family-heading",
    "--ds-surface-card-border-strong",
  ];

  const ZERO_EFFECTIVE = new Set([
    "--ds-card-shadow-elevated",
    "--ds-color-error",
    "--ds-color-info",
  ]);

  const SIGHTED_PENDING = new Set([
    "--ds-color-bg-input (rottay dark)",
    "--ds-font-family-base (rottay dark)",
    "--ds-font-family-display (rottay dark)",
    "--ds-font-family-heading (rottay dark)",
    "--ds-color-bg-primary (bithire light)",
    "--ds-surface-card-border-strong (bithire all modes)",
  ]);

  const EXPECTED_FONT_STACKS: Record<string, string> = {
    "--ds-font-family-base": `var(--ds-font-pack-humanist-text, 'Public Sans', ui-sans-serif, system-ui, -apple-system, sans-serif), "Noto Sans Arabic", sans-serif`,
    "--ds-font-family-heading": `var(--ds-font-pack-humanist-text, 'Public Sans', ui-sans-serif, system-ui, -apple-system, sans-serif), "Noto Sans Arabic", sans-serif`,
    "--ds-font-family-display": `var(--ds-font-pack-humanist-text, 'Public Sans', ui-sans-serif, system-ui, -apple-system, sans-serif), "Noto Sans Arabic", sans-serif`,
  };

  function expectConflict9Receipt(receipt: unknown) {
    expect(receipt).toBeDefined();
    const r = receipt as {
      rosterSha256: string;
      zeroEffective: string[];
      sightedPending: string[];
      generatedProjection: string;
    };
    expect(r.rosterSha256).toBe(
      "7d9ea09aed4297978cb2e789f6e242a63fb2978639204b371f415dd68ce78cfb"
    );
    expect(r.zeroEffective).toHaveLength(ZERO_EFFECTIVE.size);
    expect(r.sightedPending).toHaveLength(SIGHTED_PENDING.size);
    expect(new Set(r.zeroEffective)).toEqual(ZERO_EFFECTIVE);
    expect(new Set(r.sightedPending)).toEqual(SIGHTED_PENDING);
    expect(r.generatedProjection).toBe("PENDING");
    for (const entry of r.sightedPending) {
      expect(entry).not.toMatch(/executed/i);
    }
  }

  const rosterHash = (channels: string[]) =>
    createHash("sha256").update(channels.sort().join("\n") + "\n").digest("hex");

  it("roster is the exact 9 channels and hash matches the live sorted+LF SHA", () => {
    expect(ROSTER).toHaveLength(9);
    expect(rosterHash(ROSTER)).toBe(
      "7d9ea09aed4297978cb2e789f6e242a63fb2978639204b371f415dd68ce78cfb"
    );
  });

  // EXCISED (SEV-2): `roster channels are absent from the authored extensions
  // (no PostCSS needed)`. It read all three `_source/extension.css` files,
  // which were deleted in this tranche, and asserted none of the 9 CONFLICT9
  // roster channels was re-declared there. There is no authored extension left
  // to declare them; law G2 of `scripts/first-party-single-author-gate.mjs`
  // fails on any resurrected extension source or `_source/` directory, which
  // is strictly stronger than a per-channel absence scan. The compiled-surface
  // assertions for the same 9 channels are directly below and untouched.

  describe("rottay base error/info at ramp 400", () => {
    const compiled = compileBrandTheme({
      brandTheme: rottayBrandTheme,
      tenantSlug: "rottay",
    });
    const base = compiled.cssVariables;
    const light = compiled.modeBlocks?.find((b) => b.mode === "light")?.cssVariables ?? {};

    it("base errorColor is the exact hex literal error-400", () => {
      expect(rottayBrandTheme.palette?.errorColor).toBe("#F87171");
      expect(base["--ds-color-error"]).toBe("#F87171");
      expect(base["--ds-color-error-400"]).toBe("#F87171");
    });

    it("base infoColor is the exact hex literal info-400", () => {
      expect(rottayBrandTheme.palette?.infoColor).toBe("#60A5FA");
      expect(base["--ds-color-info"]).toBe("#60A5FA");
      expect(base["--ds-color-info-400"]).toBe("#60A5FA");
    });

    it("on-tone channels are derived from the 400-step seeds", () => {
      expect(base["--ds-color-on-error"]).toBe(deriveReadableInk("#F87171"));
      expect(base["--ds-color-on-info"]).toBe(deriveReadableInk("#60A5FA"));
    });

    it("light mode keeps the original 600-step authority", () => {
      expect(light["--ds-color-error"]).toBe("#DC2626");
      expect(light["--ds-color-info"]).toBe("#2563EB");
    });

    it("dark bg-input is the compiled #131316, not the old extension #0F0F12", () => {
      expect(base["--ds-color-bg-input"]).toBe("#131316");
      expect(compiled.cssString).not.toContain("--ds-color-bg-input: #0F0F12");
    });
  });

  describe("rottay fonts compile to the exact mandatory Arabic tail", () => {
    const compiled = compileBrandTheme({
      brandTheme: rottayBrandTheme,
      tenantSlug: "rottay",
    });
    const base = compiled.cssVariables;

    it.each([
      ["--ds-font-family-base"],
      ["--ds-font-family-display"],
      ["--ds-font-family-heading"],
    ])("%s matches the canonical exact stack", (channel) => {
      expect(base[channel]).toBe(EXPECTED_FONT_STACKS[channel]);
    });

    it("rejects a non-canonical stack even when it already carries Arabic", () => {
      const mutant = {
        ...rottayBrandTheme,
        typography: {
          ...rottayBrandTheme.typography,
          fontFamilyBase: "'Inter', \"Noto Sans Arabic\", sans-serif",
          fontFamilyDisplay: "'Inter', \"Noto Sans Arabic\", sans-serif",
          fontFamilyHeading: "'Inter', \"Noto Sans Arabic\", sans-serif",
        },
      };
      const compiledMutant = compileBrandTheme({ brandTheme: mutant, tenantSlug: "rottay" });
      expect(compiledMutant.cssVariables["--ds-font-family-base"]).not.toBe(
        EXPECTED_FONT_STACKS["--ds-font-family-base"]
      );
    });
  });

  describe("bithire base/dark ground and material border", () => {
    const compiled = compileBrandTheme({
      brandTheme: bithireBrandTheme,
      tenantSlug: "bithire",
    });
    const base = compiled.cssVariables;
    const dark = compiled.modeBlocks?.find((b) => b.mode === "dark")?.cssVariables ?? {};

    it("base bg-primary is the authored light ground", () => {
      expect(bithireBrandTheme.palette?.backgroundColor).toBe("#F4F8FB");
      expect(base["--ds-color-bg-primary"]).toBe("#F4F8FB");
    });

    it("dark bg-primary is the authored dark ground", () => {
      expect(bithireBrandTheme.modes?.dark?.palette?.backgroundColor).toBe("#0f1520");
      expect(dark["--ds-color-bg-primary"]).toBe("#0f1520");
    });

    it("surface-card-border-strong resolves to the authored card borderStrong", () => {
      expect(bithireBrandTheme.surfaces?.surfaceRoles?.card?.borderStrong).toBe("#B9CCDC");
      // The surface alias points to the material token; the material token carries the literal.
      expect(base["--ds-surface-card-border-strong"]).toBe("var(--ds-material-card-border-strong)");
      expect(base["--ds-material-card-border-strong"]).toBe("#B9CCDC");
    });
  });

  describe("ledger and baseline receipts", () => {
    it("receipt validates with exact set equality for zeroEffective/sightedPending", () => {
      expectConflict9Receipt(ledger.verticalConflict9Execution);
    });

    it("rejects a sighted-pending entry mutated to an executed state", () => {
      const mutated = JSON.parse(JSON.stringify(ledger.verticalConflict9Execution));
      mutated.sightedPending = mutated.sightedPending.map((entry: string) =>
        entry.startsWith("--ds-color-bg-input") ? `${entry} [EXECUTED]` : entry
      );
      expect(() => expectConflict9Receipt(mutated)).toThrow();
    });

    it("rejects a duplicated zero-effective entry that breaks exact cardinality", () => {
      const mutated = JSON.parse(JSON.stringify(ledger.verticalConflict9Execution));
      mutated.zeroEffective = [...mutated.zeroEffective, "--ds-color-error"];
      expect(() => expectConflict9Receipt(mutated)).toThrow();
    });

    it("distribution is derived from ledger.entries and receipt does not mutate entries", () => {
      const entries = Object.values(ledger.entries) as Array<{ finalState: string }>;
      const computed = entries.reduce<Record<string, number>>((acc, entry) => {
        acc[entry.finalState] = (acc[entry.finalState] ?? 0) + 1;
        return acc;
      }, {});
      expect(Object.values(computed).reduce((a, b) => a + b, 0)).toBe(entries.length);
      expect(computed).toEqual(ledger.finalStateVocabulary?.distribution);
    });

    // EXCISED (SEV-2): `baseline.json accepted values are decrease-only
    // ceilings (exactness delegated to gate)`. It read
    // `scripts/artifact-provenance-gate.baseline.json`, deleted in this tranche
    // together with the gate whose volume it capped. Every ceiling it asserted
    // bounded the SIZE of a second authored source per slug (rottay <= 66191
    // bytes / 1094 declarations / 1248 literals; bithire <= 23339 / 209 / 123;
    // zero capability gaps and zero grandfathered capability-gap channels for
    // all three). With the source gone those bounds are satisfied by zero, so
    // the test would have stayed green while measuring nothing. The successor
    // does not bound the second author, it forbids it:
    // `scripts/first-party-single-author-gate.mjs`.
  });

  describe("mutants", () => {
    it("rejects the old rottay error/info seeds", () => {
      const mutant = {
        ...rottayBrandTheme,
        palette: { ...rottayBrandTheme.palette, errorColor: "#EF4444", infoColor: "#3B82F6" },
      };
      const css = compileBrandTheme({ brandTheme: mutant, tenantSlug: "rottay" }).cssString;
      expect(css).not.toContain("--ds-color-error: #F87171");
      expect(css).not.toContain("--ds-color-info: #60A5FA");
    });

    it("rejects a var-alias substitution for the base error channel", () => {
      const mutant = {
        ...rottayBrandTheme,
        palette: { ...rottayBrandTheme.palette, errorColor: "var(--ds-color-error-400)" },
      };
      const css = compileBrandTheme({ brandTheme: mutant, tenantSlug: "rottay" }).cssString;
      expect(css).not.toContain("--ds-color-error: #F87171");
    });

    it("rejects a wrong ramp step for the base error seed", () => {
      const mutant = {
        ...rottayBrandTheme,
        palette: { ...rottayBrandTheme.palette, errorColor: "#FCA5A5" },
      };
      const css = compileBrandTheme({ brandTheme: mutant, tenantSlug: "rottay" }).cssString;
      expect(css).not.toContain("--ds-color-error: #F87171");
    });

    it("rejects changed light error/info seeds in the mode block", () => {
      const lightMode = rottayBrandTheme.modes?.light;
      if (!lightMode?.palette) throw new Error("Missing rottay light palette");
      const mutant = {
        ...rottayBrandTheme,
        modes: {
          ...rottayBrandTheme.modes,
          light: {
            ...lightMode,
            palette: {
              ...lightMode.palette,
              errorColor: "#B91C1C",
              infoColor: "#1E40AF",
            },
          },
        },
      };
      const compiledMutant = compileBrandTheme({ brandTheme: mutant, tenantSlug: "rottay" });
      const light = compiledMutant.modeBlocks?.find((b) => b.mode === "light")?.cssVariables ?? {};
      expect(light["--ds-color-error"]).toBe("#B91C1C");
      expect(light["--ds-color-error"]).not.toBe("#DC2626");
      expect(light["--ds-color-info"]).toBe("#1E40AF");
      expect(light["--ds-color-info"]).not.toBe("#2563EB");
    });

    it("rejects a dark error seed that flips the readable ink", () => {
      // #7F1D1D is dark enough that deriveReadableInk returns #ffffff,
      // violating the expected dark-on-tone for --ds-color-on-error.
      const mutant = {
        ...rottayBrandTheme,
        palette: { ...rottayBrandTheme.palette, errorColor: "#7F1D1D" },
      };
      const compiled = compileBrandTheme({ brandTheme: mutant, tenantSlug: "rottay" });
      expect(compiled.cssVariables["--ds-color-on-error"]).not.toBe(deriveReadableInk("#F87171"));
      expect(compiled.cssVariables["--ds-color-on-error"]).toBe(deriveReadableInk("#7F1D1D"));
    });

    it("neutralizes a font mutant by re-injecting the exact Arabic tail", () => {
      // The compiler injects "Noto Sans Arabic" fail-closed; an author-provided
      // non-Arabic stack is repaired rather than accepted as-is.
      const planted = "'Inter', sans-serif";
      const mutant = {
        ...rottayBrandTheme,
        typography: {
          ...rottayBrandTheme.typography,
          fontFamilyBase: planted,
          fontFamilyDisplay: planted,
          fontFamilyHeading: planted,
        },
      };
      const compiled = compileBrandTheme({ brandTheme: mutant, tenantSlug: "rottay" });
      expect(compiled.cssVariables["--ds-font-family-base"]).toBe(
        `'Inter', "Noto Sans Arabic", sans-serif`
      );
    });

    it("rejects a sighted field change that alters the compiled channel", () => {
      const mutant = {
        ...bithireBrandTheme,
        surfaces: {
          ...bithireBrandTheme.surfaces,
          surfaceRoles: {
            ...bithireBrandTheme.surfaces?.surfaceRoles,
            card: {
              ...bithireBrandTheme.surfaces?.surfaceRoles?.card,
              borderStrong: "#FF0000",
            },
          },
        },
      };
      const compiled = compileBrandTheme({ brandTheme: mutant, tenantSlug: "bithire" });
      expect(compiled.cssVariables["--ds-material-card-border-strong"]).not.toBe("#B9CCDC");
      expect(compiled.cssVariables["--ds-material-card-border-strong"]).toBe("#FF0000");
    });

    it("rejects the old bithire alias values", () => {
      const css = compileBrandTheme({
        brandTheme: bithireBrandTheme,
        tenantSlug: "bithire",
      }).cssString;
      expect(css).not.toContain("--ds-color-bg-primary: #ffffff");
      expect(css).not.toContain("--ds-surface-card-border-strong: var(--ds-color-border-secondary)");
    });
  });
});
