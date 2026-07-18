import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import type {
  TenantThemeConfigIdentityV1,
  TenantThemeDocumentV1,
} from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import {
  TENANT_THEME_ANATOMY_VARIANTS_V1,
  TENANT_THEME_FONT_PACK_IDS_V1,
} from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import {
  TENANT_THEME_CONFIG_V1_SCHEMA_DIGEST,
  TENANT_THEME_DOCUMENT_V1_SCHEMA_DIGEST,
  compileTenantThemeConfig,
  getTenantThemeVerticalEnvelope,
  hydrateTenantThemeConfig,
  tenantThemeAnatomyAttributes,
  validateTenantThemeAgainstVerticalEnvelope,
  validateTenantThemeDocument,
} from "..";

const FIXTURE_DIR = resolve(
  process.cwd(),
  "src/infrastructure/compilers/composition/tenant-theme/tests/fixtures"
);

const PRE_CHANGE_DIGESTS = JSON.parse(
  readFileSync(resolve(FIXTURE_DIR, "w4-pre-change-digests.json"), "utf8")
) as { documentSchemaDigest: string; configSchemaDigest: string };

const IDENTITY: TenantThemeConfigIdentityV1 = {
  tenantId: "tenant_w4",
  slug: "w4-tenant",
  verticalKey: "bithire",
  rowVersion: 1,
};

const BITHIRE_ENVELOPE = getTenantThemeVerticalEnvelope("bithire")!;

const anatomyDocument = (
  anatomy: Record<string, string>
): TenantThemeDocumentV1 =>
  ({
    schemaVersion: 1,
    mode: "advanced",
    visualFoundation: {
      advanced: {
        chrome: Object.fromEntries(
          Object.entries(anatomy).map(([family, variant]) => [
            family,
            { anatomy: variant },
          ])
        ),
      },
    },
  }) as TenantThemeDocumentV1;

describe("W4 schema surface: typePairing / scale / radiusScale / palette.dark", () => {
  it("performs one coherent schema digest bump for the wave", () => {
    expect(TENANT_THEME_DOCUMENT_V1_SCHEMA_DIGEST).not.toBe(
      PRE_CHANGE_DIGESTS.documentSchemaDigest
    );
    expect(TENANT_THEME_CONFIG_V1_SCHEMA_DIGEST).not.toBe(
      PRE_CHANGE_DIGESTS.configSchemaDigest
    );
    expect(TENANT_THEME_DOCUMENT_V1_SCHEMA_DIGEST).toMatch(
      /^sha256-[a-f0-9]{64}$/
    );
  });

  it("retires the bare editorial pack id for the six role-suffixed packs", () => {
    expect([...TENANT_THEME_FONT_PACK_IDS_V1]).toEqual([
      "editorial-display",
      "editorial-text",
      "grotesk-display",
      "humanist-text",
      "geometric-display",
      "plex-mono",
    ]);
  });

  it("accepts the four new general fields inside their documented bounds", () => {
    const result = validateTenantThemeDocument({
      schemaVersion: 1,
      mode: "simple",
      appearance: {
        palette: {
          primary: "#2F6B9A",
          backgroundMode: "auto",
          dark: {
            primary: "#7FB2DA",
            secondary: "#C9A96A",
            accent: "#D98874",
            background: "#101014",
          },
        },
        typography: { typePairing: "editorial", scale: 1.04 },
        shape: { buttonStyle: "pill", radiusScale: 1.1 },
      },
    });
    expect(result.success).toBe(true);
  });

  it.each([
    [
      "unknown typePairing",
      { typography: { typePairing: "brutalist" } },
      "$.appearance.typography.typePairing",
    ],
    [
      "type scale above cap",
      { typography: { scale: 1.2 } },
      "$.appearance.typography.scale",
    ],
    [
      "type scale below cap",
      { typography: { scale: 0.5 } },
      "$.appearance.typography.scale",
    ],
    [
      "radius scale above cap",
      { shape: { radiusScale: 2 } },
      "$.appearance.shape.radiusScale",
    ],
    [
      "dark seed invalid color",
      { palette: { dark: { primary: "url(https://evil.invalid)" } } },
      "$.appearance.palette.dark.primary",
    ],
    [
      "dark seed unknown field",
      { palette: { dark: { canvasImage: "#000000" } } },
      "$.appearance.palette.dark.canvasImage",
    ],
  ])("rejects %s at its exact path", (_name, appearance, path) => {
    const result = validateTenantThemeDocument({
      schemaVersion: 1,
      mode: "simple",
      appearance,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues.some((issue) => issue.path === path)).toBe(true);
    }
  });

  it("keeps the type/radius dials inside the vertical envelope ranges", () => {
    const scaleConfig = hydrateTenantThemeConfig(
      {
        schemaVersion: 1,
        mode: "simple",
        appearance: {
          typography: { scale: 0.9 },
          shape: { radiusScale: 0.76 },
        },
      },
      IDENTITY
    );
    const issues = validateTenantThemeAgainstVerticalEnvelope(
      scaleConfig,
      BITHIRE_ENVELOPE
    );
    expect(issues).toEqual([
      expect.objectContaining({
        code: "invalid_value",
        path: "$.appearance.typography.scale",
      }),
      expect.objectContaining({
        code: "invalid_value",
        path: "$.appearance.shape.radiusScale",
      }),
    ]);

    const inRange = hydrateTenantThemeConfig(
      {
        schemaVersion: 1,
        mode: "simple",
        appearance: {
          typography: { scale: 1.02 },
          shape: { radiusScale: 1.05 },
        },
      },
      IDENTITY
    );
    expect(
      validateTenantThemeAgainstVerticalEnvelope(inRange, BITHIRE_ENVELOPE)
    ).toEqual([]);
  });
});

describe("W4 anatomy variants: closed data enums selecting code-owned skins", () => {
  it("accepts every registered (family, variant) pair and rejects foreign pairs", () => {
    for (const [family, variants] of Object.entries(
      TENANT_THEME_ANATOMY_VARIANTS_V1
    )) {
      for (const variant of variants) {
        const result = validateTenantThemeDocument(
          anatomyDocument({ [family]: variant })
        );
        expect(result.success, `${family}=${variant}`).toBe(true);
      }
    }
    const crossed = validateTenantThemeDocument(
      anatomyDocument({ cardComponent: "zebra" })
    );
    expect(crossed.success).toBe(false);
    if (!crossed.success) {
      expect(
        crossed.issues.some(
          (issue) =>
            issue.code === "invalid_value" &&
            issue.path ===
              "$.visualFoundation.advanced.chrome.cardComponent.anatomy"
        )
      ).toBe(true);
    }
  });

  it("fails closed when the vertical envelope does not opt into anatomy variants", () => {
    const config = hydrateTenantThemeConfig(
      anatomyDocument({ table: "zebra", sidebar: "rail" }),
      IDENTITY
    );
    const withoutOptIn = {
      ...BITHIRE_ENVELOPE,
      advanced: {
        chromeFamilies: BITHIRE_ENVELOPE.advanced?.chromeFamilies ?? [],
        allowTokenOverrides: true,
      },
    };
    const issues = validateTenantThemeAgainstVerticalEnvelope(
      config,
      withoutOptIn
    );
    expect(issues).toEqual([
      expect.objectContaining({
        code: "invalid_value",
        path: "$.visualFoundation.advanced.chrome.table.anatomy",
      }),
      expect.objectContaining({
        code: "invalid_value",
        path: "$.visualFoundation.advanced.chrome.sidebar.anatomy",
      }),
    ]);

    const explicitDefault = hydrateTenantThemeConfig(
      anatomyDocument({ table: "default" }),
      IDENTITY
    );
    expect(
      validateTenantThemeAgainstVerticalEnvelope(explicitDefault, withoutOptIn)
    ).toEqual([]);
    expect(
      validateTenantThemeAgainstVerticalEnvelope(config, BITHIRE_ENVELOPE)
    ).toEqual([]);
  });

  it("projects anatomy selections byte-exactly into data-anatomy-* attributes", () => {
    const config = hydrateTenantThemeConfig(
      anatomyDocument({
        cardComponent: "underline",
        table: "open",
        sidebar: "rail",
        layout: "floating",
      }),
      IDENTITY
    );
    const normalized =
      config.mode === "advanced" ? config.visualFoundation : undefined;
    const attributes = tenantThemeAnatomyAttributes({
      normalizedAppearance: { advanced: normalized?.advanced },
    });
    expect(JSON.stringify(attributes)).toBe(
      '{"data-anatomy-card":"underline","data-anatomy-table":"open","data-anatomy-sidebar":"rail","data-anatomy-layout":"floating"}'
    );
  });

  it("keeps anatomy as data: no anatomy value ever reaches variables or css", () => {
    const artifact = compileTenantThemeConfig(
      hydrateTenantThemeConfig(
        anatomyDocument({
          cardComponent: "ghost",
          table: "zebra",
          sidebar: "rail",
          layout: "flat",
        }),
        IDENTITY
      ),
      { verticalEnvelope: BITHIRE_ENVELOPE }
    );
    expect(
      Object.keys(artifact.variables).filter((token) =>
        token.includes("anatomy")
      )
    ).toEqual([]);
    expect(artifact.css).not.toContain("anatomy");
    expect(tenantThemeAnatomyAttributes(artifact)).toEqual({
      "data-anatomy-card": "ghost",
      "data-anatomy-table": "zebra",
      "data-anatomy-sidebar": "rail",
      "data-anatomy-layout": "flat",
    });
  });

  it("stamps zero attributes for default/absent anatomy", () => {
    expect(
      tenantThemeAnatomyAttributes({ normalizedAppearance: {} })
    ).toEqual({});
    expect(
      tenantThemeAnatomyAttributes({
        normalizedAppearance: {
          advanced: {
            chrome: {
              cardComponent: { anatomy: "default" },
              table: { bg: "#FFFFFF" },
            },
          },
        },
      })
    ).toEqual({});
  });
});

describe("W4 compiled artifact: contrast autocorrect and dual light-dark emission", () => {
  it("autocorrects a failing authored text/ground pairing and reports it", () => {
    const artifact = compileTenantThemeConfig(
      hydrateTenantThemeConfig(
        {
          schemaVersion: 1,
          mode: "advanced",
          visualFoundation: {
            advanced: {
              tokenOverrides: {
                "--ds-color-text-primary": "#BDBDBD",
                "--ds-color-bg-primary": "#F5F5F5",
              },
            },
          },
        },
        IDENTITY
      ),
      { verticalEnvelope: BITHIRE_ENVELOPE }
    );
    expect(artifact.adjustments).toBeDefined();
    const adjustment = artifact.adjustments?.find(
      (row) => row.token === "--ds-color-text-primary"
    );
    expect(adjustment).toMatchObject({
      token: "--ds-color-text-primary",
      pairedWith: "--ds-color-bg-primary",
      from: "#BDBDBD",
    });
    expect(artifact.variables["--ds-color-text-primary"]).not.toBe("#BDBDBD");
    expect(artifact.variables["--ds-color-text-primary"]).toMatch(
      /^#[0-9A-F]{6}$/i
    );
    expect(Math.abs(adjustment?.lcAfter ?? 0)).toBeGreaterThan(
      Math.abs(adjustment?.lcBefore ?? 0)
    );
  });

  it("keeps the adjustment list out of well-formed artifacts and their digests", () => {
    const wellFormed = compileTenantThemeConfig(
      hydrateTenantThemeConfig(
        {
          schemaVersion: 1,
          mode: "simple",
          appearance: { palette: { primary: "#2F6B9A" } },
        },
        IDENTITY
      )
    );
    expect(wellFormed.adjustments).toBeUndefined();
    expect(JSON.stringify(wellFormed)).not.toContain('"adjustments"');
  });

  it("compiles dual dark seeds into validated light-dark() variables", () => {
    const artifact = compileTenantThemeConfig(
      hydrateTenantThemeConfig(
        {
          schemaVersion: 1,
          mode: "simple",
          appearance: {
            palette: {
              primary: "#2F6B9A",
              backgroundMode: "auto",
              dark: { primary: "#7FB2DA", background: "#101014" },
            },
          },
        },
        IDENTITY
      )
    );
    expect(artifact.variables["--ds-color-primary"]).toBe(
      "light-dark(#2F6B9A, #7FB2DA)"
    );
    expect(artifact.variables["--ds-color-primary-500"]).toMatch(
      /^light-dark\(#[0-9A-F]{6}, #[0-9A-F]{6}\)$/
    );
    expect(artifact.variables["--ds-color-scheme"]).toBe("light dark");
    expect(artifact.css).toContain("--ds-color-scheme: light dark;");
  });

  it("checks authored chart categories against the tenant's own dark ground", () => {
    const compileWithDarkGround = () =>
      compileTenantThemeConfig(
        hydrateTenantThemeConfig(
          {
            schemaVersion: 1,
            mode: "advanced",
            visualFoundation: {
              general: {
                palette: {
                  backgroundMode: "auto",
                  dark: { background: "#8A8A8A" },
                },
              },
              advanced: {
                // 4.6:1 on white and 4.0:1 on #0C0C0E, but ~1.6:1 on the
                // authored mid-gray dark canvas.
                tokenOverrides: { "--ds-chart-category-1": "#767676" },
              },
            },
          },
          IDENTITY
        ),
        { verticalEnvelope: BITHIRE_ENVELOPE }
      );
    expect(compileWithDarkGround).toThrow(/below 3:1/i);
  });
});
