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

import { staticThemeIntent } from "../../ingress";
import { resolveAdapter } from "../../../presentation/adapters";
import { compileTheme } from "..";
import {
  FIRST_PARTY_BASELINES,
  lowerBrandThemeFixture,
  resolveFirstParty,
} from "@tests/support/theme-lowering";
import { themanagementmiamiBrandTheme } from "@tests/fixtures/brand-themes/themanagementmiami";

const modern = resolveAdapter("modern");
const baseline = FIRST_PARTY_BASELINES.bithire;
const bithire = staticThemeIntent("bithire");

const authoredEmpty: ThemeProvenance = {
  tenantAuthored: true,
  authoredPaths: EMPTY_PROVENANCE.authoredPaths,
  authoredLeaves: EMPTY_PROVENANCE.authoredLeaves,
  floors: {},
  statusSeedAuthorship: EMPTY_PROVENANCE.statusSeedAuthorship,
};

describe("compileTheme", () => {
  it("always yields modeBlocks as an array, never undefined", () => {
    const compiled = compileTheme(resolveFirstParty(bithire), modern);
    expect(Array.isArray(compiled.modeBlocks)).toBe(true);
  });

  it("does not discriminate by identity: a cloned empty provenance is still not a tenant", () => {
    const clone: ThemeProvenance = { ...EMPTY_PROVENANCE };
    expect(clone).not.toBe(EMPTY_PROVENANCE);
    const viaClone = compileTheme({ theme: baseline, provenance: clone }, modern);
    const viaSingleton = compileTheme(resolveFirstParty(bithire), modern);
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
    const asVertical = compileTheme(resolveFirstParty(bithire), modern);
    expect(asTenant.cssVariables).toEqual(asVertical.cssVariables);
    expect(asTenant.modeBlocks).toEqual(asVertical.modeBlocks);
  });

  it("the discriminant is observable as soon as the tenant claims a leaf the block bakes", () => {
    // The claim is what the seed derivation reads -- not the value. Claiming a
    // primary colour therefore moves channels even when the value is the one
    // the block already carries, which is the whole reason provenance travels
    // beside the resolved theme. The subject is a theme that BAKES its primary
    // family as literals: a tenant-derived value outranks a baseline LEAF, and
    // has nothing to outrank where the block only holds an indirection.
    const plain = lowerBrandThemeFixture({
      brandTheme: themanagementmiamiBrandTheme,
      tenantSlug: "themanagementmiami",
    });
    const claimed = lowerBrandThemeFixture({
      brandTheme: themanagementmiamiBrandTheme,
      tenantSlug: "themanagementmiami",
      tenantAuthoredPaths: new Set(["palette.primaryColor"]),
    });
    expect(claimed.cssVariables).not.toEqual(plain.cssVariables);
    expect(plain.cssVariables["--ds-button-primary-bg"]).toBe("#0F766E");
    expect(claimed.cssVariables["--ds-button-primary-bg"]).toBe(
      "var(--ds-color-primary)"
    );
  });

  it("has nothing to outrank on a first-party baseline: the indirection already tracks the seed", () => {
    // D6-2c-ii (2026-09-15): tenant-document compiles over neutral + preset;
    // the retired authored theme baked its primary family as literals, so the
    // claim moved 5 channels on bithire -- it now moves 0. This is the seed
    // deriver's third guard ("a value that bakes no colour of its own already
    // tracks the seed"), not a lost channel: the same claim still moves the
    // same 5 channels on a theme that bakes, asserted above.
    const asVertical = compileTheme(resolveFirstParty(bithire), modern);
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
    expect(claimed.cssVariables).toEqual(asVertical.cssVariables);
    expect(asVertical.cssVariables["--ds-button-primary-bg"]).toBe(
      "var(--ds-color-primary)"
    );
  });

  it("stamps the adapter's engine and projection onto the product", () => {
    const compiled = compileTheme(resolveFirstParty(bithire), modern);
    expect(compiled.engine).toBe("modern");
    expect(compiled.projection).toEqual({ seeds: {}, modes: [] });
  });

  it("carries the runtime half rather than leaving it to be re-derived", () => {
    const compiled = compileTheme(resolveFirstParty(bithire), modern);
    expect(compiled.runtime.personality).toBeTruthy();
    expect(compiled.runtime.tokenOverrides).toBeTruthy();
    expect(Object.keys(compiled.runtime.personality).length).toBeGreaterThan(0);
  });

  it("emits no cssString and no slug: scope is emission's", () => {
    const compiled = compileTheme(resolveFirstParty(bithire), modern) as unknown as Record<
      string,
      unknown
    >;
    expect(compiled.cssString).toBeUndefined();
    expect(compiled.tenantSlug).toBeUndefined();
  });

  it("reads the diagnostic slug off the resolved theme, not off a second input", () => {
    const compiled = compileTheme(
      resolveFirstParty(staticThemeIntent("bithire", "themanagementmiami")),
      modern
    );
    const original = compileTheme(resolveFirstParty(bithire), modern);
    // The id is a diagnostic label only: no channel may key on it.
    expect(compiled.cssVariables).toEqual(original.cssVariables);
  });

  it("keeps a zero-mode theme's modeBlocks empty rather than absent", () => {
    const noModes = { ...baseline, modes: undefined } as unknown as typeof baseline;
    // A theme with a family removed is not a roster baseline and no intent can
    // name it, so the resolution is built here -- the same shape the door emits.
    const compiled = compileTheme(
      { theme: noModes, provenance: EMPTY_PROVENANCE },
      modern
    );
    expect(compiled.modeBlocks).toEqual([]);
  });
});
