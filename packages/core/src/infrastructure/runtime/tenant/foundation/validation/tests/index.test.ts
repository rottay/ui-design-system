import { describe, expect, it } from "vitest";

import { assertLowerKebabTenantSlug, isValidTenantConfig } from "..";

function tenant(overrides: Record<string, unknown> = {}) {
  return {
    slug: "acme",
    name: "Acme Labs",
    engine: "modern",
    theme: "base",
    plan: "pro",
    features: [],
    branding: { companyName: "Acme Labs" },
    vertical: "rottay",
    ...overrides,
  };
}

describe("tenant identity validation", () => {
  it("allows customer identity on a first-party vertical", () => {
    expect(isValidTenantConfig(tenant())).toBe(true);
  });

  it("accepts an omitted engine because the vertical owns engine resolution", () => {
    const { engine: _engine, ...withoutEngine } = tenant();
    expect(isValidTenantConfig(withoutEngine)).toBe(true);
  });

  it.each([
    { slug: "Bit-Hire" },
    { name: "\uFF32\uFF4F\uFF54\uFF54\uFF41\uFF59" },
    { branding: { companyName: "e\u200bvnto" } },
    { name: "Bit\u034fHire" },
    { branding: { companyName: "Ev\u202Ento" } },
  ])("rejects reserved first-party variants", (override) => {
    expect(isValidTenantConfig(tenant(override))).toBe(false);
  });

  /* The gate is about what a reader sees, so a visible mark makes the name the
     customer's own. Rejecting these would refuse every brand with an accent to
     catch an impersonation nobody could fall for. */
  it.each([
    { name: "B\u0338itHire" },
    { branding: { companyName: "Evnto\u00ae" } },
    { name: "R\u00f6ttay" },
  ])("admits a visibly distinct name built from the same letters", (override) => {
    expect(isValidTenantConfig(tenant(override))).toBe(true);
  });

  it.each(["Acme", "acme_works", "acme--works", "-acme", "acme-"])(
    "rejects a non-canonical public loader slug: %j",
    (slug) => {
      expect(() => assertLowerKebabTenantSlug(slug)).toThrow(/lower-kebab/);
    },
  );

  it("accepts canonical public loader slugs", () => {
    expect(() => assertLowerKebabTenantSlug("acme-works-2")).not.toThrow();
  });

  it("does not reject a longer customer name", () => {
    expect(
      isValidTenantConfig(
        tenant({ name: "BitHire Labs", branding: { companyName: "BitHire Labs" } }),
      ),
    ).toBe(true);
  });
});
