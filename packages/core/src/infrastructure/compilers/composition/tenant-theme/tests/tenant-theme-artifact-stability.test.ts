/**
 * Byte-identity contract for compiled artifacts. The fixtures were compiled
 * before the code-unit sort comparator, the bounded neutral override group and
 * the schema-owned tokenOverrides cap landed; documents that use none of the
 * new surface must keep producing the exact same artifact, digest and CSS.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import type { TenantThemeArtifactV1 } from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import { compileTenantThemeConfig, hydrateTenantThemeConfig } from "..";

const FIXTURE_DIR = resolve(
  process.cwd(),
  "src/infrastructure/compilers/composition/tenant-theme/tests/fixtures"
);

const readFixture = (name: string): TenantThemeArtifactV1 =>
  JSON.parse(readFileSync(resolve(FIXTURE_DIR, name), "utf8"));

const IDENTITY = {
  tenantId: "tenant_fixture",
  slug: "fixture-tenant",
  verticalKey: "bithire",
  rowVersion: 1,
} as const;

const NULL_OVERRIDE_DOCUMENT = {
  schemaVersion: 1,
  mode: "simple",
  appearance: {},
} as const;

const POPULATED_SIMPLE_DOCUMENT = {
  schemaVersion: 1,
  mode: "simple",
  appearance: {
    palette: {
      primary: "#0F766E",
      secondary: "#8C6D46",
      accent: "#E2725B",
      backgroundMode: "light",
    },
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
} as const;

describe("tenant theme artifact byte-identity against pre-change fixtures", () => {
  it("compiles the null-override document to the exact pre-change artifact", () => {
    const artifact = compileTenantThemeConfig(
      hydrateTenantThemeConfig(NULL_OVERRIDE_DOCUMENT, { ...IDENTITY })
    );
    const fixture = readFixture("null-override-artifact.fixture.json");
    expect(JSON.stringify(artifact)).toBe(JSON.stringify(fixture));
    expect(artifact.css).toBe(fixture.css);
    expect(artifact.digest).toBe(fixture.digest);
  });

  it("compiles the populated simple document to the exact pre-change artifact", () => {
    const artifact = compileTenantThemeConfig(
      hydrateTenantThemeConfig(POPULATED_SIMPLE_DOCUMENT, { ...IDENTITY })
    );
    const fixture = readFixture("populated-simple-artifact.fixture.json");
    expect(JSON.stringify(artifact)).toBe(JSON.stringify(fixture));
    expect(artifact.css).toBe(fixture.css);
    expect(artifact.digest).toBe(fixture.digest);
  });

  it("emits variables in deterministic UTF-16 code-unit order", () => {
    const artifact = compileTenantThemeConfig(
      hydrateTenantThemeConfig(POPULATED_SIMPLE_DOCUMENT, { ...IDENTITY })
    );
    const keys = Object.keys(artifact.variables);
    const codeUnitSorted = [...keys].sort((left, right) =>
      left < right ? -1 : left > right ? 1 : 0
    );
    expect(keys).toEqual(codeUnitSorted);
    expect(keys.length).toBeGreaterThan(20);
  });
});
