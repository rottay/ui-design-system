/**
 * COH-1 (WO-CRA-23) — tenant re-derivation acceptance spec (T2).
 *
 * Formula/adjudication authority:
 * `test-artifacts/quality-evidence/wo-cra-23/scouts/coh-1-opus-formula-review.md`,
 * section B(iii) and E.1 (T2). The mechanism under test is
 * `applyTenantStatusSeedDerivations` — the SIBLING of `applyTenantSeedDerivations`
 * for the four status tones, with its own `STATUS_SEED_SHADOWING_FIELDS`
 * table (see `coh-1-status-tint-floor.test.ts` for the static-shape half of
 * that contract).
 *
 * WHY THIS NEEDS A SECOND PASS, NOT JUST THE FLOOR: `deriveStatusTintFloor`
 * merges into `vars` BEFORE `setExtendedPaletteVariables`, whose
 * unconditional "write when present" then re-applies the MERGED theme's
 * `successBgColor` — for a DB tenant on bithire this is bithire's own baked
 * literal (pre-COH-1: green; post-COH-1, since bithire retired the literal,
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
 * `compileBrandTheme`, with a hand-built `tenantAuthoredPaths`/`tenantPatch`
 * — the same escape hatch the compiler itself uses internally, bypassing
 * only the DB-document intake layer that has nothing to test yet.
 */
import { describe, expect, it } from "vitest";

import type { TenantThemeDocument } from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";

import { compileBrandTheme } from "@/infrastructure/compilers/kernel/runtime/brand-theme";
import { bithireBrandTheme } from "@/foundation/tokens/ts/presentation/brand-themes/bithire";

import {
  compileTenantThemeConfig,
  getTenantThemeVerticalEnvelope,
  hydrateTenantThemeConfig,
} from "../index";

/** A tenant that authors ONLY its success seed — nothing else contested. */
const TENANT_SUCCESS_SEED_ONLY: TenantThemeDocument = {
  schemaVersion: 1,
  mode: "advanced",
  visualFoundation: {
    general: {
      palette: {
        // Deliberately far from both bithire's blue seed (#327CA8) and its
        // pre-COH-1 baked-green well (#f0fdf4 / rgba(5, 118, 66, 0.25)), so a
        // passing assertion cannot be an accident of hue proximity.
        status: { success: "#7C3AED" },
      },
    },
  },
};

const compileFor = (document: TenantThemeDocument) =>
  compileTenantThemeConfig(
    hydrateTenantThemeConfig(document, {
      tenantId: "t_coh1",
      slug: "coh1-tenant",
      verticalKey: "bithire",
      rowVersion: 1,
    }),
    { verticalEnvelope: getTenantThemeVerticalEnvelope("bithire")! }
  );

describe("COH-1 T2 — a DB tenant's own status seed re-derives correctly against the bithire baseline", () => {
  const { variables } = compileFor(TENANT_SUCCESS_SEED_ONLY);

  it("seed passthrough already works today (sanity check, not the defect)", () => {
    expect(variables["--ds-color-success"]).toBe("#7C3AED");
  });

  it("the perceptual ramp re-derives from the TENANT's own seed, not bithire's blue", () => {
    // deriveTenantColorRamps already worked before COH-1; this is the channel
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
   * `successBgColor` literal (COH-1) is what makes this the case; see the
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

describe("COH-1 T2 — guard 1 mechanism: a tenant seed defeats a baseline that STILL bakes a status literal", () => {
  // Bithire itself no longer bakes successBgColor/successBorderColor as of
  // COH-1 (retired — see the vertical source), so its own baseline can no
  // longer demonstrate the defect `applyTenantStatusSeedDerivations` closes.
  // This clone reintroduces exactly the pre-COH-1 shape (a baked, hue-wrong
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
      tenantSlug: "coh1-guard1",
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

describe("COH-1 T2 — case C: a tenant document silent on palette.status moves zero status bytes", () => {
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
 * Guard 2 and guard 3, exercised directly against `compileBrandTheme` with a
 * hand-built provenance record — see the file header for why no DB document
 * reaches these two guards today. `as never` mirrors the same cast already
 * used for synthetic input in `brand-authored-residue-retirement.test.ts`
 * (`compileBrandTheme({ brandTheme: theme as never, ... })`); the public
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
  return compileBrandTheme(input as never);
}

describe("COH-1 T2 — guard 2: a tenant leaf on the derived channel itself outranks the tenant's own seed-derivation", () => {
  it("a tenant that authors BOTH its own status seed AND successBgColor keeps its own successBgColor", () => {
    const artifact = compileWithProvenance({
      brandTheme: bithireBrandTheme,
      tenantSlug: "coh1-guard2",
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

describe("COH-1 T2 — guard 3: a value that bakes no colour of its own is left exactly as assembled", () => {
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
      tenantSlug: "coh1-guard3",
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
