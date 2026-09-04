/**
 * Tenant status-tint re-derivation acceptance spec.
 *
 * The mechanism under test is
 * `applyTenantStatusSeedDerivations` — the SIBLING of `applyTenantSeedDerivations`
 * for the four status tones, with its own `STATUS_SEED_SHADOWING_FIELDS`
 * table (see `foundation/tokens/tests/status-tint-floor/index.test.ts` for the static-shape half of
 * that contract).
 *
 * WHY THIS NEEDS A SECOND PASS, NOT JUST THE FLOOR: `deriveStatusTintFloor`
 * merges into `vars` BEFORE `setExtendedPaletteVariables`, whose
 * unconditional "write when present" then re-applies the MERGED theme's
 * `successBgColor` — for a DB tenant on bithire this is bithire's own baked
 * literal (before the derivation BitHire was green; after BitHire retired the literal,
 * this half of the claim is now moot for bithire specifically, but the
 * MECHANISM is general: any vertical baseline that still bakes a status
 * literal would reproduce the bug one layer down without this second pass).
 * `applyTenantStatusSeedDerivations` runs LATER, keyed on `bakesItsOwnColor`,
 * exactly like the primary family's site A.
 *
 * GUARD 2 (tenant leaf outranks tenant-derived) has no real DB intake path
 * today: no v1 document field lowers into `palette.{tone}BgColor` (only the
 * seed, `palette.status.{tone}` -> `palette.{tone}Color`, has a door —
 * confirmed by grep over `migrate-v1/index.ts`, same situation the PRIMARY
 * family already has for its own four unreachable fields:
 * `primaryForegroundColor`/`borderFocusColor`/`linkColor`/`linkHoverColor`).
 * So guard 2 and guard 3 are exercised directly against the exported
 * `compileTheme`, with a hand-built `tenantAuthoredPaths`/`tenantPatch`
 * — the same escape hatch the compiler itself uses internally, bypassing
 * only the DB-document intake layer that has nothing to test yet.
 *
 * Production DB-ingress coverage: the
 * bithire-only coverage above could not distinguish a LIVE DB door from a
 * DEAD one, because bithire retired its own baked status literals in this
 * same lot -- both a working and an inert `applyTenantStatusSeedDerivations`
 * produce the identical "-bg/-border/alpha carry no delta bytes" result on
 * bithire. `compileTenantThemeConfig` passed `tenantPatch:
 * tenantPostureFloors(envelope.patch)` -- a projection that never carries
 * `palette`/`modes` -- so `toneSeedIsTenantAuthored` was `false` for every
 * tenant on every vertical, and guard 1 never fired through the real door.
 * The suite below exercises guard 1 THROUGH `compileTenantThemeConfig`
 * itself (never `compileTheme` directly) against ROTTAY, which still
 * bakes `successBgColor`/`successBorderColor`/`alphaSuccess{10,20}` as
 * concrete literals in both its base (dark) block and its light overlay --
 * the exact "baseline still bakes a literal" case the guard-1 mechanism test
 * above already proves the FORMULA handles, now proven through the DOOR a
 * real tenant document actually enters.
 */
import { describe, expect, it } from "vitest";

import type { TenantThemeDocument } from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";

import { lowerBrandThemeFixture } from "@tests/support/theme-lowering";
import { bithireBrandTheme } from "@/foundation/tokens/ts/presentation/brand-themes/bithire";

import {
  compileTenantThemeConfig,
  getTenantThemeVerticalEnvelope,
  hydrateTenantThemeConfig,
} from "@/infrastructure/compilers/composition/tenant-theme";

/** A tenant that authors ONLY its success seed — nothing else contested. */
const TENANT_SUCCESS_SEED_ONLY: TenantThemeDocument = {
  schemaVersion: 1,
  mode: "advanced",
  visualFoundation: {
    general: {
      palette: {
        // Deliberately far from both bithire's blue seed (#327CA8) and its
        // previous baked-green well (#f0fdf4 / rgba(5, 118, 66, 0.25)), so a
        // passing assertion cannot be an accident of hue proximity.
        status: { success: "#7C3AED" },
      },
    },
  },
};

const compileFor = (document: TenantThemeDocument) =>
  compileTenantThemeConfig(
    hydrateTenantThemeConfig(document, {
      tenantId: "t_status_tint",
      slug: "status-tint-tenant",
      verticalKey: "bithire",
      rowVersion: 1,
    }),
    { verticalEnvelope: getTenantThemeVerticalEnvelope("bithire")! }
  );

describe("a DB tenant status seed re-derives correctly against the BitHire baseline", () => {
  const { variables } = compileFor(TENANT_SUCCESS_SEED_ONLY);

  it("seed passthrough already works today (sanity check, not the defect)", () => {
    expect(variables["--ds-color-success"]).toBe("#7C3AED");
  });

  it("the perceptual ramp re-derives from the TENANT's own seed, not bithire's blue", () => {
    // deriveTenantColorRamps already worked before this floor; this is the channel
    // -bg's var() reference actually resolves against once the cascade
    // applies. #F7F6FF is the tenant's own violet -50, nothing like bithire's
    // own blue -50 (#F0F9FF).
    expect(variables["--ds-color-success-50"]).toBe("#F7F6FF");
    expect(variables["--ds-color-success-50"]).not.toBe("#F0F9FF");
  });

  /**
   * `-bg`/`-border`/alpha do NOT appear in this delta, and that is CORRECT,
   * not a regression: `compileTenantThemeConfig` reports only channels whose
   * STRING differs from the bithire baseline, and neither
   * `deriveStatusTintFloor` nor `applyTenantStatusSeedDerivations` embeds the
   * seed's resolved value in these three formulas — both the baseline
   * compile (bithire's own blue seed) and the tenant compile (its violet
   * seed) produce the IDENTICAL string `var(--ds-color-success-50)` /
   * `color-mix(in srgb, var(--ds-color-success) N%, transparent)`, because
   * both name the CHANNEL, never a literal. The pixel still moves: it moves
   * through `--ds-color-success-50` itself, asserted above, which the
   * cascade resolves this string against. Bithire retiring its baked
   * `successBgColor` literal is what makes this the case; see the
   * guard-1 mechanism test below for the scenario where a baseline STILL
   * bakes a literal, which is where `applyTenantStatusSeedDerivations`
   * actually has work to do.
   */
  it("-bg/-border/alpha carry no delta bytes: same channel-reference string on both sides of the seed swap", () => {
    expect(variables["--ds-color-success-bg"]).toBeUndefined();
    expect(variables["--ds-color-success-border"]).toBeUndefined();
    expect(variables["--ds-color-alpha-success-10"]).toBeUndefined();
    expect(variables["--ds-color-alpha-success-20"]).toBeUndefined();
  });

  it("warning/error/info are untouched: only the contested tone re-derives", () => {
    expect(variables["--ds-color-warning-bg"]).toBeUndefined();
    expect(variables["--ds-color-error-bg"]).toBeUndefined();
    expect(variables["--ds-color-info-bg"]).toBeUndefined();
  });
});

describe("a tenant seed defeats a baseline that still bakes a status literal", () => {
  // Bithire itself no longer bakes successBgColor/successBorderColor as of
  // the current derivation (retired — see the vertical source), so its own baseline can no
  // longer demonstrate the defect `applyTenantStatusSeedDerivations` closes.
  // This clone reintroduces exactly the previous shape (a baked, hue-wrong
  // literal) to prove the MECHANISM still defends any vertical whose
  // baseline bakes one — a synthetic fixture, not a claim about bithire
  // today.
  it("a tenant's own seed overwrites a baseline-baked -bg/-border literal", () => {
    const withBakedLiteral: BrandTheme = {
      ...bithireBrandTheme,
      palette: {
        ...bithireBrandTheme.palette,
        successBgColor: "#f0fdf4",
        successBorderColor: "rgba(5, 118, 66, 0.25)",
      },
    } as BrandTheme;
    const artifact = compileWithProvenance({
      brandTheme: withBakedLiteral,
      tenantSlug: "status-tint-guard-one",
      tenantPatch: { palette: { successColor: "#7C3AED" } as never },
      tenantAuthoredPaths: new Set(["palette.successColor"]),
    });
    expect(artifact.cssVariables["--ds-color-success-bg"]).toBe(
      "var(--ds-color-success-50)"
    );
    expect(artifact.cssVariables["--ds-color-success-bg"]).not.toBe("#f0fdf4");
    expect(artifact.cssVariables["--ds-color-success-border"]).toBe(
      "color-mix(in srgb, var(--ds-color-success) 20%, transparent)"
    );
    expect(artifact.cssVariables["--ds-color-success-border"]).not.toBe(
      "rgba(5, 118, 66, 0.25)"
    );
  });
});

describe("a tenant document silent on palette.status moves zero status bytes", () => {
  it("a tenant document that authors nothing under palette.status leaves no status channel in the delta", () => {
    const { variables } = compileFor({
      schemaVersion: 1,
      mode: "advanced",
      visualFoundation: { general: { typography: { fontFamilyBase: "Inter" } } },
    });
    for (const tone of ["success", "warning", "error", "info"] as const) {
      expect(variables[`--ds-color-${tone}-bg`]).toBeUndefined();
      expect(variables[`--ds-color-${tone}-border`]).toBeUndefined();
      expect(variables[`--ds-color-alpha-${tone}-10`]).toBeUndefined();
    }
  });
});

/**
 * Guard 2 and guard 3, exercised directly against `compileTheme` with a
 * hand-built provenance record — see the file header for why no DB document
 * reaches these two guards today. `as never` mirrors the same cast already
 * used for synthetic input in `brand-authored-residue-retirement.test.ts`
 * (`compileTheme({ brandTheme: theme as never, ... })`); the public
 * `CompileBrandTheme` type is narrower than what the function actually reads
 * (`tenantAuthoredPaths`/`tenantPatch`), which is intentional — those two
 * fields are compiler-internal provenance, not part of the public contract.
 */
function compileWithProvenance(input: {
  brandTheme: BrandTheme;
  tenantSlug: string;
  tenantPatch?: Partial<BrandTheme>;
  tenantAuthoredPaths?: Set<string>;
}) {
  return lowerBrandThemeFixture(input as never);
}

describe("a tenant leaf on the derived channel outranks tenant seed derivation", () => {
  it("a tenant that authors BOTH its own status seed AND successBgColor keeps its own successBgColor", () => {
    const artifact = compileWithProvenance({
      brandTheme: bithireBrandTheme,
      tenantSlug: "status-tint-guard-two",
      tenantPatch: {
        palette: { successColor: "#7C3AED", successBgColor: "#123456" } as never,
      },
      tenantAuthoredPaths: new Set(["palette.successColor", "palette.successBgColor"]),
    });
    expect(artifact.cssVariables["--ds-color-success-bg"]).toBe("#123456");
    // Every OTHER channel for the tone still re-derives from the tenant's
    // OWN seed: the shadowing is per channel, not a family-wide opt-out.
    expect(artifact.cssVariables["--ds-color-success-border"]).toBe(
      "color-mix(in srgb, var(--ds-color-success) 20%, transparent)"
    );
  });
});

describe("a value that bakes no colour of its own remains exactly as assembled", () => {
  it("a baseline indirection for -border survives a tenant seed re-derivation untouched", () => {
    const withIndirection: BrandTheme = {
      ...bithireBrandTheme,
      palette: {
        ...bithireBrandTheme.palette,
        successBorderColor: "var(--ds-color-border-focus)",
      },
    } as BrandTheme;
    const artifact = compileWithProvenance({
      brandTheme: withIndirection,
      tenantSlug: "status-tint-guard-three",
      tenantPatch: { palette: { successColor: "#7C3AED" } as never },
      tenantAuthoredPaths: new Set(["palette.successColor"]),
    });
    // The indirection already tracks whatever the border-focus channel
    // resolves to; re-deriving it would replace one reference with another,
    // which is exactly what guard 3 refuses to do.
    expect(artifact.cssVariables["--ds-color-success-border"]).toBe(
      "var(--ds-color-border-focus)"
    );
  });
});

// ── Guard 1 through the production DB door (Rottay) ────────────────────────

// Rottay derives base bg/border from its seed, while its light overlay keeps
// explicit mode values. This exercises both zero-delta and shadowing paths.
const compileForRottay = (document: TenantThemeDocument) =>
  compileTenantThemeConfig(
    hydrateTenantThemeConfig(document, {
      tenantId: "t_status_tint_door",
      slug: "status-tint-door-tenant",
      verticalKey: "rottay",
      rowVersion: 1,
    }),
    { verticalEnvelope: getTenantThemeVerticalEnvelope("rottay")! }
  );

/** A v1 document that authors ONLY `palette.status.success`, at a chosen `backgroundMode`. */
const successSeedOnly = (backgroundMode: "light" | "dark"): TenantThemeDocument => ({
  schemaVersion: 1,
  mode: "advanced",
  visualFoundation: {
    general: { palette: { backgroundMode, status: { success: "#7C3AED" } } },
  },
});

describe("a DB status seed against Rottay's base block", () => {
  // backgroundMode "dark" == rottay's own defaultMode, so migrateV1 places
  // the seed directly in the BASE `patch.palette` (never in `patch.modes`).
  const { variables } = compileForRottay(successSeedOnly("dark"));

  it("seed passthrough already works (sanity check, not the defect)", () => {
    expect(variables["--ds-color-success"]).toBe("#7C3AED");
  });

  it("does not repeat bg/border values already derived by the baseline", () => {
    expect(variables["--ds-color-success-bg"]).toBeUndefined();
    expect(variables["--ds-color-success-border"]).toBeUndefined();
  });

  it("alpha-success-20 re-derives from the vertical's own baked literal to the formula", () => {
    expect(variables["--ds-color-alpha-success-20"]).toBe(
      "color-mix(in srgb, var(--ds-color-success) 20%, transparent)"
    );
  });

  it("warning/error/info are untouched: only the contested tone re-derives", () => {
    for (const tone of ["warning", "error", "info"] as const) {
      expect(variables[`--ds-color-${tone}-bg`]).toBeUndefined();
      expect(variables[`--ds-color-${tone}-border`]).toBeUndefined();
    }
  });
});

describe("the DB door re-derives against Rottay baked literals in a mode block", () => {
  // backgroundMode "light" != rottay's defaultMode ("dark"), so migrateV1
  // places the seed ONLY in `patch.modes.light.palette` — the base block
  // never sees a tenant-authored seed at all. rottay's `light` overlay bakes
  // ALL FIVE success fields (including alpha-10, which the base/dark block
  // does not bake), so this scenario is the one that actually exercises the
  // alpha-10 leg of the family.
  const artifact = compileForRottay(successSeedOnly("light"));
  const lightDelta = artifact.modeDeltas?.find((block) => block.mode === "light");

  it("the base block carries no success channel: the tenant never authored the base seed", () => {
    for (const suffix of ["", "-bg", "-border"] as const) {
      expect(artifact.variables[`--ds-color-success${suffix}`]).toBeUndefined();
    }
  });

  it("the light mode block exists and carries the seed passthrough", () => {
    expect(lightDelta).toBeDefined();
    expect(lightDelta!.variables["--ds-color-success"]).toBe("#7C3AED");
  });

  it("-bg/-border/alpha-10/alpha-20 all re-derive from rottay's own baked light-overlay literals", () => {
    expect(lightDelta!.variables["--ds-color-success-bg"]).toBe(
      "var(--ds-color-success-50)"
    );
    expect(lightDelta!.variables["--ds-color-success-border"]).toBe(
      "color-mix(in srgb, var(--ds-color-success) 20%, transparent)"
    );
    expect(lightDelta!.variables["--ds-color-alpha-success-10"]).toBe(
      "color-mix(in srgb, var(--ds-color-success) 10%, transparent)"
    );
    expect(lightDelta!.variables["--ds-color-alpha-success-20"]).toBe(
      "color-mix(in srgb, var(--ds-color-success) 20%, transparent)"
    );
  });

  it("warning/error/info are untouched in the mode block: only the contested tone re-derives", () => {
    for (const tone of ["warning", "error", "info"] as const) {
      expect(lightDelta!.variables[`--ds-color-${tone}-bg`]).toBeUndefined();
      expect(lightDelta!.variables[`--ds-color-${tone}-border`]).toBeUndefined();
    }
  });
});

describe("a document silent on palette.status moves zero status bytes through the DB door", () => {
  it("a rottay document that authors nothing under palette.status leaves no status channel in base or mode deltas", () => {
    const artifact = compileForRottay({
      schemaVersion: 1,
      mode: "advanced",
      visualFoundation: { general: { typography: { fontFamilyBase: "Inter" } } },
    });
    for (const tone of ["success", "warning", "error", "info"] as const) {
      expect(artifact.variables[`--ds-color-${tone}-bg`]).toBeUndefined();
      expect(artifact.variables[`--ds-color-${tone}-border`]).toBeUndefined();
      for (const block of artifact.modeDeltas ?? []) {
        expect(block.variables[`--ds-color-${tone}-bg`]).toBeUndefined();
        expect(block.variables[`--ds-color-${tone}-border`]).toBeUndefined();
      }
    }
  });
});
