import { describe, expect, it } from "vitest";
import {
  DIVERGENCE_EDITORIAL_DOCUMENT,
  DIVERGENCE_EDITORIAL_EXPECTED_ANATOMY,
  DIVERGENCE_EDITORIAL_IDENTITY,
} from "@/tooling/testing/fixtures/brand-themes/divergence-editorial";
import {
  DIVERGENCE_SOBER_DOCUMENT,
  DIVERGENCE_SOBER_EXPECTED_ANATOMY,
  DIVERGENCE_SOBER_IDENTITY,
} from "@/tooling/testing/fixtures/brand-themes/divergence-sober";
import {
  compileTenantThemeConfig,
  getTenantThemeVerticalEnvelope,
  tenantThemeAnatomyAttributes,
  tenantThemeArtifactRootAttributes,
  validateTenantThemeDocument,
} from "..";

// ---------------------------------------------------------------------------
// W4 divergence-demo fixtures (design w4-whitelabel section 9).
//
// These two documents are the wave-exit certification inputs: the divergence
// Playwright spec (packages/showroom/e2e/whitelabel/divergence.spec.ts)
// renders the SAME bithire vertical under both compiled artifacts and asserts
// the results diverge like different products. This test pins the compile-side
// half of that contract: both documents are valid under the bithire envelope,
// both compile deterministically with ZERO contrast adjustments, and the
// channels the browser assertions read (fonts, radius, dials, chart series,
// anatomy attributes) genuinely differ between the two artifacts.
// ---------------------------------------------------------------------------

const BITHIRE_ENVELOPE = getTenantThemeVerticalEnvelope("bithire");

function compileSober() {
  return compileTenantThemeConfig(
    { ...DIVERGENCE_SOBER_DOCUMENT, ...DIVERGENCE_SOBER_IDENTITY },
    { verticalEnvelope: BITHIRE_ENVELOPE }
  );
}

function compileEditorial() {
  return compileTenantThemeConfig(
    { ...DIVERGENCE_EDITORIAL_DOCUMENT, ...DIVERGENCE_EDITORIAL_IDENTITY },
    { verticalEnvelope: BITHIRE_ENVELOPE }
  );
}

describe("divergence fixtures (W4 section 9)", () => {
  it("bithire envelope is registered", () => {
    expect(BITHIRE_ENVELOPE).toBeDefined();
    expect(BITHIRE_ENVELOPE?.advanced?.allowAnatomyVariants).toBe(true);
  });

  it("both documents validate as v1 documents", () => {
    expect(validateTenantThemeDocument(DIVERGENCE_SOBER_DOCUMENT).success).toBe(
      true
    );
    expect(
      validateTenantThemeDocument(DIVERGENCE_EDITORIAL_DOCUMENT).success
    ).toBe(true);
  });

  it("both compile with zero contrast adjustments (well-formed tenants)", () => {
    const sober = compileSober();
    const editorial = compileEditorial();
    expect(sober.adjustments ?? []).toEqual([]);
    expect(editorial.adjustments ?? []).toEqual([]);
  });

  it("compilation is deterministic and the identities are distinct", () => {
    const sober = compileSober();
    expect(compileSober().digest).toBe(sober.digest);
    const editorial = compileEditorial();
    expect(compileEditorial().digest).toBe(editorial.digest);
    expect(sober.digest).not.toBe(editorial.digest);
  });

  it("projects the expected anatomy attributes per fixture", () => {
    expect(tenantThemeAnatomyAttributes(compileSober())).toEqual(
      DIVERGENCE_SOBER_EXPECTED_ANATOMY
    );
    expect(tenantThemeAnatomyAttributes(compileEditorial())).toEqual(
      DIVERGENCE_EDITORIAL_EXPECTED_ANATOMY
    );
  });

  it("stamps distinct root scopes for the same vertical", () => {
    const sober = tenantThemeArtifactRootAttributes(compileSober());
    const editorial = tenantThemeArtifactRootAttributes(compileEditorial());
    expect(sober["data-vertical"]).toBe("bithire");
    expect(editorial["data-vertical"]).toBe("bithire");
    expect(sober["data-tenant"]).not.toBe(editorial["data-tenant"]);
  });

  it("the browser-asserted channels diverge between the two artifacts", () => {
    const sober = compileSober().variables;
    const editorial = compileEditorial().variables;

    for (const channel of [
      "--ds-font-family-heading",
      "--ds-radius-button",
      "--ds-type-scale",
      "--ds-density-scale",
      "--ds-color-primary",
      "--ds-chart-series-1",
    ]) {
      expect(sober[channel], `${channel} missing from sober`).toBeDefined();
      expect(
        editorial[channel],
        `${channel} missing from editorial`
      ).toBeDefined();
      expect(sober[channel], `${channel} does not diverge`).not.toBe(
        editorial[channel]
      );
    }

    // Both buttonStyle presets reach the artifact folded through the radius
    // dial; the divergence is in the operand, which is what the fixtures pin.
    expect(sober["--ds-radius-button"]).toBe(
      "calc(2px / 1.25 * var(--ds-radius-scale, 1))"
    );
    expect(editorial["--ds-radius-button"]).toBe(
      "calc(9999px / 1.25 * var(--ds-radius-scale, 1))"
    );
    expect(sober["--ds-type-scale"]).toBe("0.96");
    expect(editorial["--ds-type-scale"]).toBe("1.06");
    expect(sober["--ds-density-scale"]).toBe("0.92");
    expect(editorial["--ds-density-scale"]).toBe("1.08");
  });

  it("emits the full generated chart series for both fixtures", () => {
    for (const artifact of [compileSober(), compileEditorial()]) {
      for (let slot = 1; slot <= 10; slot += 1) {
        const value = artifact.variables[`--ds-chart-series-${slot}`];
        expect(
          value,
          `${artifact.slug} missing --ds-chart-series-${slot}`
        ).toMatch(/^#[0-9A-F]{6}$/);
      }
    }
  });

  it("editorial carries its typed dark intent while sober keeps the code-owned mode", () => {
    const sober = compileSober();
    const editorial = compileEditorial();
    const soberDark = sober.modeDeltas?.find((delta) => delta.mode === "dark");
    const editorialDark = editorial.modeDeltas?.find(
      (delta) => delta.mode === "dark"
    );

    expect(editorial.variables["--ds-color-primary"]).toBe("#A23B72");
    expect(editorialDark?.variables["--ds-color-primary"]).toBe("#D06A9F");
    expect(editorial.css).toContain("@media (prefers-color-scheme: dark)");
    expect(soberDark?.variables["--ds-color-primary"]).toBe("#1e84e6");
    expect(soberDark?.variables["--ds-color-primary"]).not.toBe(
      editorialDark?.variables["--ds-color-primary"]
    );
    expect(
      Object.values(sober.variables).some((value) =>
        value.includes("light-dark(")
      ),
      "sober must stay a deterministic single-value artifact"
    ).toBe(false);
  });
});
