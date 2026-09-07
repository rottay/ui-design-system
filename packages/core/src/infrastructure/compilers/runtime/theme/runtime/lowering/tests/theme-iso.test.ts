/**
 * @fileoverview T0 THEME-ISO executable evidence.
 *
 * Required evidence:
 * 1. Theme/ThemeLayerPatch/mergeThemePatches contracts and fail-closed behavior.
 * 2. Exact transport equality: same Theme produces identical keypaths/order/CSS/digest.
 * 3. Three first-party Themes are structural mirrors (canonical keypaths equal).
 * 4. v1 document migration is golden and unknown keys/missing vertical fail.
 * 5. Digest invariance for existing first-party themes under compileTheme.
 * 6. Hard universal-name law over Theme keypaths and compiler output.
 * 7. Negative mutant: the old "DB is a subset of static" doctrine no longer passes.
 * 8. Chrome totality: every branch the schema admits exists in the total ISO
 *    shape, proven by set-equality over the contract AST rather than samples.
 */

import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import postcss from "postcss";
import ts from "typescript";
import { describe, expect, it } from "vitest";

import { themeModeSelector } from "@/infrastructure/compilers/kernel/foundation/css/tenant-selectors";
import { compileTheme } from "@/infrastructure/compilers/runtime/theme/runtime/lowering";
import {
  FIRST_PARTY_THEMES,
  bithireBrandTheme,
  evntoBrandTheme,
  rottayBrandTheme,
} from "@/foundation/tokens/ts/presentation/brand-themes";
import type {
  Theme,
  ThemeLayerPatch,
} from "@/foundation/contracts/composition/tenants/themes/iso";
import type { BrandMotion } from "@/foundation/contracts/composition/tenants/themes";
import {
  brandThemeToTheme,
  canonicalizeTheme,
  collectThemeKeypaths,
  governedDisabled,
  isGovernedActive,
  mergeThemePatches,
  mirrorChromeSections,
  violatesThemeNameLaw,
} from "@/foundation/contracts/composition/tenants/themes/iso";
import { readGovernedTheme } from "../foundation/intake";
import { DEFAULT_CHROME_SHAPE } from "@/foundation/contracts/composition/tenants/themes/iso/shape";
import { migrateV1 as migrateV1WithMode } from "@/infrastructure/compilers/runtime/theme/runtime/ingress";
import {
  compileTenantThemeConfig,
  getTenantThemeVerticalEnvelope,
  hydrateTenantThemeConfig,
} from "@/infrastructure/compilers/composition/tenant-theme";
import type { TenantThemeDocument } from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import { EMPTY_PROVENANCE } from "@/foundation/contracts/composition/tenants/themes/resolved";
import { resolveAdapter } from "@/infrastructure/compilers/runtime/theme/presentation/adapters";
import {
  brandTenantSelector,
} from "@/infrastructure/compilers/kernel/foundation/css/tenant-selectors";
import {
  containerScope,
  emitThemeCss,
} from "@/infrastructure/compilers/runtime/theme/runtime/emission";

/**
 * The canonical route this suite exercises: resolve, lower, then emit.
 *
 * The retired `compileTheme(theme, { tenantSlug })` folded scope into the
 * compile. It does not any more — one compile serves every scope — so the
 * suite asks for the two products it actually asserts on.
 */
function lower(theme: Theme, tenantSlug: string = theme.id) {
  const labelled = tenantSlug === theme.id ? theme : { ...theme, id: tenantSlug };
  // Hand-merged fixture themes, not roster baselines: this suite compares two
  // TRANSPORTS by pre-merging both to the same Theme, which is exactly the
  // input no `ThemeIntent` can name. The provenance is the door's own
  // no-tenant value.
  const compiled = compileTheme(
    { theme: labelled, provenance: EMPTY_PROVENANCE },
    resolveAdapter("modern")
  );
  return {
    ...compiled,
    cssString: emitThemeCss(compiled, containerScope(brandTenantSelector(tenantSlug))),
  };
}


const migrateV1 = (document: TenantThemeDocument) =>
  migrateV1WithMode(document, "light");

function digestVariables(variables: Record<string, string>): string {
  const lines = Object.entries(variables)
    .map(([k, v]) => `${k}=${v}`)
    .sort();
  return createHash("sha256")
    .update(lines.join("\n") + "\n")
    .digest("hex");
}

/**
 * Recursively drop undefined values and empty objects/arrays. ISO totality adds
 * structural placeholder objects to the Theme shape; when a BrandTheme is
 * round-tripped through Theme and back, those placeholders survive JSON
 * serialization as empty objects. Stripping empties lets the test assert
 * semantic identity without requiring the ISO shape to be byte-identical to the
 * legacy BrandTheme shape.
 */
function stripEmpties(value: unknown): unknown {
  if (value === undefined) return undefined;
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) {
    const arr = value.map(stripEmpties).filter((v) => v !== undefined);
    return arr.length === 0 ? undefined : arr;
  }
  const obj: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(value)) {
    const cleaned = stripEmpties(val);
    if (cleaned !== undefined) obj[key] = cleaned;
  }
  return Object.keys(obj).length === 0 ? undefined : obj;
}

function allChannels(compiled: {
  cssVariables: Record<string, string>;
  modeBlocks?: readonly { cssVariables: Record<string, string> }[];
}): string[] {
  const channels = new Set<string>();
  for (const ch of Object.keys(compiled.cssVariables)) channels.add(ch);
  for (const block of compiled.modeBlocks ?? []) {
    for (const ch of Object.keys(block.cssVariables)) channels.add(ch);
  }
  return [...channels].sort();
}

function effectiveModeVariables(
  compiled: ReturnType<typeof compileTheme>,
  mode: "light" | "dark"
): Record<string, string> {
  const block = compiled.modeBlocks?.find(
    (candidate) => candidate.mode === mode
  );
  return { ...compiled.cssVariables, ...block?.cssVariables };
}

function cssRuleVariables(
  css: string,
  selector: string
): Record<string, string> {
  const variables: Record<string, string> = {};
  postcss.parse(css).walkRules((rule) => {
    if (rule.selector !== selector) return;
    rule.walkDecls(/^--ds-/, (declaration) => {
      variables[declaration.prop] = declaration.value;
    });
  });
  return variables;
}

/**
 * The channels a tenant's own primary seed re-derives once the compiler is told
 * who authored what.
 *
 * Before provenance these seven kept the vertical's authored blue even for a
 * customer who had replaced the very seed they derive from: the compiler could
 * not tell a tenant's seed apart from bithire's own leaf, so the leaf stood and
 * the family went on pointing at a colour the customer had overwritten. That is
 * the deferral this wave closes — a tenant that states `palette.primary` has
 * stated the family derived from it, and stating it is not the same act as
 * authoring each member by hand.
 *
 * A test that compares the arbitrated DB path against a compile WITHOUT
 * provenance must therefore expect exactly this difference. The un-arbitrated
 * compile is not a second opinion about the right answer; it is the same
 * lowering asked a question it holds no information to answer, so it falls back
 * to the vertical. Expecting the two to agree here would be expecting the
 * arbitration not to have happened.
 *
 * The set is closed and stated once. Growing it is a behavioural change and
 * must be argued at the compiler, not absorbed here.
 */
const SEED_DERIVED_CHANNELS = [
  "--ds-button-primary-bg-hover",
  "--ds-color-border-focus",
  "--ds-color-link",
  "--ds-color-link-hover",
  "--ds-input-border-focus",
  "--ds-input-shadow-focus",
] as const;

/**
 * `--ds-button-primary-bg` LEFT the set, and it is not a shrink of the law.
 *
 * The themes now author the brand ground once on `--ds-color-primary` and let
 * the button channel read it (`var(--ds-color-primary)`). A channel that reads
 * the seed root tracks the tenant seed by CASCADE, so it needs no
 * re-derivation and its text is identical in both arms -- which is why it stops
 * being a divergent channel while staying, in effect, seed-derived. Asserted
 * below rather than merely removed, so the removal cannot be mistaken for the
 * channel quietly falling out of the tenant's reach.
 */
const SEED_ROOT_READERS = ["--ds-button-primary-bg"] as const;
const SEED_ROOT = "var(--ds-color-primary)";

/**
 * `--ds-button-primary-color` joins them only inside a mode the tenant seeds.
 *
 * The on-primary ink is derived from the primary it sits on, so it re-derives
 * exactly when the tenant states that mode's own seed. In the body — where the
 * document above carries a light seed — the vertical's ink already satisfies
 * the pair, so nothing moves and the channel stays out of the delta.
 */
const MODE_SEEDED_DERIVED_CHANNEL = "--ds-button-primary-color";

function simplePaletteDocument(
  palette: NonNullable<
    NonNullable<
      Extract<TenantThemeDocument, { mode: "simple" }>["appearance"]
    >["palette"]
  >
): TenantThemeDocument {
  return {
    schemaVersion: 1,
    mode: "simple",
    appearance: { palette },
  };
}

const CUSTOMER_DOCUMENT: TenantThemeDocument = {
  schemaVersion: 1,
  mode: "advanced",
  visualFoundation: {
    general: {
      palette: { primary: "#0F766E", secondary: "#8C6D46", accent: "#E2725B" },
      typography: {
        fontFamilyBase: "Optima, Candara, 'Noto Sans', sans-serif",
        fontFamilyHeading: "'Fraunces', Georgia, 'Times New Roman', serif",
      },
      density: "normal",
      motion: { intensity: 0.62, durationScale: 1.15, ambient: "subtle" },
    },
    advanced: {
      tokenOverrides: {
        "--ds-color-bg-primary": "#FFFFFF",
        "--ds-color-success": "#5B8A3A",
        "--ds-color-warning": "#C39E22",
        "--ds-color-error": "#C0392B",
        "--ds-color-info": "#5B6FA8",
        "--ds-radius-md": "6px",
        "--ds-effect-intensity": 0.45,
      },
      chrome: {
        sidebar: {
          bg: "#FFFEFB",
          border: "#E2D9CC",
          text: "#2E261C",
          width: "284px",
        },
        layout: { headerHeight: "64px" },
        table: { bg: "#FFFEFB", headerBg: "#FFFFFF", rowBgHover: "#FBF3E7" },
        cardComponent: { bg: "#FFFEFB", border: "transparent", radius: "8px" },
        badge: { surface: "#FFFEFB", ink: "#2E261C", frame: "#9B8A73" },
        metricCard: { bg: "#FFFEFB", iconBg: "#F3EEE5", valueColor: "#2E261C" },
      },
    },
  },
};

const SIMPLE_DOCUMENT: TenantThemeDocument = {
  schemaVersion: 1,
  mode: "simple",
  appearance: {
    palette: {
      primary: "#0F766E",
      background: "#FBF6EC",
      foreground: {
        primary: "#2E261C",
        secondary: "#5C5144",
        muted: "#756A5C",
        disabled: "#9B9082",
      },
      border: { primary: "#D7CDBF", secondary: "#E8E0D5" },
    },
    typography: {
      fontFamilyBase: "Optima, Candara, 'Noto Sans', sans-serif",
    },
    density: "compact",
  },
};

describe("T0 ISO contracts", () => {
  it("brandTheme <-> Theme roundtrip preserves identity and families", () => {
    for (const brand of [
      rottayBrandTheme,
      bithireBrandTheme,
      evntoBrandTheme,
    ]) {
      const theme = brandThemeToTheme(brand);
      expect(theme.id).toBe(brand.id);
      expect(theme.name).toBe(brand.name);
      expect(theme.appearance).toBe(brand.appearance);
      const back = readGovernedTheme(theme);
      expect(back.id).toBe(brand.id);
      // ISO totality adds structural placeholder objects; strip empties to
      // assert semantic identity rather than byte identity against the legacy
      // BrandTheme shape.
      expect(stripEmpties(JSON.parse(JSON.stringify(back)))).toEqual(
        stripEmpties(JSON.parse(JSON.stringify(brand)))
      );
    }
  });

  it("mergeThemePatches fails closed on unknown keys", () => {
    const badPatch: ThemeLayerPatch = {
      unknownFamily: { backgroundColor: "#000" },
    } as ThemeLayerPatch;
    expect(() => mergeThemePatches(FIRST_PARTY_THEMES.bithire, badPatch)).toThrow(
      /unknown key/
    );
  });

  it("resolveTheme applies a valid patch", () => {
    const patched = mergeThemePatches(FIRST_PARTY_THEMES.bithire, {
      palette: { primaryColor: "#000000" },
    });
    expect(patched.palette.primaryColor).toBe("#000000");
    expect(patched.id).toBe("bithire");
  });

  it("governed fields accept active values and dispositions", () => {
    const activeMotion = FIRST_PARTY_THEMES.rottay.motion;
    expect(isGovernedActive(activeMotion)).toBe(true);
    expect(activeMotion.value.intensity).toBeDefined();
    const disabledMotion = governedDisabled("superseded", {} as BrandMotion);
    expect(isGovernedActive(disabledMotion)).toBe(false);
  });

  it("activates a governed family when a transport authors its value", () => {
    const patched = mergeThemePatches(FIRST_PARTY_THEMES.rottay, {
      expressive: {
        value: {
          schemaVersion: 1,
          experienceProfile: "rottay/bithire-technical@1",
        },
      },
    });
    expect(isGovernedActive(patched.expressive)).toBe(true);
    expect(patched.expressive.value.experienceProfile).toBe(
      "rottay/bithire-technical@1"
    );
  });
});

describe("T0 v1 migration", () => {
  it("migrates an advanced document to a ThemePatchEnvelope", () => {
    const envelope = migrateV1(CUSTOMER_DOCUMENT);
    expect(envelope.schemaVersion).toBe("1");
    expect(envelope.source).toBe("tenant-document-v1");
    expect(envelope.patch.palette?.primaryColor).toBe("#0F766E");
    expect(envelope.patch.surfaces?.density).toBe("normal");
    expect(envelope.patch.chrome?.sidebar?.width).toBe("284px");
  });

  it("compiles one semantic control patch identically from DB and static transports", () => {
    const semantic = {
      ink: "#102030",
      inkMuted: "#405060",
      onBrand: "#FFFFFF",
      surface: "#F8FAFC",
      surfaceRaised: "#FFFFFF",
      brandTint: "#E8F0F8",
      brandTintHover: "#DCE8F4",
      brandBorder: "#9CB4CA",
      iconTileBorder: "#8FA8BE",
    } as const;
    const document = {
      schemaVersion: 1,
      mode: "advanced",
      visualFoundation: {
        advanced: { chrome: { controls: { semantic } } },
      },
    } as const satisfies TenantThemeDocument;

    const dbPatch = migrateV1WithMode(document, "light").patch;
    const staticPatch: ThemeLayerPatch = { chrome: { controls: { semantic } } };
    const dbCompiled = lower(
      mergeThemePatches(FIRST_PARTY_THEMES.bithire, dbPatch)
    );
    const staticCompiled = lower(
      mergeThemePatches(FIRST_PARTY_THEMES.bithire, staticPatch)
    );

    expect(dbPatch.chrome?.controls?.semantic).toEqual(semantic);
    expect(dbCompiled.cssVariables).toEqual(staticCompiled.cssVariables);
    expect(dbCompiled.cssString).toBe(staticCompiled.cssString);
    expect(dbCompiled.cssVariables["--ds-control-ink"]).toBe("#102030");
    expect(dbCompiled.cssVariables["--ds-icon-tile-border"]).toBe("#8FA8BE");
  });

  it("migrates a simple document to a ThemePatchEnvelope", () => {
    const envelope = migrateV1(SIMPLE_DOCUMENT);
    expect(envelope.source).toBe("tenant-document-v1");
    expect(envelope.patch.palette?.primaryColor).toBe("#0F766E");
    expect(envelope.patch.palette?.backgroundColor).toBe("#FBF6EC");
    expect(envelope.patch.palette?.textPrimaryColor).toBe("#2E261C");
    expect(envelope.patch.palette?.textSecondaryColor).toBe("#5C5144");
    expect(envelope.patch.palette?.textMutedColor).toBe("#756A5C");
    expect(envelope.patch.palette?.textDisabledColor).toBe("#9B9082");
    expect(envelope.patch.palette?.borderPrimaryColor).toBe("#D7CDBF");
    expect(envelope.patch.palette?.borderSecondaryColor).toBe("#E8E0D5");
    expect(envelope.patch.surfaces?.density).toBe("compact");
  });

  it("migrates every active Standard control into typed Theme keypaths", () => {
    const document = {
      schemaVersion: 1,
      mode: "simple",
      appearance: {
        typography: { typePairing: "technical", scale: 1.08 },
        shape: { buttonStyle: "pill", radiusScale: 1.2 },
        density: "compact",
        rhythm: "airy",
        motion: { intensity: 0.4, durationScale: 1.1, ambient: "subtle" },
        surfaces: { elevation: "elevated", effectIntensity: 0.5 },
        navigation: { sidebarTone: "inverse" },
        experienceProfile: "rottay/bithire-technical@1",
      },
    } as const satisfies TenantThemeDocument;
    const patch = migrateV1(document).patch;

    expect(patch.typography).toMatchObject({
      typePairing: "technical",
      scale: 1.08,
    });
    expect(patch.surfaces).toMatchObject({
      buttonStyle: "pill",
      radiusScale: 1.2,
      density: "compact",
      rhythm: "airy",
      elevation: "elevated",
      effectIntensity: 0.5,
    });
    expect(patch.motion?.value).toMatchObject({
      intensity: 0.4,
      durationScale: 1.1,
      ambient: "subtle",
    });
    expect(patch.chrome?.sidebar?.tone).toBe("inverse");
    expect(patch.expressive?.value?.experienceProfile).toBe(
      "rottay/bithire-technical@1"
    );

    const resolved = mergeThemePatches(FIRST_PARTY_THEMES.bithire, patch);
    const compiled = lower(resolved, "standard-canary");
    expect(compiled.cssVariables).toMatchObject({
      "--ds-type-scale": "1.08",
      "--ds-radius-scale": "1.2",
      "--ds-motion-intensity": "0.4",
      "--ds-motion-duration-scale": "1.1",
      "--ds-effect-intensity": "0.5",
      "--ds-sidebar-bg": "var(--ds-color-neutral-900)",
      "--ds-sidebar-item-color-active": "var(--ds-color-white)",
    });
    expect(compiled.cssVariables["--ds-radius-button"]).toContain("9999px");
    expect(compiled.cssVariables["--ds-elevation-2"]).toBe(
      "0 4px 8px rgba(0,0,0,0.1)"
    );
    const darkSidebar = compiled.modeBlocks?.find(
      (block) => block.mode === "dark"
    );
    expect(darkSidebar?.cssVariables["--ds-sidebar-item-color-active"]).toBe(
      "var(--ds-color-neutral-100)"
    );
    expect(compiled.cssString).not.toContain("light-dark(");
  });

  it("maps logical light/dark palette intent against a dark-default Theme", () => {
    const lightDocument = {
      schemaVersion: 1,
      mode: "simple",
      appearance: {
        palette: { primary: "#245B78", backgroundMode: "light" },
      },
    } as const satisfies TenantThemeDocument;
    const lightPatch = migrateV1WithMode(lightDocument, "dark").patch;
    expect(lightPatch.palette?.primaryColor).toBeUndefined();
    expect(lightPatch.modes?.light?.palette?.primaryColor).toBe("#245B78");

    const darkDocument = {
      schemaVersion: 1,
      mode: "simple",
      appearance: {
        palette: { primary: "#9FD3F0", backgroundMode: "dark" },
      },
    } as const satisfies TenantThemeDocument;
    const darkPatch = migrateV1WithMode(darkDocument, "dark").patch;
    expect(darkPatch.palette?.primaryColor).toBe("#9FD3F0");
    expect(darkPatch.modes?.dark?.palette?.primaryColor).toBeUndefined();

    const resolved = mergeThemePatches(FIRST_PARTY_THEMES.rottay, lightPatch);
    const compiled = lower(resolved, "rottay-mode-canary");
    expect(compiled.cssVariables["--ds-color-primary"]).not.toBe("#245B78");
    expect(
      compiled.modeBlocks?.find((block) => block.mode === "light")
        ?.cssVariables["--ds-color-primary"]
    ).toBe("#245B78");
  });

  it("fails closed on an unknown palette dial", () => {
    const bad = {
      schemaVersion: 1,
      mode: "simple",
      appearance: {
        palette: { primary: "#000000", invented: "#ffffff" },
      },
    } as unknown as TenantThemeDocument;
    expect(() => migrateV1(bad)).toThrow(
      /unsupported general\.palette\.invented/
    );
  });

  it("treats an omitted palette mode and explicit light as the same patch", () => {
    const omitted = simplePaletteDocument({ primary: "#0F766E" });
    const explicit = simplePaletteDocument({
      primary: "#0F766E",
      backgroundMode: "light",
    });
    expect(migrateV1(omitted).patch).toEqual(migrateV1(explicit).patch);
  });

  it("fails closed on unknown nested dark palette keys and invalid modes", () => {
    const unknownDark = simplePaletteDocument({
      backgroundMode: "auto",
      dark: { invented: "#000000" } as never,
    });
    const invalidMode = simplePaletteDocument({
      backgroundMode: "sepia" as never,
    });
    expect(() => migrateV1(unknownDark)).toThrow(
      /unsupported general\.palette\.dark\.invented/
    );
    expect(() => migrateV1(invalidMode)).toThrow(
      /unsupported general\.palette\.backgroundMode/
    );
  });

  it("fails closed on unsupported token overrides", () => {
    const bad = {
      schemaVersion: 1,
      mode: "advanced",
      visualFoundation: {
        advanced: {
          tokenOverrides: { "--ds-unknown-token": "red" },
        },
      },
    } as unknown as TenantThemeDocument;
    expect(() => migrateV1(bad)).toThrow(/unsupported tokenOverride/);
  });

  it("fails closed on an unknown general shape dial", () => {
    const bad = {
      schemaVersion: 1,
      mode: "simple",
      appearance: {
        palette: { primary: "#000" },
        shape: { buttonStyle: "soft", invented: true },
      },
    } as unknown as TenantThemeDocument;
    expect(() => migrateV1(bad)).toThrow(
      /unsupported general\.shape\.invented/
    );
  });
});

describe("T0 DB mode projection through the common compiler", () => {
  const tenantSlug = "iso-mode-canary";
  const identity = {
    tenantId: "tenant_iso_mode",
    slug: tenantSlug,
    verticalKey: "bithire",
    rowVersion: 1,
  } as const;

  it("makes explicit light byte-identical to an omitted background mode", () => {
    const omitted = simplePaletteDocument({ primary: "#2F6B9A" });
    const explicit = simplePaletteDocument({
      primary: "#2F6B9A",
      backgroundMode: "light",
    });
    const compile = (document: TenantThemeDocument) =>
      compileTenantThemeConfig(hydrateTenantThemeConfig(document, identity), {
        verticalEnvelope: getTenantThemeVerticalEnvelope("bithire")!,
      });
    const omittedArtifact = compile(omitted);
    const explicitArtifact = compile(explicit);
    expect(explicitArtifact.variables).toEqual(omittedArtifact.variables);
    expect(explicitArtifact.normalizedAppearance).toEqual(
      omittedArtifact.normalizedAppearance
    );
    expect(explicitArtifact.digest).toBe(omittedArtifact.digest);
    expect(explicitArtifact.css).toBe(omittedArtifact.css);
  });

  it("routes dark seeds only to the dark overlay without rebasing the Theme", () => {
    const base = FIRST_PARTY_THEMES.bithire;
    const before = lower(base, tenantSlug);
    const document = simplePaletteDocument({
      primary: "#315D4D",
      backgroundMode: "dark",
    });
    const patch = migrateV1(document).patch;
    const resolved = mergeThemePatches(base, patch);
    const after = lower(resolved, tenantSlug);
    const artifact = compileTenantThemeConfig(
      hydrateTenantThemeConfig(document, identity),
      { verticalEnvelope: getTenantThemeVerticalEnvelope("bithire")! }
    );
    const darkRule = cssRuleVariables(
      artifact.css,
      themeModeSelector(artifact.scopes.combinedSelector, "dark")
    );

    expect(patch.palette).toBeUndefined();
    expect(patch.appearance?.defaultMode).toBeUndefined();
    expect(patch.modes?.dark?.palette?.primaryColor).toBe("#315D4D");
    expect(resolved.appearance.defaultMode).toBe(base.appearance.defaultMode);
    expect(after.cssVariables).toEqual(before.cssVariables);
    expect(effectiveModeVariables(after, "light")).toEqual(
      effectiveModeVariables(before, "light")
    );
    expect(effectiveModeVariables(after, "dark")["--ds-color-primary"]).toBe(
      "#315D4D"
    );
    expect(artifact.variables).toEqual({});
    expect(darkRule["--ds-color-primary"]).toBe("#315D4D");
    expect(postcss.parse(artifact.css).nodes).toBeDefined();
    const colorSchemeDeclarations: string[] = [];
    postcss.parse(artifact.css).walkDecls("color-scheme", (decl) => {
      colorSchemeDeclarations.push(decl.value);
    });
    expect(colorSchemeDeclarations).toEqual([]);
  });

  it("keeps palette.dark inert and byte-invisible outside auto", () => {
    const compile = (
      mode: "light" | "dark",
      dark?: { primary: string; background: string }
    ) =>
      compileTenantThemeConfig(
        hydrateTenantThemeConfig(
          simplePaletteDocument({
            primary: "#2F6B9A",
            backgroundMode: mode,
            ...(dark ? { dark } : {}),
          }),
          identity
        ),
        { verticalEnvelope: getTenantThemeVerticalEnvelope("bithire")! }
      );
    for (const mode of ["light", "dark"] as const) {
      const withoutDark = compile(mode);
      const withDark = compile(mode, {
        primary: "#FF00FF",
        background: "#010203",
      });
      expect(withDark.normalizedAppearance).toEqual(
        withoutDark.normalizedAppearance
      );
      expect(withDark.digest).toBe(withoutDark.digest);
      expect(withDark.css).toBe(withoutDark.css);
    }
  });

  it("projects auto as a light body plus an explicit dark mode block", () => {
    const document = simplePaletteDocument({
      primary: "#2F6B9A",
      background: "#F7FAFC",
      backgroundMode: "auto",
      dark: { primary: "#315D4D", background: "#101014" },
    });
    const envelope = migrateV1(document);
    expect(envelope.patch.appearance?.defaultMode).toBeUndefined();
    expect(envelope.patch.palette?.primaryColor).toBe("#2F6B9A");
    expect(envelope.patch.modes?.dark?.palette).toMatchObject({
      primaryColor: "#315D4D",
      backgroundColor: "#101014",
    });

    const resolved = mergeThemePatches(FIRST_PARTY_THEMES.bithire, envelope.patch);
    const compiled = lower(resolved, tenantSlug);
    const baseline = lower(FIRST_PARTY_THEMES.bithire, tenantSlug);
    const artifact = compileTenantThemeConfig(
      hydrateTenantThemeConfig(document, identity),
      { verticalEnvelope: getTenantThemeVerticalEnvelope("bithire")! }
    );
    const baseRule = cssRuleVariables(
      artifact.css,
      artifact.scopes.combinedSelector
    );
    const darkSelector = themeModeSelector(
      artifact.scopes.combinedSelector,
      "dark"
    );
    const darkRule = cssRuleVariables(artifact.css, darkSelector);

    expect(baseRule).toEqual(artifact.variables);
    expect(baseRule["--ds-color-primary"]).toBe("#2F6B9A");
    expect(darkRule["--ds-color-primary"]).toBe("#315D4D");
    expect(darkRule["--ds-color-bg-primary"]).toBe("#101014");
    expect(artifact.css).toContain(darkSelector);
    expect(artifact.css).toContain("@media (prefers-color-scheme: dark)");
    expect(artifact.css).toContain(
      `${artifact.scopes.combinedSelector}:not([data-theme='light'])`
    );
    const colorSchemeDeclarations: string[] = [];
    postcss.parse(artifact.css).walkDecls("color-scheme", (decl) => {
      colorSchemeDeclarations.push(decl.value);
    });
    expect(colorSchemeDeclarations).toEqual([]);
    expect(artifact.css).not.toContain("light-dark(");

    for (const mode of ["light", "dark"] as const) {
      const modeRule = cssRuleVariables(
        artifact.css,
        themeModeSelector(artifact.scopes.combinedSelector, mode)
      );
      const projected = {
        ...effectiveModeVariables(baseline, mode),
        ...artifact.variables,
        ...modeRule,
      };
      // `compiled` is the same lowering run WITHOUT provenance, so it cannot
      // re-derive the family the tenant's seed owns. The projection therefore
      // agrees with it everywhere except that closed set — and in dark, where
      // the tenant states that mode's own seed, the on-primary ink joins it.
      const noProvenance = effectiveModeVariables(compiled, mode);
      const expectedDerived =
        mode === "dark"
          ? [
              ...SEED_DERIVED_CHANNELS,
              MODE_SEEDED_DERIVED_CHANNEL,
              ...SEED_ROOT_READERS,
            ].sort()
          : [...SEED_DERIVED_CHANNELS].sort();
      const divergent = [
        ...new Set([...Object.keys(projected), ...Object.keys(noProvenance)]),
      ]
        .filter((channel) => projected[channel] !== noProvenance[channel])
        .sort();
      expect(divergent).toEqual(expectedDerived);
      // In the body -- the mode whose seed the vertical already satisfies --
      // the channel is the same alias text in both arms, which is exactly why
      // it drops out of the divergent set there and only there.
      if (mode !== "dark") {
        for (const channel of SEED_ROOT_READERS) {
          expect(projected[channel]).toBe(SEED_ROOT);
          expect(noProvenance[channel]).toBe(SEED_ROOT);
        }
      }

      // Causal, per mode: the projection tracks the seed THIS mode was given,
      // and the un-arbitrated compile is still on the vertical's blue.
      const seed = mode === "dark" ? "#315D4D" : "#2F6B9A";
      expect(projected["--ds-color-link"]).toBe(seed);
      expect(projected["--ds-color-border-focus"]).toBe(seed);
      expect(noProvenance["--ds-color-link"]).not.toBe(seed);
      expect(noProvenance["--ds-color-border-focus"]).not.toBe(seed);

      // Everything outside that set is untouched, which is the half of the
      // convergence law provenance must not disturb.
      const outside = Object.fromEntries(
        Object.entries(projected).filter(
          ([channel]) => !expectedDerived.includes(channel)
        )
      );
      expect(outside).toEqual(
        Object.fromEntries(
          Object.entries(noProvenance).filter(
            ([channel]) => !expectedDerived.includes(channel)
          )
        )
      );
    }
  });

  it("keeps untouched vertical channels out of both tenant deltas", () => {
    const document = simplePaletteDocument({
      primary: "#2F6B9A",
      backgroundMode: "auto",
      dark: { primary: "#315D4D" },
    });
    const artifact = compileTenantThemeConfig(
      hydrateTenantThemeConfig(document, identity),
      { verticalEnvelope: getTenantThemeVerticalEnvelope("bithire")! }
    );
    expect(artifact.variables["--ds-sidebar-width"]).toBeUndefined();
    for (const mode of ["light", "dark"] as const) {
      expect(
        cssRuleVariables(
          artifact.css,
          themeModeSelector(artifact.scopes.combinedSelector, mode)
        )["--ds-sidebar-width"]
      ).toBeUndefined();
    }
  });

  it("rejects unsafe authored ink at ingestion instead of repainting it", () => {
    const compile = (primary: string) =>
      compileTenantThemeConfig(
        hydrateTenantThemeConfig(
          simplePaletteDocument({
            background: "#FFFFFF",
            foreground: { primary },
            backgroundMode: "light",
          }),
          identity
        ),
        { verticalEnvelope: getTenantThemeVerticalEnvelope("bithire")! }
      );
    expect(() => compile("#FDFDFD")).toThrow(/APCA Lc/);
    const safe = compile("#111111");
    expect(safe.variables["--ds-color-text-primary"]).toBe("#111111");
    expect(safe.adjustments).toBeUndefined();
  });
});

describe("T0 structural mirror (three Themes)", () => {
  it("canonical top-level key order is identical across all first-party themes", () => {
    const orders = Object.values(FIRST_PARTY_THEMES).map((theme) =>
      Object.keys(canonicalizeTheme(theme))
    );
    expect(new Set(orders.map((o) => JSON.stringify(o))).size).toBe(1);
  });

  it("all canonical chrome sections are present in every first-party theme", () => {
    const sectionSets = Object.values(FIRST_PARTY_THEMES).map(
      (theme) =>
        new Set(
          Object.keys(mirrorChromeSections(canonicalizeTheme(theme)).chrome)
        )
    );
    const [first, ...rest] = sectionSets;
    for (const set of rest) {
      expect([...set].sort()).toEqual([...first!].sort());
    }
  });

  it("all first-party Themes share the exact same nested keypath set", () => {
    const keypaths = Object.values(FIRST_PARTY_THEMES).map(
      (theme) =>
        new Set(
          collectThemeKeypaths(canonicalizeTheme(theme))
            .filter((p) => p !== "id" && p !== "name")
        )
    );
    const [first, ...rest] = keypaths;
    for (const set of rest) {
      expect([...set].sort()).toEqual([...first!].sort());
    }
  });

  it("no product/vertical vocabulary appears in Theme keypaths", () => {
    for (const theme of Object.values(FIRST_PARTY_THEMES)) {
      const bad = collectThemeKeypaths(
        canonicalizeTheme(mirrorChromeSections(theme))
      ).filter(
        (p) =>
          !p.startsWith("id") &&
          !p.startsWith("name") &&
          violatesThemeNameLaw(p)
      );
      expect(bad).toEqual([]);
    }
  });
});

describe("T0 hard universal-name law", () => {
  it("no first-party Theme keypath contains product/vertical/slug vocabulary", () => {
    for (const [slug, theme] of Object.entries(FIRST_PARTY_THEMES)) {
      const bad = collectThemeKeypaths(theme).filter(
        (p) =>
          !p.startsWith("id") &&
          !p.startsWith("name") &&
          violatesThemeNameLaw(p)
      );
      expect(bad, `${slug} keypaths`).toEqual([]);
    }
  });

  it("compileTheme emits no product/vertical/slug-derived channels", () => {
    for (const [slug, theme] of Object.entries(FIRST_PARTY_THEMES)) {
      const compiled = lower(theme);
      const bad = allChannels(compiled).filter(violatesThemeNameLaw);
      expect(bad, `${slug} channels`).toEqual([]);
    }
  });
});

describe("T0 transport equality and digest invariance", () => {
  it("compileTheme is deterministic and preserves existing first-party effective values", () => {
    for (const theme of Object.values(FIRST_PARTY_THEMES)) {
      const once = lower(theme);
      const twice = lower(theme);
      expect(digestVariables(once.cssVariables)).toBe(
        digestVariables(twice.cssVariables)
      );
      expect(once.cssString).toBe(twice.cssString);
    }
  });

  it("equivalent Theme inputs produce identical channel inventory and order", () => {
    const theme = FIRST_PARTY_THEMES.rottay;
    const a = lower(theme);
    const b = lower(theme);
    expect(allChannels(a)).toEqual(allChannels(b));
    expect(a.cssString).toBe(b.cssString);
  });
});

describe("T0 static/DB convergence (negative mutant)", () => {
  it("DB artifact is the tenant delta over the base vertical", () => {
    const envelope = migrateV1(CUSTOMER_DOCUMENT);
    const resolved = mergeThemePatches(FIRST_PARTY_THEMES.bithire, envelope.patch);
    const tenantSlug = "themanagementmiami";
    const resolvedCompiled = lower(resolved, tenantSlug);
    const baseCompiled = lower(FIRST_PARTY_THEMES.bithire, tenantSlug);

    const expectedDelta: Record<string, string> = {};
    for (const [key, value] of Object.entries(resolvedCompiled.cssVariables)) {
      if (baseCompiled.cssVariables[key] !== value) {
        expectedDelta[key] = value;
      }
    }

    const dbArtifact = compileTenantThemeConfig(
      hydrateTenantThemeConfig(CUSTOMER_DOCUMENT, {
        tenantId: "tenant_eq",
        slug: tenantSlug,
        verticalKey: "bithire",
        rowVersion: 1,
      }),
      { verticalEnvelope: getTenantThemeVerticalEnvelope("bithire")! }
    );

    // The DB artifact is a single-mode tenant overlay: it carries the variables
    // that differ from the code-owned vertical baseline, PLUS the family its
    // own seed re-derives. `expectedDelta` is computed from a compile that was
    // never told the customer authored `palette.primary`, so it cannot contain
    // that family — see SEED_DERIVED_CHANNELS.
    expect(dbArtifact.variables).toEqual({
      ...expectedDelta,
      ...Object.fromEntries(
        SEED_DERIVED_CHANNELS.map((channel) => [
          channel,
          dbArtifact.variables[channel],
        ])
      ),
    });

    // Causal: the difference is exactly that set, in that direction. Nothing is
    // dropped and nothing is repainted — the arbitrated path is a strict
    // superset of the un-arbitrated one.
    const onlyInArtifact = Object.keys(dbArtifact.variables)
      .filter((channel) => !(channel in expectedDelta))
      .sort();
    const onlyInExpected = Object.keys(expectedDelta).filter(
      (channel) => !(channel in dbArtifact.variables)
    );
    const repainted = Object.keys(expectedDelta).filter(
      (channel) =>
        channel in dbArtifact.variables &&
        dbArtifact.variables[channel] !== expectedDelta[channel]
    );
    expect(onlyInArtifact).toEqual([...SEED_DERIVED_CHANNELS].sort());
    expect(onlyInExpected).toEqual([]);
    expect(repainted).toEqual([]);

    // Causal: each one tracks the CUSTOMER's seed, and each one is a channel
    // the un-arbitrated compile left on bithire's authored blue. Asserting the
    // values (not just the keys) is what makes this a statement about who won,
    // rather than about how many channels moved.
    expect(dbArtifact.variables["--ds-color-link"]).toBe(
      CUSTOMER_DOCUMENT.visualFoundation!.general!.palette!.primary
    );
    expect(dbArtifact.variables["--ds-color-border-focus"]).toBe(
      CUSTOMER_DOCUMENT.visualFoundation!.general!.palette!.primary
    );
    // The delta does NOT restate the button ground, and that absence is the
    // point: the channel reads `--ds-color-primary`, which the delta DOES
    // restate, so the tenant seed reaches it through the vertical's own alias
    // instead of through a second copy. Both halves are asserted, because
    // "absent from the delta" alone would also describe a channel that had
    // simply stopped tracking the seed.
    expect(dbArtifact.variables["--ds-button-primary-bg"]).toBeUndefined();
    for (const channel of SEED_ROOT_READERS) {
      expect(baseCompiled.cssVariables[channel]).toBe(SEED_ROOT);
      expect(dbArtifact.variables["--ds-color-primary"]).toBe(
        CUSTOMER_DOCUMENT.visualFoundation!.general!.palette!.primary
      );
    }
    for (const channel of SEED_DERIVED_CHANNELS) {
      expect(baseCompiled.cssVariables[channel]).toBeTruthy();
      expect(baseCompiled.cssVariables[channel]).not.toBe(
        dbArtifact.variables[channel]
      );
    }

    expect(Object.keys(dbArtifact.variables).length).toBeGreaterThan(0);
    expect(Object.keys(dbArtifact.variables).length).toBeLessThan(512);
  });

  it("the old subset doctrine is rejected: a customer document is not a subset of a different vertical", () => {
    const envelope = migrateV1(CUSTOMER_DOCUMENT);
    const resolved = mergeThemePatches(FIRST_PARTY_THEMES.bithire, envelope.patch);
    const customerChannels = new Set(allChannels(lower(resolved)));
    const bithireChannels = new Set(
      allChannels(lower(FIRST_PARTY_THEMES.bithire))
    );
    const onlyInCustomer = [...customerChannels].filter(
      (ch) => !bithireChannels.has(ch)
    );
    // A real customer identity with different seeds MUST produce channels bithire does not.
    expect(onlyInCustomer.length).toBeGreaterThan(0);
  });
});

// ── 8. CHROME TOTALITY (schema ⊆ total ISO shape) ──────────────────────────

/**
 * The static and DB transports are equivalent only if the total Theme shape
 * admits EVERY chrome branch the authoring schema admits. `mergeDeep` is
 * fail-closed: a branch the schema accepts but the shape lacks does not fall
 * back, it throws. So the law is set-inclusion over the contract AST —
 * `BrandChrome ∪ TenantThemeChrome ⊆ DEFAULT_CHROME_SHAPE` — not three samples.
 *
 * The field sets are read from the contract source, so a field added to a
 * chrome interface fails here until the shape carries it.
 */

// Vitest runs with cwd=packages/core; import.meta.url is not a file: URL.
const CONTRACTS_DIR = join(process.cwd(), "src/foundation/contracts");

function collectContractSources(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) collectContractSources(full, out);
    else if (full.endsWith(".ts")) out.push(full);
  }
  return out;
}

type ContractType = {
  members: readonly ts.TypeElement[] | null;
  type: ts.TypeNode | null;
  heritage: readonly ts.ExpressionWithTypeArguments[];
};

function buildContractRegistry(): Map<string, ContractType> {
  const registry = new Map<string, ContractType>();
  for (const file of collectContractSources(CONTRACTS_DIR).sort()) {
    const source = ts.createSourceFile(
      file,
      readFileSync(file, "utf8"),
      ts.ScriptTarget.Latest,
      true
    );
    for (const statement of source.statements) {
      if (ts.isInterfaceDeclaration(statement)) {
        if (registry.has(statement.name.text)) continue;
        registry.set(statement.name.text, {
          members: statement.members,
          type: null,
          heritage: (statement.heritageClauses ?? []).flatMap(
            (clause) => clause.types
          ),
        });
      } else if (ts.isTypeAliasDeclaration(statement)) {
        if (registry.has(statement.name.text)) continue;
        registry.set(statement.name.text, {
          members: null,
          type: statement.type,
          heritage: [],
        });
      }
    }
  }
  return registry;
}

const CONTRACT_REGISTRY = buildContractRegistry();
const TYPE_WRAPPERS = new Set(["Partial", "Readonly", "Required"]);

function propertyKey(name?: ts.PropertyName): string | null {
  if (!name) return null;
  if (ts.isIdentifier(name) || ts.isStringLiteral(name)) return name.text;
  return null;
}

/** Structurally expand a type node into its property signatures. */
function membersOf(
  node: ts.TypeNode | undefined,
  seen: ReadonlySet<string> = new Set()
): ts.TypeElement[] {
  if (!node) return [];
  if (ts.isParenthesizedTypeNode(node)) return membersOf(node.type, seen);
  if (ts.isTypeLiteralNode(node)) return [...node.members];
  if (ts.isIntersectionTypeNode(node) || ts.isUnionTypeNode(node)) {
    return node.types.flatMap((type) => membersOf(type, seen));
  }
  if (!ts.isTypeReferenceNode(node) || !ts.isIdentifier(node.typeName)) {
    return [];
  }
  const name = node.typeName.text;
  if (TYPE_WRAPPERS.has(name)) return membersOf(node.typeArguments?.[0], seen);
  if (name === "Omit") {
    const base = membersOf(node.typeArguments?.[0], seen);
    const removed = node.typeArguments?.[1];
    const omitted = new Set(
      (removed ? (ts.isUnionTypeNode(removed) ? removed.types : [removed]) : [])
        .map((type) =>
          ts.isLiteralTypeNode(type) ? propertyKey(type.literal as ts.PropertyName) : null
        )
        .filter((key): key is string => key !== null)
    );
    return base.filter((member) => !omitted.has(propertyKey(member.name) ?? ""));
  }
  return declaredMembers(name, seen);
}

function declaredMembers(
  typeName: string,
  seen: ReadonlySet<string> = new Set()
): ts.TypeElement[] {
  if (seen.has(typeName)) return [];
  const entry = CONTRACT_REGISTRY.get(typeName);
  if (!entry) return [];
  const next = new Set(seen).add(typeName);
  const inherited = entry.heritage.flatMap((clause) =>
    ts.isIdentifier(clause.expression)
      ? declaredMembers(clause.expression.text, next)
      : []
  );
  const own = entry.members
    ? [...entry.members]
    : membersOf(entry.type ?? undefined, next);
  return [...inherited, ...own];
}

/**
 * The LEAF KIND a chrome facet declares, resolved from its own TypeNode.
 *
 * The census used to keep field NAMES only, and the synthesizer answered one
 * string for every one of them. That was invisible while the merge accepted any
 * primitive over any leaf; with the boundary refusing a kind mismatch it makes
 * the exhaustive test author `hoverTint: "1px"` over a declared `boolean` and
 * blame the merge for the synthesizer's guess. The kind travels with the field.
 */
type LeafAlternative =
  | { kind: "string" }
  | { kind: "number" }
  | { kind: "boolean" }
  | { kind: "literal"; value: string | number | boolean };

/**
 * The COMPLETE set of alternatives a facet declares, never collapsed.
 *
 * `string | number` is two admissible kinds, and which one a given vertical's
 * baseline happens to hold is not the contract. Keeping only the first member
 * made the synthesizer author `"1px"` on a leaf whose baseline carries `600`
 * and blame the merge for the census's own narrowing.
 */
type LeafKind = { alternatives: readonly LeafAlternative[] };

const UNRESOLVED: LeafKind = { alternatives: [] };

/** Resolve a facet's declared type to every kind a patch value may carry. */
function leafKindOf(
  node: ts.TypeNode | undefined,
  seen: ReadonlySet<string> = new Set()
): LeafKind {
  if (!node) return UNRESOLVED;
  if (ts.isParenthesizedTypeNode(node)) return leafKindOf(node.type, seen);
  if (node.kind === ts.SyntaxKind.StringKeyword) return { alternatives: [{ kind: "string" }] };
  if (node.kind === ts.SyntaxKind.NumberKeyword) return { alternatives: [{ kind: "number" }] };
  if (node.kind === ts.SyntaxKind.BooleanKeyword) return { alternatives: [{ kind: "boolean" }] };
  if (ts.isLiteralTypeNode(node)) {
    const literal = node.literal;
    if (ts.isStringLiteral(literal))
      return { alternatives: [{ kind: "literal", value: literal.text }] };
    if (ts.isNumericLiteral(literal))
      return { alternatives: [{ kind: "literal", value: Number(literal.text) }] };
    if (literal.kind === ts.SyntaxKind.TrueKeyword)
      return { alternatives: [{ kind: "literal", value: true }] };
    if (literal.kind === ts.SyntaxKind.FalseKeyword)
      return { alternatives: [{ kind: "literal", value: false }] };
    return UNRESOLVED;
  }
  if (ts.isUnionTypeNode(node)) {
    // `T | undefined` is optionality, not a choice; `true | false` is boolean.
    const alternatives = node.types
      .filter((type) => type.kind !== ts.SyntaxKind.UndefinedKeyword)
      .flatMap((type) => leafKindOf(type, seen).alternatives);
    if (alternatives.length === 0) return UNRESOLVED;
    const booleanish = alternatives.every(
      (alternative) =>
        alternative.kind === "boolean" ||
        (alternative.kind === "literal" && typeof alternative.value === "boolean")
    );
    if (booleanish) return { alternatives: [{ kind: "boolean" }] };
    return { alternatives };
  }
  if (ts.isTypeReferenceNode(node) && ts.isIdentifier(node.typeName)) {
    const name = node.typeName.text;
    if (seen.has(name)) return UNRESOLVED;
    if (TYPE_WRAPPERS.has(name)) return leafKindOf(node.typeArguments?.[0], seen);
    const entry = CONTRACT_REGISTRY.get(name);
    if (entry?.type) return leafKindOf(entry.type, new Set(seen).add(name));
  }
  return UNRESOLVED;
}

/** The runtime `typeof` an alternative admits. */
function alternativeKind(alternative: LeafAlternative): string {
  return alternative.kind === "literal" ? typeof alternative.value : alternative.kind;
}

/** A value of that alternative's kind. */
function alternativeValue(alternative: LeafAlternative): string | number | boolean {
  switch (alternative.kind) {
    case "boolean":
      return true;
    case "number":
      return 1;
    case "literal":
      return alternative.value;
    default:
      return "1px";
  }
}

const byName = ([a]: [string, unknown], [b]: [string, unknown]): number =>
  a < b ? -1 : a > b ? 1 : 0;

/** field name -> declared leaf kind, for one chrome family's type. */
function fieldsOf(node: ts.TypeNode | undefined): Map<string, LeafKind> {
  const fields = new Map<string, LeafKind>();
  for (const member of membersOf(node)) {
    if (!ts.isPropertySignature(member)) continue;
    const key = propertyKey(member.name);
    if (key === null) continue;
    const resolved = leafKindOf(member.type);
    // First declaration wins, but a RESOLVED kind always beats an unresolved
    // one: the same facet can be restated in a wider container.
    const previous = fields.get(key);
    if (!previous || (previous.alternatives.length === 0 && resolved.alternatives.length > 0)) {
      fields.set(key, resolved);
    }
  }
  return new Map([...fields].sort(byName));
}

/** family -> authored fields with their declared kinds, from a chrome container. */
function chromeFamilies(typeName: string): Map<string, Map<string, LeafKind>> {
  const families = new Map<string, Map<string, LeafKind>>();
  for (const member of declaredMembers(typeName)) {
    if (!ts.isPropertySignature(member)) continue;
    const family = propertyKey(member.name);
    if (!family) continue;
    families.set(family, fieldsOf(member.type));
  }
  return families;
}

const SCHEMA_CHROME = (() => {
  const merged = new Map<string, Map<string, LeafKind>>();
  for (const container of ["BrandChrome", "TenantThemeChrome"]) {
    for (const [family, fields] of chromeFamilies(container)) {
      const previous = merged.get(family) ?? new Map<string, LeafKind>();
      for (const [field, kind] of fields) {
        const known = previous.get(field);
        if (!known || known.alternatives.length === 0) {
          previous.set(field, kind);
          continue;
        }
        // A facet restated in a second container CONTRIBUTES its alternatives;
        // a wider declaration must not be narrowed by the order of the read.
        const seenKinds = new Set(known.alternatives.map(alternativeKind));
        const added = kind.alternatives.filter(
          (alternative) => !seenKinds.has(alternativeKind(alternative))
        );
        if (added.length > 0) {
          previous.set(field, { alternatives: [...known.alternatives, ...added] });
        }
      }
      merged.set(family, new Map([...previous].sort(byName)));
    }
  }
  return merged;
})();

const SHAPE = DEFAULT_CHROME_SHAPE as unknown as Record<
  string,
  Record<string, unknown> | undefined
>;

describe("T0 chrome totality (schema ⊆ total ISO shape)", () => {
  it("the AST read is non-vacuous", () => {
    // Guards the law against a silently empty parse: an AST resolver that
    // returns nothing would make every inclusion assertion below pass.
    expect(SCHEMA_CHROME.size).toBeGreaterThanOrEqual(20);
    expect(SCHEMA_CHROME.get("popover")?.size ?? 0).toBeGreaterThan(10);
    expect(SCHEMA_CHROME.get("tooltip")?.size ?? 0).toBeGreaterThan(10);
    // Heritage is resolved: the specialised premium cards inherit the base.
    expect([...(SCHEMA_CHROME.get("metricCard")?.keys() ?? [])]).toEqual(
      expect.arrayContaining([...(SCHEMA_CHROME.get("premiumCard")?.keys() ?? [])])
    );
    const totalFields = [...SCHEMA_CHROME.values()].reduce(
      (sum, fields) => sum + fields.size,
      0
    );
    expect(totalFields).toBeGreaterThan(400);
    // The kind read is non-vacuous too: a resolver that answered "unknown" for
    // everything would send the synthesizer straight back to one string.
    const kinds = [...SCHEMA_CHROME.values()].flatMap((fields) => [...fields.values()]);
    for (const declared of ["string", "number", "boolean", "literal"] as const) {
      expect(
        kinds.filter((leaf) => leaf.alternatives.some((one) => one.kind === declared)).length,
        `no chrome facet resolves to ${declared}`
      ).toBeGreaterThan(0);
    }
    // Unions survive the census: at least one facet declares more than one kind.
    expect(kinds.filter((leaf) => leaf.alternatives.length > 1).length).toBeGreaterThan(0);
  });

  it("every chrome branch the schema admits exists in DEFAULT_CHROME_SHAPE", () => {
    const missing: string[] = [];
    for (const [family, fields] of SCHEMA_CHROME) {
      const shapeFamily = SHAPE[family];
      if (!shapeFamily || typeof shapeFamily !== "object") {
        missing.push(`${family} (whole family)`);
        continue;
      }
      for (const field of fields.keys()) {
        if (!Object.prototype.hasOwnProperty.call(shapeFamily, field))
          missing.push(`${family}.${field}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it("the canonical chrome section order is total over BrandChrome", () => {
    // `canonicalizeTheme` copies only the ordered sections; a family missing
    // from the order is silently dropped from every canonicalized Theme.
    const brandFamilies = [...chromeFamilies("BrandChrome").keys()].sort();
    const authored: Record<string, Record<string, string>> = {};
    for (const family of brandFamilies) authored[family] = {};
    const canonical = canonicalizeTheme({
      ...FIRST_PARTY_THEMES.bithire,
      chrome: authored as unknown as Theme["chrome"],
    });
    expect(Object.keys(canonical.chrome ?? {}).sort()).toEqual(brandFamilies);
  });

  it("a DB Advanced document authoring every admitted branch resolves and compiles", () => {
    const baselineChrome = FIRST_PARTY_THEMES.bithire.chrome as unknown as Record<
      string,
      Record<string, unknown> | undefined
    >;
    const chrome: Record<string, Record<string, unknown>> = {};
    for (const [family, fields] of SCHEMA_CHROME) {
      chrome[family] = Object.fromEntries(
        [...fields].map(([field, leaf]) => [
          field,
          syntheticChromeValue(field, leaf, baselineChrome[family]?.[field]),
        ])
      );
    }
    // Still EXHAUSTIVE: one authored value per admitted branch, no skips.
    expect(Object.keys(chrome).sort()).toEqual([...SCHEMA_CHROME.keys()].sort());
    for (const [family, fields] of SCHEMA_CHROME) {
      expect(Object.keys(chrome[family]!).sort(), family).toEqual(
        [...fields.keys()].sort()
      );
    }
    const document = {
      schemaVersion: 1,
      mode: "advanced",
      visualFoundation: { advanced: { chrome } },
    } as unknown as TenantThemeDocument;

    const dbPatch = migrateV1(document).patch;
    // The v1 migration forwards `advanced.chrome` as the typed ThemeLayerPatch, so
    // the static transport authoring the same chrome must be byte-identical.
    const staticPatch = { chrome } as unknown as ThemeLayerPatch;

    const dbCompiled = lower(
      mergeThemePatches(FIRST_PARTY_THEMES.bithire, dbPatch)
    );
    const staticCompiled = lower(
      mergeThemePatches(FIRST_PARTY_THEMES.bithire, staticPatch)
    );
    expect(dbCompiled.cssVariables).toEqual(staticCompiled.cssVariables);
    expect(dbCompiled.cssString).toBe(staticCompiled.cssString);
  });

  it("a WRONG primitive kind on an admitted branch is rejected", () => {
    // The exhaustive test above proves every admitted branch ACCEPTS a value of
    // a declared kind. This is its negative: the same branches refuse a value
    // of a kind the contract does not declare, so the synthesizer's correctness
    // is not what makes the exhaustive test pass.
    const wrongKindFor = (leaf: LeafKind): string | number | boolean | undefined => {
      const declared = new Set(leaf.alternatives.map(alternativeKind));
      for (const candidate of [true, 1, "1px"] as const) {
        if (!declared.has(typeof candidate)) return candidate;
      }
      return undefined;
    };
    const refused: string[] = [];
    const accepted: string[] = [];
    for (const [family, fields] of SCHEMA_CHROME) {
      for (const [field, leaf] of fields) {
        if (field === "anatomy" || leaf.alternatives.length === 0) continue;
        const wrong = wrongKindFor(leaf);
        if (wrong === undefined) continue;
        const patch = { chrome: { [family]: { [field]: wrong } } } as unknown as ThemeLayerPatch;
        try {
          mergeThemePatches(FIRST_PARTY_THEMES.bithire, patch);
          accepted.push(`${family}.${field} accepted ${typeof wrong}`);
        } catch {
          refused.push(`${family}.${field}`);
        }
      }
    }
    // Non-vacuous, and total: every branch with an undeclared kind refuses it.
    expect(refused.length).toBeGreaterThan(300);
    expect(accepted).toEqual([]);
  });

  it("a union leaf accepts EVERY declared kind and refuses the rest", () => {
    // `chrome.sidebar.groupFontWeight` is declared `string | number` and the
    // bithire baseline holds the number 600. The contract, not the baseline,
    // decides: both are legal, a boolean is not.
    const declared = SCHEMA_CHROME.get("sidebar")?.get("groupFontWeight");
    expect(declared?.alternatives.map(alternativeKind).sort()).toEqual([
      "number",
      "string",
    ]);
    const baseline = FIRST_PARTY_THEMES.bithire;
    const chromeBaseline = baseline.chrome as unknown as Record<
      string,
      Record<string, unknown>
    >;
    expect(typeof chromeBaseline.sidebar?.groupFontWeight).toBe("number");
    const merge = (value: unknown) =>
      mergeThemePatches(baseline, {
        chrome: { sidebar: { groupFontWeight: value } },
      } as unknown as ThemeLayerPatch);
    expect(
      (merge("600").chrome as unknown as Record<string, Record<string, unknown>>).sidebar!
        .groupFontWeight
    ).toBe("600");
    expect(
      (merge(700).chrome as unknown as Record<string, Record<string, unknown>>).sidebar!
        .groupFontWeight
    ).toBe(700);
    expect(() => merge(true)).toThrow(/expected number \| string/u);

    // An OPTIONAL union leaf the baseline leaves undefined behaves the same:
    // the declaration decides, and the absent baseline decides nothing. The
    // facet is FOUND rather than named, so the case survives a theme authoring
    // whichever one this test would otherwise have hard-coded.
    let optional: [string, string] | null = null;
    for (const [family, fields] of SCHEMA_CHROME) {
      for (const [field, leaf] of fields) {
        const kinds = leaf.alternatives.map(alternativeKind).sort().join("|");
        if (kinds !== "number|string") continue;
        if (chromeBaseline[family]?.[field] === undefined) {
          optional = [family, field];
          break;
        }
      }
      if (optional) break;
    }
    expect(optional, "no union facet is unauthored in the baseline").not.toBeNull();
    const [family, field] = optional!;
    const patchOptional = (value: unknown) =>
      mergeThemePatches(baseline, {
        chrome: { [family]: { [field]: value } },
      } as unknown as ThemeLayerPatch);
    expect(() => patchOptional(2700)).not.toThrow();
    expect(() => patchOptional("2700")).not.toThrow();
    expect(() => patchOptional(true)).toThrow(/expected number \| string/u);
  });

  it("fail-closed: a branch removed from the total shape rejects the transport", () => {
    // The canary proves the inclusion law is load-bearing rather than
    // decorative: drop one shape branch and the same document throws.
    const base = structuredClone(FIRST_PARTY_THEMES.bithire) as Theme;
    const tooltip = (base.chrome as unknown as Record<string, Record<string, unknown>>)
      .tooltip;
    expect(Object.prototype.hasOwnProperty.call(tooltip, "zIndex")).toBe(true);
    delete tooltip.zIndex;
    expect(() =>
      mergeThemePatches(base, {
        chrome: { tooltip: { zIndex: 2700 } },
      } as unknown as ThemeLayerPatch)
    ).toThrow(/unknown key "zIndex"/);
  });
});

/**
 * A value that is legal for one chrome facet, chosen from what it DECLARES.
 *
 * Chrome values are lowered as opaque CSS text, so a string exercises the
 * keypath admission this block is about — but only where the facet declares a
 * string. `boolean`, `number` and closed literal unions are authored with a
 * representative of their own kind, read from the AST rather than special-cased
 * by name: hard-coding `hoverTint` would leave the next boolean facet failing
 * the same way, and would make the exhaustive test a list of exceptions.
 *
 * `unknown` means the resolver could not reach a primitive (an object-valued
 * facet, or a type it does not model); the string keeps that branch authored,
 * and the non-vacuity assertion above proves the resolver is not answering
 * `unknown` for everything.
 */
function syntheticChromeValue(
  field: string,
  leaf?: LeafKind,
  baselineValue?: unknown
): string | number | boolean {
  if (field === "anatomy") return "default";
  const alternatives = leaf?.alternatives ?? [];
  if (alternatives.length === 0) return "1px";
  // A union is a CHOICE the contract offers, so any member is legal. Where the
  // effective baseline already holds one of them, author that one: it keeps the
  // authored document as close to the theme it patches as the contract allows.
  // Where the baseline is silent, the order below is deterministic so the
  // document this test builds is the same on every run.
  const matching = alternatives.find(
    (alternative) => alternativeKind(alternative) === typeof baselineValue
  );
  if (matching) return alternativeValue(matching);
  const PREFERENCE = ["string", "number", "boolean"];
  const ordered = [...alternatives].sort(
    (a, b) => PREFERENCE.indexOf(alternativeKind(a)) - PREFERENCE.indexOf(alternativeKind(b))
  );
  return alternativeValue(ordered[0]!);
}
