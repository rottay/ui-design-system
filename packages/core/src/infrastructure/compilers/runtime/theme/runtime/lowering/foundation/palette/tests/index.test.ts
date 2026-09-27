import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import type { BrandPalette } from "@/foundation/contracts/composition/tenants/themes";

import { setExtendedPaletteVariables } from "..";

const RETIRED = "--ds-border-color";
const DEFAULT_THEME = join(
  process.cwd(),
  "src/foundation/tokens/css/foundation/themes/default/index.css"
);

function lower(palette: unknown): Record<string, string> {
  const vars: Record<string, string> = {};
  setExtendedPaletteVariables(vars, palette as BrandPalette);
  return vars;
}

describe("palette alias lowering", () => {
  it("lowers every surviving alias onto its channel", () => {
    const vars = lower({
      aliases: { textPrimary: "#111111", borderColorDefault: "#222222", borderColorFocus: "#333333" },
    });
    expect(vars["--ds-text-primary"]).toBe("#111111");
    expect(vars["--ds-border-color-default"]).toBe("#222222");
    expect(vars["--ds-border-color-focus"]).toBe("#333333");
  });

  it("emits nothing for a document that still carries the retired borderColor leaf", () => {
    const vars = lower({ aliases: { borderColor: "#444444", borderColorMuted: "#555555" } });
    expect(Object.keys(vars)).not.toContain(RETIRED);
    expect(Object.values(vars)).not.toContain("#444444");
    expect(vars["--ds-border-color-muted"]).toBe("#555555");
  });

  it("declares no default-theme floor for the retired alias while its siblings keep theirs", () => {
    const css = readFileSync(DEFAULT_THEME, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    expect(css).not.toMatch(/--ds-border-color\s*:/);
    expect(css).toMatch(/--ds-border-color-default\s*:/);
  });
});
