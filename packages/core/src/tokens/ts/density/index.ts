/**
 * @fileoverview Canonical density modes and their token-resolved presets.
 *
 * Two modes — `comfortable` (default, route-grade) and `compact`
 * (embedded / beside-chat) — expressed as design tokens so density is
 * theme-driven, not hardcoded. Every preset value is emitted as a
 * `var(--ds-density-*, <literal>)` handle: a theme (or the generated brand
 * artifact) may override the token, and the literal fallback guarantees the
 * mode resolves even before any artifact ships it.
 *
 * Values are the design-language density spec (§3):
 *
 * | Mode          | densityScale | Table cell        | Card padding | Metric preset |
 * | ------------- | ------------ | ----------------- | ------------ | ------------- |
 * | `comfortable` | 0.98         | `0.875rem 1rem`   | `1rem`       | `md`          |
 * | `compact`     | 0.90         | `0.5rem 0.75rem`  | `0.75rem`    | `sm`          |
 *
 * This is the shared, lowest-layer source consumed by the three density-aware
 * families — `PatternDataTable`, `CollectionWorkspaceSurface`, and the
 * dashboard metric-card structures — so route vs embedded vs beside-chat
 * density derives from one declarative preset table.
 */

import type { CSSProperties } from 'react';

/**
 * Canonical density mode. Intentionally the two-value enum
 * (`'comfortable' | 'compact'`) — the wider `SurfaceDensity`
 * (`+ 'spacious'`) is a legacy per-component vocabulary, not this canonical set.
 */
export type DensityMode = 'comfortable' | 'compact';

/** Resolved, token-backed values for a single density mode. */
export interface DensityPreset {
  /** `densityScale` multiplier applied to spacing (design-language §3). */
  readonly scale: number;
  /** Table cell padding CSS value (token handle with literal §3 fallback). */
  readonly cellPadding: string;
  /** Card padding CSS value (token handle with literal §3 fallback). */
  readonly cardPadding: string;
  /** Metric-card size preset this mode maps to. */
  readonly metricPreset: 'sm' | 'md';
}

/** The default density mode when a consumer does not specify one. */
export const DEFAULT_DENSITY_MODE: DensityMode = 'comfortable';

/**
 * Token-resolved presets per density mode. Each string value is a CSS custom
 * property handle with a literal fallback so the mode renders correctly with or
 * without a theme that defines the per-mode token.
 */
export const DENSITY_PRESETS: Record<DensityMode, DensityPreset> = {
  comfortable: {
    scale: 0.98,
    cellPadding: 'var(--ds-density-cell-padding-comfortable, 0.875rem 1rem)',
    cardPadding: 'var(--ds-density-card-padding-comfortable, 1rem)',
    metricPreset: 'md',
  },
  compact: {
    scale: 0.9,
    cellPadding: 'var(--ds-density-cell-padding-compact, 0.5rem 0.75rem)',
    cardPadding: 'var(--ds-density-card-padding-compact, 0.75rem)',
    metricPreset: 'sm',
  },
};

/**
 * Narrows any density-like string to the canonical two-value {@link DensityMode}.
 * `'compact'` maps to `'compact'`; everything else (including the legacy
 * `'spacious'`, `'normal'`, `undefined`) resolves to `'comfortable'`.
 *
 * @param input - Raw density value from a prop, config, or token.
 * @returns The canonical density mode.
 */
export function normalizeDensityMode(input?: string | null): DensityMode {
  return input === 'compact' ? 'compact' : 'comfortable';
}

/**
 * Builds the CSS custom properties that carry a mode's resolved density preset
 * on a container element. Descendants (tables, cards, embedded collections)
 * read `--ds-density-cell-padding` / `--ds-density-card-padding` /
 * `--ds-density-scale` from the cascade.
 *
 * @param mode - The density mode to resolve.
 * @returns A style object of density CSS variables, ready to spread into `style`.
 */
export function resolveDensityStyleVars(mode: DensityMode): CSSProperties {
  const preset = DENSITY_PRESETS[mode];
  return {
    '--ds-density-cell-padding': preset.cellPadding,
    '--ds-density-card-padding': preset.cardPadding,
    '--ds-density-scale': String(preset.scale),
  } as unknown as CSSProperties;
}
