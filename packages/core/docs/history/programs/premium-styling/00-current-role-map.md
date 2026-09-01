# Current Role Map (post-I6)

Token/style tree classified by role using frozen vocabulary from `00-glossary.md`.
Updated after I1 taxonomy cleanup and I4-I6 vertical overhauls.

## foundation/tokens/ts/

| Path | Role | Notes |
|------|------|-------|
| `foundation/base/` | Authored source | Foundational TS token values, one `folder/index.ts` module per family |
| `runtime/components/` | Runtime projection | Per-component token objects (19 modules) |
| `presentation/brand-themes/` | Authored source | Canonical premium vertical themes (platform/rottay, bithire, evnto). Full H3 parity. |
| `runtime/mirrors/` | Mirror | Typed `var(--ds-*)` catalog. Only rottay shipped. NOT authored source. |
| `facade/compat/` | Compatibility | Deprecated token projections kept behind the facade |
| `facade/index.ts` | Facade | Internal aggregator. `tokens.brandThemes` + `tokens.tenantMirrors` |

## foundation/tokens/css/

| Path | Role | Notes |
|------|------|-------|
| `foundation/base/` | Authored source | CSS custom property foundations |
| `foundation/themes/` | Authored source | Default theme + dark mode |
| `foundation/animations/` | Authored source | Keyframes, transitions, premium motion |
| `foundation/responsive/` | Authored source | Breakpoint-specific overrides |
| `facade/entrypoints/base.css` | Entrypoint | Tenant-free foundation import |
| `presentation/components/` | Presentation | Per-component CSS variables and shared skins |
| `runtime/engines/` | Runtime | Engine-specific bridging (classic/modern/rustic) |
| `facade/artifacts/rottay/index.css` | Artifact | Generated from `presentation/brand-themes/platform/index.ts` plus its declared extension |
| `facade/artifacts/bithire/index.css` | Artifact | Generated from `presentation/brand-themes/bithire/index.ts` plus its declared extension |
| `facade/artifacts/evnto/index.css` | Artifact | Generated from `presentation/brand-themes/evnto/index.ts` plus its declared extension |
| `facade/entrypoints/styles.css` | Public entrypoint | Package export `./styles` (full bundle) |
| `facade/entrypoints/platform.css` | Public entrypoint | Package export `./styles/platform` |
| `facade/entrypoints/bithire.css` | Public entrypoint | Package export `./styles/bithire` |
| `facade/entrypoints/evnto.css` | Public entrypoint | Package export `./styles/evnto` |

Customer tenants such as `themanagementmiami` are DB-owned and have no checked-in CSS artifact or legacy entrypoint.

## Parity Status

All three first-party verticals have full H3 contract parity:
- 0 skipped tests across rottay, bithire, evnto
- 433 green assertions covering palette, typography, surfaces, motion,
  charts, sidebar, layout, shell, controls (including disabled),
  table, dark-mode, and state semantics
- Artifacts synced with authored sources (light + dark blocks)
- dist CSS verified for all three verticals
