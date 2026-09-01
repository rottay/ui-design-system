# Modern Runtime Pipeline

This document separates the styling pipeline that is actually implemented today from the customization model that is only declared in contracts/docs.

## Implemented Runtime Today

The effective Modern styling path is:

```text
DS base
  -> engine base tokens
    -> vertical tokenOverrides / personality
      -> brandTheme
        -> tenant tokenOverrides / personality
          -> ThemeProvider + modern/theme.css + primitive renderers
```

### Evidence

- `TenantConfig` declares the implemented merge chain as:
  `DS base -> vertical baseline -> BrandTheme -> branding/tokenOverrides -> Appearance General -> Appearance Advanced -> runtime`
  in `src/foundation/contracts/composition/tenants/index.ts`.
- `TenantAppearance` is wired: DesignSystemProvider resolves `config.appearance`,
  ThemeProvider injects vars, useTokens reads density from `appearance.general`.
- `TenantAppearanceGeneral` / `TenantAppearanceAdvanced` are defined in
  `src/foundation/contracts/composition/tenants/themes/index.ts` and compiled by `src/infrastructure/compilers/runtime/appearance/index.ts`.
- The brand-theme compiler operates on `BrandTheme`; the appearance compiler
  operates on `TenantAppearance`. Both feed into the same runtime pipeline.

## What `DesignSystemProvider` Actually Does

`DesignSystemProvider` has two runtime paths:

- Sync path when `propTenantConfig` is provided
- Async path when only `tenantSlug` is provided

See `src/infrastructure/runtime/bootstrap/composition/react/provider/index.tsx`.

After resolving tenant config, it normalizes `brandTheme` into legacy-compatible `branding`
and `tokenOverrides` before rendering providers. See
`src/infrastructure/runtime/bootstrap/composition/react/provider/index.tsx`.

This means downstream consumers do not need to understand `brandTheme` directly to get
effective color and structural values. They can still read the normalized `branding` and
`tokenOverrides`.

## What `useTokens()` Actually Resolves

`useTokens()` already has two real branches:

- BrandTheme path:
  `engine -> vertical.tokenOverrides -> brandTheme.surfaces -> tenant.tokenOverrides`
- Legacy path:
  `engine -> vertical.tokenOverrides -> profile.tokenOverrides -> tenant.tokenOverrides`

See `src/infrastructure/runtime/theming/composition/react/tokens/index.ts`.

For personality, the BrandTheme path is:

`DEFAULT -> vertical.personality -> brandTheme -> tenant.personality`

See `src/infrastructure/runtime/theming/composition/react/tokens/index.ts`.

Branding colors also prefer `brandTheme.palette` over `config.branding`, which keeps
`useTokens()` aligned with `ThemeProvider`. See `src/infrastructure/runtime/theming/composition/react/tokens/index.ts`.

## What Reaches Modern

Modern receives customization through three main channels:

1. CSS variables from tenant/theme artifacts and runtime injection
2. Normalized `branding` / `tokenOverrides`
3. Engine-local bridges in `src/foundation/tokens/css/runtime/engines/modern/theme.css`

That bridge file maps many DS variables into DaisyUI/Tailwind-facing classes such as:

- `.btn`
- `.input`
- `.select`
- `.menu`
- `.tabs`
- `.table`
- `.drawer`
- `.skeleton`
- `.progress`

So the intended path is:

```text
brandTheme / tokenOverrides
  -> normalizedConfig
    -> ThemeProvider CSS vars
      -> modern/theme.css bridge
        -> Modern primitive markup
```

## TenantAppearance Runtime Status (Updated M6-F7)

`TenantAppearance` is now part of the implemented merge chain.

- `DesignSystemProvider` resolves `config.appearance` via `infrastructure/compilers/runtime/appearance/`
- `ThemeProvider` injects appearance CSS vars inline (after branding/tokenOverrides)
- `useTokens()` reads `appearance.general.density` as a JS factor on spacing
- `backgroundMode` feeds theme resolution (wins over default `'base'`, loses to explicit `light`/`dark`/`auto`)
- Provider-level behavioral tests prove end-to-end flow

Live General fields: `palette.*`, `backgroundMode`, `typography.fontFamilyBase/Heading`,
`shape.buttonStyle`, `density`, `surfaces.elevation`, `navigation.sidebarTone`.

Live Advanced fields: `chrome.sidebar`, `chrome.layout`,
`chrome.controls.buttonPrimary.{bg,text}`, `tokenOverrides`.

Fields removed from contract (no consumer): `typography.scale`, `shape.radiusScale`,
`motion.level`, `media.*`, `data.chartColorFamily`, `advanced.shell/table/motion/charts/darkMode`.

## Why This Matters For The Modern Audit

A primitive can fail customization in several different ways:

1. The contract exists but the runtime never resolves it
2. The runtime resolves it, but `modern/theme.css` never bridges it
3. The bridge exists, but the primitive never emits the expected classes
4. The primitive emits the right classes, but still hardcodes geometry/motion/spacing
5. The primitive exposes token maps or props in adjacent type files that the Modern engine never reads

The category docs in this folder classify Modern primitives using exactly those failure modes.
