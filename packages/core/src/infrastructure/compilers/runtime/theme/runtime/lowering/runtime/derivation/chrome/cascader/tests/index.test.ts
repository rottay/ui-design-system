import { describe, expect, it } from "vitest";
import { cascaderChromeDeriver, deriveCascaderChannels } from "..";
import { deriveStateChannels } from "../../../states";
import { deriveMaterialChannels } from "../../../materials";

const HOVER = "--ds-cascader-option-bg-hover";
const MATERIAL = "--ds-material-control-background-hover";
const PALETTE = "--ds-color-bg-hover";
const PALETTE_FIRST = "var(--ds-color-bg-hover, var(--ds-material-control-background-hover))";
const OTHER_CHANNELS = {
  "--ds-cascader-bg": "var(--ds-input-bg, var(--ds-material-control-background))",
  "--ds-cascader-ink": "var(--ds-color-text-primary)",
  "--ds-cascader-font-family": "var(--ds-input-font-family, var(--ds-type-body-font-family))",
  "--ds-cascader-border": "var(--ds-input-border, var(--ds-material-control-border))",
  "--ds-cascader-border-hover": "var(--ds-material-control-border-hover)",
  "--ds-cascader-border-focus": "var(--ds-color-primary)",
  "--ds-cascader-shadow-focus": "var(--ds-focus-ring)",
  "--ds-cascader-error-border": "var(--ds-color-error)",
  "--ds-cascader-warning-border": "var(--ds-color-warning)",
  "--ds-cascader-placeholder": "var(--ds-type-color-muted)",
  "--ds-cascader-clear-color": "var(--ds-color-text-primary)",
  "--ds-cascader-clear-color-hover": "var(--ds-input-clear-color-hover, var(--ds-color-text-primary))",
  "--ds-cascader-dropdown-bg": "var(--ds-material-overlay-background)",
  "--ds-cascader-dropdown-border": "var(--ds-color-border)",
  "--ds-cascader-dropdown-shadow": "var(--ds-elevation-2)",
  "--ds-cascader-divider": "var(--ds-color-border)",
  "--ds-cascader-empty-ink": "var(--ds-type-color-muted)",
  "--ds-cascader-option-ink": "var(--ds-color-text-primary)",
  "--ds-cascader-option-bg-selected": "color-mix(in srgb, var(--ds-color-primary) 10%, transparent)",
  "--ds-cascader-option-border-selected": "color-mix(in srgb, var(--ds-color-primary) 24%, transparent)",
  "--ds-cascader-chevron-ink": "var(--ds-color-text-muted)",
  "--ds-cascader-spinner-track": "var(--ds-color-border)",
  "--ds-cascader-spinner-ink": "var(--ds-color-primary)"
};

function resolveReferences(value: string, variables: Record<string, string>, depth = 0): string {
  if (depth > 16) throw new Error("Cyclic CSS reference");
  return value.replace(/var\((--[\w-]+)(?:,\s*(var\(--[\w-]+\)|[^()]*))?\)/g, (_, name: string, fallback: string | undefined) => {
    const selected = variables[name] ?? fallback;
    if (selected === undefined) throw new Error(`Missing CSS reference: ${name}`);
    return resolveReferences(selected, variables, depth + 1);
  });
}

function emphasisVariables(stateEmphasis: "subtle" | "medium" | "strong") {
  const theme = { id: "cascader-material-test", name: "Cascader", surfaces: { stateEmphasis } };
  return {
    "--ds-color-primary": "#2468ac",
    "--ds-surface-control": "#f8f8fa",
    [PALETTE]: "#ededf0",
    ...deriveStateChannels(theme),
    ...deriveMaterialChannels(theme),
  };
}

describe("cascader option material hover", () => {
  it("declares the material-first channel and preserves every other channel exactly", () => {
    const { [HOVER]: hover, ...others } = deriveCascaderChannels();
    expect(others).toEqual(OTHER_CHANNELS);
    expect(Object.keys(others)).toHaveLength(23);
    expect(hover).toBe("var(--ds-material-control-background-hover, var(--ds-color-bg-hover))");
    expect([...cascaderChromeDeriver.produces].sort()).toEqual(Object.keys(deriveCascaderChannels()).sort());
  });

  it.each([
    ["subtle", "medium", "2%", "4%"],
    ["medium", "strong", "4%", "8%"],
    ["strong", "subtle", "8%", "2%"],
  ] as const)("follows real material emphasis from %s to %s while palette holds", (from, to, fromShift, toShift) => {
    const base = emphasisVariables(from);
    const changed = emphasisVariables(to);
    const hover = deriveCascaderChannels()[HOVER];
    expect(base[PALETTE]).toBe(changed[PALETTE]);
    expect(resolveReferences(hover, base)).toBe(`color-mix(in srgb, #2468ac ${fromShift}, #f8f8fa)`);
    expect(resolveReferences(hover, changed)).toBe(`color-mix(in srgb, #2468ac ${toShift}, #f8f8fa)`);
    expect(resolveReferences(hover, changed)).not.toBe(resolveReferences(hover, base));
  });

  it("refuses the palette-first mutant because it masks real material movement", () => {
    const base = emphasisVariables("subtle");
    const changed = emphasisVariables("strong");
    expect(resolveReferences(`var(${MATERIAL})`, changed)).not.toBe(resolveReferences(`var(${MATERIAL})`, base));
    expect(resolveReferences(PALETTE_FIRST, changed)).toBe(resolveReferences(PALETTE_FIRST, base));
    expect(resolveReferences(deriveCascaderChannels()[HOVER], changed)).not.toBe(resolveReferences(PALETTE_FIRST, changed));
  });

  it("uses the palette fallback when the material channel is absent", () => {
    expect(resolveReferences(deriveCascaderChannels()[HOVER], { [PALETTE]: "#abcdef" })).toBe("#abcdef");
  });

  it("uses material when the palette channel is absent", () => {
    expect(resolveReferences(deriveCascaderChannels()[HOVER], { [MATERIAL]: "#123456" })).toBe("#123456");
  });
});
