/**
 * @fileoverview BrandTheme serialization and bounded projection.
 *
 * Two export paths:
 *   - BrandTheme -> BrandTheme JSON: a lossless, identity round-trip target
 *     ({@link serializeBrandTheme} / {@link deserializeBrandTheme}).
 *   - BrandTheme -> TenantAppearanceAdvanced: a bounded projection
 *     ({@link brandThemeToTenantAppearanceAdvanced}). Chrome maps directly.
 *     Palette, typography, and motion have no Advanced home, so they funnel
 *     through bounded `tokenOverrides` keyed on the exact `--ds-*` names the
 *     brand compiler emits. `chrome.card` and `chrome.accent` are personality
 *     tokens with no `--ds-*` mapping and are dropped. No unbounded token
 *     overrides are produced: every key is a known member of a fixed allowlist.
 *
 * @module Patterns/Customization/BrandStudio/FileExport
 * @package @rottay/design-system
 */

import type {
  BrandTheme,
  BrandChrome,
  BrandPalette,
  BrandTypography,
  BrandMotion,
  TenantAppearanceAdvanced,
} from '../../../../../../foundation/contracts/composition/tenants/themes';

/** Deep clone through JSON. BrandTheme is a plain data contract. */
export function cloneBrandTheme(theme: BrandTheme): BrandTheme {
  return JSON.parse(JSON.stringify(theme)) as BrandTheme;
}

/** Serialize a BrandTheme to its canonical JSON string. */
export function serializeBrandTheme(theme: BrandTheme): string {
  return JSON.stringify(theme);
}

/** Parse a BrandTheme JSON string produced by {@link serializeBrandTheme}. */
export function deserializeBrandTheme(json: string): BrandTheme {
  return JSON.parse(json) as BrandTheme;
}

/** The real `TenantAppearanceAdvanced['chrome']` contract, named for reuse below. */
type AdvancedChrome = NonNullable<TenantAppearanceAdvanced['chrome']>;

/**
 * Exhaustive membership map keyed by every field of `AdvancedChrome`.
 *
 * This object literal is checked against `Record<keyof AdvancedChrome, true>`,
 * so it is what makes the allowlist track the contract instead of drifting
 * from it the way a hand-maintained string array could: if the contract gains
 * a chrome family, this literal is missing a required property and fails to
 * compile until the family is added here (choosing whether to include it);
 * if the contract loses or renames one, this literal has an unknown property
 * and fails to compile until the stale key is removed. `card` and `accent` are
 * BrandChrome-only personality tokens with no `--ds-*` mapping in
 * TenantAppearanceAdvanced, so they are not part of `AdvancedChrome` at all
 * and cannot be listed here.
 */
const ADVANCED_CHROME_INCLUDE: Record<keyof AdvancedChrome, true> = {
  sidebar: true,
  layout: true,
  shell: true,
  toolbar: true,
  filterPill: true,
  breadcrumb: true,
  search: true,
  controls: true,
  table: true,
  cardComponent: true,
  metricCard: true,
  signalCard: true,
  workspaceCard: true,
  compactCard: true,
  tallCard: true,
  collectionCard: true,
  listingGrid: true,
  modal: true,
  tabs: true,
};

/**
 * Copy `source[key]` into `target[key]` when present. `BrandChrome` declares
 * each of these families as the fully-populated type (e.g. `sidebar?:
 * BrandSidebarChrome`); `AdvancedChrome` declares the same key as `Partial<
 * BrandSidebarChrome>`. A fully-populated value is always a valid partial of
 * itself, so the copy is sound, but TypeScript cannot verify that through a
 * shared generic key without a per-field type guard — this is the one place
 * that fact is asserted, scoped to a single field at a time, rather than
 * suppressed across the whole projection the way the removed blanket cast did.
 */
function copyChromeField<K extends keyof AdvancedChrome>(
  source: BrandChrome,
  target: Partial<AdvancedChrome>,
  key: K,
): void {
  const value = source[key];
  if (value != null) {
    target[key] = value as AdvancedChrome[K];
  }
}

/** Copy the Advanced-addressable chrome families, dropping card/accent. */
function projectChrome(chrome: BrandChrome): AdvancedChrome {
  const out: Partial<AdvancedChrome> = {};
  for (const key of Object.keys(ADVANCED_CHROME_INCLUDE) as Array<keyof AdvancedChrome>) {
    copyChromeField(chrome, out, key);
  }
  return out;
}

type TokenOverrides = NonNullable<TenantAppearanceAdvanced['tokenOverrides']>;

/** palette field -> the exact `--ds-*` key the brand compiler emits for it. */
const PALETTE_TOKENS: Array<[keyof BrandPalette, `--ds-${string}`]> = [
  ['primaryColor', '--ds-color-primary'],
  ['secondaryColor', '--ds-color-secondary'],
  ['accentColor', '--ds-color-accent'],
  ['successColor', '--ds-color-success'],
  ['warningColor', '--ds-color-warning'],
  ['errorColor', '--ds-color-error'],
  ['infoColor', '--ds-color-info'],
  ['darkPrimaryColor', '--ds-color-dark-primary'],
  ['darkSecondaryColor', '--ds-color-dark-secondary'],
  ['darkAccentColor', '--ds-color-dark-accent'],
  ['darkBackgroundColor', '--ds-color-dark-bg'],
];

/** typography font families -> the `--ds-font-family-*` keys the compiler emits. */
const TYPOGRAPHY_FONT_TOKENS: Array<[keyof BrandTypography, `--ds-${string}`]> = [
  ['fontFamilyBase', '--ds-font-family-base'],
  ['fontFamilyHeading', '--ds-font-family-heading'],
  ['fontFamilyMono', '--ds-font-family-mono'],
  ['fontFamilyDisplay', '--ds-font-family-display'],
];

/**
 * Funnel palette, typography, and motion into a bounded `--ds-*` token map.
 * Only the fixed allowlist below is emitted, so the projection can never grow
 * an unbounded override surface.
 */
function buildBoundedTokenOverrides(theme: BrandTheme): TokenOverrides {
  const overrides: Record<string, string | number> = {};

  if (theme.palette) {
    for (const [field, token] of PALETTE_TOKENS) {
      const value = theme.palette[field];
      if (typeof value === 'string' && value) overrides[token] = value;
    }
  }

  if (theme.typography) {
    for (const [field, token] of TYPOGRAPHY_FONT_TOKENS) {
      const value = theme.typography[field];
      if (typeof value === 'string' && value) overrides[token] = value;
    }
    const spacing = theme.typography.letterSpacing;
    if (spacing) {
      if (spacing.display) overrides['--ds-letter-spacing-display'] = spacing.display;
      if (spacing.heading) overrides['--ds-letter-spacing-heading'] = spacing.heading;
      if (spacing.body) overrides['--ds-letter-spacing-body'] = spacing.body;
      if (spacing.mono) overrides['--ds-letter-spacing-mono'] = spacing.mono;
    }
    const lineHeight = theme.typography.lineHeight;
    if (lineHeight) {
      if (lineHeight.display != null) overrides['--ds-line-height-display'] = String(lineHeight.display);
      if (lineHeight.heading != null) overrides['--ds-line-height-heading'] = String(lineHeight.heading);
      if (lineHeight.body != null) overrides['--ds-line-height-body'] = String(lineHeight.body);
    }
  }

  if (theme.motion) {
    const motion: BrandMotion = theme.motion;
    // The compiler's `calm` motion token tracks the theme entrance duration.
    if (motion.entranceDuration != null) {
      overrides['--ds-motion-calm'] = `${motion.entranceDuration}ms`;
    }
  }

  return overrides as TokenOverrides;
}

/**
 * Project a BrandTheme into a bounded TenantAppearanceAdvanced. Chrome families
 * map directly (minus card/accent); palette, typography, and motion funnel into
 * bounded `--ds-*` token overrides. This projection is intentionally lossy — the
 * lossless path is {@link serializeBrandTheme}.
 */
export function brandThemeToTenantAppearanceAdvanced(theme: BrandTheme): TenantAppearanceAdvanced {
  const advanced: TenantAppearanceAdvanced = {};

  if (theme.chrome) {
    const chrome = projectChrome(theme.chrome);
    if (Object.keys(chrome).length > 0) advanced.chrome = chrome;
  }

  const tokenOverrides = buildBoundedTokenOverrides(theme);
  if (Object.keys(tokenOverrides).length > 0) advanced.tokenOverrides = tokenOverrides;

  return advanced;
}
