import { describe, expect, it } from "vitest";
import { compileBrandTheme } from "../index";

describe("semantic typography roles", () => {
  it("emits complete defaults and accepts bounded first-party role overrides", () => {
    const compiled = compileBrandTheme({
      tenantSlug: "type-proof",
      brandTheme: {
        id: "type-proof",
        name: "Type proof",
        typography: {
          roles: {
            pageTitle: { fontSize: "1.75rem", fontWeight: 650 },
            numeric: { fontFamily: "var(--ds-font-family-mono)" },
          },
        },
      },
    });

    expect(compiled.cssVariables).toMatchObject({
      "--ds-type-display-font-family":
        "var(--ds-font-family-display, var(--ds-font-family-heading))",
      "--ds-type-page-title-font-size": "1.75rem",
      "--ds-type-page-title-font-weight": "650",
      "--ds-type-body-font-family": "var(--ds-font-family-base)",
      "--ds-type-code-font-family": "var(--ds-font-family-mono)",
      "--ds-type-numeric-font-family": "var(--ds-font-family-mono)",
      "--ds-type-numeric-font-variant-numeric": "tabular-nums lining-nums",
      "--ds-type-page-title":
        "var(--ds-type-page-title-font-weight) var(--ds-type-page-title-font-size)/var(--ds-type-page-title-line-height) var(--ds-type-page-title-font-family)",
    });
  });
});
