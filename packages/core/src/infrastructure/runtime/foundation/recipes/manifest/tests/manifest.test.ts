import { describe, expect, it } from "vitest";

import { buildRecipeManifest } from "../index";

describe("public recipe manifest (DS-S001)", () => {
  const manifest = buildRecipeManifest();

  it("covers all six target families with slots, axes and mechanisms", () => {
    const byName = new Map(manifest.families.map((family) => [family.name, family]));
    expect([...byName.keys()].sort()).toEqual([
      "button",
      "card",
      "dataTable",
      "sectionCard",
      "tabs",
      "tag",
    ]);
    const button = byName.get("button");
    expect(button?.recipeMechanism).toBe("class");
    expect(button?.axes.variant).toContain("outline");
    expect(button?.axes.shape).toEqual(["default", "circle", "round"]);
    expect(byName.get("dataTable")?.recipeMechanism).toBe("data-attribute");
    expect(byName.get("dataTable")?.axes.recipe).toContain("ruled");
    expect(byName.get("sectionCard")?.axes.variant).toContain("outlined");
    expect(byName.get("tag")?.axes.radius).toContain("full");
    for (const family of manifest.families) {
      expect(family.slots.length).toBeGreaterThan(0);
      expect(family.customPropertyPrefix).toMatch(/^--ds-[a-z-]+-$/);
    }
  });

  it("publishes the closed profile registry with in-domain family defaults", () => {
    expect(manifest.profiles.length).toBeGreaterThanOrEqual(2);
    const byName = new Map(manifest.families.map((family) => [family.name, family]));
    for (const profile of manifest.profiles) {
      for (const [familyName, defaults] of Object.entries(profile.families)) {
        const family = byName.get(familyName);
        expect(family, `${profile.id} names unknown family ${familyName}`).toBeDefined();
        for (const [axis, value] of Object.entries(defaults)) {
          if (typeof value !== "string") continue;
          expect(
            family?.axes[axis],
            `${profile.id}: ${familyName}.${axis} is not a manifest axis`
          ).toBeDefined();
          expect(
            family?.axes[axis],
            `${profile.id}: ${familyName}.${axis}=${value} outside domain`
          ).toContain(value);
        }
      }
    }
  });
});
