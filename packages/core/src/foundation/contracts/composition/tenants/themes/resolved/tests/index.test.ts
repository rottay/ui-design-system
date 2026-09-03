/**
 * The resolved-provenance contract.
 *
 * Provenance is a SNAPSHOT: neither the patch it was computed from nor the
 * value handed back may be mutated into a different answer later.
 */

import { describe, expect, it } from "vitest";

import type { ThemePatch } from "../../iso";
import {
  deriveTenantStatusSeedAuthorship,
  EMPTY_PROVENANCE,
  RESOLVED_TONE_ROLES,
  tenantPostureFloors,
  tenantProvenance,
} from "..";

const patchLiteral = (): ThemePatch =>
  ({
    typography: {
      typePairing: "editorial",
      scale: 1.125,
      fontFamilyBase: "Inter",
      fontFamilyHeading: "Fraunces",
    },
    surfaces: {
      buttonStyle: "pill",
      radiusScale: 1.25,
      density: "compact",
      elevation: "lifted",
    },
    motion: { value: { intensity: "expressive" } },
    palette: { successColor: "#0f0" },
    modes: { dark: { palette: { errorColor: "#f00" } } },
  }) as unknown as ThemePatch;

const patch = patchLiteral();

const mutable = (value: unknown): Record<string, unknown> =>
  value as Record<string, unknown>;

describe("EMPTY_PROVENANCE", () => {
  it("is frozen at every level a reader can reach", () => {
    expect(Object.isFrozen(EMPTY_PROVENANCE)).toBe(true);
    expect(Object.isFrozen(EMPTY_PROVENANCE.floors)).toBe(true);
    expect(Object.isFrozen(EMPTY_PROVENANCE.statusSeedAuthorship)).toBe(true);
    expect(Object.isFrozen(EMPTY_PROVENANCE.statusSeedAuthorship.base)).toBe(true);
    expect(Object.isFrozen(EMPTY_PROVENANCE.statusSeedAuthorship.modes)).toBe(true);
  });

  it("carries an authored-path set with no mutating surface", () => {
    expect(EMPTY_PROVENANCE.authoredPaths.size).toBe(0);
    expect(EMPTY_PROVENANCE.authoredPaths.has("palette.primaryColor")).toBe(false);
    for (const method of ["add", "delete", "clear"]) {
      expect(
        (EMPTY_PROVENANCE.authoredPaths as unknown as Record<string, unknown>)[method]
      ).toBeUndefined();
    }
    expect([...EMPTY_PROVENANCE.authoredPaths]).toEqual([]);
  });

  it("declares itself not a tenant, by value and not by identity", () => {
    expect(EMPTY_PROVENANCE.tenantAuthored).toBe(false);
    const structuralTwin = {
      tenantAuthored: false,
      authoredPaths: EMPTY_PROVENANCE.authoredPaths,
      floors: EMPTY_PROVENANCE.floors,
      statusSeedAuthorship: EMPTY_PROVENANCE.statusSeedAuthorship,
    };
    expect(structuralTwin).not.toBe(EMPTY_PROVENANCE);
    expect(structuralTwin.tenantAuthored).toBe(EMPTY_PROVENANCE.tenantAuthored);
  });

  it("is one singleton, so repeated reads never allocate a second empty", () => {
    expect(EMPTY_PROVENANCE).toBe(EMPTY_PROVENANCE);
  });
});

describe("tenantProvenance snapshots the patch", () => {
  it("marks the result tenant-authored and frozen through the whole graph", () => {
    const provenance = tenantProvenance(patch);
    expect(provenance.tenantAuthored).toBe(true);
    expect(Object.isFrozen(provenance)).toBe(true);
    expect(Object.isFrozen(provenance.floors)).toBe(true);
    expect(Object.isFrozen(provenance.floors.typography)).toBe(true);
    expect(Object.isFrozen(provenance.floors.surfaces)).toBe(true);
    expect(Object.isFrozen(provenance.floors.motion)).toBe(true);
    expect(Object.isFrozen(provenance.statusSeedAuthorship)).toBe(true);
    expect(Object.isFrozen(provenance.statusSeedAuthorship.base)).toBe(true);
    expect(Object.isFrozen(provenance.statusSeedAuthorship.modes)).toBe(true);
    expect(Object.isFrozen(provenance.statusSeedAuthorship.modes.dark)).toBe(true);
  });

  it("aliases no nested value of the caller's patch", () => {
    const source = patchLiteral();
    const provenance = tenantProvenance(source);
    const raw = mutable(source);
    expect(provenance.floors.typography).not.toBe(raw.typography);
    expect(provenance.floors.surfaces).not.toBe(raw.surfaces);
    expect(provenance.floors.motion).not.toBe(mutable(raw.motion).value);
  });

  it("does not move when the caller mutates the patch afterwards", () => {
    const source = patchLiteral();
    const provenance = tenantProvenance(source);
    const raw = mutable(source);
    mutable(raw.typography).scale = 2;
    mutable(raw.surfaces).density = "spacious";
    mutable(mutable(raw.motion).value).intensity = "calm";
    mutable(raw.palette).warningColor = "#ff0";
    delete mutable(raw.modes).dark;

    expect(provenance.floors.typography?.scale).toBe(1.125);
    expect(provenance.floors.surfaces?.density).toBe("compact");
    expect(provenance.floors.motion).toEqual({ intensity: "expressive" });
    expect(provenance.statusSeedAuthorship.base.warning).toBe(false);
    expect(provenance.statusSeedAuthorship.modes.dark?.error).toBe(true);
  });

  it("refuses mutation attempted through the returned value", () => {
    const provenance = tenantProvenance(patchLiteral());
    expect(() => {
      mutable(provenance).tenantAuthored = false;
    }).toThrow(TypeError);
    expect(() => {
      mutable(provenance.floors.typography).scale = 9;
    }).toThrow(TypeError);
    expect(() => {
      mutable(provenance.floors.motion).intensity = "calm";
    }).toThrow(TypeError);
    expect(() => {
      mutable(provenance.statusSeedAuthorship.base).success = false;
    }).toThrow(TypeError);
    expect(() => {
      mutable(provenance.statusSeedAuthorship.modes).light = undefined;
    }).toThrow(TypeError);

    expect(provenance.tenantAuthored).toBe(true);
    expect(provenance.floors.typography?.scale).toBe(1.125);
    expect(provenance.floors.motion?.intensity).toBe("expressive");
    expect(provenance.statusSeedAuthorship.base.success).toBe(true);
  });

  it("hands out authored paths that can be neither grown nor drained", () => {
    const provenance = tenantProvenance(patchLiteral());
    const paths = provenance.authoredPaths as unknown as Record<string, unknown>;
    for (const method of ["add", "delete", "clear"]) {
      expect(paths[method]).toBeUndefined();
    }
    const before = [...provenance.authoredPaths].sort();
    expect(before.length).toBeGreaterThan(0);
    expect(provenance.authoredPaths.size).toBe(before.length);
    expect([...provenance.authoredPaths].sort()).toEqual(before);
    expect(provenance.authoredPaths.has(before[0] as string)).toBe(true);
  });

  it("keeps the iteration surface a ReadonlySet a consumer can still use", () => {
    const provenance = tenantProvenance(patchLiteral());
    const seen: string[] = [];
    provenance.authoredPaths.forEach((value) => seen.push(value));
    expect(seen.sort()).toEqual([...provenance.authoredPaths].sort());
    expect([...provenance.authoredPaths.keys()].sort()).toEqual(seen.sort());
    expect([...provenance.authoredPaths.values()].sort()).toEqual(seen.sort());
    expect([...provenance.authoredPaths.entries()].map(([k]) => k).sort()).toEqual(
      seen.sort()
    );
  });
});

describe("the projections behind the provenance", () => {
  it("tenantPostureFloors projects exactly the six posture keypaths", () => {
    const floors = tenantPostureFloors(patch);
    expect(floors.typography).toEqual({
      typePairing: "editorial",
      scale: 1.125,
      fontFamilyBase: "Inter",
      fontFamilyHeading: "Fraunces",
    });
    expect(floors.surfaces).toEqual({
      buttonStyle: "pill",
      radiusScale: 1.25,
      density: "compact",
      elevation: "lifted",
    });
    expect(Object.keys(floors).sort()).toEqual(["motion", "surfaces", "typography"]);
  });

  it("tenantPostureFloors unwraps a governed motion to the bare spec", () => {
    expect(tenantPostureFloors(patch).motion).toEqual({ intensity: "expressive" });
    const bare = { motion: { intensity: "calm" } } as unknown as ThemePatch;
    expect(tenantPostureFloors(bare).motion).toEqual({ intensity: "calm" });
  });

  it("tenantPostureFloors excludes palette and modes by design", () => {
    const floors = tenantPostureFloors(patch) as Record<string, unknown>;
    expect(floors.palette).toBeUndefined();
    expect(floors.modes).toBeUndefined();
  });

  it("deriveTenantStatusSeedAuthorship reads values, never Set membership", () => {
    const authorship = deriveTenantStatusSeedAuthorship(patch);
    expect(authorship.base).toEqual({
      success: true,
      warning: false,
      error: false,
      info: false,
    });
    expect(authorship.modes.dark).toEqual({
      success: false,
      warning: false,
      error: true,
      info: false,
    });
    expect(authorship.modes.light).toEqual({
      success: false,
      warning: false,
      error: false,
      info: false,
    });
  });

  it("deriveTenantStatusSeedAuthorship is total over the tone vocabulary", () => {
    const empty = deriveTenantStatusSeedAuthorship({} as ThemePatch);
    expect(Object.keys(empty.base).sort()).toEqual([...RESOLVED_TONE_ROLES].sort());
    expect(Object.values(empty.base).every((v) => v === false)).toBe(true);
  });

  it("a constructed-but-unset key is not authorship", () => {
    const constructed = {
      palette: { successColor: undefined, warningColor: undefined },
    } as unknown as ThemePatch;
    expect(deriveTenantStatusSeedAuthorship(constructed).base.success).toBe(false);
  });

  it("the provenance carries exactly what the projections produce", () => {
    const provenance = tenantProvenance(patch);
    expect(provenance.floors).toEqual(tenantPostureFloors(patch));
    expect(provenance.statusSeedAuthorship).toEqual(
      deriveTenantStatusSeedAuthorship(patch)
    );
  });
});
