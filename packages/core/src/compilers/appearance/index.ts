/**
 * @fileoverview Appearance compiler — bridges TenantAppearance into runtime shapes.
 *
 * Converts the DB-safe TenantAppearanceGeneral and TenantAppearanceAdvanced
 * contracts into the existing runtime primitives (branding, tokenOverrides,
 * chrome CSS variables) so the merge chain stays unified.
 *
 * Merge order in the runtime:
 *   DS base -> vertical -> BrandTheme -> Appearance General -> Appearance Advanced
 *
 * General produces safe, bounded overrides (palette colors, font families,
 * radius scale factor, density preset, etc.).
 * Advanced produces fine-grained overrides (chrome, raw token overrides).
 */

import type {
  TenantAppearance,
  TenantAppearanceGeneral,
  TenantAppearanceAdvanced,
} from '../../contracts/themes';

// ── General tier ──────────────────────────────────────────

// Density and type-scale are resolved inside useTokens() (hooks/tokens/index.ts)
// as numeric factors that multiply the spacing array and font sizes. They are NOT
// emitted as CSS variables because that would require every consumer to use calc(),
// which is a paradigm shift not justified by the current audience.

/** Button shape presets map to a --ds-radius-button value. */
const BUTTON_STYLE_RADIUS: Record<string, string> = {
  sharp: '2px',
  soft: 'var(--ds-radius-md, 8px)',
  pill: '9999px',
};

/** Elevation presets map to shadow scales. */
const ELEVATION_PRESET: Record<string, Record<string, string>> = {
  flat: {
    '--ds-elevation-1': 'none',
    '--ds-elevation-2': 'none',
    '--ds-elevation-3': '0 1px 2px rgba(0,0,0,0.05)',
  },
  soft: {}, // use DS defaults
  elevated: {
    '--ds-elevation-1': '0 2px 4px rgba(0,0,0,0.08)',
    '--ds-elevation-2': '0 4px 8px rgba(0,0,0,0.1)',
    '--ds-elevation-3': '0 8px 16px rgba(0,0,0,0.12)',
  },
};

/**
 * Convert TenantAppearanceGeneral into a flat Record of CSS custom property
 * overrides that can be merged into the runtime token chain.
 */
export function appearanceGeneralToVariables(
  general: TenantAppearanceGeneral
): Record<string, string> {
  const vars: Record<string, string> = {};

  // Palette
  if (general.palette) {
    const p = general.palette;
    if (p.primary) vars['--ds-color-primary'] = p.primary;
    if (p.secondary) vars['--ds-color-secondary'] = p.secondary;
    if (p.accent) vars['--ds-color-accent'] = p.accent;
    // backgroundMode is consumed by ThemeProvider, not a CSS variable
  }

  // Typography — font families are CSS vars, scale is handled in useTokens()
  if (general.typography) {
    const t = general.typography;
    if (t.fontFamilyBase) vars['--ds-font-family-base'] = t.fontFamilyBase;
    if (t.fontFamilyHeading) vars['--ds-font-family-heading'] = t.fontFamilyHeading;
    // typography.scale is consumed by useTokens() as a JS factor, not a CSS var.
  }

  // Shape — buttonStyle maps to a real CSS var consumed by engines
  if (general.shape) {
    const s = general.shape;
    // radiusScale is consumed by useTokens() as a JS factor, not a CSS var.
    if (s.buttonStyle) {
      const r = BUTTON_STYLE_RADIUS[s.buttonStyle];
      if (r) vars['--ds-radius-button'] = r;
    }
  }

  // Density is consumed by useTokens() as a JS factor that multiplies the
  // spacing array. It is NOT emitted as a CSS variable.

  // Navigation — sidebarTone maps to real sidebar chrome variables
  if (general.navigation?.sidebarTone) {
    const tone = general.navigation.sidebarTone;
    switch (tone) {
      case 'subtle':
        vars['--ds-sidebar-bg'] = 'var(--ds-color-bg-secondary)';
        vars['--ds-sidebar-text'] = 'var(--ds-color-text-primary)';
        vars['--ds-sidebar-text-muted'] = 'var(--ds-color-text-muted)';
        vars['--ds-sidebar-item-bg-hover'] = 'var(--ds-color-bg-hover)';
        vars['--ds-sidebar-item-bg-active'] = 'var(--ds-color-primary-100)';
        vars['--ds-sidebar-item-color-active'] = 'var(--ds-color-primary)';
        break;
      case 'strong':
        vars['--ds-sidebar-bg'] = 'var(--ds-color-primary-900)';
        vars['--ds-sidebar-text'] = 'var(--ds-color-white)';
        vars['--ds-sidebar-text-muted'] = 'var(--ds-color-neutral-400)';
        vars['--ds-sidebar-item-bg-hover'] = 'var(--ds-color-primary-800)';
        vars['--ds-sidebar-item-bg-active'] = 'var(--ds-color-primary-700)';
        vars['--ds-sidebar-item-color-active'] = 'var(--ds-color-white)';
        break;
      case 'inverse':
        vars['--ds-sidebar-bg'] = 'var(--ds-color-neutral-900)';
        vars['--ds-sidebar-text'] = 'var(--ds-color-neutral-100)';
        vars['--ds-sidebar-text-muted'] = 'var(--ds-color-neutral-500)';
        vars['--ds-sidebar-item-bg-hover'] = 'var(--ds-color-neutral-800)';
        vars['--ds-sidebar-item-bg-active'] = 'var(--ds-color-neutral-700)';
        vars['--ds-sidebar-item-color-active'] = 'var(--ds-color-white)';
        break;
    }
  }

  // Surfaces / elevation
  if (general.surfaces?.elevation) {
    const preset = ELEVATION_PRESET[general.surfaces.elevation];
    if (preset) Object.assign(vars, preset);
  }

  // Media
  if (general.media) {
    const m = general.media;
    if (m.logo) vars['--ds-tenant-logo'] = `url(${m.logo})`;
    if (m.logoMark) vars['--ds-tenant-logo-mark'] = `url(${m.logoMark})`;
    if (m.favicon) vars['--ds-tenant-favicon'] = `url(${m.favicon})`;
  }

  return vars;
}

// ── Advanced tier ─────────────────────────────────────────

/**
 * Convert TenantAppearanceAdvanced into a flat Record of CSS custom property
 * overrides. Chrome values use the same variable namespace as brandThemeToChromeVariables.
 */
export function appearanceAdvancedToVariables(
  advanced: TenantAppearanceAdvanced
): Record<string, string> {
  const vars: Record<string, string> = {};

  // Chrome — uses the same variable names as the brand-theme compiler
  if (advanced.chrome) {
    const c = advanced.chrome;

    if (c.sidebar) {
      const s = c.sidebar;
      if (s.bg) vars['--ds-sidebar-bg'] = s.bg;
      if (s.border) vars['--ds-sidebar-border'] = s.border;
      if (s.text) vars['--ds-sidebar-text'] = s.text;
      if (s.textMuted) vars['--ds-sidebar-text-muted'] = s.textMuted;
      if (s.itemColorActive) vars['--ds-sidebar-item-color-active'] = s.itemColorActive;
      if (s.itemBgActive) vars['--ds-sidebar-item-bg-active'] = s.itemBgActive;
      if (s.itemBgHover) vars['--ds-sidebar-item-bg-hover'] = s.itemBgHover;
    }

    if (c.layout) {
      const l = c.layout;
      if (l.bg) vars['--ds-layout-bg'] = l.bg;
      if (l.headerBg) vars['--ds-layout-header-bg'] = l.headerBg;
      if (l.headerBackdrop) vars['--ds-layout-header-backdrop'] = l.headerBackdrop;
      if (l.headerBorder) vars['--ds-layout-header-border'] = l.headerBorder;
      if (l.siderBg) vars['--ds-layout-sider-bg'] = l.siderBg;
      if (l.siderBorder) vars['--ds-layout-sider-border'] = l.siderBorder;
    }

    if (c.controls) {
      const ct = c.controls;
      if (ct.buttonPrimary?.bg) vars['--ds-button-primary-bg'] = ct.buttonPrimary.bg;
      if (ct.buttonPrimary?.text) vars['--ds-button-primary-color'] = ct.buttonPrimary.text;
    }
  }

  // Raw token overrides — allowlisted keys starting with --ds-
  if (advanced.tokenOverrides) {
    for (const [key, value] of Object.entries(advanced.tokenOverrides)) {
      if (key.startsWith('--ds-') && value != null) {
        vars[key] = String(value);
      }
    }
  }

  return vars;
}

// ── Combined ──────────────────────────────────────────────

/**
 * Convert the full TenantAppearance into CSS custom property overrides.
 * General is applied first, then Advanced layers on top.
 */
export function appearanceToVariables(
  appearance: TenantAppearance
): Record<string, string> {
  const vars: Record<string, string> = {};

  if (appearance.general) {
    Object.assign(vars, appearanceGeneralToVariables(appearance.general));
  }

  if (appearance.advanced) {
    Object.assign(vars, appearanceAdvancedToVariables(appearance.advanced));
  }

  return vars;
}
