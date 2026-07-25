import { describe, expect, it } from "vitest";
import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";
import {
  compileBrandTheme,
  semanticSurfaceRolesToCssVariables,
} from "../index";

describe("semantic surface-role compiler", () => {
  it("emits coordinated role facets and compatibility aliases", () => {
    expect(
      semanticSurfaceRolesToCssVariables({
        card: {
          background: "#fff",
          backgroundHover: "#fafafa",
          backgroundActive: "#f7f8fb",
          backgroundSelected: "#f5f7ff",
          backgroundDisabled: "#f0f0f0",
          foreground: "#111",
          foregroundMuted: "#555",
          foregroundDisabled: "#888",
          border: "#ddd",
          borderStrong: "#bbb",
          borderHover: "#99a",
          borderActive: "#889",
          borderSelected: "#668",
          borderDisabled: "#e5e5e5",
          focusRing: "0 0 0 3px #4466ff22",
          shadow: "0 1px 2px #0001",
          shadowHover: "0 8px 24px #0002",
          shadowActive: "0 1px 1px #0001",
          shadowSelected: "0 4px 16px #0002",
          highlight: "inset 0 1px #fff8",
          texture: "linear-gradient(#fff8, transparent)",
        },
        raised: { background: "#fefefe" },
      })
    ).toMatchObject({
      "--ds-material-card-background": "var(--ds-surface-card)",
      "--ds-material-card-background-hover": "#fafafa",
      "--ds-material-card-background-active": "#f7f8fb",
      "--ds-material-card-background-selected": "#f5f7ff",
      "--ds-material-card-background-disabled": "#f0f0f0",
      "--ds-material-card-foreground": "#111",
      "--ds-material-card-foreground-muted": "#555",
      "--ds-material-card-foreground-disabled": "#888",
      "--ds-material-card-border": "#ddd",
      "--ds-material-card-border-strong": "#bbb",
      "--ds-material-card-border-hover": "#99a",
      "--ds-material-card-border-active": "#889",
      "--ds-material-card-border-selected": "#668",
      "--ds-material-card-border-disabled": "#e5e5e5",
      "--ds-material-card-focus-ring": "0 0 0 3px #4466ff22",
      "--ds-material-card-shadow": "0 1px 2px #0001",
      "--ds-material-card-shadow-hover": "0 8px 24px #0002",
      "--ds-material-card-shadow-active": "0 1px 1px #0001",
      "--ds-material-card-shadow-selected": "0 4px 16px #0002",
      "--ds-material-card-highlight": "inset 0 1px #fff8",
      "--ds-material-card-texture": "linear-gradient(#fff8, transparent)",
      "--ds-surface-card": "#fff",
      "--ds-surface-card-bg": "var(--ds-surface-card)",
      "--ds-surface-card-border": "var(--ds-material-card-border)",
      "--ds-surface-card-border-strong":
        "var(--ds-material-card-border-strong)",
      "--ds-surface-card-shadow": "var(--ds-material-card-shadow)",
      "--ds-surface-card-shadow-hover":
        "var(--ds-material-card-shadow-hover)",
      "--ds-surface-raised": "#fefefe",
      "--ds-color-surface-raised": "var(--ds-surface-raised)",
    });
  });

  it("includes semantic surface roles in the compiled brand artifact", () => {
    const brandTheme: BrandTheme = {
      id: "surface-role-proof",
      name: "Surface role proof",
      surfaces: {
        surfaceRoles: {
          canvas: { background: "#f7f6f2" },
          panel: { background: "#fbfaf7", border: "#dedbd2" },
          control: { background: "#ffffff" },
        },
      },
    };

    const compiled = compileBrandTheme({ brandTheme, tenantSlug: "proof" });
    expect(compiled.cssVariables["--ds-surface-canvas"]).toBe("#f7f6f2");
    expect(compiled.cssVariables["--ds-surface-panel"]).toBe("#fbfaf7");
    expect(compiled.cssVariables["--ds-material-panel-border"]).toBe("#dedbd2");
    expect(compiled.cssVariables["--ds-surface-control"]).toBe("#ffffff");
    expect(compiled.cssString).toContain("--ds-material-panel-border");
  });
});
