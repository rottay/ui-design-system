# Target Taxonomy And Naming Rules

Wave H1 deliverable. Defines the target physical tree for `tokens/` and
the naming discipline that future implementation waves must follow.

## Principle

One role per folder. Declarative names. Honest public entrypoints.
Subsystem-boundary `folder/index`. No hidden role ambiguity.

## Owner Boundary Rule

Each role-group folder must exist as a named boundary with a single clear
purpose. Per-tenant artifact folders must have an `index.css`. TS owner
folders must have an `index.ts` barrel. Grouping folders (`foundation/`,
`entrypoints/`) do not require an index — they are organizational parents
whose children are the real files.

**Named owner boundaries (must exist as folders):**

- `ts/brand-themes/` — authored source owner, has `index.ts`
- `ts/mirrors/` — mirror owner, has `index.ts`
- `css/artifacts/<slug>/` — per-tenant artifact, has `index.css`
- `css/legacy/<slug>/` — legacy tenant, has `index.css`
- `runtime/tenancy/` — existing, has `index.ts`
- `contracts/` — existing, has `index.ts`

**Grouping folders (organizational, no index required):**

- `css/foundation/` — groups base CSS source subdirectories
- `css/entrypoints/` — groups public CSS files (each file is the entrypoint)
- `css/artifacts/` — groups per-tenant artifact folders

**Not required** for small token leaves:

- `colors.ts`, `spacing.ts`, `button.ts`, `shadows.ts`
- This is a boundary discipline, not a universal wrapper.

## Declarative Naming Rules

### Good Names (describe role)

| Name | Describes |
|------|-----------|
| `brand-themes/` | Canonical authored premium sources |
| `mirrors/` | Typed reference catalogs |
| `artifacts/` | Generated CSS outputs |
| `entrypoints/` | Public package contract files |
| `legacy/` | Non-first-party bundled content |
| `foundation/` | Base/foundational token source |

### Bad Names (describe history or hide role)

| Name | Problem |
|------|---------|
| `tenants/` for mirrors | Suggests authored tenant data |
| `index-all.css` alongside `index.css` | Two "main" stories |
| `rottay.css` at root | Unclear if source, entrypoint, or artifact |
| Names describing vintage, not purpose | Forces reading history to understand role |

## Recommended Target Tree

```
tokens/
  ts/
    base/                    # Authored source: foundational token values
    components/              # Authored source: per-component token objects
    brand-themes/            # Authored source: canonical premium (rottay, bithire, evnto)
      index.ts               #   barrel
      rottay.ts
      bithire.ts
      evnto.ts
    mirrors/                 # Mirror: typed var(--ds-*) catalogs for discovery
      index.ts               #   barrel
      rottay.ts              #   (renamed from tenants/rottay.ts)
    index.ts                 # Internal aggregator

  css/
    foundation/              # Authored source: base + themes + animations + responsive
      base/
      themes/
      animations/
      responsive/
    components/              # Authored source: per-component CSS variables
    engines/                 # Authored source: engine-specific bridging
    artifacts/               # Generated: per-tenant CSS snapshots
      rottay/
        index.css
      bithire/
        index.css
      evnto/
        index.css
    entrypoints/             # Public: package export sources
      styles.css             #   -> ./styles
      platform.css           #   -> ./styles/platform
      bithire.css            #   -> ./styles/bithire
      evnto.css              #   -> ./styles/evnto
      modern.css             #   -> ./styles/modern
    legacy/                  # Legacy: non-first-party bundled content
      themanagementmiami/
        index.css
```

## Current State vs Target State

| Current Path | Current Role | Target Path | Target Role | Change |
|-------------|-------------|-------------|-------------|--------|
| `ts/tenants/` | Mirror | `ts/mirrors/` | Mirror | Rename for clarity |
| `css/base/` | Authored source | `css/foundation/base/` | Authored source | Group under foundation |
| `css/themes/` | Authored source | `css/foundation/themes/` | Authored source | Group under foundation |
| `css/animations/` | Authored source | `css/foundation/animations/` | Authored source | Group under foundation |
| `css/responsive/` | Authored source | `css/foundation/responsive/` | Authored source | Group under foundation |
| `css/tenants/rottay/` | Artifact | `css/artifacts/rottay/` | Artifact | Declarative name |
| `css/tenants/bithire/` | Artifact | `css/artifacts/bithire/` | Artifact | Declarative name |
| `css/tenants/evnto/` | Artifact | `css/artifacts/evnto/` | Artifact | Declarative name |
| `css/tenants/themanagementmiami/` | Legacy tenant | `css/legacy/themanagementmiami/` | Legacy tenant | Isolated |
| `css/tenants/index.css` | Artifact | Removed | -- | Barrel importing tenant CSS. Replaced by entrypoints importing from artifacts/ directly. |
| `css/tenants/rottay.css` (wrapper) | Compatibility shim | Removed | -- | Single-import wrapper. Redundant once entrypoints/ exists. |
| `css/tenants/bithire.css` (wrapper) | Compatibility shim | Removed | -- | Same. |
| `css/tenants/evnto.css` (wrapper) | Compatibility shim | Removed | -- | Same. |
| `css/rottay.css` (root) | Public entrypoint | `css/entrypoints/platform.css` | Public entrypoint | Grouped + renamed |
| `css/bithire.css` (root) | Public entrypoint | `css/entrypoints/bithire.css` | Public entrypoint | Grouped |
| `css/evnto.css` (root) | Public entrypoint | `css/entrypoints/evnto.css` | Public entrypoint | Grouped |
| `css/index.css` (root) | Public entrypoint | `css/entrypoints/styles.css` | Public entrypoint | Grouped |
| `css/index-all.css` | Compatibility shim | Removed | -- | Redundant: `index.css` already serves as full bundle. Delete in I1. |
| `css/base.css` (root) | Authored source | `css/foundation/base.css` | Authored source | Moves into foundation/ grouping. Internal import, not a public entrypoint. |
| `css/platform.css` (root) | Public entrypoint | `css/entrypoints/platform.css` | Public entrypoint | Grouped |

## Compatibility Policy

- Public package exports (`./styles`, `./styles/platform`, etc.) remain stable
- `package.json` exports map can point to new internal paths
- Internal names become more declarative
- Temporary compat aliases marked explicitly
- No compat path masquerades as a canonical owner

## What This Document Does NOT Define

- Implementation order (see wave plan H5 / I-waves)
- Runtime merge chain changes (already defined in Waves A-F)
- Component taxonomy (already defined in previous waves)
- Exact BrandTheme schema changes (see H2-H3)
