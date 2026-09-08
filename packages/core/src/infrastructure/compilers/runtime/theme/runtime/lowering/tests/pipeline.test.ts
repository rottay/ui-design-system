/**
 * The one orchestrator: rank decides the value, order decides the position,
 * and a duplicate producer fails closed instead of being resolved by luck.
 */
import { describe, expect, it } from "vitest";

import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";
import { bithireBrandTheme } from "@/foundation/tokens/ts/presentation/brand-themes";
import { MERGE_RANK, type FamilyDeriver } from "../foundation/contract";
import { FAMILY_DERIVERS } from "../runtime/derivation";
import { buildLoweringContext, lowerBlock, runDerivation } from "../runtime/pipeline";

const THEME: BrandTheme = { id: "pipeline", name: "Pipeline" };

const family = (
  name: string,
  rank: FamilyDeriver["rank"],
  channels: Record<string, string>
): FamilyDeriver => ({
  family: name,
  rank,
  consumes: ["palette.primaryColor"],
  produces: Object.keys(channels) as FamilyDeriver["produces"],
  derive: () => channels,
});

describe("the ranked merge", () => {
  it("lets the higher rank win no matter which family runs last", () => {
    const strongFirst = runDerivation(buildLoweringContext({ theme: THEME }), [
      family("t", "tenant", { "--ds-x": "tenant" }),
      family("v", "verticalOverride", { "--ds-x": "vertical" }),
    ]);
    const strongLast = runDerivation(buildLoweringContext({ theme: THEME }), [
      family("v", "verticalOverride", { "--ds-x": "vertical" }),
      family("t", "tenant", { "--ds-x": "tenant" }),
    ]);
    expect(strongFirst.channels["--ds-x"]).toBe("tenant");
    expect(strongLast.channels["--ds-x"]).toBe("tenant");
  });

  it("orders tenant > vertical-override > derived > profile", () => {
    expect(MERGE_RANK.tenant).toBeGreaterThan(MERGE_RANK.verticalOverride);
    expect(MERGE_RANK.verticalOverride).toBeGreaterThan(MERGE_RANK.derived);
    expect(MERGE_RANK.derived).toBeGreaterThan(MERGE_RANK.profile);
  });

  it("records which family and which rank settled each channel", () => {
    const result = runDerivation(buildLoweringContext({ theme: THEME }), [
      family("p", "profile", { "--ds-x": "profile" }),
      family("d", "derived", { "--ds-x": "derived" }),
    ]);
    expect(result.provenance.get("--ds-x")).toEqual({ family: "d", rank: "derived" });
  });

  it("keeps a channel at the position it was FIRST declared, whoever overwrites it", () => {
    const result = runDerivation(buildLoweringContext({ theme: THEME }), [
      family("p", "profile", { "--ds-first": "1", "--ds-x": "profile" }),
      family("d", "derived", { "--ds-x": "derived", "--ds-last": "2" }),
    ]);
    expect(Object.keys(result.channels)).toEqual(["--ds-first", "--ds-x", "--ds-last"]);
  });

  it("refuses two families claiming one channel at the SAME rank", () => {
    expect(() =>
      runDerivation(buildLoweringContext({ theme: THEME }), [
        family("a", "derived", { "--ds-x": "a" }),
        family("b", "derived", { "--ds-x": "b" }),
      ])
    ).toThrow(/Duplicate producer for --ds-x/);
  });

  it("does not refuse one family restating its own channel", () => {
    const twice = family("a", "derived", { "--ds-x": "a" });
    expect(() =>
      runDerivation(buildLoweringContext({ theme: THEME }), [twice, twice])
    ).not.toThrow();
  });

  it("hands a deriver everything merged so far, and nothing it wrote itself", () => {
    let seen: Record<string, string> | undefined;
    const reader: FamilyDeriver = {
      family: "reader",
      rank: "tenant",
      consumes: ["palette.primaryColor"],
      produces: ["--ds-read"],
      derive: (_context, below) => {
        seen = { ...below };
        return {};
      },
    };
    runDerivation(buildLoweringContext({ theme: THEME }), [
      family("d", "derived", { "--ds-below": "yes" }),
      reader,
    ]);
    expect(seen).toEqual({ "--ds-below": "yes" });
  });
});

describe("the real registry", () => {
  it("is the only orchestrator: lowerBlock and the registry agree byte for byte", () => {
    const context = buildLoweringContext({ theme: bithireBrandTheme });
    expect(lowerBlock({ theme: bithireBrandTheme })).toEqual(
      runDerivation(context, FAMILY_DERIVERS).channels
    );
  });

  it("resolves the expressive expansion once per block, not once per consumer", () => {
    const context = buildLoweringContext({ theme: bithireBrandTheme });
    const second = buildLoweringContext({ theme: bithireBrandTheme });
    expect(context.expressive.expansion).toEqual(second.expressive.expansion);
    expect(context.radiusScale).toBe(second.radiusScale);
  });

  it("compiles a tenant-less theme without any tenant-ranked channel", () => {
    const context = buildLoweringContext({ theme: bithireBrandTheme });
    const result = runDerivation(context, FAMILY_DERIVERS);
    const tenantOwned = [...result.provenance.entries()].filter(
      ([, provenance]) => provenance.rank === "tenant"
    );
    expect(tenantOwned).toEqual([]);
  });
});
