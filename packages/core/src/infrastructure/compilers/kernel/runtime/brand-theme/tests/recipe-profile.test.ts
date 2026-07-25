import { describe, expect, it } from "vitest";

import {
  RECIPE_PROFILES,
  RECIPE_PROFILE_SCHEMA_VERSION,
  resolveRecipeProfile,
  validateRecipeProfileSelection,
} from "@/foundation/tokens/ts/presentation/recipe-profiles";
import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";
import { compileBrandTheme } from "../index";

describe("recipe-profile governance (DS-S001)", () => {
  it("publishes a namespaced, versioned, closed registry", () => {
    expect(RECIPE_PROFILES.length).toBeGreaterThanOrEqual(2);
    for (const profile of RECIPE_PROFILES) {
      expect(profile.id).toMatch(/^[a-z0-9-]+\/[a-z0-9-]+@[0-9]+$/);
      expect(profile.schemaVersion).toBe(RECIPE_PROFILE_SCHEMA_VERSION);
      expect(Object.keys(profile.families).length).toBeGreaterThan(0);
    }
    const ids = RECIPE_PROFILES.map((profile) => profile.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("rejects malformed ids, unknown ids and foreign schema versions with stable reasons", () => {
    expect(validateRecipeProfileSelection("TechnicalSharp").reason).toBe(
      "malformed-id"
    );
    expect(validateRecipeProfileSelection("rottay/does-not-exist@1").reason).toBe(
      "unknown-id"
    );
    expect(
      validateRecipeProfileSelection("rottay/technical-sharp@1", 999).reason
    ).toBe("unsupported-schema-version");
    expect(validateRecipeProfileSelection(undefined).ok).toBe(true);
    expect(
      validateRecipeProfileSelection("rottay/technical-sharp@1").profile?.id
    ).toBe("rottay/technical-sharp@1");
  });

  it("fails closed at runtime: invalid selections resolve to no profile", () => {
    expect(resolveRecipeProfile("rottay/does-not-exist@1")).toBeUndefined();
    expect(resolveRecipeProfile("not a profile")).toBeUndefined();
    expect(resolveRecipeProfile("rottay/technical-sharp@1", 2)).toBeUndefined();
    expect(resolveRecipeProfile("rottay/editorial-round@1")?.families.card)
      .toBeDefined();
  });

  it("compiles a valid static BrandTheme selection into the canonical channel", () => {
    const brandTheme: BrandTheme = {
      id: "profile-proof",
      name: "Profile proof",
      recipes: {
        schemaVersion: RECIPE_PROFILE_SCHEMA_VERSION,
        profile: "rottay/technical-sharp@1",
      },
    };
    const compiled = compileBrandTheme({ brandTheme, tenantSlug: "proof" });
    expect(compiled.recipeProfile).toBe("rottay/technical-sharp@1");
    expect(compiled.cssVariables["--ds-recipe-profile"]).toBe(
      '"rottay/technical-sharp@1"'
    );
    expect(compiled.cssString).toContain("--ds-recipe-profile");
  });

  it("compiles invalid static selections to engine defaults without a channel", () => {
    const compile = (profile: string, schemaVersion: number) =>
      compileBrandTheme({
        brandTheme: {
          id: "profile-proof",
          name: "Profile proof",
          recipes: { schemaVersion, profile },
        },
        tenantSlug: "proof",
      });

    for (const compiled of [
      compile("rottay/does-not-exist@1", RECIPE_PROFILE_SCHEMA_VERSION),
      compile("rottay/technical-sharp@1", 999),
      compile("not a profile", RECIPE_PROFILE_SCHEMA_VERSION),
    ]) {
      expect(compiled.recipeProfile).toBeUndefined();
      expect(compiled.cssVariables["--ds-recipe-profile"]).toBeUndefined();
    }
  });

  it("keeps profile defaults inside the authored recipe domains of the target families", () => {
    for (const profile of RECIPE_PROFILES) {
      const { button, card, tabs, dataTable } = profile.families;
      if (button?.variant !== undefined) {
        expect([
          "primary",
          "secondary",
          "default",
          "outline",
          "ghost",
          "text",
          "dashed",
          "danger",
          "success",
          "warning",
          "info",
          "ai",
          "link",
        ]).toContain(button.variant);
      }
      if (button?.shape !== undefined) {
        expect(["default", "circle", "round"]).toContain(button.shape);
      }
      if (card?.variant !== undefined) {
        expect(["elevated", "outlined", "filled", "ghost"]).toContain(
          card.variant
        );
      }
      if (tabs?.recipe !== undefined) {
        expect(["underline", "contained", "segmented", "pills"]).toContain(
          tabs.recipe
        );
      }
      if (dataTable?.recipe !== undefined) {
        expect(["minimal", "ruled", "grid", "zebra", "editorial"]).toContain(
          dataTable.recipe
        );
      }
    }
  });
});
