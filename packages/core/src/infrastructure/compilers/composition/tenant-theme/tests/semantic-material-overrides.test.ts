import { describe, expect, it } from "vitest";
import { TENANT_THEME_OVERRIDE_TOKENS } from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import { validateTenantThemeDocument } from "../index";

describe("tenant semantic surface-role channel", () => {
  it("publishes the complete surface hierarchy as a closed override set", () => {
    expect(TENANT_THEME_OVERRIDE_TOKENS).toEqual(
      expect.arrayContaining([
        "--ds-surface-canvas",
        "--ds-surface-shell",
        "--ds-surface-panel",
        "--ds-surface-card",
        "--ds-surface-inset",
        "--ds-surface-control",
        "--ds-surface-raised",
        "--ds-surface-overlay",
        "--ds-material-card-border",
        "--ds-material-card-border-strong",
        "--ds-material-card-background-hover",
        "--ds-material-card-background-active",
        "--ds-material-card-background-selected",
        "--ds-material-card-border-hover",
        "--ds-material-card-focus-ring",
        "--ds-material-card-shadow",
        "--ds-material-card-shadow-hover",
        "--ds-material-panel-border",
        "--ds-material-panel-focus-ring",
        "--ds-material-control-background-disabled",
        "--ds-material-control-foreground-disabled",
        "--ds-material-control-border-selected",
        "--ds-material-raised-shadow",
        "--ds-material-overlay-foreground",
        "--ds-type-page-title-font-size",
        "--ds-type-section-title-font-weight",
        "--ds-type-label-text-transform",
      ])
    );
  });

  it("accepts safe DB-authored material values but keeps arbitrary names closed", () => {
    const valid = validateTenantThemeDocument({
      schemaVersion: 1,
      mode: "advanced",
      visualFoundation: {
        advanced: {
          tokenOverrides: {
            "--ds-surface-canvas": "#F7F5EF",
            "--ds-surface-panel": "#FCFAF4",
            "--ds-surface-card": "#FFFFFF",
            "--ds-material-card-border": "#D9D2C4",
            "--ds-material-card-shadow": "0 12px 30px rgba(41, 35, 25, 0.08)",
            "--ds-material-panel-border": "#CEC6B8",
            "--ds-material-control-background-disabled": "#F1EEE7",
            "--ds-type-page-title-font-size": "1.75rem",
            "--ds-type-label-text-transform": "uppercase",
          },
        },
      },
    });
    expect(valid.success).toBe(true);

    const invalid = validateTenantThemeDocument({
      schemaVersion: 1,
      mode: "advanced",
      visualFoundation: {
        advanced: {
          tokenOverrides: { "--ds-material-custom-css": "red" },
        },
      },
    });
    expect(invalid.success).toBe(false);
  });
});
