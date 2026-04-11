# Current Role Map (post-I6)

Token/style tree classified by role using frozen vocabulary from `00-glossary.md`.
Updated after I1 taxonomy cleanup and I4-I6 vertical overhauls.

## tokens/ts/

| Path | Role | Notes |
|------|------|-------|
| `base/` | Authored source | Foundational TS token values |
| `components/` | Authored source | Per-component token objects (19 modules) |
| `brand-themes/` | Authored source | Canonical premium vertical themes (rottay, bithire, evnto). Full H3 parity. |
| `mirrors/` | Mirror | Typed `var(--ds-*)` catalog. Only rottay shipped. NOT authored source. |
| `index.ts` | Authored source | Internal aggregator. `tokens.brandThemes` + `tokens.tenantMirrors` |

## tokens/css/

| Path | Role | Notes |
|------|------|-------|
| `foundation/base/` | Authored source | CSS custom property foundations |
| `foundation/themes/` | Authored source | Default theme + dark mode |
| `foundation/animations/` | Authored source | Keyframes, transitions, premium motion |
| `foundation/responsive/` | Authored source | Breakpoint-specific overrides |
| `foundation/base.css` | Authored source | Tenant-free foundation import |
| `components/` | Authored source | Per-component CSS variables |
| `engines/` | Authored source | Engine-specific bridging (classic/modern/rustic) |
| `artifacts/rottay/index.css` | Artifact | Synced with brand-themes/rottay.ts. Full parity incl. dark block. |
| `artifacts/bithire/index.css` | Artifact | Synced with brand-themes/bithire.ts. Full parity incl. dark block. |
| `artifacts/evnto/index.css` | Artifact | Synced with brand-themes/evnto.ts. Full parity incl. dark block. |
| `legacy/themanagementmiami/index.css` | Legacy tenant | Not first-party premium. Bundled for compat. |
| `entrypoints/styles.css` | Public entrypoint | Package export `./styles` (full bundle) |
| `entrypoints/platform.css` | Public entrypoint | Package export `./styles/platform` |
| `entrypoints/bithire.css` | Public entrypoint | Package export `./styles/bithire` |
| `entrypoints/evnto.css` | Public entrypoint | Package export `./styles/evnto` |

## Parity Status

All three first-party verticals have full H3 contract parity:
- 0 skipped tests across rottay, bithire, evnto
- 433 green assertions covering palette, typography, surfaces, motion,
  charts, sidebar, layout, shell, controls (including disabled),
  table, dark-mode, and state semantics
- Artifacts synced with authored sources (light + dark blocks)
- dist CSS verified for all three verticals
