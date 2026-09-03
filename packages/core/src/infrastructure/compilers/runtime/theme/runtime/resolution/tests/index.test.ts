/**
 * Resolution builds provenance from the RAW patch, and the intent's origin
 * decides authorship.
 */

import { describe, expect, it } from "vitest";

import type {
  ThemeIntent,
  ThemeIntentOrigin,
} from "@/foundation/contracts/composition/tenants/themes/intent";
import {
  isTenantAuthoredOrigin,
  TENANT_AUTHORED_ORIGINS,
} from "@/foundation/contracts/composition/tenants/themes/intent";
import type { ThemePatch } from "@/foundation/contracts/composition/tenants/themes/iso";
import {
  collectPatchAuthoredPaths,
  resolveTheme as isoResolveTheme,
} from "@/foundation/contracts/composition/tenants/themes/iso";
import {
  deriveTenantStatusSeedAuthorship,
  EMPTY_PROVENANCE,
  tenantPostureFloors,
} from "@/foundation/contracts/composition/tenants/themes/resolved";
import { FIRST_PARTY_THEMES } from "@/foundation/tokens/ts/presentation/brand-themes";

import { resolveTheme } from "..";

const baseline = FIRST_PARTY_THEMES.rottay;

const patch: ThemePatch = {
  palette: { primaryColor: "#123456", successColor: "#0a0" },
  surfaces: { density: "compact", elevation: "lifted" },
} as unknown as ThemePatch;

const intentOf = (origin: ThemeIntentOrigin): ThemeIntent => ({ origin, patch });

const ORIGINS: readonly ThemeIntentOrigin[] = [
  "static-vertical",
  "tenant-document",
  "preview",
];

describe("origin classification", () => {
  it("treats the two tenant-customization transports as authored", () => {
    expect([...TENANT_AUTHORED_ORIGINS].sort()).toEqual(["preview", "tenant-document"]);
    expect(isTenantAuthoredOrigin("tenant-document")).toBe(true);
    expect(isTenantAuthoredOrigin("preview")).toBe(true);
  });

  it("does not treat the vertical's own baseline layer as authored", () => {
    expect(isTenantAuthoredOrigin("static-vertical")).toBe(false);
    expect(TENANT_AUTHORED_ORIGINS).not.toContain("static-vertical");
  });

  it("keeps the origin union closed at three transports", () => {
    expect(new Set(ORIGINS).size).toBe(3);
  });
});

describe("resolveTheme without an intent", () => {
  it("returns the baseline and the frozen empty provenance", () => {
    const resolution = resolveTheme(baseline);
    expect(resolution.theme).toBe(baseline);
    expect(resolution.provenance).toBe(EMPTY_PROVENANCE);
    expect(resolution.provenance.tenantAuthored).toBe(false);
    expect(resolution.intent).toBeUndefined();
  });
});

describe("resolveTheme applies every origin's patch to the baseline", () => {
  for (const origin of ORIGINS) {
    it(`${origin} merges through the ISO resolver and changes the theme`, () => {
      const resolution = resolveTheme(baseline, intentOf(origin));
      expect(resolution.theme).toEqual(isoResolveTheme(baseline, patch));
      expect(resolution.theme).not.toBe(baseline);
      expect(resolution.theme).not.toEqual(baseline);
    });

    it(`${origin} carries its intent for diagnostics`, () => {
      const intent = intentOf(origin);
      expect(resolveTheme(baseline, intent).intent).toBe(intent);
    });
  }
});

describe("a static-vertical intent is a baseline layer, not tenant authorship", () => {
  const resolution = resolveTheme(baseline, intentOf("static-vertical"));

  it("changes the resolved theme while staying non-tenant", () => {
    expect(resolution.theme).not.toEqual(baseline);
    expect(resolution.provenance.tenantAuthored).toBe(false);
    expect(resolution.provenance).toBe(EMPTY_PROVENANCE);
  });

  it("creates no tenant floor", () => {
    expect(resolution.provenance.floors).toEqual({});
    expect(resolution.provenance.floors).not.toEqual(tenantPostureFloors(patch));
  });

  it("creates no tenant status-seed authorship", () => {
    expect(resolution.provenance.statusSeedAuthorship.base.success).toBe(false);
    expect(resolution.provenance.statusSeedAuthorship.modes).toEqual({});
    expect(deriveTenantStatusSeedAuthorship(patch).base.success).toBe(true);
  });

  it("claims no authored path even though the patch has them", () => {
    expect(resolution.provenance.authoredPaths.size).toBe(0);
    expect(collectPatchAuthoredPaths(patch).size).toBeGreaterThan(0);
  });
});

describe("a tenant-authored origin overlays with full provenance", () => {
  for (const origin of ["tenant-document", "preview"] as const) {
    const resolution = resolveTheme(baseline, intentOf(origin));

    it(`${origin} marks the resolution authored`, () => {
      expect(resolution.provenance.tenantAuthored).toBe(true);
      expect(resolution.provenance).not.toBe(EMPTY_PROVENANCE);
    });

    it(`${origin} applies the producers to the raw patch`, () => {
      expect([...resolution.provenance.authoredPaths].sort()).toEqual(
        [...collectPatchAuthoredPaths(patch)].sort()
      );
      expect(resolution.provenance.floors).toEqual(tenantPostureFloors(patch));
      expect(resolution.provenance.statusSeedAuthorship).toEqual(
        deriveTenantStatusSeedAuthorship(patch)
      );
    });

    it(`${origin} does not derive the floor from the merged theme`, () => {
      // The merge is total, so every posture keypath is populated afterwards;
      // a floor derived from it would out-rank the tenant's own selection.
      const merged = resolution.theme as unknown as ThemePatch;
      expect(resolution.provenance.floors).not.toEqual(tenantPostureFloors(merged));
    });
  }

  it("resolves preview and tenant-document to the same provenance", () => {
    const preview = resolveTheme(baseline, intentOf("preview")).provenance;
    const document = resolveTheme(baseline, intentOf("tenant-document")).provenance;
    expect(preview.floors).toEqual(document.floors);
    expect(preview.statusSeedAuthorship).toEqual(document.statusSeedAuthorship);
    expect([...preview.authoredPaths].sort()).toEqual([...document.authoredPaths].sort());
  });
});
