# DS Token System

## Overview
CSS custom properties (variables) that drive ALL visual output. Tokens change per tenant via `tenantConfig` and `tenantOverrides`.

## Token Categories

### Colors (`--ds-color-*`)
- `--ds-color-primary` / `-50` to `-900` (primary palette)
- `--ds-color-secondary` / `-50` to `-900`
- `--ds-color-success`, `--ds-color-warning`, `--ds-color-error`, `--ds-color-info`
- `--ds-color-neutral-50` to `-900`
- `--ds-color-text-primary`, `-secondary`, `-muted`
- `--ds-color-bg-primary`, `-secondary`
- `--ds-color-border`, `-border-secondary`
- `--ds-color-surface`, `-surface-secondary`

### Spacing (`--ds-spacing-*`)
- `--ds-spacing-xs` (4px), `-sm` (8px), `-md` (16px), `-lg` (24px), `-xl` (32px)
- Scaled by `tenantOverrides.densityScale`

### Border Radius (`--ds-radius-*`)
- `--ds-radius-sm` (2px), `-md` (6px), `-lg` (8px), `-xl` (12px), `-full` (9999px)
- Overridable via `tenantOverrides.borderRadius`

### Shadows (`--ds-shadow-*`)
- `--ds-shadow-sm`, `-md`, `-lg`, `-xl`
- Overridable via `tenantOverrides.shadows`

### Typography (`--ds-font-*`)
- `--ds-font-family-base`, `-mono`, `-heading`
- `--ds-font-size-xs` to `-5xl`
- `--ds-font-weight-normal`, `-medium`, `-semibold`, `-bold`
- `--ds-line-height-tight`, `-normal`, `-relaxed`

### Component Tokens (`--ds-button-*`, `--ds-card-*`, etc.)
- Per-component tokens mapped from the above primitives
- e.g., `--ds-button-primary-bg: var(--ds-color-primary)`
- `--ds-card-radius: var(--ds-radius-md)`

## Engine CSS Bridge
Each engine has its own CSS theme that maps DS tokens to library-specific selectors:
- `classic/theme.css`: `.ant-btn { border-radius: var(--ds-button-md-radius) }`
- `modern/theme.css`: `.btn { --btn-color-scheme: var(--ds-color-primary) }`
- `rustic/theme.css`: `[role="button"] { border-radius: var(--ds-radius-md) }`

## Tenant Overrides
```ts
interface TenantTokenOverrides {
  borderRadius?: Record<'sm' | 'md' | 'lg' | 'xl', string>;
  shadows?: Record<'sm' | 'md' | 'lg' | 'xl', string>;
  densityScale?: number;       // Multiplier for all spacing
  glass?: { blur, background, border };
  gradients?: { primary, surface, mesh };
}
```

## Personality Tokens
Higher-level semantic tokens driven by `tenantConfig.personality`:
```ts
interface PersonalityTokens {
  typography: { headingWeight, baseSize, scale };
  card: { defaultElevation, hoverElevation, accentBar };
  accent: { showAccentBar, accentPosition, gradientBackground };
  animation: { entranceDuration, exitDuration, hoverScale, reducedMotion };
}
```
