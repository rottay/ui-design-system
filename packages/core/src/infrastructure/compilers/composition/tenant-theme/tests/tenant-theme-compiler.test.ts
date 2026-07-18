import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";
import type {
  TenantThemeConfigIdentity,
  TenantThemeDocument,
  TenantThemeVerticalEnvelope,
} from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import {
  TENANT_THEME_COMPILER_VERSION,
  TENANT_THEME_CONFIG_SCHEMA,
  TENANT_THEME_CONFIG_SCHEMA_DIGEST,
  TENANT_THEME_DOCUMENT_SCHEMA_DIGEST,
  TENANT_THEME_VERTICAL_ENVELOPES,
  TenantThemeValidationError,
  canonicalizeTenantThemeValue,
  compileTenantThemeConfig,
  getTenantThemeVerticalEnvelope,
  hydrateTenantThemeConfig,
  parseTenantThemeDocument,
  sha256TenantThemeValue,
  tenantThemeArtifactRootAttributes,
  validateTenantThemeConfig,
  validateTenantThemeDocument,
} from "..";

const IDENTITY: TenantThemeConfigIdentity = {
  tenantId: "tenant_01",
  slug: "themanagementmiami",
  verticalKey: "bithire",
  rowVersion: 7,
};

const BITHIRE_STATIC_ARTIFACT = readFileSync(
  resolve(
    process.cwd(),
    "src/foundation/tokens/css/facade/artifacts/bithire/index.css"
  ),
  "utf8"
);

const SIMPLE_DOCUMENT: TenantThemeDocument = {
  schemaVersion: 1,
  mode: "simple",
  appearance: {
    palette: { primary: "#0F766E", secondary: "#8C6D46", accent: "#E2725B" },
    typography: {
      fontFamilyBase: "Optima, Candara, 'Noto Sans', sans-serif",
      fontFamilyHeading: "'Fraunces', Georgia, 'Times New Roman', serif",
    },
    density: "normal",
    motion: { intensity: 0.62, durationScale: 1.15, ambient: "subtle" },
    shape: { buttonStyle: "soft" },
    surfaces: { elevation: "elevated" },
    navigation: { sidebarTone: "subtle" },
  },
};

const ADVANCED_DOCUMENT: TenantThemeDocument = {
  schemaVersion: 1,
  mode: "advanced",
  visualFoundation: {
    general:
      SIMPLE_DOCUMENT.mode === "simple" ? SIMPLE_DOCUMENT.appearance : {},
    advanced: {
      tokenOverrides: {
        "--ds-color-bg-primary": "#FBF6EC",
        "--ds-color-success": "#5B8A3A",
        "--ds-color-warning": "#C39E22",
        "--ds-color-error": "#C0392B",
        "--ds-color-info": "#5B6FA8",
        "--ds-font-family-display":
          "'Fraunces', Georgia, 'Times New Roman', serif",
        "--ds-radius-sm": "4px",
        "--ds-radius-md": "6px",
        "--ds-radius-lg": "8px",
        "--ds-radius-xl": "12px",
        "--ds-shadow-md":
          "0 4px 10px rgba(46, 38, 28, 0.08), 0 1px 3px rgba(46, 38, 28, 0.05)",
        "--ds-gradient-primary": "linear-gradient(135deg, #0F766E, #E2725B)",
        "--ds-effect-intensity": 0.45,
      },
      chrome: {
        sidebar: {
          bg: "#FFFEFB",
          border: "#E2D9CC",
          text: "#2E261C",
          width: "284px",
          collapsedWidth: "72px",
          headerHeight: "68px",
          iconSize: "18px",
          itemBgActive: "var(--ds-tint-8)",
        },
        layout: {
          headerHeight: "64px",
        },
        shell: {
          commandHomeMaxWidth: "1180px",
          commandHomeGap: "20px",
          commandHomePanelGap: "14px",
          commandHomeCompactActionHeight: "38px",
          commandHomeConsoleMinHeight: "320px",
          commandHomeConsolePadding: "20px",
          commandHomeIconBg: "#F3EEE5",
          commandHomeIconBorder: "#D8CFC1",
        },
        table: {
          bg: "#FFFEFB",
          headerBg: "#FFFFFF",
          rowBgHover: "#FBF3E7",
          rowBgSelected: "var(--ds-tint-12)",
          headerFontWeight: 700,
          headerLetterSpacing: "0.04em",
          headerTextTransform: "none",
          headerBlockSize: "42px",
        },
        cardComponent: {
          bg: "#FFFEFB",
          border: "transparent",
          shadow: "0 4px 10px rgba(46, 38, 28, 0.08)",
          radius: "8px",
          hoverTransform: "translateY(-1px)",
          titleFontWeight: 600,
        },
        metricCard: {
          bg: "#FFFEFB",
          minHeight: "156px",
          hoverTransform: "translateY(-1px)",
          transition: "background 180ms ease, transform 180ms ease",
          iconBg: "#F3EEE5",
          iconBorder: "#D8CFC1",
          meterFill: "linear-gradient(90deg, #0F766E, #E2725B)",
          valueColor: "#2E261C",
        },
        signalCard: {
          topLineDisplay: "none",
        },
        listingGrid: {
          minCardWidth: "240px",
          minCompactWidth: "180px",
          minTallWidth: "280px",
          columns: "repeat(3, minmax(0, 1fr))",
        },
      },
    },
  },
};

const BITHIRE_TEST_ENVELOPE = getTenantThemeVerticalEnvelope("bithire")!;
const EVNTO_TEST_ENVELOPE = getTenantThemeVerticalEnvelope("evnto")!;

const hydrate = (
  document: TenantThemeDocument = SIMPLE_DOCUMENT,
  identity: TenantThemeConfigIdentity = IDENTITY
) => hydrateTenantThemeConfig(document, identity);

describe("TenantThemeConfig v1 server contract", () => {
  it("uses a portable SHA-256 implementation with the canonical known vector", () => {
    const expected = createHash("sha256").update("abc").digest("hex");
    expect(sha256TenantThemeValue("abc")).toBe(expected);
    expect(sha256TenantThemeValue("abc")).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
    );
  });

  it("publishes immutable schema/document drift sentinels", () => {
    expect(TENANT_THEME_DOCUMENT_SCHEMA_DIGEST).toBe(
      "sha256-85586096e40f9bb976419e92cd83a7a19ff74f68a5afd1c1a258e6473c056242"
    );
    expect(TENANT_THEME_CONFIG_SCHEMA_DIGEST).toBe(
      "sha256-722c1a75193ef57ce111b519d3ddb952db256e06387ee55366f0d17c2ad59d9e"
    );
    expect(Object.isFrozen(TENANT_THEME_CONFIG_SCHEMA)).toBe(true);
    expect(
      Object.isFrozen(TENANT_THEME_CONFIG_SCHEMA.documents.simple)
    ).toBe(true);
    expect(Object.isFrozen(TENANT_THEME_CONFIG_SCHEMA.limits)).toBe(true);
    expect(TENANT_THEME_COMPILER_VERSION).toBe("tenant-theme-compiler@3");
    expect(TENANT_THEME_CONFIG_SCHEMA.limits).toMatchObject({
      maxCompiledVariables: 512,
      maxCompiledVariableBytes: 90_112,
      maxTokenOverrides: 200,
    });
    expect(TENANT_THEME_CONFIG_SCHEMA.scopeAttributes).toEqual([
      "data-ds-root",
      "data-vertical",
      "data-tenant",
    ]);
    expect(() => {
      (
        TENANT_THEME_CONFIG_SCHEMA.limits as { maxDepth: number }
      ).maxDepth = 999;
    }).toThrow(TypeError);
  });

  it("owns the complete BitHire policy envelope in the server-safe registry", () => {
    expect(BITHIRE_TEST_ENVELOPE).toEqual({
      schemaVersion: 1,
      verticalKey: "bithire",
      allowedModes: ["simple", "advanced"],
      advanced: {
        chromeFamilies: [
          "sidebar",
          "layout",
          "shell",
          "toolbar",
          "filterPill",
          "breadcrumb",
          "search",
          "controls",
          "table",
          "cardComponent",
          "metricCard",
          "signalCard",
          "workspaceCard",
          "compactCard",
          "tallCard",
          "collectionCard",
          "listingGrid",
          "modal",
          "tabs",
        ],
        allowTokenOverrides: true,
        allowAnatomyVariants: true,
      },
      ranges: {
        densityScale: { min: 0.85, max: 1.15 },
        effectIntensity: { min: 0, max: 0.65 },
        motionIntensity: { min: 0, max: 0.8 },
        motionDurationScale: { min: 0.75, max: 1.35 },
        typeScale: { min: 0.92, max: 1.08 },
        radiusScale: { min: 0.8, max: 1.2 },
      },
    } satisfies TenantThemeVerticalEnvelope);
    expect(Object.isFrozen(TENANT_THEME_VERTICAL_ENVELOPES)).toBe(true);
    expect(
      Object.isFrozen(BITHIRE_TEST_ENVELOPE.advanced?.chromeFamilies)
    ).toBe(true);
    expect(getTenantThemeVerticalEnvelope("unknown")).toBeUndefined();
  });

  it("owns a bounded Evnto envelope and rejects vertical identity widening", () => {
    expect(EVNTO_TEST_ENVELOPE).toMatchObject({
      schemaVersion: 1,
      verticalKey: "evnto",
      allowedModes: ["simple", "advanced"],
      advanced: {
        allowTokenOverrides: true,
        allowAnatomyVariants: true,
        chromeFamilies: BITHIRE_TEST_ENVELOPE.advanced!.chromeFamilies,
      },
      ranges: {
        densityScale: { min: 0.85, max: 1.15 },
        effectIntensity: { min: 0, max: 0.75 },
        motionIntensity: { min: 0, max: 0.8 },
        motionDurationScale: { min: 0.75, max: 1.35 },
        typeScale: { min: 0.92, max: 1.08 },
        radiusScale: { min: 0.8, max: 1.2 },
      },
    } satisfies Partial<TenantThemeVerticalEnvelope>);
    expect(EVNTO_TEST_ENVELOPE.advanced?.chromeFamilies).toEqual(
      BITHIRE_TEST_ENVELOPE.advanced?.chromeFamilies
    );
    expect(Object.isFrozen(EVNTO_TEST_ENVELOPE)).toBe(true);
    expect(Object.isFrozen(EVNTO_TEST_ENVELOPE.ranges)).toBe(true);

    const evntoIdentity: TenantThemeConfigIdentity = {
      ...IDENTITY,
      tenantId: "tenant_evnto",
      slug: "acme-events",
      verticalKey: "evnto",
    };
    const config = hydrateTenantThemeConfig(SIMPLE_DOCUMENT, evntoIdentity);
    const artifact = compileTenantThemeConfig(config, {
      verticalEnvelope: EVNTO_TEST_ENVELOPE,
    });

    expect(artifact.verticalKey).toBe("evnto");
    expect(artifact.scopes.combinedSelector).toContain(
      '[data-vertical="evnto"]'
    );
    expect(artifact.verticalEnvelopeDigest).toMatch(/^sha256-[a-f0-9]{64}$/);
    expect(() =>
      compileTenantThemeConfig(config, {
        verticalEnvelope: BITHIRE_TEST_ENVELOPE,
      })
    ).toThrow(TenantThemeValidationError);
  });

  it("keeps row identity out of the persisted document and hydrates from trusted columns", () => {
    expect(validateTenantThemeDocument(SIMPLE_DOCUMENT).success).toBe(true);
    expect(
      validateTenantThemeDocument({
        ...SIMPLE_DOCUMENT,
        tenantId: IDENTITY.tenantId,
      })
    ).toMatchObject({
      success: false,
      issues: [{ code: "unknown_key", path: "$.tenantId" }],
    });
    expect(hydrate()).toMatchObject({ ...IDENTITY, mode: "simple" });
  });

  it("rejects presentation switches instead of turning tenant data into a CSS router", () => {
    const result = validateTenantThemeDocument({
      schemaVersion: 1,
      mode: "simple",
      appearance: { presentationProfile: "tenant-authored-css" },
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues).toContainEqual(
        expect.objectContaining({
          code: "unknown_key",
          path: "$.appearance.presentationProfile",
        })
      );
    }
  });

  it("fails closed when trusted row identity disagrees with request/directory identity", () => {
    expect(() =>
      hydrateTenantThemeConfig(SIMPLE_DOCUMENT, IDENTITY, {
        expectedIdentity: { tenantId: "another-tenant", slug: IDENTITY.slug },
      })
    ).toThrow(TenantThemeValidationError);
  });

  it("does not touch browser globals while validating and compiling for SSR", () => {
    vi.stubGlobal("window", undefined);
    vi.stubGlobal("document", undefined);
    vi.stubGlobal("localStorage", undefined);
    expect(() => compileTenantThemeConfig(hydrate())).not.toThrow();
    vi.unstubAllGlobals();
  });
});

describe("deterministic artifact compilation and isolation", () => {
  it("normalizes key order and emits byte-identical artifacts", () => {
    const ordered = hydrate();
    const reversed = {
      rowVersion: IDENTITY.rowVersion,
      verticalKey: IDENTITY.verticalKey,
      slug: IDENTITY.slug,
      tenantId: IDENTITY.tenantId,
      appearance: {
        navigation: { sidebarTone: "subtle" },
        surfaces: { elevation: "elevated" },
        shape: { buttonStyle: "soft" },
        motion: { ambient: "subtle", durationScale: 1.15, intensity: 0.62 },
        density: "normal",
        typography: {
          fontFamilyHeading: "'Fraunces', Georgia, 'Times New Roman', serif",
          fontFamilyBase: "Optima, Candara, 'Noto Sans', sans-serif",
        },
        palette: {
          accent: "#E2725B",
          secondary: "#8C6D46",
          primary: "#0F766E",
        },
      },
      mode: "simple",
      schemaVersion: 1,
    };
    const left = compileTenantThemeConfig(ordered);
    const right = compileTenantThemeConfig(reversed);
    expect(canonicalizeTenantThemeValue(ordered)).toBe(
      canonicalizeTenantThemeValue(reversed)
    );
    expect(right).toEqual(left);
  });

  it("includes row/compiler identity in the cache digest", () => {
    const current = compileTenantThemeConfig(hydrate());
    const next = compileTenantThemeConfig(
      hydrate(SIMPLE_DOCUMENT, { ...IDENTITY, rowVersion: 8 })
    );
    expect(current.compilerVersion).toBe(TENANT_THEME_COMPILER_VERSION);
    expect(current.digest).not.toBe(next.digest);
    expect(current.variables).toEqual(next.variables);
  });

  it("keeps compiler-owned bounded presets valid even when their emitted value exceeds authored caps", () => {
    const artifact = compileTenantThemeConfig(
      hydrate({
        schemaVersion: 1,
        mode: "simple",
        appearance: { shape: { buttonStyle: "pill" } },
      })
    );
    expect(artifact.variables["--ds-radius-button"]).toBe("9999px");
  });

  it("accepts only code-owned font-pack references inside font-family lists", () => {
    const document = structuredClone(ADVANCED_DOCUMENT);
    if (document.mode !== "advanced")
      throw new Error("Expected Advanced fixture");
    document.visualFoundation.general = {
      ...document.visualFoundation.general,
      typography: {
        ...document.visualFoundation.general?.typography,
        fontFamilyHeading:
          "var(--ds-font-pack-editorial-display), Georgia, 'Times New Roman', serif",
      },
    };
    document.visualFoundation.advanced = {
      ...document.visualFoundation.advanced,
      tokenOverrides: {
        ...document.visualFoundation.advanced?.tokenOverrides,
        "--ds-font-family-display":
          "var(--ds-font-pack-editorial-display), Georgia, 'Times New Roman', serif",
      },
    };

    const artifact = compileTenantThemeConfig(hydrate(document), {
      verticalEnvelope: BITHIRE_TEST_ENVELOPE,
    });
    expect(artifact.variables["--ds-font-family-heading"]).toContain(
      "var(--ds-font-pack-editorial-display)"
    );
    expect(artifact.variables["--ds-font-family-display"]).toContain(
      "var(--ds-font-pack-editorial-display)"
    );
  });

  it.each([
    "var(--ds-font-family-heading), serif",
    "var(--ds-font-pack-editorial-display, Georgia), serif",
    "var(--ds-font-pack-Editorial-Display), serif",
    "var(--ds-font-pack-unknown), serif",
    // The bare pre-W4 id never resolved to any css and is retired, not aliased.
    "var(--ds-font-pack-editorial), serif",
    "var(--ds-font-pack-editorial-display); color: red",
  ])(
    "rejects unsafe font-family variable reference %s",
    (fontFamilyHeading) => {
      expect(
        validateTenantThemeDocument({
          schemaVersion: 1,
          mode: "simple",
          appearance: { typography: { fontFamilyHeading } },
        }).success
      ).toBe(false);
    }
  );

  it("emits separate root/vertical/tenant scopes and one exact combined selector", () => {
    const artifact = compileTenantThemeConfig(hydrate());
    expect(artifact.scopes).toEqual({
      root: { attribute: "data-ds-root", selector: ":where([data-ds-root])" },
      vertical: {
        attribute: "data-vertical",
        value: "bithire",
        selector: ':where([data-ds-root][data-vertical="bithire"])',
      },
      tenant: {
        attribute: "data-tenant",
        value: "themanagementmiami",
        selector: ':where([data-ds-root][data-tenant="themanagementmiami"])',
      },
      combinedSelector:
        '[data-ds-root][data-vertical="bithire"][data-tenant][data-tenant="themanagementmiami"]',
    });
    expect(artifact.css).toContain(`${artifact.scopes.combinedSelector} {`);
    expect(artifact.css).not.toContain("@layer");
    expect(artifact.css).not.toContain("html[data-tenant");
    expect(tenantThemeArtifactRootAttributes(artifact)).toEqual({
      "data-ds-root": "",
      "data-vertical": "bithire",
      "data-tenant": "themanagementmiami",
    });
  });

  it("keeps two tenants on distinct provider roots with no selector/value bleed", () => {
    const management = compileTenantThemeConfig(hydrate());
    const bithire = compileTenantThemeConfig(
      hydrate(
        {
          schemaVersion: 1,
          mode: "simple",
          appearance: {
            palette: { primary: "#2563EB" },
            typography: { fontFamilyBase: "Inter, sans-serif" },
          },
        },
        { ...IDENTITY, tenantId: "tenant_02", slug: "bithire" }
      )
    );

    expect(management.variables["--ds-color-primary"]).toBe("#0F766E");
    expect(bithire.variables["--ds-color-primary"]).toBe("#2563EB");
    expect(management.css).not.toContain('data-tenant="bithire"');
    expect(bithire.css).not.toContain('data-tenant="themanagementmiami"');
    expect(management.scopes.combinedSelector).not.toBe(
      bithire.scopes.combinedSelector
    );
  });

  it("keeps the exact tenant overlay above the generated static artifact and local to sibling/nested roots", () => {
    const management = compileTenantThemeConfig(hydrate(ADVANCED_DOCUMENT), {
      verticalEnvelope: BITHIRE_TEST_ENVELOPE,
    });
    const bithire = compileTenantThemeConfig(
      hydrate(
        {
          schemaVersion: 1,
          mode: "simple",
          appearance: { palette: { primary: "#2563EB" } },
        },
        { ...IDENTITY, tenantId: "tenant_02", slug: "bithire" }
      )
    );
    const managementRoot = document.createElement("section");
    const nestedBithireRoot = document.createElement("section");
    const siblingBithireRoot = document.createElement("section");
    const style = document.createElement("style");

    for (const [root, slug] of [
      [managementRoot, "themanagementmiami"],
      [nestedBithireRoot, "bithire"],
      [siblingBithireRoot, "bithire"],
    ] as const) {
      root.setAttribute("data-ds-root", "");
      root.setAttribute("data-vertical", "bithire");
      root.setAttribute("data-tenant", slug);
    }
    managementRoot.append(nestedBithireRoot);
    document.body.append(managementRoot, siblingBithireRoot);

    // Deliberately put the complete generated static artifact last. This covers
    // its highest-specificity light/dark root-state variants, not a toy selector.
    style.textContent = [
      management.css,
      bithire.css,
      BITHIRE_STATIC_ARTIFACT,
    ].join("\n");
    document.head.append(style);

    try {
      expect(
        getComputedStyle(managementRoot)
          .getPropertyValue("--ds-color-primary")
          .trim()
      ).toBe("#0F766E");
      expect(
        getComputedStyle(managementRoot)
          .getPropertyValue("--ds-color-bg-primary")
          .trim()
      ).toBe("#FBF6EC");
      expect(
        getComputedStyle(nestedBithireRoot)
          .getPropertyValue("--ds-color-primary")
          .trim()
      ).toBe("#2563EB");
      expect(
        getComputedStyle(siblingBithireRoot)
          .getPropertyValue("--ds-color-primary")
          .trim()
      ).toBe("#2563EB");
    } finally {
      style.remove();
      managementRoot.remove();
      siblingBithireRoot.remove();
    }
  });

  it("compiles a legal Management Advanced projection with strong visual divergence", () => {
    const management = compileTenantThemeConfig(hydrate(ADVANCED_DOCUMENT), {
      verticalEnvelope: BITHIRE_TEST_ENVELOPE,
    });
    const baseline = compileTenantThemeConfig(
      hydrate(
        {
          schemaVersion: 1,
          mode: "simple",
          appearance: {
            palette: { primary: "#2563EB" },
            surfaces: { elevation: "flat" },
          },
        },
        { ...IDENTITY, tenantId: "tenant_02", slug: "bithire" }
      )
    );
    const changed = Object.keys(management.variables).filter(
      (key) => management.variables[key] !== baseline.variables[key]
    );

    expect(changed.length).toBeGreaterThan(20);
    expect(management.variables).toMatchObject({
      "--ds-color-bg-primary": "#FBF6EC",
      "--ds-font-family-display":
        "'Fraunces', Georgia, 'Times New Roman', serif",
      "--ds-card-bg": "#FFFEFB",
      "--ds-table-header-bg": "#FFFFFF",
      "--ds-table-header-letter-spacing": "0.04em",
      "--ds-table-header-text-transform": "none",
      "--ds-table-header-block-size": "42px",
      "--ds-shell-sidebar-width": "284px",
      "--ds-shell-sidebar-collapsed-width": "72px",
      "--ds-shell-sidebar-header-block-size": "68px",
      "--ds-shell-header-block-size": "64px",
      "--ds-command-home-max-width": "1180px",
      "--ds-command-home-console-padding": "20px",
      "--ds-card-hover-transform": "translateY(-1px)",
      "--ds-metric-card-min-height": "156px",
      "--ds-metric-card-hover-transform": "translateY(-1px)",
      "--ds-metric-card-icon-bg": "#F3EEE5",
      "--ds-signal-card-top-line-display": "none",
      "--ds-listing-grid-columns": "repeat(3, minmax(0, 1fr))",
      "--ds-effect-intensity": "0.45",
    });
    expect(management.verticalEnvelopeDigest).toMatch(/^sha256-/);
  });
});

describe("closed schema and hostile input rejection", () => {
  it.each([
    [
      "unknown schema",
      { ...SIMPLE_DOCUMENT, schemaVersion: 2 },
      "unsupported_schema_version",
    ],
    ["engine", { ...SIMPLE_DOCUMENT, engine: "custom" }, "unknown_key"],
    [
      "raw css",
      { ...SIMPLE_DOCUMENT, rawCss: ":root{--pwned:red}" },
      "unknown_key",
    ],
    ["selector", { ...SIMPLE_DOCUMENT, selector: "html *" }, "unknown_key"],
    [
      "topology",
      { ...SIMPLE_DOCUMENT, topology: { phone: "desktop-table" } },
      "unknown_key",
    ],
  ])("rejects %s at the document boundary", (_name, input, code) => {
    const result = validateTenantThemeDocument(input);
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.issues.some((issue) => issue.code === code)).toBe(true);
  });

  it("rejects selector injection in tenant/vertical identities", () => {
    const hostile = { ...hydrate(), slug: 'acme"]{color:red}/*' };
    expect(validateTenantThemeConfig(hostile).success).toBe(false);
    expect(() => compileTenantThemeConfig(hostile)).toThrow(
      TenantThemeValidationError
    );
  });

  it("rejects private token references and declaration breakouts", () => {
    for (const value of [
      "var(--ds-private-secret)",
      "red; } html { color: hotpink",
      "url(https://evil.invalid/x)",
    ]) {
      const document = {
        schemaVersion: 1,
        mode: "advanced" as const,
        visualFoundation: { advanced: { chrome: { sidebar: { bg: value } } } },
      };
      const input = { ...document, ...IDENTITY };
      expect(validateTenantThemeConfig(input).success).toBe(false);
    }
  });

  it("rejects arbitrary token names and fields without compiler-owned variables", () => {
    const invalidAdvancedValues = [
      { tokenOverrides: { "--ds-private-secret": "#fff" } },
      { chrome: { sidebar: { navigationMode: "floating" } } },
      { chrome: { shell: { gridOpacity: 0.5 } } },
      { chrome: { metricCard: { renderer: "custom" } } },
      { chrome: { card: { showBorder: false } } },
      { chrome: { accent: { iconContainerShape: "square" } } },
    ];

    for (const advanced of invalidAdvancedValues) {
      const result = validateTenantThemeDocument({
        schemaVersion: 1,
        mode: "advanced",
        visualFoundation: { advanced },
      });
      expect(result.success, JSON.stringify(advanced)).toBe(false);
    }
  });

  it("keeps ramp tokens reference-only while deriving all seven roles from legal base seeds", () => {
    const authoredRamp = validateTenantThemeDocument({
      schemaVersion: 1,
      mode: "advanced",
      visualFoundation: {
        advanced: { tokenOverrides: { "--ds-color-primary-500": "#FF00FF" } },
      },
    });
    expect(authoredRamp.success).toBe(false);

    const artifact = compileTenantThemeConfig(hydrate(ADVANCED_DOCUMENT), {
      verticalEnvelope: BITHIRE_TEST_ENVELOPE,
    });
    for (const role of [
      "primary",
      "secondary",
      "accent",
      "success",
      "warning",
      "error",
      "info",
    ] as const) {
      for (const step of [
        50, 100, 200, 300, 400, 500, 600, 700, 800, 900,
      ] as const) {
        expect(artifact.variables[`--ds-color-${role}-${step}`]).toMatch(
          /^#[0-9A-F]{6}$/
        );
      }
    }
  });

  it.each(["rgb(15 118 110)", "hsl(176 77% 26%)", "oklch(0.52 0.09 190)"])(
    "preserves valid v1 functional color seed %s and derives a safe ramp",
    (primary) => {
      const document = {
        schemaVersion: 1,
        mode: "simple" as const,
        appearance: { palette: { primary } },
      };
      expect(validateTenantThemeDocument(document).success).toBe(true);
      const artifact = compileTenantThemeConfig(hydrate(document));
      expect(artifact.variables["--ds-color-primary"]).toBe(primary);
      expect(artifact.variables["--ds-color-primary-50"]).toContain(
        "color-mix(in oklch"
      );
    }
  );

  it("admits an accessible unique color-only chart palette without opening renderer or data semantics", () => {
    const palette = [
      "#0F766E",
      "#8C6D46",
      "#B24D3A",
      "#296F68",
      "#735838",
      "#963F31",
      "#3D756F",
      "#7D6140",
      "#A04435",
      "#5E5A52",
    ];
    const categories = Object.fromEntries(
      palette.map((color, index) => [`--ds-chart-category-${index + 1}`, color])
    );
    const document = {
      schemaVersion: 1,
      mode: "advanced" as const,
      visualFoundation: { advanced: { tokenOverrides: categories } },
    };
    expect(validateTenantThemeDocument(document).success).toBe(true);
    const artifact = compileTenantThemeConfig(hydrate(document), {
      verticalEnvelope: BITHIRE_TEST_ENVELOPE,
    });
    expect(artifact.variables["--ds-chart-category-1"]).toBe("#0F766E");
    expect(artifact.variables["--ds-chart-category-10"]).toBe("#5E5A52");

    expect(
      validateTenantThemeDocument({
        ...document,
        visualFoundation: {
          advanced: {
            tokenOverrides: {
              "--ds-chart-category-1": "linear-gradient(#000, #fff)",
            },
          },
        },
      }).success
    ).toBe(false);
    expect(
      validateTenantThemeDocument({
        ...document,
        visualFoundation: {
          advanced: {
            tokenOverrides: { "--ds-chart-category-1": "rgb(15 118 110)" },
          },
        },
      }).success
    ).toBe(false);
  });

  it("rejects duplicate or low-contrast tenant chart categories at compilation", () => {
    const compileCategories = (
      categories: Record<string, string>,
      backgroundMode: "light" | "dark" | "auto" = "light"
    ) =>
      compileTenantThemeConfig(
        hydrate({
          schemaVersion: 1,
          mode: "advanced",
          visualFoundation: {
            general: { palette: { backgroundMode } },
            advanced: { tokenOverrides: categories },
          },
        }),
        { verticalEnvelope: BITHIRE_TEST_ENVELOPE }
      );

    expect(() =>
      compileCategories({
        "--ds-chart-category-1": "#0F766E",
        "--ds-chart-category-2": "#0f766e",
      })
    ).toThrow(/must be unique/i);
    expect(() =>
      compileCategories({ "--ds-chart-category-1": "#FDFDFD" })
    ).toThrow(/below 3:1/i);
    expect(() =>
      compileCategories({ "--ds-chart-category-1": "#111111" }, "dark")
    ).toThrow(/below 3:1/i);
    expect(() =>
      compileCategories({ "--ds-chart-category-1": "#767676" }, "auto")
    ).not.toThrow();
  });

  it("enforces value, field and payload caps", () => {
    const hostileValues = [
      { cardComponent: { padding: "-1rem" } },
      { cardComponent: { radius: "9999px" } },
      { cardComponent: { shadow: "0 0 9999px rgba(0,0,0,.4)" } },
      {
        cardComponent: {
          shadow: "0 1px #000, 0 2px #000, 0 3px #000, 0 4px #000, 0 5px #000",
        },
      },
      {
        cardComponent: {
          bg: "linear-gradient(#111,#222,#333,#444,#555,#666,#777,#888,#999)",
        },
      },
    ];
    for (const chrome of hostileValues) {
      const result = validateTenantThemeDocument({
        schemaVersion: 1,
        mode: "advanced",
        visualFoundation: { advanced: { chrome } },
      });
      expect(result.success, JSON.stringify(chrome)).toBe(false);
    }

    const overlong = validateTenantThemeDocument({
      schemaVersion: 1,
      mode: "simple",
      appearance: { typography: { fontFamilyBase: "A".repeat(70_000) } },
    });
    expect(overlong.success).toBe(false);
    if (!overlong.success)
      expect(
        overlong.issues.some((issue) => issue.message.includes("65"))
      ).toBe(true);
  });

  it("requires an explicit, matching vertical envelope for Advanced compilation", () => {
    const config = hydrate(ADVANCED_DOCUMENT);
    expect(() => compileTenantThemeConfig(config)).toThrow(
      /requires a vertical policy envelope/i
    );
    expect(() =>
      compileTenantThemeConfig(config, {
        verticalEnvelope: { ...BITHIRE_TEST_ENVELOPE, verticalKey: "platform" },
      })
    ).toThrow(/does not match/i);
    expect(() =>
      compileTenantThemeConfig(config, {
        verticalEnvelope: {
          ...BITHIRE_TEST_ENVELOPE,
          advanced: { chromeFamilies: ["sidebar"], allowTokenOverrides: true },
        },
      })
    ).toThrow(/disabled by this vertical/i);
    expect(() =>
      compileTenantThemeConfig(config, {
        verticalEnvelope: {
          ...BITHIRE_TEST_ENVELOPE,
          allowedModes: ["advanced", "advanced"],
        },
      })
    ).toThrow(/unique non-empty/i);
  });

  it("admits the bounded neutral text/border override group as opaque hex only", () => {
    const neutralOverrides = {
      "--ds-color-text-primary": "#E8E6E1",
      "--ds-color-text-secondary": "#A39F98",
      "--ds-color-text-muted": "#6E6A63",
      "--ds-color-border-primary": "#26231F",
      "--ds-color-border-secondary": "#33302B",
    };
    const document = {
      schemaVersion: 1,
      mode: "advanced" as const,
      visualFoundation: {
        // The light neutral text set is honest only on this tenant's own dark
        // canvas; the APCA autocorrect pass otherwise rewrites it against the
        // default light page ground.
        general: { palette: { backgroundMode: "dark" as const } },
        advanced: { tokenOverrides: neutralOverrides },
      },
    };
    expect(validateTenantThemeDocument(document).success).toBe(true);
    const artifact = compileTenantThemeConfig(hydrate(document), {
      verticalEnvelope: BITHIRE_TEST_ENVELOPE,
    });
    expect(artifact.adjustments).toBeUndefined();
    for (const [token, value] of Object.entries(neutralOverrides)) {
      expect(artifact.variables[token]).toBe(value);
      expect(artifact.css).toContain(`${token}: ${value};`);
    }
  });

  it.each([
    ["url() exfiltration", "url(https://evil.invalid/x)"],
    ["var() reference", "var(--ds-color-neutral-800)"],
    ["functional color", "rgb(232 230 225)"],
    ["named color", "white"],
    ["hex with alpha channel", "#E8E6E1CC"],
    ["gradient", "linear-gradient(#000, #fff)"],
    ["declaration breakout", "#fff; } html { color: hotpink"],
  ])("rejects %s in the neutral override group", (_name, value) => {
    for (const token of [
      "--ds-color-text-primary",
      "--ds-color-text-secondary",
      "--ds-color-text-muted",
      "--ds-color-border-primary",
      "--ds-color-border-secondary",
    ]) {
      const result = validateTenantThemeDocument({
        schemaVersion: 1,
        mode: "advanced",
        visualFoundation: { advanced: { tokenOverrides: { [token]: value } } },
      });
      expect(result.success, `${token} <- ${value}`).toBe(false);
    }
  });

  it("keeps neutral overrides behind the vertical allowTokenOverrides policy", () => {
    const config = hydrate({
      schemaVersion: 1,
      mode: "advanced",
      visualFoundation: {
        advanced: {
          tokenOverrides: { "--ds-color-text-primary": "#E8E6E1" },
        },
      },
    });
    expect(() =>
      compileTenantThemeConfig(config, {
        verticalEnvelope: {
          ...BITHIRE_TEST_ENVELOPE,
          advanced: {
            chromeFamilies:
              BITHIRE_TEST_ENVELOPE.advanced?.chromeFamilies ?? [],
            allowTokenOverrides: false,
          },
        },
      })
    ).toThrow(/Token overrides are disabled/i);
  });

  it("parses into a detached canonical value rather than retaining tainted references", () => {
    const source = structuredClone(SIMPLE_DOCUMENT);
    const parsed = parseTenantThemeDocument(source);
    (source.appearance as { palette?: { primary?: string } }).palette!.primary =
      "#FFFFFF";
    expect(parsed.mode).toBe("simple");
    if (parsed.mode === "simple")
      expect(parsed.appearance.palette?.primary).toBe("#0F766E");
  });
});
