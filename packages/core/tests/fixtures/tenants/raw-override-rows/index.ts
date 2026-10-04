/**
 * @fileoverview Persisted v1 rows that carry raw `advanced.tokenOverrides`.
 *
 * Migration inputs only. `PERSISTED_ROW_GENERAL` and `PERSISTED_ROW_OVERRIDES`
 * copy the `general` block and every raw override, names and values verbatim,
 * of one application row as it was stored (row version 6, bithire vertical);
 * its chrome block is left out because the fold never reads it. `SEEDED_ROW_OVERRIDES` copies the raw
 * map an application seed authors. Neither is registered as a tenant.
 */

import type { TenantAppearanceGeneral } from "@/foundation/contracts/composition/tenants/themes";

export const PERSISTED_ROW_VERTICAL = "bithire" as const;

export const PERSISTED_ROW_GENERAL: TenantAppearanceGeneral = {
  "shape": {
    "buttonStyle": "sharp"
  },
  "motion": {
    "ambient": "subtle",
    "intensity": 0.34,
    "durationScale": 1
  },
  "density": "normal",
  "palette": {
    "accent": "#78907E",
    "primary": "#315D4D",
    "secondary": "#7A6859",
    "backgroundMode": "light"
  },
  "surfaces": {
    "elevation": "soft"
  },
  "navigation": {
    "sidebarTone": "subtle"
  },
  "typography": {
    "fontFamilyBase": "'Avenir Next', Avenir, 'Segoe UI', ui-sans-serif, system-ui, -apple-system, sans-serif",
    "fontFamilyHeading": "var(--ds-font-pack-editorial-display), 'Iowan Old Style', 'Palatino Linotype', Georgia, 'Times New Roman', serif"
  }
};

export const PERSISTED_ROW_OVERRIDES: Readonly<Record<string, string | number>> = {
  "--ds-color-bg": "#F4F0E8",
  "--ds-glass-bg": "rgba(250, 247, 241, 0.88)",
  "--ds-radius-lg": "8px",
  "--ds-radius-md": "5px",
  "--ds-radius-sm": "3px",
  "--ds-radius-xl": "12px",
  "--ds-shadow-lg": "0 14px 30px rgba(42, 48, 43, 0.1), 0 3px 8px rgba(42, 48, 43, 0.05)",
  "--ds-shadow-md": "0 6px 16px rgba(42, 48, 43, 0.07), 0 1px 3px rgba(42, 48, 43, 0.05)",
  "--ds-shadow-sm": "0 1px 2px rgba(42, 48, 43, 0.06)",
  "--ds-shadow-xl": "0 24px 50px rgba(42, 48, 43, 0.12), 0 6px 16px rgba(42, 48, 43, 0.06)",
  "--ds-color-info": "#4D668F",
  "--ds-glass-blur": "12px",
  "--ds-color-error": "#A9443F",
  "--ds-color-accent": "#78907E",
  "--ds-glass-border": "rgba(216, 208, 195, 0.72)",
  "--ds-color-dark-bg": "#203028",
  "--ds-color-primary": "#315D4D",
  "--ds-color-success": "#4B702F",
  "--ds-color-warning": "#8A6716",
  "--ds-density-scale": 1,
  "--ds-gradient-mesh": "linear-gradient(145deg, rgba(120, 144, 126, 0.07), transparent 48%)",
  "--ds-overlay-heavy": "rgba(32, 48, 40, 0.1)",
  "--ds-overlay-light": "rgba(32, 48, 40, 0.025)",
  "--ds-overlay-medium": "rgba(32, 48, 40, 0.05)",
  "--ds-color-secondary": "#7A6859",
  "--ds-chart-category-1": "#315D4D",
  "--ds-chart-category-2": "#7A6859",
  "--ds-chart-category-3": "#667E70",
  "--ds-chart-category-4": "#8A6716",
  "--ds-chart-category-5": "#4D668F",
  "--ds-chart-category-6": "#4B702F",
  "--ds-chart-category-7": "#80677E",
  "--ds-chart-category-8": "#9B5947",
  "--ds-chart-category-9": "#596970",
  "--ds-color-background": "#F4F0E8",
  "--ds-color-bg-primary": "#F4F0E8",
  "--ds-effect-intensity": 0.18,
  "--ds-font-family-base": "'Avenir Next', Avenir, 'Segoe UI', ui-sans-serif, system-ui, -apple-system, sans-serif",
  "--ds-font-family-mono": "'SFMono-Regular', Consolas, 'Liberation Mono', monospace",
  "--ds-gradient-primary": "linear-gradient(135deg, #315D4D 0%, #78907E 100%)",
  "--ds-gradient-surface": "linear-gradient(180deg, #FFFCF7 0%, #F4F0E8 100%)",
  "--ds-line-height-body": 1.52,
  "--ds-chart-category-10": "#8A6849",
  "--ds-color-dark-accent": "#AAB8AD",
  "--ds-line-height-tight": 1.16,
  "--ds-color-dark-primary": "#789E8D",
  "--ds-font-family-display": "var(--ds-font-pack-editorial-display), 'Iowan Old Style', 'Palatino Linotype', Georgia, 'Times New Roman', serif",
  "--ds-font-family-heading": "var(--ds-font-pack-editorial-display), 'Iowan Old Style', 'Palatino Linotype', Georgia, 'Times New Roman', serif",
  "--ds-letter-spacing-body": "0.006em",
  "--ds-letter-spacing-mono": "0.025em",
  "--ds-line-height-display": 1.08,
  "--ds-line-height-heading": 1.24,
  "--ds-line-height-relaxed": 1.68,
  "--ds-color-dark-secondary": "#BCA998",
  "--ds-letter-spacing-display": "-0.012em",
  "--ds-letter-spacing-heading": "-0.006em",
};

export const SEEDED_ROW_OVERRIDES: Readonly<Record<string, string | number>> = {
  "--ds-density-scale": 1.05,
  "--ds-effect-intensity": 0.45,
  "--ds-line-height-body": 1.55,
  "--ds-letter-spacing-body": "0.01em",
};

/** The entries of the snapshot that are a catalog decision today. */
export const PERSISTED_ROW_REPRESENTABLE = [
  "--ds-color-accent",
  "--ds-color-background",
  "--ds-color-bg",
  "--ds-color-bg-primary",
  "--ds-color-error",
  "--ds-color-info",
  "--ds-color-primary",
  "--ds-color-secondary",
  "--ds-color-success",
  "--ds-color-warning",
  "--ds-effect-intensity",
] as const;

/** The entries of the snapshot the v1 allowlist no longer names. */
export const PERSISTED_ROW_OFF_ALLOWLIST = [
  "--ds-color-dark-accent",
  "--ds-color-dark-bg",
  "--ds-color-dark-primary",
  "--ds-color-dark-secondary",
] as const;

/** A v1 advanced row built from the snapshot, as untrusted stored JSON. */
export function persistedRow(
  overrides: Readonly<Record<string, unknown>> = PERSISTED_ROW_OVERRIDES,
  general: unknown = PERSISTED_ROW_GENERAL
): unknown {
  return JSON.parse(
    JSON.stringify({
      schemaVersion: 1,
      mode: "advanced",
      visualFoundation: { general, advanced: { tokenOverrides: overrides } },
    })
  );
}
