/**
 * The lowering's discriminant and its product shape.
 *
 * These assertions must never be phrased against a second compile helper: with
 * one lowering left, "canonical equals legacy" compares the door to itself and
 * passes no matter what the door does. The tenant discriminant is proven by
 * DIFFERENCE, and the emitted bytes are proven against the committed artifact
 * in `artifact-oracle.test.ts`.
 */

import { describe, expect, it } from "vitest";

import type { ThemeProvenance } from "@/foundation/contracts/composition/tenants/themes/resolved";
import { EMPTY_PROVENANCE } from "@/foundation/contracts/composition/tenants/themes/resolved";
import { FIRST_PARTY_THEMES } from "@/foundation/tokens/ts/presentation/brand-themes";

import { resolveTheme } from "../../resolution";
import { resolveAdapter } from "../../../presentation/adapters";
import { compileTheme } from "..";

const modern = resolveAdapter("modern");
const baseline = FIRST_PARTY_THEMES.bithire;

const authoredEmpty: ThemeProvenance = {
  tenantAuthored: true,
  authoredPaths: EMPTY_PROVENANCE.authoredPaths,
  floors: {},
  statusSeedAuthorship: EMPTY_PROVENANCE.statusSeedAuthorship,
};

describe("compileTheme", () => {
  it("always yields modeBlocks as an array, never undefined", () => {
    const compiled = compileTheme(resolveTheme(baseline), modern);
    expect(Array.isArray(compiled.modeBlocks)).toBe(true);
  });

  it("does not discriminate by identity: a cloned empty provenance is still not a tenant", () => {
    const clone: ThemeProvenance = { ...EMPTY_PROVENANCE };
    expect(clone).not.toBe(EMPTY_PROVENANCE);
    const viaClone = compileTheme({ theme: baseline, provenance: clone }, modern);
    const viaSingleton = compileTheme(resolveTheme(baseline), modern);
    expect(viaClone.cssVariables).toEqual(viaSingleton.cssVariables);
  });

  it("an authored provenance that claims NOTHING compiles byte-identically", () => {
    // MEASURED, not assumed: the tenant arm runs the seed derivations, but with
    // an empty claim set every one of them is a no-op, so `tenantAuthored`
    // alone moves no byte. This is the property that lets a tenant with no
    // contested leaf keep the vertical's exact output.
    const asTenant = compileTheme(
      { theme: baseline, provenance: authoredEmpty },
      modern
    );
    const asVertical = compileTheme(resolveTheme(baseline), modern);
    expect(asTenant.cssVariables).toEqual(asVertical.cssVariables);
    expect(asTenant.modeBlocks).toEqual(asVertical.modeBlocks);
  });

  it("the discriminant is observable as soon as the tenant claims a leaf", () => {
    // The claim is what the seed derivation reads -- not the value. Claiming
    // the vertical's OWN primary colour therefore still moves channels, which
    // is the whole reason provenance travels beside the resolved theme.
    const claimed = compileTheme(
      {
        theme: baseline,
        provenance: {
          ...authoredEmpty,
          authoredPaths: new Set(["palette.primaryColor"]),
        },
      },
      modern
    );
    const asVertical = compileTheme(resolveTheme(baseline), modern);
    expect(claimed.cssVariables).not.toEqual(asVertical.cssVariables);
  });

  it("stamps the adapter's engine and projection onto the product", () => {
    const compiled = compileTheme(resolveTheme(baseline), modern);
    expect(compiled.engine).toBe("modern");
    expect(compiled.projection).toEqual({ seeds: {}, tokenOverrides: {}, modes: [] });
  });

  it("carries the runtime half rather than leaving it to be re-derived", () => {
    const compiled = compileTheme(resolveTheme(baseline), modern);
    expect(compiled.runtime.personality).toBeTruthy();
    expect(compiled.runtime.tokenOverrides).toBeTruthy();
    expect(Object.keys(compiled.runtime.personality).length).toBeGreaterThan(0);
  });

  it("emits no cssString, no slug and no engineBridge: scope is emission's", () => {
    const compiled = compileTheme(resolveTheme(baseline), modern) as unknown as Record<
      string,
      unknown
    >;
    expect(compiled.cssString).toBeUndefined();
    expect(compiled.engineBridge).toBeUndefined();
    expect(compiled.tenantSlug).toBeUndefined();
  });

  it("reads the diagnostic slug off the resolved theme, not off a second input", () => {
    const renamed = { ...baseline, id: "themanagementmiami" } as typeof baseline;
    const compiled = compileTheme(resolveTheme(renamed), modern);
    const original = compileTheme(resolveTheme(baseline), modern);
    // The id is a diagnostic label only: no channel may key on it.
    expect(compiled.cssVariables).toEqual(original.cssVariables);
  });

  it("keeps a zero-mode theme's modeBlocks empty rather than absent", () => {
    const noModes = { ...baseline, modes: undefined } as unknown as typeof baseline;
    const compiled = compileTheme(resolveTheme(noModes), modern);
    expect(compiled.modeBlocks).toEqual([]);
  });
});
