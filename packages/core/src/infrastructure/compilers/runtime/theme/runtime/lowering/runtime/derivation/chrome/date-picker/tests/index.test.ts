import { describe, expect, it } from "vitest";

import { datePickerChromeDeriver, deriveDatePickerChannels } from "..";

const HOVER_CHANNELS = [
  "--ds-date-picker-nav-bg-hover",
  "--ds-date-picker-cell-bg-hover",
] as const;
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
  "--ds-date-picker-bg": "var(--ds-input-bg, var(--ds-material-control-background))",
  "--ds-date-picker-bg-disabled": "var(--ds-material-control-background-disabled)",
  "--ds-date-picker-filled-bg": "var(--ds-input-filled-bg, var(--ds-material-inset-background))",
  "--ds-date-picker-color": "var(--ds-color-text-primary)",
  "--ds-date-picker-font-family": "var(--ds-input-font-family, var(--ds-type-body-font-family))",
  "--ds-date-picker-placeholder": "var(--ds-type-color-muted)",
  "--ds-date-picker-border": "var(--ds-input-border, var(--ds-material-control-border))",
  "--ds-date-picker-border-hover": "var(--ds-material-control-border-hover)",
  "--ds-date-picker-border-focus": "var(--ds-color-primary)",
  "--ds-date-picker-shadow-focus": "var(--ds-focus-ring)",
  "--ds-date-picker-active-ring": "0 0 0 var(--ds-focus-ring-width) var(--ds-color-primary)",
  "--ds-date-picker-error-border": "var(--ds-color-error)",
  "--ds-date-picker-warning-border": "var(--ds-color-warning)",
  "--ds-date-picker-clear-color": "var(--ds-color-text-primary)",
  "--ds-date-picker-icon-color": "var(--ds-type-color-muted)",
  "--ds-date-picker-separator-color": "var(--ds-color-text-secondary)",
  "--ds-date-picker-panel-bg": "var(--ds-color-bg-elevated, var(--ds-material-overlay-background))",
  "--ds-date-picker-panel-shadow": "var(--ds-shadow-popover, var(--ds-elevation-3))",
  "--ds-date-picker-divider": "var(--ds-color-border)",
  "--ds-date-picker-title-ink": "var(--ds-color-text-primary)",
  "--ds-date-picker-weekday-ink": "var(--ds-type-color-muted)",
  "--ds-date-picker-nav-ink": "var(--ds-color-text-primary)",
  "--ds-date-picker-cell-ink": "var(--ds-color-text-primary)",
  "--ds-date-picker-cell-bg-selected": "var(--ds-color-primary)",
  "--ds-date-picker-cell-ink-selected": "var(--ds-color-text-on-primary)",
  "--ds-date-picker-band-bg": "var(--ds-wash-band)",
  "--ds-date-picker-band-preview-bg": "var(--ds-wash-band-preview)",
  "--ds-date-picker-today-ring": "var(--ds-color-primary)",
  "--ds-date-picker-today-marker": "var(--ds-color-primary)",
  "--ds-date-picker-time-select-bg": "var(--ds-color-bg-elevated, var(--ds-material-control-background))",
  "--ds-date-picker-today-bg": "var(--ds-color-primary)",
  "--ds-date-picker-today-bg-hover": "var(--ds-color-primary-hover, var(--ds-color-primary))",
  "--ds-date-picker-today-ink": "var(--ds-color-text-on-primary)"
};

describe("chrome/date-picker hover material", () => {
  describe.each(HOVER_CHANNELS)("%s", (channel) => {
    it("moves with material while the declared palette hover stays fixed", () => {
      const value = deriveDatePickerChannels()[channel]!;
      const base = { [PALETTE]: "#eeeeee", [MATERIAL]: "#112233" };
      const changed = { ...base, [MATERIAL]: "#445566" };
      expect(resolveChain(value, base)).toBe("#112233");
      expect(resolveChain(value, changed)).toBe("#445566");
    });

    it("holds material hover when only the palette hover changes", () => {
      const value = deriveDatePickerChannels()[channel]!;
      const base = { [PALETTE]: "#eeeeee", [MATERIAL]: "#112233" };
      expect(resolveChain(value, { ...base, [PALETTE]: "#999999" })).toBe(resolveChain(value, base));
      expect(resolveChain(value, base)).toBe(base[MATERIAL]);
    });

    it("detects the palette-first mutation masking an independently moved material", () => {
      const value = deriveDatePickerChannels()[channel]!;
      const mutated = value.replace(`var(${MATERIAL}, var(${PALETTE}))`, PALETTE_FIRST);
      const base = { [PALETTE]: "#eeeeee", [MATERIAL]: "#112233" };
      const changed = { ...base, [MATERIAL]: "#445566" };
      expect(mutated).not.toBe(value);
      expect(resolveChain(value, changed)).not.toBe(resolveChain(value, base));
      expect(resolveChain(mutated, changed)).toBe(resolveChain(mutated, base));
      expect(resolveChain(mutated, changed)).toBe(base[PALETTE]);
    });

    it("retains palette hover as fallback when no material hover is declared", () => {
      expect(resolveChain(deriveDatePickerChannels()[channel]!, { [PALETTE]: "#eeeeee" })).toBe("#eeeeee");
    });
  });

  it("preserves all 33 non-target channel values byte for byte", () => {
    const actual = Object.fromEntries(Object.entries(deriveDatePickerChannels()).filter(
      ([channel]) => !HOVER_CHANNELS.some((hover) => hover === channel),
    ));
    expect(actual).toEqual(NON_TARGET_CHANNELS);
    expect(Object.keys(actual)).toHaveLength(33);
  });

  it("keeps the published family channel inventory unchanged", () => {
    const channels = Object.keys(deriveDatePickerChannels()).sort();
    expect(channels).toEqual([...datePickerChromeDeriver.produces].sort());
    expect(channels).toEqual([...Object.keys(NON_TARGET_CHANNELS), ...HOVER_CHANNELS].sort());
  });
});
