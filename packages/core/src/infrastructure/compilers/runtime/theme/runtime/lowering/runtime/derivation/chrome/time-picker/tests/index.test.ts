import { describe, expect, it } from "vitest";

import { deriveTimePickerChannels, timePickerChromeDeriver } from "..";

const HOVER_CHANNEL = "--ds-time-picker-option-bg-hover";
const MATERIAL = "--ds-material-control-background-hover";
const PALETTE = "--ds-color-bg-hover";
const PALETTE_FIRST = `var(${PALETTE}, var(${MATERIAL}))`;

/** Resolve only whole-value var chains against independent test roots, without browser paint. */
function resolveChain(value: string, roots: Readonly<Record<string, string>>): string {
  const match = /^var\((--[a-z0-9-]+)(?:,\s*([\s\S]+))?\)$/.exec(value);
  if (!match) return value;
  const [, name, fallback] = match;
  if (name !== undefined && roots[name] !== undefined) return roots[name];
  if (fallback !== undefined) return resolveChain(fallback, roots);
  throw new Error(`Missing test root: ${name}`);
}

const NON_TARGET_CHANNELS: Readonly<Record<string, string>> = {
  "--ds-time-picker-bg": "var(--ds-input-bg, var(--ds-material-control-background))",
  "--ds-time-picker-bg-disabled": "var(--ds-material-control-background-disabled)",
  "--ds-time-picker-filled-bg": "var(--ds-material-inset-background)",
  "--ds-time-picker-color": "var(--ds-color-text-primary)",
  "--ds-time-picker-font-family": "var(--ds-input-font-family, var(--ds-type-body-font-family))",
  "--ds-time-picker-border": "var(--ds-input-border, var(--ds-material-control-border))",
  "--ds-time-picker-border-hover": "var(--ds-material-control-border-hover)",
  "--ds-time-picker-border-focus": "var(--ds-color-primary)",
  "--ds-time-picker-shadow-focus": "var(--ds-focus-ring)",
  "--ds-time-picker-active-ring": "0 0 0 var(--ds-focus-ring-width) var(--ds-color-primary)",
  "--ds-time-picker-error-border": "var(--ds-color-error)",
  "--ds-time-picker-warning-border": "var(--ds-color-warning)",
  "--ds-time-picker-clear-color": "var(--ds-color-text-primary)",
  "--ds-time-picker-icon-color": "var(--ds-type-color-muted)",
  "--ds-time-picker-separator-color": "var(--ds-color-text-secondary)",
  "--ds-time-picker-panel-bg": "var(--ds-color-bg-elevated, var(--ds-material-overlay-background))",
  "--ds-time-picker-panel-shadow": "var(--ds-shadow-popover, var(--ds-elevation-3))",
  "--ds-time-picker-divider": "var(--ds-color-border)",
  "--ds-time-picker-label-ink": "var(--ds-type-color-muted)",
  "--ds-time-picker-option-ink": "var(--ds-color-text-primary)",
  "--ds-time-picker-option-bg-selected": "var(--ds-color-primary)",
  "--ds-time-picker-option-ink-selected": "var(--ds-color-text-on-primary)",
  "--ds-time-picker-now-bg": "var(--ds-color-primary)",
  "--ds-time-picker-now-bg-hover": "var(--ds-color-primary-hover, var(--ds-color-primary))",
  "--ds-time-picker-now-ink": "var(--ds-color-text-on-primary)"
};

describe("chrome/time-picker option hover material", () => {
  it("moves with material while the declared palette hover stays fixed", () => {
    const value = deriveTimePickerChannels()[HOVER_CHANNEL]!;
    const base = { [PALETTE]: "#eeeeee", [MATERIAL]: "#112233" };
    const changed = { ...base, [MATERIAL]: "#445566" };
    expect(resolveChain(value, base)).toBe("#112233");
    expect(resolveChain(value, changed)).toBe("#445566");
  });

  it("holds material hover when only the palette hover changes", () => {
    const value = deriveTimePickerChannels()[HOVER_CHANNEL]!;
    const base = { [PALETTE]: "#eeeeee", [MATERIAL]: "#112233" };
    expect(resolveChain(value, { ...base, [PALETTE]: "#999999" })).toBe(resolveChain(value, base));
    expect(resolveChain(value, base)).toBe(base[MATERIAL]);
  });

  it("detects the palette-first mutation masking an independently moved material", () => {
    const value = deriveTimePickerChannels()[HOVER_CHANNEL]!;
    const mutated = value.replace(`var(${MATERIAL}, var(${PALETTE}))`, PALETTE_FIRST);
    const base = { [PALETTE]: "#eeeeee", [MATERIAL]: "#112233" };
    const changed = { ...base, [MATERIAL]: "#445566" };
    expect(mutated).not.toBe(value);
    expect(resolveChain(value, changed)).not.toBe(resolveChain(value, base));
    expect(resolveChain(mutated, changed)).toBe(resolveChain(mutated, base));
    expect(resolveChain(mutated, changed)).toBe(base[PALETTE]);
  });

  it("retains palette hover as fallback when no material hover is declared", () => {
    expect(resolveChain(deriveTimePickerChannels()[HOVER_CHANNEL]!, { [PALETTE]: "#eeeeee" })).toBe("#eeeeee");
  });

  it("preserves all 25 non-target channel values byte for byte", () => {
    const actual = Object.fromEntries(Object.entries(deriveTimePickerChannels()).filter(
      ([channel]) => channel !== HOVER_CHANNEL,
    ));
    expect(actual).toEqual(NON_TARGET_CHANNELS);
    expect(Object.keys(actual)).toHaveLength(25);
  });

  it("keeps the published family channel inventory unchanged", () => {
    const channels = Object.keys(deriveTimePickerChannels()).sort();
    expect(channels).toEqual([...timePickerChromeDeriver.produces].sort());
    expect(channels).toEqual([...Object.keys(NON_TARGET_CHANNELS), HOVER_CHANNEL].sort());
  });
});
