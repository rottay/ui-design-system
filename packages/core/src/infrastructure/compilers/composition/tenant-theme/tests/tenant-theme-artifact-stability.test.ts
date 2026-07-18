/**
 * Byte-identity contract for compiled artifacts. The fixtures were compiled
 * before the W4 white-label surface (anatomy variants, typePairing, type/radius
 * scale dials, dark seeds, generated chart series, contrast autocorrect).
 *
 * Documents that use none of the new surface must keep their EMISSION stable:
 * normalizedAppearance, scopes and every pre-W4 variable stay byte-identical.
 * Two divergences are sanctioned and pinned exactly:
 * - digest/verticalEnvelopeDigest move once because both registered envelopes
 *   deliberately gained `allowAnatomyVariants` + typeScale/radiusScale ranges;
 * - a document with a concrete primary seed additionally emits the ten
 *   compiler-owned `--ds-chart-series-*` variables and nothing else.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import type { TenantThemeArtifact } from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import {
  compileTenantThemeConfig,
  getTenantThemeVerticalEnvelope,
  hydrateTenantThemeConfig,
} from "..";

const FIXTURE_DIR = resolve(
  process.cwd(),
  "src/infrastructure/compilers/composition/tenant-theme/tests/fixtures"
);

const readFixture = (name: string): TenantThemeArtifact =>
  JSON.parse(readFileSync(resolve(FIXTURE_DIR, name), "utf8"));

const CHART_SERIES_TOKEN = /^--ds-chart-series-(?:[1-9]|10)$/;

/** The artifact css minus its digest banner line. */
const cssBody = (artifact: Pick<TenantThemeArtifact, "css">): string =>
  artifact.css.split("\n").slice(1).join("\n");

function expectStableEmission(
  artifact: TenantThemeArtifact,
  fixture: TenantThemeArtifact
): string[] {
  expect(JSON.stringify(artifact.normalizedAppearance)).toBe(
    JSON.stringify(fixture.normalizedAppearance)
  );
  expect(JSON.stringify(artifact.scopes)).toBe(JSON.stringify(fixture.scopes));
  expect(artifact.adjustments).toBeUndefined();
  for (const [token, value] of Object.entries(fixture.variables)) {
    expect(artifact.variables[token], token).toBe(value);
  }
  const additions = Object.keys(artifact.variables).filter(
    (token) => fixture.variables[token] === undefined
  );
  // The envelope opt-in flip is the wave's one sanctioned digest move.
  expect(artifact.verticalEnvelopeDigest).not.toBe(
    fixture.verticalEnvelopeDigest
  );
  expect(artifact.digest).not.toBe(fixture.digest);
  expect(artifact.compilerVersion).toBe(fixture.compilerVersion);
  return additions;
}

const IDENTITY = {
  tenantId: "tenant_fixture",
  slug: "fixture-tenant",
  verticalKey: "bithire",
  rowVersion: 1,
} as const;

const W4_PIN_IDENTITY = {
  tenantId: "tenant_w4_pin",
  slug: "w4-pin-tenant",
  verticalKey: "bithire",
  rowVersion: 3,
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

const ABSENT_NEW_FIELDS_DOCUMENT = {
  schemaVersion: 1,
  mode: "advanced",
  visualFoundation: {
    general: {
      typography: {
        fontFamilyBase: "Optima, Candara, 'Noto Sans', sans-serif",
        fontFamilyHeading: "'Fraunces', Georgia, serif",
      },
      shape: { buttonStyle: "pill" },
      density: "compact",
      motion: { intensity: 0.4, durationScale: 0.9, ambient: "off" },
      surfaces: { elevation: "flat" },
      navigation: { sidebarTone: "inverse" },
    },
    advanced: {
      chrome: {
        sidebar: { bg: "#101014", text: "#F4F4F5", width: "248px" },
        layout: { headerBg: "#FFFFFF", headerHeight: "56px" },
        table: { headerBg: "#F8F8FA", cellPadding: "10px 12px" },
        cardComponent: { bg: "#FFFFFF", radius: "10px" },
      },
      tokenOverrides: {
        "--ds-radius-md": "10px",
        "--ds-density-scale": 0.9,
      },
    },
  },
} as const;

describe("tenant theme artifact byte-identity against pre-W4 fixtures", () => {
  it("keeps the null-override document's emission byte-identical", () => {
    const artifact = compileTenantThemeConfig(
      hydrateTenantThemeConfig(NULL_OVERRIDE_DOCUMENT, { ...IDENTITY })
    );
    const fixture = readFixture("null-override-artifact.fixture.json");
    const additions = expectStableEmission(artifact, fixture);
    expect(additions).toEqual([]);
    expect(cssBody(artifact)).toBe(cssBody(fixture));
  });

  it("keeps the populated simple document stable modulo the generated chart series", () => {
    const artifact = compileTenantThemeConfig(
      hydrateTenantThemeConfig(POPULATED_SIMPLE_DOCUMENT, { ...IDENTITY })
    );
    const fixture = readFixture("populated-simple-artifact.fixture.json");
    const additions = expectStableEmission(artifact, fixture);
    expect(additions.every((token) => CHART_SERIES_TOKEN.test(token))).toBe(
      true
    );
    expect(additions).toHaveLength(10);
  });

  it("keeps an advanced document ABSENT of every W4 field byte-identical", () => {
    const artifact = compileTenantThemeConfig(
      hydrateTenantThemeConfig(ABSENT_NEW_FIELDS_DOCUMENT, {
        ...W4_PIN_IDENTITY,
      }),
      { verticalEnvelope: getTenantThemeVerticalEnvelope("bithire") }
    );
    const fixture = readFixture("w4-absent-new-fields-artifact.fixture.json");
    const additions = expectStableEmission(artifact, fixture);
    expect(additions).toEqual([]);
    expect(JSON.stringify(artifact.variables)).toBe(
      JSON.stringify(fixture.variables)
    );
    expect(cssBody(artifact)).toBe(cssBody(fixture));
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
