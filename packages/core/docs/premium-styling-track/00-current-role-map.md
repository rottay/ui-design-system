# Current Role Map

Snapshot of the token/style tree as of Wave H0, classified by role using
the frozen vocabulary from `00-glossary.md`.

## tokens/ts/

| Path | Role | Notes |
|------|------|-------|
| `base/` | Authored source | Foundational TS token values |
| `components/` | Authored source | Per-component token objects (19 modules) |
| `brand-themes/` | Authored source | Canonical premium authored sources (rottay, bithire, evnto) |
| `tenants/` | Mirror | Typed `var(--ds-*)` catalog. Only rottay shipped. NOT authored source. |
| `index.ts` | Public entrypoint | Aggregates all categories. `tokens.brandThemes` + `tokens.tenantMirrors` + compat `tokens.tenants` |

## tokens/css/

| Path | Role | Notes |
|------|------|-------|
| `base/` | Authored source | CSS custom property foundations |
| `components/` | Authored source | Per-component CSS variables |
| `engines/` | Authored source | Engine-specific bridging (classic/modern/rustic) |
| `themes/` | Authored source | Default theme + dark mode (~2000 lines) |
| `animations/` | Authored source | Keyframes, transitions, premium motion |
| `responsive/` | Authored source | Breakpoint-specific overrides |
| `tenants/rottay/index.css` | Artifact | Generated snapshot. Canonical source is `brand-themes/rottay.ts` |
| `tenants/bithire/index.css` | Artifact | Generated snapshot. Canonical source is `brand-themes/bithire.ts` |
| `tenants/evnto/index.css` | Artifact | Generated snapshot. Canonical source is `brand-themes/evnto.ts` |
| `tenants/themanagementmiami/index.css` | Legacy tenant | Not first-party premium. Bundled for compat. |
| `tenants/index.css` | Internal barrel | Imports all tenant CSS (4 tenants) |
| `rottay.css` | Public entrypoint | Package export `./styles/rottay` |
| `bithire.css` | Public entrypoint | Package export `./styles/bithire` |
| `evnto.css` | Public entrypoint | Package export `./styles/evnto` |
| `index.css` | Public entrypoint | Package export `./styles` (full bundle) |

## Known Issues (from Codex audit 02)

1. The word "tenant" is overloaded across TS mirrors, CSS artifacts, and runtime config
2. `tokens/css/index.css` and `index-all.css` tell conflicting stories
3. Root CSS files mix public entrypoints with internal source
4. `themanagementmiami` changes the meaning of the tenant artifact folder
5. Artifact richness is heavily imbalanced: rottay ~969 vars, bithire ~187, evnto ~146
6. BrandTheme coverage is uneven: bithire and evnto missing layout and shell
7. `tokens/README.md` is outdated
8. Legacy naming drift inside tenant artifacts

## What This Map Does NOT Cover

- Runtime merge chain details (see Waves A-F closeout)
- Component taxonomy (see previous taxonomy waves)
- Hook ownership (see Wave G3)
- Implementation plan (see H1-H5)
