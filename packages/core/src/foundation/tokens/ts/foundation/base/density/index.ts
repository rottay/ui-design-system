/**
 * @fileoverview Canonical density modes and their token-resolved presets.
 *
 * Component surfaces expose two layout presets — `comfortable` (default,
 * route-grade) and `compact` (embedded / beside-chat). Tenant appearance adds
 * the semantic aliases `normal` and `spacious`. Both paths resolve through the
 * same factor table so JS token consumers and CSS spacing cannot drift.
 * Every preset value is emitted as a
 * `var(--ds-density-*, <literal>)` handle: a theme (or the generated brand
 * artifact) may override the token, and the literal fallback guarantees the
 * mode resolves even before any artifact ships it.
 *
 * Values are the design-language density spec (§3):
 *
 * | Mode          | mode factor | Table cell        | Card padding | Metric preset |
 * | ------------- | ----------- | ----------------- | ------------ | ------------- |
 * | `comfortable` | 1           | `0.875rem 1rem`   | `1rem`       | `md`          |
 * | `compact`     | 0.85        | `0.5rem 0.75rem`  | `0.75rem`    | `sm`          |
 *
 * This is the shared, lowest-layer source consumed by the three density-aware
 * families — `PatternDataTable`, `CollectionWorkspaceSurface`, and the
 * dashboard metric-card structures — so route vs embedded vs beside-chat
 * density derives from one declarative preset table.
 */

import type { CSSProperties } from 'react';

/**
 * Canonical component layout mode. Presentation surfaces deliberately expose
 * two presets; the broader appearance vocabulary is modeled separately below.
 */
export type DensityMode = 'comfortable' | 'compact';

/**
 * Complete semantic density vocabulary accepted across appearance and
 * container-scoped presentation APIs. `normal` is the tenant-facing alias for
 * the component-facing `comfortable` mode.
 */
export type DensityPreference = DensityMode | 'normal' | 'spacious';

/** Effective scale bounds shared by CSS projection and the numeric token graph. */
export const DENSITY_SCALE_BOUNDS = Object.freeze({ min: 0.5, max: 3 });

/** CSS channel for the semantic mode factor; structural brand scale stays separate. */
export const DENSITY_MODE_FACTOR_VARIABLE = '--ds-density-mode-factor' as const;

/**
 * CSS channel for a component/subtree posture relative to tenant appearance.
 * Keeping this separate prevents a local `comfortable` surface from erasing a
 * tenant-wide compact preference.
 */
export const DENSITY_LOCAL_FACTOR_VARIABLE = '--ds-density-local-factor' as const;

/** Global structural × appearance result used by discrete component presets. */
export const DENSITY_GLOBAL_EFFECTIVE_SCALE_VARIABLE =
  '--ds-density-global-effective-scale' as const;

/**
 * Single numeric authority for semantic density. Do not duplicate these
 * literals in CSS, appearance compilation, or runtime hooks.
 */
export const DENSITY_MODE_FACTORS: Readonly<Record<DensityPreference, number>> =
  Object.freeze({
    compact: 0.85,
    comfortable: 1,
    normal: 1,
    spacious: 1.15,
  });

/** Resolved, token-backed values for a single density mode. */
export interface DensityPreset {
  /** Semantic multiplier applied beside the structural brand/tenant scale. */
  readonly modeFactor: number;
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
    modeFactor: DENSITY_MODE_FACTORS.comfortable,
    cellPadding:
      `var(--ds-density-cell-padding-comfortable, calc(0.875rem * var(${DENSITY_GLOBAL_EFFECTIVE_SCALE_VARIABLE}, 1)) calc(1rem * var(${DENSITY_GLOBAL_EFFECTIVE_SCALE_VARIABLE}, 1)))`,
    cardPadding:
      `var(--ds-density-card-padding-comfortable, calc(1rem * var(${DENSITY_GLOBAL_EFFECTIVE_SCALE_VARIABLE}, 1)))`,
    metricPreset: 'md',
  },
  compact: {
    modeFactor: DENSITY_MODE_FACTORS.compact,
    cellPadding:
      `var(--ds-density-cell-padding-compact, calc(0.5rem * var(${DENSITY_GLOBAL_EFFECTIVE_SCALE_VARIABLE}, 1)) calc(0.75rem * var(${DENSITY_GLOBAL_EFFECTIVE_SCALE_VARIABLE}, 1)))`,
    cardPadding:
      `var(--ds-density-card-padding-compact, calc(0.75rem * var(${DENSITY_GLOBAL_EFFECTIVE_SCALE_VARIABLE}, 1)))`,
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

/** Runtime guard used before untrusted tenant appearance is compiled to CSS. */
export function isDensityPreference(input: unknown): input is DensityPreference {
  return typeof input === 'string'
    && Object.prototype.hasOwnProperty.call(DENSITY_MODE_FACTORS, input);
}

/**
 * Resolves a semantic density preference to the canonical multiplicative
 * factor. Invalid or absent values intentionally resolve to the identity.
 */
export function resolveDensityModeFactor(input?: unknown): number {
  return isDensityPreference(input) ? DENSITY_MODE_FACTORS[input] : 1;
}

/**
 * Composes the structural brand/tenant scale with the semantic mode factor for
 * numeric token consumers. This mirrors the bounded CSS expression used by the
 * spacing ramp: `clamp(min, base scale * mode factor, max)`.
 */
export function resolveEffectiveDensityScale(
  baseScale: number | null | undefined,
  preference?: unknown,
): number {
  const safeBase = typeof baseScale === 'number' && Number.isFinite(baseScale)
    ? baseScale
    : 1;
  const effective = safeBase * resolveDensityModeFactor(preference);
  return Math.max(DENSITY_SCALE_BOUNDS.min, Math.min(DENSITY_SCALE_BOUNDS.max, effective));
}

/**
 * Builds the CSS custom properties that carry a mode's resolved density preset
 * on a container element. Descendants (tables, cards, embedded collections)
 * read `--ds-density-cell-padding` / `--ds-density-card-padding` /
 * `--ds-density-local-factor` from the cascade. The structural
 * `--ds-density-scale` and tenant appearance `--ds-density-mode-factor` remain
 * inherited inputs rather than being overwritten by a component posture.
 *
 * @param mode - The density mode to resolve.
 * @returns A style object of density CSS variables, ready to spread into `style`.
 */
export function resolveDensityStyleVars(mode: DensityMode): CSSProperties {
  const preset = DENSITY_PRESETS[mode];
  return {
    '--ds-density-cell-padding': preset.cellPadding,
    '--ds-density-card-padding': preset.cardPadding,
    [DENSITY_LOCAL_FACTOR_VARIABLE]: String(preset.modeFactor),
  } as unknown as CSSProperties;
}
