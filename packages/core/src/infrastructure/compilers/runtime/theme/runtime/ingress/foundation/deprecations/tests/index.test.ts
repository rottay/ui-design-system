import { describe, expect, it } from "vitest";

import type {
  TenantThemeConfigIdentity,
  TenantThemeDocument,
} from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import { TENANT_CAPABILITY_REGISTRY } from "@/foundation/contracts/composition/tenants/capabilities";
import {
  compileTenantTheme,
  compileTenantThemeConfig,
  getTenantThemeVerticalEnvelope,
  hydrateTenantThemeConfig,
} from "@/infrastructure/compilers/composition/tenant-theme";
import { compileTenantThemeDocumentV2 } from "@/infrastructure/compilers/composition/tenant-theme/document-v2";
import { verifyTenantThemeArtifactV1 } from "@/infrastructure/runtime/theming/foundation/visual-authority/foundation/admission";
import { admitDocument } from "../../../runtime/document-v2/presentation/admission";
import {
  TOKEN_OVERRIDES_MIGRATION_DOCUMENT,
  TOKEN_OVERRIDES_RETIREMENT_RULING,
  censusRetiringCapabilitiesV1,
} from "..";

const IDENTITY: TenantThemeConfigIdentity = {
  tenantId: "tenant_retiring_probe",
  slug: "retiring-probe",
  verticalKey: "bithire",
  rowVersion: 1,
};
const ENVELOPE = getTenantThemeVerticalEnvelope("bithire")!;

const withOverrides = (tokenOverrides: Record<string, string | number>): TenantThemeDocument => ({
  schemaVersion: 1,
  mode: "advanced",
  visualFoundation: { general: {}, advanced: { tokenOverrides } },
});
const ENTRIES = { "--ds-radius-md": "6px", "--ds-color-error": "#c0392b", "--ds-effect-intensity": 0.4 };

describe("retiring capability: token-overrides (R32 Q2)", () => {
  it("the registry row is retiring, and the notice names the ruling of that row", () => {
    expect(TENANT_CAPABILITY_REGISTRY.find((row) => row.id === "token-overrides")?.status).toBe("retiring");
    expect(TOKEN_OVERRIDES_RETIREMENT_RULING).toMatch(/^R32 Q2/u);
  });

  it("v1 admission emits ONE named notice per admitted entry, at the entry's own path, sorted", () => {
    const admission = admitDocument({ vertical: "bithire", document: withOverrides(ENTRIES) });
    expect(admission.version).toBe(1);
    expect(admission.deprecations.map((notice) => notice.path)).toEqual([
      'visualFoundation.advanced.tokenOverrides["--ds-color-error"]',
      'visualFoundation.advanced.tokenOverrides["--ds-effect-intensity"]',
      'visualFoundation.advanced.tokenOverrides["--ds-radius-md"]',
    ]);
    for (const notice of admission.deprecations) {
      expect(notice).toMatchObject({ code: "retiring-capability", capability: "token-overrides", ruling: TOKEN_OVERRIDES_RETIREMENT_RULING });
      expect(notice.message).toContain(notice.path);
      expect(notice.message).toContain(TOKEN_OVERRIDES_MIGRATION_DOCUMENT);
    }
  });

  it("v1 still ADMITS and lowers the entry (D-C): the notice never refuses", () => {
    const artifact = compileTenantThemeConfig(hydrateTenantThemeConfig(withOverrides(ENTRIES), IDENTITY), { verticalEnvelope: ENVELOPE });
    const plain = compileTenantThemeConfig(hydrateTenantThemeConfig(withOverrides({}), IDENTITY), { verticalEnvelope: ENVELOPE });
    expect(artifact.variables["--ds-color-error"]).not.toBe(plain.variables["--ds-color-error"]);
  });

  it("the compiled artifact carries the notices, outside the digest, and still verifies", () => {
    const { artifact } = compileTenantTheme(hydrateTenantThemeConfig(withOverrides(ENTRIES), IDENTITY), { verticalEnvelope: ENVELOPE });
    expect(artifact.deprecations?.map((notice) => notice.path)).toHaveLength(3);
    const stripped = { ...artifact };
    delete stripped.deprecations;
    // The digest recomputes from the v1 source with or without the notices.
    expect(verifyTenantThemeArtifactV1(artifact, { slug: IDENTITY.slug, verticalKey: "bithire" }).ok).toBe(true);
    expect(verifyTenantThemeArtifactV1(stripped, { slug: IDENTITY.slug, verticalKey: "bithire" }).ok).toBe(true);
  });

  it("a v1 row without the field, or a simple row, carries no notice and no field", () => {
    expect(censusRetiringCapabilitiesV1(withOverrides({}))).toEqual([]);
    expect(censusRetiringCapabilitiesV1({ schemaVersion: 1, mode: "simple", appearance: {} } as TenantThemeDocument)).toEqual([]);
    const artifact = compileTenantThemeConfig(hydrateTenantThemeConfig(withOverrides({}), IDENTITY), { verticalEnvelope: ENVELOPE });
    expect("deprecations" in artifact).toBe(false);
  });

  it("v2/v3 never emit it: their door refuses the decision by name, and an admitted decision document carries none", () => {
    for (const version of [2, 3] as const) {
      expect(() => compileTenantThemeDocumentV2({
        document: { version, plan: "pro", decisions: { "token-overrides": { "--ds-color-error": "#00404f" } } } as never,
        tenantId: IDENTITY.tenantId,
        slug: IDENTITY.slug,
        verticalKey: "bithire",
        rowVersion: IDENTITY.rowVersion,
      })).toThrow(/token-overrides/u);
      const admission = admitDocument({
        vertical: "bithire",
        document: { version, plan: "pro", decisions: { "palette.seeds": { primary: "#0f766e" } } } as never,
      });
      expect(admission.deprecations).toEqual([]);
    }
  });
});
