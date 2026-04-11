# Tenant Model — Frozen Decisions

This document is the single source of truth for how the DS handles tenant identity,
branding, and customization. All implementation must conform to these rules.

## Two Tenant Classes

### Bundled First-Party Verticals (file-first)

Tenants: `rottay`, `bithire`, `evnto`, `themanagementmiami`.

- Resolved from the DS registry (`runtime/tenant/registry/`) — zero network, zero DB.
- App hosts MUST short-circuit before any DB branding fetch for these slugs.
- Use `isKnownTenant(slug)` to detect. When true, pass only `tenantSlug` to DSP.
- Visual identity comes from `BrandTheme` authored in `tokens/ts/brand-themes/`.
- CSS artifacts live in `tokens/css/artifacts/{slug}/`.
- `BUNDLED_TENANT_SLUGS` controls which tenants have pre-bundled CSS.

### Runtime DB Tenants (core-first)

All other tenants (created by platform admins at runtime).

- Resolved via the DB adapter in `app-platform/src/lib/tenancy/`.
- Use `appearance.general` as the primary customization contract.
- Use `appearance.advanced` for expert-level, guarded overrides.
- Legacy fields (`branding`, `personality`, `tokenOverrides`) remain for backward compat.
- Do NOT receive arbitrary `BrandTheme` — that is reserved for bundled verticals.

## Customization Contracts

### appearance.general (DB tenants — primary)

Safe, high-signal, preset-based. Every field has a real runtime consumer.

| Field | What it does |
|-------|-------------|
| `palette.primary/secondary/accent` | Core colors (CSS vars via ThemeProvider) |
| `palette.backgroundMode` | Theme mode: light/dark/auto (feeds ThemeProvider) |
| `typography.fontFamilyBase/Heading` | Font families (CSS vars) |
| `shape.buttonStyle` | sharp/soft/pill (maps to --ds-radius-button) |
| `density` | compact/normal/spacious (JS factor in useTokens spacing) |
| `surfaces.elevation` | flat/soft/elevated (shadow presets) |
| `navigation.sidebarTone` | subtle/strong/inverse (sidebar chrome vars) |

### appearance.advanced (DB tenants — optional, bounded)

Expert-level, fine-grained. Only admitted fields are compiled.

| Field | What it does |
|-------|-------------|
| `chrome.sidebar` (7 fields) | bg, border, text, textMuted, itemColorActive, itemBgActive, itemBgHover |
| `chrome.layout` (full) | bg, headerBg, headerBackdrop, headerBorder, siderBg, siderBorder |
| `chrome.controls.buttonPrimary` (2 fields) | bg, text |
| `tokenOverrides` | Raw `--ds-*` key/value pairs (allowlisted) |

### brandTheme (bundled verticals — richest)

Full visual identity for first-party verticals. Code-owned, not DB-editable.

Includes: palette, typography, surfaces, motion, charts, chrome (sidebar/layout/shell/controls/table), engineBridge.

## Merge Chain (implemented)

```
DS base
  -> engine base tokens
    -> vertical tokenOverrides / personality
      -> BrandTheme (bundled) OR appearance (DB)
        -> tenant tokenOverrides (legacy compat)
          -> ThemeProvider + modern/theme.css + primitive renderers
```

## Removed / Narrowed

| Field | Status | Reason |
|-------|--------|--------|
| `brandThemeId` | Removed | No runtime consumer. Re-add when preset registry is built. |
| `appearance.general.typography.scale` | Removed | Needs calc() adoption. |
| `appearance.general.shape.radiusScale` | Removed | Same. |
| `appearance.general.motion.level` | Removed | No consumer. |
| `appearance.general.media.*` | Removed | No CSS reader. |
| `appearance.general.data.chartColorFamily` | Removed | No chart palette system. |
| `appearance.advanced.chrome.shell/table` | Removed | No compiler path. |
| `appearance.advanced.motion/charts/darkMode` | Removed | No compiler. |

## Deprecation Path

| Legacy field | Superseded by | Status |
|-------------|---------------|--------|
| `TenantConfig.personality` | `brandTheme.motion/chrome/typography` | Compat — kept for existing consumers |
| `TenantConfig.tokenOverrides` | `brandTheme.surfaces` | Compat — kept for existing consumers |
| `TenantConfig.branding` | `brandTheme.palette + typography` | Compat — normalized by DSP |

## Enforcement

- `audit-integration.mjs` Rule 4 catches stale "not yet wired" comments in contracts.
- `lint-folder-index.mjs` enforces taxonomy.
- Provider-level tests in `compilers/appearance/tests/` prove appearance propagation.
