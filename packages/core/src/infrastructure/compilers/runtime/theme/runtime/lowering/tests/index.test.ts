/**
 * The lowering's discriminant and its product shape.
 */

import { describe, expect, it } from "vitest";

import { themeToBrandTheme } from "@/foundation/contracts/composition/tenants/themes/iso";
import type {
  BrandCompilerProvenanceInput,
  ThemeProvenance,
} from "@/foundation/contracts/composition/tenants/themes/resolved";
import { EMPTY_PROVENANCE } from "@/foundation/contracts/composition/tenants/themes/resolved";
import { compileBrandTheme } from "@/infrastructure/compilers/kernel/runtime/brand-theme";
import { FIRST_PARTY_THEMES } from "@/foundation/tokens/ts/presentation/brand-themes";

import { resolveTheme } from "../../resolution";
import { resolveAdapter } from "../../../presentation/adapters";
import { compileTheme } from "..";

const modern = resolveAdapter("modern");
const baseline = FIRST_PARTY_THEMES.bithire;

describe("compileTheme", () => {
  it("always yields modeBlocks as an array, never undefined", () => {
    const compiled = compileTheme(resolveTheme(baseline), modern);
    expect(Array.isArray(compiled.modeBlocks)).toBe(true);
  });

  it("selects the no-tenant branch on the empty provenance", () => {
    const compiled = compileTheme(resolveTheme(baseline), modern);
    const legacy = compileBrandTheme({
      brandTheme: themeToBrandTheme(baseline),
      tenantSlug: baseline.id,
    });
    expect(compiled.cssVariables).toEqual(legacy.cssVariables);
    expect(compiled.modeBlocks).toEqual(legacy.modeBlocks ?? []);
  });

  it("selects the tenant branch on a structurally EMPTY but authored provenance", () => {
    const authoredEmpty: ThemeProvenance = {
      tenantAuthored: true,
      authoredPaths: EMPTY_PROVENANCE.authoredPaths,
      floors: {},
      statusSeedAuthorship: EMPTY_PROVENANCE.statusSeedAuthorship,
    };
    const compiled = compileTheme(
      { theme: baseline, provenance: authoredEmpty },
      modern
    );
    // A typed const, never an inline literal: `compileBrandTheme`'s declared
    // parameter is the narrower `BrandCompilerInput`, so a fresh literal
    // carrying the three provenance fields is an excess-property error.
    const input: BrandCompilerProvenanceInput = {
      brandTheme: themeToBrandTheme(baseline),
      tenantSlug: baseline.id,
      tenantAuthoredPaths: authoredEmpty.authoredPaths,
      tenantPatch: authoredEmpty.floors,
      tenantStatusSeedAuthorship: authoredEmpty.statusSeedAuthorship,
    };
    const legacy = compileBrandTheme(input);
    expect(compiled.cssVariables).toEqual(legacy.cssVariables);
  });

  it("does not discriminate by identity: a cloned empty provenance is still not a tenant", () => {
    const clone: ThemeProvenance = { ...EMPTY_PROVENANCE };
    expect(clone).not.toBe(EMPTY_PROVENANCE);
    const viaClone = compileTheme({ theme: baseline, provenance: clone }, modern);
    const viaSingleton = compileTheme(resolveTheme(baseline), modern);
    expect(viaClone.cssVariables).toEqual(viaSingleton.cssVariables);
  });

  it("stamps the adapter's engine and projection onto the product", () => {
    const compiled = compileTheme(resolveTheme(baseline), modern);
    expect(compiled.engine).toBe("modern");
    expect(compiled.projection).toEqual({ seeds: {}, tokenOverrides: {}, modes: [] });
  });

  it("carries the runtime half without re-deriving it", () => {
    const compiled = compileTheme(resolveTheme(baseline), modern);
    const legacy = compileBrandTheme({
      brandTheme: themeToBrandTheme(baseline),
      tenantSlug: baseline.id,
    });
    expect(compiled.runtime.personality).toEqual(legacy.personality);
    expect(compiled.runtime.tokenOverrides).toEqual(legacy.tokenOverrides);
  });

  it("emits no cssString and no engineBridge", () => {
    const compiled = compileTheme(resolveTheme(baseline), modern) as unknown as Record<
      string,
      unknown
    >;
    expect(compiled.cssString).toBeUndefined();
    expect(compiled.engineBridge).toBeUndefined();
  });

  it("passes the resolved theme's id as the compiler's diagnostic slug", () => {
    const renamed = { ...baseline, id: "bithire" } as typeof baseline;
    const compiled = compileTheme(resolveTheme(renamed), modern);
    const legacy = compileBrandTheme({
      brandTheme: themeToBrandTheme(renamed),
      tenantSlug: renamed.id,
    });
    expect(compiled.cssVariables).toEqual(legacy.cssVariables);
  });

  it("keeps a zero-mode theme's modeBlocks empty rather than absent", () => {
    const noModes = { ...baseline, modes: undefined } as unknown as typeof baseline;
    const compiled = compileTheme(resolveTheme(noModes), modern);
    expect(compiled.modeBlocks).toEqual([]);
  });
});
