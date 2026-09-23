import { describe, expect, it } from "vitest";

import { emitContrastRule, tenantArtifactScope } from "../../css";
import { emitTenantArtifactCss } from "..";
import type { TenantArtifactComposition } from "..";

const COMPOSITION: TenantArtifactComposition = {
  verticalKey: "evnto",
  slug: "contrast-unit",
  compilerVersion: "unit",
  digest: "sha256-unit",
  variables: { "--ds-color-on-success": "#171717" },
  modeDeltas: [{ mode: "dark", variables: { "--ds-color-bg-primary": "#101010" } }],
};

const SCOPE = tenantArtifactScope("evnto", "contrast-unit");

describe("emitTenantArtifactCss: the contrastDeltas block", () => {
  it("an absent or empty list changes no byte", () => {
    const without = emitTenantArtifactCss(COMPOSITION);
    expect(emitTenantArtifactCss({ ...COMPOSITION, contrastDeltas: [] })).toBe(without);
    expect(without).not.toContain("prefers-contrast");
  });

  it("emits the base delta on the base selector and a mode delta on that mode's selector, after the mode rules", () => {
    const css = emitTenantArtifactCss({
      ...COMPOSITION,
      contrastDeltas: [
        { variables: { "--ds-color-on-success": "#000000" } },
        { mode: "dark", variables: { "--ds-color-on-success": "#ffffff" } },
      ],
    });
    const media = css.indexOf("@media (prefers-contrast: more) {");
    expect(media).toBeGreaterThan(css.indexOf(`${SCOPE.modeSelector("dark")} {`));
    expect(css.slice(media)).toBe(
      "@media (prefers-contrast: more) {\n" +
        `${SCOPE.baseSelector} {\n  --ds-color-on-success: #000000;\n}\n` +
        `${SCOPE.modeSelector("dark")} {\n  --ds-color-on-success: #ffffff;\n}\n` +
        "}\n"
    );
  });

  it("under a system-following document, a mode delta also gets the system-mode copy", () => {
    const css = emitTenantArtifactCss({
      ...COMPOSITION,
      followsSystem: true,
      contrastDeltas: [{ mode: "dark", variables: { "--ds-color-on-success": "#ffffff" } }],
    });
    expect(css).toContain(
      "@media (prefers-contrast: more) and (prefers-color-scheme: dark) {\n" +
        `${SCOPE.baseSelector}:not([data-theme='light']) {\n  --ds-color-on-success: #ffffff;\n}\n}`
    );
    expect(css.lastIndexOf("prefers-color-scheme: dark) {")).toBeGreaterThan(
      css.indexOf("@media (prefers-color-scheme: dark) {")
    );
  });
});

describe("emitContrastRule", () => {
  it("emits no rule, not an empty one, when nothing is declared", () => {
    expect(emitContrastRule([], SCOPE)).toBe("");
    expect(emitContrastRule([{ cssVariables: {} }], SCOPE)).toBe("");
    expect(emitContrastRule([{ cssVariables: { "--ds-x": "red; } body {" } }], SCOPE)).toBe("");
  });
});
