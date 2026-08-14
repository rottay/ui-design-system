import { describe, expect, it } from "vitest";

import type {
  TenantThemeConfig,
  TenantThemeConfigIdentity,
  TenantThemeDocument,
} from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import {
  compileTenantThemeConfig,
  hydrateTenantThemeConfig,
} from "..";

const DOCUMENT: TenantThemeDocument = {
  schemaVersion: 1,
  mode: "simple",
  appearance: { palette: { primary: "#2563EB" } },
};

const CUSTOMER_IDENTITY: TenantThemeConfigIdentity = {
  tenantId: "tenant_acme",
  slug: "acme",
  verticalKey: "rottay",
  rowVersion: 1,
};

describe("tenant-theme first-party identity boundary", () => {
  it("allows a customer row on a first-party vertical", () => {
    const config = hydrateTenantThemeConfig(DOCUMENT, CUSTOMER_IDENTITY);
    expect(compileTenantThemeConfig(config)).toMatchObject({
      slug: "acme",
      verticalKey: "rottay",
    });
  });

  it.each(["bithire", "Bit-Hire", "bit\u200dhire", "ＢｉｔＨｉｒｅ"])(
    "rejects a reserved slug during hydration: %j",
    (slug) => {
      expect(() =>
        hydrateTenantThemeConfig(DOCUMENT, {
          ...CUSTOMER_IDENTITY,
          slug,
        }),
      ).toThrow(/reserved/);
    },
  );

  it("rejects a pre-hydrated reserved config at direct compilation", () => {
    const hostile = {
      ...DOCUMENT,
      ...CUSTOMER_IDENTITY,
      slug: "evnto",
      verticalKey: "evnto",
    } as TenantThemeConfig;

    expect(() => compileTenantThemeConfig(hostile)).toThrow(/reserved/);
  });
});
